import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, formatDistanceToNow } from "date-fns";
import { FamilyRequest, RequestType } from "../types/family";

interface RequestCardProps {
  request: FamilyRequest;
  onPress: () => void;
  onClaim?: () => void;
  showClaimButton?: boolean;
  currentUserId?: string;
}

const REQUEST_TYPE_ICONS: Record<RequestType, keyof typeof Ionicons.glyphMap> = {
  babysitting: "person",
  dogsitting: "paw",
  pickup: "car",
  other: "help-circle",
};

const REQUEST_TYPE_COLORS: Record<RequestType, string> = {
  babysitting: "#8B5CF6",
  dogsitting: "#F59E0B",
  pickup: "#3B82F6",
  other: "#6B7280",
};

const STATUS_COLORS = {
  open: "#10B981",
  claimed: "#F59E0B",
  completed: "#6B7280",
};

export default function RequestCard({
  request,
  onPress,
  onClaim,
  showClaimButton,
  currentUserId,
}: RequestCardProps) {
  const requestDateTime = new Date(request.dateTime);
  const typeColor = REQUEST_TYPE_COLORS[request.type];
  const isMyRequest = request.postedBy.id === currentUserId;
  const isClaimed = request.status === "claimed";
  const isCompleted = request.status === "completed";

  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm active:opacity-90"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* Header */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: typeColor }}
            >
              <Ionicons
                name={REQUEST_TYPE_ICONS[request.type]}
                size={20}
                color="white"
              />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>
                {request.title}
              </Text>
              <Text className="text-sm text-gray-500 capitalize">
                {request.type.replace(/([A-Z])/g, " $1").trim()}
              </Text>
            </View>
          </View>
        </View>

        {/* Status Badge */}
        <View
          className="px-3 py-1.5 rounded-full ml-2"
          style={{ backgroundColor: STATUS_COLORS[request.status] + "20" }}
        >
          <Text
            className="text-xs font-semibold"
            style={{ color: STATUS_COLORS[request.status] }}
          >
            {request.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Description */}
      {request.description && (
        <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
          {request.description}
        </Text>
      )}

      {/* Date & Time */}
      <View className="flex-row items-center mb-2">
        <Ionicons name="calendar-outline" size={16} color="#6B7280" />
        <Text className="text-sm text-gray-700 ml-2 font-medium">
          {format(requestDateTime, "MMM d, yyyy")} at {format(requestDateTime, "h:mm a")}
        </Text>
      </View>

      {/* Time Until */}
      <View className="flex-row items-center mb-3">
        <Ionicons name="time-outline" size={16} color="#6B7280" />
        <Text className="text-sm text-gray-700 ml-2">
          {formatDistanceToNow(requestDateTime, { addSuffix: true })}
        </Text>
      </View>

      {/* Posted By */}
      <View className="flex-row items-center mb-3 pb-3 border-b border-gray-100">
        <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-2">
          <Text className="text-sm font-semibold text-blue-600">
            {request.postedBy.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text className="text-sm text-gray-600">
          Posted by <Text className="font-semibold">{request.postedBy.name}</Text>
          {isMyRequest && " (You)"}
        </Text>
      </View>

      {/* Claimed Info */}
      {isClaimed && request.claimedBy && (
        <View className="flex-row items-center mb-3 bg-orange-50 p-2 rounded-lg">
          <Ionicons name="checkmark-circle" size={18} color="#F59E0B" />
          <Text className="text-sm text-gray-700 ml-2">
            Claimed by <Text className="font-semibold">{request.claimedBy.name}</Text>
            {request.claimedBy.id === currentUserId && " (You)"}
          </Text>
        </View>
      )}

      {/* Action Button */}
      {showClaimButton && !isMyRequest && request.status === "open" && (
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onClaim?.();
          }}
          className="bg-blue-500 py-3 rounded-xl items-center active:bg-blue-600"
        >
          <Text className="text-white text-base font-semibold">
            🙋‍♂️ Claim This Request
          </Text>
        </Pressable>
      )}

      {isMyRequest && request.status === "open" && (
        <View className="bg-gray-100 py-2 px-3 rounded-lg">
          <Text className="text-sm text-gray-600 text-center">
            Waiting for someone to claim...
          </Text>
        </View>
      )}

      {isCompleted && (
        <View className="bg-green-50 py-2 px-3 rounded-lg flex-row items-center justify-center">
          <Ionicons name="checkmark-done-circle" size={18} color="#10B981" />
          <Text className="text-sm text-green-700 font-medium ml-2">
            Completed
          </Text>
        </View>
      )}
    </Pressable>
  );
}

