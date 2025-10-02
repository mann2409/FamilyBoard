import React from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../state/authStore";
import { useRequestsStore } from "../state/requestsStore";
import { usePoolStore } from "../state/poolStore";
import PoolSwitcher from "../components/PoolSwitcher";
import GamificationStats from "../components/GamificationStats";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const currentUser = useAuthStore((s) => s.currentUser);
  const familyMembers = useAuthStore((s) => s.familyMembers);
  const logout = useAuthStore((s) => s.logout);
  const allRequests = useRequestsStore((s) => s.requests);
  const getRequestsByPool = useRequestsStore((s) => s.getRequestsByPool);
  const notifications = useRequestsStore((s) => s.notifications);
  const currentPoolId = usePoolStore((s) => s.currentPoolId);
  const getCurrentPool = usePoolStore((s) => s.getCurrentPool);
  const getPoolMembers = usePoolStore((s) => s.getPoolMembers);
  const pools = usePoolStore((s) => s.pools);

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: () => {
            logout();
          },
        },
      ]
    );
  };

  // Filter requests by current pool
  const requests = currentPoolId ? getRequestsByPool(currentPoolId) : allRequests;
  const currentPool = getCurrentPool();
  const poolMembers = currentPool ? getPoolMembers(currentPool.id) : [];

  const myPostedRequests = requests.filter((r) => r.postedBy.id === currentUser?.id);
  const myClaimedRequests = requests.filter((r) => r.claimedBy?.id === currentUser?.id);
  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScrollView className="flex-1">
        <View className="px-4 py-6">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-2xl font-bold text-gray-800">
              Profile
            </Text>
            {currentPool && <PoolSwitcher />}
          </View>

          {/* User Info Card */}
          <View className="bg-white rounded-xl p-6 mb-6">
            <View className="items-center mb-4">
              <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-3">
                <Text className="text-3xl font-bold text-white">
                  {currentUser?.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text className="text-xl font-bold text-gray-800">
                {currentUser?.name}
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                {currentUser?.email}
              </Text>
            </View>

            {/* Stats */}
            <View className="flex-row justify-around pt-4 border-t" style={{ borderColor: "#E5E7EB" }}>
              <View className="items-center">
                <Text className="text-2xl font-bold text-blue-600">
                  {myPostedRequests.length}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">Posted</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-orange-600">
                  {myClaimedRequests.length}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">Claimed</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-purple-600">
                  {unreadNotifications.length}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">Unread</Text>
              </View>
            </View>
          </View>

          {/* Gamification Stats */}
          <GamificationStats />

          {/* Leaderboard Button */}
          <Pressable
            onPress={() => (navigation as any).navigate("Leaderboard")}
            className="rounded-xl p-4 mb-6 flex-row items-center justify-between active:opacity-80"
            style={{ backgroundColor: "#F59E0B" }}
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
                <Ionicons name="trophy" size={24} color="white" />
              </View>
              <Text className="text-lg font-bold text-white ml-3">
                View Leaderboard
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="white" />
          </Pressable>

          {/* Pool Info */}
          {currentPool && (
            <View className="bg-white rounded-xl p-4 mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-semibold text-gray-800">
                  {currentPool.name}
                </Text>
                <Pressable
                  onPress={() => (navigation as any).navigate("PoolManagement")}
                  className="px-3 py-1.5 bg-blue-100 rounded-lg active:bg-blue-200"
                >
                  <Text className="text-sm font-semibold text-blue-600">Manage</Text>
                </Pressable>
              </View>

              {currentPool.description && (
                <Text className="text-sm text-gray-600 mb-3">
                  {currentPool.description}
                </Text>
              )}

              <View className="flex-row items-center">
                <Ionicons name="people" size={16} color="#6B7280" />
                <Text className="text-sm text-gray-600 ml-2">
                  {poolMembers.length} members in this pool
                </Text>
              </View>
            </View>
          )}

          {/* My Pools */}
          <View className="bg-white rounded-xl p-4 mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-800">
                My Pools
              </Text>
              <View className="bg-purple-100 px-2 py-1 rounded-full">
                <Text className="text-sm font-semibold text-purple-600">
                  {pools.length}
                </Text>
              </View>
            </View>

            {pools.slice(0, 3).map((pool, index) => (
              <View
                key={pool.id}
                className={`flex-row items-center py-2 ${
                  index < Math.min(pools.length, 3) - 1 ? "border-b" : ""
                }`}
                style={{ borderColor: "#E5E7EB" }}
              >
                <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="people" size={20} color="#8B5CF6" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-800">
                    {pool.name}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {pool.memberIds.length} members
                  </Text>
                </View>
                {currentPoolId === pool.id && (
                  <View className="bg-blue-500 w-6 h-6 rounded-full items-center justify-center">
                    <Ionicons name="checkmark" size={14} color="white" />
                  </View>
                )}
              </View>
            ))}

            {pools.length > 3 && (
              <Text className="text-sm text-gray-500 text-center mt-2">
                +{pools.length - 3} more pools
              </Text>
            )}

            <Pressable
              onPress={() => (navigation as any).navigate("PoolSelection")}
              className="mt-3 py-2 border-t active:opacity-70"
              style={{ borderColor: "#E5E7EB" }}
            >
              <Text className="text-sm text-blue-600 font-semibold text-center">
                View All Pools
              </Text>
            </Pressable>
          </View>

          {/* Actions */}
          <View className="bg-white rounded-xl overflow-hidden mb-6">
            <Pressable
              className="flex-row items-center px-4 py-4 border-b active:bg-gray-50"
              style={{ borderColor: "#E5E7EB" }}
            >
              <Ionicons name="notifications-outline" size={24} color="#6B7280" />
              <Text className="flex-1 text-base text-gray-800 ml-3">
                Notifications
              </Text>
              <View className="bg-red-500 w-6 h-6 rounded-full items-center justify-center">
                <Text className="text-xs font-bold text-white">
                  {unreadNotifications.length}
                </Text>
              </View>
            </Pressable>

            <Pressable
              className="flex-row items-center px-4 py-4 border-b active:bg-gray-50"
              style={{ borderColor: "#E5E7EB" }}
            >
              <Ionicons name="settings-outline" size={24} color="#6B7280" />
              <Text className="flex-1 text-base text-gray-800 ml-3">
                Settings
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>

            <Pressable
              className="flex-row items-center px-4 py-4 active:bg-gray-50"
            >
              <Ionicons name="help-circle-outline" size={24} color="#6B7280" />
              <Text className="flex-1 text-base text-gray-800 ml-3">
                Help & Support
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Logout Button */}
          <Pressable
            onPress={handleLogout}
            className="flex-row items-center justify-center bg-red-500 py-4 rounded-xl active:bg-red-600 mb-6"
          >
            <Ionicons name="log-out-outline" size={20} color="white" />
            <Text className="text-white text-base font-semibold ml-2">
              Log Out
            </Text>
          </Pressable>
          
          {/* App Info */}
          <View className="items-center pb-4">
            <Text className="text-xs text-gray-400">
              FamilyBoard v1.0.0
            </Text>
            <Text className="text-xs text-gray-400 mt-1">
              Your data is stored locally on this device
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
