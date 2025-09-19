
import axios from "axios";
import { useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GoogleSignin,
  GoogleSigninButton
} from '@react-native-google-signin/google-signin';
import {
  moderateScale,
  scale,
  ScaledSheet,
  verticalScale
} from 'react-native-size-matters';
import { useAuth } from "../context/AuthContext";
const { width, height } = Dimensions.get('window');

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
    const [role,setRole] = useState('')
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
  const { login,updateUser } = useAuth();
  const [selectedTab, setSelectedTab] = useState('email');
  const [formData, setFormData] = useState({
    login: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    
        GoogleSignin.configure({
          webClientId:'325007826401-dhsrqhkpoeeei12gep3g1sneeg5880o7.apps.googleusercontent.com',
    iosClientId: "325007826401-a3l72e9mlcii4cf7l55vufht2qlc3t6a.apps.googleusercontent.com", 
    offlineAccess: true, 
    scopes: ["profile", "email"]
  });
  }, [])


  const processLoginResponse = async (loginRes) => {
  const loginData = loginRes.data || {};
  const userFromApi = loginData.user || loginData.data?.user || loginData.data;
  const tokenFromApi = loginData.token || loginData.accessToken || loginData.data?.token;
  const sessionFromApi = loginData.token || loginData.sessionToken || loginData.data?.SessionToken;

  if (!userFromApi || !tokenFromApi) {
    console.warn("Login response didn't contain expected user/token —", loginData);
    Alert.alert("Login failed", "Could not retrieve token from server. Check response.");
    return false;
  }

  // save to context / AsyncStorage
  await login(userFromApi, tokenFromApi, sessionFromApi);
  Alert.alert("Login successful!");
  return true;
};
  
console.log();


//   const startSignInFlow = async () => {
    
//     try { // move this to after your app starts
//       await GoogleSignin.hasPlayServices();
//       const signInResponse = await GoogleSignin.signIn();
//       console.log(signInResponse,'res');
      
//       if (signInResponse.type === 'success') {
        
//         // (many backends accept social token this way; if your backend expects different keys, see Option B)
//         try {
//           const loginRes = await axios.post(
//             "https://snoutiq.com/backend/api/google-login",
//             {
//               email:signInResponse?.data?.user?.email,
//               google_token: signInResponse?.data?.idToken,
//               role:'pet'
//             }
//           );
//           console.log('hii');
// console.log(loginRes,'rea');

//       const ok = await processLoginResponse(loginRes);
//       if (ok) {
//         setLoading(false);
//         return;
//       }
//       // if processLoginResponse returned false, fall through to try alternative payloads below
//     } catch (error) {
//       console.error("❌ Login error:", error);
//       if (error.response && error.response.status === 401) {
//         Alert.alert("Error", "Invalid credentials. Please try again.");
//       } else {
//         Alert.alert("Error", "Login failed. Please try again.");
//       }
//     }
//         // use signInResponse.data
//       } else if (signInResponse.type === 'noSavedCredentialFound') {
//         // the user wasn't previously signed into this app
//         const createResponse = await GoogleSignin.createAccount();
//         if (createResponse.type === 'success') {
//           console.log('suuceessfull')
//           // use createResponse.data
//         } else if (createResponse.type === 'noSavedCredentialFound') {
//           console.log('no saved')
//           // no Google user account was present on the device yet (unlikely but possible)
//           const explicitResponse =
//           await GoogleSignin.presentExplicitSignIn();
          
//           if (explicitResponse.type === 'success') {
//             console.log('no success')
//             // use explicitResponse.data
//           }
//         }
//       }
//       // the else branches correspond to the user canceling the sign in
//     } catch (error) {
//       console.log('main derror:',error)
//       // handle error
//     }
//   };

