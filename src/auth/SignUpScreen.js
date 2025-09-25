// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { GoogleSignin } from '@react-native-google-signin/google-signin';
// import axios from "axios";
// import * as Location from 'expo-location';
// import { useNavigation } from 'expo-router';
// import * as WebBrowser from 'expo-web-browser';
// import { useEffect, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   Image,
//   SafeAreaView,
//   ScrollView,
//   Text,
//   TouchableOpacity,
//   View
// } from 'react-native';
// import {
//   moderateScale,
//   scale,
//   ScaledSheet,
//   verticalScale
// } from 'react-native-size-matters';
// import { useAuth } from "../context/AuthContext";

// // Configure WebBrowser for auth session
// WebBrowser.maybeCompleteAuthSession();

// // Colors configuration
// const colors = {
//   primary: '#2563EB',
//   secondary: '#4ECDC4',
//   accent: '#FFD93D',
//   background: '#F8F9FA',
//   white: '#FFFFFF',
//   black: '#2C3E50',
//   darkGray: '#34495E',
//   lightGray: '#ECF0F1',
//   borderGray: '#BDC3C7',
//   textGray: '#7F8C8D',
//   success: '#2ECC71',
//   error: '#E74C3C',
//   warning: '#F39C12'
// };

// // Google Sign-In Configuration
// const GOOGLE_SIGN_IN_CONFIG = {
//   webClientId: '325007826401-dhsrqhkpoeeei12gep3g1sneeg5880o7.apps.googleusercontent.com', // Replace with your actual web client ID
//   offlineAccess: true,
//   forceCodeForRefreshToken: true,
// };

// // Initialize Google Sign-In
// GoogleSignin.configure(GOOGLE_SIGN_IN_CONFIG);

// // Shadows configuration
// const shadows = {
//   small: {
//     shadowColor: colors.black,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   medium: {
//     shadowColor: colors.black,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   large: {
//     shadowColor: colors.black,
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.2,
//     shadowRadius: 16,
//     elevation: 12,
//   }
// };

// // API configuration
// const API_CONFIG = {
//   baseURL: 'https://snoutiq.com/backend/api',
//   endpoints: {
//     initialRegister: '/auth/initial-register',
//     login: '/auth/login'
//   },
//   timeout: 15000
// };

// // Configure axios instance
// const apiClient = axios.create({
//   baseURL: API_CONFIG.baseURL,
//   timeout: API_CONFIG.timeout,
//   headers: {
//     'Content-Type': 'application/json',
//   }
// });

// // Google Sign-In Button Component
// const GoogleSignInButton = ({ onPress, loading = false, disabled = false }) => {
//   return (
//     <TouchableOpacity 
//       style={[
//         styles.googleButton, 
//         (loading || disabled) && styles.googleButtonDisabled
//       ]} 
//       onPress={onPress}
//       disabled={loading || disabled}
//       activeOpacity={0.8}
//     >
//       {/* Google Logo */}
//       <View style={styles.googleLogoContainer}>
//         <Image 
//           source={{ 
//             uri: 'https://developers.google.com/identity/images/g-logo.png' 
//           }}
//           style={styles.googleLogo}
//           resizeMode="contain"
//         />
//       </View>
      
//       {/* Button Text */}
//       <Text style={[
//         styles.googleButtonText,
//         (loading || disabled) && styles.googleButtonTextDisabled
//       ]}>
//         {loading ? 'Signing up...' : 'Register with Google'}
//       </Text>
      
//       {loading && (
//         <ActivityIndicator 
//           size="small" 
//           color={colors.textGray} 
//           style={styles.googleButtonLoader}
//         />
//       )}
//     </TouchableOpacity>
//   );
// };

// // Custom Button Component
// const CustomButton = ({ title, onPress, loading = false, style, variant = 'primary', disabled = false }) => (
//   <TouchableOpacity 
//     style={[
//       styles.button, 
//       variant === 'secondary' && styles.secondaryButton,
//       disabled && styles.disabledButton,
//       style
//     ]} 
//     onPress={onPress}
//     disabled={loading || disabled}
//   >
//     {loading ? (
//       <ActivityIndicator color={variant === 'secondary' ? colors.primary : colors.white} size={moderateScale(20)} />
//     ) : (
//       <Text style={[
//         styles.buttonText,
//         variant === 'secondary' && styles.secondaryButtonText,
//         disabled && styles.disabledButtonText
//       ]}>
//         {title}
//       </Text>
//     )}
//   </TouchableOpacity>
// );

// // Location Status Component
// const LocationStatus = ({ loading, location, error }) => {
//   if (loading) {
//     return (
//       <View style={[styles.locationContainer, styles.locationLoading]}>
//         <ActivityIndicator size="small" color={colors.primary} />
//         <Text style={styles.locationText}>Getting your location...</Text>
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={[styles.locationContainer, styles.locationError]}>
//         <Text style={styles.locationText}>📍 Location unavailable: {error}</Text>
//       </View>
//     );
//   }

