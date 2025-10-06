// import React, { useState, useContext, useEffect } from 'react';
// import {
//     View,
//     Text,
//     StyleSheet,
//     ScrollView,
//     TouchableOpacity,
//     TextInput,
//     Alert,
//     ActivityIndicator
// } from 'react-native';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import { AuthContext } from '../context/AuthContext';
// import { SafeAreaView } from 'react-native-safe-area-context';

// const ChangePasswordScreen = ({ navigation, route }) => {
//     const { changePassword, user } = useContext(AuthContext);
//     const [currentPassword, setCurrentPassword] = useState('');
//     const [newPassword, setNewPassword] = useState('');
//     const [confirmPassword, setConfirmPassword] = useState('');
//     const [showCurrentPassword, setShowCurrentPassword] = useState(false);
//     const [showNewPassword, setShowNewPassword] = useState(false);
//     const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//     const [isLoading, setIsLoading] = useState(false);

//     // Check if user signed in via Google (has no password)
//     const isGoogleUser = !user.hasPassword;
//     const [passwordStrength, setPasswordStrength] = useState(0);

//     useEffect(() => {
//         let strength = 0;
//         if (newPassword.length >= 8) strength++;
//         if (/[A-Z]/.test(newPassword)) strength++;
//         if (/[0-9]/.test(newPassword)) strength++;
//         if (/[^A-Za-z0-9]/.test(newPassword)) strength++;
//         setPasswordStrength(strength);
//     }, [newPassword]);

//     const isGoogleOnlyUser = user.provider === 'google';
//     const hasExistingPassword = user.provider === 'local' || user.provider === 'both';

//     const handleChangePassword = async () => {
//         // Common validations
//         if (!newPassword || !confirmPassword) {
//             Alert.alert('Error', 'Please fill in all fields');
//             return;
//         }

//         if (newPassword !== confirmPassword) {
//             Alert.alert('Error', 'New passwords do not match');
//             return;
//         }

//         if (newPassword.length < 8) {
//             Alert.alert('Error', 'Password must be at least 8 characters long');
//             return;
//         }

//         // Special validation for users with existing passwords
//         if (hasExistingPassword && !currentPassword) {
//             Alert.alert('Error', 'Current password is required');
//             return;
//         }

//         setIsLoading(true);
//         try {
//             await changePassword(
//                 hasExistingPassword ? currentPassword : null,
//                 newPassword,
//                 isGoogleOnlyUser
//             );
//             Alert.alert('Success',
//                 isGoogleOnlyUser ? 'Password set successfully' : 'Password changed successfully'
//             );
//             navigation.goBack();
//         } catch (error) {
//             Alert.alert('Error', error.message);
//         } finally {
//             setIsLoading(false);
//         }
//     };
//     return (
//         <SafeAreaView style={styles.container}
//             contentContainerStyle={styles.contentContainer}>
//             <ScrollView
//                 keyboardShouldPersistTaps="handled"
//             >
//                 {/* Header */}
//                 <View style={styles.header}>
//                     <Ionicons
//                         name="arrow-back"
//                         size={24}
//                         color="#333"
//                         onPress={() => navigation.goBack()}
//                     />
//                     <Text style={styles.headerTitle}>
//                         {isGoogleUser ? 'Set Password' : 'Change Password'}
//                     </Text>
//                     <View style={{ width: 24 }} />
//                 </View>

//                 {/* Password Requirements */}
//                 <View style={styles.infoCard}>
//                     <Text style={styles.infoTitle}>Password Requirements</Text>
//                     <View style={styles.requirementItem}>
//                         <MaterialIcons
//                             name={newPassword.length >= 8 ? "check-circle" : "radio-button-unchecked"}
//                             size={16}
//                             color={newPassword.length >= 8 ? "#4CAF50" : "#666"}
//                         />
//                         <Text style={styles.requirementText}>At least 8 characters</Text>
//                     </View>
//                     <View style={styles.requirementItem}>
//                         <MaterialIcons
//                             name={/[A-Z]/.test(newPassword) ? "check-circle" : "radio-button-unchecked"}
//                             size={16}
//                             color={/[A-Z]/.test(newPassword) ? "#4CAF50" : "#666"}
//                         />
//                         <Text style={styles.requirementText}>At least one uppercase letter</Text>
//                     </View>
//                     <View style={styles.requirementItem}>
//                         <MaterialIcons
//                             name={/[0-9]/.test(newPassword) ? "check-circle" : "radio-button-unchecked"}
//                             size={16}
//                             color={/[0-9]/.test(newPassword) ? "#4CAF50" : "#666"}
//                         />
//                         <Text style={styles.requirementText}>At least one number</Text>
//                     </View>
//                     <View style={styles.requirementItem}>
//                         <MaterialIcons
//                             name={/[^A-Za-z0-9]/.test(newPassword) ? "check-circle" : "radio-button-unchecked"}
//                             size={16}
//                             color={/[^A-Za-z0-9]/.test(newPassword) ? "#4CAF50" : "#666"}
//                         />
//                         <Text style={styles.requirementText}>At least one special character</Text>
//                     </View>
//                 </View>

