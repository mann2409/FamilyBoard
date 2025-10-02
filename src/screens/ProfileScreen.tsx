import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../state/authStore";
import { useRequestsStore } from "../state/requestsStore";

export default function ProfileScreen() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const familyMembers = useAuthStore((s) => s.familyMembers);
  const logout = useAuthStore((s) => s.logout);
  const requests = useRequestsStore((s) => s.requests);
  const notifications = useRequestsStore((s) => s.notifications);

  const myPostedRequests = requests.filter((r) => r.postedBy.id === currentUser?.id);
  const myClaimedRequests = requests.filter((r) => r.claimedBy?.id === currentUser?.id);
  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScrollView className="flex-1">
        <View className="px-4 py-6">
          <Text className="text-2xl font-bold text-gray-800 mb-6">
            Profile
          </Text>

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

          {/* Family Members */}
          <View className="bg-white rounded-xl p-4 mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-800">
                Family Members
              </Text>
              <View className="bg-blue-100 px-2 py-1 rounded-full">
                <Text className="text-sm font-semibold text-blue-600">
                  {familyMembers.length}
                </Text>
              </View>
            </View>

            {familyMembers.map((member, index) => (
              <View
                key={member.id}
                className={`flex-row items-center py-3 ${
                  index < familyMembers.length - 1 ? "border-b" : ""
                }`}
                style={{ borderColor: "#E5E7EB" }}
              >
                <View className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center mr-3">
                  <Text className="text-lg font-semibold text-gray-600">
                    {member.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-800">
                    {member.name}
                    {member.id === currentUser?.id && " (You)"}
                  </Text>
                  <Text className="text-sm text-gray-500">{member.email}</Text>
                </View>
              </View>
            ))}
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
            onPress={logout}
            className="bg-red-500 py-4 rounded-xl items-center active:bg-red-600 mb-6"
          >
            <Text className="text-white text-base font-semibold">
              Log Out
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
