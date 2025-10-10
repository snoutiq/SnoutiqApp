import { Platform, Alert } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

// Notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const registerForPushNotificationsAsync = async () => {
  try {
    if (!Device.isDevice) {
      Alert.alert("Push notifications require a physical device.");
      return null;
    }

    // Request notification permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      Alert.alert(
        "Notification Permission",
        "Please enable notifications in settings to receive important updates."
      );
      return null;
    }

    // Just log the Expo token for now (no backend call)
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants?.expoConfig?.extra?.eas?.projectId,
    });

    return token.data;
  } catch (error) {
    console.error("Error registering for notifications:", error);
    return null;
  }
};

// Add listeners for notification events
export const addNotificationListeners = ({ onReceive, onResponse }) => {
  const recvSub = Notifications.addNotificationReceivedListener(onReceive);
  const respSub = Notifications.addNotificationResponseReceivedListener(onResponse);

  return () => {
    recvSub?.remove?.();
    respSub?.remove?.();
  };
};