//                 {/* Current Password (only for non-Google users) */}
//                 {hasExistingPassword && (
//                     <View style={styles.inputContainer}>
//                         <Text style={styles.label}>Current Password</Text>
//                         <View style={styles.passwordInput}>
//                             <TextInput
//                                 style={styles.input}
//                                 placeholder="Enter current password"
//                                 placeholderTextColor="#999"
//                                 secureTextEntry={!showCurrentPassword}
//                                 value={currentPassword}
//                                 onChangeText={setCurrentPassword}
//                                 autoCapitalize="none"
//                             />
//                             <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
//                                 <MaterialIcons
//                                     name={showCurrentPassword ? "visibility-off" : "visibility"}
//                                     size={22}
//                                     color="#666"
//                                 />
//                             </TouchableOpacity>
//                         </View>
//                     </View>
//                 )}


//                 {/* New Password */}
//                 <View style={styles.inputContainer}>
//                     <Text style={styles.label}>
//                         {isGoogleUser ? 'Create Password' : 'New Password'}
//                     </Text>
//                     <View style={styles.passwordInput}>
//                         <TextInput
//                             style={styles.input}
//                             placeholder={isGoogleUser ? "Create new password" : "Enter new password"}
//                             placeholderTextColor="#999"
//                             secureTextEntry={!showNewPassword}
//                             value={newPassword}
//                             onChangeText={setNewPassword}
//                             autoCapitalize="none"
//                         />
//                         <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
//                             <MaterialIcons
//                                 name={showNewPassword ? "visibility-off" : "visibility"}
//                                 size={22}
//                                 color="#666"
//                             />
//                         </TouchableOpacity>
//                     </View>
//                 </View>

//                 {/* Confirm New Password */}
//                 <View style={styles.inputContainer}>
//                     <Text style={styles.label}>Confirm New Password</Text>
//                     <View style={styles.passwordInput}>
//                         <TextInput
//                             style={styles.input}
//                             placeholder="Confirm new password"
//                             placeholderTextColor="#999"
//                             secureTextEntry={!showConfirmPassword}
//                             value={confirmPassword}
//                             onChangeText={setConfirmPassword}
//                             autoCapitalize="none"
//                         />
//                         <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
//                             <MaterialIcons
//                                 name={showConfirmPassword ? "visibility-off" : "visibility"}
//                                 size={22}
//                                 color="#666"
//                             />
//                         </TouchableOpacity>
//                     </View>
//                 </View>

//                 {/* Submit Button */}
//                 <TouchableOpacity
//                     style={[styles.button, isLoading && styles.buttonDisabled]}
//                     onPress={handleChangePassword}
//                     disabled={isLoading}
//                 >
//                     {isLoading ? (
//                         <ActivityIndicator color="#fff" />
//                     ) : (
//                         <Text style={styles.buttonText}>
//                             {isGoogleUser ? 'Set Password' : 'Change Password'}
//                         </Text>
//                     )}
//                 </TouchableOpacity>
//             </ScrollView>
//         </SafeAreaView>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#f8f9fa',
//     },
//     contentContainer: {
//         paddingBottom: 30,
//     },
//     header: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         padding: 16,
//         backgroundColor: '#fff',
//         borderBottomWidth: 1,
//         borderBottomColor: '#eee',
//     },
//     headerTitle: {
//         fontSize: 18,
//         fontWeight: '600',
//         color: '#333',
//     },
//     infoCard: {
//         backgroundColor: '#fff',
//         borderRadius: 12,
//         padding: 16,
//         margin: 16,
//         marginBottom: 8,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.1,
//         shadowRadius: 3,
//         elevation: 2,
//     },
//     infoTitle: {
//         fontSize: 16,
//         fontWeight: '600',
//         color: '#333',
//         marginBottom: 12,
//     },
//     requirementItem: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 8,
//     },
//     requirementText: {
//         fontSize: 14,
//         color: '#333',
//         marginLeft: 8,
//     },
//     inputContainer: {
//         backgroundColor: '#fff',
//         padding: 16,
//         marginHorizontal: 16,
//         marginBottom: 8,
//         borderRadius: 8,
//     },
//     label: {
//         fontSize: 14,
//         color: '#666',
//         marginBottom: 8,
//     },
//     passwordInput: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         borderBottomWidth: 1,
//         borderBottomColor: '#eee',
//         paddingBottom: 8,
//     },
//     input: {
//         flex: 1,
//         fontSize: 16,
//         color: '#333',
//         paddingVertical: 8,
//     },
//     button: {
//         backgroundColor: '#1783BB',
//         borderRadius: 8,
//         padding: 16,
//         margin: 16,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     buttonDisabled: {
//         backgroundColor: '#9e9e9e',
//     },
//     buttonText: {
//         color: '#fff',
//         fontSize: 16,
//         fontWeight: '600',
//     },
// });

