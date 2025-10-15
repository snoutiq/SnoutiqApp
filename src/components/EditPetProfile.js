import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Modal,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Platform,
  Animated,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DESIGN from './DesignSystem'; // Import design system

const API_BASE_URL = 'https://snoutiq.com/backend/api';
const CACHE_KEYS = {
  DOG_BREEDS: 'dog_breeds_cache',
  PETS_DATA: 'pets_data_cache',
};

const EditPetProfile = ({ navigation, route }) => {
  const { user, token } = route.params || {};
  
  const [formData, setFormData] = useState({
    name: '',
    petType: '',
    petGender: '',
    breed: '',
    age: '',
    weight: '',
    avatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop',
  });
  
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [dogBreeds, setDogBreeds] = useState([]);
  const [loadingBreeds, setLoadingBreeds] = useState(false);
  const [showBreedModal, setShowBreedModal] = useState(false);
  const [filteredBreeds, setFilteredBreeds] = useState([]);
  const [breedSearch, setBreedSearch] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const catBreedOptions = [
    { label: 'American Shorthair', value: 'american_shorthair' },
    { label: 'Domestic Shorthair', value: 'domestic_shorthair' },
    { label: 'Siamese', value: 'siamese' },
    { label: 'Persian', value: 'persian' },
    { label: 'Maine Coon', value: 'maine_coon' },
    { label: 'Bengal', value: 'bengal' },
    { label: 'Ragdoll', value: 'ragdoll' },
    { label: 'Sphynx', value: 'sphynx' },
    { label: 'British Shorthair', value: 'british_shorthair' },
    { label: 'Mixed Breed', value: 'mixed_breed' },
    { label: 'Other', value: 'other' },
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    fetchDogBreeds();
  }, []);

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
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) return data;
      }
    } catch (error) {
      console.error('Cache read error:', error);
    }
    return null;
  };

  const fetchDogBreeds = async () => {
    try {
      setLoadingBreeds(true);
      const cachedBreeds = await getCachedData(CACHE_KEYS.DOG_BREEDS);
      if (cachedBreeds) {
        setDogBreeds(cachedBreeds);
        setLoadingBreeds(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/dog-breeds/all`, { timeout: 10000 });
      
      if (response.data.status === 'success' && response.data.breeds) {
        const breeds = [];
        Object.keys(response.data.breeds).forEach(breedKey => {
          const subBreeds = response.data.breeds[breedKey];
          if (subBreeds.length === 0) {
            breeds.push({
              label: formatBreedName(breedKey),
              value: breedKey
            });
          } else {
            subBreeds.forEach(subBreed => {
              breeds.push({
                label: formatBreedName(breedKey, subBreed),
                value: `${breedKey}/${subBreed}`
              });
            });
          }
        });
        
        breeds.sort((a, b) => a.label.localeCompare(b.label));
        breeds.push(
          { label: 'Mixed Breed', value: 'mixed_breed' },
          { label: 'Other', value: 'other' }
        );
        
        setDogBreeds(breeds);
        await cacheData(CACHE_KEYS.DOG_BREEDS, breeds);
      }
    } catch (error) {
      console.error('Error fetching breeds:', error);
      setDogBreeds([
        { label: 'Mixed Breed', value: 'mixed_breed' },
        { label: 'Other', value: 'other' }
      ]);
    } finally {
      setLoadingBreeds(false);
    }
  };

  const formatBreedName = (breedKey, subBreed = null) => {
    let formattedName = breedKey.split(/[-_\s]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    if (subBreed) {
      const formattedSubBreed = subBreed.split(/[-_\s]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      formattedName = `${formattedSubBreed} ${formattedName}`;
    }
    return formattedName;
  };

  const getBreedOptions = () => {
    return formData.petType === 'dog' ? dogBreeds : formData.petType === 'cat' ? catBreedOptions : [];
  };

  const handleBreedSearch = (text) => {
    setBreedSearch(text);
    const options = getBreedOptions();
    const filtered = options.filter(breed => breed.label.toLowerCase().includes(text.toLowerCase()));
    setFilteredBreeds(filtered);
  };

  const openBreedModal = () => {
    if (!formData.petType) {
      Alert.alert('Select Pet Type', 'Please select whether it\'s a dog or cat first');
      return;
    }
    const options = getBreedOptions();
    setFilteredBreeds(options);
    setBreedSearch('');
    setShowBreedModal(true);
  };

  const selectBreed = (breed) => {
    setFormData(prev => ({ ...prev, breed: breed.value }));
    setShowBreedModal(false);
    setBreedSearch('');
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Pet name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.petType) newErrors.petType = 'Please select pet type';
    if (!formData.petGender) newErrors.petGender = 'Please select gender';
    if (!formData.breed) newErrors.breed = 'Please select breed';

    if (!formData.age.trim()) {
      newErrors.age = 'Age is required';
    } else if (isNaN(formData.age) || parseFloat(formData.age) < 0 || parseFloat(formData.age) > 30) {
      newErrors.age = 'Enter valid age (0-30)';
    }

    if (formData.weight.trim() && (isNaN(formData.weight) || parseFloat(formData.weight) <= 0)) {
      newErrors.weight = 'Enter valid weight';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddPet = async () => {
    if (!validate()) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting.');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User ID not available. Please login again.');
      return;
    }

    try {
      setIsSaving(true);
      
      const petData = {
        name: formData.name.trim(),
        breed: formData.breed,
        pet_age: formData.age ? parseFloat(formData.age) : null,
        pet_gender: formData.petGender,
        weight: formData.weight ? parseFloat(formData.weight) : null,
      };

      const response = await axios.post(`${API_BASE_URL}/users/${user}/pets`, petData, {
        timeout: 15000,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.data.status === 'success') {
        Alert.alert(
          'Success! 🎉',
          `${formData.name} has been added to your family!`,
          [{ text: 'Great!', onPress: () => navigation.goBack() }]
        );
      } else {
        throw new Error('Failed to add pet');
      }
    } catch (error) {
      console.error('Error adding pet:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add pet. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const renderBreedItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.breedItem, formData.breed === item.value && styles.breedItemSelected]}
      onPress={() => selectBreed(item)}
      activeOpacity={0.7}
    >
      <Text style={[styles.breedText, formData.breed === item.value && styles.breedTextSelected]}>
        {item.label}
      </Text>
      {formData.breed === item.value && (
        <Ionicons name="checkmark-circle" size={DESIGN.ICON_SIZES.sm} color={DESIGN.COLORS.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={DESIGN.GRADIENTS.primary} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={DESIGN.ICON_SIZES.md} color={DESIGN.COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New Pet</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View 
          style={[
            styles.formContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: formData.avatar }} style={styles.avatar} />
              <TouchableOpacity style={styles.cameraButton}>
                <Ionicons name="camera" size={DESIGN.ICON_SIZES.sm} color={DESIGN.COLORS.white} />
              </TouchableOpacity>
            </View>
            <Text style={styles.avatarText}>Add Photo (Optional)</Text>
          </View>

          {/* Pet Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pet Name *</Text>
            <TextInput
              style={[styles.textInput, errors.name && styles.inputError]}
              placeholder="Enter your pet's name"
              placeholderTextColor={DESIGN.COLORS.gray400}
              value={formData.name}
              onChangeText={(text) => updateField('name', text)}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Pet Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pet Type *</Text>
            <View style={styles.typeContainer}>
              {[
                { value: 'dog', label: 'Dog', icon: 'paw' },
                { value: 'cat', label: 'Cat', icon: 'paw' },
              ].map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeOption,
                    formData.petType === type.value && styles.typeOptionSelected,
                  ]}
                  onPress={() => updateField('petType', type.value)}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={type.icon} 
                    size={DESIGN.ICON_SIZES.md} 
                    color={formData.petType === type.value ? DESIGN.COLORS.white : DESIGN.COLORS.primary} 
                  />
                  <Text style={[
                    styles.typeText,
                    formData.petType === type.value && styles.typeTextSelected,
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.petType && <Text style={styles.errorText}>{errors.petType}</Text>}
          </View>

          {/* Breed */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Breed *</Text>
            <TouchableOpacity
              style={[
                styles.breedSelector,
                errors.breed && styles.inputError,
                !formData.petType && styles.selectorDisabled,
              ]}
              onPress={openBreedModal}
              disabled={!formData.petType || loadingBreeds}
              activeOpacity={0.7}
            >
              <Text style={[styles.breedSelectorText, !formData.breed && styles.placeholderText]}>
                {formData.breed
                  ? getBreedOptions().find(b => b.value === formData.breed)?.label
                  : formData.petType
                  ? loadingBreeds ? 'Loading...' : `Select ${formData.petType} breed`
                  : 'Select pet type first'}
              </Text>
              <Ionicons name="chevron-down" size={DESIGN.ICON_SIZES.sm} color={DESIGN.COLORS.gray400} />
            </TouchableOpacity>
            {errors.breed && <Text style={styles.errorText}>{errors.breed}</Text>}
          </View>

          {/* Age and Weight */}
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Age (years) *</Text>
              <TextInput
                style={[styles.textInput, errors.age && styles.inputError]}
                placeholder="0"
                placeholderTextColor={DESIGN.COLORS.gray400}
                keyboardType="numeric"
                value={formData.age}
                onChangeText={(text) => updateField('age', text)}
              />
              {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={[styles.textInput, errors.weight && styles.inputError]}
                placeholder="0.0"
                placeholderTextColor={DESIGN.COLORS.gray400}
                keyboardType="numeric"
                value={formData.weight}
                onChangeText={(text) => updateField('weight', text)}
              />
              {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
            </View>
          </View>

          {/* Gender */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender *</Text>
            <View style={styles.genderContainer}>
              {['Male', 'Female'].map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.genderOption,
                    formData.petGender === gender && styles.genderOptionSelected,
                  ]}
                  onPress={() => updateField('petGender', gender)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={gender === 'Male' ? 'male' : 'female'}
                    size={DESIGN.ICON_SIZES.sm}
                    color={formData.petGender === gender ? DESIGN.COLORS.white : DESIGN.COLORS.primary}
                  />
                  <Text style={[
                    styles.genderText,
                    formData.petGender === gender && styles.genderTextSelected,
                  ]}>
                    {gender}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.petGender && <Text style={styles.errorText}>{errors.petGender}</Text>}
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={DESIGN.ICON_SIZES.md} color={DESIGN.COLORS.info} />
            <Text style={styles.infoText}>
              All fields marked with * are required to add your pet.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[styles.submitButton, isSaving && styles.submitButtonDisabled]}
          onPress={handleAddPet}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          <LinearGradient colors={DESIGN.GRADIENTS.primary} style={styles.submitGradient}>
            {isSaving ? (
              <ActivityIndicator size="small" color={DESIGN.COLORS.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={DESIGN.ICON_SIZES.md} color={DESIGN.COLORS.white} />
                <Text style={styles.submitText}>Add Pet</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Breed Selection Modal */}
      <Modal
        visible={showBreedModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBreedModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select {formData.petType === 'dog' ? 'Dog' : 'Cat'} Breed
              </Text>
              <TouchableOpacity onPress={() => setShowBreedModal(false)}>
                <Ionicons name="close" size={DESIGN.ICON_SIZES.md} color={DESIGN.COLORS.gray700} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={DESIGN.ICON_SIZES.sm} color={DESIGN.COLORS.gray400} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search breeds..."
                value={breedSearch}
                onChangeText={handleBreedSearch}
                placeholderTextColor={DESIGN.COLORS.gray400}
              />
            </View>

            <FlatList
              data={filteredBreeds}
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
    backgroundColor: "#F0F4FF",
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
    backgroundColor: 'rgba(255,255,255,0.2)',
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
  formContainer: {
    gap: DESIGN.SPACING.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: DESIGN.SPACING.md,
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
  avatarText: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    color: DESIGN.COLORS.gray600,
    fontWeight: DESIGN.FONT_WEIGHTS.medium,
  },
  inputGroup: {
    gap: DESIGN.SPACING.xs,
  },
  label: {
    fontSize: DESIGN.TYPOGRAPHY.bodySmall,
    fontWeight: DESIGN.FONT_WEIGHTS.semibold,
    color: DESIGN.COLORS.gray700,
  },
  textInput: {
    ...DESIGN.COMMON_STYLES.input,
  },
  inputError: {
    borderColor: DESIGN.COLORS.error,
    borderWidth: 2,
  },
  errorText: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    color: DESIGN.COLORS.error,
    marginTop: DESIGN.SPACING.xxs,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: DESIGN.SPACING.sm,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DESIGN.COLORS.surface,
    padding: DESIGN.SPACING.md,
    borderRadius: DESIGN.RADIUS.lg,
    borderWidth: 2,
    borderColor: DESIGN.COLORS.gray200,
    gap: DESIGN.SPACING.xs,
    ...DESIGN.SHADOWS.sm,
  },
  typeOptionSelected: {
    borderColor: DESIGN.COLORS.primary,
    backgroundColor: DESIGN.COLORS.primary,
  },
  typeText: {
    fontSize: DESIGN.TYPOGRAPHY.body,
    fontWeight: DESIGN.FONT_WEIGHTS.semibold,
    color: DESIGN.COLORS.gray700,
  },
  typeTextSelected: {
    color: DESIGN.COLORS.white,
  },
  breedSelector: {
    ...DESIGN.COMMON_STYLES.input,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorDisabled: {
    opacity: 0.5,
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
    flexDirection: 'row',
    gap: DESIGN.SPACING.sm,
  },
  halfInput: {
    flex: 1,
    gap: DESIGN.SPACING.xs,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: DESIGN.SPACING.sm,
  },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DESIGN.COLORS.surface,
    padding: DESIGN.SPACING.md,
    borderRadius: DESIGN.RADIUS.lg,
    borderWidth: 2,
    borderColor: DESIGN.COLORS.gray200,
    gap: DESIGN.SPACING.xs,
    ...DESIGN.SHADOWS.sm,
  },
  genderOptionSelected: {
    borderColor: DESIGN.COLORS.primary,
    backgroundColor: DESIGN.COLORS.primary,
  },
  genderText: {
    fontSize: DESIGN.TYPOGRAPHY.body,
    fontWeight: DESIGN.FONT_WEIGHTS.semibold,
    color: DESIGN.COLORS.gray700,
  },
  genderTextSelected: {
    color: DESIGN.COLORS.white,
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
  submitContainer: {
    padding: DESIGN.SPACING.lg,
    paddingBottom: Platform.OS === 'ios' ? DESIGN.SPACING.xl : DESIGN.SPACING.lg,
    backgroundColor: DESIGN.COLORS.background,
    borderTopWidth: 1,
    borderTopColor: DESIGN.COLORS.gray100,
  },
  submitButton: {
    borderRadius: DESIGN.RADIUS.lg,
    overflow: 'hidden',
    ...DESIGN.SHADOWS.lg,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: DESIGN.BUTTON_HEIGHTS.lg,
    gap: DESIGN.SPACING.sm,
  },
  submitText: {
    fontSize: DESIGN.TYPOGRAPHY.button,
    fontWeight: DESIGN.FONT_WEIGHTS.bold,
    color: DESIGN.COLORS.white,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: DESIGN.COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: DESIGN.COLORS.surface,
    borderTopLeftRadius: DESIGN.RADIUS.xxl,
    borderTopRightRadius: DESIGN.RADIUS.xxl,
    height: '75%',
    ...DESIGN.SHADOWS.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: DESIGN.SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN.COLORS.gray100,
  },
  modalTitle: {
    fontSize: DESIGN.TYPOGRAPHY.h3,
    fontWeight: DESIGN.FONT_WEIGHTS.bold,
    color: DESIGN.COLORS.gray900,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: DESIGN.SPACING.md,
    paddingHorizontal: DESIGN.SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN.COLORS.gray100,
  },
  breedItemSelected: {
    backgroundColor: `${DESIGN.COLORS.primary}10`,
  },
  breedText: {
    fontSize: DESIGN.TYPOGRAPHY.body,
    color: DESIGN.COLORS.gray900,
  },
  breedTextSelected: {
    color: DESIGN.COLORS.primary,
    fontWeight: DESIGN.FONT_WEIGHTS.semibold,
  },
});

export default EditPetProfile;