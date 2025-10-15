import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 667) * size;
const moderateScale = (size, factor = 0.3) => size + (scale(size) - size) * factor;

const DESIGN = {
  TYPOGRAPHY: {
    h1: moderateScale(24),
    h2: moderateScale(20),
    h3: moderateScale(18),
    body: moderateScale(15),
    bodySmall: moderateScale(14),
    caption: moderateScale(13),
    tiny: moderateScale(11),
  },
  SPACING: {
    xs: scale(8),
    sm: scale(12),
    md: scale(16),
    lg: scale(20),
    xl: scale(24),
    xxl: scale(32),
  },
  VERTICAL_SPACING: {
    xs: verticalScale(8),
    sm: verticalScale(12),
    md: verticalScale(16),
    lg: verticalScale(20),
    xl: verticalScale(24),
  },
  RADIUS: {
    sm: moderateScale(8),
    md: moderateScale(12),
    lg: moderateScale(16),
    xl: moderateScale(20),
    full: moderateScale(999),
  },
  COLORS: {
    primary: '#667eea',
    secondary: '#764ba2',
    white: '#FFFFFF',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray400: '#9CA3AF',
    gray600: '#6B7280',
    gray700: '#374151',
    gray900: '#1F2937',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    background: '#F0F4FF',
  },
};

