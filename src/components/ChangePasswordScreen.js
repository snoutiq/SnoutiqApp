import React, { useState, useContext, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const ChangePasswordScreen = ({ navigation, route }) => {
    const { changePassword, user } = useContext(AuthContext);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Check if user signed in via Google (has no password)
    const isGoogleUser = !user.hasPassword;
    const [passwordStrength, setPasswordStrength] = useState(0);

    useEffect(() => {
        let strength = 0;
        if (newPassword.length >= 8) strength++;
        if (/[A-Z]/.test(newPassword)) strength++;
        if (/[0-9]/.test(newPassword)) strength++;
        if (/[^A-Za-z0-9]/.test(newPassword)) strength++;
        setPasswordStrength(strength);
    }, [newPassword]);

    const isGoogleOnlyUser = user.provider === 'google';
    const hasExistingPassword = user.provider === 'local' || user.provider === 'both';

    const handleChangePassword = async () => {
        // Common validations
        if (!newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters long');
            return;
        }

        // Special validation for users with existing passwords
        if (hasExistingPassword && !currentPassword) {
            Alert.alert('Error', 'Current password is required');
            return;
        }

        setIsLoading(true);
        try {
            await changePassword(
                hasExistingPassword ? currentPassword : null,
                newPassword,
                isGoogleOnlyUser
            );
            Alert.alert('Success',
                isGoogleOnlyUser ? 'Password set successfully' : 'Password changed successfully'
            );
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <SafeAreaView style={styles.container}
            contentContainerStyle={styles.contentContainer}>
            <ScrollView
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color="#333"
                        onPress={() => navigation.goBack()}
                    />
                    <Text style={styles.headerTitle}>
                        {isGoogleUser ? 'Set Password' : 'Change Password'}
                    </Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Password Requirements */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>Password Requirements</Text>
                    <View style={styles.requirementItem}>
                        <MaterialIcons
                            name={newPassword.length >= 8 ? "check-circle" : "radio-button-unchecked"}
                            size={16}
                            color={newPassword.length >= 8 ? "#4CAF50" : "#666"}
                        />
                        <Text style={styles.requirementText}>At least 8 characters</Text>
                    </View>
                    <View style={styles.requirementItem}>
                        <MaterialIcons
                            name={/[A-Z]/.test(newPassword) ? "check-circle" : "radio-button-unchecked"}
                            size={16}
                            color={/[A-Z]/.test(newPassword) ? "#4CAF50" : "#666"}
                        />
                        <Text style={styles.requirementText}>At least one uppercase letter</Text>
                    </View>
                    <View style={styles.requirementItem}>
                        <MaterialIcons
                            name={/[0-9]/.test(newPassword) ? "check-circle" : "radio-button-unchecked"}
                            size={16}
                            color={/[0-9]/.test(newPassword) ? "#4CAF50" : "#666"}
                        />
                        <Text style={styles.requirementText}>At least one number</Text>
                    </View>
                    <View style={styles.requirementItem}>
                        <MaterialIcons
                            name={/[^A-Za-z0-9]/.test(newPassword) ? "check-circle" : "radio-button-unchecked"}
                            size={16}
                            color={/[^A-Za-z0-9]/.test(newPassword) ? "#4CAF50" : "#666"}
                        />
                        <Text style={styles.requirementText}>At least one special character</Text>
                    </View>
                </View>

                {/* Current Password (only for non-Google users) */}
                {hasExistingPassword && (
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Current Password</Text>
                        <View style={styles.passwordInput}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter current password"
                                placeholderTextColor="#999"
                                secureTextEntry={!showCurrentPassword}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                                <MaterialIcons
                                    name={showCurrentPassword ? "visibility-off" : "visibility"}
                                    size={22}
                                    color="#666"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}


                {/* New Password */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>
                        {isGoogleUser ? 'Create Password' : 'New Password'}
                    </Text>
                    <View style={styles.passwordInput}>
                        <TextInput
                            style={styles.input}
                            placeholder={isGoogleUser ? "Create new password" : "Enter new password"}
                            placeholderTextColor="#999"
                            secureTextEntry={!showNewPassword}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                            <MaterialIcons
                                name={showNewPassword ? "visibility-off" : "visibility"}
                                size={22}
                                color="#666"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Confirm New Password */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Confirm New Password</Text>
                    <View style={styles.passwordInput}>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm new password"
                            placeholderTextColor="#999"
                            secureTextEntry={!showConfirmPassword}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                            <MaterialIcons
                                name={showConfirmPassword ? "visibility-off" : "visibility"}
                                size={22}
                                color="#666"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleChangePassword}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>
                            {isGoogleUser ? 'Set Password' : 'Change Password'}
                        </Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    contentContainer: {
        paddingBottom: 30,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        margin: 16,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    requirementText: {
        fontSize: 14,
        color: '#333',
        marginLeft: 8,
    },
    inputContainer: {
        backgroundColor: '#fff',
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 8,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    passwordInput: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 8,
    },
    button: {
        backgroundColor: '#1783BB',
        borderRadius: 8,
        padding: 16,
        margin: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#9e9e9e',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ChangePasswordScreen;