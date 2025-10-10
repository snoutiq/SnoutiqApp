import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import axios from 'axios';
import * as Location from 'expo-location';
import { useNavigation } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useAuth } from '../context/AuthContext';

// Configure WebBrowser for auth session
WebBrowser.maybeCompleteAuthSession();

// Colors configuration
const colors = {
  primary: '#2563EB',
  secondary: '#4ECDC4',
  accent: '#FFD93D',
  background: '#F8F9FA',
  white: '#FFFFFF',
  black: '#2C3E50',
  darkGray: '#34495E',
  lightGray: '#ECF0F1',
  borderGray: '#DADCE0',
  textGray: '#7F8C8D',
  success: '#2ECC71',
  error: '#E74C3C',
  warning: '#F39C12',
};

// Google Sign-In Configuration
const GOOGLE_SIGN_IN_CONFIG = {
  webClientId: '325007826401-dhsrqhkpoeeei12gep3g1sneeg5880o7.apps.googleusercontent.com',
  offlineAccess: true,
  forceCodeForRefreshToken: true,
};

// API configuration
const API_CONFIG = {
  baseURL: 'https://snoutiq.com/backend/api',
  endpoints: {
    initialRegister: '/auth/initial-register',
    login: '/auth/login',
  },
  timeout: 15000,
};

// Configure axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

