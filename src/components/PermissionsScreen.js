import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

export default function PermissionsScreen({ navigation, route }) {
  const [permissions, setPermissions] = useState({
    location: false,
    notifications: false,
    camera: false,
  });

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setPermissions(prev => ({ ...prev, location: true }));
        Alert.alert('Success', 'Location access enabled!');
      } else {
        Alert.alert('Permission Denied', 'Location access is needed to find nearby vets and services.');
      }
    } catch (error) {
      console.error('Location permission error:', error);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        setPermissions(prev => ({ ...prev, notifications: true }));
        Alert.alert('Success', 'Notifications enabled!');
      } else {
        Alert.alert('Permission Denied', 'Notifications help you stay on top of your pet\'s health.');
      }
    } catch (error) {
      console.error('Notification permission error:', error);
    }
  };

  const requestCameraPermission = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status === 'granted') {
        setPermissions(prev => ({ ...prev, camera: true }));
        Alert.alert('Success', 'Camera access enabled!');
      } else {
        Alert.alert('Permission Denied', 'Camera access helps with photo sharing and health analysis.');
      }
    } catch (error) {
      console.error('Camera permission error:', error);
    }
  };

  const handleCompleteSetup = async () => {
    try {
      // Save user and pet data to AsyncStorage
      const userData = route.params?.userData;
      const petData = route.params?.petData;
      
      if (userData) {
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
      }
      if (petData) {
        await AsyncStorage.setItem('petData', JSON.stringify(petData));
      }
      
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      console.error('Error saving data:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Permissions?',
      'You can enable these later in Settings, but some features may not work properly.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Skip', onPress: handleCompleteSetup },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={scale(24)} color="#374151" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Enable Smart Features</Text>
          <Text style={styles.subtitle}>
            We need a few permissions to provide the best experience
          </Text>

          <View style={styles.permissionsContainer}>
            <View style={[styles.permissionCard, { backgroundColor: '#F3E8FF' }]}>
              <View style={styles.permissionIcon}>
                <Ionicons 
                  name="location" 
                  size={scale(24)} 
                  color="#7C3AED" 
                />
              </View>
              <View style={styles.permissionContent}>
                <Text style={styles.permissionTitle}>Location Access</Text>
                <Text style={styles.permissionDescription}>
                  Find nearby vets, pet stores, and connect with local pet parents
                </Text>
                <TouchableOpacity
                  style={[
                    styles.permissionButton,
                    { backgroundColor: permissions.location ? '#10B981' : '#7C3AED' }
                  ]}
                  onPress={requestLocationPermission}
                  disabled={permissions.location}
                >
                  <Text style={styles.permissionButtonText}>
                    {permissions.location ? 'Enabled' : 'Enable Location'}
                  </Text>
                  {permissions.location && (
                    <Ionicons name="checkmark" size={scale(16)} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.permissionCard, { backgroundColor: '#DBEAFE' }]}>
              <View style={styles.permissionIcon}>
                <Ionicons 
                  name="notifications" 
                  size={scale(24)} 
                  color="#3B82F6" 
                />
              </View>
              <View style={styles.permissionContent}>
                <Text style={styles.permissionTitle}>Notifications</Text>
                <Text style={styles.permissionDescription}>
                  Get reminders for vaccinations, medications, and health tips
                </Text>
                <TouchableOpacity
                  style={[
                    styles.permissionButton,
                    { backgroundColor: permissions.notifications ? '#10B981' : '#3B82F6' }
                  ]}
                  onPress={requestNotificationPermission}
                  disabled={permissions.notifications}
                >
                  <Text style={styles.permissionButtonText}>
                    {permissions.notifications ? 'Enabled' : 'Enable Notifications'}
                  </Text>
                  {permissions.notifications && (
                    <Ionicons name="checkmark" size={scale(16)} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.permissionCard, { backgroundColor: '#D1FAE5' }]}>
              <View style={styles.permissionIcon}>
                <Ionicons 
                  name="camera" 
                  size={scale(24)} 
                  color="#10B981" 
                />
              </View>
              <View style={styles.permissionContent}>
                <Text style={styles.permissionTitle}>Camera Access</Text>
                <Text style={styles.permissionDescription}>
                  Take photos for AI health analysis and share memories
                </Text>
                <TouchableOpacity
                  style={[
                    styles.permissionButton,
                    { backgroundColor: permissions.camera ? '#10B981' : '#10B981' }
                  ]}
                  onPress={requestCameraPermission}
                  disabled={permissions.camera}
                >
                  <Text style={styles.permissionButtonText}>
                    {permissions.camera ? 'Enabled' : 'Enable Camera'}
                  </Text>
                  {permissions.camera && (
                    <Ionicons name="checkmark" size={scale(16)} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleCompleteSetup}
          activeOpacity={0.8}
        >
          <Text style={styles.completeButtonText}>Complete Setup</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={handleSkip}
          style={styles.skipButton}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(24),
  },
  backButton: {
    width: scale(40),
    height: scale(40),
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: scale(24),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: verticalScale(8),
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: '#6B7280',
    marginBottom: verticalScale(32),
  },
  permissionsContainer: {
    gap: verticalScale(24),
  },
  permissionCard: {
    borderRadius: scale(12),
    padding: scale(24),
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  permissionIcon: {
    width: scale(48),
    height: scale(48),
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: scale(24),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(16),
  },
  permissionContent: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#111827',
    marginBottom: verticalScale(8),
  },
  permissionDescription: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(16),
  },
  permissionButton: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: scale(8),
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: scale(8),
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(12),
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(24),
    backgroundColor: '#FFFFFF',
  },
  completeButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: verticalScale(16),
    borderRadius: scale(12),
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: verticalScale(8),
  },
  skipButtonText: {
    color: '#6B7280',
    fontSize: moderateScale(16),
  },
});