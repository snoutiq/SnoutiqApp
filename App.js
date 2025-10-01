import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, Platform } from 'react-native';
import { PaperProvider } from 'react-native-paper';

import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import {
  addNotificationListeners,
  registerForPushNotificationsAsync,
} from './src/context/notifications';
import AppDrawer from './src/navigation/AppDrawer';
import AuthStack from './src/navigation/AuthStack';
import { navigationRef } from './src/navigation/RootNavigation';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { enableScreens } from 'react-native-screens';
import { requestPermissionsWithRetry, checkCameraAudioPermissions } from './src/components/permissions';
enableScreens();

const App = () => (
  <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom', 'left', 'right']}>
    {/* Add StatusBar here */}
    <StatusBar
      barStyle="light-content" // Light text/icons for dark background
      backgroundColor="#2563EB" // Your hex color
    />
    <PaperProvider>
      <AuthProvider>
        <AppNav />
      </AuthProvider>
    </PaperProvider>
  </SafeAreaView>
);

const AppNav = () => {
  const { isLoggedIn, token: jwt, isLoading } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [permissionStatus, setPermissionStatus] = useState({
    requested: false,
    granted: false,
  });

  // Function to force refresh
  const forceRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  // Enhanced permission request
  const handlePermissionRequest = async () => {
    try {
      console.log("Starting permission request...");
      
      // First check if permissions are already granted
      const currentPermissions = await checkCameraAudioPermissions();
      console.log("Current permission status:", currentPermissions);
      
      if (currentPermissions.both) {
        console.log("Permissions already granted");
        setPermissionStatus({
          requested: true,
          granted: true,
        });
        return;
      }

      // Request permissions with retry mechanism
      const granted = await requestPermissionsWithRetry(2);
      
      setPermissionStatus({
        requested: true,
        granted: granted,
      });
      
      if (granted) {
        console.log("Permissions successfully granted");
      } else {
        console.log("Permissions denied by user");
      }
      
    } catch (error) {
      console.error("Permission handling error:", error);
      setPermissionStatus({
        requested: true,
        granted: false,
      });
    }
  };

  useEffect(() => {
    if (!isLoggedIn || !jwt) return;

    const setupNotifications = async () => {
      try {
        await registerForPushNotificationsAsync(jwt);
      } catch (error) {
        console.error('Failed to set up push notifications:', error);
      }
    };

    const notificationListeners = addNotificationListeners({
      onReceive: (notification) => {
        console.log('नया नोटिफिकेशन प्राप्त हुआ:', notification);
      },
      onResponse: (response) => {
        console.log('यूजर ने नोटिफिकेशन टैप किया:', response);
      }
    });

    setupNotifications();

    return () => {
      notificationListeners();
    };
  }, [isLoggedIn, jwt]);

  // Request permissions when app loads and user is logged in
  useEffect(() => {
    if (isLoggedIn && !permissionStatus.requested) {
      // Add a small delay to ensure UI is ready
      const timer = setTimeout(() => {
        handlePermissionRequest();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, permissionStatus.requested]);

  // Periodic permission check (every 30 seconds when app is active)
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(async () => {
      try {
        const currentPermissions = await checkCameraAudioPermissions();
        if (currentPermissions.both !== permissionStatus.granted) {
          setPermissionStatus(prev => ({
            ...prev,
            granted: currentPermissions.both,
          }));
        }
      } catch (error) {
        console.error("Permission check interval error:", error);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [isLoggedIn, permissionStatus.granted]);

  if (isLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        edges={['top', 'bottom', 'left', 'right']}
      >
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      key={refreshKey}
    >
      {isLoggedIn ? <AppDrawer forceRefresh={forceRefresh} /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default App;