const startSignInFlow = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const signInResponse = await GoogleSignin.signIn();
    console.log('Google SignIn Response:', signInResponse);
    
    if (signInResponse.type === 'success') {
      const user = signInResponse.data.user;
      const idToken = signInResponse.data.idToken;
      
      console.log('User Email:', user.email);
      console.log('ID Token:', idToken);
      console.log('User ID:', user.id);

      try {
        // Try Option 1: Using the Google token directly
        const loginRes = await axios.post(
          "https://snoutiq.com/backend/api/google-login",
          {
            email: user.email,
            google_token: idToken, // Using the ID token
            role: 'pet' // Changed from 'pet' to 'pet_owner'
          }
        );
        
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
            
            const alternativeLoginRes = await axios.post(
              "https://snoutiq.com/backend/api/google-login",
              {
                email: user.email,
                google_token: user.id, // Using the user ID instead of ID token
                role: 'pet'
              }
            );
            
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
          Alert.alert("Error", "Google login failed. Please try again.");
        }
      }
      
    } else if (signInResponse.type === 'noSavedCredentialFound') {
      console.log('No saved credentials found.');
      const createResponse = await GoogleSignin.createAccount();
      
      if (createResponse.type === 'success') {
        console.log('Account creation successful:', createResponse.data);
        // Handle account creation success similarly
      } else {
        console.log('Account creation failed or cancelled.');
      }
    } else {
      console.log('Google Sign-In cancelled or failed:', signInResponse);
    }
  } catch (error) {
    console.error('❌ Main Google Sign-In Error:', error);
    Alert.alert("Error", "An error occurred during Google Sign-In. Please try again.");
  }
};
  const validateForm = () => {
    let valid = true;
    let newErrors = {};

    if (!formData.login.trim()) {
      newErrors.login = selectedTab === 'email' 
        ? "Email is required" 
        : "Mobile number is required";
      valid = false;
    } else if (selectedTab === 'email' && !/^\S+@\S+\.\S+$/.test(formData.login)) {
      newErrors.login = "Invalid email format";
      valid = false;
    } else if (selectedTab === 'mobile' && !/^\d{10}$/.test(formData.login)) {
      newErrors.login = "Enter valid 10-digit mobile number";
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
      // Login API call
      const loginRes = await axios.post("https://snoutiq.com/backend/api/auth/login", {
        login: formData.login,
        password: formData.password,
        role:'pet'
      });

      // Extract user data and tokens from response
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

      // Call context login -> saves to AsyncStorage and flips isLoggedIn
      await login(userFromApi, tokenFromApi, sessionFromApi);

       const profileKey = userFromApi?.id ? `profileCompleted:${userFromApi.id}` : null;
await AsyncStorage.setItem(profileKey, 'true');
updateUser({ ...userFromApi, role: "pet", profileCompleted: true });
          Alert.alert("✅ Login successful!");
      // Navigation will be handled by the auth context typically

    } catch (error) {
      console.error("❌ Login error:", error);
      if (error.response && error.response.status === 401) {
        Alert.alert("Error", "Invalid credentials. Please try again.");
      } else {
        Alert.alert("Error", "Login failed. Please try again.");
      }
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
          <Text style={styles.welcomeTitle}>Welcome Back!</Text>
          <Text style={styles.welcomeSubtitle}>Sign in to continue your pet care journey</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                selectedTab === 'email' ? styles.activeTab : styles.inactiveTab
              ]}
              onPress={() => setSelectedTab('email')}
            >
              <Text style={[
                styles.tabText,
                selectedTab === 'email' ? styles.activeTabText : styles.inactiveTabText
              ]}>
                Email
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                selectedTab === 'mobile' ? styles.activeTab : styles.inactiveTab
              ]}
              onPress={() => setSelectedTab('mobile')}
            >
              <Text style={[
                styles.tabText,
                selectedTab === 'mobile' ? styles.activeTabText : styles.inactiveTabText
              ]}>
                Phone
              </Text>
            </TouchableOpacity>
          </View>

          {selectedTab === 'email' ? (
            <CustomInput
              title="Email Address"
              value={formData.login}
              onChangeText={(text) => handleChange("login", text)}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="📧"
              error={errors.login}
            />
          ) : (
            <CustomInput
              title="Phone Number"
              value={formData.login}
              onChangeText={(text) => handleChange("login", text)}
              keyboardType="phone-pad"
              icon="📱"
              error={errors.login}
            />
          )}

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

          {/* Social Login Buttons */}
          <View style={{ alignItems: "center", marginTop: 10 }}>


 <GoogleSigninButton onPress={startSignInFlow} label="Sign in with Google" />;

