import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { format } from "date-fns";
import { useRequestsStore } from "../state/requestsStore";
import { useAuthStore } from "../state/authStore";
import { RequestType } from "../types/family";

type RootStackParamList = {
  RequestDetail: { requestId: string };
  MainTabs: undefined;
};

type RequestDetailRouteProp = RouteProp<RootStackParamList, "RequestDetail">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  babysitting: "Babysitting",
  dogsitting: "Dog Sitting",
  pickup: "Pickup",
  other: "Other",
};

const REQUEST_TYPE_ICONS: Record<RequestType, keyof typeof Ionicons.glyphMap> = {
  babysitting: "person",
  dogsitting: "paw",
  pickup: "car",
  other: "help-circle",
};

const STATUS_COLORS = {
  open: "#3B82F6",
  claimed: "#F59E0B",
  completed: "#10B981",
};

const STATUS_LABELS = {
  open: "Open",
  claimed: "Claimed",
  completed: "Completed",
};

export default function RequestDetailScreen() {
  const route = useRoute<RequestDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { requestId } = route.params;

  const requests = useRequestsStore((s) => s.requests);
  const claimRequest = useRequestsStore((s) => s.claimRequest);
  const completeRequest = useRequestsStore((s) => s.completeRequest);
  const currentUser = useAuthStore((s) => s.currentUser);

  const request = requests.find((r) => r.id === requestId);

  if (!request || !currentUser) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle" size={64} color="#9CA3AF" />
          <Text className="text-xl font-semibold text-gray-800 mt-4">
            Request Not Found
          </Text>
          <Text className="text-base text-gray-500 text-center mt-2">
            This request may have been deleted or does not exist.
          </Text>
          <Pressable
            onPress={() => navigation.goBack()}
            className="mt-6 bg-blue-500 px-6 py-3 rounded-xl active:bg-blue-600"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleClaim = () => {
    claimRequest(request.id, currentUser.id, currentUser.name);
  };

  const handleComplete = () => {
    completeRequest(request.id);
  };

  const canClaim = request.status === "open" && request.postedBy.id !== currentUser.id;
  const canComplete = request.status === "claimed" && request.claimedBy?.id === currentUser.id;
  const isPostedByMe = request.postedBy.id === currentUser.id;

  const requestDateTime = new Date(request.dateTime);
  const isPast = requestDateTime < new Date();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 py-6 bg-gray-50">
          <View className="flex-row items-center justify-between mb-4">
            <View
              className="w-16 h-16 rounded-full items-center justify-center"
              style={{ backgroundColor: STATUS_COLORS[request.status] }}
            >
              <Ionicons
                name={REQUEST_TYPE_ICONS[request.type]}
                size={32}
                color="white"
              />
            </View>
            <View
              className="px-4 py-2 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[request.status] }}
            >
              <Text className="text-white font-semibold">
                {STATUS_LABELS[request.status]}
              </Text>
            </View>
          </View>

          <Text className="text-2xl font-bold text-gray-800 mb-2">
            {request.title}
          </Text>
          <Text className="text-base text-gray-600">
            {REQUEST_TYPE_LABELS[request.type]}
          </Text>
        </View>

        {/* Details */}
        <View className="px-6 py-6">
          {/* Date & Time */}
          <View className="mb-6">
            <View className="flex-row items-center mb-2">
              <Ionicons name="calendar" size={20} color="#6B7280" />
              <Text className="text-sm font-semibold text-gray-500 ml-2">
                DATE & TIME
              </Text>
            </View>
            <Text className="text-base text-gray-800 ml-7">
              {format(requestDateTime, "EEEE, MMMM d, yyyy")}
            </Text>
            <Text className="text-base text-gray-800 ml-7">
              {format(requestDateTime, "h:mm a")}
            </Text>
            {isPast && (
              <Text className="text-sm text-red-500 ml-7 mt-1">
                This date has passed
              </Text>
            )}
          </View>

          {/* Posted By */}
          <View className="mb-6">
            <View className="flex-row items-center mb-2">
              <Ionicons name="person-circle" size={20} color="#6B7280" />
              <Text className="text-sm font-semibold text-gray-500 ml-2">
                POSTED BY
              </Text>
            </View>
            <Text className="text-base text-gray-800 ml-7">
              {request.postedBy.name}
              {isPostedByMe && " (You)"}
            </Text>
          </View>

          {/* Claimed By */}
          {request.claimedBy && (
            <View className="mb-6">
              <View className="flex-row items-center mb-2">
                <Ionicons name="checkmark-circle" size={20} color="#6B7280" />
                <Text className="text-sm font-semibold text-gray-500 ml-2">
                  CLAIMED BY
                </Text>
              </View>
              <Text className="text-base text-gray-800 ml-7">
                {request.claimedBy.name}
                {request.claimedBy.id === currentUser.id && " (You)"}
              </Text>
            </View>
          )}

          {/* Description */}
          {request.description && (
            <View className="mb-6">
              <View className="flex-row items-center mb-2">
                <Ionicons name="document-text" size={20} color="#6B7280" />
                <Text className="text-sm font-semibold text-gray-500 ml-2">
                  NOTES
                </Text>
              </View>
              <Text className="text-base text-gray-700 ml-7">
                {request.description}
              </Text>
            </View>
          )}

          {/* Created */}
          <View className="mb-6">
            <View className="flex-row items-center mb-2">
              <Ionicons name="time" size={20} color="#6B7280" />
              <Text className="text-sm font-semibold text-gray-500 ml-2">
                CREATED
              </Text>
            </View>
            <Text className="text-base text-gray-800 ml-7">
              {format(new Date(request.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </Text>
          </View>

          {/* Completed */}
          {request.completedAt && (
            <View className="mb-6">
              <View className="flex-row items-center mb-2">
                <Ionicons name="checkmark-done" size={20} color="#6B7280" />
                <Text className="text-sm font-semibold text-gray-500 ml-2">
                  COMPLETED
                </Text>
              </View>
              <Text className="text-base text-gray-800 ml-7">
                {format(new Date(request.completedAt), "MMM d, yyyy 'at' h:mm a")}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="px-6 py-4 border-t" style={{ borderTopColor: "#E5E7EB" }}>
        {canClaim && (
          <Pressable
            onPress={handleClaim}
            className="w-full bg-blue-500 py-4 rounded-xl items-center active:bg-blue-600"
          >
            <Text className="text-white text-base font-semibold">
              Claim This Request
            </Text>
          </Pressable>
        )}

        {canComplete && (
          <Pressable
            onPress={handleComplete}
            className="w-full bg-green-500 py-4 rounded-xl items-center active:bg-green-600"
          >
            <Text className="text-white text-base font-semibold">
              Mark as Completed
            </Text>
          </Pressable>
        )}

        {request.status === "completed" && (
          <View className="w-full bg-gray-100 py-4 rounded-xl items-center">
            <Text className="text-gray-600 text-base font-semibold">
              This request has been completed
            </Text>
          </View>
        )}

        {isPostedByMe && request.status === "open" && (
          <View className="w-full bg-gray-100 py-4 rounded-xl items-center">
            <Text className="text-gray-600 text-base font-semibold">
              Waiting for someone to claim this request
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
