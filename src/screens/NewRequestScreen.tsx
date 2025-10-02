import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuthStore } from "../state/authStore";
import { useRequestsStore } from "../state/requestsStore";
import { FamilyRequest, RequestType } from "../types/family";
import * as ExpoNotifications from "expo-notifications";

type RootStackParamList = {
  MainTabs: undefined;
  NewRequest: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const REQUEST_TYPES: { value: RequestType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "babysitting", label: "Babysitting", icon: "person" },
  { value: "dogsitting", label: "Dog Sitting", icon: "paw" },
  { value: "pickup", label: "Pickup", icon: "car" },
  { value: "other", label: "Other", icon: "help-circle" },
];

export default function NewRequestScreen() {
  const navigation = useNavigation<NavigationProp>();
  const currentUser = useAuthStore((s) => s.currentUser);
  const addRequest = useRequestsStore((s) => s.addRequest);

  const [selectedType, setSelectedType] = useState<RequestType>("babysitting");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    if (!title.trim()) {
      setError("Please enter a title for your request");
      return;
    }

    if (!currentUser) {
      setError("You must be logged in to create a request");
      return;
    }

    // Combine date and time
    const combinedDateTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes()
    );

    // Check if date is in the past
    if (combinedDateTime < new Date()) {
      setError("Please select a future date and time");
      return;
    }

    const newRequest: FamilyRequest = {
      id: Date.now().toString(),
      type: selectedType,
      title: title.trim(),
      description: description.trim() || undefined,
      dateTime: combinedDateTime.toISOString(),
      postedBy: currentUser,
      status: "open",
      createdAt: new Date().toISOString(),
    };

    addRequest(newRequest);

    // Schedule reminder notification (1 hour before)
    const reminderTime = new Date(combinedDateTime.getTime() - 60 * 60 * 1000);
    const secondsUntilReminder = Math.floor((reminderTime.getTime() - Date.now()) / 1000);
    if (secondsUntilReminder > 0) {
      await ExpoNotifications.scheduleNotificationAsync({
        content: {
          title: "Upcoming Request Reminder",
          body: `${title} is happening in 1 hour`,
          data: { requestId: newRequest.id },
        },
        trigger: {
          type: ExpoNotifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsUntilReminder,
          repeats: false,
        },
      });
    }

    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
            <View className="px-6 py-4">
              <Text className="text-2xl font-bold text-gray-800 mb-6">
                New Request
              </Text>

              {/* Request Type Selection */}
              <Text className="text-sm font-semibold text-gray-700 mb-3">
                Request Type
              </Text>
              <View className="flex-row flex-wrap mb-6">
                {REQUEST_TYPES.map((type) => (
                  <Pressable
                    key={type.value}
                    onPress={() => setSelectedType(type.value)}
                    className={`flex-row items-center px-4 py-3 rounded-xl mr-3 mb-3 ${
                      selectedType === type.value
                        ? "bg-blue-500"
                        : "bg-gray-100"
                    }`}
                  >
                    <Ionicons
                      name={type.icon}
                      size={20}
                      color={selectedType === type.value ? "white" : "#6B7280"}
                    />
                    <Text
                      className={`ml-2 font-medium ${
                        selectedType === type.value
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      {type.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Title */}
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Title
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., Pick up kids from school"
                placeholderTextColor="#9CA3AF"
                className="w-full px-4 py-3.5 bg-gray-50 rounded-xl text-base text-gray-800 mb-4"
              />

              {/* Date */}
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Date
              </Text>
              <Pressable
                onPress={() => setShowDatePicker(true)}
                className="w-full px-4 py-3.5 bg-gray-50 rounded-xl mb-4 flex-row items-center justify-between"
              >
                <Text className="text-base text-gray-800">
                  {date.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
                <Ionicons name="calendar" size={20} color="#6B7280" />
              </Pressable>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="inline"
                  onChange={(_event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setDate(selectedDate);
                    }
                  }}
                  minimumDate={new Date()}
                />
              )}

              {/* Time */}
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Time
              </Text>
              <Pressable
                onPress={() => setShowTimePicker(true)}
                className="w-full px-4 py-3.5 bg-gray-50 rounded-xl mb-4 flex-row items-center justify-between"
              >
                <Text className="text-base text-gray-800">
                  {time.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </Text>
                <Ionicons name="time" size={20} color="#6B7280" />
              </Pressable>

              {showTimePicker && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  display="spinner"
                  onChange={(_event, selectedTime) => {
                    setShowTimePicker(false);
                    if (selectedTime) {
                      setTime(selectedTime);
                    }
                  }}
                />
              )}

              {/* Description */}
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Notes (Optional)
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Add any additional details..."
                placeholderTextColor="#9CA3AF"
                className="w-full px-4 py-3.5 bg-gray-50 rounded-xl text-base text-gray-800 mb-6"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              {error ? (
                <View className="bg-red-50 px-4 py-3 rounded-lg mb-4">
                  <Text className="text-red-600 text-sm">{error}</Text>
                </View>
              ) : null}

              <Pressable
                onPress={handleSubmit}
                className="w-full bg-blue-500 py-4 rounded-xl items-center active:bg-blue-600"
              >
                <Text className="text-white text-base font-semibold">
                  Post Request
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
