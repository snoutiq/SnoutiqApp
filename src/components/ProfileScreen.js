import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
  RefreshControl,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useAuth } from "../context/AuthContext";

// Design System
const DESIGN = {
  COLORS: {
    primary: '#667eea',
    secondary: '#764ba2',
    white: '#FFFFFF',
    black: '#000000',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    background: '#F0F4FF',
    surface: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  TYPOGRAPHY: {
    h1: moderateScale(24, 0.3),
    h2: moderateScale(20, 0.3),
    h3: moderateScale(18, 0.3),
    body: moderateScale(15, 0.3),
    bodySmall: moderateScale(14, 0.3),
    caption: moderateScale(13, 0.3),
    button: moderateScale(16, 0.3),
    input: moderateScale(15, 0.3),
  },
  SPACING: {
    xxs: scale(4),
    xs: scale(8),
    sm: scale(12),
    md: scale(16),
    lg: scale(20),
    xl: scale(24),
    xxl: scale(32),
  },
  VERTICAL_SPACING: {
    xxs: verticalScale(4),
    xs: verticalScale(8),
    sm: verticalScale(12),
    md: verticalScale(16),
    lg: verticalScale(20),
    xl: verticalScale(24),
    xxl: verticalScale(32),
  },
  RADIUS: {
    xs: moderateScale(4),
    sm: moderateScale(8),
    md: moderateScale(12),
    lg: moderateScale(16),
    xl: moderateScale(20),
    xxl: moderateScale(24),
    full: moderateScale(999),
  },
  ICON_SIZES: {
    xs: scale(16),
    sm: scale(20),
    md: scale(24),
    lg: scale(28),
    xl: scale(32),
    xxl: scale(40),
  },
  AVATAR_SIZES: {
    sm: scale(40),
    md: scale(60),
    lg: scale(80),
    xl: scale(100),
    xxl: scale(120),
  },
  SHADOWS: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: verticalScale(1) },
      shadowOpacity: 0.05,
      shadowRadius: moderateScale(2),
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: verticalScale(2) },
      shadowOpacity: 0.1,
      shadowRadius: moderateScale(4),
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: verticalScale(4) },
      shadowOpacity: 0.12,
      shadowRadius: moderateScale(8),
      elevation: 5,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: verticalScale(8) },
      shadowOpacity: 0.15,
      shadowRadius: moderateScale(16),
      elevation: 8,
    },
  },
  INPUT_HEIGHTS: {
    sm: verticalScale(40),
    md: verticalScale(48),
  },
  BUTTON_HEIGHTS: {
    md: verticalScale(44),
    lg: verticalScale(52),
  },
  GRADIENTS: {
    primary: ['#667eea', '#764ba2'],
    background: ['#F8F9FA', '#E5E7EB'],
  },
};

const CACHE_KEYS = {
  USER_PROFILE: "user_profile_cache",
  PETS_DATA: "pets_data_cache",
  STATS_DATA: "stats_data_cache",
  DOG_BREEDS: "dog_breeds_cache",
};

const CACHE_DURATION = 10 * 60 * 1000;

