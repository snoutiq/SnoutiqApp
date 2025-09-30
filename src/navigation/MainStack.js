import React, { useState, useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as SplashScreen from "expo-splash-screen";

import MainTabNavigator from "./BottomTabs";
import LoginScreen from "../auth/LoginScreen";
import EditPetProfile from "../components/EditPetProfile";
import PetParentEdit from "../components/PetParentEdit";
import SettingsScreen from "../components/SettingsScreen";
import PaymentScreen from "../PetComponent/PaymentScreen";
import VideoCallBottomPopup from "../PetComponent/VideoCallBottomPopup";
import ProfileScreen from "../components/ProfileScreen";

import { socket } from "../context/Socket";

const Stack = createNativeStackNavigator();

const MainStack = () => {
  const [isReady, setIsReady] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Keep splash screen visible while loading
        await SplashScreen.preventAutoHideAsync();

        // Wait for socket connection
        if (socket && !socket.connected) {
          socket.connect();
        }

        // Simulate other initialization tasks
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setIsReady(true);
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error("❌ App initialization error:", error);
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    };

    initializeApp();

    // Cleanup socket on unmount
    return () => {
      if (socket?.connected) {
        socket.disconnect();
      }
    };
  }, []);

  // Socket connection listeners
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      setSocketConnected(true);
      console.log("🔗 Socket connected");
    };

    const handleDisconnect = () => {
      setSocketConnected(false);
      console.log("📵 Socket disconnected");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  if (!isReady) {
    return null; // Optionally show a loading indicator
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main Tab Navigator */}
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />

      {/* Modal screens */}
      <Stack.Screen
        name="PetParentEdit"
        component={PetParentEdit}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="EditPetProfile"
        component={EditPetProfile}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="PaymentScreen"
        component={PaymentScreen}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="VideoCallScreen"
        component={VideoCallBottomPopup}
        options={{ presentation: "modal" }}
      />

      {/* Regular screens */}
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
    </Stack.Navigator>
  );
};

export default MainStack;
