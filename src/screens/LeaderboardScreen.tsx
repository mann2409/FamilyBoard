import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useGamificationStore } from "../state/gamificationStore";
import { usePoolStore } from "../state/poolStore";
import { useAuthStore } from "../state/authStore";
import { calculateLevel } from "../types/gamification";

export default function LeaderboardScreen() {
  const currentPoolId = usePoolStore((s) => s.currentPoolId);
  const currentUser = useAuthStore((s) => s.currentUser);
  const familyMembers = useAuthStore((s) => s.familyMembers);
  const getLeaderboard = useGamificationStore((s) => s.getLeaderboard);
  
  if (!currentPoolId) return null;
  
  const leaderboard = getLeaderboard(currentPoolId);
  
  // Map user IDs to names
  const leaderboardWithNames = leaderboard.map(entry => ({
    ...entry,
    userName: familyMembers.find(m => m.id === entry.userId)?.name || "Unknown",
    isCurrentUser: entry.userId === currentUser?.id,
  }));

  const getMedalColor = (rank: number) => {
    if (rank === 1) return "#FFD700"; // Gold
    if (rank === 2) return "#C0C0C0"; // Silver
    if (rank === 3) return "#CD7F32"; // Bronze
    return "#9CA3AF"; // Gray
  };

  const getMedalIcon = (rank: number) => {
    if (rank <= 3) return "medal";
    return "person-circle";
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScrollView className="flex-1">
        <View className="px-4 py-4">
          <View className="flex-row items-center mb-6">
            <Ionicons name="trophy" size={32} color="#F59E0B" />
            <Text className="text-2xl font-bold text-gray-800 ml-3">
              Leaderboard
            </Text>
          </View>

          {leaderboardWithNames.length === 0 ? (
            <View className="bg-white rounded-xl p-8 items-center">
              <Ionicons name="trophy-outline" size={64} color="#9CA3AF" />
              <Text className="text-gray-500 mt-4 text-center">
                No activity yet. Complete tasks to appear on the leaderboard!
              </Text>
            </View>
          ) : (
            leaderboardWithNames.map((entry) => {
              const levelInfo = calculateLevel(entry.points);
              
              return (
                <View
                  key={entry.userId}
                  className={`bg-white rounded-xl p-4 mb-3 ${
                    entry.isCurrentUser ? "border-2 border-blue-500" : ""
                  }`}
                >
                  <View className="flex-row items-center">
                    {/* Rank */}
                    <View className="w-12 items-center">
                      {entry.rank <= 3 ? (
                        <Ionicons
                          name={getMedalIcon(entry.rank)}
                          size={32}
                          color={getMedalColor(entry.rank)}
                        />
                      ) : (
                        <Text className="text-xl font-bold text-gray-400">
                          {entry.rank}
                        </Text>
                      )}
                    </View>

                    {/* User Info */}
                    <View className="flex-1 ml-3">
                      <View className="flex-row items-center">
                        <Text className="text-lg font-bold text-gray-800">
                          {entry.userName}
                        </Text>
                        {entry.isCurrentUser && (
                          <View className="ml-2 bg-blue-100 px-2 py-0.5 rounded-full">
                            <Text className="text-xs font-semibold text-blue-600">
                              You
                            </Text>
                          </View>
                        )}
                      </View>
                      
                      <View className="flex-row items-center mt-1">
                        <View 
                          className="px-2 py-0.5 rounded"
                          style={{ backgroundColor: levelInfo.color + "20" }}
                        >
                          <Text 
                            className="text-xs font-semibold"
                            style={{ color: levelInfo.color }}
                          >
                            Level {entry.level} • {levelInfo.title}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Points */}
                    <View className="items-end">
                      <View className="flex-row items-center">
                        <Ionicons name="star" size={18} color="#F59E0B" />
                        <Text className="text-lg font-bold text-gray-800 ml-1">
                          {entry.points}
                        </Text>
                      </View>
                      <Text className="text-xs text-gray-500">
                        {entry.tasksCompleted} tasks
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