//   if (location) {
//     return (
//       <View style={[styles.locationContainer, styles.locationSuccess]}>
//         <Text style={styles.locationText}>
//           📍 Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
//         </Text>
//       </View>
//     );
//   }

//   return null;
// };

// const SignUpScreen = () => {
//   const navigation = useNavigation();
//   const { login } = useAuth();
//   const [userType, setUserType] = useState('pet_owner');
//   const [selectedGoogleAccount, setSelectedGoogleAccount] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [locationLoading, setLocationLoading] = useState(false);
//   const [locationError, setLocationError] = useState(null);
//   const [errors, setErrors] = useState({});
//   const [userId, setUserId] = useState(null);
//   const [userLocation, setUserLocation] = useState(null);
//   const [isGoogleConfigured, setIsGoogleConfigured] = useState(false);

//   // Reconfigure Google Sign-In on component mount and when it gets reset
//   useEffect(() => {
//     const configureGoogleSignIn = async () => {
//       try {
//         console.log('🔧 Configuring Google Sign-In...');
        
//         // Check current configuration
//         const currentUser = await GoogleSignin.getCurrentUser();
//         console.log('Current Google user:', currentUser);
        
//         // Reconfigure to ensure it's properly set up
//         GoogleSignin.configure(GOOGLE_SIGN_IN_CONFIG);
        
//         // Verify configuration
//         await GoogleSignin.hasPlayServices();
//         setIsGoogleConfigured(true);
//         console.log('✅ Google Sign-In configured successfully');
        
//       } catch (error) {
//         console.error('❌ Google Sign-In configuration failed:', error);
//         setIsGoogleConfigured(false);
        
//         // Try to reconfigure on failure
//         setTimeout(() => {
//           GoogleSignin.configure(GOOGLE_SIGN_IN_CONFIG);
//         }, 1000);
//       }
//     };

//     configureGoogleSignIn();
//   }, []);

//   // Store email, google_token, userId, and location in AsyncStorage when Google account is selected
//   useEffect(() => {
//     if (selectedGoogleAccount?.email && selectedGoogleAccount?.google_token && userId) {
//       const dataToStore = [
//         ['userEmail', selectedGoogleAccount.email],
//         ['googleSub', selectedGoogleAccount.google_token],
//         ['userId', userId.toString()]
//       ];

//       // Add location data if available
//       if (userLocation) {
//         dataToStore.push(['userLatitude', userLocation.latitude.toString()]);
//         dataToStore.push(['userLongitude', userLocation.longitude.toString()]);
//       }

//       AsyncStorage.multiSet(dataToStore).catch(err => 
//         console.error("Failed to save user data:", err)
//       );
//     }
//   }, [selectedGoogleAccount, userId, userLocation]);

//   // Input validation
//   const validateInputs = () => {
//     const newErrors = {};
    
//     if (!userType) {
//       newErrors.userType = 'Please select a user type';
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // Function to request location permission and get coordinates
//   const requestLocationPermission = async (retryCount = 0) => {
//     try {
//       setLocationLoading(true);
//       setLocationError(null);
//       console.log("🌍 Requesting location permission...");
      
//       // Check if location services are enabled
//       const serviceEnabled = await Location.hasServicesEnabledAsync();
//       if (!serviceEnabled) {
//         const errorMsg = 'Location services are disabled';
//         setLocationError(errorMsg);
//         return null;
//       }

//       // Request permission
//       const { status } = await Location.requestForegroundPermissionsAsync();
      
//       if (status !== 'granted') {
//         const errorMsg = 'Location permission denied';
//         setLocationError(errorMsg);
//         return null;
//       }

//       console.log("✅ Location permission granted");

//       // Get current location
//       console.log("📍 Getting current location...");
//       const location = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.Balanced,
//         timeout: 10000,
//         maximumAge: 60000,
//       });

//       const coordinates = {
//         latitude: location.coords.latitude,
//         longitude: location.coords.longitude,
//         accuracy: location.coords.accuracy,
//         timestamp: location.timestamp
//       };

//       console.log("📍 Current Location Coordinates:", coordinates);
//       setUserLocation(coordinates);
//       setLocationError(null);
//       return coordinates;

//     } catch (error) {
//       console.error("❌ Location permission/retrieval error:", error);
      
//       let errorMessage = 'Unable to get your location';
//       if (error.code === 'CANCELLED') {
//         errorMessage = 'Location request cancelled';
//       } else if (error.code === 'UNAVAILABLE') {
//         errorMessage = 'Location service unavailable';
//       }
      
//       setLocationError(errorMessage);
      
//       // Offer retry for certain errors
//       if (retryCount < 2 && error.code !== 'CANCELLED') {
//         return new Promise((resolve) => {
//           Alert.alert(
//             'Location Error',
//             'Unable to get your location. Would you like to try again?',
//             [
//               { 
//                 text: 'Skip', 
//                 style: 'cancel',
//                 onPress: () => resolve(null)
//               },
//               { 
//                 text: 'Retry', 
//                 onPress: async () => {
//                   const result = await requestLocationPermission(retryCount + 1);
//                   resolve(result);
//                 }
//               }
//             ]
//           );
//         });
//       }
      
