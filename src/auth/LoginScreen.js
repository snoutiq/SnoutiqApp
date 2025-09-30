
// import axios from "axios";
// import { useNavigation } from 'expo-router';
// import { useEffect, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   Dimensions,
//   Image,
//   SafeAreaView,
//   ScrollView,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View
// } from 'react-native';

// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {
//   GoogleSignin,
//   GoogleSigninButton
// } from '@react-native-google-signin/google-signin';
// import {
//   moderateScale,
//   scale,
//   ScaledSheet,
//   verticalScale
// } from 'react-native-size-matters';
// import { useAuth } from "../context/AuthContext";
// const { width, height } = Dimensions.get('window');

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
//   error: '#E74C3C'
// };

// const CustomInput = ({ 
//   title, 
//   value, 
//   onChangeText, 
//   keyboardType = 'default', 
//   autoCapitalize = 'sentences',
//   isPassword = false,
//   icon,
//   error
// }) => {
//   const [showPassword, setShowPassword] = useState(false);
//   const [isFocused, setIsFocused] = useState(false);
//     const [role,setRole] = useState('')
//   return (
//     <View style={styles.inputContainer}>
//       <Text style={styles.inputLabel}>{title}</Text>
//       <View style={[
//         styles.inputWrapper, 
//         isFocused && styles.inputWrapperFocused,
//         error && styles.inputError
//       ]}>
//         {icon && <Text style={styles.inputIcon}>{icon}</Text>}
//         <TextInput
//           style={styles.textInput}
//           value={value}
//           onChangeText={onChangeText}
//           keyboardType={keyboardType}
//           autoCapitalize={autoCapitalize}
//           secureTextEntry={isPassword && !showPassword}
//           placeholder={`Enter your ${title.toLowerCase()}`}
//           placeholderTextColor={colors.textGray}
//           onFocus={() => setIsFocused(true)}
//           onBlur={() => setIsFocused(false)}
//         />
//         {isPassword && (
//           <TouchableOpacity 
//             style={styles.eyeIcon}
//             onPress={() => setShowPassword(!showPassword)}
//           >
//             <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//       {error && <Text style={styles.errorText}>{error}</Text>}
//     </View>
//   );
// };

// const CustomButton = ({ title, onPress, loading = false, variant = 'primary' }) => (
//   <TouchableOpacity 
//     style={[
//       styles.button, 
//       variant === 'secondary' && styles.secondaryButton
//     ]} 
//     onPress={onPress}
//     disabled={loading}
//   >
//     {loading ? (
//       <ActivityIndicator color={variant === 'secondary' ? colors.primary : colors.white} size={moderateScale(20)} />
//     ) : (
//       <Text style={[
//         styles.buttonText,
//         variant === 'secondary' && styles.secondaryButtonText
//       ]}>{title}</Text>
//     )}
//   </TouchableOpacity>
// );

// const LoginScreen = () => {
//   const navigation = useNavigation();
//   const { login,updateUser } = useAuth();
//   const [selectedTab, setSelectedTab] = useState('email');
//   const [formData, setFormData] = useState({
//     login: "",
//     password: ""
//   });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
    
//         GoogleSignin.configure({
//           webClientId:'325007826401-dhsrqhkpoeeei12gep3g1sneeg5880o7.apps.googleusercontent.com',
//     iosClientId: "325007826401-a3l72e9mlcii4cf7l55vufht2qlc3t6a.apps.googleusercontent.com", 
//     offlineAccess: true, 
//     scopes: ["profile", "email"]
//   });
//   }, [])


//   const processLoginResponse = async (loginRes) => {
//   const loginData = loginRes.data || {};
//   const userFromApi = loginData.user || loginData.data?.user || loginData.data;
//   const tokenFromApi = loginData.token || loginData.accessToken || loginData.data?.token;
//   const sessionFromApi = loginData.token || loginData.sessionToken || loginData.data?.SessionToken;

//   if (!userFromApi || !tokenFromApi) {
//     console.warn("Login response didn't contain expected user/token —", loginData);
//     Alert.alert("Login failed", "Could not retrieve token from server. Check response.");
//     return false;
//   }

//   // save to context / AsyncStorage
//   await login(userFromApi, tokenFromApi, sessionFromApi);
//   Alert.alert("Login successful!");
//   return true;
// };
  
// console.log();


// //   const startSignInFlow = async () => {
    
