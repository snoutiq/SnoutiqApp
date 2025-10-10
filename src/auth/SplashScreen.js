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
    View,
    Platform
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

// Colors configuration - Updated to match your theme
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
  lightBlue: '#F5F3FF', // Changed to match purple theme
  darkBlue: '#7C3AED' // Changed to match primary color
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
const CustomButton = ({ title, onPress, loading = false, style, variant = 'primary' }) => (
  <TouchableOpacity 
    style={[
      styles.button, 
      variant === 'secondary' && styles.secondaryButton,
      style
    ]} 
    onPress={onPress}
    disabled={loading}
    activeOpacity={0.8}
  >
    {loading ? (
      <ActivityIndicator color={colors.white} size={scale(20)} />
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

const SplashScreen = () => {
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

  const handleGetStarted = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('WelcomeScreen');
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.logoContainer}>
          <Image 
            source={require("../assets/snoutiqBlueLogo.png")} 
            style={styles.logoImage}
          />
        </View>
        
        {/* Image Container */}
        <View style={styles.imageContainer}>
          <Image 
            source={require("../assets/SplashFamily.png")}
            style={styles.illustrationImage}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.contentSection}>

        {/* Main Heading */}
        <Text style={styles.mainHeading}>
          Get started by finding the perfect companion for your family!
        </Text>

        {/* Welcome Button */}
        <CustomButton
          title="Welcome"
          onPress={handleGetStarted}
          loading={loading}
          style={styles.welcomeButton}
        />

        {/* Additional Options */}
        
      </View>

      {/* Bottom Safe Area */}
      <View style={styles.bottomSafeArea} />
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.lightBlue,
  },
  headerSection: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(30),
    paddingHorizontal: SPACING.lg,
  },
  logoContainer: {
    alignSelf: 'flex-start',
    marginBottom: verticalScale(20),
  },
  logoImage: {
    width: scale(120),
    height: verticalScale(40),
    resizeMode: 'contain',
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(20),
    maxHeight: screenHeight * 0.5,
  },
  illustrationImage: {
    width: Math.min(screenWidth * 0.8, scale(320)),
    height: Math.min(screenWidth * 0.8, scale(320)),
    maxWidth: scale(320),
    maxHeight: scale(320),
  },
  contentSection: {
    backgroundColor: colors.white,
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
    paddingHorizontal: SPACING.xl,
    paddingTop: verticalScale(30),
    paddingBottom: verticalScale(20),
    minHeight: verticalScale(220),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: scale(-4) },
    shadowOpacity: 0.1,
    shadowRadius: scale(12),
    elevation: 8,
  },
  ctaBadge: {
    alignSelf: 'center',
    backgroundColor: colors.darkBlue,
    paddingHorizontal: SPACING.lg,
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
    marginBottom: verticalScale(20),
  },
  ctaBadgeText: {
    color: colors.white,
    fontSize: FONT_SIZES.small,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  mainHeading: {
    fontSize: FONT_SIZES.xxxlarge,
    fontWeight: '700',
    color: colors.black,
    textAlign: 'center',
    lineHeight: FONT_SIZES.xxxlarge * 1.3,
    marginBottom: verticalScale(30),
    paddingHorizontal: SPACING.sm,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(25),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(56),
    ...shadows.medium,
  },
  welcomeButton: {
    marginBottom: verticalScale(25),
  },
  buttonText: {
    fontSize: FONT_SIZES.large,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  secondaryButtonText: {
    color: colors.white,
  },
  additionalOptions: {
    alignItems: 'center',
  },
  signUpText: {
    fontSize: FONT_SIZES.medium,
    color: colors.textGray,
    textAlign: 'center',
  },
  signUpLink: {
    fontWeight: '700',
    color: colors.primary,
  },
  bottomSafeArea: {
    backgroundColor: colors.white,
    paddingBottom: Platform.OS === 'ios' ? verticalScale(20) : verticalScale(10),
  },
};

export default SplashScreen;