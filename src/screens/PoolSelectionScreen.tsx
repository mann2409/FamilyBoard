import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, CommonActions } from "@react-navigation/native";
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { usePoolStore } from "../state/poolStore";
import { useAuthStore } from "../state/authStore";

export default function PoolSelectionScreen() {
  const navigation = useNavigation();
  const pools = usePoolStore((s) => s.pools);
  const currentPoolId = usePoolStore((s) => s.currentPoolId);
  const setCurrentPool = usePoolStore((s) => s.setCurrentPool);
  const createPool = usePoolStore((s) => s.createPool);
  const joinPool = usePoolStore((s) => s.joinPool);
  const currentUser = useAuthStore((s) => s.currentUser);

  const createBottomSheetRef = useRef<BottomSheet>(null);
  const joinBottomSheetRef = useRef<BottomSheet>(null);
  const createSnapPoints = useMemo(() => ['60%'], []);
  const joinSnapPoints = useMemo(() => ['45%'], []);

  // Navigate to main app when pool is selected
  useEffect(() => {
    if (currentPoolId && pools.length > 0) {
      // Reset navigation to MainTabs
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'MainTabs' as never }],
        })
      );
    }
  }, [currentPoolId, pools.length, navigation]);
  
  const [poolName, setPoolName] = useState("");
  const [poolDescription, setPoolDescription] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const renderBackdrop = React.useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

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
    createBottomSheetRef.current?.close();
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
      joinBottomSheetRef.current?.close();
      Alert.alert("Success", `Joined ${pool.name} successfully!`);
    } else {
      Alert.alert("Error", "Invalid invite code. Please check and try again.");
    }
  };

  // If user has no pools, show welcome screen
  if (pools.length === 0) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1"
      >
        <SafeAreaView className="flex-1">
          <View className="flex-1 items-center justify-center px-6">
            <View className="w-32 h-32 bg-white/20 rounded-full items-center justify-center mb-8" style={{ borderWidth: 4, borderColor: 'white' }}>
              <Ionicons name="people" size={64} color="white" />
            </View>

            <Text className="text-3xl font-bold text-white mb-3 text-center">
              Create or Join a Pool
            </Text>
            <Text className="text-base text-white/90 text-center mb-4 px-4">
              Pools are shared spaces where you coordinate tasks with your group
            </Text>
            <View className="bg-white/20 px-4 py-3 rounded-xl mb-12">
              <Text className="text-sm text-white font-medium text-center">
                💡 You can join multiple pools and switch between them anytime
              </Text>
            </View>

          <LinearGradient
            colors={['#FFFFFF', '#F3F4F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="w-full rounded-2xl mb-4"
          >
            <Pressable
              onPress={() => createBottomSheetRef.current?.expand()}
              className="w-full py-4 items-center active:opacity-80"
            >
              <View className="flex-row items-center">
                <Ionicons name="add-circle" size={24} color="#667eea" />
                <Text className="text-gray-800 text-lg font-bold ml-2">
                  Create New Pool
                </Text>
              </View>
            </Pressable>
          </LinearGradient>

          <Pressable
            onPress={() => joinBottomSheetRef.current?.expand()}
            className="w-full bg-white/20 border-2 border-white py-4 rounded-2xl items-center active:bg-white/30"
          >
            <View className="flex-row items-center">
              <Ionicons name="enter" size={24} color="white" />
              <Text className="text-white text-lg font-bold ml-2">
                Join Existing Pool
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Create Pool Bottom Sheet */}
        <BottomSheet
          ref={createBottomSheetRef}
          index={-1}
          snapPoints={createSnapPoints}
          enablePanDownToClose
          backdropComponent={renderBackdrop}
        >
          <BottomSheetView style={{ flex: 1, padding: 24 }}>
            <Text className="text-2xl font-bold text-gray-800 mb-6">Create Pool</Text>
            
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

            <Pressable
              onPress={handleCreatePool}
              className="bg-blue-500 py-4 rounded-xl items-center active:bg-blue-600"
            >
              <Text className="text-white text-lg font-bold">Create Pool</Text>
            </Pressable>
          </BottomSheetView>
        </BottomSheet>

        {/* Join Pool Bottom Sheet */}
        <BottomSheet
          ref={joinBottomSheetRef}
          index={-1}
          snapPoints={joinSnapPoints}
          enablePanDownToClose
          backdropComponent={renderBackdrop}
        >
          <BottomSheetView style={{ flex: 1, padding: 24 }}>
            <Text className="text-2xl font-bold text-gray-800 mb-6">Join Pool</Text>
            
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

            <Pressable
              onPress={handleJoinPool}
              className="bg-blue-500 py-4 rounded-xl items-center active:bg-blue-600"
            >
              <Text className="text-white text-lg font-bold">Join Pool</Text>
            </Pressable>
          </BottomSheetView>
        </BottomSheet>
      </SafeAreaView>
      </LinearGradient>
    );
  }

  // Pool selector for users with multiple pools
  const handleSelectPool = (poolId: string) => {
    setCurrentPool(poolId);
  };

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
              onPress={() => createBottomSheetRef.current?.expand()}
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
              onPress={() => joinBottomSheetRef.current?.expand()}
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

      {/* Create Pool Bottom Sheet */}
      <BottomSheet
        ref={createBottomSheetRef}
        index={-1}
        snapPoints={createSnapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
      >
        <BottomSheetView style={{ flex: 1, padding: 24 }}>
          <Text className="text-2xl font-bold text-gray-800 mb-6">Create Pool</Text>
          
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

          <Pressable
            onPress={handleCreatePool}
            className="bg-blue-500 py-4 rounded-xl items-center active:bg-blue-600"
          >
            <Text className="text-white text-lg font-bold">Create Pool</Text>
          </Pressable>
        </BottomSheetView>
      </BottomSheet>

      {/* Join Pool Bottom Sheet */}
      <BottomSheet
        ref={joinBottomSheetRef}
        index={-1}
        snapPoints={joinSnapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
      >
        <BottomSheetView style={{ flex: 1, padding: 24 }}>
          <Text className="text-2xl font-bold text-gray-800 mb-6">Join Pool</Text>
          
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

          <Pressable
            onPress={handleJoinPool}
            className="bg-blue-500 py-4 rounded-xl items-center active:bg-blue-600"
          >
            <Text className="text-white text-lg font-bold">Join Pool</Text>
          </Pressable>
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}