// //     try { // move this to after your app starts
// //       await GoogleSignin.hasPlayServices();
// //       const signInResponse = await GoogleSignin.signIn();
// //       console.log(signInResponse,'res');
      
// //       if (signInResponse.type === 'success') {
        
// //         // (many backends accept social token this way; if your backend expects different keys, see Option B)
// //         try {
// //           const loginRes = await axios.post(
// //             "https://snoutiq.com/backend/api/google-login",
// //             {
// //               email:signInResponse?.data?.user?.email,
// //               google_token: signInResponse?.data?.idToken,
// //               role:'pet'
// //             }
// //           );
// //           console.log('hii');
// // console.log(loginRes,'rea');

// //       const ok = await processLoginResponse(loginRes);
// //       if (ok) {
// //         setLoading(false);
// //         return;
// //       }
// //       // if processLoginResponse returned false, fall through to try alternative payloads below
// //     } catch (error) {
// //       console.error("❌ Login error:", error);
// //       if (error.response && error.response.status === 401) {
// //         Alert.alert("Error", "Invalid credentials. Please try again.");
// //       } else {
// //         Alert.alert("Error", "Login failed. Please try again.");
// //       }
// //     }
// //         // use signInResponse.data
// //       } else if (signInResponse.type === 'noSavedCredentialFound') {
// //         // the user wasn't previously signed into this app
// //         const createResponse = await GoogleSignin.createAccount();
// //         if (createResponse.type === 'success') {
// //           console.log('suuceessfull')
// //           // use createResponse.data
// //         } else if (createResponse.type === 'noSavedCredentialFound') {
// //           console.log('no saved')
// //           // no Google user account was present on the device yet (unlikely but possible)
// //           const explicitResponse =
// //           await GoogleSignin.presentExplicitSignIn();
          
// //           if (explicitResponse.type === 'success') {
// //             console.log('no success')
// //             // use explicitResponse.data
// //           }
// //         }
// //       }
// //       // the else branches correspond to the user canceling the sign in
// //     } catch (error) {
// //       console.log('main derror:',error)
// //       // handle error
// //     }
// //   };

// const startSignInFlow = async () => {
//   try {
//     await GoogleSignin.hasPlayServices();
//     const signInResponse = await GoogleSignin.signIn();
//     console.log('Google SignIn Response:', signInResponse);
    
//     if (signInResponse.type === 'success') {
//       const user = signInResponse.data.user;
//       const idToken = signInResponse.data.idToken;
      
//       console.log('User Email:', user.email);
//       console.log('ID Token:', idToken);
//       console.log('User ID:', user.id);

//       try {
//         // Try Option 1: Using the Google token directly
//         const loginRes = await axios.post(
//           "https://snoutiq.com/backend/api/google-login",
//           {
//             email: user.email,
//             google_token: idToken, // Using the ID token
//             role: 'pet' // Changed from 'pet' to 'pet_owner'
//           }
//         );
        
//         console.log('Google login successful:', loginRes.data);
        
//         // Process the successful login response
//         const loginData = loginRes.data || {};
//         const userFromApi = loginData.user || loginData.data?.user || loginData.data;
//         const token = loginData.token || loginData.accessToken || loginData.data?.token;
//         const chatRoomToken = loginData.chat_room?.token || loginData.sessionToken || loginData.data?.SessionToken || null;

//         if (userFromApi && token) {
//           await login(userFromApi, token, chatRoomToken);
//           const profileKey = userFromApi?.id ? `profileCompleted:${userFromApi.id}` : null;
// await AsyncStorage.setItem(profileKey, 'true');
// updateUser({ ...userFromApi, role: "pet", profileCompleted: true });
//           Alert.alert("✅ Login successful!");
//           navigation.navigate('HomePage');
//         } else {
//           console.error("Invalid login response:", loginData);
//           Alert.alert("Error", "Could not retrieve user or token from server.");
//         }
        
//       } catch (error) {
//         console.error("❌ Google login failed:", error.response?.data || error.message);
        
//         // If Option 1 fails, try Option 2: Using the user ID as google_token
//         if (error.response?.status === 401) {
//           try {
//             console.log('Trying alternative login with user ID as google_token...');
            
//             const alternativeLoginRes = await axios.post(
//               "https://snoutiq.com/backend/api/google-login",
//               {
//                 email: user.email,
//                 google_token: user.id, // Using the user ID instead of ID token
//                 role: 'pet'
//               }
//             );
            