const ProfileScreen = ({ navigation }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [petsLoading, setPetsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { logout, user, token } = useAuth();
  
 const [stats, setStats] = useState([
  {
    label: "Registered Pets",
    value: "—",  // placeholder, static
    icon: "🐾",
    description: "Your furry family members",
  },
  {
    label: "Completed Visits",
    value: "—",
    icon: "🩺",
    description: "Vet appointments completed",
  },
  {
    label: "Active Plans",
    value: "—",
    icon: "📋",
    description: "Health or grooming plans",
  },
  {
    label: "Total Rewards",
    value: "—",
    icon: "🏆",
    description: "Points earned so far",
  },
]);

// console.log(user);

  const [selectedPet, setSelectedPet] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [petFormData, setPetFormData] = useState({
    name: "",
    breed: "",
    age: "",
    gender: "",
    weight: "",
    petType: "",
  });

  const [breedModalVisible, setBreedModalVisible] = useState(false);
  const [breedSearch, setBreedSearch] = useState("");
  const [dogBreeds, setDogBreeds] = useState([]);
  const [catBreeds] = useState([
    { label: "American Shorthair", value: "american_shorthair" },
    { label: "Domestic Shorthair", value: "domestic_shorthair" },
    { label: "Siamese", value: "siamese" },
    { label: "Persian", value: "persian" },
    { label: "Maine Coon", value: "maine_coon" },
    { label: "Bengal", value: "bengal" },
    { label: "Ragdoll", value: "ragdoll" },
    { label: "Sphynx", value: "sphynx" },
    { label: "Mixed Breed", value: "mixed_breed" },
    { label: "Other", value: "other" },
  ]);
  const [loadingBreeds, setLoadingBreeds] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const cacheData = async (key, data) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (error) {
      console.error("Cache save error:", error);
    }
  };

  const getCachedData = async (key, forceRefresh = false) => {
    try {
      if (forceRefresh) return null;
      const cached = await AsyncStorage.getItem(key);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) return data;
      }
    } catch (error) {
      console.error("Cache read error:", error);
    }
    return null;
  };

  const clearCache = async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error("Cache clear error:", error);
    }
  };

  const clearAllProfileCache = async () => {
    try {
      await Promise.all(Object.values(CACHE_KEYS).map(key => clearCache(key)));
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  };

  const fetchDogBreeds = async () => {
    setLoadingBreeds(true);
    try {
      const cachedBreeds = await getCachedData(CACHE_KEYS.DOG_BREEDS);
      if (cachedBreeds) {
        setDogBreeds(cachedBreeds);
        return;
      }

      const response = await axios.get("https://snoutiq.com/backend/api/dog-breeds/all", {
        timeout: 10000,
      });

      if (response.data.status === "success" && response.data.breeds) {
        const breeds = [];
        Object.keys(response.data.breeds).forEach((breedKey) => {
          const subBreeds = response.data.breeds[breedKey];
          if (subBreeds.length === 0) {
            breeds.push({
              label: breedKey.charAt(0).toUpperCase() + breedKey.slice(1),
              value: breedKey,
            });
          } else {
            subBreeds.forEach((subBreed) => {
              breeds.push({
                label: `${subBreed.charAt(0).toUpperCase() + subBreed.slice(1)} ${breedKey.charAt(0).toUpperCase() + breedKey.slice(1)}`,
                value: `${breedKey}/${subBreed}`,
              });
            });
          }
        });
        breeds.sort((a, b) => a.label.localeCompare(b.label));
        breeds.push(
          { label: "Mixed Breed", value: "mixed_breed" },
          { label: "Other", value: "other" }
        );
        setDogBreeds(breeds);
        await cacheData(CACHE_KEYS.DOG_BREEDS, breeds);
      }
    } catch (error) {
      console.error("Error fetching breeds:", error);
    } finally {
      setLoadingBreeds(false);
    }
  };

  const fetchPetsFromAPI = async (userId, forceRefresh = false) => {
    try {
      setPetsLoading(true);
      if (!forceRefresh) {
        const cachedPets = await getCachedData(CACHE_KEYS.PETS_DATA);
        if (cachedPets) return cachedPets;
      }

      const response = await axios.get(
        `https://snoutiq.com/backend/api/users/${userId}/pets`,
        {
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "success" && Array.isArray(response.data.data)) {
        const transformedPets = response.data.data.map((pet) => ({
          id: pet.id,
          name: pet.name || "Unknown Pet",
          age: pet.pet_age || 0,
          gender: pet.pet_gender || "",
          breed: pet.breed || "Pet",
          avatar: pet.pet_doc1,
          petType: pet.breed?.toLowerCase().includes("cat") ? "cat" : "dog",
          weight: pet.weight || "",
        }));

        await cacheData(CACHE_KEYS.PETS_DATA, transformedPets);
        return transformedPets;
      }
      return [];
    } catch (error) {
      console.error("Error fetching pets:", error);
      if (!forceRefresh) {
        const cachedPets = await getCachedData(CACHE_KEYS.PETS_DATA);
        return cachedPets || [];
      }
      return [];
    } finally {
      setPetsLoading(false);
    }
  };

  const fetchUserData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      if (forceRefresh) await clearAllProfileCache();

      if (!forceRefresh) {
        const cachedProfile = await getCachedData(CACHE_KEYS.USER_PROFILE);
        if (cachedProfile) {
          setUserProfile(cachedProfile);
          const cachedStats = await getCachedData(CACHE_KEYS.STATS_DATA);
          if (cachedStats) setStats(cachedStats);
          setLoading(false);
          return;
        }
      }

      let petsArray = [];
      let joinDate = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
      let daysActive = "0";

      if (user) {
        const createdAt = new Date(user.created_at || Date.now());
        joinDate = createdAt.toLocaleDateString("en-US", { month: "long", year: "numeric" });
        daysActive = Math.round((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)).toString();

        if (user.id) {
          const apiPets = await fetchPetsFromAPI(user.id, forceRefresh);
          if (apiPets && apiPets.length > 0) petsArray = apiPets;
        }

        const profileData = {
          name: user.name || "User",
          email: user.email || "user@example.com",
          phone: user.phone ? `+91 ${user.phone}` : "+91 0000000000",
          location: user.latitude && user.longitude ? `${user.latitude}, ${user.longitude}` : "Haryana, Gurgaon",
          joinDate,
          avatar: "",
          pets: petsArray,
        };

        setUserProfile(profileData);
        const updatedStats = [
          { ...stats[0], value: petsArray.length.toString() },
          { ...stats[1], value: "2" },
          { ...stats[2], value: daysActive },
        ];
        setStats(updatedStats);

        await cacheData(CACHE_KEYS.USER_PROFILE, profileData);
        await cacheData(CACHE_KEYS.STATS_DATA, updatedStats);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePet = async (petId) => {
    Alert.alert("Delete Pet", "Are you sure you want to delete this pet?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setPetsLoading(true);
          try {
            await axios.delete(`https://snoutiq.com/backend/api/pets/${petId}`, {
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            });
            await fetchUserData(true);
            Alert.alert("Success", "Pet deleted successfully");
          } catch (error) {
            Alert.alert("Error", "Failed to delete pet");
          } finally {
            setPetsLoading(false);
          }
        },
      },
    ]);
  };

  const handleEditPet = (pet) => {
    setSelectedPet(pet);
    setPetFormData({
      name: pet.name,
      breed: pet.breed,
      age: pet.age?.toString(),
      gender: pet.gender,
      weight: pet.weight?.toString(),
      petType: pet.petType || (pet.breed?.toLowerCase().includes("cat") ? "cat" : "dog"),
    });
    setEditModalVisible(true);
  };

  const handleUpdatePet = async () => {
    if (!selectedPet) return;
    setPetsLoading(true);
    try {
      await axios.put(
        `https://snoutiq.com/backend/api/pets/${selectedPet.id}`,
        {
          name: petFormData.name,
          breed: petFormData.breed,
          pet_age: petFormData.age ? parseFloat(petFormData.age) : null,
          pet_gender: petFormData.gender,
          weight: petFormData.weight ? parseFloat(petFormData.weight) : null,
        },
        {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }
      );
      await fetchUserData(true);
      setEditModalVisible(false);
      Alert.alert("Success", "Pet updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update pet");
    } finally {
      setPetsLoading(false);
    }
  };

  const handleAddPet = () => {
    AsyncStorage.setItem('expecting_new_pet', 'true');
    navigation.navigate("EditPetProfile", { user: user.id, token });
  };

  useFocusEffect(
    useCallback(() => {
      const checkForNewPet = async () => {
        const expectingNewPet = await AsyncStorage.getItem('expecting_new_pet');
        if (expectingNewPet === 'true') {
          await fetchUserData(true);
          await AsyncStorage.removeItem('expecting_new_pet');
        } else {
          await fetchUserData(false);
        }
        await fetchDogBreeds();
      };
      checkForNewPet();
    }, [user, token])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchUserData(true);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await clearAllProfileCache();
          await logout();
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        },
      },
    ]);
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const ShimmerLoader = () => (
    <View style={styles.shimmerContainer}>
      <Animated.View style={[styles.shimmerHeader, { opacity: fadeAnim }]}>
        <View style={styles.shimmerAvatar} />
        <View style={styles.shimmerProfileText}>
          <View style={styles.shimmerTitle} />
          <View style={styles.shimmerSubtitle} />
        </View>
      </Animated.View>
      <Animated.View style={[styles.shimmerStats, { opacity: fadeAnim }]}>
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.shimmerStat}>
            <View style={styles.shimmerStatIcon} />
            <View style={styles.shimmerStatValue} />
          </View>
        ))}
      </Animated.View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={DESIGN.GRADIENTS.background} style={styles.background} />
        <ScrollView style={styles.scrollView}>
          <ShimmerLoader />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const getBreedOptions = () => {
    const breeds = petFormData.petType === "dog" ? dogBreeds : catBreeds;
    if (breedSearch) {
      return breeds.filter((breed) => breed.label.toLowerCase().includes(breedSearch.toLowerCase()));
    }
    return breeds;
  };

  const renderBreedItem = ({ item }) => (
    <TouchableOpacity
      style={styles.breedItem}
      onPress={() => {
        setPetFormData((prev) => ({ ...prev, breed: item.value }));
        setBreedModalVisible(false);
        setBreedSearch("");
      }}
      activeOpacity={0.7}
    >
      <Text style={styles.breedItemText}>{item.label}</Text>
      {petFormData.breed === item.value && (
        <Ionicons name="checkmark-circle" size={DESIGN.ICON_SIZES.sm} color={DESIGN.COLORS.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={DESIGN.GRADIENTS.primary} style={styles.headerGradient}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[DESIGN.COLORS.primary]}
            tintColor={DESIGN.COLORS.primary}
          />
        }
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileContent}>
            <View style={styles.avatarContainer}>
              {userProfile?.avatar ? (
                <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
              ) : (
                <LinearGradient colors={DESIGN.GRADIENTS.primary} style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {userProfile?.name?.charAt(0).toUpperCase() || "U"}
                  </Text>
                </LinearGradient>
              )}
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userProfile?.name || "User"}</Text>
              <Text style={styles.profileEmail}>{userProfile?.email}</Text>
              
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={DESIGN.ICON_SIZES.xs} color={DESIGN.COLORS.gray500} />
                <Text style={styles.infoText}>{userProfile?.location}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={DESIGN.ICON_SIZES.xs} color={DESIGN.COLORS.gray500} />
                <Text style={styles.infoText}>Joined {userProfile?.joinDate}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <TouchableOpacity
              key={index}
              style={styles.statCard}
              activeOpacity={0.7}
            >
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* My Pets Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="paw" size={DESIGN.ICON_SIZES.md} color={DESIGN.COLORS.primary} />
              <Text style={styles.sectionTitle}>My Pets</Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={handleAddPet}>
              <Ionicons name="add" size={DESIGN.ICON_SIZES.md} color={DESIGN.COLORS.white} />
            </TouchableOpacity>
          </View>

          {petsLoading ? (
            <ActivityIndicator size="large" color={DESIGN.COLORS.primary} style={styles.loader} />
          ) : userProfile?.pets && userProfile.pets.length > 0 ? (
            userProfile.pets.map((pet) => (
              <View key={pet.id} style={styles.petCard}>
                <View style={styles.petInfoContainer}>
                  {pet.avatar ? (
                    <Image source={{ uri: pet.avatar }} style={styles.petImage} />
                  ) : (
                    <LinearGradient colors={DESIGN.GRADIENTS.primary} style={styles.petImagePlaceholder}>
                      <Text style={styles.petImageText}>{pet.name?.charAt(0).toUpperCase() || "P"}</Text>
                    </LinearGradient>
                  )}
                  <View style={styles.petDetails}>
                    <Text style={styles.petName}>{pet.name}</Text>
                    <Text style={styles.petDescription}>
                      {pet.breed} • {pet.age} yrs • {pet.gender}
                      {pet.weight && ` • ${pet.weight} kg`}
                    </Text>
                  </View>
                </View>

                <View style={styles.petActions}>
                  <TouchableOpacity style={styles.editButton} onPress={() => handleEditPet(pet)}>
                    <Ionicons name="pencil" size={DESIGN.ICON_SIZES.xs} color={DESIGN.COLORS.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeletePet(pet.id)}>
                    <Ionicons name="trash" size={DESIGN.ICON_SIZES.xs} color={DESIGN.COLORS.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <TouchableOpacity style={styles.noPetsCard} onPress={handleAddPet}>
              <Ionicons name="paw-outline" size={DESIGN.ICON_SIZES.xxl} color={DESIGN.COLORS.gray400} />
              <Text style={styles.noPetsTitle}>Add Your First Pet</Text>
              <Text style={styles.noPetsText}>Tap to get started</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("SettingsScreen")}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="settings" size={DESIGN.ICON_SIZES.sm} color={DESIGN.COLORS.primary} />
              </View>
              <Text style={styles.menuLabel}>Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={DESIGN.ICON_SIZES.sm} color={DESIGN.COLORS.gray400} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("HelpCenter")}>
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="help-circle" size={DESIGN.ICON_SIZES.sm} color={DESIGN.COLORS.info} />
              </View>
              <Text style={styles.menuLabel}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={DESIGN.ICON_SIZES.sm} color={DESIGN.COLORS.gray400} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={DESIGN.ICON_SIZES.sm} color={DESIGN.COLORS.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>SnoutIQ v1.0.0</Text>
      </ScrollView>

      {/* Edit Pet Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Pet</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={DESIGN.ICON_SIZES.md} color={DESIGN.COLORS.gray700} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Pet Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={petFormData.name}
                  onChangeText={(text) => setPetFormData((prev) => ({ ...prev, name: text }))}
                  placeholder="Enter pet's name"
                  placeholderTextColor={DESIGN.COLORS.gray400}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Pet Type</Text>
                <View style={styles.optionRow}>
                  {["dog", "cat"].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.optionButton,
                        petFormData.petType === type && styles.optionButtonSelected,
                      ]}
                      onPress={() => setPetFormData((prev) => ({ ...prev, petType: type, breed: "" }))}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          petFormData.petType === type && styles.optionTextSelected,
                        ]}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Breed</Text>
                <TouchableOpacity
                  style={styles.breedSelector}
                  onPress={() => petFormData.petType && setBreedModalVisible(true)}
                  disabled={!petFormData.petType || loadingBreeds}
                >
                  <Text style={[styles.breedSelectorText, !petFormData.breed && styles.placeholderText]}>
                    {petFormData.breed
                      ? (petFormData.petType === "dog" ? dogBreeds : catBreeds).find(b => b.value === petFormData.breed)?.label || petFormData.breed
                      : loadingBreeds ? "Loading..." : "Select breed"}
                  </Text>
                  <Ionicons name="chevron-down" size={DESIGN.ICON_SIZES.sm} color={DESIGN.COLORS.gray400} />
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Age (years)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={petFormData.age}
                    onChangeText={(text) => setPetFormData((prev) => ({ ...prev, age: text }))}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor={DESIGN.COLORS.gray400}
                  />
                </View>

                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Weight (kg)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={petFormData.weight}
                    onChangeText={(text) => setPetFormData((prev) => ({ ...prev, weight: text }))}
                    placeholder="0.0"
                    keyboardType="numeric"
                    placeholderTextColor={DESIGN.COLORS.gray400}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Gender</Text>
                <View style={styles.optionRow}>
                  {["Male", "Female"].map((gender) => (
                    <TouchableOpacity
                      key={gender}
                      style={[
                        styles.optionButton,
                        petFormData.gender === gender && styles.optionButtonSelected,
                      ]}
                      onPress={() => setPetFormData((prev) => ({ ...prev, gender }))}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          petFormData.gender === gender && styles.optionTextSelected,
                        ]}
                      >
                        {gender}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleUpdatePet}
                disabled={petsLoading}
              >
                <LinearGradient colors={DESIGN.GRADIENTS.primary} style={styles.saveButtonGradient}>
                  {petsLoading ? (
                    <ActivityIndicator size="small" color={DESIGN.COLORS.white} />
                  ) : (
                    <Text style={styles.saveButtonText}>Update</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Breed Selection Modal */}
      <Modal
        visible={breedModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBreedModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.breedModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Breed</Text>
              <TouchableOpacity onPress={() => setBreedModalVisible(false)}>
                <Ionicons name="close" size={DESIGN.ICON_SIZES.md} color={DESIGN.COLORS.gray700} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={DESIGN.ICON_SIZES.sm} color={DESIGN.COLORS.gray400} />
              <TextInput
                style={styles.searchInput}
                value={breedSearch}
                onChangeText={setBreedSearch}
                placeholder="Search breeds..."
                placeholderTextColor={DESIGN.COLORS.gray400}
              />
            </View>

            <FlatList
              data={getBreedOptions()}
              renderItem={renderBreedItem}
              keyExtractor={(item) => item.value}
              style={styles.breedList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN.COLORS.background,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? DESIGN.SPACING.xl : DESIGN.SPACING.xxl,
    paddingBottom: DESIGN.SPACING.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: DESIGN.SPACING.lg,
  },
  headerTitle: {
    fontSize: DESIGN.TYPOGRAPHY.h1,
    fontWeight: '700',
    color: DESIGN.COLORS.white,
  },
  settingsButton: {
    padding: DESIGN.SPACING.xs,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: DESIGN.RADIUS.md,
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: DESIGN.COLORS.surface,
    marginHorizontal: DESIGN.SPACING.lg,
    marginTop: DESIGN.SPACING.xl,
    padding: DESIGN.SPACING.lg,
    borderRadius: DESIGN.RADIUS.xl,
    ...DESIGN.SHADOWS.lg,
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarContainer: {
    position: "relative",
    marginRight: DESIGN.SPACING.md,
  },
  avatar: {
    width: DESIGN.AVATAR_SIZES.lg,
    height: DESIGN.AVATAR_SIZES.lg,
    borderRadius: DESIGN.AVATAR_SIZES.lg / 2,
    borderWidth: 3,
    borderColor: DESIGN.COLORS.white,
  },
  avatarPlaceholder: {
    width: DESIGN.AVATAR_SIZES.lg,
    height: DESIGN.AVATAR_SIZES.lg,
    borderRadius: DESIGN.AVATAR_SIZES.lg / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: DESIGN.COLORS.white,
  },
  avatarText: {
    fontSize: DESIGN.TYPOGRAPHY.h1,
    color: DESIGN.COLORS.white,
    fontWeight: '700',
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: DESIGN.COLORS.primary,
    borderRadius: DESIGN.RADIUS.full,
    padding: DESIGN.SPACING.xs,
    ...DESIGN.SHADOWS.sm,
  },
  profileInfo: {
    flex: 1,
    gap: DESIGN.SPACING.xxs,
  },
  profileName: {
    fontSize: DESIGN.TYPOGRAPHY.h2,
    fontWeight: '700',
    color: DESIGN.COLORS.gray900,
  },
  profileEmail: {
    fontSize: DESIGN.TYPOGRAPHY.bodySmall,
    color: DESIGN.COLORS.gray600,
    marginBottom: DESIGN.SPACING.xs,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: DESIGN.SPACING.xs,
  },
  infoText: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    color: DESIGN.COLORS.gray600,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: DESIGN.SPACING.lg,
    marginVertical: DESIGN.SPACING.lg,
    gap: DESIGN.SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: DESIGN.COLORS.surface,
    padding: DESIGN.SPACING.md,
    borderRadius: DESIGN.RADIUS.lg,
    alignItems: "center",
    ...DESIGN.SHADOWS.md,
  },
  statIcon: {
    fontSize: DESIGN.TYPOGRAPHY.h1,
    marginBottom: DESIGN.SPACING.xs,
  },
  statValue: {
    fontSize: DESIGN.TYPOGRAPHY.h2,
    fontWeight: '700',
    color: DESIGN.COLORS.gray900,
  },
  statLabel: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    color: DESIGN.COLORS.gray600,
    marginTop: DESIGN.SPACING.xxs,
  },
  section: {
    marginHorizontal: DESIGN.SPACING.lg,
    marginBottom: DESIGN.SPACING.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: DESIGN.SPACING.md,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: DESIGN.SPACING.xs,
  },
  sectionTitle: {
    fontSize: DESIGN.TYPOGRAPHY.h3,
    fontWeight: '700',
    color: DESIGN.COLORS.gray900,
  },
  addButton: {
    backgroundColor: DESIGN.COLORS.primary,
    width: DESIGN.ICON_SIZES.xl,
    height: DESIGN.ICON_SIZES.xl,
    borderRadius: DESIGN.ICON_SIZES.xl / 2,
    alignItems: "center",
    justifyContent: "center",
    ...DESIGN.SHADOWS.sm,
  },
  petCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: DESIGN.COLORS.surface,
    padding: DESIGN.SPACING.md,
    borderRadius: DESIGN.RADIUS.lg,
    marginBottom: DESIGN.SPACING.sm,
    ...DESIGN.SHADOWS.md,
  },
  petInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  petImage: {
    width: DESIGN.AVATAR_SIZES.md,
    height: DESIGN.AVATAR_SIZES.md,
    borderRadius: DESIGN.AVATAR_SIZES.md / 2,
    marginRight: DESIGN.SPACING.md,
  },
  petImagePlaceholder: {
    width: DESIGN.AVATAR_SIZES.md,
    height: DESIGN.AVATAR_SIZES.md,
    borderRadius: DESIGN.AVATAR_SIZES.md / 2,
    marginRight: DESIGN.SPACING.md,
    alignItems: "center",
    justifyContent: "center",
  },
  petImageText: {
    fontSize: DESIGN.TYPOGRAPHY.h3,
    color: DESIGN.COLORS.white,
    fontWeight: '700',
  },
  petDetails: {
    flex: 1,
  },
  petName: {
    fontSize: DESIGN.TYPOGRAPHY.body,
    fontWeight: '600',
    color: DESIGN.COLORS.gray900,
    marginBottom: DESIGN.SPACING.xxs,
  },
  petDescription: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    color: DESIGN.COLORS.gray600,
  },
  petActions: {
    flexDirection: "row",
    gap: DESIGN.SPACING.xs,
  },
  editButton: {
    padding: DESIGN.SPACING.xs,
    backgroundColor: DESIGN.COLORS.gray100,
    borderRadius: DESIGN.RADIUS.md,
  },
  deleteButton: {
    padding: DESIGN.SPACING.xs,
    backgroundColor: `${DESIGN.COLORS.error}15`,
    borderRadius: DESIGN.RADIUS.md,
  },
  noPetsCard: {
    alignItems: "center",
    padding: DESIGN.SPACING.xxl,
    backgroundColor: DESIGN.COLORS.surface,
    borderRadius: DESIGN.RADIUS.lg,
    ...DESIGN.SHADOWS.md,
  },
  noPetsTitle: {
    fontSize: DESIGN.TYPOGRAPHY.h3,
    fontWeight: '700',
    color: DESIGN.COLORS.gray900,
    marginTop: DESIGN.SPACING.md,
  },
  noPetsText: {
    fontSize: DESIGN.TYPOGRAPHY.body,
    color: DESIGN.COLORS.gray600,
    marginTop: DESIGN.SPACING.xs,
  },
  menuSection: {
    marginHorizontal: DESIGN.SPACING.lg,
    backgroundColor: DESIGN.COLORS.surface,
    borderRadius: DESIGN.RADIUS.lg,
    overflow: "hidden",
    ...DESIGN.SHADOWS.md,
    marginBottom: DESIGN.SPACING.lg,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: DESIGN.SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN.COLORS.gray100,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: DESIGN.SPACING.md,
  },
  menuIconContainer: {
    width: DESIGN.ICON_SIZES.xl,
    height: DESIGN.ICON_SIZES.xl,
    borderRadius: DESIGN.RADIUS.md,
    backgroundColor: DESIGN.COLORS.gray50,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    fontSize: DESIGN.TYPOGRAPHY.body,
    fontWeight: '500',
    color: DESIGN.COLORS.gray900,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DESIGN.COLORS.surface,
    marginHorizontal: DESIGN.SPACING.lg,
    padding: DESIGN.SPACING.md,
    borderRadius: DESIGN.RADIUS.lg,
    gap: DESIGN.SPACING.sm,
    ...DESIGN.SHADOWS.md,
    marginBottom: DESIGN.SPACING.lg,
  },
  logoutText: {
    fontSize: DESIGN.TYPOGRAPHY.body,
    fontWeight: '600',
    color: DESIGN.COLORS.error,
  },
  versionText: {
    textAlign: "center",
    fontSize: DESIGN.TYPOGRAPHY.caption,
    color: DESIGN.COLORS.gray400,
    marginBottom: DESIGN.SPACING.xxl,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: DESIGN.COLORS.overlay,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: DESIGN.COLORS.surface,
    borderTopLeftRadius: DESIGN.RADIUS.xxl,
    borderTopRightRadius: DESIGN.RADIUS.xxl,
    maxHeight: "85%",
    ...DESIGN.SHADOWS.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: DESIGN.SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN.COLORS.gray100,
  },
  modalTitle: {
    fontSize: DESIGN.TYPOGRAPHY.h3,
    fontWeight: '700',
    color: DESIGN.COLORS.gray900,
  },
  modalBody: {
    padding: DESIGN.SPACING.lg,
  },
  inputGroup: {
    marginBottom: DESIGN.SPACING.md,
  },
  inputLabel: {
    fontSize: DESIGN.TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: DESIGN.COLORS.gray700,
    marginBottom: DESIGN.SPACING.xs,
  },
  textInput: {
    backgroundColor: DESIGN.COLORS.surface,
    borderWidth: 1.5,
    borderColor: DESIGN.COLORS.gray200,
    borderRadius: DESIGN.RADIUS.md,
    paddingHorizontal: DESIGN.SPACING.md,
    height: DESIGN.INPUT_HEIGHTS.md,
    fontSize: DESIGN.TYPOGRAPHY.input,
    color: DESIGN.COLORS.gray900,
  },
  optionRow: {
    flexDirection: "row",
    gap: DESIGN.SPACING.xs,
  },
  optionButton: {
    flex: 1,
    padding: DESIGN.SPACING.sm,
    borderWidth: 1.5,
    borderColor: DESIGN.COLORS.gray200,
    borderRadius: DESIGN.RADIUS.md,
    alignItems: "center",
  },
  optionButtonSelected: {
    backgroundColor: DESIGN.COLORS.primary,
    borderColor: DESIGN.COLORS.primary,
  },
  optionText: {
    fontSize: DESIGN.TYPOGRAPHY.bodySmall,
    fontWeight: '500',
    color: DESIGN.COLORS.gray700,
  },
  optionTextSelected: {
    color: DESIGN.COLORS.white,
  },
  breedSelector: {
    backgroundColor: DESIGN.COLORS.surface,
    borderWidth: 1.5,
    borderColor: DESIGN.COLORS.gray200,
    borderRadius: DESIGN.RADIUS.md,
    paddingHorizontal: DESIGN.SPACING.md,
    height: DESIGN.INPUT_HEIGHTS.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  breedSelectorText: {
    flex: 1,
    fontSize: DESIGN.TYPOGRAPHY.input,
    color: DESIGN.COLORS.gray900,
  },
  placeholderText: {
    color: DESIGN.COLORS.gray400,
  },
  row: {
    flexDirection: "row",
    gap: DESIGN.SPACING.sm,
  },
  halfInput: {
    flex: 1,
  },
  modalFooter: {
    flexDirection: "row",
    padding: DESIGN.SPACING.lg,
    gap: DESIGN.SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: DESIGN.COLORS.gray100,
  },
  cancelButton: {
    flex: 1,
    height: DESIGN.BUTTON_HEIGHTS.md,
    backgroundColor: DESIGN.COLORS.gray100,
    borderRadius: DESIGN.RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: DESIGN.TYPOGRAPHY.button,
    fontWeight: '600',
    color: DESIGN.COLORS.gray700,
  },
  saveButton: {
    flex: 1,
    borderRadius: DESIGN.RADIUS.md,
    overflow: "hidden",
    ...DESIGN.SHADOWS.sm,
  },
  saveButtonGradient: {
    height: DESIGN.BUTTON_HEIGHTS.md,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: DESIGN.TYPOGRAPHY.button,
    fontWeight: '700',
    color: DESIGN.COLORS.white,
  },
  // Breed Modal
  breedModalContent: {
    backgroundColor: DESIGN.COLORS.surface,
    borderTopLeftRadius: DESIGN.RADIUS.xxl,
    borderTopRightRadius: DESIGN.RADIUS.xxl,
    height: "70%",
    ...DESIGN.SHADOWS.xl,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DESIGN.COLORS.gray50,
    margin: DESIGN.SPACING.lg,
    paddingHorizontal: DESIGN.SPACING.md,
    borderRadius: DESIGN.RADIUS.md,
    gap: DESIGN.SPACING.xs,
  },
  searchInput: {
    flex: 1,
    height: DESIGN.INPUT_HEIGHTS.sm,
    fontSize: DESIGN.TYPOGRAPHY.body,
    color: DESIGN.COLORS.gray900,
  },
  breedList: {
    flex: 1,
  },
  breedItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: DESIGN.SPACING.md,
    paddingHorizontal: DESIGN.SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN.COLORS.gray100,
  },
  breedItemText: {
    fontSize: DESIGN.TYPOGRAPHY.body,
    color: DESIGN.COLORS.gray900,
  },
  loader: {
    marginVertical: DESIGN.SPACING.lg,
  },
  // Shimmer Styles
  shimmerContainer: {
    padding: DESIGN.SPACING.lg,
  },
  shimmerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: DESIGN.SPACING.lg,
  },
  shimmerAvatar: {
    width: DESIGN.AVATAR_SIZES.lg,
    height: DESIGN.AVATAR_SIZES.lg,
    borderRadius: DESIGN.AVATAR_SIZES.lg / 2,
    backgroundColor: DESIGN.COLORS.gray200,
    marginRight: DESIGN.SPACING.md,
  },
  shimmerProfileText: {
    flex: 1,
  },
  shimmerTitle: {
    height: 20,
    backgroundColor: DESIGN.COLORS.gray200,
    borderRadius: DESIGN.RADIUS.xs,
    marginBottom: DESIGN.SPACING.xs,
    width: "70%",
  },
  shimmerSubtitle: {
    height: 16,
    backgroundColor: DESIGN.COLORS.gray200,
    borderRadius: DESIGN.RADIUS.xs,
    width: "50%",
  },
  shimmerStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: DESIGN.SPACING.sm,
  },
  shimmerStat: {
    flex: 1,
    alignItems: "center",
    backgroundColor: DESIGN.COLORS.gray100,
    padding: DESIGN.SPACING.md,
    borderRadius: DESIGN.RADIUS.lg,
  },
  shimmerStatIcon: {
    width: DESIGN.ICON_SIZES.xl,
    height: DESIGN.ICON_SIZES.xl,
    borderRadius: DESIGN.ICON_SIZES.xl / 2,
    backgroundColor: DESIGN.COLORS.gray200,
    marginBottom: DESIGN.SPACING.xs,
  },
  shimmerStatValue: {
    height: 16,
    backgroundColor: DESIGN.COLORS.gray200,
    borderRadius: DESIGN.RADIUS.xs,
    width: "60%",
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: DESIGN.VERTICAL_SPACING.xxl * 3,
  },
});

export default ProfileScreen;