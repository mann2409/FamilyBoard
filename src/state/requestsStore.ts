import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FamilyRequest, Notification, RequestStatus } from "../types/family";
import * as ExpoNotifications from "expo-notifications";
import * as Calendar from "expo-calendar";
import { useGamificationStore } from "./gamificationStore";

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

        // Award gamification points for posting
        useGamificationStore.getState().postTask(request.postedBy.id, request.poolId);

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

      claimRequest: async (requestId: string, userId: string, userName: string) => {
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
          // Award gamification points for claiming
          useGamificationStore.getState().claimTask(userId, request.poolId, new Date(request.createdAt));
          
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

          // Create calendar event for the claimer
          try {
            const { status } = await Calendar.requestCalendarPermissionsAsync();
            if (status === "granted") {
              const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
              const defaultCalendar = calendars.find(cal => cal.isPrimary) || calendars[0];
              
              if (defaultCalendar) {
                const eventDate = new Date(request.dateTime);
                const endDate = new Date(eventDate.getTime() + 60 * 60 * 1000); // 1 hour duration

                await Calendar.createEventAsync(defaultCalendar.id, {
                  title: `${request.type.charAt(0).toUpperCase() + request.type.slice(1)}: ${request.title}`,
                  startDate: eventDate,
                  endDate: endDate,
                  location: request.location || undefined,
                  notes: request.description || undefined,
                  alarms: [
                    { relativeOffset: -60 }, // 1 hour before
                    { relativeOffset: -1440 }, // 1 day before
                  ],
                });
              }
            }
          } catch (error) {
            console.log("Error creating calendar event:", error);
          }

          // Schedule reminder notifications
          const eventDate = new Date(request.dateTime);
          const now = new Date();

          // 1 day before notification
          const oneDayBefore = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000);
          if (oneDayBefore > now) {
            const secondsUntil = Math.floor((oneDayBefore.getTime() - now.getTime()) / 1000);
            ExpoNotifications.scheduleNotificationAsync({
              content: {
                title: "Tomorrow's Task",
                body: `${request.title} is scheduled for tomorrow`,
                data: { requestId: request.id },
              },
              trigger: {
                type: ExpoNotifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: secondsUntil,
                repeats: false,
              },
            });
          }

          // 1 hour before notification
          const oneHourBefore = new Date(eventDate.getTime() - 60 * 60 * 1000);
          if (oneHourBefore > now) {
            const secondsUntil = Math.floor((oneHourBefore.getTime() - now.getTime()) / 1000);
            ExpoNotifications.scheduleNotificationAsync({
              content: {
                title: "Upcoming Task",
                body: `${request.title} starts in 1 hour`,
                data: { requestId: request.id },
              },
              trigger: {
                type: ExpoNotifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: secondsUntil,
                repeats: false,
              },
            });
          }
        }
      },

      completeRequest: (requestId: string) => {
        const request = get().requests.find((r) => r.id === requestId);
        const completedTime = new Date();
        
        set((state) => {
          const updatedRequests = state.requests.map((req) =>
            req.id === requestId
              ? {
                  ...req,
                  status: "completed" as RequestStatus,
                  completedAt: completedTime.toISOString(),
                }
              : req
          );

          return { requests: updatedRequests };
        });

        // Create notification for completed request
        if (request && request.claimedBy) {
          // Award gamification points for completing
          const taskTime = new Date(request.dateTime);
          const isEarly = completedTime < taskTime;
          useGamificationStore.getState().completeTask(request.claimedBy.id, request.poolId, completedTime, isEarly);
          
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
