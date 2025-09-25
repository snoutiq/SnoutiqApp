import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar } from 'react-native';
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

const App = () => {

  useEffect(() => {
     StatusBar.setBarStyle( 'light-content',true)
  StatusBar.setBackgroundColor("#0996AE")
  }, [])
  


  return(<SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom', 'left', 'right']}>
    {/* Add StatusBar here */}
  <StatusBar
      backgroundColor='#2563EB'
      barStyle="light-content" 
      translucent={false}
    />
    <PaperProvider>
      <AuthProvider>
        <AppNav />
      </AuthProvider>
    </PaperProvider>
  </SafeAreaView>
)};

const AppNav = () => {
  const { isLoggedIn, token: jwt, isLoading } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  // Function to force refresh
  const forceRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
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