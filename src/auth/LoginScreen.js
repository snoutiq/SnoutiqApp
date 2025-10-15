import axios from "axios";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useAuth } from "../context/AuthContext";

// Colors configuration
const colors = {
  primary: "#2563EB",
  secondary: "#4ECDC4",
  accent: "#FFD93D",
  background: "#F8F9FA",
  white: "#FFFFFF",
  black: "#2C3E50",
  darkGray: "#34495E",
  lightGray: "#ECF0F1",
  borderGray: "#BDC3C7",
  textGray: "#7F8C8D",
  success: "#2ECC71",
  error: "#E74C3C",
  warning: "#F39C12",
};

// Google Sign-In Configuration
const GOOGLE_SIGN_IN_CONFIG = {
  webClientId:
    "325007826401-dhsrqhkpoeeei12gep3g1sneeg5880o7.apps.googleusercontent.com",
  offlineAccess: true,
  forceCodeForRefreshToken: true,
};

// API configuration
const API_CONFIG = {
  baseURL: "https://snoutiq.com/backend/api",
  endpoints: {
    login: "/auth/login",
    googleLogin: "/google-login",
  },
  timeout: 15000,
};

// Configure axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

const CustomInput = ({
  title,
  value,
  onChangeText,
  keyboardType = "default",
  autoCapitalize = "sentences",
  isPassword = false,
  icon,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{title}</Text>
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          error && styles.inputError,
        ]}
      >
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
            <Text style={styles.eyeIconText}>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const CustomButton = ({
  title,
  onPress,
  loading = false,
  variant = "primary",
}) => (
  <TouchableOpacity
    style={[styles.button, variant === "secondary" && styles.secondaryButton]}
    onPress={onPress}
    disabled={loading}
    activeOpacity={0.8}
  >
    {loading ? (
      <ActivityIndicator
        color={variant === "secondary" ? colors.primary : colors.white}
        size="small"
      />
    ) : (
      <Text
        style={[
          styles.buttonText,
          variant === "secondary" && styles.secondaryButtonText,
        ]}
      >
        {title}
      </Text>
    )}
  </TouchableOpacity>
);

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isGoogleConfigured, setIsGoogleConfigured] = useState(false);

  useEffect(() => {
    const configureGoogleSignIn = async () => {
      try {
        console.log("🔧 Configuring Google Sign-In...");
        await GoogleSignin.configure(GOOGLE_SIGN_IN_CONFIG);

        // Check if Play Services are available (Android)
        if (Platform.OS === "android") {
          await GoogleSignin.hasPlayServices({
            showPlayServicesUpdateDialog: true,
          });
        }

        setIsGoogleConfigured(true);
        console.log("✅ Google Sign-In configured successfully");
      } catch (error) {
        console.error("❌ Google Sign-In configuration failed:", error);
        setIsGoogleConfigured(false);

        // Retry configuration after delay
        setTimeout(() => {
          configureGoogleSignIn();
        }, 2000);
      }
    };

    configureGoogleSignIn();

    // Cleanup on unmount
    return () => {
      // Optionally sign out if needed
    };
  }, []);

  const handleApiError = (error, context) => {
    console.error(`API Error in ${context}:`, error);
    if (error.response) {
      const status = error.response.status;
      const message =
        error.response.data?.message || `Server error (${status})`;
      switch (status) {
        case 400:
          return `Bad request: ${message}`;
        case 401:
          return "Authentication failed. Please check your credentials.";
        case 403:
          return "Access denied. Please check your permissions.";
        case 404:
          return "Service not found. Please try again later.";
        case 500:
          return "Server error. Please try again later.";
        case 503:
          return "Service temporarily unavailable. Please try again later.";
        default:
          return message;
      }
    } else if (error.request) {
      return "Network connection failed. Please check your internet connection.";
    } else {
      return error.message || "An unexpected error occurred. Please try again.";
    }
  };

  // const handleGoogleSignIn = async () => {
  //   if (!isGoogleConfigured) {
  //     Alert.alert(
  //       "Please Wait",
  //       "Google Sign-In is initializing. Please try again."
  //     );
  //     return;
  //   }

  //   setGoogleLoading(true);

  //   try {
  //     // Step 1: Sign out first to ensure clean state
  //     try {
  //       await GoogleSignin.signOut();
  //       console.log("🧹 Previous session cleaned");
  //     } catch (e) {
  //       console.warn("⚠️ Clean session attempt:", e.message);
  //     }

  //     // Step 2: Check Play Services (Android)
  //     if (Platform.OS === "android") {
  //       await GoogleSignin.hasPlayServices({
  //         showPlayServicesUpdateDialog: true,
  //       });
  //     }

  //     // Step 3: Start fresh sign in
  //     console.log("🔐 Starting Google Sign-In...");
  //     // const userInfo = await GoogleSignin.signIn();
  //     const signInResponse = await GoogleSignin.signIn();
  //        const uniqueUserId = googleData.sub;
  //     const email = googleData.email || "";

  //     console.log("userInfo structure:", userInfo);

  //     // Validate response
  //     if (!userInfo) {
  //       throw new Error("No userInfo returned from GoogleSignin.signIn()");
  //     }

  //     if (!userInfo.user) {
  //       throw new Error("No user object in userInfo");
  //     }

  //     // const user = userInfo.user;
  //     // const idToken = userInfo.idToken;

  //     if (!user.email) {
  //       throw new Error("No email in user object");
  //     }

  //     console.log("✅ Google Sign-In successful:", user.email);

  //     // Step 4: Backend login
  //     try {
  //       console.log("🔄 Calling backend login...");
  //       const loginRes = await apiClient.post(
  //         API_CONFIG.endpoints.googleLogin,
  //         {
  //           email: email,
  //           google_token: uniqueUserId,
  //           role: "pet",
  //         }
  //       );

  //       const loginData = loginRes.data || {};
  //       const userFromApi =
  //         loginData.user || loginData.data?.user || loginData.data;
  //       const token =
  //         loginData.token || loginData.accessToken || loginData.data?.token;
  //       const chatRoomToken =
  //         loginData.chat_room?.token ||
  //         loginData.sessionToken ||
  //         loginData.data?.SessionToken ||
  //         null;

  //       if (userFromApi && token) {
  //         console.log("✅ Backend login successful");
  //         await login(userFromApi, token, chatRoomToken);

  //         const profileKey = userFromApi?.id
  //           ? `profileCompleted:${userFromApi.id}`
  //           : null;
  //         if (profileKey) {
  //           await AsyncStorage.setItem(profileKey, "true");
  //         }

  //         updateUser({ ...userFromApi, role: "pet", profileCompleted: true });
  //         Alert.alert("Success", "Login successful! Welcome back.");
  //         navigation.navigate("HomePage");
  //       } else {
  //         throw new Error("Invalid response from server");
  //       }
  //     } catch (backendError) {
  //       console.error("❌ Backend login error:", backendError.response?.data);

  //       // Try alternative method
  //       if (
  //         backendError.response?.status === 401 ||
  //         backendError.response?.status === 400
  //       ) {
  //         try {
  //           console.log("🔄 Trying alternative login method...");
  //           const altRes = await apiClient.post(
  //             API_CONFIG.endpoints.googleLogin,
  //             {
  //               email: user.email,
  //               google_token: user.id,
  //               role: "pet",
  //             }
  //           );

  //           const altData = altRes.data || {};
  //           const altUser = altData.user || altData.data?.user;
  //           const altToken = altData.token || altData.accessToken;

  //           if (altUser && altToken) {
  //             console.log("✅ Alternative login successful");
  //             await login(altUser, altToken);

  //             const profileKey = altUser?.id
  //               ? `profileCompleted:${altUser.id}`
  //               : null;
  //             if (profileKey) {
  //               await AsyncStorage.setItem(profileKey, "true");
  //             }

  //             updateUser({ ...altUser, role: "pet", profileCompleted: true });
  //             Alert.alert("Success", "Login successful! Welcome back.");
  //             navigation.navigate("HomePage");
  //           } else {
  //             throw new Error("Invalid response from alternative method");
  //           }
  //         } catch (altError) {
  //           console.error(
  //             "❌ Alternative method failed:",
  //             altError.response?.data
  //           );
  //           Alert.alert(
  //             "Account Not Found",
  //             "This Google account is not registered. Please sign up first."
  //           );
  //         }
  //       } else {
  //         const errorMessage = handleApiError(backendError, "Google login");
  //         Alert.alert("Login Failed", errorMessage);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("❌ Google Sign-In Error:", error);

  //     if (error.code === statusCodes.SIGN_IN_CANCELLED) {
  //       console.log("ℹ️ User cancelled Google Sign-In");
  //       return;
  //     }

  //     if (error.code === statusCodes.IN_PROGRESS) {
  //       Alert.alert("Please Wait", "Sign-in is already in progress");
  //       return;
  //     }

  //     if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
  //       Alert.alert(
  //         "Google Play Services",
  //         "Google Play Services is not available or outdated"
  //       );
  //       return;
  //     }

  //     const errorMessage =
  //       error.message || "An error occurred during Google Sign-In";
  //     Alert.alert("Sign-In Error", errorMessage);
  //   } finally {
  //     setGoogleLoading(false);
  //   }
  // };

