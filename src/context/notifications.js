import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import axios from 'axios';
import { navigate } from '../navigation/RootNavigation';

// Notification behavior (foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const ServerURL = Constants.expoConfig.extra.serverUrl;

// 👉 Register for push notifications and send token to backend
export const registerForPushNotificationsAsync = async (userToken) => {
  try {
    // Android 13+ requires runtime permission for notifications
    if (Platform.OS === 'android' && parseInt(Device.osVersion) >= 13) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Notification permission not granted (Android 13+)');
      }
    }

    // iOS or older Android versions
    const { status: finalStatus } = await Notifications.getPermissionsAsync();
    if (finalStatus !== 'granted') {
      const { status: askedStatus } = await Notifications.requestPermissionsAsync();
      if (askedStatus !== 'granted') {
        throw new Error('Permission not granted');
      }
    }

    // Get Expo push token
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const expoPushToken = tokenData.data;
    console.log('Expo Push Token:', expoPushToken);

    // Save token on backend
    const response = await axios.post(`${ServerURL}auth/expo-token`, {
      token: expoPushToken,
    }, {
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Token registration response:', response.data);
    return response.data;

  } catch (error) {
    console.error('Error registering push token:', error);
    if (error.response) {
      console.error('Server responded with:', error.response.data);
    }
  }
};

// 👉 Add listeners for receiving and responding to notifications
export const addNotificationListeners = ({ onReceive, onResponse }) => {
  const recvSub = Notifications.addNotificationReceivedListener(onReceive);

  const respSub = Notifications.addNotificationResponseReceivedListener((resp) => {
    if (onResponse) onResponse(resp);

    // Optional: Navigate to screen if notification has deep link data
    const { screen, params } = resp.notification.request.content.data || {};
    if (screen) navigate(screen, params);
  });

  return () => {
    try { recvSub?.remove?.(); } catch (e) { console.warn('recvSub cleanup error:', e); }
    try { respSub?.remove?.(); } catch (e) { console.warn('respSub cleanup error:', e); }
  };
};
