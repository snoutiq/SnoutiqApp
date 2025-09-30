import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform
} from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout, user } = useAuth();

  const stats = [
    { label: "Pets", value: "1", color: "#2563EB", icon: "🐾" },
    { label: "Appointments", value: "2", color: "#10B981", icon: "📝" },
    { label: "Days Active", value: "542", color: "#F59E0B", icon: "📅" },
  ];

  const menuItems = [
    { label: "Edit Profile", action: () => navigation.navigate('PetParentEdit'), icon: "person-outline" },
    { label: "Settings", action: () => navigation.navigate('SettingsScreen'), icon: "settings-outline" },
    { label: "Favorites", action: () => console.log("Favorites"), icon: "heart-outline" },
    { label: "Achievements", action: () => console.log("Achievements"), icon: "trophy-outline" },
    { label: "Help & Support", action: () => console.log("Help"), icon: "help-circle-outline" },
  ];

  const fetchUserData = async () => {
    try {
      if (user) {
        const petsArray = [{
          name: user.pet_name || "No pet registered",
          age: user.pet_age,
          gender: user.pet_gender,
          type: user.breed || "Pet",
          avatar: user.pet_gender === 'female' 
            ? "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=80&h=80&fit=crop"
            : "https://images.unsplash.com/photo-1552053831-71594a27632d?w=80&h=80&fit=crop"
        }];

        setUserProfile({
          name: user.name || "Test User",
          email: user.email || "test@gmail.com",
          phone: user.phone ? `+91 ${user.phone}` : "+91 0000000000",
          location: user.latitude && user.longitude ? `${user.latitude}, ${user.longitude}` : "Haryana, Gurgaon",
          joinDate: new Date(user.created_at || new Date()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          avatar: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?fm=jpg&q=60&w=3000",
          pets: petsArray,
        });
      } else {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsedData = JSON.parse(userData);
          const petsArray = parsedData.pets || [{
            name: parsedData.pet_name || "No pet registered",
            age: parsedData.pet_age,
            gender: parsedData.pet_gender,
            type: parsedData.pet_type || "Pet",
            avatar: parsedData.pet_gender === 'female' 
              ? "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=80&h=80&fit=crop"
              : "https://images.unsplash.com/photo-1552053831-71594a27632d?w=80&h=80&fit=crop"
          }];

          setUserProfile({
            name: parsedData.name || "Test User",
            email: parsedData.email || "test@gmail.com",
            phone: parsedData.phone || "+91 0000000000",
            location: "Haryana, Gurgaon",
            joinDate: new Date(parsedData.created_at || new Date()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            avatar: parsedData.avatar || "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?fm=jpg&q=60&w=3000",
            pets: petsArray,
          });
        } else {
          setUserProfile({
            name: "Test User",
            email: "test@gmail.com",
            phone: "+91 0000000000",
            location: "Haryana, Gurgaon",
            joinDate: "March 2023",
            avatar: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?fm=jpg&q=60&w=3000",
            pets: [{
              name: "No pet registered",
              age: "",
              gender: "",
              type: "Pet",
              avatar: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=80&h=80&fit=crop"
            }]
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchUserData();
    }, [user])
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient 
        colors={["#f8fafc", "#e0e7ff", "#dbeafe"]} 
        style={styles.backgroundGradient} 
      />

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient 
          colors={["#7C3AED", "#EC4899"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => navigation.navigate("SettingsScreen")}
            >
              <Ionicons name="settings-outline" size={scale(20)} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <LinearGradient
            colors={["#7C3AED", "#EC4899"]}
            style={styles.profileGradient}
          >
            <View style={styles.profileContent}>
              <View style={styles.avatarContainer}>
                <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
                <TouchableOpacity style={styles.cameraButton}>
                  <Ionicons name="camera" size={scale(12)} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{userProfile.name}</Text>
                <Text style={styles.profileRole}>Pet Parent</Text>
                <View style={styles.memberSince}>
                  <Ionicons name="calendar-outline" size={scale(12)} color="#93C5FD" />
                  <Text style={styles.memberSinceText}>Member since {userProfile.joinDate}</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                onPress={() => navigation.navigate('PetParentEdit')} 
                style={styles.editButton}
              >
                <Ionicons name="create-outline" size={scale(16)} color="#2563EB" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.content}>
          {/* Stats */}
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <TouchableOpacity key={index} style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}15` }]}>
                  <Text style={styles.statIcon}>{stat.icon}</Text>
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Contact Info */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-circle-outline" size={scale(20)} color="#374151" />
              <Text style={styles.sectionTitle}>Contact Information</Text>
            </View>
            
            <View style={styles.contactList}>
              <View style={styles.contactItem}>
                <View style={styles.contactIconContainer}>
                  <Ionicons name="mail-outline" size={scale(16)} color="#2563EB" />
                </View>
                <Text style={styles.contactText}>{userProfile.email}</Text>
              </View>
              
              <View style={styles.contactItem}>
                <View style={styles.contactIconContainer}>
                  <Ionicons name="call-outline" size={scale(16)} color="#10B981" />
                </View>
                <Text style={styles.contactText}>{userProfile.phone}</Text>
              </View>
              
              <View style={styles.contactItem}>
                <View style={styles.contactIconContainer}>
                  <Ionicons name="location-outline" size={scale(16)} color="#F59E0B" />
                </View>
                <Text style={styles.contactText}>{userProfile.location}</Text>
              </View>
            </View>
          </View>

          {/* My Pets */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="paw-outline" size={scale(20)} color="#374151" />
              <Text style={styles.sectionTitle}>My Pets</Text>
              <TouchableOpacity 
                style={styles.addPetButton}
                onPress={() => navigation.navigate('EditPetProfile', { petIndex: -1 })}
              >
                <Ionicons name="add" size={scale(18)} color="#2563EB" />
              </TouchableOpacity>
            </View>

            {userProfile.pets.map((pet, index) => (
              <View key={index} style={styles.petItem}>
                <Image source={{ uri: pet.avatar }} style={styles.petImage} />
                <View style={styles.petInfo}>
                  <Text style={styles.petName}>{pet.name}</Text>
                  <Text style={styles.petDetails}>
                    {pet.type} • {pet.age} {pet.age ? "years" : ""} • {pet.gender}
                  </Text>
                </View>
                {pet.name !== "No pet registered" && (
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('EditPetProfile', { petIndex: index })} 
                    style={styles.petEditButton}
                  >
                    <Ionicons name="create-outline" size={scale(16)} color="#6B7280" />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {userProfile.pets.length === 0 || userProfile.pets[0].name === "No pet registered" ? (
              <TouchableOpacity 
                style={styles.noPetCard}
                onPress={() => navigation.navigate('EditPetProfile', { petIndex: -1 })}
              >
                <Ionicons name="paw" size={scale(24)} color="#9CA3AF" />
                <Text style={styles.noPetTitle}>No Pets Added</Text>
                <Text style={styles.noPetText}>Tap to add your first furry friend!</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Menu Items */}
          <View style={styles.menuSection}>
            {menuItems.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                onPress={item.action} 
                style={styles.menuItem}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIconContainer}>
                    <Ionicons name={item.icon} size={scale(18)} color="#2563EB" />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={scale(18)} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={scale(20)} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          {/* App Version */}
          <Text style={styles.versionText}>App Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#FFFFFF" 
  },
  backgroundGradient: { 
    ...StyleSheet.absoluteFillObject 
  },
  scrollView: { 
    flex: 1 
  },
  scrollViewContent: {
    paddingBottom: Platform.OS === 'ios' ? verticalScale(120) : verticalScale(100), // ADDED FOR TAB BAR
  },
  header: { 
    paddingHorizontal: scale(20), 
    paddingTop: verticalScale(20), 
    paddingBottom: verticalScale(60) 
  },
  headerContent: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center" 
  },
  headerTitle: { 
    fontSize: moderateScale(22), 
    fontWeight: "700", 
    color: "#FFFFFF",
    letterSpacing: 0.5 
  },
  settingsButton: {
    padding: scale(8),
  },
  profileCard: {
    marginTop: verticalScale(-60),
    marginHorizontal: scale(20),
    borderRadius: moderateScale(20),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: verticalScale(10) },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(20),
    elevation: 8,
    overflow: 'hidden',
  },
  profileGradient: {
    padding: moderateScale(24),
  },
  profileContent: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  avatarContainer: { 
    position: "relative" 
  },
  avatar: { 
    width: scale(70), 
    height: scale(70), 
    borderRadius: moderateScale(35), 
    borderWidth: 3, 
    borderColor: "#FFFFFF" 
  },
  cameraButton: { 
    position: "absolute", 
    bottom: verticalScale(2), 
    right: scale(2), 
    backgroundColor: "#2563EB", 
    borderRadius: moderateScale(12), 
    width: scale(24), 
    height: verticalScale(24), 
    alignItems: "center", 
    justifyContent: "center",
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  profileInfo: { 
    flex: 1, 
    marginLeft: scale(16) 
  },
  profileName: { 
    fontSize: moderateScale(20), 
    fontWeight: "700", 
    color: "#FFFFFF",
    marginBottom: verticalScale(2) 
  },
  profileRole: { 
    fontSize: moderateScale(14), 
    color: "#E0F2FE",
    marginBottom: verticalScale(6) 
  },
  memberSince: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberSinceText: {
    fontSize: moderateScale(12),
    color: "#93C5FD",
    marginLeft: scale(4)
  },
  editButton: { 
    backgroundColor: '#FFFFFF',
    padding: scale(10),
    borderRadius: moderateScale(12),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(4),
    elevation: 2,
  },
  content: { 
    paddingHorizontal: scale(20), 
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(20) // REDUCED, scrollViewContent handles bottom padding
  },
  statsContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginBottom: verticalScale(24) 
  },
  statCard: { 
    flex: 1, 
    backgroundColor: "#FFFFFF", 
    borderRadius: moderateScale(16), 
    padding: moderateScale(16), 
    marginHorizontal: scale(4), 
    alignItems: "center", 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.08,
    shadowRadius: moderateScale(8),
    elevation: 4,
  },
  statIconContainer: {
    width: scale(40),
    height: scale(40),
    borderRadius: moderateScale(20),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(8)
  },
  statIcon: { 
    fontSize: moderateScale(18) 
  },
  statValue: { 
    fontSize: moderateScale(18), 
    fontWeight: "700", 
    color: "#1F2937",
    marginBottom: verticalScale(2) 
  },
  statLabel: { 
    fontSize: moderateScale(12), 
    color: "#6B7280",
    fontWeight: '500' 
  },
  section: { 
    backgroundColor: "#FFFFFF", 
    borderRadius: moderateScale(16), 
    padding: moderateScale(20), 
    marginBottom: verticalScale(16), 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(8),
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  sectionTitle: { 
    fontSize: moderateScale(16), 
    fontWeight: "600", 
    color: "#1F2937",
    marginLeft: scale(8)
  },
  addPetButton: {
    marginLeft: 'auto',
    padding: scale(6),
  },
  contactList: {
    gap: verticalScale(12),
  },
  contactItem: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  contactIconContainer: {
    width: scale(32),
    height: scale(32),
    borderRadius: moderateScale(8),
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  contactText: { 
    fontSize: moderateScale(14), 
    color: "#4B5563",
    fontWeight: '500' 
  },
  petItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: verticalScale(16),
    backgroundColor: '#F9FAFB',
    padding: moderateScale(12),
    borderRadius: moderateScale(12),
  },
  petImage: { 
    width: scale(50), 
    height: scale(50), 
    borderRadius: moderateScale(25), 
    borderWidth: 2, 
    borderColor: "#E5E7EB" 
  },
  petInfo: { 
    marginLeft: scale(12), 
    flex: 1 
  },
  petName: { 
    fontSize: moderateScale(15), 
    fontWeight: "600", 
    color: "#1F2937" 
  },
  petDetails: { 
    fontSize: moderateScale(13), 
    color: "#6B7280" 
  },
  petEditButton: {
    padding: scale(8),
  },
  noPetCard: {
    alignItems: 'center',
    padding: moderateScale(32),
    backgroundColor: '#F9FAFB',
    borderRadius: moderateScale(12),
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  noPetTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#374151',
    marginTop: verticalScale(8),
    marginBottom: verticalScale(4),
  },
  noPetText: {
    fontSize: moderateScale(14),
    color: "#6B7280",
    textAlign: 'center',
  },
  menuSection: { 
    backgroundColor: "#FFFFFF", 
    borderRadius: moderateScale(16), 
    marginBottom: verticalScale(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(8),
    elevation: 2,
    overflow: 'hidden',
  },
  menuItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: 'space-between',
    padding: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6"
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: scale(36),
    height: scale(36),
    borderRadius: moderateScale(10),
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  menuLabel: { 
    fontSize: moderateScale(15), 
    fontWeight: "500", 
    color: "#374151" 
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
  versionText: {
    textAlign: 'center',
    fontSize: moderateScale(12),
    color: '#9CA3AF',
    marginTop: verticalScale(8),
  },
  loadingText: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(14),
    color: '#6B7280',
  },
});

export default ProfileScreen;