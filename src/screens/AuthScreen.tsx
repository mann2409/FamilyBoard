import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../state/authStore";

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const login = useAuthStore((s) => s.login);
  const signup = useAuthStore((s) => s.signup);

  const handleSubmit = () => {
    setError("");

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    if (isLogin) {
      login(name, email);
    } else {
      signup(name, email);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              className="flex-1"
              contentContainerClassName="flex-grow justify-center px-6"
              keyboardShouldPersistTaps="handled"
            >
              <View className="items-center mb-12">
                <View className="w-24 h-24 bg-blue-500 rounded-full items-center justify-center mb-4">
                  <Ionicons name="people" size={48} color="white" />
                </View>
              <Text className="text-3xl font-bold text-gray-800">
                Welcome to FamilyBoard
              </Text>
              <Text className="text-base text-gray-500 mt-2 text-center px-4">
                Coordinate tasks and stay organized with your family or group
              </Text>
              
              {/* Features */}
              <View className="mt-8 w-full">
                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
                    <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
                  </View>
                  <Text className="text-sm text-gray-600 flex-1">
                    Share and claim family requests
                  </Text>
                </View>
                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
                    <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
                  </View>
                  <Text className="text-sm text-gray-600 flex-1">
                    Track tasks on a shared calendar
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
                    <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
                  </View>
                  <Text className="text-sm text-gray-600 flex-1">
                    Join multiple pools (family, friends, etc.)
                  </Text>
                </View>
              </View>
            </View>

            <View className="w-full">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Name
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#9CA3AF"
                className="w-full px-4 py-3.5 bg-gray-50 rounded-xl text-base text-gray-800 mb-4"
                autoCapitalize="words"
                autoCorrect={false}
              />

              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                className="w-full px-4 py-3.5 bg-gray-50 rounded-xl text-base text-gray-800 mb-4"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              {error ? (
                <View className="bg-red-50 px-4 py-3 rounded-lg mb-4">
                  <Text className="text-red-600 text-sm">{error}</Text>
                </View>
              ) : null}

              <Pressable
                onPress={handleSubmit}
                className="w-full bg-blue-500 py-4 rounded-xl items-center active:bg-blue-600 mt-2"
              >
                <Text className="text-white text-base font-semibold">
                  {isLogin ? "Log In" : "Sign Up"}
                </Text>
              </Pressable>

              <View className="flex-row items-center justify-center mt-6">
                <Text className="text-gray-600">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                </Text>
                <Pressable onPress={() => setIsLogin(!isLogin)}>
                  <Text className="text-blue-500 font-semibold">
                    {isLogin ? "Sign Up" : "Log In"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
