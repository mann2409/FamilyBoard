import React, { useMemo } from "react";
import { View, Text, Pressable, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { format, isPast, isFuture } from "date-fns";
import { useRequestsStore } from "../state/requestsStore";
import { useAuthStore } from "../state/authStore";
import { FamilyRequest, RequestType } from "../types/family";
import FloatingActionButton from "../components/FloatingActionButton";

type RootStackParamList = {
  RequestDetail: { requestId: string };
  NewRequest: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const REQUEST_TYPE_ICONS: Record<RequestType, keyof typeof Ionicons.glyphMap> = {
  babysitting: "person",
  dogsitting: "paw",
  pickup: "car",
  other: "help-circle",
};

const STATUS_COLORS = {
  open: "#3B82F6",
  claimed: "#F59E0B",
  completed: "#10B981",
};

const STATUS_LABELS = {
  open: "Open",
  claimed: "Claimed",
  completed: "Completed",
};

export default function ActivityScreen() {
  const navigation = useNavigation<NavigationProp>();
  const requests = useRequestsStore((s) => s.requests);
  const currentUser = useAuthStore((s) => s.currentUser);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const { upcomingRequests, completedRequests, myRequests } = useMemo(() => {
    const upcoming = requests
      .filter((r) => r.status !== "completed" && isFuture(new Date(r.dateTime)))
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    
    const completed = requests
      .filter((r) => r.status === "completed")
      .sort((a, b) => {
        const aTime = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const bTime = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return bTime - aTime;
      });
    
    const mine = requests
      .filter((r) => 
        r.postedBy.id === currentUser?.id || 
        r.claimedBy?.id === currentUser?.id
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      upcomingRequests: upcoming,
      completedRequests: completed,
      myRequests: mine,
    };
  }, [requests, currentUser]);

  const renderRequestCard = (request: FamilyRequest) => {
    const requestDateTime = new Date(request.dateTime);
    const isOverdue = isPast(requestDateTime) && request.status !== "completed";

    return (
      <Pressable
        key={request.id}
        onPress={() => navigation.navigate("RequestDetail", { requestId: request.id })}
        className="bg-white rounded-xl p-4 mb-3 border active:bg-gray-50"
        style={{ borderColor: "#E5E7EB" }}
      >
        <View className="flex-row items-start">
          <View
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: STATUS_COLORS[request.status] }}
          >
            <Ionicons
              name={REQUEST_TYPE_ICONS[request.type]}
              size={24}
              color="white"
            />
          </View>

          <View className="flex-1 ml-3">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-base font-semibold text-gray-800 flex-1">
                {request.title}
              </Text>
              <View
                className="px-2 py-1 rounded-full ml-2"
                style={{ backgroundColor: STATUS_COLORS[request.status] }}
              >
                <Text className="text-xs text-white font-medium">
                  {STATUS_LABELS[request.status]}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mt-1">
              <Ionicons name="calendar" size={14} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-1">
                {format(requestDateTime, "MMM d, yyyy 'at' h:mm a")}
              </Text>
            </View>

            {isOverdue && (
              <View className="flex-row items-center mt-1">
                <Ionicons name="alert-circle" size={14} color="#EF4444" />
                <Text className="text-sm text-red-500 ml-1">
                  Overdue
                </Text>
              </View>
            )}

            <View className="flex-row items-center mt-2">
              <Ionicons name="person" size={14} color="#6B7280" />
              <Text className="text-xs text-gray-500 ml-1">
                Posted by {request.postedBy.name}
                {request.postedBy.id === currentUser?.id && " (You)"}
              </Text>
            </View>

            {request.claimedBy && (
              <View className="flex-row items-center mt-1">
                <Ionicons name="checkmark-circle" size={14} color="#6B7280" />
                <Text className="text-xs text-gray-500 ml-1">
                  Claimed by {request.claimedBy.name}
                  {request.claimedBy.id === currentUser?.id && " (You)"}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-4 py-4">
          <Text className="text-2xl font-bold text-gray-800 mb-6">
            Activity Feed
          </Text>

          {/* Upcoming Requests */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-800">
                Upcoming Requests
              </Text>
              <View className="bg-blue-100 px-2 py-1 rounded-full">
                <Text className="text-sm font-semibold text-blue-600">
                  {upcomingRequests.length}
                </Text>
              </View>
            </View>
            
            {upcomingRequests.length === 0 ? (
              <View className="bg-white rounded-xl p-6 items-center border" style={{ borderColor: "#E5E7EB" }}>
                <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
                <Text className="text-gray-500 mt-2 text-center">
                  No upcoming requests
                </Text>
              </View>
            ) : (
              upcomingRequests.map(renderRequestCard)
            )}
          </View>

          {/* My Requests */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-800">
                My Requests
              </Text>
              <View className="bg-purple-100 px-2 py-1 rounded-full">
                <Text className="text-sm font-semibold text-purple-600">
                  {myRequests.length}
                </Text>
              </View>
            </View>
            
            {myRequests.length === 0 ? (
              <View className="bg-white rounded-xl p-6 items-center border" style={{ borderColor: "#E5E7EB" }}>
                <Ionicons name="person-outline" size={48} color="#9CA3AF" />
                <Text className="text-gray-500 mt-2 text-center">
                  No requests posted or claimed by you
                </Text>
              </View>
            ) : (
              myRequests.map(renderRequestCard)
            )}
          </View>

          {/* Completed Requests */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-800">
                Completed Requests
              </Text>
              <View className="bg-green-100 px-2 py-1 rounded-full">
                <Text className="text-sm font-semibold text-green-600">
                  {completedRequests.length}
                </Text>
              </View>
            </View>
            
            {completedRequests.length === 0 ? (
              <View className="bg-white rounded-xl p-6 items-center border" style={{ borderColor: "#E5E7EB" }}>
                <Ionicons name="checkmark-circle-outline" size={48} color="#9CA3AF" />
                <Text className="text-gray-500 mt-2 text-center">
                  No completed requests yet
                </Text>
              </View>
            ) : (
              completedRequests.slice(0, 10).map(renderRequestCard)
            )}
          </View>
        </View>
      </ScrollView>
      
      <FloatingActionButton />
    </SafeAreaView>
  );
}
