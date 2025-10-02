import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FamilyRequest, Notification, RequestStatus } from "../types/family";
import * as ExpoNotifications from "expo-notifications";

interface RequestsState {
  requests: FamilyRequest[];
  notifications: Notification[];

  // Actions
  addRequest: (request: FamilyRequest) => void;
  claimRequest: (requestId: string, userId: string, userName: string) => void;
  completeRequest: (requestId: string) => void;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (notificationId: string) => void;
  updateRequestStatus: (requestId: string, status: RequestStatus) => void;
  getRequestsByPool: (poolId: string) => FamilyRequest[];
}

export const useRequestsStore = create<RequestsState>()(
  persist(
    (set, get) => ({
      requests: [],
      notifications: [],

      addRequest: (request: FamilyRequest) => {
        set((state) => ({
          requests: [...state.requests, request],
        }));

        // Create notification for new request
        const notification: Notification = {
          id: Date.now().toString(),
          type: "new_request",
          requestId: request.id,
          message: `${request.postedBy.name} posted a new ${request.type} request`,
          read: false,
          createdAt: new Date().toISOString(),
        };

        get().addNotification(notification);

        // Schedule push notification
        ExpoNotifications.scheduleNotificationAsync({
          content: {
            title: "New Family Request",
            body: notification.message,
            data: { requestId: request.id },
          },
          trigger: null, // Send immediately
        });
      },

      claimRequest: (requestId: string, userId: string, userName: string) => {
        set((state) => {
          const updatedRequests = state.requests.map((req) =>
            req.id === requestId
              ? {
                  ...req,
                  status: "claimed" as RequestStatus,
                  claimedBy: {
                    id: userId,
                    name: userName,
                    email: "",
                  },
                }
              : req
          );

          return { requests: updatedRequests };
        });

        // Create notification for claimed request
        const request = get().requests.find((r) => r.id === requestId);
        if (request) {
          const notification: Notification = {
            id: Date.now().toString(),
            type: "request_claimed",
            requestId: request.id,
            message: `${userName} claimed your ${request.type} request`,
            read: false,
            createdAt: new Date().toISOString(),
          };

          get().addNotification(notification);

          // Send push notification
          ExpoNotifications.scheduleNotificationAsync({
            content: {
              title: "Request Claimed",
              body: notification.message,
              data: { requestId: request.id },
            },
            trigger: null,
          });
        }
      },

      completeRequest: (requestId: string) => {
        set((state) => {
          const updatedRequests = state.requests.map((req) =>
            req.id === requestId
              ? {
                  ...req,
                  status: "completed" as RequestStatus,
                  completedAt: new Date().toISOString(),
                }
              : req
          );

          return { requests: updatedRequests };
        });

        // Create notification for completed request
        const request = get().requests.find((r) => r.id === requestId);
        if (request) {
          const notification: Notification = {
            id: Date.now().toString(),
            type: "request_completed",
            requestId: request.id,
            message: `${request.claimedBy?.name} completed the ${request.type} request`,
            read: false,
            createdAt: new Date().toISOString(),
          };

          get().addNotification(notification);

          // Send push notification
          ExpoNotifications.scheduleNotificationAsync({
            content: {
              title: "Request Completed",
              body: notification.message,
              data: { requestId: request.id },
            },
            trigger: null,
          });
        }
      },

      updateRequestStatus: (requestId: string, status: RequestStatus) => {
        set((state) => ({
          requests: state.requests.map((req) =>
            req.id === requestId ? { ...req, status } : req
          ),
        }));
      },

      addNotification: (notification: Notification) => {
        set((state) => ({
          notifications: [notification, ...state.notifications],
        }));
      },

      markNotificationAsRead: (notificationId: string) => {
        set((state) => ({
          notifications: state.notifications.map((notif) =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          ),
        }));
      },

      getRequestsByPool: (poolId: string) => {
        return get().requests.filter((req) => req.poolId === poolId);
      },
    }),
    {
      name: "requests-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