//       return null;
//     } finally {
//       setLocationLoading(false);
//     }
//   };

//   // Enhanced error handling function
//   const handleApiError = (error, context) => {
//     console.error(`API Error in ${context}:`, error);
    
//     if (error.response) {
//       // Server responded with error status
//       const status = error.response.status;
//       const message = error.response.data?.message || `Server error (${status})`;
      
//       switch (status) {
//         case 400:
//           return `Bad request: ${message}`;
//         case 401:
//           return 'Authentication failed. Please try signing in again.';
//         case 403:
//           return 'Access denied. Please check your permissions.';
//         case 404:
//           return 'Service not found. Please try again later.';
//         case 409:
//           return 'Account already exists. Please try logging in.';
//         case 500:
//           return 'Server error. Please try again later.';
//         case 503:
//           return 'Service temporarily unavailable. Please try again later.';
//         default:
//           return message;
//       }
//     } else if (error.request) {
//       // Network error
//       return 'Network connection failed. Please check your internet connection.';
//     } else {
//       // Other errors
//       return error.message || 'An unexpected error occurred. Please try again.';
//     }
//   };

//   // Enhanced Google Sign-In configuration check
//   const ensureGoogleConfigured = async () => {
//     try {
//       // Try to reconfigure if not configured
//       if (!isGoogleConfigured) {
//         console.log('🔄 Reconfiguring Google Sign-In...');
//         GoogleSignin.configure(GOOGLE_SIGN_IN_CONFIG);
//         await GoogleSignin.hasPlayServices();
//         setIsGoogleConfigured(true);
//       }
//       return true;
//     } catch (error) {
//       console.error('❌ Google Sign-In configuration check failed:', error);
//       return false;
//     }
//   };

//   const handleGoogleSuccess = async (idToken) => {
//     try {
//       setLoading(true);
      
//       // Validate token structure
//       if (!idToken || typeof idToken !== 'string') {
//         throw new Error('Invalid authentication token');
//       }

//       console.log("Google OAuth success, ID Token received");

//       // Request location permission and get coordinates
//       const locationData = await requestLocationPermission();

//       // Decode Google JWT to get the sub (unique ID)
//       let googleData;
//       try {
//         const base64Url = idToken.split(".")[1];
//         const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
//         const jsonPayload = decodeURIComponent(
//           atob(base64)
//             .split("")
//             .map(function (c) {
//               return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
//             })
//             .join("")
//         );

//         googleData = JSON.parse(jsonPayload);
//         console.log("Google user data decoded:", googleData);
//       } catch (decodeError) {
//         throw new Error('Failed to decode authentication token');
//       }

//       if (!googleData.sub || !googleData.email) {
//         throw new Error('Invalid Google authentication data');
//       }

//       // Prepare registration data
//       const registrationData = {
//         fullName: googleData.name,
//         email: googleData.email,
//         google_token: googleData.sub,
//       };

//       // Add location data if available
//       if (locationData) {
//         registrationData.latitude = locationData.latitude;
//         registrationData.longitude = locationData.longitude;
//         console.log("📍 Including location in registration");
//       }

//       // Call initial-register API
//       const initialRegisterResponse = await apiClient.post(
//         API_CONFIG.endpoints.initialRegister,
//         registrationData
//       );

//       console.log("Initial register response:", initialRegisterResponse.data);

//       if (initialRegisterResponse.data.status === "error") {
//         throw new Error(initialRegisterResponse.data.message || "Initial registration failed");
//       }

//       const userId = initialRegisterResponse.data.user_id;

//       const account = {
//         idToken,
//         email: googleData.email,
//         name: googleData.name,
//         avatar: googleData.picture,
//         google_token: googleData.sub
//       };

//       setSelectedGoogleAccount(account);
//       setUserId(userId);

//       // Save to AsyncStorage
//       const dataToStore = [
//         ['userEmail', googleData.email],
//         ['googleSub', googleData.sub],
//         ['userId', userId.toString()]
//       ];

//       // Add location data if available
//       if (locationData) {
//         dataToStore.push(['userLatitude', locationData.latitude.toString()]);
//         dataToStore.push(['userLongitude', locationData.longitude.toString()]);
//       }

//       await AsyncStorage.multiSet(dataToStore);

//       console.log("✅ User data saved to AsyncStorage");

//       // Attempt login
//       try {
//         const loginResponse = await apiClient.post(API_CONFIG.endpoints.login, {
//           login: googleData.email,
//           role: 'pet'
//         });

//         console.log("Login response received");

//         const loginData = loginResponse.data || {};
//         const user = loginData.user || loginData.data?.user || loginData.data;
//         const token = loginData.token || loginData.accessToken || loginData.data?.token;
//         const chatRoomToken = loginData.chat_room?.token || loginData.sessionToken || loginData.data?.SessionToken;

