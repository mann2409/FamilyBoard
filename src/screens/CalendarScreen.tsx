import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek, parseISO } from "date-fns";
import { useRequestsStore } from "../state/requestsStore";
import { usePoolStore } from "../state/poolStore";
import { useAuthStore } from "../state/authStore";
import { FamilyRequest, RequestType } from "../types/family";
import FloatingActionButton from "../components/FloatingActionButton";
import PoolSwitcher from "../components/PoolSwitcher";

type RootStackParamList = {
  RequestDetail: { requestId: string };
  NewRequest: undefined;
  Profile: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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

export default function CalendarScreen() {
  const navigation = useNavigation<NavigationProp>();
  const allRequests = useRequestsStore((s) => s.requests);
  const getRequestsByPool = useRequestsStore((s) => s.getRequestsByPool);
  const currentPoolId = usePoolStore((s) => s.currentPoolId);
  const getCurrentPool = usePoolStore((s) => s.getCurrentPool);
  const currentUser = useAuthStore((s) => s.currentUser);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Filter by pool and only show claimed/completed requests
  const requests = useMemo(() => {
    const poolRequests = currentPoolId ? getRequestsByPool(currentPoolId) : allRequests;
    return poolRequests.filter(req => req.status === "claimed" || req.status === "completed");
  }, [currentPoolId, getRequestsByPool, allRequests]);

  const currentPool = getCurrentPool();
  
  const getUserInitials = () => {
    if (!currentUser?.name) return "U";
    const names = currentUser.name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const requestsByDate = useMemo(() => {
    const map = new Map<string, FamilyRequest[]>();
    requests.forEach((request) => {
      const dateKey = format(new Date(request.dateTime), "yyyy-MM-dd");
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(request);
    });
    return map;
  }, [requests]);

  const getRequestsForDay = (day: Date) => {
    const dateKey = format(day, "yyyy-MM-dd");
    return requestsByDate.get(dateKey) || [];
  };

  const getSelectedDateEvents = () => {
    if (!selectedDate) return [];
    return getRequestsForDay(selectedDate);
  };

  const renderDay = (day: Date) => {
    const dayRequests = getRequestsForDay(day);
    const isToday = isSameDay(day, new Date());
    const isCurrentMonth = isSameMonth(day, currentDate);
    const isSelected = selectedDate && isSameDay(day, selectedDate);
    const hasEvents = dayRequests.length > 0;

    return (
      <Pressable
        key={day.toISOString()}
        onPress={() => setSelectedDate(day)}
        style={{ width: '14.28%' }}
      >
        <View className="items-center justify-center" style={{ paddingVertical: 12 }}>
          {/* Date number */}
          <Text
            className={`text-lg ${
              isSelected
                ? "font-bold text-blue-600"
                : isToday
                ? "font-bold text-gray-900"
                : !isCurrentMonth
                ? "text-gray-300"
                : "text-gray-900"
            }`}
          >
            {format(day, "d")}
          </Text>
          
          {/* Small dot for events - exactly like iPhone */}
          {hasEvents && isCurrentMonth && (
            <View 
              className="w-1 h-1 rounded-full" 
              style={{ 
                backgroundColor: isSelected ? "#007AFF" : "#8E8E93",
                marginTop: 2
              }}
            />
          )}
        </View>
      </Pressable>
    );
  };

  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-4 pt-2 pb-3 flex-row items-center justify-between">
          <Text className="text-3xl font-bold text-gray-900">Calendar</Text>
          <View className="flex-row items-center">
            {currentPool && (
              <View className="mr-3">
                <PoolSwitcher />
              </View>
            )}
            <Pressable
              onPress={() => (navigation as any).navigate("Profile")}
              className="active:opacity-70"
            >
              <View className="w-9 h-9 bg-gray-200 rounded-full items-center justify-center">
                <Text className="text-sm font-bold text-gray-700">
                  {getUserInitials()}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Calendar Grid */}
        <View className="bg-white px-2">
          {/* Week Days Header */}
          <View className="flex-row py-2 border-b" style={{ borderColor: "#E5E5EA" }}>
            {weekDays.map((day, idx) => (
              <View key={idx} style={{ width: '14.28%' }}>
                <Text className="text-center text-xs font-semibold text-gray-400">
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {/* Month Name Separator */}
          <View className="py-3 items-center">
            <Text className="text-base font-semibold" style={{ color: "#FF3B30" }}>
              {format(currentDate, "MMM")}
            </Text>
          </View>

          {/* Calendar Days */}
          <View className="flex-row flex-wrap">
            {calendarDays.map((day) => renderDay(day))}
          </View>
        </View>

        {/* Month Navigation - Subtle at bottom */}
        <View className="px-4 py-3 flex-row items-center justify-center border-t" style={{ borderColor: "#E5E5EA" }}>
          <Pressable
            onPress={() => {
              setCurrentDate(subMonths(currentDate, 1));
              setSelectedDate(null);
            }}
            className="px-6 py-2 active:opacity-50"
          >
            <Ionicons name="chevron-back" size={20} color="#007AFF" />
          </Pressable>
          
          <Pressable
            onPress={() => {
              setCurrentDate(new Date());
              setSelectedDate(new Date());
            }}
            className="px-4 active:opacity-70"
          >
            <Text className="text-sm font-semibold text-gray-600">
              {format(currentDate, "MMMM yyyy")}
            </Text>
          </Pressable>
          
          <Pressable
            onPress={() => {
              setCurrentDate(addMonths(currentDate, 1));
              setSelectedDate(null);
            }}
            className="px-6 py-2 active:opacity-50"
          >
            <Ionicons name="chevron-forward" size={20} color="#007AFF" />
          </Pressable>
        </View>

        {/* Selected Date Events */}
        {selectedDate && (
          <View className="px-4 py-4 border-t" style={{ borderColor: "#F0F0F0" }}>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-gray-900">
                {format(selectedDate, "EEEE, MMMM d")}
              </Text>
              <Pressable
                onPress={() => setSelectedDate(null)}
                className="active:opacity-70"
              >
                <Ionicons name="close-circle" size={24} color="#8E8E93" />
              </Pressable>
            </View>

            {getSelectedDateEvents().length > 0 ? (
              <View>
                {getSelectedDateEvents().map((request) => (
                  <Pressable
                    key={request.id}
                    onPress={() => navigation.navigate("RequestDetail", { requestId: request.id })}
                    className="mb-3 p-4 rounded-2xl bg-gray-50 active:bg-gray-100"
                  >
                    <View className="flex-row items-start justify-between mb-2">
                      <View className="flex-row items-center flex-1">
                        <View
                          className="w-10 h-10 rounded-full items-center justify-center mr-3"
                          style={{ backgroundColor: STATUS_COLORS[request.status] }}
                        >
                          <Ionicons
                            name={REQUEST_TYPE_ICONS[request.type]}
                            size={20}
                            color="white"
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-gray-900 mb-1">
                            {request.title}
                          </Text>
                          <Text className="text-sm text-gray-600">
                            {format(parseISO(request.dateTime), "h:mm a")}
                          </Text>
                        </View>
                      </View>
                      <View
                        className="px-2 py-1 rounded-full"
                        style={{ backgroundColor: STATUS_COLORS[request.status] + "20" }}
                      >
                        <Text className="text-xs font-semibold capitalize" style={{ color: STATUS_COLORS[request.status] }}>
                          {request.status}
                        </Text>
                      </View>
                    </View>

                    {request.location && (
                      <View className="flex-row items-center mt-2">
                        <Ionicons name="location" size={14} color="#8E8E93" />
                        <Text className="text-sm text-gray-600 ml-1">{request.location}</Text>
                      </View>
                    )}

                    {request.claimedBy && (
                      <View className="flex-row items-center mt-2">
                        <Ionicons name="person" size={14} color="#8E8E93" />
                        <Text className="text-sm text-gray-600 ml-1">
                          {request.claimedBy.name}
                        </Text>
                      </View>
                    )}

                    {request.reward && (
                      <View className="flex-row items-center mt-2">
                        <Ionicons name="gift" size={14} color="#8E8E93" />
                        <Text className="text-sm text-gray-600 ml-1">{request.reward}</Text>
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            ) : (
              <View className="items-center py-12">
                <Ionicons name="calendar-outline" size={64} color="#C7C7CC" />
                <Text className="text-gray-400 mt-3 text-base">No events</Text>
              </View>
            )}
          </View>
        )}

        {/* Empty State */}
        {requests.length === 0 && !selectedDate && (
          <View className="px-4 py-16 items-center">
            <Ionicons name="calendar-outline" size={80} color="#C7C7CC" />
            <Text className="text-xl font-semibold text-gray-900 mt-6">
              No Events
            </Text>
            <Text className="text-base text-gray-500 mt-2 text-center">
              Claim requests to see them in your calendar
            </Text>
          </View>
        )}
      </ScrollView>

      <FloatingActionButton />
    </SafeAreaView>
  );
}
