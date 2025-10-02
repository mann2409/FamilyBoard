import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  RefreshControl,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useRequestsStore } from "../state/requestsStore";
import { useAuthStore } from "../state/authStore";
import { usePoolStore } from "../state/poolStore";
import { FamilyRequest, RequestType, RequestStatus } from "../types/family";
import RequestCard from "../components/RequestCard";
import FilterSortBar, { FilterOptions } from "../components/FilterSortBar";
import FloatingActionButton from "../components/FloatingActionButton";
import PoolSwitcher from "../components/PoolSwitcher";

type RootStackParamList = {
  RequestDetail: { requestId: string };
  NewRequest: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type TabType = "all" | "myJobs" | "posted" | "completed";

export default function RequestsFeedScreen() {
  const navigation = useNavigation<NavigationProp>();
  const allRequests = useRequestsStore((s) => s.requests);
  const getRequestsByPool = useRequestsStore((s) => s.getRequestsByPool);
  const claimRequest = useRequestsStore((s) => s.claimRequest);
  const currentUser = useAuthStore((s) => s.currentUser);
  const currentPoolId = usePoolStore((s) => s.currentPoolId);
  const getCurrentPool = usePoolStore((s) => s.getCurrentPool);

  // Filter requests by current pool
  const requests = currentPoolId ? getRequestsByPool(currentPoolId) : allRequests;
  const currentPool = getCurrentPool();

  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    type: "all",
    status: "all",
    sortBy: "date",
    sortOrder: "asc",
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const filteredAndSortedRequests = useMemo(() => {
    let filtered = requests;

    // Tab filtering
    switch (activeTab) {
      case "all":
        filtered = requests.filter((r) => r.status === "open");
        break;
      case "myJobs":
        filtered = requests.filter(
          (r) => r.claimedBy?.id === currentUser?.id && r.status !== "completed"
        );
        break;
      case "posted":
        filtered = requests.filter((r) => r.postedBy.id === currentUser?.id);
        break;
      case "completed":
        filtered = requests.filter((r) => r.status === "completed");
        break;
    }

    // Search filtering
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.description?.toLowerCase().includes(query) ||
          r.postedBy.name.toLowerCase().includes(query)
      );
    }

    // Type filtering
    if (filterOptions.type && filterOptions.type !== "all") {
      filtered = filtered.filter((r) => r.type === filterOptions.type);
    }

    // Status filtering
    if (filterOptions.status && filterOptions.status !== "all") {
      filtered = filtered.filter((r) => r.status === filterOptions.status);
    }

    // Sorting
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (filterOptions.sortBy) {
        case "date":
          comparison =
            new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "type":
          comparison = a.type.localeCompare(b.type);
          break;
      }

      return filterOptions.sortOrder === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [requests, activeTab, currentUser, searchQuery, filterOptions]);

  const handleClaimRequest = (requestId: string) => {
    if (currentUser) {
      claimRequest(requestId, currentUser.id, currentUser.name);
    }
  };

  const tabs = [
    { id: "all" as TabType, label: "Available", icon: "list" as const, count: requests.filter(r => r.status === "open").length },
    { id: "myJobs" as TabType, label: "My Jobs", icon: "briefcase" as const, count: requests.filter(r => r.claimedBy?.id === currentUser?.id && r.status !== "completed").length },
    { id: "posted" as TabType, label: "Posted", icon: "create" as const, count: requests.filter(r => r.postedBy.id === currentUser?.id).length },
    { id: "completed" as TabType, label: "History", icon: "checkmark-done" as const, count: requests.filter(r => r.status === "completed").length },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="px-4 py-3"
      >
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-2xl font-bold text-white">
            Requests Feed
          </Text>
          {currentPool && <PoolSwitcher />}
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-white/20 rounded-xl px-4 py-3 mb-3">
          <Ionicons name="search" size={20} color="white" />
          <TextInput
            className="flex-1 ml-2 text-base text-white"
            placeholder="Search requests..."
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="white" />
            </Pressable>
          )}
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-4 px-4"
        >
          {tabs.map((tab) => (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              className={`mr-2 px-4 py-2.5 rounded-xl flex-row items-center ${
                activeTab === tab.id
                  ? "bg-white"
                  : "bg-white/20"
              }`}
            >
              <Ionicons
                name={tab.icon}
                size={18}
                color={activeTab === tab.id ? "#667eea" : "white"}
              />
              <Text
                className={`ml-2 font-semibold ${
                  activeTab === tab.id ? "text-gray-800" : "text-white"
                }`}
              >
                {tab.label}
              </Text>
              {tab.count > 0 && (
                <View
                  className={`ml-2 px-2 py-0.5 rounded-full ${
                    activeTab === tab.id ? "bg-purple-600" : "bg-white/20"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      activeTab === tab.id ? "text-white" : "text-white"
                    }`}
                  >
                    {tab.count}
                  </Text>
                </View>
              )}
            </Pressable>
          ))}
        </ScrollView>
      </LinearGradient>

      {/* Filter Bar */}
      <FilterSortBar
        currentFilter={filterOptions}
        onFilterChange={setFilterOptions}
      />

      {/* Requests List */}
      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="py-4">
          {filteredAndSortedRequests.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center mt-8">
              <Ionicons
                name={
                  activeTab === "all"
                    ? "calendar-outline"
                    : activeTab === "myJobs"
                    ? "briefcase-outline"
                    : activeTab === "posted"
                    ? "create-outline"
                    : "checkmark-done-circle-outline"
                }
                size={64}
                color="#9CA3AF"
              />
              <Text className="text-xl font-semibold text-gray-800 mt-4 text-center">
                {activeTab === "all" && "No Available Requests"}
                {activeTab === "myJobs" && "No Jobs Claimed Yet"}
                {activeTab === "posted" && "No Requests Posted"}
                {activeTab === "completed" && "No Completed Requests"}
              </Text>
              <Text className="text-base text-gray-500 text-center mt-2">
                {activeTab === "all" &&
                  "Check back later for new requests from family members"}
                {activeTab === "myJobs" &&
                  "Claim a request from the Available tab to see it here"}
                {activeTab === "posted" &&
                  "Tap the + button to create your first request"}
                {activeTab === "completed" &&
                  "Completed requests will appear here"}
              </Text>
            </View>
          ) : (
            <>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-sm font-semibold text-gray-500">
                  {filteredAndSortedRequests.length}{" "}
                  {filteredAndSortedRequests.length === 1 ? "Request" : "Requests"}
                </Text>
                {searchQuery && (
                  <Text className="text-sm text-blue-600">
                    Filtered by search
                  </Text>
                )}
              </View>

              {filteredAndSortedRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onPress={() =>
                    navigation.navigate("RequestDetail", { requestId: request.id })
                  }
                  onClaim={() => handleClaimRequest(request.id)}
                  showClaimButton={activeTab === "all"}
                  currentUserId={currentUser?.id}
                />
              ))}
            </>
          )}
        </View>
      </ScrollView>

      <FloatingActionButton />
    </SafeAreaView>
  );
}

