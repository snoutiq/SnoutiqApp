<<<<<<< HEAD
// import { LinearGradient } from 'expo-linear-gradient';
// import { useState } from 'react';
// import {
//   Alert,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Switch,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

// const SettingsScreen = ({ navigation }) => {
//   const [notificationsEnabled, setNotificationsEnabled] = useState(true);
//   const [locationEnabled, setLocationEnabled] = useState(false);
//   const [darkModeEnabled, setDarkModeEnabled] = useState(false);
//   const [autoBackup, setAutoBackup] = useState(true);

//   const settingSections = [
//     {
//       title: "Preferences",
//       items: [
//         {
//           icon: "🔔",
//           title: "Push Notifications",
//           subtitle: "Get notified about your pet's activities",
//           type: "switch",
//           value: notificationsEnabled,
//           onToggle: setNotificationsEnabled,
//         },
//         {
//           icon: "📍",
//           title: "Location Services",
//           subtitle: "Find nearby pet services",
//           type: "switch",
//           value: locationEnabled,
//           onToggle: setLocationEnabled,
//         },
//         {
//           icon: "🌙",
//           title: "Dark Mode",
//           subtitle: "Switch to dark theme",
//           type: "switch",
//           value: darkModeEnabled,
//           onToggle: setDarkModeEnabled,
//         },
//       ],
//     },
//     {
//       title: "Data & Privacy",
//       items: [
//         {
//           icon: "☁️",
//           title: "Auto Backup",
//           subtitle: "Backup your pet data automatically",
//           type: "switch",
//           value: autoBackup,
//           onToggle: setAutoBackup,
//         },
//         {
//           icon: "🔒",
//           title: "Privacy Policy",
//           subtitle: "Read our privacy policy",
//           type: "navigation",
//           onPress: () => Alert.alert("Privacy Policy", "Navigate to privacy policy"),
//         },
//         {
//           icon: "🛡️",
//           title: "Data Export",
//           subtitle: "Download your data",
//           type: "navigation",
//           onPress: () => Alert.alert("Data Export", "Export functionality"),
//         },
//       ],
//     },
//     {
//       title: "Support",
//       items: [
//         {
//           icon: "❓",
//           title: "Help Center",
//           subtitle: "Get help and support",
//           type: "navigation",
//           onPress: () => Alert.alert("Help", "Navigate to help center"),
//         },
//         {
//           icon: "💬",
//           title: "Contact Us",
//           subtitle: "Send us feedback",
//           type: "navigation",
//           onPress: () => Alert.alert("Contact", "Open contact form"),
//         },
//         {
//           icon: "⭐",
//           title: "Rate App",
//           subtitle: "Rate us on the app store",
//           type: "navigation",
//           onPress: () => Alert.alert("Rate App", "Navigate to app store"),
//         },
//       ],
//     },
//     {
//       title: "Account",
//       items: [
//         {
//           icon: "🔑",
//           title: "Change Password",
//           subtitle: "Update your password",
//           type: "navigation",
//           onPress: () => Alert.alert("Password", "Navigate to change password"),
//         },
//         {
//           icon: "🚪",
//           title: "Sign Out",
//           subtitle: "Sign out of your account",
//           type: "navigation",
//           onPress: () => Alert.alert("Sign Out", "Are you sure you want to sign out?"),
//           textColor: "#dc2626",
//         },
//       ],
//     },
//   ];

//   const renderSettingItem = (item, index, isLast) => (
//     <TouchableOpacity
//       key={index}
//       style={[
//         styles.settingItem,
//         !isLast && styles.settingItemBorder,
//       ]}
//       onPress={item.onPress}
//       disabled={item.type === 'switch'}
//     >
//       <View style={styles.settingContent}>
//         <View style={styles.settingLeft}>
//           <Text style={styles.settingIcon}>{item.icon}</Text>
//           <View style={styles.settingText}>
//             <Text style={[
//               styles.settingTitle,
//               item.textColor && { color: item.textColor }
//             ]}>
//               {item.title}
//             </Text>
//             <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
//           </View>
//         </View>
        
