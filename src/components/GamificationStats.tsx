import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGamificationStore } from "../state/gamificationStore";
import { useAuthStore } from "../state/authStore";
import { usePoolStore } from "../state/poolStore";
import { calculateLevel } from "../types/gamification";

export default function GamificationStats() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const currentPoolId = usePoolStore((s) => s.currentPoolId);
  
  if (!currentUser || !currentPoolId) return null;
  
  const stats = useGamificationStore((s) => s.getUserStats(currentUser.id, currentPoolId));
  const levelInfo = calculateLevel(stats.points);
  const progressToNext = levelInfo.level < 10 
    ? ((stats.points - levelInfo.currentLevelPoints) / (levelInfo.nextLevelPoints - levelInfo.currentLevelPoints)) * 100 
    : 100;

  return (
    <View className="bg-white rounded-2xl p-4 mb-4">
      {/* Level and Points */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View 
            className="w-16 h-16 rounded-full items-center justify-center"
            style={{ backgroundColor: levelInfo.color }}
          >
            <Text className="text-white text-xl font-bold">{levelInfo.level}</Text>
          </View>
          <View className="ml-3">
            <Text className="text-lg font-bold text-gray-800">{levelInfo.title}</Text>
            <View className="flex-row items-center">
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text className="text-sm font-semibold text-gray-600 ml-1">{stats.points} points</Text>
            </View>
          </View>
        </View>
        
        {/* Streak */}
        {stats.currentStreak > 0 && (
          <View className="items-center">
            <View className="flex-row items-center">
              <Ionicons name="flame" size={24} color="#EF4444" />
              <Text className="text-2xl font-bold text-gray-800 ml-1">{stats.currentStreak}</Text>
            </View>
            <Text className="text-xs text-gray-500">day streak</Text>
          </View>
        )}
      </View>

      {/* Progress Bar */}
      {levelInfo.level < 10 && (
        <View>
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-xs text-gray-500">Progress to Level {levelInfo.level + 1}</Text>
            <Text className="text-xs font-semibold text-gray-600">
              {stats.points} / {levelInfo.nextLevelPoints}
            </Text>
          </View>
          <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <View 
              className="h-full rounded-full"
              style={{ width: `${progressToNext}%`, backgroundColor: levelInfo.color }}
            />
          </View>
        </View>
      )}

      {/* Stats Grid */}
      <View className="flex-row justify-between mt-4 pt-4 border-t" style={{ borderColor: "#E5E7EB" }}>
        <View className="items-center">
          <Text className="text-2xl font-bold text-gray-800">{stats.tasksCompleted}</Text>
          <Text className="text-xs text-gray-500">Completed</Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-bold text-gray-800">{stats.tasksClaimed}</Text>
          <Text className="text-xs text-gray-500">Claimed</Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-bold text-gray-800">{stats.tasksPosted}</Text>
          <Text className="text-xs text-gray-500">Posted</Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-bold text-gray-800">{stats.achievements.length}</Text>
          <Text className="text-xs text-gray-500">Badges</Text>
        </View>
      </View>
    </View>
  );
}