//             console.log('Alternative login successful:', alternativeLoginRes.data);
            
//             const loginData = alternativeLoginRes.data || {};
//             const userFromApi = loginData.user || loginData.data?.user || loginData.data;
//             const token = loginData.token || loginData.accessToken || loginData.data?.token;
//             const chatRoomToken = loginData.chat_room?.token || loginData.sessionToken || loginData.data?.SessionToken || null;

//             if (userFromApi && token) {
//               await login(userFromApi, token, chatRoomToken);
//                 const profileKey = userFromApi?.id ? `profileCompleted:${userFromApi.id}` : null;
// await AsyncStorage.setItem(profileKey, 'true');
// updateUser({ ...userFromApi, role: "pet", profileCompleted: true });
//           Alert.alert("✅ Login successful!");
//               navigation.navigate('HomePage');
//             }
            
//           } catch (altError) {
//             console.error("❌ Alternative login also failed:", altError.response?.data || altError.message);
//             Alert.alert("Error", "Google login failed. Please try registration instead.");
//           }
//         } else {
//           Alert.alert("Error", "Google login failed. Please try again.");
//         }
//       }
      
//     } else if (signInResponse.type === 'noSavedCredentialFound') {
//       console.log('No saved credentials found.');
//       const createResponse = await GoogleSignin.createAccount();
      
//       if (createResponse.type === 'success') {
//         console.log('Account creation successful:', createResponse.data);
//         // Handle account creation success similarly
//       } else {
//         console.log('Account creation failed or cancelled.');
//       }
//     } else {
//       console.log('Google Sign-In cancelled or failed:', signInResponse);
//     }
//   } catch (error) {
//     console.error('❌ Main Google Sign-In Error:', error);
//     Alert.alert("Error", "An error occurred during Google Sign-In. Please try again.");
//   }
// };
//   const validateForm = () => {
//     let valid = true;
//     let newErrors = {};

//     if (!formData.login.trim()) {
//       newErrors.login = selectedTab === 'email' 
//         ? "Email is required" 
//         : "Mobile number is required";
//       valid = false;
//     } else if (selectedTab === 'email' && !/^\S+@\S+\.\S+$/.test(formData.login)) {
//       newErrors.login = "Invalid email format";
//       valid = false;
//     } else if (selectedTab === 'mobile' && !/^\d{10}$/.test(formData.login)) {
//       newErrors.login = "Enter valid 10-digit mobile number";
//       valid = false;
//     }

//     if (!formData.password) {
//       newErrors.password = "Password is required";
//       valid = false;
//     }

//     setErrors(newErrors);
//     return valid;
//   };

//   const handleSubmit = async () => {
//     setErrors({});
//     if (!validateForm()) return;

//     setLoading(true);
//     try {
//       // Login API call
//       const loginRes = await axios.post("https://snoutiq.com/backend/api/auth/login", {
//         login: formData.login,
//         password: formData.password,
//         role:'pet'
//       });

//       // Extract user data and tokens from response
//       const loginData = loginRes.data || {};
//       const userFromApi = loginData.user || loginData.data?.user || loginData.data;
//       const tokenFromApi = loginData.token || loginData.accessToken || loginData.data?.token;
//       const sessionFromApi = loginData.token || loginData.sessionToken || loginData.data?.SessionToken;

//       if (!userFromApi || !tokenFromApi) {
//         console.warn("Login response didn't contain expected user/token —", loginData);
//         Alert.alert("Login failed", "Could not retrieve token from server. Check response.");
//         setLoading(false);
//         return;
//       }

//       // Call context login -> saves to AsyncStorage and flips isLoggedIn
//       await login(userFromApi, tokenFromApi, sessionFromApi);

//        const profileKey = userFromApi?.id ? `profileCompleted:${userFromApi.id}` : null;
// await AsyncStorage.setItem(profileKey, 'true');
// updateUser({ ...userFromApi, role: "pet", profileCompleted: true });
//           Alert.alert("✅ Login successful!");
//       // Navigation will be handled by the auth context typically