//         if (user && token) {
//           await login(user, token, chatRoomToken);
//           Alert.alert("Success", "✅ Registration & Login successful!");
//         } else {
//           console.warn("Login successful but incomplete data, redirecting to login screen");
//           Alert.alert("Success", "Registration successful! Please login with your credentials.");
//           navigation.navigate('Login');
//         }
//       } catch (loginError) {
//         console.warn("Login API error, redirecting to login screen:", loginError.message);
//         Alert.alert("Success", "Registration successful! Please login with your credentials.");
//         navigation.navigate('Login');
//       }
//     } catch (error) {
//       const errorMessage = handleApiError(error, 'Google registration');
//       console.error("Google registration failed:", error);
//       Alert.alert("Registration Error", errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const startSignInFlow = async () => {
//     try {
//       // Validate inputs before proceeding
//       if (!validateInputs()) {
//         return;
//       }

//       // Ensure Google Sign-In is properly configured
//       const isConfigured = await ensureGoogleConfigured();
//       if (!isConfigured) {
//         throw new Error('Google Sign-In service is not available. Please try again.');
//       }

//       // Check Play Services
//       await GoogleSignin.hasPlayServices();
      
//       // Sign in with Google
//       const signInResponse = await GoogleSignin.signIn();
      
//       if (signInResponse.type === 'success') {
//         console.log('✅ Google Sign-In Successful');
//         await handleGoogleSuccess(signInResponse.data.idToken);
//       } else if (signInResponse.type === 'noSavedCredentialFound') {
//         console.log('ℹ️ No saved credentials found');
//         const createResponse = await GoogleSignin.createAccount();
        
//         if (createResponse.type === 'success') {
//           console.log('✅ Google Account Creation Successful');
//           await handleGoogleSuccess(createResponse.data.idToken);
//         } else {
//           console.log('ℹ️ Google account creation failed or cancelled');
//           // Fall back to explicit sign-in
//           const explicitResponse = await GoogleSignin.presentExplicitSignIn();
          
//           if (explicitResponse.type === 'success') {
//             console.log('✅ Explicit Google Sign-In Successful');
//             await handleGoogleSuccess(explicitResponse.data.idToken);
//           }
//         }
//       } else {
//         console.log('ℹ️ Google Sign-In Cancelled or Failed');
//       }
//     } catch (error) {
//       // Handle specific Google Sign-In errors
//       if (error.code === 'SIGN_IN_CANCELLED') {
//         console.log('Google Sign-In was cancelled by user');
//         return;
//       } else if (error.code === 'IN_PROGRESS') {
//         Alert.alert('Sign-In in Progress', 'Please wait for the current sign-in attempt to complete.');
//         return;
//       } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
//         Alert.alert('Google Play Services Required', 'Google Play Services is not available. Please install it from the Play Store.');
//         return;
//       }
      
//       const errorMessage = handleApiError(error, 'Google Sign-In');
//       console.error('❌ Main Google Sign-In Error:', error);
//       Alert.alert("Sign-In Error", errorMessage);
//     }
//   };

//   const handleBackToLogin = () => {
//     navigation.navigate('login');
//   };

//   const handleRetryLocation = async () => {
//     setLocationError(null);
//     await requestLocationPermission();
//   };

//   // Reset Google Sign-In state when component focuses
//   useEffect(() => {
//     const unsubscribe = navigation.addListener('focus', () => {
//       // Reconfigure Google Sign-In when screen comes into focus
//       GoogleSignin.configure(GOOGLE_SIGN_IN_CONFIG);
//     });

//     return unsubscribe;
//   }, [navigation]);

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView 
//         style={styles.scrollView}
//         showsVerticalScrollIndicator={false}
//         keyboardShouldPersistTaps="handled"
//         contentContainerStyle={styles.scrollContent}
//       >
//         <View style={styles.headerSection}>
//           <View style={styles.petIllustration}>
//             <Image style={styles.logoContainer} source={require("../assets/snoutiqBlueLogo.png")} />
//           </View>
//           <Text style={styles.welcomeTitle}>Create Account</Text>
//           <Text style={styles.welcomeSubtitle}>Choose your role and connect with Google</Text>
//         </View>

//         <View style={styles.formContainer}>
//           <View style={styles.userTypeContainer}>
//             <Text style={styles.sectionTitle}>Register as a:</Text>
//             <View style={styles.toggleContainer}>
//               <TouchableOpacity
//                 style={[
//                   styles.toggleOption,
//                   userType === 'pet_owner' ? styles.activeToggle : styles.inactiveToggle
//                 ]}
//                 onPress={() => setUserType('pet_owner')}
//               >
//                 <Text style={styles.toggleIcon}>🐾</Text>
//                 <Text style={[
//                   styles.toggleText,
//                   userType === 'pet_owner' ? styles.activeToggleText : styles.inactiveToggleText
//                 ]}>
//                   Pet Owner
//                 </Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[
//                   styles.toggleOption,
//                   userType === 'vet' ? styles.activeToggle : styles.inactiveToggle
//                 ]}
//                 onPress={() => setUserType('vet')}
//               >
//                 <Text style={styles.toggleIcon}>👨‍⚕️</Text>
//                 <Text style={[
//                   styles.toggleText,
//                   userType === 'vet' ? styles.activeToggleText : styles.inactiveToggleText
//                 ]}>
//                   Veterinarian
//                 </Text>
//               </TouchableOpacity>
//             </View>
//             {errors.userType && <Text style={styles.errorText}>{errors.userType}</Text>}
//           </View>

