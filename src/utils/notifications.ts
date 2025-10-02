import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

// Configure how notifications should be handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== "granted") {
      console.warn("Failed to get push token for push notification!");
      return;
    }
    
    try {
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: "your-project-id", // This would be configured in app.json
      })).data;
    } catch (error) {
      console.warn("Error getting push token:", error);
    }
  } else {
    console.warn("Must use physical device for Push Notifications");
  }

  return token;
}

export function setupNotificationListeners(
  handleNotificationReceived: (notification: Notifications.Notification) => void,
  handleNotificationResponse: (response: Notifications.NotificationResponse) => void
) {
  const notificationListener = Notifications.addNotificationReceivedListener(handleNotificationReceived);
  const responseListener = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
}
