import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import DESIGN from './DesignSystem'; // Import design system

const CACHE_KEYS = {
  USER_PROFILE: 'user_profile_cache',
  USER_EDIT_DATA: 'user_edit_data_cache',
};

const CACHE_DURATION = 10 * 60 * 1000;

const PetParentEdit = ({ navigation }) => {
  const { user, updateUser, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?fm=jpg&q=60&w=3000',
    address: '',
    bio: ''
  });

  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const cacheData = async (key, data) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (error) {
      console.error('Cache save error:', error);
    }
  };

  const getCachedData = async (key) => {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) return data;
      }
    } catch (error) {
      console.error('Cache read error:', error);
    }
    return null;
  };

  const startShimmerAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera roll access is needed to change profile picture');
      }
      await loadUserData();
    })();
  }, []);

  const loadUserData = async (useCache = true) => {
    try {
      setLoading(true);
      startShimmerAnimation();

      if (useCache) {
        const cachedData = await getCachedData(CACHE_KEYS.USER_EDIT_DATA);
        if (cachedData) {
          setUserData(cachedData);
          setLoading(false);
          shimmerAnim.stopAnimation();
          return;
        }
      }

      const response = await fetch(`https://snoutiq.com/backend/api/users/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const text = await response.text();
      const cleanText = text.trim().replace(/^\uFEFF/, "");
      const result = JSON.parse(cleanText);

      if (result.status !== "success") {
        throw new Error("Failed to fetch user data");
      }

      const apiData = result.data;
      const loadedData = {
        name: apiData.name || "",
        email: apiData.email || "",
        phone: apiData.phone ? apiData.phone.replace("+91", "") : "",
        avatar: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?fm=jpg&q=60&w=3000",
        address: apiData.latitude && apiData.longitude
          ? `${apiData.latitude}, ${apiData.longitude}`
          : "",
        bio: apiData.summary || "",
      };

      const storedData = await AsyncStorage.getItem("userData");
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        loadedData.avatar = parsedData.avatar || loadedData.avatar;
      }

      setUserData(loadedData);
      await cacheData(CACHE_KEYS.USER_EDIT_DATA, loadedData);
    } catch (error) {
      console.error("Error loading user data:", error);
      const cachedData = await getCachedData(CACHE_KEYS.USER_EDIT_DATA);
      if (cachedData) {
        setUserData(cachedData);
      } else {
        Alert.alert("Error", "Failed to load profile information");
      }
    } finally {
      setLoading(false);
      shimmerAnim.stopAnimation();
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!userData.name.trim()) newErrors.name = 'Name is required';
    if (!userData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) newErrors.email = 'Invalid email';
    if (userData.phone && !/^\d{10}$/.test(userData.phone)) newErrors.phone = 'Phone must be 10 digits';
    if (userData.bio.length > 200) newErrors.bio = 'Bio must be 200 characters or less';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        const newUserData = { ...userData, avatar: result.assets[0].uri };
        setUserData(newUserData);
        await cacheData(CACHE_KEYS.USER_EDIT_DATA, newUserData);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const [latitude, longitude] = userData.address
        .split(",")
        .map(coord => parseFloat(coord.trim()) || null);

      const apiData = {
        name: userData.name.trim(),
        phone: `+91${userData.phone.replace(/[^0-9]/g, "").slice(0, 10)}`,
        summary: userData.bio.trim(),
        latitude: latitude || 28.6139,
        longitude: longitude || 77.2090,
      };

      const response = await fetch(`https://snoutiq.com/backend/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });

      const text = await response.text();
      const cleanText = text.trim().replace(/^\uFEFF/, "");
      const result = JSON.parse(cleanText);

      if (result.status !== "success") {
        throw new Error("Failed to update profile");
      }

      const localData = {
        name: userData.name.trim(),
        email: userData.email.trim(),
        phone: userData.phone.replace(/[^0-9]/g, "").slice(0, 10),
        avatar: userData.avatar,
        address: userData.address.trim(),
        bio: userData.bio.trim(),
        updated_at: new Date().toISOString(),
      };

      await AsyncStorage.setItem("userData", JSON.stringify(localData));
      await cacheData(CACHE_KEYS.USER_EDIT_DATA, userData);
      await cacheData(CACHE_KEYS.USER_PROFILE, localData);

      if (updateUser) {
        await updateUser({ ...localData, id: user.id });
      }

      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Error", "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const ShimmerLoader = () => (
    <View style={styles.shimmerContainer}>
      <Animated.View style={[styles.shimmerAvatar, { opacity: shimmerAnim }]} />
      {[1, 2, 3, 4, 5].map((item) => (
        <View key={item} style={styles.shimmerInputGroup}>
          <Animated.View style={[styles.shimmerLabel, { opacity: shimmerAnim }]} />
          <Animated.View style={[styles.shimmerInput, { opacity: shimmerAnim }]} />
        </View>
      ))}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <LinearGradient colors={DESIGN.GRADIENTS.primary} style={styles.headerGradient}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={DESIGN.ICON_SIZES.md} color={DESIGN.COLORS.white} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Edit Profile</Text>
              <View style={styles.placeholder} />
            </View>
          </LinearGradient>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <ShimmerLoader />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <LinearGradient colors={DESIGN.GRADIENTS.primary} style={styles.headerGradient}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={DESIGN.ICON_SIZES.md} color={DESIGN.COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: userData.avatar }} style={styles.avatar} />
              <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
                <Ionicons name="camera" size={DESIGN.ICON_SIZES.sm} color={DESIGN.COLORS.white} />
              </TouchableOpacity>
            </View>
            <Text style={styles.avatarHint}>Tap to change photo</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                <Ionicons name="person" size={DESIGN.ICON_SIZES.sm} color={DESIGN.COLORS.primary} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor={DESIGN.COLORS.gray400}
                  value={userData.name}
                  onChangeText={(text) => updateField('name', text)}
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                <Ionicons name="mail" size={DESIGN.ICON_SIZES.sm} color={DESIGN.COLORS.success} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={DESIGN.COLORS.gray400}
                  value={userData.email}
                  onChangeText={(text) => updateField('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={[styles.inputContainer, errors.phone && styles.inputError]}>
                <Ionicons name="call" size={DESIGN.ICON_SIZES.sm} color={DESIGN.COLORS.warning} />
                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  style={[styles.input, { paddingLeft: 0 }]}
                  placeholder="Enter phone"
                  placeholderTextColor={DESIGN.COLORS.gray400}
                  value={userData.phone}
                  onChangeText={(text) => updateField('phone', text.replace(/[^0-9]/g, '').slice(0, 10))}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            {/* Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location (Latitude, Longitude)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="location" size={DESIGN.ICON_SIZES.sm} color={DESIGN.COLORS.error} />
                <TextInput
                  style={styles.input}
                  placeholder="28.7041, 77.1025"
                  placeholderTextColor={DESIGN.COLORS.gray400}
                  value={userData.address}
                  onChangeText={(text) => updateField('address', text)}
                />
              </View>
            </View>

            {/* Bio */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <View style={[styles.inputContainer, styles.bioContainer, errors.bio && styles.inputError]}>
                <Ionicons name="create" size={DESIGN.ICON_SIZES.sm} color={DESIGN.COLORS.secondary} style={styles.bioIcon} />
                <TextInput
                  style={[styles.input, styles.bioInput]}
                  placeholder="Tell us about yourself"
                  placeholderTextColor={DESIGN.COLORS.gray400}
                  value={userData.bio}
                  onChangeText={(text) => updateField('bio', text)}
                  multiline
                  maxLength={200}
                  textAlignVertical="top"
                />
              </View>
              <View style={styles.charCountContainer}>
                <Text style={styles.charCount}>{userData.bio.length}/200</Text>
              </View>
              {errors.bio && <Text style={styles.errorText}>{errors.bio}</Text>}
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={DESIGN.ICON_SIZES.md} color={DESIGN.COLORS.info} />
              <Text style={styles.infoText}>
                Your profile helps us provide personalized pet care services.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.saveContainer}>
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            <LinearGradient colors={DESIGN.GRADIENTS.primary} style={styles.saveGradient}>
              {saving ? (
                <ActivityIndicator color={DESIGN.COLORS.white} size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={DESIGN.ICON_SIZES.md} color={DESIGN.COLORS.white} />
                  <Text style={styles.saveText}>Save Changes</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DESIGN.SPACING.lg,
  },
  backButton: {
    padding: DESIGN.SPACING.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: DESIGN.RADIUS.md,
  },
  headerTitle: {
    fontSize: DESIGN.TYPOGRAPHY.h2,
    fontWeight: DESIGN.FONT_WEIGHTS.bold,
    color: DESIGN.COLORS.white,
  },
  placeholder: {
    width: DESIGN.ICON_SIZES.xl,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: DESIGN.SPACING.lg,
    paddingBottom: DESIGN.SPACING.xxl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: DESIGN.SPACING.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: DESIGN.SPACING.sm,
  },
  avatar: {
    width: DESIGN.AVATAR_SIZES.xxl,
    height: DESIGN.AVATAR_SIZES.xxl,
    borderRadius: DESIGN.AVATAR_SIZES.xxl / 2,
    borderWidth: 4,
    borderColor: DESIGN.COLORS.white,
    ...DESIGN.SHADOWS.lg,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: DESIGN.COLORS.primary,
    width: DESIGN.ICON_SIZES.xl,
    height: DESIGN.ICON_SIZES.xl,
    borderRadius: DESIGN.ICON_SIZES.xl / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: DESIGN.COLORS.white,
    ...DESIGN.SHADOWS.sm,
  },
  avatarHint: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    color: DESIGN.COLORS.gray600,
    fontWeight: DESIGN.FONT_WEIGHTS.medium,
  },
  formSection: {
    gap: DESIGN.SPACING.lg,
  },
  inputGroup: {
    gap: DESIGN.SPACING.xs,
  },
  label: {
    fontSize: DESIGN.TYPOGRAPHY.bodySmall,
    fontWeight: DESIGN.FONT_WEIGHTS.semibold,
    color: DESIGN.COLORS.gray700,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DESIGN.COLORS.surface,
    borderWidth: 1.5,
    borderColor: DESIGN.COLORS.gray200,
    borderRadius: DESIGN.RADIUS.md,
    paddingHorizontal: DESIGN.SPACING.md,
    height: DESIGN.INPUT_HEIGHTS.md,
    gap: DESIGN.SPACING.sm,
    ...DESIGN.SHADOWS.sm,
  },
  inputError: {
    borderColor: DESIGN.COLORS.error,
    borderWidth: 2,
  },
  input: {
    flex: 1,
    fontSize: DESIGN.TYPOGRAPHY.input,
    color: DESIGN.COLORS.gray900,
    fontWeight: DESIGN.FONT_WEIGHTS.medium,
  },
  bioContainer: {
    height: 100,
    alignItems: 'flex-start',
    paddingVertical: DESIGN.SPACING.md,
  },
  bioIcon: {
    marginTop: DESIGN.SPACING.xxs,
  },
  bioInput: {
    height: '100%',
    textAlignVertical: 'top',
  },
  countryCode: {
    fontSize: DESIGN.TYPOGRAPHY.input,
    color: DESIGN.COLORS.gray700,
    fontWeight: DESIGN.FONT_WEIGHTS.semibold,
  },
  charCountContainer: {
    alignItems: 'flex-end',
  },
  charCount: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    color: DESIGN.COLORS.gray500,
  },
  errorText: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    color: DESIGN.COLORS.error,
    marginTop: DESIGN.SPACING.xxs,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: `${DESIGN.COLORS.info}15`,
    padding: DESIGN.SPACING.md,
    borderRadius: DESIGN.RADIUS.lg,
    gap: DESIGN.SPACING.sm,
    borderWidth: 1,
    borderColor: `${DESIGN.COLORS.info}30`,
  },
  infoText: {
    flex: 1,
    fontSize: DESIGN.TYPOGRAPHY.bodySmall,
    color: DESIGN.COLORS.info,
    lineHeight: DESIGN.TYPOGRAPHY.bodySmall * 1.4,
  },
  saveContainer: {
    padding: DESIGN.SPACING.lg,
    paddingBottom: Platform.OS === 'ios' ? DESIGN.SPACING.xl : DESIGN.SPACING.lg,
    backgroundColor: DESIGN.COLORS.background,
    borderTopWidth: 1,
    borderTopColor: DESIGN.COLORS.gray100,
  },
  saveButton: {
    borderRadius: DESIGN.RADIUS.lg,
    overflow: 'hidden',
    ...DESIGN.SHADOWS.lg,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: DESIGN.BUTTON_HEIGHTS.lg,
    gap: DESIGN.SPACING.sm,
  },
  saveText: {
    fontSize: DESIGN.TYPOGRAPHY.button,
    fontWeight: DESIGN.FONT_WEIGHTS.bold,
    color: DESIGN.COLORS.white,
  },
  // Shimmer Styles
  shimmerContainer: {
    gap: DESIGN.SPACING.xl,
    paddingTop: DESIGN.SPACING.lg,
  },
  shimmerAvatar: {
    width: DESIGN.AVATAR_SIZES.xxl,
    height: DESIGN.AVATAR_SIZES.xxl,
    borderRadius: DESIGN.AVATAR_SIZES.xxl / 2,
    backgroundColor: DESIGN.COLORS.gray200,
    alignSelf: 'center',
    marginBottom: DESIGN.SPACING.md,
  },
  shimmerInputGroup: {
    gap: DESIGN.SPACING.xs,
  },
  shimmerLabel: {
    height: 16,
    backgroundColor: DESIGN.COLORS.gray200,
    borderRadius: DESIGN.RADIUS.xs,
    width: '30%',
  },
  shimmerInput: {
    height: DESIGN.INPUT_HEIGHTS.md,
    backgroundColor: DESIGN.COLORS.gray200,
    borderRadius: DESIGN.RADIUS.md,
  },
});

export default PetParentEdit;