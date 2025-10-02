import React from "react";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  NewRequest: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function FloatingActionButton() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <Pressable
      onPress={() => navigation.navigate("NewRequest")}
      className="absolute bottom-20 right-6 w-14 h-14 bg-blue-500 rounded-full items-center justify-center shadow-lg active:bg-blue-600"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <Ionicons name="add" size={32} color="white" />
    </Pressable>
  );
}