//         {item.type === 'switch' ? (
//           <Switch
//             value={item.value}
//             onValueChange={item.onToggle}
//             trackColor={{ false: '#f3f4f6', true: '#dbeafe' }}
//             thumbColor={item.value ? '#2563EB' : '#9ca3af'}
//           />
//         ) : (
//           <Text style={styles.chevron}>›</Text>
//         )}
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <LinearGradient
//         colors={['#dbeafe', '#e0e7ff']}
//         style={styles.backgroundGradient}
//       />
      
//       {/* Header */}
//       <LinearGradient
//         colors={['#2563EB', '#3b82f6']}
//         style={styles.header}
//       >
//         <View style={styles.headerContent}>
//           <TouchableOpacity onPress={() => navigation?.goBack()}>
//             <Text style={styles.backButton}>‹</Text>
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Settings</Text>
//           <View style={styles.headerSpacer} />
//         </View>
//       </LinearGradient>

//       <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
//         {settingSections.map((section, sectionIndex) => (
//           <View key={sectionIndex} style={styles.section}>
//             <Text style={styles.sectionTitle}>{section.title}</Text>
//             <View style={styles.sectionContent}>
//               {section.items.map((item, itemIndex) => 
//                 renderSettingItem(item, itemIndex, itemIndex === section.items.length - 1)
//               )}
//             </View>
//           </View>
//         ))}
        
//         {/* App Version */}
//         <View style={styles.versionContainer}>
//           <Text style={styles.versionText}>PetCare App v1.2.0</Text>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   backgroundGradient: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     top: 0,
//     bottom: 0,
//   },
//   header: {
//     paddingHorizontal: scale(24),
//    paddingVertical:verticalScale(10)
//   },
//   headerContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   backButton: {
//     fontSize: moderateScale(28),
//     color: '#fff',
//     fontWeight: '300',
//   },
//   headerTitle: {
//     fontSize: moderateScale(20),
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   headerSpacer: {
//     width: scale(28),
//   },
//   content: {
//     flex: 1,
//     paddingHorizontal: scale(20),
//   },
//   section: {
//     marginTop: verticalScale(24),
//   },
//   sectionTitle: {
//     fontSize: moderateScale(16),
//     fontWeight: '600',
//     color: '#374151',
//     marginBottom: verticalScale(12),
//     marginLeft: scale(4),
//   },
//   sectionContent: {
//     backgroundColor: '#fff',
//     borderRadius: scale(12),
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: verticalScale(2) },
//     shadowOpacity: 0.05,
//     shadowRadius: scale(4),
//     elevation: 2,
//   },
//   settingItem: {
//     paddingHorizontal: scale(16),
//     paddingVertical: verticalScale(16),
//   },
//   settingItemBorder: {
//     borderBottomWidth: 1,
//     borderBottomColor: '#f3f4f6',
//   },
//   settingContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   settingLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   settingIcon: {
//     fontSize: moderateScale(20),
//     marginRight: scale(12),
//     width: scale(24),
//   },
//   settingText: {
//     flex: 1,
//   },
//   settingTitle: {
//     fontSize: moderateScale(16),
//     fontWeight: '500',
//     color: '#1f2937',
//     marginBottom: verticalScale(2),
//   },
//   settingSubtitle: {
//     fontSize: moderateScale(12),
//     color: '#6b7280',
//     lineHeight: moderateScale(16),
//   },
//   chevron: {
//     fontSize: moderateScale(24),
//     color: '#d1d5db',
//     fontWeight: '300',
//   },
//   versionContainer: {
//     alignItems: 'center',
//     paddingVertical: verticalScale(32),
//   },
//   versionText: {
//     fontSize: moderateScale(12),
//     color: '#9ca3af',
//   },
// });

// export default SettingsScreen;

=======
>>>>>>> f0df6cf22df0a9ff3f367c857a38f41a8985ab77
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
