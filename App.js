import React, { useEffect, useState } from "react";
import { StatusBar, Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DefaultTheme, Provider as PaperProvider } from "react-native-paper";
import * as Notifications from "expo-notifications";
import * as Updates from "expo-updates";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import {
  registerForPushNotificationsAsync,
  addNotificationListeners,
} from "./src/context/notifications";
import {
  checkCameraAudioPermissions,
  requestPermissionsWithRetry,
} from "./src/components/permissions";
import AuthStack from "./src/navigation/AuthStack";
import MainStack from "./src/navigation/MainStack";
import LoaderScreen from "./src/components/LoaderScreen";
import { navigationRef } from "./src/navigation/RootNavigation";

// ------------------- Notification Settings -------------------
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ------------------- Paper Theme -------------------
const theme = {
  ...DefaultTheme,
  fonts: {
    regular: { fontFamily: "Roboto_400Regular" },
    medium: { fontFamily: "Roboto_500Medium" },
    light: { fontFamily: "Roboto_300Light" },
    thin: { fontFamily: "Roboto_100Thin" },
  },
};

// ------------------- OTA Update Checker with Alert -------------------
const checkForOTAUpdate = async () => {
  try {
    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      Alert.alert(
        "Update Available",
        "A new version of SnoutIQ is ready. Restart now?",
        [
          { text: "Later", style: "cancel" },
          {
            text: "Restart",
            onPress: async () => {
              try {
                await Updates.fetchUpdateAsync();
                await Updates.reloadAsync();
              } catch (err) {
                console.log("Error applying OTA update:", err);
              }
            },
          },
        ]
      );
    } else {
      console.log("✅ App is up to date.");
    }
  } catch (error) {
    console.log("OTA update error:", error);
  }
};

// ------------------- App Navigation -------------------
const AppNav = () => {
  const { isLoggedIn, isLoading } = useAuth();
  const [permissionStatus, setPermissionStatus] = useState({
    camera: false,
    audio: false,
    notification: false,
    requested: false,
  });

  // --- Check OTA updates once at launch ---
  useEffect(() => {
    checkForOTAUpdate();
  }, []);

  // --- Request notification permissions ---
  const requestNotificationPermission = async () => {
    try {
      const granted = await registerForPushNotificationsAsync();
      setPermissionStatus((prev) => ({ ...prev, notification: !!granted }));
      return granted;
    } catch (error) {
      console.error("Notification permission error:", error);
      return false;
    }
  };

  // --- Handle camera + mic + notification permissions ---
  const handlePermissionRequest = async () => {
    try {
      const currentPermissions = await checkCameraAudioPermissions();
      let cameraAudioGranted = currentPermissions.both;

      if (!cameraAudioGranted) {
        cameraAudioGranted = await requestPermissionsWithRetry(2);
      }

      const notificationGranted = await requestNotificationPermission();

      setPermissionStatus({
        camera: cameraAudioGranted,
        audio: cameraAudioGranted,
        notification: notificationGranted,
        requested: true,
      });
    } catch (error) {
      console.error("Permission handling error:", error);
      setPermissionStatus({
        camera: false,
        audio: false,
        notification: false,
        requested: true,
      });
    }
  };

  // --- Notification listeners ---
  useEffect(() => {
    if (!isLoggedIn) return;
    const cleanup = addNotificationListeners({
      onReceive: (notification) =>
        console.log("📩 Notification received:", notification),
      onResponse: (response) =>
        console.log("👆 Notification tapped:", response),
    });

    return () => cleanup();
  }, [isLoggedIn]);

  // --- Ask for permissions after login ---
  useEffect(() => {
    if (isLoggedIn && !permissionStatus.requested) {
      const timer = setTimeout(() => {
        handlePermissionRequest();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, permissionStatus.requested]);

  if (isLoading) return <LoaderScreen />;

  return (
    <NavigationContainer ref={navigationRef}>
      {isLoggedIn ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

// ------------------- Root Component -------------------
const App = () => (
  <PaperProvider theme={theme}>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar barStyle="light-content" backgroundColor="#816ee9" />
          <AppNav />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  </PaperProvider>
);

export default App;
