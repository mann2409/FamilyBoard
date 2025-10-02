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
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { useRequestsStore } from "../state/requestsStore";
import { FamilyRequest, RequestType } from "../types/family";
import FloatingActionButton from "../components/FloatingActionButton";

type RootStackParamList = {
  RequestDetail: { requestId: string };
  NewRequest: undefined;
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
  const requests = useRequestsStore((s) => s.requests);
  
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const renderDay = (day: Date) => {
    const dayRequests = getRequestsForDay(day);
    const isToday = isSameDay(day, new Date());
    const isCurrentMonth = isSameMonth(day, currentDate);

    return (
      <View
        key={day.toISOString()}
        className="flex-1 aspect-square p-1"
        style={{ minHeight: 80 }}
      >
        <View
          className={`flex-1 rounded-lg ${
            isToday ? "bg-blue-100" : ""
          } ${!isCurrentMonth ? "opacity-40" : ""}`}
        >
          <Text
            className={`text-center text-sm font-medium mt-1 ${
              isToday ? "text-blue-600" : "text-gray-700"
            }`}
          >
            {format(day, "d")}
          </Text>
          
          {dayRequests.length > 0 && (
            <View className="flex-1 items-center justify-center px-1">
              {dayRequests.slice(0, 2).map((request) => (
                <Pressable
                  key={request.id}
                  onPress={() => navigation.navigate("RequestDetail", { requestId: request.id })}
                  className="w-full mb-1"
                >
                  <View
                    className="px-1.5 py-1 rounded"
                    style={{ backgroundColor: STATUS_COLORS[request.status] }}
                  >
                    <View className="flex-row items-center">
                      <Ionicons
                        name={REQUEST_TYPE_ICONS[request.type]}
                        size={10}
                        color="white"
                      />
                      <Text
                        className="text-white text-xs ml-1 flex-1"
                        numberOfLines={1}
                      >
                        {request.title}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
              {dayRequests.length > 2 && (
                <Text className="text-xs text-gray-500">
                  +{dayRequests.length - 2} more
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="px-4 py-3 border-b" style={{ borderColor: "#E5E7EB" }}>
        <View className="flex-row items-center justify-between mb-4">
          <Pressable
            onPress={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2"
          >
            <Ionicons name="chevron-back" size={24} color="#374151" />
          </Pressable>
          
          <Text className="text-xl font-bold text-gray-800">
            {format(currentDate, "MMMM yyyy")}
          </Text>
          
          <Pressable
            onPress={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2"
          >
            <Ionicons name="chevron-forward" size={24} color="#374151" />
          </Pressable>
        </View>

        <View className="flex-row">
          {weekDays.map((day) => (
            <View key={day} className="flex-1">
              <Text className="text-center text-xs font-semibold text-gray-500">
                {day}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView className="flex-1">
        <View className="flex-row flex-wrap">
          {calendarDays.map((day) => renderDay(day))}
        </View>

        {/* Legend */}
        <View className="px-4 py-4 border-t" style={{ borderColor: "#E5E7EB" }}>
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Status Legend
          </Text>
          <View className="flex-row flex-wrap">
            <View className="flex-row items-center mr-4 mb-2">
              <View className="w-3 h-3 rounded" style={{ backgroundColor: STATUS_COLORS.open }} />
              <Text className="text-xs text-gray-600 ml-2">Open</Text>
            </View>
            <View className="flex-row items-center mr-4 mb-2">
              <View className="w-3 h-3 rounded" style={{ backgroundColor: STATUS_COLORS.claimed }} />
              <Text className="text-xs text-gray-600 ml-2">Claimed</Text>
            </View>
            <View className="flex-row items-center mb-2">
              <View className="w-3 h-3 rounded" style={{ backgroundColor: STATUS_COLORS.completed }} />
              <Text className="text-xs text-gray-600 ml-2">Completed</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <FloatingActionButton />
    </SafeAreaView>
  );
}