//     } catch (error) {
//       console.error("❌ Login error:", error);
//       if (error.response && error.response.status === 401) {
//         Alert.alert("Error", "Invalid credentials. Please try again.");
//       } else {
//         Alert.alert("Error", "Login failed. Please try again.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (name, value) => {
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     if (errors[name]) {
//       setErrors((prev) => ({ ...prev, [name]: null }));
//     }
//   };

//   const handleForgotPassword = () => {
//     navigation.navigate('ForgotPassword');
//   };

//   const handleSignUp = () => {
//     navigation.navigate('SignUp');
//   };

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
//           <Image style={styles.logoContainer} source={require("../assets/snoutiqBlueLogo.png")} />
//           </View>
//           <Text style={styles.welcomeTitle}>Welcome Back!</Text>
//           <Text style={styles.welcomeSubtitle}>Sign in to continue your pet care journey</Text>
//         </View>

//         <View style={styles.formContainer}>
//           <View style={styles.tabContainer}>
//             <TouchableOpacity
//               style={[
//                 styles.tab,
//                 selectedTab === 'email' ? styles.activeTab : styles.inactiveTab
//               ]}
//               onPress={() => setSelectedTab('email')}
//             >
//               <Text style={[
//                 styles.tabText,
//                 selectedTab === 'email' ? styles.activeTabText : styles.inactiveTabText
//               ]}>
//                 Email
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[
//                 styles.tab,
//                 selectedTab === 'mobile' ? styles.activeTab : styles.inactiveTab
//               ]}
//               onPress={() => setSelectedTab('mobile')}
//             >
//               <Text style={[
//                 styles.tabText,
//                 selectedTab === 'mobile' ? styles.activeTabText : styles.inactiveTabText
//               ]}>
//                 Phone
//               </Text>
//             </TouchableOpacity>
//           </View>

//           {selectedTab === 'email' ? (
//             <CustomInput
//               title="Email Address"
//               value={formData.login}
//               onChangeText={(text) => handleChange("login", text)}
//               keyboardType="email-address"
//               autoCapitalize="none"
//               icon="📧"
//               error={errors.login}
//             />
//           ) : (
//             <CustomInput
//               title="Phone Number"
//               value={formData.login}
//               onChangeText={(text) => handleChange("login", text)}
//               keyboardType="phone-pad"
//               icon="📱"
//               error={errors.login}
//             />
//           )}

//           <CustomInput
//             title="Password"
//             value={formData.password}
//             onChangeText={(text) => handleChange("password", text)}
//             isPassword={true}
//             icon="🔒"
//             error={errors.password}
//           />

//           <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
//             <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
//           </TouchableOpacity>

//           <CustomButton
//             title="Sign In"
//             onPress={handleSubmit}
//             loading={loading}
//           />

//           <View style={styles.dividerContainer}>
//             <View style={styles.dividerLine} />
//             <Text style={styles.dividerText}>or continue with</Text>
//             <View style={styles.dividerLine} />
//           </View>

//           {/* Social Login Buttons */}
//           <View style={{ alignItems: "center", marginTop: 10 }}>


//  <GoogleSigninButton onPress={startSignInFlow} label="Sign in with Google" />;

// </View>

//           <TouchableOpacity style={styles.signUpContainer} onPress={handleSignUp}>
//             <Text style={styles.signUpText}>
//               Don't have an account?
//               <Text style={styles.signUpLink}> Register</Text>
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
//     backgroundColor: colors.background 
//   },
//   scrollView: { 
//     flex: 1 
//   },
//   scrollContent: { 
//     flexGrow: 1 
//   },
//   logoContainer: { 
//     height: verticalScale(40), 
//     width: "80%", 
//     resizeMode: "contain" 
//   },
//     petIllustration: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: colors.white,
//     borderRadius: moderateScale(40),
//     paddingVertical: moderateScale(5),
//     paddingHorizontal: moderateScale(1),
//     marginTop:verticalScale(20),
//     shadowColor: colors.black,
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   headerSection: { 
//     alignItems: "center", 
//     paddingTop: verticalScale(20), 
//     paddingBottom: verticalScale(30), 
//     backgroundColor: colors.primary, 
//     borderBottomLeftRadius: 30, 
//     borderBottomRightRadius: 30 
//   },
//   welcomeTitle: { 
//     fontSize: moderateScale(24), 
//     fontWeight: "700", 
//     color: colors.white, 
//     marginVertical: 5 
//   },
//   welcomeSubtitle: { 
//     fontSize: moderateScale(15), 
//     color: colors.white, 
//     opacity: 0.9, 
//     textAlign: "center" 
//   },
//   formContainer: { 
//     flex: 1, 
//     paddingHorizontal: scale(24), 
//     paddingTop: verticalScale(30) 
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     backgroundColor: colors.lightGray,
//     padding: moderateScale(4),
//     borderRadius: moderateScale(12),
//     marginBottom: verticalScale(15),
//   },
//   tab: {
//     flex: 1,
//     paddingVertical: verticalScale(12),
//     borderRadius: moderateScale(10),
//     alignItems: 'center',
//   },
//   activeTab: {
//     backgroundColor: colors.primary,
//     shadowColor: colors.primary,
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   inactiveTab: {
//     backgroundColor: 'transparent',
//   },
//   tabText: {
//     fontSize: moderateScale(14),
//     fontWeight: '600',
//   },
//   activeTabText: {
//     color: colors.white,
//   },
//   inactiveTabText: {
//     color: colors.textGray,
//   },
//   inputContainer: { 
//     marginBottom: verticalScale(20) 
//   },
//   inputLabel: { 
//     fontSize: moderateScale(14), 
//     fontWeight: "600", 
//     color: colors.darkGray, 
//     marginBottom: verticalScale(8) 
//   },
//   inputWrapper: { 
//     flexDirection: "row", 
//     alignItems: "center", 
//     borderWidth: 1.5, 
//     borderColor: colors.borderGray, 
//     borderRadius: 12, 
//     paddingHorizontal: 15, 
//     backgroundColor: colors.white 
//   },
//   inputWrapperFocused: { 
//     borderColor: colors.primary 
//   },
//   inputError: { 
//     borderColor: colors.error, 
//     backgroundColor: "#FFF5F5" 
//   },
//   inputIcon: { 
//     fontSize: 18, 
//     marginRight: 12 
//   },
//   textInput: { 
//     flex: 1, 
//     paddingVertical: 15, 
//     fontSize: 16, 
//     color: colors.darkGray 
//   },
//   eyeIcon: { 
//     padding: 5 
//   },
//   eyeIconText: { 
//     fontSize: 18 
//   },
//   errorText: { 
//     color: colors.error, 
//     fontSize: 12, 
//     marginTop: 5 
//   },
//   forgotPassword: {
//     alignSelf: 'flex-end',
//     marginBottom: verticalScale(20),
//   },
//   forgotPasswordText: {
//     fontSize: moderateScale(14),
//     color: colors.primary,
//     fontWeight: '600',
//   },
//   button: { 
//     backgroundColor: colors.primary, 
//     paddingVertical: 16, 
//     borderRadius: 12, 
//     alignItems: "center", 
//     marginBottom: verticalScale(20),
//     shadowColor: colors.primary,
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   secondaryButton: {
//     backgroundColor: colors.white,
//     borderWidth: moderateScale(1.5),
//     borderColor: colors.primary,
//   },
//   buttonText: { 
//     fontSize: 16, 
//     fontWeight: "bold", 
//     color: colors.white 
//   },
//   secondaryButtonText: {
//     color: colors.primary,
//   },
//   dividerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: verticalScale(10),
//   },
//   dividerLine: {
//     flex: 1,
//     height: moderateScale(1),
//     backgroundColor: colors.borderGray,
//   },
//   dividerText: {
//     marginHorizontal: scale(15),
//     fontSize: moderateScale(14),
//     color: colors.textGray,
//     fontWeight: '500',
//   },

//   socialButton: {
//     width: "75%",
//     paddingVertical:verticalScale(5),
//     alignSelf:"center",
//     alignItems:"center",
//     justifyContent:"center",
//     borderRadius:moderateScale(15),
//     backgroundColor:colors.lightGray,
//     resizeMode:"cover",
//     elevation:4,
//     marginVertical:verticalScale(5)
//   },
//    socialIcon:{
//     width:"65%",
//     alignItems:"center",
//     height:verticalScale(45)
//    },
//   signUpContainer: {
//     alignItems: 'center',
//     paddingBottom: verticalScale(20),
//   },
//   signUpText: {
//     fontSize: moderateScale(14),
//     color: colors.textGray,
//     textAlign: 'center',
//   },
//   signUpLink: {
//     fontWeight: 'bold',
//     color: colors.primary,
//   },
// });

// export default LoginScreen;


















import axios from "axios";
import { useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  moderateScale,
  scale,
  verticalScale
} from 'react-native-size-matters';
import { useAuth } from "../context/AuthContext";

// Colors configuration (same as register screen)
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

// Google Sign-In Configuration (same as register screen)
const GOOGLE_SIGN_IN_CONFIG = {
  webClientId: '325007826401-dhsrqhkpoeeei12gep3g1sneeg5880o7.apps.googleusercontent.com',
  offlineAccess: true,
  forceCodeForRefreshToken: true,
};

// API configuration
const API_CONFIG = {
  baseURL: 'https://snoutiq.com/backend/api',
  endpoints: {
    login: '/auth/login',
    googleLogin: '/google-login'
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

const CustomInput = ({ 
  title, 
  value, 
  onChangeText, 
  keyboardType = 'default', 
  autoCapitalize = 'sentences',
  isPassword = false,
  icon,
  error
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{title}</Text>
      <View style={[
        styles.inputWrapper, 
        isFocused && styles.inputWrapperFocused,
        error && styles.inputError
      ]}>
        {icon && <Text style={styles.inputIcon}>{icon}</Text>}
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={isPassword && !showPassword}
          placeholder={`Enter your ${title.toLowerCase()}`}
          placeholderTextColor={colors.textGray}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {isPassword && (
          <TouchableOpacity 
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const CustomButton = ({ title, onPress, loading = false, variant = 'primary' }) => (
  <TouchableOpacity 
    style={[
      styles.button, 
      variant === 'secondary' && styles.secondaryButton
    ]} 
    onPress={onPress}
    disabled={loading}
  >
    {loading ? (
      <ActivityIndicator color={variant === 'secondary' ? colors.primary : colors.white} size={moderateScale(20)} />
    ) : (
      <Text style={[
        styles.buttonText,
        variant === 'secondary' && styles.secondaryButtonText
      ]}>{title}</Text>
    )}
  </TouchableOpacity>
);

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login, updateUser } = useAuth();
  const [userType, setUserType] = useState('pet_owner');
  const [formData, setFormData] = useState({
    login: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
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

  const handleApiError = (error, context) => {
    console.error(`API Error in ${context}:`, error);
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || `Server error (${status})`;
      switch (status) {
        case 400: return `Bad request: ${message}`;
        case 401: return 'Authentication failed. Please check your credentials.';
        case 403: return 'Access denied. Please check your permissions.';
        case 404: return 'Service not found. Please try again later.';
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

  const startSignInFlow = async () => {
    try {
      const isConfigured = await ensureGoogleConfigured();
      if (!isConfigured) throw new Error('Google Sign-In service is not available. Please try again.');
      
      await GoogleSignin.hasPlayServices();
      const signInResponse = await GoogleSignin.signIn();
      console.log('Google SignIn Response:', signInResponse);
      
      if (signInResponse.type === 'success') {
        const user = signInResponse.data.user;
        const idToken = signInResponse.data.idToken;
        
        console.log('User Email:', user.email);
        console.log('ID Token:', idToken);

        try {
          // Try Option 1: Using the Google token directly
          const loginRes = await apiClient.post(API_CONFIG.endpoints.googleLogin, {
            email: user.email,
            google_token: idToken,
            role: 'pet'
          });
          
          console.log('Google login successful:', loginRes.data);
          
          // Process the successful login response
          const loginData = loginRes.data || {};
          const userFromApi = loginData.user || loginData.data?.user || loginData.data;
          const token = loginData.token || loginData.accessToken || loginData.data?.token;
          const chatRoomToken = loginData.chat_room?.token || loginData.sessionToken || loginData.data?.SessionToken || null;

          if (userFromApi && token) {
            await login(userFromApi, token, chatRoomToken);
            const profileKey = userFromApi?.id ? `profileCompleted:${userFromApi.id}` : null;
            await AsyncStorage.setItem(profileKey, 'true');
            updateUser({ ...userFromApi, role: "pet", profileCompleted: true });
            Alert.alert("✅ Login successful!");
            navigation.navigate('HomePage');
          } else {
            console.error("Invalid login response:", loginData);
            Alert.alert("Error", "Could not retrieve user or token from server.");
          }
          
        } catch (error) {
          console.error("❌ Google login failed:", error.response?.data || error.message);
          
          // If Option 1 fails, try Option 2: Using the user ID as google_token
          if (error.response?.status === 401) {
            try {
              console.log('Trying alternative login with user ID as google_token...');
              
              const alternativeLoginRes = await apiClient.post(API_CONFIG.endpoints.googleLogin, {
                email: user.email,
                google_token: user.id,
                role: 'pet'
              });
              
              console.log('Alternative login successful:', alternativeLoginRes.data);
              
              const loginData = alternativeLoginRes.data || {};
              const userFromApi = loginData.user || loginData.data?.user || loginData.data;
              const token = loginData.token || loginData.accessToken || loginData.data?.token;
              const chatRoomToken = loginData.chat_room?.token || loginData.sessionToken || loginData.data?.SessionToken || null;

              if (userFromApi && token) {
                await login(userFromApi, token, chatRoomToken);
                const profileKey = userFromApi?.id ? `profileCompleted:${userFromApi.id}` : null;
                await AsyncStorage.setItem(profileKey, 'true');
                updateUser({ ...userFromApi, role: "pet", profileCompleted: true });
                Alert.alert("✅ Login successful!");
                navigation.navigate('HomePage');
              }
              
            } catch (altError) {
              console.error("❌ Alternative login also failed:", altError.response?.data || altError.message);
              Alert.alert("Error", "Google login failed. Please try registration instead.");
            }
          } else {
            const errorMessage = handleApiError(error, 'Google login');
            Alert.alert("Error", errorMessage);
          }
        }
        
      } else {
        console.log('Google Sign-In cancelled or failed:', signInResponse);
      }
    } catch (error) {
      console.error('❌ Main Google Sign-In Error:', error);
      if (error.code === 'SIGN_IN_CANCELLED') {
        console.log('Google Sign-In was cancelled by user');
        return;
      }
      const errorMessage = handleApiError(error, 'Google Sign-In');
      Alert.alert("Sign-In Error", errorMessage);
    }
  };

  const validateForm = () => {
    let valid = true;
    let newErrors = {};

    if (!formData.login.trim()) {
      newErrors.login = "Email is required";
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.login)) {
      newErrors.login = "Invalid email format";
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    setErrors({});
    if (!validateForm()) return;

    setLoading(true);
    try {
      const loginRes = await apiClient.post(API_CONFIG.endpoints.login, {
        login: formData.login,
        password: formData.password,
        role: 'pet'
      });

      const loginData = loginRes.data || {};
      const userFromApi = loginData.user || loginData.data?.user || loginData.data;
      const tokenFromApi = loginData.token || loginData.accessToken || loginData.data?.token;
      const sessionFromApi = loginData.token || loginData.sessionToken || loginData.data?.SessionToken;

      if (!userFromApi || !tokenFromApi) {
        console.warn("Login response didn't contain expected user/token —", loginData);
        Alert.alert("Login failed", "Could not retrieve token from server. Check response.");
        setLoading(false);
        return;
      }

      await login(userFromApi, tokenFromApi, sessionFromApi);
      const profileKey = userFromApi?.id ? `profileCompleted:${userFromApi.id}` : null;
      await AsyncStorage.setItem(profileKey, 'true');
      updateUser({ ...userFromApi, role: "pet", profileCompleted: true });
      Alert.alert("✅ Login successful!");

    } catch (error) {
      console.error("❌ Login error:", error);
      const errorMessage = handleApiError(error, 'email login');
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <ImageBackground style={styles.backgroundImage} source={require("../assets/girlHandlingDog.png")}>
      <View style={styles.logoContainer}>
        <Image style={styles.logoImage} source={require("../assets/snoutiqBlueLogo.png")} />
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.loginTxt}>
          Login
        </Text>
        <Text style={styles.smallText}>
          Please login to continue
        </Text>

        <View style={styles.userTypeContainer}>
          <Text style={styles.sectionTitle}>Login as a:</Text>
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
        </View>

        <View style={styles.formContainer}>
          <CustomInput
            title="Email "
            value={formData.login}
            onChangeText={(text) => handleChange("login", text)}
            keyboardType="email-address"
            autoCapitalize="none"
            icon="📧"
            error={errors.login}
          />

          <CustomInput
            title="Password"
            value={formData.password}
            onChangeText={(text) => handleChange("password", text)}
            isPassword={true}
            icon="🔒"
            error={errors.password}
          />

          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <CustomButton
            title="Sign In"
            onPress={handleSubmit}
            loading={loading}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.googleButtonContainer}>
            <TouchableOpacity style={styles.googleButton} onPress={startSignInFlow} disabled={!isGoogleConfigured}>
              <Image 
                source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }} 
                style={styles.googleIcon}
              />
              <Text style={styles.googleButtonText}>Login with Google</Text>
            </TouchableOpacity>
            {!isGoogleConfigured && (
              <Text style={styles.configWarning}>
                Google Sign-In initializing...
              </Text>
            )}
          </View>

          <TouchableOpacity style={styles.backToSignUpContainer} onPress={handleSignUp}>
            <Text style={styles.backToSignUpText}>
              Don't have an account? <Text style={styles.backToSignUpLink}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = {
  backgroundImage: {
    flex: 1,
    marginBottom: moderateScale(100)
  },
  logoContainer: {
    alignSelf: 'flex-start',
    padding: moderateScale(15)
  },
  logoImage: {
    width: scale(120),
    height: verticalScale(40),
    resizeMode: 'center',
  },
  contentContainer: {
    height: "100%",
    justifyContent: "center",
  },
  loginTxt: {
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
    width: "85%",
    alignSelf: "center"
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
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleOption: {
    flex: 1,
    borderRadius: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
    margin: moderateScale(2),
    // paddingVertical: verticalScale(12),
  },
  activeToggle: {
    backgroundColor: colors.primary,
  },
  inactiveToggle: {
    backgroundColor: 'transparent',
  },
  toggleIcon: {
    fontSize: moderateScale(20),
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
  formContainer: {
    width: "85%",
    alignSelf: "center",
    marginTop: verticalScale(20)
  },
  inputContainer: { 
    marginBottom: verticalScale(15) 
  },
  inputLabel: { 
    fontSize: moderateScale(14), 
    fontWeight: "600", 
    color: colors.darkGray, 
    marginBottom: verticalScale(8) 
  },
  inputWrapper: { 
    flexDirection: "row", 
    alignItems: "center", 
    borderBottomWidth: 2,  // Changed from borderWidth to borderBottomWidth
    borderBottomColor: colors.borderGray,  // Changed from borderColor to borderBottomColor
    borderRadius: 0,  // Changed from 12 to 0 for bottom border only
    paddingHorizontal: 0,  // Removed horizontal padding
    paddingVertical: 10,  // Adjusted vertical padding
    backgroundColor: 'transparent',  // Changed from white to transparent
  },
  inputWrapperFocused: { 
    borderBottomColor: colors.primary  // Changed from borderColor to borderBottomColor
  },
  inputError: { 
    borderBottomColor: colors.error,  // Changed from borderColor to borderBottomColor
    backgroundColor: "transparent",  // Changed from #FFF5F5 to transparent
  },
  inputIcon: { 
    fontSize: 18, 
    marginRight: 12 
  },
  textInput: { 
    flex: 1, 
    paddingVertical: 5,  // Reduced padding
    fontSize: 16, 
    color: colors.darkGray 
  },
  eyeIcon: { 
    padding: 5 
  },
  eyeIconText: { 
    fontSize: 18 
  },
  errorText: { 
    color: colors.error, 
    fontSize: 12, 
    marginTop: 5 
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: verticalScale(20),
  },
  forgotPasswordText: {
    fontSize: moderateScale(14),
    color: colors.primary,
    fontWeight: '600',
  },
  button: { 
    backgroundColor: colors.primary, 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: "center", 
    marginBottom: verticalScale(20),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: colors.white 
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginVertical: verticalScale(5),
  },
  dividerLine: {
    flex: 1,
    height: moderateScale(1),
    backgroundColor: colors.borderGray,
  },
  dividerText: {
    marginHorizontal: scale(15),
    fontSize: moderateScale(14),
    color: colors.textGray,
    fontWeight: '500',
  },
  googleButtonContainer: {
    alignItems: 'center',
    marginTop: verticalScale(10),
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: moderateScale(1),
    borderColor: '#dadce0',
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(20),
    minWidth: scale(250),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleIcon: {
    width: moderateScale(20),
    height: moderateScale(20),
    marginRight: scale(10),
  },
  googleButtonText: {
    color: '#3c4043',
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  configWarning: {
    fontSize: moderateScale(12),
    color: colors.warning,
    marginTop: verticalScale(8),
    textAlign: 'center',
  },
  backToSignUpContainer: {
    alignItems: 'center',
    paddingVertical: verticalScale(20),
  },
  backToSignUpText: {
    fontSize: moderateScale(14),
    color: colors.textGray,
    textAlign: 'center',
  },
  backToSignUpLink: {
    fontWeight: 'bold',
    color: colors.primary,
  },
};

export default LoginScreen;