const handleGoogleSignIn = async () => {
  if (!isGoogleConfigured) {
    Alert.alert("Please Wait", "Google Sign-In is initializing. Please try again.");
    return;
  }

  setGoogleLoading(true);

  try {
    await GoogleSignin.signOut().catch(() => {});

    if (Platform.OS === "android") {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    }

    const userInfo = await GoogleSignin.signIn();
    console.log("userInfo:", userInfo);

    // Access the user correctly
    const user = userInfo.data?.user;
    const idToken = userInfo.data?.idToken;

    if (!user) throw new Error("No user object returned from Google Sign-In");

    const email = user.email;
    const googleId = user.id;

    if (!email) throw new Error("Email not found in Google user object");

    // Call backend
    const loginRes = await apiClient.post(API_CONFIG.endpoints.googleLogin, {
      email,
      google_token: googleId, // send Google user id
      role: "pet",
    });

    const { user: backendUser, token, chat_room } = loginRes.data;

    if (backendUser && token) {
      await login(backendUser, token, chat_room?.token || null);

      await AsyncStorage.setItem(
        `profileCompleted:${backendUser.id}`,
        "true"
      );

      updateUser({ ...backendUser, role: "pet", profileCompleted: true });
      // Alert.alert("Success", "Login successful! Welcome back.");
      navigation.navigate("HomePage");
    } else {
      throw new Error("Invalid response from server");
    }
  } catch (error) {
    console.error("❌ Google Sign-In Error:", error);
    Alert.alert("Sign-In Error", error.message || "An error occurred during Google Sign-In");
  } finally {
    setGoogleLoading(false);
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
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    setErrors({});

    if (!validateForm()) return;

    setLoading(true);
    try {
      const loginRes = await apiClient.post(API_CONFIG.endpoints.login, {
        login: formData.login,
        password: formData.password,
        role: "pet",
      });

      const loginData = loginRes.data || {};
      const userFromApi =
        loginData.user || loginData.data?.user || loginData.data;
      const tokenFromApi =
        loginData.token || loginData.accessToken || loginData.data?.token;
      const sessionFromApi =
        loginData.token ||
        loginData.sessionToken ||
        loginData.data?.SessionToken;

      if (!userFromApi || !tokenFromApi) {
        console.warn(
          "Login response didn't contain expected user/token —",
          loginData
        );
        Alert.alert(
          "Login Failed",
          "Could not retrieve token from server. Please try again."
        );
        setLoading(false);
        return;
      }

      await login(userFromApi, tokenFromApi, sessionFromApi);
      const profileKey = userFromApi?.id
        ? `profileCompleted:${userFromApi.id}`
        : null;
      if (profileKey) {
        await AsyncStorage.setItem(profileKey, "true");
      }
      updateUser({ ...userFromApi, role: "pet", profileCompleted: true });
      Alert.alert("Success", "Login successful! Welcome back.");
      navigation.navigate("HomePage");
    } catch (error) {
      console.error("❌ Login error:", error);
      const errorMessage = handleApiError(error, "email login");
      Alert.alert("Login Failed", errorMessage);
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
    navigation.navigate("ForgotPassword");
  };

  const handleSignUp = () => {
    navigation.navigate("SignUp");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ImageBackground
          style={styles.backgroundImage}
          source={require("../assets/girlHandlingDog.png")}
          resizeMode="cover"
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.logoContainer}>
              <Image
                style={styles.logoImage}
                source={require("../assets/snoutiqBlueLogo.png")}
                resizeMode="contain"
              />
            </View>

            <View style={styles.contentContainer}>
              <View style={styles.headerContainer}>
                <Text style={styles.loginTxt}>Welcome Back</Text>
                <Text style={styles.smallText}>
                  Sign in to continue to Snoutiq
                </Text>
              </View>

              <View style={styles.formContainer}>
                <CustomInput
                  title="Email"
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

                <TouchableOpacity
                  onPress={handleForgotPassword}
                  style={styles.forgotPassword}
                >
                  <Text style={styles.forgotPasswordText}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>

                <CustomButton
                  title="Sign In"
                  onPress={handleSubmit}
                  loading={loading}
                />

                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                  style={styles.googleButton}
                  onPress={handleGoogleSignIn}
                  disabled={!isGoogleConfigured || googleLoading}
                  activeOpacity={0.7}
                >
                  {googleLoading ? (
                    <ActivityIndicator color="#4285F4" size="small" />
                  ) : (
                    <>
                      <Image
                        source={{
                          uri: "https://developers.google.com/identity/images/g-logo.png",
                        }}
                        style={styles.googleIcon}
                      />
                      <Text style={styles.googleButtonText}>
                        Continue with Google
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {!isGoogleConfigured && (
                  <Text style={styles.configWarning}>
                    Initializing Google Sign-In...
                  </Text>
                )}

                <View style={styles.signUpContainer}>
                  <Text style={styles.signUpText}>
                    Don't have an account?{" "}
                    <Text style={styles.signUpLink} onPress={handleSignUp}>
                      Sign Up
                    </Text>
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </ImageBackground>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = {
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: verticalScale(30),
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  logoContainer: {
    alignSelf: "flex-start",
    padding: moderateScale(20),
    paddingTop: Platform.OS === "ios" ? verticalScale(50) : verticalScale(20),
  },
  logoImage: {
    width: scale(140),
    height: verticalScale(45),
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    paddingTop: verticalScale(20),
  },
  headerContainer: {
    paddingHorizontal: scale(30),
    marginBottom: verticalScale(30),
  },
  loginTxt: {
    fontSize: moderateScale(36),
    fontWeight: "700",
    color: colors.black,
    marginBottom: verticalScale(8),
  },
  smallText: {
    fontSize: moderateScale(15),
    fontWeight: "400",
    color: colors.textGray,
  },
  formContainer: {
    width: "100%",
    paddingHorizontal: scale(30),
  },
  inputContainer: {
    marginBottom: verticalScale(20),
  },
  inputLabel: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: colors.darkGray,
    marginBottom: verticalScale(8),
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: moderateScale(2),
    borderBottomColor: colors.borderGray,
    paddingVertical: verticalScale(10),
    backgroundColor: "transparent",
  },
  inputWrapperFocused: {
    borderBottomColor: colors.primary,
  },
  inputError: {
    borderBottomColor: colors.error,
  },
  inputIcon: {
    fontSize: moderateScale(18),
    marginRight: scale(12),
  },
  textInput: {
    flex: 1,
    paddingVertical: verticalScale(5),
    fontSize: moderateScale(16),
    color: colors.darkGray,
  },
  eyeIcon: {
    padding: moderateScale(5),
  },
  eyeIconText: {
    fontSize: moderateScale(18),
  },
  errorText: {
    color: colors.error,
    fontSize: moderateScale(12),
    marginTop: verticalScale(5),
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: verticalScale(24),
  },
  forgotPasswordText: {
    fontSize: moderateScale(14),
    color: colors.primary,
    fontWeight: "600",
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(12),
    alignItems: "center",
    marginBottom: verticalScale(20),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: colors.white,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: verticalScale(24),
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
    fontWeight: "500",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: moderateScale(1.5),
    borderColor: "#dadce0",
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(20),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: verticalScale(50),
  },
  googleIcon: {
    width: moderateScale(20),
    height: moderateScale(20),
    marginRight: scale(12),
  },
  googleButtonText: {
    color: "#3c4043",
    fontSize: moderateScale(15),
    fontWeight: "600",
  },
  configWarning: {
    fontSize: moderateScale(12),
    color: colors.warning,
    marginTop: verticalScale(10),
    textAlign: "center",
  },
  signUpContainer: {
    alignItems: "center",
    paddingVertical: verticalScale(24),
  },
  signUpText: {
    fontSize: moderateScale(14),
    color: colors.textGray,
    textAlign: "center",
  },
  signUpLink: {
    fontWeight: "700",
    color: colors.primary,
  },
};

export default LoginScreen;
