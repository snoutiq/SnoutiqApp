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
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);

  const settingSections = [
    {
      title: "Preferences",
      items: [
        {
          icon: "🔔",
          title: "Push Notifications",
          subtitle: "Get notified about your pet's activities",
          type: "switch",
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          icon: "📍",
          title: "Location Services",
          subtitle: "Find nearby pet services",
          type: "switch",
          value: locationEnabled,
          onToggle: setLocationEnabled,
        },
        {
          icon: "🌙",
          title: "Dark Mode",
          subtitle: "Switch to dark theme",
          type: "switch",
          value: darkModeEnabled,
          onToggle: setDarkModeEnabled,
        },
      ],
    },
    {
      title: "Data & Privacy",
      items: [
        {
          icon: "☁️",
          title: "Auto Backup",
          subtitle: "Backup your pet data automatically",
          type: "switch",
          value: autoBackup,
          onToggle: setAutoBackup,
        },
        {
          icon: "🔒",
          title: "Privacy Policy",
          subtitle: "Read our privacy policy",
          type: "navigation",
          onPress: () => Alert.alert("Privacy Policy", "Navigate to privacy policy"),
        },
        {
          icon: "🛡️",
          title: "Data Export",
          subtitle: "Download your data",
          type: "navigation",
          onPress: () => Alert.alert("Data Export", "Export functionality"),
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: "❓",
          title: "Help Center",
          subtitle: "Get help and support",
          type: "navigation",
          onPress: () => Alert.alert("Help", "Navigate to help center"),
        },
        {
          icon: "💬",
          title: "Contact Us",
          subtitle: "Send us feedback",
          type: "navigation",
          onPress: () => Alert.alert("Contact", "Open contact form"),
        },
        {
          icon: "⭐",
          title: "Rate App",
          subtitle: "Rate us on the app store",
          type: "navigation",
          onPress: () => Alert.alert("Rate App", "Navigate to app store"),
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          icon: "🔑",
          title: "Change Password",
          subtitle: "Update your password",
          type: "navigation",
          onPress: () => Alert.alert("Password", "Navigate to change password"),
        },
        {
          icon: "🚪",
          title: "Sign Out",
          subtitle: "Sign out of your account",
          type: "navigation",
          onPress: () => Alert.alert("Sign Out", "Are you sure you want to sign out?"),
          textColor: "#dc2626",
        },
      ],
    },
  ];

  const renderSettingItem = (item, index, isLast) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.settingItem,
        !isLast && styles.settingItemBorder,
      ]}
      onPress={item.onPress}
      disabled={item.type === 'switch'}
    >
      <View style={styles.settingContent}>
        <View style={styles.settingLeft}>
          <Text style={styles.settingIcon}>{item.icon}</Text>
          <View style={styles.settingText}>
            <Text style={[
              styles.settingTitle,
              item.textColor && { color: item.textColor }
            ]}>
              {item.title}
            </Text>
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          </View>
        </View>
        
        {item.type === 'switch' ? (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: '#f3f4f6', true: '#dbeafe' }}
            thumbColor={item.value ? '#2563EB' : '#9ca3af'}
          />
        ) : (
          <Text style={styles.chevron}>›</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#dbeafe', '#e0e7ff']}
        style={styles.backgroundGradient}
      />
      
      {/* Header */}
      <LinearGradient
        colors={['#2563EB', '#3b82f6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Text style={styles.backButton}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => 
                renderSettingItem(item, itemIndex, itemIndex === section.items.length - 1)
              )}
            </View>
          </View>
        ))}
        
        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>PetCare App v1.2.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    paddingHorizontal: scale(24),
   paddingVertical:verticalScale(10)
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    fontSize: moderateScale(28),
    color: '#fff',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSpacer: {
    width: scale(28),
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(20),
  },
  section: {
    marginTop: verticalScale(24),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#374151',
    marginBottom: verticalScale(12),
    marginLeft: scale(4),
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: scale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.05,
    shadowRadius: scale(4),
    elevation: 2,
  },
  settingItem: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: moderateScale(20),
    marginRight: scale(12),
    width: scale(24),
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: moderateScale(16),
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: verticalScale(2),
  },
  settingSubtitle: {
    fontSize: moderateScale(12),
    color: '#6b7280',
    lineHeight: moderateScale(16),
  },
  chevron: {
    fontSize: moderateScale(24),
    color: '#d1d5db',
    fontWeight: '300',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: verticalScale(32),
  },
  versionText: {
    fontSize: moderateScale(12),
    color: '#9ca3af',
  },
});

export default SettingsScreen;