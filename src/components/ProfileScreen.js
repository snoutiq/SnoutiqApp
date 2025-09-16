import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const ProfileScreen = ({ navigation }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const stats = [
    { label: "Pets", value: "1", color: "#2563EB" },
    { label: "Appointment", value: "2", color: "#1d4ed8" },
    { label: "Days Active", value: "542", color: "#1e40af" },
  ];

  const menuItems = [
    { label: "Edit Profile", action: () => navigation.navigate('PetParentEdit') },
    { label: "Settings", action: () => navigation.navigate('SettingsScreen') },
    { label: "Favorites", action: () => console.log("Favorites") },
    { label: "Achievements", action: () => console.log("Achievements") },
  ];

  const fetchUserData = async () => {
    try {
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
          name: parsedData.name || "Test",
          email: parsedData.email || "test@gmail.com",
          phone: parsedData.phone || "+91 0000000000",
          location: "Haryana, Gurgaon",
          joinDate: new Date(parsedData.created_at || new Date()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          avatar: parsedData.avatar || "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?fm=jpg&q=60&w=3000",
          pets: petsArray,
        });
      } else {
        setUserProfile({
          name: "Test",
          email: "test@gmail.com",
          phone: "+91 0000000000",
          location: "xxxxxxx",
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
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data on screen focus
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchUserData();
    }, [])
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#dbeafe", "#e0e7ff"]} style={styles.backgroundGradient} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={["#2563EB", "#3b82f6"]} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.profileButton} onPress={() => navigation.openDrawer()}>
              <View style={styles.profileAvatar}>
                <Ionicons name="menu" size={scale(18)} color="#2563EB" />
              </View>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity onPress={() => navigation.navigate("SettingsScreen")}>
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileContent}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
              <TouchableOpacity style={styles.cameraButton}>
                <Text style={styles.cameraIcon}>📷</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userProfile.name}</Text>
              <Text style={styles.profileRole}>Pet Parent</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('PetParentEdit')} style={styles.editButtonGradient}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* Stats */}
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Text style={[styles.statIcon, { color: stat.color }]}>
                  {stat.label === "Pets" ? "🐾" : stat.label === "Appointment" ? "📝" : "📅"}
                </Text>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Contact Info */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { marginBottom: moderateScale(15) }]}>Contact Information</Text>
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>✉️</Text>
              <Text style={styles.contactText}>{userProfile.email}</Text>
            </View>
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>📞</Text>
              <Text style={styles.contactText}>{userProfile.phone}</Text>
            </View>
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>📍</Text>
              <Text style={styles.contactText}>{userProfile.location}</Text>
            </View>
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>📅</Text>
              <Text style={styles.contactText}>Joined {userProfile.joinDate}</Text>
            </View>
          </View>

          {/* My Pets */}
          <View style={styles.section}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: verticalScale(14), alignItems: "center" }}>
              <Text style={styles.sectionTitle}>My Pets</Text>
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
                  <TouchableOpacity onPress={() => navigation.navigate('EditPetProfile', { petIndex: index })} style={styles.editButtonGradient}>
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {/* No pet message */}
            {userProfile.pets.length === 0 || userProfile.pets[0].name === "No pet registered" ? (
              <Text style={styles.noPetText}>
                You haven't registered any pets yet. Tap Edit to add your first pet!
              </Text>
            ) : null}
          </View>

          {/* Menu Items */}
          <View style={styles.menuSection}>
            {menuItems.map((item, index) => (
              <TouchableOpacity key={index} onPress={item.action} style={[styles.menuItem, index !== menuItems.length - 1 && styles.menuItemBorder]}>
                <Text style={styles.menuIcon}>
                  {item.label === "Edit Profile" ? "✏️" : item.label === "Settings" ? "⚙️" : item.label === "Favorites" ? "❤️" : "🏆"}
                </Text>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  backgroundGradient: { ...StyleSheet.absoluteFillObject },
  scrollView: { flex: 1 },
  header: { paddingHorizontal: scale(21), paddingTop: verticalScale(10), paddingBottom: verticalScale(50) },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: verticalScale(5) },
  headerTitle: { fontSize: moderateScale(20), fontWeight: "bold", color: "#fff" },
  settingsIcon: { fontSize: moderateScale(20), color: "#fff" },
  profileCard: { marginTop: verticalScale(-40), width: "90%", alignSelf: "center", backgroundColor: "#fff", borderRadius: moderateScale(15), padding: moderateScale(20), shadowColor: "#000", shadowOffset: { width: 0, height: verticalScale(4) }, shadowOpacity: 0.1, shadowRadius: moderateScale(7), elevation: 4 },
  profileContent: { flexDirection: "row", alignItems: "center" },
  avatarContainer: { position: "relative" },
  avatar: { width: scale(55), height: scale(55), borderRadius: moderateScale(28), borderWidth: 3, borderColor: "#fff" },
  profileAvatar: { width: scale(36), height: scale(36), borderRadius: scale(18), backgroundColor: '#dbeafe', justifyContent: 'center', alignItems: 'center', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  cameraButton: { position: "absolute", bottom: verticalScale(-2), right: scale(-2), backgroundColor: "#2563EB", borderRadius: moderateScale(11), width: scale(20), height: verticalScale(20), alignItems: "center", justifyContent: "center" },
  cameraIcon: { fontSize: moderateScale(10) },
  profileInfo: { flex: 1, marginLeft: scale(14) },
  profileName: { fontSize: moderateScale(16), fontWeight: "bold", color: "#1f2937" },
  profileRole: { fontSize: moderateScale(12), color: "#6b7280" },
  editButtonGradient: { paddingHorizontal: scale(14), paddingVertical: verticalScale(7), borderRadius: moderateScale(18), backgroundColor: "#2563EB" },
  editButtonText: { color: "#fff", fontSize: moderateScale(12), fontWeight: "600" },
  content: { paddingHorizontal: scale(21), paddingTop: verticalScale(14) },
  statsContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: verticalScale(20) },
  statCard: { flex: 1, backgroundColor: "#fff", borderRadius: moderateScale(10), paddingVertical: verticalScale(14), marginHorizontal: scale(3), alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: verticalScale(2) }, shadowOpacity: 0.05, shadowRadius: moderateScale(3), elevation: 2 },
  statIcon: { fontSize: moderateScale(20), marginBottom: verticalScale(6) },
  statValue: { fontSize: moderateScale(17), fontWeight: "bold", color: "#1f2937" },
  statLabel: { fontSize: moderateScale(10), color: "#6b7280" },
  section: { backgroundColor: "#fff", borderRadius: moderateScale(10), padding: moderateScale(17), marginBottom: verticalScale(20), shadowColor: "#000", shadowOffset: { width: 0, height: verticalScale(2) }, shadowOpacity: 0.05, shadowRadius: moderateScale(3), elevation: 2 },
  sectionTitle: { fontSize: moderateScale(15), fontWeight: "600", color: "#1f2937" },
  contactItem: { flexDirection: "row", alignItems: "center", marginBottom: verticalScale(10) },
  contactIcon: { fontSize: moderateScale(14), marginRight: scale(10), width: scale(18) },
  contactText: { fontSize: moderateScale(12), color: "#6b7280" },
  petItem: { flexDirection: "row", alignItems: "center", marginBottom: verticalScale(10), justifyContent: "space-between" },
  petImage: { width: scale(42), height: scale(42), borderRadius: moderateScale(21), borderWidth: 2, borderColor: "#dbeafe" },
  petInfo: { marginLeft: scale(10), flex: 1 },
  petName: { fontSize: moderateScale(14), fontWeight: "600", color: "#1f2937" },
  petDetails: { fontSize: moderateScale(12), color: "#6b7280" },
  noPetText: { fontSize: moderateScale(12), color: "#6b7280", fontStyle: 'italic', textAlign: 'center', marginTop: verticalScale(10) },
  menuSection: { backgroundColor: "#fff", borderRadius: moderateScale(10), marginBottom: verticalScale(20), shadowColor: "#000", shadowOffset: { width: 0, height: verticalScale(2) }, shadowOpacity: 0.05, shadowRadius: moderateScale(3), elevation: 2 },
  menuItem: { flexDirection: "row", alignItems: "center", padding: moderateScale(14) },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  menuIcon: { fontSize: moderateScale(18), marginRight: scale(14), width: scale(20) },
  menuLabel: { fontSize: moderateScale(14), fontWeight: "500", color: "#374151" },
});

export default ProfileScreen;
