import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const SettingsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [location, setLocation] = useState(true);
  const [autoSync, setAutoSync] = useState(false);

  const SettingItem = ({ icon, title, subtitle, type, value, onToggle, onPress }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={type === 'navigation' ? onPress : null}
      activeOpacity={type === 'navigation' ? 0.7 : 1}
    >
      <View style={styles.settingIcon}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {type === 'toggle' && (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#E5E7EB', true: '#C084FC' }}
          thumbColor={value ? '#7C3AED' : '#F3F4F6'}
          style={styles.switch}
        />
      )}
      {type === 'navigation' && (
        <Ionicons name="chevron-forward" size={moderateScale(20)} color="#D1D5DB" />
      )}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  // ✅ Fixed Logout function
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear(); // clear user data
              navigation.reset({
                index: 0,
                routes: [{ name: 'login' }], // navigate to Login screen
              });
            } catch (error) {
              console.error("Logout error:", error);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#7C3AED', '#EC4899']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={moderateScale(25)} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerPlaceholder}></View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <SectionHeader title="ACCOUNT" />
          <View style={styles.section}>
            <SettingItem
              icon="👤"
              title="Edit Profile"
              subtitle="Update your personal information"
              type="navigation"
              onPress={() => navigation.navigate('PetParentEdit')}
            />
            <SettingItem
              icon="🐾"
              title="Edit Pet Profile"
              subtitle="Update your Pet information"
              type="navigation"
              onPress={() => navigation.navigate('EditPetProfile')}
            />
            <SettingItem
              icon="🔒"
              title="Privacy & Security"
              subtitle="Manage your account security"
              type="navigation"
              onPress={() => console.log('Navigate to Privacy')}
            />
            <SettingItem
              icon="💳"
              title="Change Password"
              subtitle="Change Your Password"
              type="navigation"
              onPress={() => navigation.navigate('ChangePassword')}
            />
          </View>

          <SectionHeader title="PREFERENCES" />
          <View style={styles.section}>
            <SettingItem
              icon="🔔"
              title="Notifications"
              subtitle="Push notifications and alerts"
              type="toggle"
              value={notifications}
              onToggle={setNotifications}
            />
            <SettingItem
              icon="🌙"
              title="Dark Mode"
              subtitle="Switch to dark theme"
              type="toggle"
              value={darkMode}
              onToggle={setDarkMode}
            />
            <SettingItem
              icon="📍"
              title="Location Services"
              subtitle="Allow access to your location"
              type="toggle"
              value={location}
              onToggle={setLocation}
            />
            <SettingItem
              icon="🔄"
              title="Auto Sync"
              subtitle="Automatically sync your data"
              type="toggle"
              value={autoSync}
              onToggle={setAutoSync}
            />
          </View>

          <SectionHeader title="SUPPORT" />
          <View style={styles.section}>
            <SettingItem
              icon="❓"
              title="Help Center"
              subtitle="Get help and support"
              type="navigation"
              onPress={() => navigation.navigate('HelpCenterScreen')}
            />
            <SettingItem
              icon="📧"
              title="Contact Us"
              subtitle="Send us your feedback"
              type="navigation"
              onPress={() => navigation.navigate('ContactUsScreen')}
            />
            <SettingItem
              icon="⭐"
              title="Rate App"
              subtitle="Share your experience"
              type="navigation"
              onPress={() => console.log('Navigate to Rate')}
            />
          </View>

          <SectionHeader title="ABOUT US" />
          <View style={styles.section}>
            <SettingItem
              icon="ℹ️"
              title="Terms & Conditions"
              type="navigation"
              onPress={() => navigation.navigate('TermsScreen')}
            />
            <SettingItem
              icon="📄"
              title="Share with your friends"
              subtitle="Invite your friends on the app"
              type="navigation"
              onPress={() => console.log('Navigate to Share')}
            />
            <SettingItem
              icon="📱"
              title="Follow us"
              subtitle="Follow us on social media"
              type="navigation"
            />
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={scale(20)} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: moderateScale(24),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(15),
    borderBottomLeftRadius: moderateScale(24),
    borderBottomRightRadius: moderateScale(24),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backIcon: {
    color: 'white',
  },
  headerTitle: {
    fontSize: moderateScale(28),
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: moderateScale(25),
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: moderateScale(16),
    paddingTop: verticalScale(24),
    paddingBottom: verticalScale(40),
  },
  sectionHeader: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#6B7280',
    marginTop: verticalScale(24),
    marginBottom: verticalScale(8),
    marginLeft: moderateScale(4),
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(8),
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(14),
    paddingHorizontal: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    minHeight: verticalScale(60),
  },
  settingIcon: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(12),
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(16),
  },
  iconText: {
    fontSize: moderateScale(18),
  },
  settingContent: {
    flex: 1,
    justifyContent: 'center',
  },
  settingTitle: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#111827',
    marginBottom: verticalScale(2),
  },
  settingSubtitle: {
    fontSize: moderateScale(13),
    color: '#6B7280',
    lineHeight: moderateScale(16),
  },
  switch: {
    transform: [
      { scaleX: moderateScale(0.8) },
      { scaleY: moderateScale(0.8) },
    ],
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    padding: moderateScale(16),
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: scale(8),
  },
});
