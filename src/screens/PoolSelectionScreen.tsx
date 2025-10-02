import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePoolStore } from "../state/poolStore";
import { useAuthStore } from "../state/authStore";

export default function PoolSelectionScreen() {
  const pools = usePoolStore((s) => s.pools);
  const currentPoolId = usePoolStore((s) => s.currentPoolId);
  const setCurrentPool = usePoolStore((s) => s.setCurrentPool);
  const createPool = usePoolStore((s) => s.createPool);
  const joinPool = usePoolStore((s) => s.joinPool);
  const currentUser = useAuthStore((s) => s.currentUser);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [poolName, setPoolName] = useState("");
  const [poolDescription, setPoolDescription] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const handleCreatePool = () => {
    if (!poolName.trim() || !currentUser) {
      Alert.alert("Error", "Please enter a pool name");
      return;
    }

    createPool(
      poolName.trim(),
      poolDescription.trim(),
      currentUser.id,
      currentUser.name,
      currentUser.email
    );

    setPoolName("");
    setPoolDescription("");
    setShowCreateModal(false);
    Alert.alert("Success", "Pool created successfully!");
  };

  const handleJoinPool = () => {
    if (!inviteCode.trim() || !currentUser) {
      Alert.alert("Error", "Please enter an invite code");
      return;
    }

    const pool = joinPool(
      inviteCode.trim().toUpperCase(),
      currentUser.id,
      currentUser.name,
      currentUser.email
    );

    if (pool) {
      setInviteCode("");
      setShowJoinModal(false);
      Alert.alert("Success", `Joined ${pool.name} successfully!`);
    } else {
      Alert.alert("Error", "Invalid invite code. Please check and try again.");
    }
  };

  // If user has no pools, show welcome screen
  if (pools.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gradient-to-b from-blue-50 to-white">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-32 h-32 bg-blue-500 rounded-full items-center justify-center mb-8">
            <Ionicons name="people" size={64} color="white" />
          </View>

          <Text className="text-3xl font-bold text-gray-800 mb-3 text-center">
            Welcome to FamilyBoard
          </Text>
          <Text className="text-lg text-gray-600 text-center mb-12">
            Get started by creating a pool for your family or join an existing one
          </Text>

          <Pressable
            onPress={() => setShowCreateModal(true)}
            className="w-full bg-blue-500 py-4 rounded-2xl items-center mb-4 active:bg-blue-600"
          >
            <View className="flex-row items-center">
              <Ionicons name="add-circle" size={24} color="white" />
              <Text className="text-white text-lg font-bold ml-2">
                Create New Pool
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => setShowJoinModal(true)}
            className="w-full bg-white border-2 border-blue-500 py-4 rounded-2xl items-center active:bg-blue-50"
          >
            <View className="flex-row items-center">
              <Ionicons name="enter" size={24} color="#3B82F6" />
              <Text className="text-blue-500 text-lg font-bold ml-2">
                Join Existing Pool
              </Text>
            </View>
          </Pressable>
        </View>

        {renderCreateModal()}
        {renderJoinModal()}
      </SafeAreaView>
    );
  }

  // Pool selector for users with multiple pools
  const handleSelectPool = (poolId: string) => {
    setCurrentPool(poolId);
  };

  function renderCreateModal() {
    const insets = useSafeAreaInsets();
    
    return (
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="overFullScreen"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View className="flex-1">
          <Pressable 
            className="flex-1 bg-black/50" 
            onPress={() => setShowCreateModal(false)}
          />
          <View 
            className="bg-white rounded-t-3xl"
            style={{ paddingBottom: Math.max(insets.bottom, 20) }}
          >
            {/* Header */}
            <View className="p-6 pb-4 border-b" style={{ borderColor: "#E5E7EB" }}>
              <View className="flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-gray-800">Create Pool</Text>
                <Pressable onPress={() => setShowCreateModal(false)}>
                  <Ionicons name="close" size={28} color="#374151" />
                </Pressable>
              </View>
            </View>

            {/* Form */}
            <View className="px-6 pt-6 pb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Pool Name *</Text>
              <TextInput
                className="bg-gray-100 rounded-xl px-4 py-3 mb-4 text-base"
                placeholder="e.g., Smith Family, Book Club"
                value={poolName}
                onChangeText={setPoolName}
                returnKeyType="next"
              />

              <Text className="text-sm font-semibold text-gray-700 mb-2">Description (Optional)</Text>
              <TextInput
                className="bg-gray-100 rounded-xl px-4 py-3 mb-6 text-base"
                placeholder="Tell members what this pool is for..."
                value={poolDescription}
                onChangeText={setPoolDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={{ height: 80 }}
                returnKeyType="done"
              />

              {/* Button */}
              <Pressable
                onPress={handleCreatePool}
                className="bg-blue-500 py-4 rounded-xl items-center active:bg-blue-600"
              >
                <Text className="text-white text-lg font-bold">Create Pool</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  function renderJoinModal() {
    const insets = useSafeAreaInsets();
    
    return (
      <Modal
        visible={showJoinModal}
        animationType="slide"
        presentationStyle="overFullScreen"
        transparent={true}
        onRequestClose={() => setShowJoinModal(false)}
      >
        <View className="flex-1">
          <Pressable 
            className="flex-1 bg-black/50" 
            onPress={() => setShowJoinModal(false)}
          />
          <View 
            className="bg-white rounded-t-3xl"
            style={{ paddingBottom: Math.max(insets.bottom, 20) }}
          >
            {/* Header */}
            <View className="p-6 pb-4 border-b" style={{ borderColor: "#E5E7EB" }}>
              <View className="flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-gray-800">Join Pool</Text>
                <Pressable onPress={() => setShowJoinModal(false)}>
                  <Ionicons name="close" size={28} color="#374151" />
                </Pressable>
              </View>
            </View>

            {/* Form */}
            <View className="px-6 pt-6 pb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Invite Code *</Text>
              <TextInput
                className="bg-gray-100 rounded-xl px-4 py-3 mb-2 text-base text-center font-mono"
                placeholder="XXXX-XXXX"
                value={inviteCode}
                onChangeText={(text) => setInviteCode(text.toUpperCase())}
                autoCapitalize="characters"
                maxLength={9}
                returnKeyType="done"
              />
              <Text className="text-xs text-gray-500 mb-6 text-center">
                Ask a pool admin for the invite code
              </Text>

              {/* Button */}
              <Pressable
                onPress={handleJoinPool}
                className="bg-blue-500 py-4 rounded-xl items-center active:bg-blue-600"
              >
                <Text className="text-white text-lg font-bold">Join Pool</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScrollView className="flex-1">
        <View className="px-4 py-6">
          <Text className="text-2xl font-bold text-gray-800 mb-2">My Pools</Text>
          <Text className="text-base text-gray-600 mb-6">
            Select a pool to view and manage requests
          </Text>

          {pools.map((pool) => (
            <Pressable
              key={pool.id}
              onPress={() => handleSelectPool(pool.id)}
              className={`bg-white rounded-2xl p-5 mb-4 border-2 ${
                currentPoolId === pool.id
                  ? "border-blue-500"
                  : "border-transparent"
              }`}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="text-xl font-bold text-gray-800 mb-1">
                    {pool.name}
                  </Text>
                  {pool.description && (
                    <Text className="text-sm text-gray-600 mb-3">
                      {pool.description}
                    </Text>
                  )}

                  <View className="flex-row items-center mt-2">
                    <Ionicons name="people" size={16} color="#6B7280" />
                    <Text className="text-sm text-gray-600 ml-2">
                      {pool.memberIds.length} members
                    </Text>
                  </View>
                </View>

                {currentPoolId === pool.id && (
                  <View className="bg-blue-500 w-10 h-10 rounded-full items-center justify-center">
                    <Ionicons name="checkmark" size={24} color="white" />
                  </View>
                )}
              </View>
            </Pressable>
          ))}

          {/* Action Buttons */}
          <View className="mt-4">
            <Pressable
              onPress={() => setShowCreateModal(true)}
              className="w-full bg-blue-500 py-4 rounded-xl items-center mb-3 active:bg-blue-600"
            >
              <View className="flex-row items-center">
                <Ionicons name="add-circle" size={20} color="white" />
                <Text className="text-white text-base font-semibold ml-2">
                  Create New Pool
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => setShowJoinModal(true)}
              className="w-full bg-white border border-blue-500 py-4 rounded-xl items-center active:bg-blue-50"
            >
              <View className="flex-row items-center">
                <Ionicons name="enter" size={20} color="#3B82F6" />
                <Text className="text-blue-500 text-base font-semibold ml-2">
                  Join Pool with Code
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {renderCreateModal()}
      {renderJoinModal()}
    </SafeAreaView>
  );
}