//           {/* Location status indicator */}
//           <LocationStatus 
//             loading={locationLoading}
//             location={userLocation}
//             error={locationError}
//           />

//           {/* Location retry button */}
//           {locationError && !locationLoading && (
//             <CustomButton
//               title="Retry Location"
//               onPress={handleRetryLocation}
//               variant="secondary"
//               style={styles.retryButton}
//             />
//           )}
          
//           <View style={styles.googleButtonContainer}>
//             <GoogleSignInButton 
//               onPress={startSignInFlow}
//               loading={loading}
//               disabled={!isGoogleConfigured}
//             />
//             {!isGoogleConfigured && (
//               <Text style={styles.configWarning}>
//                 Google Sign-In initializing...
//               </Text>
//             )}
//           </View>

//           {loading && (
//             <View style={styles.loadingOverlay}>
//               <ActivityIndicator size="large" color={colors.primary} />
//               <Text style={styles.loadingText}>Setting up your account...</Text>
//             </View>
//           )}

//           <TouchableOpacity style={styles.backToLoginContainer} onPress={handleBackToLogin}>
//             <Text style={styles.backToLoginText}>
//               Already have an account? 
//               <Text style={styles.backToLoginLink}> Sign In</Text>
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = ScaledSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     flexGrow: 1,
//   },
//   logoContainer: {
//     height: verticalScale(40),
//     width: "80%",
//     borderRadius: moderateScale(20),
//     resizeMode: "contain",
//   },
//   headerSection: {
//     alignItems: 'center',
//     paddingTop: verticalScale(15),
//     paddingBottom: verticalScale(20),
//     backgroundColor: colors.primary,
//     borderBottomLeftRadius: moderateScale(30),
//     borderBottomRightRadius: moderateScale(30),
//     ...shadows.medium,
//   },
//   petIllustration: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: colors.white,
//     borderRadius: moderateScale(40),
//     paddingVertical: moderateScale(5),
//     paddingHorizontal: moderateScale(1),
//     marginTop: verticalScale(20),
//     ...shadows.small,
//   },
//   welcomeTitle: {
//     fontSize: moderateScale(20),
//     fontWeight: '700',
//     color: colors.white,
//     marginVertical: verticalScale(3),
//   },
//   welcomeSubtitle: {
//     fontSize: moderateScale(14),
//     color: colors.white,
//     opacity: 0.9,
//     textAlign: 'center',
//     paddingHorizontal: scale(20),
//   },
//   formContainer: {
//     flex: 1,
//     paddingHorizontal: scale(24),
//     paddingTop: verticalScale(18),
//   },
//   userTypeContainer: {
//     marginBottom: verticalScale(20),
//   },
//   sectionTitle: {
//     fontSize: moderateScale(16),
//     fontWeight: '600',
//     color: colors.darkGray,
//     marginBottom: verticalScale(12),
//   },
//   toggleContainer: {
//     flexDirection: 'row',
//     backgroundColor: colors.lightGray,
//     padding: moderateScale(4),
//     borderRadius: moderateScale(12),
//     ...shadows.small,
//   },
//   toggleOption: {
//     flex: 1,
//     paddingVertical: verticalScale(5),
//     borderRadius: moderateScale(10),
//     alignItems: 'center',
//     justifyContent: 'center',
//     margin: moderateScale(2),
//   },
//   activeToggle: {
//     backgroundColor: colors.primary,
//     ...shadows.small,
//   },
//   inactiveToggle: {
//     backgroundColor: 'transparent',
//   },
//   toggleIcon: {
//     fontSize: moderateScale(24),
//     marginBottom: verticalScale(4),
//   },
//   toggleText: {
//     fontSize: moderateScale(14),
//     fontWeight: '600',
//   },
//   activeToggleText: {
//     color: colors.white,
//   },
//   inactiveToggleText: {
//     color: colors.textGray,
//   },
//   locationContainer: {
//     padding: moderateScale(12),
//     borderRadius: moderateScale(8),
//     marginBottom: verticalScale(16),
//     borderLeftWidth: moderateScale(3),
//     alignItems: 'center',
//     flexDirection: 'row',
//     justifyContent: 'center',
//   },
//   locationLoading: {
//     backgroundColor: colors.lightGray,
//     borderLeftColor: colors.primary,
//   },
//   locationSuccess: {
//     backgroundColor: '#E8F8F5',
//     borderLeftColor: colors.success,
//   },
//   locationError: {
//     backgroundColor: '#FDEDEC',
//     borderLeftColor: colors.error,
//   },
//   locationText: {
//     fontSize: moderateScale(12),
//     fontWeight: '500',
//     marginLeft: moderateScale(8),
//   },
//   googleButtonContainer: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginVertical: verticalScale(16),
//   },
//   // Google Button Styles
//   googleButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: colors.white,
//     borderWidth: moderateScale(1),
//     borderColor: '#dadce0',
//     borderRadius: moderateScale(8),
//     paddingVertical: verticalScale(12),
//     paddingHorizontal: scale(20),
//     minWidth: scale(250),
//     ...shadows.small,
//   },
//   googleButtonDisabled: {
//     opacity: 0.6,
//   },
//   googleLogoContainer: {
//     marginRight: scale(12),
//     width: moderateScale(20),
//     height: moderateScale(20),
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   googleLogo: {
//     width: moderateScale(18),
//     height: moderateScale(18),
//   },
//   googleButtonText: {
//     color: '#3c4043',
//     fontSize: moderateScale(14),
//     fontWeight: '500',
//     flex: 1,
//     textAlign: 'center',
//   },
//   googleButtonTextDisabled: {
//     color: colors.textGray,
//   },
//   googleButtonLoader: {
//     marginLeft: scale(8),
//   },
//   configWarning: {
//     fontSize: moderateScale(12),
//     color: colors.warning,
//     marginTop: verticalScale(8),
//     textAlign: 'center',
//   },
//   button: {
//     backgroundColor: colors.primary,
//     paddingVertical: verticalScale(14),
//     borderRadius: moderateScale(12),
//     alignItems: 'center',
//     marginBottom: verticalScale(12),
//     ...shadows.medium,
//   },
//   secondaryButton: {
//     backgroundColor: colors.white,
//     borderWidth: moderateScale(1.5),
//     borderColor: colors.primary,
//   },
//   disabledButton: {
//     backgroundColor: colors.borderGray,
//     ...shadows.small,
//   },
//   buttonText: {
//     fontSize: moderateScale(16),
//     fontWeight: 'bold',
//     color: colors.white,
//   },
//   secondaryButtonText: {
//     color: colors.primary,
//   },
//   disabledButtonText: {
//     color: colors.textGray,
//   },
//   retryButton: {
//     marginBottom: verticalScale(16),
//   },
//   backToLoginContainer: {
//     alignItems: 'center',
//     paddingVertical: verticalScale(20),
//   },
//   backToLoginText: {
//     fontSize: moderateScale(14),
//     color: colors.textGray,
//     textAlign: 'center',
//   },
//   backToLoginLink: {
//     fontWeight: 'bold',
//     color: colors.primary,
//   },
//   errorText: {
//     fontSize: moderateScale(12),
//     color: colors.error,
//     marginTop: verticalScale(4),
//     marginLeft: moderateScale(4),
//   },
//   loadingOverlay: {
//     alignItems: 'center',
//     padding: moderateScale(16),
//     backgroundColor: colors.lightGray,
//     borderRadius: moderateScale(8),
//     marginVertical: verticalScale(16),
//   },
//   loadingText: {
//     fontSize: moderateScale(14),
//     color: colors.darkGray,
//     marginTop: verticalScale(8),
//     fontWeight: '500',
//   },
// });

// export default SignUpScreen;


import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import axios from "axios";
import * as Location from 'expo-location';
import { useNavigation } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useAuth } from "../context/AuthContext";

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
  borderGray: '#BDC3C7',
  textGray: '#7F8C8D',
  success: '#2ECC71',
  error: '#E74C3C',
  warning: '#F39C12'
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
    login: '/auth/login'
  },
  timeout: 15000
};