const SignUpScreen = () => {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [userType] = useState('pet_owner'); // Default to pet_owner, vet removed
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [errors] = useState({});
  const [userId, setUserId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isGoogleConfigured, setIsGoogleConfigured] = useState(false);

  useEffect(() => {
    const configureGoogleSignIn = async () => {
      try {
        console.log('🔧 Configuring Google Sign-In...');
        GoogleSignin.configure(GOOGLE_SIGN_IN_CONFIG);
        await GoogleSignin.hasPlayServices();
        setIsGoogleConfigured(true);
        console.log('✅ Google Sign-In configured successfully');
      } catch (error) {
        console.error('❌ Google Sign-In configuration failed:', error);
        setIsGoogleConfigured(false);
        setTimeout(() => {
          GoogleSignin.configure(GOOGLE_SIGN_IN_CONFIG);
        }, 1000);
      }
    };
    configureGoogleSignIn();
  }, []);

  useEffect(() => {
    if (selectedGoogleAccount?.email && selectedGoogleAccount?.google_token && userId) {
      const dataToStore = [
        ['userEmail', selectedGoogleAccount.email],
        ['googleSub', selectedGoogleAccount.google_token],
        ['userId', userId.toString()],
      ];
      if (userLocation) {
        dataToStore.push(
          ['userLatitude', userLocation.latitude.toString()],
          ['userLongitude', userLocation.longitude.toString()]
        );
      }
      AsyncStorage.multiSet(dataToStore).catch((err) =>
        console.error('Failed to save user data:', err)
      );
    }
  }, [selectedGoogleAccount, userId, userLocation]);

  const requestLocationPermission = async (retryCount = 0) => {
    try {
      setLocationLoading(true);
      setLocationError(null);
      console.log('🌍 Requesting location permission...');
      const serviceEnabled = await Location.hasServicesEnabledAsync();
      if (!serviceEnabled) {
        setLocationError('Location services are disabled');
        return null;
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied');
        return null;
      }
      console.log('✅ Location permission granted');
      console.log('📍 Getting current location...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
        maximumAge: 60000,
      });
      const coordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
      };
      console.log('📍 Current Location Coordinates:', coordinates);
      setUserLocation(coordinates);
      setLocationError(null);
      return coordinates;
    } catch (error) {
      console.error('❌ Location permission/retrieval error:', error);
      let errorMessage = 'Unable to get your location';
      if (error.code === 'CANCELLED') errorMessage = 'Location request cancelled';
      else if (error.code === 'UNAVAILABLE') errorMessage = 'Location service unavailable';
      setLocationError(errorMessage);
      if (retryCount < 2 && error.code !== 'CANCELLED') {
        return new Promise((resolve) => {
          Alert.alert(
            'Location Error',
            'Unable to get your location. Would you like to try again?',
            [
              { text: 'Skip', style: 'cancel', onPress: () => resolve(null) },
              {
                text: 'Retry',
                onPress: async () => resolve(await requestLocationPermission(retryCount + 1)),
              },
            ]
          );
        });
      }
      return null;
    } finally {
      setLocationLoading(false);
    }
  };

  const handleApiError = (error, context) => {
    console.error(`API Error in ${context}:`, error);
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || `Server error (${status})`;
      switch (status) {
        case 400:
          return `Bad request: ${message}`;
        case 401:
          return 'Authentication failed. Please try signing in again.';
        case 403:
          return 'Access denied. Please check your permissions.';
        case 404:
          return 'Service not found. Please try again later.';
        case 409:
          return 'Account already exists. Please try logging in.';
        case 500:
          return 'Server error. Please try again later.';
        case 503:
          return 'Service temporarily unavailable. Please try again later.';
        default:
          return message;
      }
    } else if (error.request) {
      return 'Network connection failed. Please check your internet connection.';
    } else {
      return error.message || 'An unexpected error occurred. Please try again.';
    }
  };

  const ensureGoogleConfigured = async () => {
    try {
      if (!isGoogleConfigured) {
        console.log('🔄 Reconfiguring Google Sign-In...');
        GoogleSignin.configure(GOOGLE_SIGN_IN_CONFIG);
        await GoogleSignin.hasPlayServices();
        setIsGoogleConfigured(true);
      }
      return true;
    } catch (error) {
      console.error('❌ Google Sign-In configuration check failed:', error);
      return false;
    }
  };

  // const handleGoogleSuccess = async (idToken) => {
  //   try {
  //     setLoading(true);
  //     if (!idToken || typeof idToken !== 'string') throw new Error('Invalid authentication token');
  //     console.log('Google OAuth success, ID Token received');
  //     const locationData = await requestLocationPermission();
  //     let googleData;
  //     try {
  //       const base64Url = idToken.split('.')[1];
  //       const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  //       const jsonPayload = decodeURIComponent(
  //         atob(base64)
  //           .split('')
  //           .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
  //           .join('')
  //       );
  //       googleData = JSON.parse(jsonPayload);
  //       console.log('Google user data decoded:', googleData);
  //     } catch (decodeError) {
  //       throw new Error('Failed to decode authentication token');
  //     }
  //     if (!googleData.sub || !googleData.email) throw new Error('Invalid Google authentication data');
  //     const registrationData = {
  //       fullName: googleData.name,
  //       email: googleData.email,
  //       google_token: googleData.sub,
  //     };
  //     if (locationData) {
  //       registrationData.latitude = locationData.latitude;
  //       registrationData.longitude = locationData.longitude;
  //       console.log('📍 Including location in registration');
  //     }
  //     const initialRegisterResponse = await apiClient.post(API_CONFIG.endpoints.initialRegister, registrationData);
  //     console.log('Initial register response:', initialRegisterResponse.data);
  //     if (initialRegisterResponse.data.status === 'error')
  //       throw new Error(initialRegisterResponse.data.message || 'Initial registration failed');
  //     const userId = initialRegisterResponse.data.user_id;
  //     const account = {
  //       idToken,
  //       email: googleData.email,
  //       name: googleData.name,
  //       avatar: googleData.picture,
  //       google_token: googleData.sub,
  //     };
  //     setSelectedGoogleAccount(account);
  //     setUserId(userId);
  //     const dataToStore = [
  //       ['userEmail', googleData.email],
  //       ['googleSub', googleData.sub],
  //       ['userId', userId.toString()],
  //     ];
  //     if (locationData) {
  //       dataToStore.push(
  //         ['userLatitude', locationData.latitude.toString()],
  //         ['userLongitude', locationData.longitude.toString()]
  //       );
  //     }
  //     await AsyncStorage.multiSet(dataToStore);
  //     console.log('✅ User data saved to AsyncStorage');
  //     try {
  //       const loginResponse = await apiClient.post(API_CONFIG.endpoints.login, {
  //         login: googleData.email,
  //         role: 'pet',
  //       });
  //       console.log('Login response received');
  //       const loginData = loginResponse.data || {};
  //       const user = loginData.user || loginData.data?.user || loginData.data;
  //       const token = loginData.token || loginData.accessToken || loginData.data?.token;
  //       const chatRoomToken = loginData.chat_room?.token || loginData.sessionToken || loginData.data?.SessionToken;
  //       if (user && token) {
  //         await login(user, token, chatRoomToken);
  //         Alert.alert('Success', '✅ Registration & Login successful!');
  //       } else {
  //         console.warn('Login successful but incomplete data, redirecting to login screen');
  //         Alert.alert('Success', 'Registration successful! Please login with your credentials.');
  //         navigation.navigate('Login');
  //       }
  //     } catch (loginError) {
  //       console.warn('Login API error, redirecting to login screen:', loginError.message);
  //       Alert.alert('Success', 'Registration successful! Please login with your credentials.');
  //       navigation.navigate('Login');
  //     }
  //   } catch (error) {
  //     const errorMessage = handleApiError(error, 'Google registration');
  //     console.error('Google registration failed:', error);
  //     Alert.alert('Registration Error', errorMessage);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  