const ChangePasswordScreen = ({ navigation }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasUppercase, setHasUppercase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  useEffect(() => {
    setHasMinLength(newPassword.length >= 8);
    setHasUppercase(/[A-Z]/.test(newPassword));
    setHasNumber(/[0-9]/.test(newPassword));
    setHasSpecialChar(/[!@#$%^&*(),.?":{}|<>]/.test(newPassword));
    setPasswordsMatch(newPassword === confirmPassword && confirmPassword !== '');
  }, [newPassword, confirmPassword]);

  const handleChangePassword = () => {
    if (!oldPassword) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }
    if (hasMinLength && hasUppercase && hasNumber && hasSpecialChar && passwordsMatch) {
      Alert.alert('Success', 'Password changed successfully!');
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Please meet all password requirements');
    }
  };

  const isFormValid = hasMinLength && hasUppercase && hasNumber && hasSpecialChar && passwordsMatch && oldPassword;

  const RequirementItem = ({ met, text }) => (
    <View style={styles.requirementItem}>
      <View style={[styles.checkbox, met && styles.checkboxMet]}>
        {met && <Ionicons name="checkmark" size={scale(14)} color={DESIGN.COLORS.white} />}
      </View>
      <Text style={[styles.requirementText, met && styles.requirementTextMet]}>
        {text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[DESIGN.COLORS.primary, DESIGN.COLORS.secondary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={scale(28)} color={DESIGN.COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Change Password</Text>
            <Text style={styles.headerSubtitle}>Keep your account secure</Text>
          </View>
          <View style={styles.headerPlaceholder} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={0}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Current Password */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Current Password</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="lock-closed-outline" size={scale(20)} color={DESIGN.COLORS.gray400} />
                </View>
                <TextInput
                  style={styles.input}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  placeholder="Enter your current password"
                  placeholderTextColor={DESIGN.COLORS.gray400}
                  secureTextEntry={!showOldPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity 
                  onPress={() => setShowOldPassword(!showOldPassword)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={showOldPassword ? 'eye-outline' : 'eye-off-outline'} 
                    size={scale(22)} 
                    color={DESIGN.COLORS.gray600}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="key-outline" size={scale(20)} color={DESIGN.COLORS.gray400} />
                </View>
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter your new password"
                  placeholderTextColor={DESIGN.COLORS.gray400}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity 
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={showNewPassword ? 'eye-outline' : 'eye-off-outline'} 
                    size={scale(22)} 
                    color={DESIGN.COLORS.gray600}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="checkmark-circle-outline" size={scale(20)} color={DESIGN.COLORS.gray400} />
                </View>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter your new password"
                  placeholderTextColor={DESIGN.COLORS.gray400}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} 
                    size={scale(22)} 
                    color={DESIGN.COLORS.gray600}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Requirements */}
            <View style={styles.requirementsCard}>
              <View style={styles.requirementsHeader}>
                <Ionicons name="shield-checkmark" size={scale(20)} color={DESIGN.COLORS.primary} />
                <Text style={styles.requirementsTitle}>Password Requirements</Text>
              </View>
              <View style={styles.requirementsList}>
                <RequirementItem met={hasMinLength} text="At least 8 characters" />
                <RequirementItem met={hasUppercase} text="Contains uppercase letter (A-Z)" />
                <RequirementItem met={hasNumber} text="Contains number (0-9)" />
                <RequirementItem met={hasSpecialChar} text="Contains special character (!@#$%)" />
                <RequirementItem met={passwordsMatch} text="Passwords match" />
              </View>

              {/* Strength Indicator */}
              <View style={styles.strengthContainer}>
                <Text style={styles.strengthLabel}>Password Strength:</Text>
                <View style={styles.strengthBar}>
                  <View 
                    style={[
                      styles.strengthFill, 
                      { 
                        width: `${([hasMinLength, hasUppercase, hasNumber, hasSpecialChar].filter(Boolean).length / 4) * 100}%`,
                        backgroundColor: 
                          [hasMinLength, hasUppercase, hasNumber, hasSpecialChar].filter(Boolean).length <= 1 
                            ? DESIGN.COLORS.error 
                            : [hasMinLength, hasUppercase, hasNumber, hasSpecialChar].filter(Boolean).length <= 2
                            ? DESIGN.COLORS.warning
                            : [hasMinLength, hasUppercase, hasNumber, hasSpecialChar].filter(Boolean).length <= 3
                            ? DESIGN.COLORS.info
                            : DESIGN.COLORS.success
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.strengthText}>
                  {[hasMinLength, hasUppercase, hasNumber, hasSpecialChar].filter(Boolean).length <= 1 
                    ? 'Weak' 
                    : [hasMinLength, hasUppercase, hasNumber, hasSpecialChar].filter(Boolean).length <= 2
                    ? 'Fair'
                    : [hasMinLength, hasUppercase, hasNumber, hasSpecialChar].filter(Boolean).length <= 3
                    ? 'Good'
                    : 'Strong'}
                </Text>
              </View>
            </View>

            {/* Help Section */}
            <View style={styles.helpCard}>
              <View style={styles.helpIconContainer}>
                <Ionicons name="information-circle" size={scale(24)} color={DESIGN.COLORS.info} />
              </View>
              <View style={styles.helpContent}>
                <Text style={styles.helpTitle}>Security Tip</Text>
                <Text style={styles.helpText}>
                  Choose a strong password that you haven't used before. Avoid using common words or personal information.
                </Text>
              </View>
            </View>

            {/* Change Password Button */}
            <TouchableOpacity 
              style={[styles.changeButton, !isFormValid && styles.changeButtonDisabled]}
              onPress={handleChangePassword}
              disabled={!isFormValid}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isFormValid 
                  ? [DESIGN.COLORS.primary, DESIGN.COLORS.secondary] 
                  : [DESIGN.COLORS.gray300, DESIGN.COLORS.gray300]
                }
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="shield-checkmark" size={scale(20)} color={DESIGN.COLORS.white} />
                <Text style={styles.changeButtonText}>Update Password</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Forgot Password Link */}
            <TouchableOpacity 
              style={styles.forgotButton}
              onPress={() => Alert.alert('Forgot Password', 'Password reset link will be sent to your email.')}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotText}>Forgot your password?</Text>
              <Ionicons name="arrow-forward" size={scale(16)} color={DESIGN.COLORS.primary} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN.COLORS.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: DESIGN.SPACING.lg,
    paddingTop: DESIGN.SPACING.md,
    paddingBottom: DESIGN.SPACING.xl,
    borderBottomLeftRadius: DESIGN.RADIUS.xl,
    borderBottomRightRadius: DESIGN.RADIUS.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: DESIGN.SPACING.xs,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: DESIGN.TYPOGRAPHY.h1,
    fontWeight: '700',
    color: DESIGN.COLORS.white,
    marginBottom: DESIGN.SPACING.xs / 2,
  },
  headerSubtitle: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  headerPlaceholder: {
    width: scale(28),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: DESIGN.SPACING.xxl * 2,
  },
  content: {
    paddingHorizontal: DESIGN.SPACING.lg,
    paddingTop: DESIGN.SPACING.xl,
  },
  inputWrapper: {
    marginBottom: DESIGN.SPACING.lg,
  },
  label: {
    fontSize: DESIGN.TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: DESIGN.COLORS.gray700,
    marginBottom: DESIGN.SPACING.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DESIGN.COLORS.white,
    borderRadius: DESIGN.RADIUS.md,
    borderWidth: 2,
    borderColor: DESIGN.COLORS.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIconContainer: {
    paddingLeft: DESIGN.SPACING.md,
  },
  input: {
    flex: 1,
    paddingVertical: DESIGN.SPACING.md,
    paddingHorizontal: DESIGN.SPACING.sm,
    fontSize: DESIGN.TYPOGRAPHY.body,
    color: DESIGN.COLORS.gray900,
  },
  eyeButton: {
    paddingHorizontal: DESIGN.SPACING.md,
    paddingVertical: DESIGN.SPACING.md,
  },
  requirementsCard: {
    backgroundColor: DESIGN.COLORS.white,
    borderRadius: DESIGN.RADIUS.lg,
    padding: DESIGN.SPACING.lg,
    marginTop: DESIGN.SPACING.md,
    marginBottom: DESIGN.SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
  },
  requirementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN.SPACING.sm,
    marginBottom: DESIGN.SPACING.md,
  },
  requirementsTitle: {
    fontSize: DESIGN.TYPOGRAPHY.body,
    fontWeight: '700',
    color: DESIGN.COLORS.gray900,
  },
  requirementsList: {
    gap: DESIGN.SPACING.md,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN.SPACING.sm,
  },
  checkbox: {
    width: scale(22),
    height: scale(22),
    borderRadius: scale(6),
    borderWidth: 2,
    borderColor: DESIGN.COLORS.gray300,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DESIGN.COLORS.gray100,
  },
  checkboxMet: {
    backgroundColor: DESIGN.COLORS.success,
    borderColor: DESIGN.COLORS.success,
  },
  requirementText: {
    fontSize: DESIGN.TYPOGRAPHY.bodySmall,
    color: DESIGN.COLORS.gray600,
    flex: 1,
  },
  requirementTextMet: {
    color: DESIGN.COLORS.gray900,
    fontWeight: '500',
  },
  strengthContainer: {
    marginTop: DESIGN.SPACING.lg,
    paddingTop: DESIGN.SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: DESIGN.COLORS.gray200,
  },
  strengthLabel: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    fontWeight: '600',
    color: DESIGN.COLORS.gray700,
    marginBottom: DESIGN.SPACING.sm,
  },
  strengthBar: {
    height: verticalScale(8),
    backgroundColor: DESIGN.COLORS.gray200,
    borderRadius: DESIGN.RADIUS.sm,
    overflow: 'hidden',
    marginBottom: DESIGN.SPACING.sm,
  },
  strengthFill: {
    height: '100%',
    borderRadius: DESIGN.RADIUS.sm,
  },
  strengthText: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    fontWeight: '600',
    color: DESIGN.COLORS.gray600,
    textAlign: 'right',
  },
  helpCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderRadius: DESIGN.RADIUS.md,
    padding: DESIGN.SPACING.md,
    marginBottom: DESIGN.SPACING.xl,
    borderLeftWidth: 4,
    borderLeftColor: DESIGN.COLORS.info,
  },
  helpIconContainer: {
    marginRight: DESIGN.SPACING.md,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: DESIGN.TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    color: DESIGN.COLORS.info,
    marginBottom: DESIGN.SPACING.xs / 2,
  },
  helpText: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    color: DESIGN.COLORS.gray700,
    lineHeight: scale(18),
  },
  changeButton: {
    borderRadius: DESIGN.RADIUS.lg,
    overflow: 'hidden',
    shadowColor: DESIGN.COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  changeButtonDisabled: {
    shadowOpacity: 0.1,
  },
  buttonGradient: {
    flexDirection: 'row',
    paddingVertical: DESIGN.SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: DESIGN.SPACING.sm,
  },
  changeButtonText: {
    fontSize: DESIGN.TYPOGRAPHY.body,
    fontWeight: '700',
    color: DESIGN.COLORS.white,
  },
  forgotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DESIGN.SPACING.xs,
    marginTop: DESIGN.SPACING.lg,
    paddingVertical: DESIGN.SPACING.md,
  },
  forgotText: {
    fontSize: DESIGN.TYPOGRAPHY.bodySmall,
    color: DESIGN.COLORS.primary,
    fontWeight: '600',
  },
});