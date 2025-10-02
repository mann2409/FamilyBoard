import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Share,
  Alert,
} from "react-native";
import * as Clipboard from "@react-native-clipboard/clipboard";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { usePoolStore } from "../state/poolStore";
import { useAuthStore } from "../state/authStore";
import { format } from "date-fns";

export default function PoolManagementScreen() {
  const navigation = useNavigation();
  const getCurrentPool = usePoolStore((s) => s.getCurrentPool);
  const getPoolMembers = usePoolStore((s) => s.getPoolMembers);
  const isUserPoolAdmin = usePoolStore((s) => s.isUserPoolAdmin);
  const removeMemberFromPool = usePoolStore((s) => s.removeMemberFromPool);
  const regenerateInviteCode = usePoolStore((s) => s.regenerateInviteCode);
  const leavePool = usePoolStore((s) => s.leavePool);
  const currentUser = useAuthStore((s) => s.currentUser);

  const currentPool = getCurrentPool();
  const members = currentPool ? getPoolMembers(currentPool.id) : [];
  const isAdmin = currentPool && currentUser ? isUserPoolAdmin(currentPool.id, currentUser.id) : false;

  if (!currentPool || !currentUser) {
    return null;
  }

  const handleShareInvite = async () => {
    try {
      const message = `Join my FamilyBoard pool "${currentPool.name}"!\n\nInvite Code: ${currentPool.inviteCode}\n\nDownload FamilyBoard and use this code to join.`;
      await Share.share({ message });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleCopyInviteCode = () => {
    Clipboard.setString(currentPool.inviteCode);
    Alert.alert("Copied!", "Invite code copied to clipboard");
  };

  const handleRegenerateCode = () => {
    Alert.alert(
      "Regenerate Invite Code",
      "This will invalidate the current invite code. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Regenerate",
          style: "destructive",
          onPress: () => {
            const newCode = regenerateInviteCode(currentPool.id);
            Alert.alert("Success", `New invite code: ${newCode}`);
          },
        },
      ]
    );
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    Alert.alert(
      "Remove Member",
      `Are you sure you want to remove ${memberName} from this pool?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            removeMemberFromPool(currentPool.id, memberId);
            Alert.alert("Success", `${memberName} has been removed from the pool`);
          },
        },
      ]
    );
  };

  const handleLeavePool = () => {
    if (currentPool.adminIds.length === 1 && currentPool.adminIds[0] === currentUser.id) {
      Alert.alert(
        "Cannot Leave Pool",
        "You are the only admin. Please assign another admin before leaving, or delete the pool."
      );
      return;
    }

    Alert.alert(
      "Leave Pool",
      `Are you sure you want to leave "${currentPool.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => {
            leavePool(currentPool.id, currentUser.id);
            navigation.goBack();
            Alert.alert("Success", "You have left the pool");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScrollView className="flex-1">
        <View className="px-4 py-6">
          {/* Pool Header */}
          <View className="bg-white rounded-2xl p-6 mb-6">
            <View className="items-center mb-4">
              <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-3">
                <Ionicons name="people" size={40} color="white" />
              </View>
              <Text className="text-2xl font-bold text-gray-800 text-center">
                {currentPool.name}
              </Text>
              {currentPool.description && (
                <Text className="text-base text-gray-600 text-center mt-2">
                  {currentPool.description}
                </Text>
              )}
              <Text className="text-sm text-gray-500 mt-2">
                Created {format(new Date(currentPool.createdAt), "MMM d, yyyy")}
              </Text>
            </View>

            {/* Invite Code Section */}
            {isAdmin && (
              <View className="pt-4 border-t" style={{ borderColor: "#E5E7EB" }}>
                <Text className="text-sm font-semibold text-gray-700 mb-3">
                  Invite Code
                </Text>
                <View className="bg-blue-50 rounded-xl p-4 mb-3">
                  <Text className="text-center text-2xl font-mono font-bold text-blue-600 tracking-wider">
                    {currentPool.inviteCode}
                  </Text>
                </View>

                <View className="flex-row">
                  <Pressable
                    onPress={handleCopyInviteCode}
                    className="flex-1 bg-blue-500 py-3 rounded-lg items-center mr-2 active:bg-blue-600"
                  >
                    <View className="flex-row items-center">
                      <Ionicons name="copy" size={16} color="white" />
                      <Text className="text-white font-semibold ml-2">Copy</Text>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={handleShareInvite}
                    className="flex-1 bg-green-500 py-3 rounded-lg items-center active:bg-green-600"
                  >
                    <View className="flex-row items-center">
                      <Ionicons name="share-social" size={16} color="white" />
                      <Text className="text-white font-semibold ml-2">Share</Text>
                    </View>
                  </Pressable>
                </View>

                {isAdmin && (
                  <Pressable
                    onPress={handleRegenerateCode}
                    className="mt-2 py-2 items-center"
                  >
                    <Text className="text-sm text-blue-600 font-semibold">
                      Regenerate Code
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>

          {/* Members List */}
          <View className="bg-white rounded-2xl p-4 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-gray-800">Members</Text>
              <View className="bg-blue-100 px-3 py-1 rounded-full">
                <Text className="text-sm font-semibold text-blue-600">
                  {members.length}
                </Text>
              </View>
            </View>

            {members.map((member, index) => (
              <View
                key={member.id}
                className={`flex-row items-center py-3 ${
                  index < members.length - 1 ? "border-b" : ""
                }`}
                style={{ borderColor: "#E5E7EB" }}
              >
                <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Text className="text-lg font-bold text-blue-600">
                    {member.name.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="text-base font-semibold text-gray-800">
                      {member.name}
                      {member.id === currentUser.id && " (You)"}
                    </Text>
                    {member.isAdmin && (
                      <View className="bg-orange-100 px-2 py-0.5 rounded-full ml-2">
                        <Text className="text-xs font-semibold text-orange-600">
                          ADMIN
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-sm text-gray-500">{member.email}</Text>
                  <Text className="text-xs text-gray-400 mt-1">
                    Joined {format(new Date(member.joinedAt), "MMM d, yyyy")}
                  </Text>
                </View>

                {isAdmin && member.id !== currentUser.id && (
                  <Pressable
                    onPress={() => handleRemoveMember(member.id, member.name)}
                    className="p-2 active:opacity-50"
                  >
                    <Ionicons name="remove-circle" size={24} color="#EF4444" />
                  </Pressable>
                )}
              </View>
            ))}
          </View>

          {/* Actions */}
          <View className="bg-white rounded-2xl overflow-hidden mb-6">
            <Pressable
              onPress={() => (navigation as any).navigate("PoolSelection")}
              className="flex-row items-center px-4 py-4 border-b active:bg-gray-50"
              style={{ borderColor: "#E5E7EB" }}
            >
              <Ionicons name="swap-horizontal" size={24} color="#6B7280" />
              <Text className="flex-1 text-base text-gray-800 ml-3">
                Switch Pool
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>

            {!isAdmin && (
              <Pressable
                onPress={handleLeavePool}
                className="flex-row items-center px-4 py-4 active:bg-gray-50"
              >
                <Ionicons name="exit" size={24} color="#EF4444" />
                <Text className="flex-1 text-base text-red-500 ml-3 font-semibold">
                  Leave Pool
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

