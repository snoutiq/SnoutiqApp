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
    View
} from 'react-native';
import {
    moderateScale,
    scale,
    ScaledSheet,
    verticalScale
} from 'react-native-size-matters';
import { useAuth } from "../context/AuthContext";

// Get screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
  borderGray: '#E8E8E8',
  textGray: '#7F8C8D',
  placeholderGray: '#BDC3C7',
  success: '#2ECC71',
  error: '#E74C3C',
  warning: '#F39C12',
  lightBlue: '#E8F4FD',
  darkBlue: '#2563EB'
};

// Shadows configuration
const shadows = {
  small: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  large: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
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

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBlue,
  },
  headerSection: {
    flex: 1,
    alignItems: 'center',
    paddingTop: verticalScale(20),
    paddingHorizontal: scale(20),
  },
  logoContainer: {
    alignSelf: 'flex-start',
    marginBottom: verticalScale(20),
    
  },
  logoImage: {
    width: scale(120),
    height: verticalScale(40),
    resizeMode: 'center',
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(20),
  },
  illustrationImage: {
    width: screenWidth * 0.8,
    height: screenWidth * 0.9,
  },
  contentSection: {
    backgroundColor:colors.white,
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
    paddingHorizontal: scale(30),
    paddingTop: verticalScale(30),
    // paddingBottom: verticalScale(20),
    minHeight: verticalScale(220),
  },
  ctaBadge: {
    alignSelf: 'center',
    backgroundColor: colors.darkBlue,
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
    marginBottom: verticalScale(20),
  },
  ctaBadgeText: {
    color: colors.white,
    fontSize: moderateScale(12),
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  mainHeading: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: colors.black,
    textAlign: 'center',
    lineHeight: moderateScale(32),
    marginBottom: verticalScale(30),
    paddingHorizontal: scale(10),
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: verticalScale(13),
    borderRadius: moderateScale(25),
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  welcomeButton: {
    marginBottom: verticalScale(25),
  },
  buttonText: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: 0.5,
  },
  additionalOptions: {
    alignItems: 'center',
  },
  signUpText: {
    fontSize: moderateScale(15),
    color: colors.textGray,
    textAlign: 'center',
  },
  signUpLink: {
    fontWeight: 'bold',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  bottomSafeArea: {
    backgroundColor: colors.white,
    paddingBottom: verticalScale(10),
  },
});

export default SplashScreen;