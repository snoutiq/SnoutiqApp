import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import axios from "axios";
import { useNavigation } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {
  moderateScale,
  scale,
  ScaledSheet,
  verticalScale
} from 'react-native-size-matters';
import { useAuth } from "../context/AuthContext";

// const { width, height } = Dimensions.get('window');

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
  error: '#E74C3C'
};

// Configure WebBrowser for auth session
WebBrowser.maybeCompleteAuthSession();

// Custom Button Component
const CustomButton = ({ title, onPress, loading = false, style, variant = 'primary' }) => (
  <TouchableOpacity 
    style={[
      styles.button, 
      variant === 'secondary' && styles.secondaryButton,
      style
    ]} 
    onPress={onPress}
    disabled={loading}
  >
    {loading ? (
      <ActivityIndicator color={colors.white} size={moderateScale(20)} />
    ) : (
      <Text style={[
        styles.buttonText,
        variant === 'secondary' && styles.secondaryButtonText
      ]}>
        {title}
      </Text>
    )}
  </TouchableOpacity>
);

const SignUpScreen = () => {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [userType, setUserType] = useState('pet_owner');
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [userId, setUserId] = useState(null);

  // Store email, google_token, and userId in AsyncStorage when Google account is selected
  useEffect(() => {
    if (selectedGoogleAccount?.email && selectedGoogleAccount?.google_token && userId) {
      AsyncStorage.multiSet([
        ['userEmail', selectedGoogleAccount.email],
        ['googleSub', selectedGoogleAccount.google_token],
        ['userId', userId.toString()]
      ]).catch(err => console.error("Failed to save email, google_token, or userId:", err));
    }
  }, [selectedGoogleAccount, userId]);

  const handleGoogleSuccess = async (idToken) => {
    try {
      setLoading(true);
      console.log("Google OAuth success, ID Token:", idToken);

      // Decode Google JWT to get the sub (unique ID)
      const base64Url = idToken.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      const googleData = JSON.parse(jsonPayload);
      console.log("Google user data:", googleData);
      console.log("Google unique ID (sub):", googleData.sub);

      // Call initial-register API
      const initialRegisterResponse = await axios.post(
        "https://snoutiq.com/backend/api/auth/initial-register",
        {
          fullName: googleData.name,
          email: googleData.email,
          google_token: googleData.sub,
        }
      );

      console.log("Initial register response:", initialRegisterResponse.data);

      if (initialRegisterResponse.data.status === "error") {
        Alert.alert("Error", initialRegisterResponse.data.message || "Initial registration failed. Please try again.");
        return;
      }

      const userId = initialRegisterResponse.data.user_id;

      const account = {
        idToken,
        email: googleData.email || "",
        name: googleData.name || "",
        avatar: googleData.picture || null,
        google_token: googleData.sub
      };

      setSelectedGoogleAccount(account);
      setUserId(userId);

      // Save to AsyncStorage
      await AsyncStorage.multiSet([
        ['userEmail', googleData.email],
        ['googleSub', googleData.sub],
        ['userId', userId.toString()]
      ]);

      console.log("✅ Google sub and userId saved to AsyncStorage:", googleData.sub, userId);

      // Attempt login
      try {
        const loginResponse = await axios.post(
          "https://snoutiq.com/backend/api/auth/login",
          {
            login: googleData.email,
            role: 'pet'
          }
        );
        console.log("Login response:", loginResponse.data);

        const loginData = loginResponse.data || {};
        const user = loginData.user || loginData.data?.user || loginData.data;
        const token = loginData.token || loginData.accessToken || loginData.data?.token;
        const chatRoomToken = loginData.chat_room?.token || loginData.sessionToken || loginData.data?.SessionToken || null;

        if (user && token) {
          await login(user, token, chatRoomToken);
          Alert.alert("✅ Registration & Login successful!");
        } else {
          console.error("Invalid login response:", loginData);
          Alert.alert("Success", "Registration successful! Please login with your credentials.");
          navigation.navigate('Login');
        }
      } catch (loginError) {
        console.error("Login API error:", {
          message: loginError.message,
          response: loginError.response?.data,
          status: loginError.response?.status
        });
        Alert.alert("Success", "Registration successful! Please login with your credentials.");
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error("Google login failed:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.message || "Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const startSignInFlow = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const signInResponse = await GoogleSignin.signIn();
      
      if (signInResponse.type === 'success') {
        console.log('✅ Google Sign-In Successful. Account Data:', signInResponse.data);
        await handleGoogleSuccess(signInResponse.data.idToken);
      } else if (signInResponse.type === 'noSavedCredentialFound') {
        console.log('ℹ️ No saved credentials found.');
        const createResponse = await GoogleSignin.createAccount();
        
        if (createResponse.type === 'success') {
          console.log('✅ Google Account Creation Successful. Account Data:', createResponse.data);
          await handleGoogleSuccess(createResponse.data.idToken);
        } else if (createResponse.type === 'noSavedCredentialFound') {
          console.log('ℹ️ No Google user account present on device.');
          const explicitResponse = await GoogleSignin.presentExplicitSignIn();
          
          if (explicitResponse.type === 'success') {
            console.log('✅ Explicit Google Sign-In Successful. Account Data:', explicitResponse.data);
            await handleGoogleSuccess(explicitResponse.data.idToken);
          } else {
            console.log('ℹ️ Explicit sign-in failed or cancelled:', explicitResponse);
          }
        }
      } else {
        console.log('ℹ️ Google Sign-In Cancelled or Failed:', signInResponse);
      }
    } catch (error) {
      console.error('❌ Main Google Sign-In Error:', error);
      Alert.alert("Error", "An error occurred during Google Sign-In. Please try again.");
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerSection}>
          <View style={styles.petIllustration}>
            <Image style={styles.logoContainer} source={require("../assets/snoutiqBlueLogo.png")} />
          </View>
          <Text style={styles.welcomeTitle}>Create Account</Text>
          <Text style={styles.welcomeSubtitle}>Choose your role and connect with Google</Text>
        </View>

        <View style={styles.formContainer}>
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
                <Text style={styles.toggleIcon}>🐾</Text>
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
          
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <GoogleSigninButton
              onPress={startSignInFlow}
              label="Register with Google"
            />
          </View>

          <TouchableOpacity style={styles.backToLoginContainer} onPress={handleBackToLogin}>
            <Text style={styles.backToLoginText}>
              Already have an account? 
              <Text style={styles.backToLoginLink}> Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  logoContainer: {
    height: verticalScale(40),
    width: "80%",
    borderRadius: moderateScale(20),
    resizeMode: "contain",
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: verticalScale(15),
    paddingBottom: verticalScale(20),
    backgroundColor: colors.primary,
    borderBottomLeftRadius: moderateScale(30),
    borderBottomRightRadius: moderateScale(30),
  },
  petIllustration: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: moderateScale(40),
    paddingVertical: moderateScale(5),
    paddingHorizontal: moderateScale(1),
    marginTop: verticalScale(20),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  welcomeTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: colors.white,
    marginVertical: verticalScale(3),
  },
  welcomeSubtitle: {
    fontSize: moderateScale(14),
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(18),
  },
  userTypeContainer: {
    marginBottom: verticalScale(20),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: colors.darkGray,
    marginBottom: verticalScale(12),
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.lightGray,
    padding: moderateScale(4),
    borderRadius: moderateScale(12),
  },
  toggleOption: {
    flex: 1,
    paddingVertical: verticalScale(5),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeToggle: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
  button: {
    backgroundColor: colors.primary,
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    marginBottom: verticalScale(12),
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: colors.white,
  },
  secondaryButton: {
    backgroundColor: colors.white,
    borderWidth: moderateScale(1.5),
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    color: colors.primary,
  },
  backToLoginContainer: {
    alignItems: 'center',
    paddingBottom: verticalScale(20),
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

export default SignUpScreen;