// Configure axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  }
});

const SignUpScreen = () => {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [userType, setUserType] = useState('pet_owner');
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [errors, setErrors] = useState({});
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
        ['userId', userId.toString()]
      ];
      if (userLocation) {
        dataToStore.push(['userLatitude', userLocation.latitude.toString()]);
        dataToStore.push(['userLongitude', userLocation.longitude.toString()]);
      }
      AsyncStorage.multiSet(dataToStore).catch(err => 
        console.error("Failed to save user data:", err)
      );
    }
  }, [selectedGoogleAccount, userId, userLocation]);

  const validateInputs = () => {
    const newErrors = {};
    if (!userType) newErrors.userType = 'Please select a user type';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const requestLocationPermission = async (retryCount = 0) => {
    try {
      setLocationLoading(true);
      setLocationError(null);
      console.log("🌍 Requesting location permission...");
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
      console.log("✅ Location permission granted");
      console.log("📍 Getting current location...");
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
        maximumAge: 60000,
      });
      const coordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp
      };
      console.log("📍 Current Location Coordinates:", coordinates);
      setUserLocation(coordinates);
      setLocationError(null);
      return coordinates;
    } catch (error) {
      console.error("❌ Location permission/retrieval error:", error);
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
              { text: 'Retry', onPress: async () => resolve(await requestLocationPermission(retryCount + 1)) }
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
        case 400: return `Bad request: ${message}`;
        case 401: return 'Authentication failed. Please try signing in again.';
        case 403: return 'Access denied. Please check your permissions.';
        case 404: return 'Service not found. Please try again later.';
        case 409: return 'Account already exists. Please try logging in.';
        case 500: return 'Server error. Please try again later.';
        case 503: return 'Service temporarily unavailable. Please try again later.';
        default: return message;
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

  const handleGoogleSuccess = async (idToken) => {
    try {
      setLoading(true);
      if (!idToken || typeof idToken !== 'string') throw new Error('Invalid authentication token');
      console.log("Google OAuth success, ID Token received");
      const locationData = await requestLocationPermission();
      let googleData;
      try {
        const base64Url = idToken.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        googleData = JSON.parse(jsonPayload);
        console.log("Google user data decoded:", googleData);
      } catch (decodeError) {
        throw new Error('Failed to decode authentication token');
      }
      if (!googleData.sub || !googleData.email) throw new Error('Invalid Google authentication data');
      const registrationData = { fullName: googleData.name, email: googleData.email, google_token: googleData.sub };
      if (locationData) {
        registrationData.latitude = locationData.latitude;
        registrationData.longitude = locationData.longitude;
        console.log("📍 Including location in registration");
      }
      const initialRegisterResponse = await apiClient.post(API_CONFIG.endpoints.initialRegister, registrationData);
      console.log("Initial register response:", initialRegisterResponse.data);
      if (initialRegisterResponse.data.status === "error") throw new Error(initialRegisterResponse.data.message || "Initial registration failed");
      const userId = initialRegisterResponse.data.user_id;
      const account = { idToken, email: googleData.email, name: googleData.name, avatar: googleData.picture, google_token: googleData.sub };
      setSelectedGoogleAccount(account);
      setUserId(userId);
      const dataToStore = [['userEmail', googleData.email], ['googleSub', googleData.sub], ['userId', userId.toString()]];
      if (locationData) {
        dataToStore.push(['userLatitude', locationData.latitude.toString()], ['userLongitude', locationData.longitude.toString()]);
      }
      await AsyncStorage.multiSet(dataToStore);
      console.log("✅ User data saved to AsyncStorage");
      try {
        const loginResponse = await apiClient.post(API_CONFIG.endpoints.login, { login: googleData.email, role: 'pet' });
        console.log("Login response received");
        const loginData = loginResponse.data || {};
        const user = loginData.user || loginData.data?.user || loginData.data;
        const token = loginData.token || loginData.accessToken || loginData.data?.token;
        const chatRoomToken = loginData.chat_room?.token || loginData.sessionToken || loginData.data?.SessionToken;
        if (user && token) {
          await login(user, token, chatRoomToken);
          Alert.alert("Success", "✅ Registration & Login successful!");
        } else {
          console.warn("Login successful but incomplete data, redirecting to login screen");
          Alert.alert("Success", "Registration successful! Please login with your credentials.");
          navigation.navigate('Login');
        }
      } catch (loginError) {
        console.warn("Login API error, redirecting to login screen:", loginError.message);
        Alert.alert("Success", "Registration successful! Please login with your credentials.");
        navigation.navigate('Login');
      }
    } catch (error) {
      const errorMessage = handleApiError(error, 'Google registration');
      console.error("Google registration failed:", error);
      Alert.alert("Registration Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const startSignInFlow = async () => {
    try {
      if (!validateInputs()) return;
      const isConfigured = await ensureGoogleConfigured();
      if (!isConfigured) throw new Error('Google Sign-In service is not available. Please try again.');
      await GoogleSignin.hasPlayServices();
      const signInResponse = await GoogleSignin.signIn();
      if (signInResponse.type === 'success') {
        console.log('✅ Google Sign-In Successful');
        await handleGoogleSuccess(signInResponse.data.idToken);
      }
    } catch (error) {
      if (error.code === 'SIGN_IN_CANCELLED') {
        console.log('Google Sign-In was cancelled by user');
        return;
      } else if (error.code === 'IN_PROGRESS') {
        Alert.alert('Sign-In in Progress', 'Please wait for the current sign-in attempt to complete.');
        return;
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        Alert.alert('Google Play Services Required', 'Google Play Services is not available. Please install it from the Play Store.');
        return;
      }
      const errorMessage = handleApiError(error, 'Google Sign-In');
      console.error('❌ Main Google Sign-In Error:', error);
      Alert.alert("Sign-In Error", errorMessage);
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
    <ImageBackground style={{flex:1,marginBottom:moderateScale(100)}} source={require("../assets/GirlHandlingDog.png")}>
      <View style={styles.logoContainer}>
        <Image style={styles.logoImage} source={require("../assets/snoutiqBlueLogo.png")} />
      </View>
      <View style={{height:"100%",justifyContent:"center",}}>
        <Text style={styles.registerTxt}>
          SignUp
        </Text>
        <Text style={styles.smallText}>
          Please Register to continue
        </Text>
        <View style={styles.userTypeContainer}>
          <Text style={styles.sectionTitle}>Register as a:</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                userType === 'pet_owner' ? styles.activeToggle : styles.inactiveToggle
              ]}
              onPress={() => setUserType('pet_owner')}
            >
              <Text style={styles.toggleIcon}>🐶</Text>
              <Text style={[
                styles.toggleText,
                userType === 'pet_owner' ? styles.activeToggleText : styles.inactiveToggleText
              ]}>
                Pet Owner
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleOption,
                userType === 'vet' ? styles.activeToggle : styles.inactiveToggle
              ]}
              onPress={() => setUserType('vet')}
            >
              <Text style={styles.toggleIcon}>👨‍⚕️</Text>
              <Text style={[
                styles.toggleText,
                userType === 'vet' ? styles.activeToggleText : styles.inactiveToggleText
              ]}>
                Veterinarian
              </Text>
            </TouchableOpacity>
          </View>
          {errors.userType && <Text style={styles.errorText}>{errors.userType}</Text>}
        </View>
        <View style={styles.googleButtonContainer}>
          <TouchableOpacity style={styles.googleButton} onPress={startSignInFlow} disabled={loading || !isGoogleConfigured}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
            
              <Text style={styles.googleButtonText}>Register with Google</Text>
            )}
          </TouchableOpacity>
          {!isGoogleConfigured && (
            <Text style={styles.configWarning}>
              Google Sign-In initializing...
            </Text>
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
          {locationError && <Text style={styles.locationErrorText}>📍 Location unavailable: {locationError}</Text>}
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
    </ImageBackground>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  logoContainer: {
    alignSelf: 'flex-start',
    padding: moderateScale(15)
  },
  logoImage: {
    width: scale(120),
    height: verticalScale(40),
    resizeMode: 'center',
  },
  registerTxt: {
    fontSize: moderateScale(45),
    fontWeight: "bold",
    color: "black",
    marginLeft: moderateScale(30),
    marginVertical: verticalScale(5)
  },
  smallText: {
    fontSize: moderateScale(13),
    fontWeight: "400",
    color: "grey",
    marginLeft: moderateScale(30),
  },
  userTypeContainer: {
    marginTop: verticalScale(10),
    // marginLeft: moderateScale(30),
    // marginBottom: verticalScale(5),
    width:"85%",alignSelf:"center"
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: colors.darkGray,
    marginBottom: verticalScale(5),
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.lightGray,
    padding: moderateScale(4),
    borderRadius: moderateScale(12),
    ...{
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
  },
  toggleOption: {
    flex: 1,
    // paddingVertical: verticalScale(5),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
    margin: moderateScale(2),
  },
  activeToggle: {
    backgroundColor: colors.primary,
  },
  inactiveToggle: {
    backgroundColor: 'transparent',
  },
  toggleIcon: {
    fontSize: moderateScale(24),
    marginBottom: verticalScale(4),
  },
  toggleText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  activeToggleText: {
    color: colors.white,
  },
  inactiveToggleText: {
    color: colors.textGray,
  },
  errorText: {
    fontSize: moderateScale(12),
    color: colors.error,
    marginTop: verticalScale(4),
  },
  googleButtonContainer: {
    alignItems: 'center',
    marginTop: verticalScale(20),
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:"space-between",
    backgroundColor: colors.white,
    borderWidth: moderateScale(1),
    borderColor: '#dadce0',
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(20),
    minWidth: scale(250),
    ...{
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
  },
  googleButtonText: {
    color: '#3c4043',
    fontSize: moderateScale(14),
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  configWarning: {
    fontSize: moderateScale(12),
    color: colors.warning,
    marginTop: verticalScale(8),
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.secondary,
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(5),
    alignItems: 'center',
    marginTop: verticalScale(10),
  },
  retryButtonText: {
    color: colors.white,
    fontSize: moderateScale(14),
    fontWeight: 'bold',
  },
  locationLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(12),
    backgroundColor: colors.lightGray,
    borderRadius: moderateScale(8),
    marginTop: verticalScale(10),
    borderLeftWidth: moderateScale(3),
    borderLeftColor: colors.primary,
  },
  locationText: {
    fontSize: moderateScale(12),
    fontWeight: '500',
    marginLeft: moderateScale(8),
  },
  locationErrorText: {
    fontSize: moderateScale(12),
    color: colors.error,
    marginTop: verticalScale(5),
    textAlign: 'center',
  },
  locationSuccessText: {
    fontSize: moderateScale(12),
    color: colors.success,
    marginTop: verticalScale(5),
    textAlign: 'center',
  },
  backToLoginContainer: {
    alignItems: 'center',
    paddingVertical: verticalScale(20),
  },
  backToLoginText: {
    fontSize: moderateScale(14),
    color: colors.textGray,
    textAlign: 'center',
  },
  backToLoginLink: {
    fontWeight: 'bold',
    color: colors.primary,
  },
});