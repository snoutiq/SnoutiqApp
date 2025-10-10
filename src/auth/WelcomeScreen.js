import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,Platform
} from 'react-native';
import {
    moderateScale,
    scale,
    verticalScale
} from 'react-native-size-matters';
import { useAuth } from "../context/AuthContext";

// Get screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive constants
const FONT_SIZES = {
  tiny: moderateScale(10),
  small: moderateScale(12),
  medium: moderateScale(14),
  large: moderateScale(16),
  xlarge: moderateScale(18),
  xxlarge: moderateScale(20),
  xxxlarge: moderateScale(24),
};

const SPACING = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(12),
  lg: moderateScale(16),
  xl: moderateScale(20),
  xxl: moderateScale(24),
};

// Colors configuration
const colors = {
  primary: '#7C3AED',
  secondary: '#EC4899',
  accent: '#FFD93D',
  background: '#F8FAFC',
  white: '#FFFFFF',
  black: '#1F2937',
  darkGray: '#374151',
  lightGray: '#F9FAFB',
  borderGray: '#E5E7EB',
  textGray: '#6B7280',
  placeholderGray: '#9CA3AF',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  orange: '#F97316'
};

// Shadows configuration
const shadows = {
  small: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: 3,
  },
  medium: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.15,
    shadowRadius: scale(8),
    elevation: 6,
  },
  large: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: scale(8) },
    shadowOpacity: 0.2,
    shadowRadius: scale(16),
    elevation: 12,
  }
};

// Custom Button Component
const CustomButton = ({ 
  title, 
  onPress, 
  loading = false, 
  style, 
  variant = 'primary',
  textStyle 
}) => (
  <TouchableOpacity 
    style={[
      styles.button, 
      variant === 'secondary' && styles.secondaryButton,
      variant === 'outline' && styles.outlineButton,
      style
    ]} 
    onPress={onPress}
    disabled={loading}
    activeOpacity={0.8}
  >
    {loading ? (
      <ActivityIndicator 
        color={variant === 'primary' ? colors.white : colors.primary} 
        size={scale(20)} 
      />
    ) : (
      <Text style={[
        styles.buttonText,
        variant === 'secondary' && styles.secondaryButtonText,
        variant === 'outline' && styles.outlineButtonText,
        textStyle
      ]}>
        {title}
      </Text>
    )}
  </TouchableOpacity>
);

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        const token = await AsyncStorage.getItem('token');
        
        if (userData && token && user) {
          // User is already logged in, navigate to main app
          navigation.navigate('MainApp');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };

    checkAuthStatus();
  }, [user, navigation]);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('login');
    }, 300);
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header with Logo */}
      <View style={styles.headerSection}>
        <View style={styles.logoContainer}>
          <Image 
            source={require("../assets/snoutiqBlueLogo.png")} 
            style={styles.logoImage}
          />
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Dog Illustration */}
        <View style={styles.dogContainer}>
          <Image 
            source={require("../assets/WelcomeDog.png")}
            style={styles.dogImage}
            resizeMode="contain"
          />
        </View>

        {/* Welcome Text */}
        <View style={styles.textContainer}>
          <Text style={styles.welcomeText}>
            Discover a world of joy and companionship at Happy pet
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {/* Login Button */}
          <CustomButton
            title="LOGIN"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
            textStyle={styles.loginButtonText}
          />

          {/* Signup Button */}
          <CustomButton
            title="SIGNUP"
            onPress={handleSignUp}
            variant="outline"
            style={styles.signupButton}
            textStyle={styles.signupButtonText}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerSection: {
    paddingTop: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(30),
    paddingHorizontal: SPACING.lg,
    paddingBottom: verticalScale(10),
  },
  logoContainer: {
    alignSelf: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: scale(120),
    height: verticalScale(40),
    resizeMode: 'contain',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: verticalScale(50),
    paddingTop: verticalScale(20),
  },
  dogContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(20),
    marginBottom: verticalScale(30),
    maxHeight: screenHeight * 0.4,
  },
  dogImage: {
    width: Math.min(screenWidth * 0.7, scale(280)),
    height: Math.min(screenWidth * 0.7, scale(280)),
    maxWidth: scale(280),
    maxHeight: scale(280),
  },
  textContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: verticalScale(40),
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: FONT_SIZES.xxxlarge,
    fontWeight: '700',
    color: colors.black,
    textAlign: 'center',
    lineHeight: FONT_SIZES.xxxlarge * 1.3,
    maxWidth: scale(300),
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: SPACING.md,
    maxWidth: scale(400),
    alignSelf: 'center',
  },
  button: {
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(16),
    minHeight: verticalScale(56),
  },
  loginButton: {
    backgroundColor: colors.primary,
    ...shadows.medium,
  },
  signupButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
    ...shadows.medium,
  },
  buttonText: {
    fontSize: FONT_SIZES.large,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loginButtonText: {
    color: colors.white,
  },
  signupButtonText: {
    color: colors.primary,
    fontWeight: '700',
  },
  outlineButtonText: {
    color: colors.primary,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: colors.white,
  },
};

export default WelcomeScreen;