import React, { useEffect, useState } from 'react';
import { StatusBar, Platform, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import * as Notifications from 'expo-notifications';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import {
  addNotificationListeners,
  registerForPushNotificationsAsync,
} from './src/context/notifications';
import AuthStack from './src/navigation/AuthStack';
import MainStack from './src/navigation/MainStack';
import { navigationRef } from './src/navigation/RootNavigation';
import LoaderScreen from './src/components/LoaderScreen';
import { checkCameraAudioPermissions, requestPermissionsWithRetry } from './src/components/permissions';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const App = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <PaperProvider>
        <AuthProvider>
          <StatusBar barStyle="light-content" backgroundColor="#816ee9" />
          <AppNav />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

const AppNav = () => {
  const { isLoggedIn, token: jwt, isLoading } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [permissionStatus, setPermissionStatus] = useState({
    camera: false,
    audio: false,
    notification: false,
    requested: false,
  });

  // Request notification permission
  const requestNotificationPermission = async () => {
    try {
      const granted = await registerForPushNotificationsAsync();
      setPermissionStatus(prev => ({ ...prev, notification: !!granted }));
    } catch (error) {
      console.error("Notification permission error:", error);
    }
  };

  // Request camera/audio and notification permissions
  const handlePermissionRequest = async () => {
    try {
      const currentPermissions = await checkCameraAudioPermissions();
      let cameraAudioGranted = currentPermissions.both;

      if (!cameraAudioGranted) {
        cameraAudioGranted = await requestPermissionsWithRetry(2);
      }

      await requestNotificationPermission();

      setPermissionStatus({
        camera: cameraAudioGranted,
        audio: cameraAudioGranted,
        notification: permissionStatus.notification,
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

  // Setup notification listeners & registration
  useEffect(() => {
    if (!isLoggedIn) return;

    const listenersCleanup = addNotificationListeners({
      onReceive: (notification) => console.log("Notification received:", notification),
      onResponse: (response) => console.log("Notification tapped:", response),
    });

    // Just request permissions; no backend call yet
    registerForPushNotificationsAsync();

    return () => {
      listenersCleanup();
    };
  }, [isLoggedIn]);

  // Request permissions on app load
  useEffect(() => {
    if (isLoggedIn && !permissionStatus.requested) {
      const timer = setTimeout(() => {
        handlePermissionRequest();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, permissionStatus.requested]);

  if (isLoading) {
    return <LoaderScreen />;
  }

  return (
    <NavigationContainer ref={navigationRef} key={refreshKey}>
      {isLoggedIn ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default App;
