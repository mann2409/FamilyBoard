import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FamilyMember } from "../types/family";

interface AuthState {
  currentUser: FamilyMember | null;
  isAuthenticated: boolean;
  familyMembers: FamilyMember[];
  
  // Actions
  login: (name: string, email: string) => void;
  signup: (name: string, email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      familyMembers: [],

      login: (name: string, email: string) => {
        set((state) => {
          // Check if user exists in family members
          const existingMember = state.familyMembers.find(
            (m) => m.email.toLowerCase() === email.toLowerCase()
          );

          if (existingMember) {
            return {
              currentUser: existingMember,
              isAuthenticated: true,
            };
          }

          // Create new user if not exists
          const newMember: FamilyMember = {
            id: Date.now().toString(),
            name,
            email,
          };

          return {
            currentUser: newMember,
            isAuthenticated: true,
            familyMembers: [...state.familyMembers, newMember],
          };
        });
      },

      signup: (name: string, email: string) => {
        set((state) => {
          const newMember: FamilyMember = {
            id: Date.now().toString(),
            name,
            email,
          };

          return {
            currentUser: newMember,
            isAuthenticated: true,
            familyMembers: [...state.familyMembers, newMember],
          };
        });
      },

      logout: () => {
        set({
          currentUser: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