const handleGoogleSuccess = async (idToken) => {
  try {
    setLoading(true);

    if (!idToken || typeof idToken !== 'string') {
      throw new Error('Invalid authentication token');
    }

    console.log('Google OAuth success, ID Token received');

    // Get location
    const locationData = await requestLocationPermission();

    // Decode Google token
    let googleData;
    try {
      const base64Url = idToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      googleData = JSON.parse(jsonPayload);
      console.log('✅ Google user data decoded:', googleData.email);
    } catch (decodeError) {
      throw new Error('Failed to decode authentication token');
    }

    if (!googleData.sub || !googleData.email) {
      throw new Error('Invalid Google authentication data');
    }

    // Prepare registration data
    const registrationData = {
      fullName: googleData.name,
      email: googleData.email,
      google_token: googleData.sub,
    };

    if (locationData) {
      registrationData.latitude = locationData.latitude;
      registrationData.longitude = locationData.longitude;
    }

    // Call initial register endpoint
    console.log('📝 Calling initial-register...');
    const initialRegisterResponse = await apiClient.post(
      API_CONFIG.endpoints.initialRegister,
      registrationData
    );

    console.log('✅ Initial register response:', initialRegisterResponse.data);

    if (initialRegisterResponse.data.status === 'error') {
      throw new Error(
        initialRegisterResponse.data.message || 'Initial registration failed'
      );
    }

    const userId = initialRegisterResponse.data.user_id;

    // Store registration data temporarily
    const dataToStore = [
      ['userEmail', googleData.email],
      ['googleSub', googleData.sub],
      ['userId', userId.toString()],
    ];

    if (locationData) {
      dataToStore.push(
        ['userLatitude', locationData.latitude.toString()],
        ['userLongitude', locationData.longitude.toString()]
      );
    }

    await AsyncStorage.multiSet(dataToStore);
    console.log('✅ Temporary user data saved');

    // Try automatic login
    try {
      console.log('🔄 Attempting auto-login...');
      const loginResponse = await apiClient.post(
        API_CONFIG.endpoints.login,
        {
          login: googleData.email,
          role: 'pet',
        }
      );

      const loginData = loginResponse.data || {};
      const user = loginData.user || loginData.data?.user;
      const token = loginData.token || loginData.accessToken;
      const chatRoomToken =
        loginData.chat_room?.token ||
        loginData.sessionToken ||
        loginData.data?.SessionToken;

      if (user && token) {
        console.log('✅ Auto-login successful');
        await login(user, token, chatRoomToken);

        // Mark profile as incomplete (pet details not filled yet)
        const profileKey = user?.id ? `profileCompleted:${user.id}` : null;
        if (profileKey) {
          await AsyncStorage.setItem(profileKey, 'false');
        }

        // Navigate to home - modal will show there
        navigation.navigate('HomePage');
        Alert.alert('Success', '✅ Registration & Login successful!');
      } else {
        throw new Error('Incomplete login response');
      }
    } catch (loginError) {
      console.warn('⚠️ Auto-login failed:', loginError.message);
      Alert.alert(
        'Registration Complete',
        'Your account is ready! Please login with your credentials.'
      );
      navigation.navigate('Login');
    }
  } catch (error) {
    const errorMessage = handleApiError(error, 'Google registration');
    console.error('❌ Google registration failed:', error);
    Alert.alert('Registration Error', errorMessage);
  } finally {
    setLoading(false);
  }
};


  const startSignInFlow = async () => {
    try {
      const isConfigured = await ensureGoogleConfigured();
      if (!isConfigured) throw new Error('Google Sign-In service is not available. Please try again.');
      await GoogleSignin.hasPlayServices();
      const signInResponse = await GoogleSignin.signIn();
      if (signInResponse.type === 'success') {
        console.log('✅ Google Sign-In Successful');
        await handleGoogleSuccess(signInResponse.data.idToken);
      } else if (signInResponse.type === 'cancelled') {
        console.log('Google Sign-In was cancelled by user');
        Alert.alert('Cancelled', 'You cancelled the sign-in process.');
      }
    } catch (error) {
      if (error.code === 'SIGN_IN_CANCELLED') {
        console.log('Google Sign-In was cancelled by user');
        Alert.alert('Cancelled', 'You cancelled the sign-in process.');
        return;
      } else if (error.code === 'IN_PROGRESS') {
        Alert.alert('Sign-In in Progress', 'Please wait for the current sign-in attempt to complete.');
        return;
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        Alert.alert(
          'Google Play Services Required',
          'Google Play Services is not available. Please install it from the Play Store.'
        );
        return;
      }
      const errorMessage = handleApiError(error, 'Google Sign-In');
      console.error('❌ Main Google Sign-In Error:', error);
      Alert.alert('Sign-In Error', errorMessage);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('login');
  };

  const handleRetryLocation = async () => {
    setLocationError(null);
    await requestLocationPermission();
  };

  return (
    <ImageBackground
      source={require('../assets/girlHandlingDog.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            style={styles.logoImage}
            source={require('../assets/snoutiqBlueLogo.png')}
            resizeMode="contain"
          />
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.registerTxt}>Sign Up</Text>
          <Text style={styles.smallText}>Please register to continue</Text>
          <View style={styles.googleButtonContainer}>
            <TouchableOpacity
              style={[styles.googleButton, loading && styles.googleButtonDisabled]}
              onPress={startSignInFlow}
              disabled={loading || !isGoogleConfigured}
            >
              <Image
                source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
                style={styles.googleIcon}
              />
              {loading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.googleButtonText}>Sign up with Google</Text>
              )}
            </TouchableOpacity>
            {!isGoogleConfigured && (
              <Text style={styles.configWarning}>Google Sign-In initializing...</Text>
            )}
            {locationError && !locationLoading && (
              <TouchableOpacity style={styles.retryButton} onPress={handleRetryLocation}>
                <Text style={styles.retryButtonText}>Retry Location</Text>
              </TouchableOpacity>
            )}
            {locationLoading && (
              <View style={styles.locationLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.locationText}>Getting your location...</Text>
              </View>
            )}
            {locationError && (
              <Text style={styles.locationErrorText}>📍 Location unavailable: {locationError}</Text>
            )}
            {userLocation && (
              <Text style={styles.locationSuccessText}>
                📍 Location: {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
              </Text>
            )}
            <TouchableOpacity style={styles.backToLoginContainer} onPress={handleBackToLogin}>
              <Text style={styles.backToLoginText}>
                Already have an account? <Text style={styles.backToLoginLink}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
  },
  logoContainer: {
    padding: moderateScale(20),
    alignItems: 'flex-start',
  },
  logoImage: {
    width: scale(140),
    height: verticalScale(50),
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
  },
  registerTxt: {
    fontSize: moderateScale(32),
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: verticalScale(8),
  },
  smallText: {
    fontSize: moderateScale(16),
    fontWeight: '400',
    color: colors.textGray,
    marginBottom: verticalScale(20),
  },
  googleButtonContainer: {
    alignItems: 'center',
    width: '100%',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(20),
    width: '80%',
    maxWidth: scale(300),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleIcon: {
    width: moderateScale(24),
    height: moderateScale(24),
    marginRight: scale(12),
  },
  googleButtonText: {
    color: '#3C4043', // Google-recommended text color
    fontSize: moderateScale(16),
    fontWeight: '500',
    fontFamily: 'Roboto', // Google-recommended font (ensure it's available or fallback to default)
  },
  configWarning: {
    fontSize: moderateScale(12),
    color: colors.warning,
    marginTop: verticalScale(12),
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.secondary,
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(20),
    borderRadius: moderateScale(8),
    marginTop: verticalScale(12),
  },
  retryButtonText: {
    color: colors.white,
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  locationLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(12),
    backgroundColor: colors.lightGray,
    borderRadius: moderateScale(8),
    marginTop: verticalScale(12),
  },
  locationText: {
    fontSize: moderateScale(12),
    fontWeight: '500',
    marginLeft: moderateScale(8),
    color: colors.darkGray,
  },
  locationErrorText: {
    fontSize: moderateScale(12),
    color: colors.error,
    marginTop: verticalScale(12),
    textAlign: 'center',
  },
  locationSuccessText: {
    fontSize: moderateScale(12),
    color: colors.success,
    marginTop: verticalScale(12),
    textAlign: 'center',
  },
  backToLoginContainer: {
    marginTop: verticalScale(20),
  },
  backToLoginText: {
    fontSize: moderateScale(14),
    color: colors.textGray,
  },
  backToLoginLink: {
    fontWeight: '600',
    color: colors.primary,
  },
});