</View>

          <TouchableOpacity style={styles.signUpContainer} onPress={handleSignUp}>
            <Text style={styles.signUpText}>
              Don't have an account?
              <Text style={styles.signUpLink}> Register</Text>
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
    backgroundColor: colors.background 
  },
  scrollView: { 
    flex: 1 
  },
  scrollContent: { 
    flexGrow: 1 
  },
  logoContainer: { 
    height: verticalScale(40), 
    width: "80%", 
    resizeMode: "contain" 
  },
    petIllustration: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: moderateScale(40),
    paddingVertical: moderateScale(5),
    paddingHorizontal: moderateScale(1),
    marginTop:verticalScale(20),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerSection: { 
    alignItems: "center", 
    paddingTop: verticalScale(20), 
    paddingBottom: verticalScale(30), 
    backgroundColor: colors.primary, 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30 
  },
  welcomeTitle: { 
    fontSize: moderateScale(24), 
    fontWeight: "700", 
    color: colors.white, 
    marginVertical: 5 
  },
  welcomeSubtitle: { 
    fontSize: moderateScale(15), 
    color: colors.white, 
    opacity: 0.9, 
    textAlign: "center" 
  },
  formContainer: { 
    flex: 1, 
    paddingHorizontal: scale(24), 
    paddingTop: verticalScale(30) 
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.lightGray,
    padding: moderateScale(4),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(15),
  },
  tab: {
    flex: 1,
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(10),
    alignItems: 'center',
  },
  activeTab: {
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
  inactiveTab: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.white,
  },
  inactiveTabText: {
    color: colors.textGray,
  },
  inputContainer: { 
    marginBottom: verticalScale(20) 
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
    borderWidth: 1.5, 
    borderColor: colors.borderGray, 
    borderRadius: 12, 
    paddingHorizontal: 15, 
    backgroundColor: colors.white 
  },
  inputWrapperFocused: { 
    borderColor: colors.primary 
  },
  inputError: { 
    borderColor: colors.error, 
    backgroundColor: "#FFF5F5" 
  },
  inputIcon: { 
    fontSize: 18, 
    marginRight: 12 
  },
  textInput: { 
    flex: 1, 
    paddingVertical: 15, 
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
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  secondaryButton: {
    backgroundColor: colors.white,
    borderWidth: moderateScale(1.5),
    borderColor: colors.primary,
  },
  buttonText: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: colors.white 
  },
  secondaryButtonText: {
    color: colors.primary,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: verticalScale(10),
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

  socialButton: {
    width: "75%",
    paddingVertical:verticalScale(5),
    alignSelf:"center",
    alignItems:"center",
    justifyContent:"center",
    borderRadius:moderateScale(15),
    backgroundColor:colors.lightGray,
    resizeMode:"cover",
    elevation:4,
    marginVertical:verticalScale(5)
  },
   socialIcon:{
    width:"65%",
    alignItems:"center",
    height:verticalScale(45)
   },
  signUpContainer: {
    alignItems: 'center',
    paddingBottom: verticalScale(20),
  },
  signUpText: {
    fontSize: moderateScale(14),
    color: colors.textGray,
    textAlign: 'center',
  },
  signUpLink: {
    fontWeight: 'bold',
    color: colors.primary,
  },
});

export default LoginScreen;