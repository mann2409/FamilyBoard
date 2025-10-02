import React from "react";
import { View, Text, Pressable, Modal, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RequestType, RequestStatus } from "../types/family";

interface FilterSortBarProps {
  onFilterChange: (filter: FilterOptions) => void;
  currentFilter: FilterOptions;
}

export interface FilterOptions {
  type?: RequestType | "all";
  status?: RequestStatus | "all";
  sortBy: "date" | "status" | "type";
  sortOrder: "asc" | "desc";
}

export default function FilterSortBar({ onFilterChange, currentFilter }: FilterSortBarProps) {
  const [showFilterModal, setShowFilterModal] = React.useState(false);

  const typeOptions: Array<{ value: RequestType | "all"; label: string }> = [
    { value: "all", label: "All Types" },
    { value: "babysitting", label: "Babysitting" },
    { value: "dogsitting", label: "Dog Sitting" },
    { value: "pickup", label: "Pickup" },
    { value: "other", label: "Other" },
  ];

  const statusOptions: Array<{ value: RequestStatus | "all"; label: string }> = [
    { value: "all", label: "All Status" },
    { value: "open", label: "Open" },
    { value: "claimed", label: "Claimed" },
    { value: "completed", label: "Completed" },
  ];

  const sortOptions = [
    { value: "date" as const, label: "Date" },
    { value: "status" as const, label: "Status" },
    { value: "type" as const, label: "Type" },
  ];

  const getActiveFilterCount = () => {
    let count = 0;
    if (currentFilter.type && currentFilter.type !== "all") count++;
    if (currentFilter.status && currentFilter.status !== "all") count++;
    if (currentFilter.sortBy !== "date" || currentFilter.sortOrder !== "asc") count++;
    return count;
  };

  const resetFilters = () => {
    onFilterChange({
      type: "all",
      status: "all",
      sortBy: "date",
      sortOrder: "asc",
    });
  };

  const activeCount = getActiveFilterCount();

  return (
    <>
      <View className="flex-row items-center px-4 py-3 bg-white border-b" style={{ borderColor: "#E5E7EB" }}>
        <Pressable
          onPress={() => setShowFilterModal(true)}
          className="flex-1 flex-row items-center justify-center bg-gray-100 py-2.5 px-4 rounded-lg active:bg-gray-200 mr-2"
        >
          <Ionicons name="filter" size={18} color="#374151" />
          <Text className="text-sm font-medium text-gray-700 ml-2">Filter</Text>
          {activeCount > 0 && (
            <View className="bg-blue-500 w-5 h-5 rounded-full items-center justify-center ml-2">
              <Text className="text-xs font-bold text-white">{activeCount}</Text>
            </View>
          )}
        </Pressable>

        <Pressable
          onPress={() => {
            onFilterChange({
              ...currentFilter,
              sortOrder: currentFilter.sortOrder === "asc" ? "desc" : "asc",
            });
          }}
          className="flex-row items-center justify-center bg-gray-100 py-2.5 px-4 rounded-lg active:bg-gray-200"
        >
          <Ionicons
            name={currentFilter.sortOrder === "asc" ? "arrow-up" : "arrow-down"}
            size={18}
            color="#374151"
          />
        </Pressable>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl" style={{ maxHeight: "80%" }}>
            <View className="flex-row items-center justify-between p-4 border-b" style={{ borderColor: "#E5E7EB" }}>
              <Text className="text-xl font-bold text-gray-800">Filters & Sort</Text>
              <Pressable onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={28} color="#374151" />
              </Pressable>
            </View>

            <ScrollView className="p-4">
              {/* Type Filter */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-gray-700 mb-3">Request Type</Text>
                <View className="flex-row flex-wrap">
                  {typeOptions.map((option) => (
                    <Pressable
                      key={option.value}
                      onPress={() => onFilterChange({ ...currentFilter, type: option.value })}
                      className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                        currentFilter.type === option.value
                          ? "bg-blue-500"
                          : "bg-gray-100"
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          currentFilter.type === option.value ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Status Filter */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-gray-700 mb-3">Status</Text>
                <View className="flex-row flex-wrap">
                  {statusOptions.map((option) => (
                    <Pressable
                      key={option.value}
                      onPress={() => onFilterChange({ ...currentFilter, status: option.value })}
                      className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                        currentFilter.status === option.value
                          ? "bg-blue-500"
                          : "bg-gray-100"
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          currentFilter.status === option.value ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Sort By */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-gray-700 mb-3">Sort By</Text>
                <View className="flex-row flex-wrap">
                  {sortOptions.map((option) => (
                    <Pressable
                      key={option.value}
                      onPress={() => onFilterChange({ ...currentFilter, sortBy: option.value })}
                      className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                        currentFilter.sortBy === option.value
                          ? "bg-blue-500"
                          : "bg-gray-100"
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          currentFilter.sortBy === option.value ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Reset Button */}
              <Pressable
                onPress={() => {
                  resetFilters();
                  setShowFilterModal(false);
                }}
                className="bg-gray-100 py-3 rounded-xl items-center active:bg-gray-200"
              >
                <Text className="text-gray-700 text-base font-semibold">Reset All Filters</Text>
              </Pressable>
            </ScrollView>

            <View className="p-4 border-t" style={{ borderColor: "#E5E7EB" }}>
              <Pressable
                onPress={() => setShowFilterModal(false)}
                className="bg-blue-500 py-4 rounded-xl items-center active:bg-blue-600"
              >
                <Text className="text-white text-base font-semibold">Apply Filters</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

