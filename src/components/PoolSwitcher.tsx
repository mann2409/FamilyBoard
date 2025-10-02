import React, { useState } from "react";
import { View, Text, Pressable, Modal, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePoolStore } from "../state/poolStore";
import { useNavigation } from "@react-navigation/native";

export default function PoolSwitcher() {
  const navigation = useNavigation();
  const pools = usePoolStore((s) => s.pools);
  const currentPoolId = usePoolStore((s) => s.currentPoolId);
  const setCurrentPool = usePoolStore((s) => s.setCurrentPool);
  const getCurrentPool = usePoolStore((s) => s.getCurrentPool);
  
  const [showPoolModal, setShowPoolModal] = useState(false);

  const currentPool = getCurrentPool();

  if (!currentPool) {
    return null;
  }

  return (
    <>
      <Pressable
        onPress={() => setShowPoolModal(true)}
        className="flex-row items-center bg-white px-3 py-2 rounded-xl border active:bg-gray-50"
        style={{ borderColor: "#E5E7EB" }}
      >
        <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center mr-2">
          <Ionicons name="people" size={16} color="white" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-gray-800" numberOfLines={1}>
            {currentPool.name}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={18} color="#6B7280" />
      </Pressable>

      {/* Pool Selection Modal */}
      <Modal
        visible={showPoolModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPoolModal(false)}
      >
        <Pressable 
          className="flex-1 justify-end bg-black/50"
          onPress={() => setShowPoolModal(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="bg-white rounded-t-3xl" style={{ height: 400 }}>
              <View className="flex-row items-center justify-between p-4 border-b" style={{ borderColor: "#E5E7EB" }}>
                <Text className="text-xl font-bold text-gray-800">Switch Pool</Text>
                <Pressable onPress={() => setShowPoolModal(false)}>
                  <Ionicons name="close" size={28} color="#374151" />
                </Pressable>
              </View>

              <ScrollView className="p-4" style={{ maxHeight: 240 }}>
                {pools.map((pool) => (
                  <Pressable
                    key={pool.id}
                    onPress={() => {
                      setCurrentPool(pool.id);
                      setShowPoolModal(false);
                    }}
                    className={`bg-gray-50 rounded-xl p-4 mb-3 border-2 ${
                      currentPoolId === pool.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-transparent"
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-gray-800 mb-1">
                          {pool.name}
                        </Text>
                        {pool.description && (
                          <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
                            {pool.description}
                          </Text>
                        )}
                        <View className="flex-row items-center">
                          <Ionicons name="people" size={14} color="#6B7280" />
                          <Text className="text-xs text-gray-600 ml-1">
                            {pool.memberIds.length} members
                          </Text>
                        </View>
                      </View>

                      {currentPoolId === pool.id && (
                        <View className="bg-blue-500 w-8 h-8 rounded-full items-center justify-center ml-3">
                          <Ionicons name="checkmark" size={20} color="white" />
                        </View>
                      )}
                    </View>
                  </Pressable>
                ))}
              </ScrollView>

              <SafeAreaView edges={["bottom"]} className="px-4 pt-3 pb-2 border-t bg-white" style={{ borderColor: "#E5E7EB" }}>
                <Pressable
                  onPress={() => {
                    setShowPoolModal(false);
                    (navigation as any).navigate("PoolManagement");
                  }}
                  className="bg-gray-100 py-3 rounded-xl items-center active:bg-gray-200"
                >
                  <View className="flex-row items-center">
                    <Ionicons name="settings" size={20} color="#374151" />
                    <Text className="text-gray-700 text-base font-semibold ml-2">
                      Manage Pools
                    </Text>
                  </View>
                </Pressable>
              </SafeAreaView>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

