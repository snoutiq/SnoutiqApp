import { useNavigation } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import {
  moderateScale,
  scale,
  ScaledSheet,
  verticalScale
} from 'react-native-size-matters';

const { width, height } = Dimensions.get('window');

// Pet Store Theme Colors (matching login)
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

// Custom Input Component (matching login style)
const CustomInput = ({ 
  title, 
  value, 
  onChangeText, 
  keyboardType = 'default', 
  autoCapitalize = 'sentences',
  icon,
  error
}) => {
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
          placeholder={`Enter your ${title.toLowerCase()}`}
          placeholderTextColor={colors.textGray}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

// Custom Button Component (matching login style)
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

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState('email');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentStep, setCurrentStep] = useState(1); // 1: Enter email/phone, 2: Enter OTP, 3: Reset password
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateStep = () => {
    let valid = true;
    let newErrors = {};

    if (currentStep === 1) {
      if (!identifier.trim()) {
        newErrors.identifier = `${selectedTab === 'email' ? 'Email' : 'Phone number'} is required`;
        valid = false;
      } else if (selectedTab === 'email' && !/^\S+@\S+\.\S+$/.test(identifier)) {
        newErrors.identifier = "Please enter a valid email";
        valid = false;
      } else if (selectedTab === 'mobile' && !/^\d{10}$/.test(identifier)) {
        newErrors.identifier = "Please enter a valid 10-digit number";
        valid = false;
      }
    } else if (currentStep === 2) {
      if (!otp.trim()) {
        newErrors.otp = "OTP is required";
        valid = false;
      } else if (!/^\d{6}$/.test(otp)) {
        newErrors.otp = "Please enter a valid 6-digit OTP";
        valid = false;
      }
    } else if (currentStep === 3) {
      if (!newPassword) {
        newErrors.newPassword = "New password is required";
        valid = false;
      } else if (newPassword.length < 6) {
        newErrors.newPassword = "Password must be at least 6 characters";
        valid = false;
      }

      if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const handleNext = async () => {
    setErrors({});
    
    if (!validateStep()) {
      return;
    }

    setLoading(true);
    try {
      if (currentStep === 1) {
        // Send OTP logic
        console.log(`Send OTP to ${selectedTab}:`, identifier);
        setCurrentStep(2);
      } else if (currentStep === 2) {
        // Verify OTP logic
        console.log('Verify OTP:', otp);
        setCurrentStep(3);
      } else if (currentStep === 3) {
        // Reset password logic
        console.log('Reset password');
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    console.log('Resend OTP');
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Forgot Password?';
      case 2: return 'Verify OTP';
      case 3: return 'Reset Password';
      default: return 'Forgot Password?';
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1: return `Enter your ${selectedTab} to receive reset code`;
      case 2: return `We've sent a code to your ${selectedTab}`;
      case 3: return 'Enter your new password';
      default: return 'Recover your account';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section (matching login) */}
        <View style={styles.headerSection}>
          <View style={styles.petIllustration}>
         <Image style={styles.logoContainer} source={require("../assets/snoutiqBlueLogo.png")} />
        </View>
          <Text style={styles.welcomeTitle}>{getStepTitle()}</Text>
          <Text style={styles.welcomeSubtitle}>{getStepSubtitle()}</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            {[1, 2, 3].map((step) => (
              <View key={step} style={styles.stepContainer}>
                <View style={[
                  styles.stepCircle,
                  currentStep >= step ? styles.activeStepCircle : styles.inactiveStepCircle
                ]}>
                  <Text style={[
                    styles.stepText,
                    currentStep >= step ? styles.activeStepText : styles.inactiveStepText
                  ]}>
                    {step}
                  </Text>
                </View>
                {step < 3 && (
                  <View style={[
                    styles.stepLine,
                    currentStep > step ? styles.activeStepLine : styles.inactiveStepLine
                  ]} />
                )}
              </View>
            ))}
          </View>

          {/* Step 1: Enter Email/Phone */}
          {currentStep === 1 && (
            <>
              {/* Tab Selector */}
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
                  value={identifier}
                  onChangeText={setIdentifier}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  icon="📧"
                  error={errors.identifier}
                />
              ) : (
                <CustomInput
                  title="Phone Number"
                  value={identifier}
                  onChangeText={setIdentifier}
                  keyboardType="phone-pad"
                  icon="📱"
                  error={errors.identifier}
                />
              )}
            </>
          )}

          {/* Step 2: Enter OTP */}
          {currentStep === 2 && (
            <>
              <CustomInput
                title="Verification Code"
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                icon="🔢"
                error={errors.otp}
              />
              
              <TouchableOpacity onPress={handleResendOTP} style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive code? </Text>
                <Text style={styles.resendLink}>Resend</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Step 3: Reset Password */}
          {currentStep === 3 && (
            <>
              <CustomInput
                title="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                icon="🔒"
                error={errors.newPassword}
              />

              <CustomInput
                title="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                icon="🔒"
                error={errors.confirmPassword}
              />
            </>
          )}

          {/* Action Button */}
          <CustomButton
            title={
              currentStep === 1 ? 'Send Code' :
              currentStep === 2 ? 'Verify Code' :
              'Reset Password'
            }
            onPress={handleNext}
            loading={loading}
          />

          {/* Back to Login */}
          <TouchableOpacity style={styles.backToLoginContainer} onPress={handleBackToLogin}>
            <Text style={styles.backToLoginText}>
              Remember your password? 
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
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(25),
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(15),
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStepCircle: {
    backgroundColor: colors.primary,
  },
  inactiveStepCircle: {
    backgroundColor: colors.lightGray,
    borderWidth: moderateScale(2),
    borderColor: colors.borderGray,
  },
  stepText: {
    fontSize: moderateScale(12),
    fontWeight: 'bold',
  },
  activeStepText: {
    color: colors.white,
  },
  inactiveStepText: {
    color: colors.textGray,
  },
  stepLine: {
    width: scale(30),
    height: moderateScale(2),
  },
  activeStepLine: {
    backgroundColor: colors.primary,
  },
  inactiveStepLine: {
    backgroundColor: colors.borderGray,
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
    marginBottom: verticalScale(12),
  },
  inputLabel: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: colors.darkGray,
    marginBottom: verticalScale(6),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: moderateScale(1.5),
    borderColor: colors.borderGray,
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(15),
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.1,
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: '#FFF5F5',
  },
  inputIcon: {
    fontSize: moderateScale(18),
    marginRight: scale(12),
  },
  textInput: {
    flex: 1,
    paddingVertical: verticalScale(12),
    fontSize: moderateScale(15),
    color: colors.darkGray,
  },
  errorText: {
    color: colors.error,
    fontSize: moderateScale(11),
    marginTop: verticalScale(3),
    fontWeight: '500',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: verticalScale(15),
  },
  resendText: {
    fontSize: moderateScale(14),
    color: colors.textGray,
  },
  resendLink: {
    fontSize: moderateScale(14),
    color: colors.primary,
    fontWeight: '600',
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

export default ForgotPasswordScreen;