// export default ChangePasswordScreen;

import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const ChangePasswordScreen = ({ navigation, route }) => {
 
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation states
  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasUppercase, setHasUppercase] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  // Validate password requirements
  useEffect(() => {
    setHasMinLength(newPassword.length >= 8);
    setHasUppercase(/[A-Z]/.test(newPassword));
    setHasSpecialChar(/[!@#$%^&*(),.?":{}|<>]/.test(newPassword));
    setPasswordsMatch(newPassword === confirmPassword && confirmPassword !== '');
  }, [newPassword, confirmPassword]);

  const handleChangePassword = () => {
    if (hasMinLength && hasUppercase && hasSpecialChar && passwordsMatch && oldPassword) {
      console.log('Password changed successfully!');
      // Add your password change logic here
    } else {
      console.log('Please meet all requirements');
    }
  };

  const isFormValid = hasMinLength && hasUppercase && hasSpecialChar && passwordsMatch && oldPassword;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#7C3AED', '#EC4899']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <Text style={styles.headerSubtitle}>Keep your account secure</Text>
      </LinearGradient>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Old Password */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Old Password (Dummy)</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  placeholder="Enter your current password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showOldPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity 
                  onPress={() => setShowOldPassword(!showOldPassword)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.eyeIcon}>{showOldPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter your new password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity 
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.eyeIcon}>{showNewPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter your new password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Requirements */}
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>Password Requirements</Text>
              <View style={styles.requirementsList}>
                <View style={styles.checkboxContainer}>
                  <View style={[styles.checkbox, hasMinLength && styles.checkboxChecked]}>
                    {hasMinLength && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={[styles.checkboxLabel, hasMinLength && styles.checkboxLabelChecked]}>
                    At least 8 characters
                  </Text>
                </View>
                
                <View style={styles.checkboxContainer}>
                  <View style={[styles.checkbox, hasUppercase && styles.checkboxChecked]}>
                    {hasUppercase && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={[styles.checkboxLabel, hasUppercase && styles.checkboxLabelChecked]}>
                    Contains uppercase letter
                  </Text>
                </View>
                
                <View style={styles.checkboxContainer}>
                  <View style={[styles.checkbox, hasSpecialChar && styles.checkboxChecked]}>
                    {hasSpecialChar && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={[styles.checkboxLabel, hasSpecialChar && styles.checkboxLabelChecked]}>
                    Contains special character (!@#$%^&*)
                  </Text>
                </View>
                
                <View style={styles.checkboxContainer}>
                  <View style={[styles.checkbox, passwordsMatch && styles.checkboxChecked]}>
                    {passwordsMatch && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={[styles.checkboxLabel, passwordsMatch && styles.checkboxLabelChecked]}>
                    Passwords match
                  </Text>
                </View>
              </View>
            </View>

            {/* Change Password Button */}
            <TouchableOpacity 
              style={[
                styles.changeButton,
                !isFormValid && styles.changeButtonDisabled
              ]}
              onPress={handleChangePassword}
              disabled={!isFormValid}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isFormValid ? ['#7C3AED', '#EC4899'] : ['#D1D5DB', '#D1D5DB']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.changeButtonText}>Change Password</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Help Text */}
            <View style={styles.helpContainer}>
              <Text style={styles.helpIcon}>💡</Text>
              <Text style={styles.helpText}>
                Choose a strong password that you haven't used before
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 5,
    paddingBottom: 10,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  backIcon: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  inputWrapper: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
  },
  eyeButton: {
    paddingHorizontal: 16,
  },
  eyeIcon: {
    fontSize: 22,
  },
  requirementsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  requirementsList: {
    gap: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#6B7280',
    flex: 1,
  },
  checkboxLabelChecked: {
    color: '#374151',
    fontWeight: '500',
  },
  changeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  changeButtonDisabled: {
    shadowOpacity: 0.1,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  changeButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
  },
  helpIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  helpText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
})

export default  ChangePasswordScreen;