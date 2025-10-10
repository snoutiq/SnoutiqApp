

import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

const petTypeOptions = [
  { label: "Dog", value: "dog" },
  { label: "Cat", value: "cat" },
];

const petGenderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

const catBreedOptions = [
  { label: "Indian Street Cat", value: "indian_street_cat" },
  { label: "Persian", value: "persian" },
];

// Custom Dropdown Component
const CustomDropdown = ({ title, value, onSelect, options, error, placeholder, loading = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const selectedOption = options.find(option => option.value === value);

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{title}</Text>
      <TouchableOpacity
        style={[
          styles.input,
          styles.dropdownContainer,
          error && styles.inputError,
        ]}
        onPress={() => setIsVisible(true)}
        disabled={loading || options.length === 0}
        activeOpacity={0.7}
      >
        <View style={styles.dropdownContent}>
          {loading && (
            <ActivityIndicator size="small" color="#7C3AED" style={styles.loadingIcon} />
          )}
          <Text style={[
            styles.dropdownText,
            !selectedOption && styles.placeholderText
          ]}>
            {loading 
              ? "Loading..." 
              : selectedOption 
                ? selectedOption.label 
                : placeholder || `Select ${title.toLowerCase()}`
            }
          </Text>
          <Text style={[styles.dropdownArrow, isVisible && styles.dropdownArrowOpen]}>▼</Text>
        </View>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <View style={styles.dropdownModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {title}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
              {options.map((item, index) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.optionItem,
                    item.value === value && styles.selectedOptionItem,
                    index === options.length - 1 && styles.lastOptionItem
                  ]}
                  onPress={() => {
                    onSelect(item.value);
                    setIsVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.optionText,
                    item.value === value && styles.selectedOptionText
                  ]}>
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <Text style={styles.checkMark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const EditPetProfile = ({ navigation, route }) => {
  const { petIndex = null, petId = null } = route.params || {};
  
  // Use AuthContext to get user ID
  const { user, token } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    petType: "",
    petGender: "",
    breed: "",
    age: "",
    weight: "",
    avatar: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop"
  });

  const [addPetFormData, setAddPetFormData] = useState({
    name: "",
    petType: "",
    petGender: "",
    breed: "",
    age: "",
    weight: "",
    avatar: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop"
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeMode, setActiveMode] = useState('edit');
  const [petsList, setPetsList] = useState([]);
  const [dogBreeds, setDogBreeds] = useState([]);
  const [loadingBreeds, setLoadingBreeds] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // API base URL
  const API_BASE_URL = 'https://snoutiq.com/backend/api';

  // Get user ID from AuthContext
  const userId = user?.id || user?.user_id;

  useEffect(() => {
    if (userId) {
      fetchDogBreeds();
      if (petId) {
        // If we have a specific pet ID, fetch that pet's data
        fetchIndividualPetData();
      } else {
        // Otherwise fetch all pets
        fetchPetsFromAPI();
      }
    }
  }, [userId, petId]);

  useEffect(() => {
    if (petIndex === -1 || petId === -1) {
      setActiveMode('add');
    } else {
      setActiveMode('edit');
    }
  }, [petIndex, petId]);

  useEffect(() => {
    setErrors({});
    setTouched({});
    if (activeMode === 'add') {
      setAddPetFormData({
        name: "",
        petType: "",
        petGender: "",
        breed: "",
        age: "",
        weight: "",
        avatar: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop"
      });
    }
  }, [activeMode]);

  // Fetch individual pet data by ID
  const fetchIndividualPetData = async () => {
    if (!petId) {
      console.warn('No pet ID provided');
      return;
    }

    try {
      setIsLoading(true);      
      const response = await axios.get(`${API_BASE_URL}/pets/${petId}`, {
        timeout: 15000,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.data.status === "success" && response.data.data) {
        const pet = response.data.data;
        
        // Determine pet type based on breed
        const petType = getPetTypeFromBreed(pet.breed);
        
        setFormData({
          name: pet.name || "",
          petType: petType,
          petGender: pet.pet_gender || "",
          breed: pet.breed || "",
          age: pet.pet_age ? String(pet.pet_age) : "",
          weight: "", // Add weight field if available in API
          avatar: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop"
        });
        
      } else {
        throw new Error('Failed to fetch individual pet data');
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load pet data from server");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch pets from API
  const fetchPetsFromAPI = async () => {
    if (!userId) {
      Alert.alert("Error", "User not authenticated. Please login again.");
      return;
    }

    try {
      setIsLoading(true);      
      const response = await axios.get(`${API_BASE_URL}/users/${userId}/pets`, {
        timeout: 15000,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.data.status === "success") {
        const pets = response.data.data || [];
        setPetsList(pets);

        // If we're editing a specific pet by index, load its data
        if (petIndex !== null && petIndex >= 0 && pets[petIndex]) {
          const selectedPet = pets[petIndex];
          const petType = getPetTypeFromBreed(selectedPet.breed);
          
          setFormData({
            name: selectedPet.name || "",
            petType: petType,
            petGender: selectedPet.pet_gender || "",
            breed: selectedPet.breed || "",
            age: selectedPet.pet_age ? String(selectedPet.pet_age) : "",
            weight: "", // Add weight field if available in API
            avatar: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop"
          });
        }
      } else {
        throw new Error('Failed to fetch pets from API');
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load pet data from server");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to determine pet type from breed
  const getPetTypeFromBreed = (breed) => {
    if (!breed) return "dog";
    
    const catBreeds = ['maine_coon', 'persian', 'siamese', 'bengal', 'ragdoll', 'sphynx', 'indian_street_cat'];
    const breedLower = breed.toLowerCase();
    
    if (catBreeds.some(catBreed => breedLower.includes(catBreed.toLowerCase()))) {
      return "cat";
    }
    
    return "dog"; // default to dog
  };

  const fetchDogBreeds = async (retryCount = 3, delay = 1000) => {
    try {
      setLoadingBreeds(true);
      const response = await axios.get("https://snoutiq.com/backend/api/dog-breeds/all", {
        timeout: 10000,
      });
      
      if (response.data.status === "success" && response.data.breeds) {
        const breeds = [];
        
        Object.keys(response.data.breeds).forEach(breedKey => {
          const subBreeds = response.data.breeds[breedKey];
          
          if (subBreeds.length === 0) {
            breeds.push({
              label: formatBreedName(breedKey),
              value: breedKey
            });
          } else {
            breeds.push({
              label: formatBreedName(breedKey),
              value: breedKey
            });
            
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
          { label: "Mixed Breed", value: "mixed_breed" },
          { label: "Other", value: "other" }
        );
        
        setDogBreeds(breeds);
      } else {
        throw new Error('Invalid API response structure');
      }
    } catch (error) {
      console.error('❌ Error fetching dog breeds:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        retryCount,
      });
      
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchDogBreeds(retryCount - 1, delay * 2);
      }
      
      setDogBreeds([
        { label: "Mixed Breed", value: "mixed_breed" },
        { label: "Other", value: "other" }
      ]);
      Alert.alert(
        "Error",
        "Could not load dog breeds. Using default options.",
        [{ text: "OK" }]
      );
    } finally {
      setLoadingBreeds(false);
    }
  };

  const formatBreedName = (breedKey, subBreed = null) => {
    let formattedName = breedKey
      .split(/[-_\s]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    if (subBreed) {
      const formattedSubBreed = subBreed
        .split(/[-_\s]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      formattedName = `${formattedSubBreed} ${formattedName}`;
    }
    
    return formattedName;
  };

  const getPetBreedOptions = (petType) => {
    if (petType === "dog") {
      return dogBreeds;
    } else if (petType === "cat") {
      return catBreedOptions;
    }
    return [];
  };

  const getBreedsPlaceholder = (petType, loadingBreeds, dogBreedsLength) => {
    if (!petType) {
      return "Please select pet type first";
    } else if (petType === "dog" && loadingBreeds) {
      return "Loading dog breeds...";
    } else if (petType === "dog" && dogBreedsLength <= 2) {
      return "Failed to load breeds, select default";
    } else {
      return `Select ${petType} breed`;
    }
  };

  const validate = (data) => {
    let valid = true;
    let newErrors = {};

    if (!data.name.trim()) {
      newErrors.name = "Pet name is required";
      valid = false;
    }
    if (!data.petType) {
      newErrors.petType = "Pet type is required";
      valid = false;
    }
    if (!data.petGender) {
      newErrors.petGender = "Pet gender is required";
      valid = false;
    }
    if (!data.breed) {
      newErrors.breed = "Breed is required";
      valid = false;
    }
    if (!data.age.trim()) {
      newErrors.age = "Age is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const updateAddPetField = (field, value) => setAddPetFormData(prev => ({ ...prev, [field]: value }));

  // Get current pet ID for editing
  const getCurrentPetId = () => {
    if (petId) {
      return petId;
    } else if (petIndex !== null && petsList[petIndex]) {
      return petsList[petIndex].id;
    }
    return null;
  };

  // Save pet to API
  const handleSave = async () => {
    if (!validate(formData)) {
      Alert.alert("Validation Error", "Please fix the errors.");
      return;
    }

    if (!userId) {
      Alert.alert("Error", "User ID not available. Please login again.");
      return;
    }

    const currentPetId = getCurrentPetId();
    if (!currentPetId) {
      Alert.alert("Error", "Pet ID not found for editing");
      return;
    }

    try {
      setIsSaving(true);
      
      // Prepare data for API
      const petData = {
        name: formData.name,
        breed: formData.breed,
        pet_age: formData.age ? parseFloat(formData.age) : null,
        pet_gender: formData.petGender,
        // Add other fields as needed by your API
      };

      const response = await axios.put(`${API_BASE_URL}/pets/${currentPetId}`, petData, {
        timeout: 15000,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.data.status === "success") {
        Alert.alert("Success", `${formData.name}'s profile has been updated!`);
        // Refresh the pets list
        await fetchPetsFromAPI();
        navigation?.goBack();
      } else {
        throw new Error('Failed to update pet');
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save pet data to server");
    } finally {
      setIsSaving(false);
    }
  };

  // Add new pet via API
  const handleAddPet = async () => {
    if (!validate(addPetFormData)) {
      Alert.alert("Validation Error", "Please fix the errors.");
      return;
    }

    if (!userId) {
      Alert.alert("Error", "User ID not available. Please login again.");
      return;
    }

    try {
      setIsSaving(true);
      
      // Prepare data for API
      const petData = {
        name: addPetFormData.name,
        breed: addPetFormData.breed,
        pet_age: addPetFormData.age ? parseFloat(addPetFormData.age) : null,
        pet_gender: addPetFormData.petGender,
        // You might need to add pet_type if your API supports it
      };

      const response = await axios.post(`${API_BASE_URL}/users/${userId}/pets`, petData, {
        timeout: 15000,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.data.status === "success") {
        Alert.alert("Success", `${addPetFormData.name} has been added!`);
        
        // Reset form and refresh pets list
        setAddPetFormData({
          name: "",
          petType: "",
          petGender: "",
          breed: "",
          age: "",
          weight: "",
          avatar: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop"
        });
        
        // Refresh the pets list
        await fetchPetsFromAPI();
      } else {
        throw new Error('Failed to add pet');
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add pet to server");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete pet via API
  const handleDeletePet = async (index) => {
    const pet = petsList[index];
    
    Alert.alert(
      "Delete Pet",
      `Are you sure you want to delete ${pet.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await axios.delete(`${API_BASE_URL}/pets/${pet.id}`, {
                timeout: 15000,
                headers: token ? { Authorization: `Bearer ${token}` } : {}
              });
              
              if (response.data.status === "success") {
                Alert.alert("Success", "Pet deleted successfully!");
                // Refresh the pets list
                await fetchPetsFromAPI();
              } else {
                throw new Error('Failed to delete pet');
              }
            } catch (error) {
              Alert.alert("Error", "Failed to delete pet from server");
            }
          }
        }
      ]
    );
  };

  const handleChangePhoto = () => {
    Alert.alert(
      "Change Pet Photo",
      "Choose an option",
      [
        { text: "Camera", onPress: () => console.log("Open Camera") },
        { text: "Gallery", onPress: () => console.log("Open Gallery") },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const renderPetsList = () => (
  <View style={styles.petsListSection}>
    <Text style={styles.sectionTitle}>Your Pets</Text>
    {petsList.length ? petsList.map((pet, i) => (
      <View key={pet.id} style={styles.petListItem}>
        <Image source={{ uri: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop" }} style={styles.petListImage} />
        <View style={styles.petListInfo}>
          <Text style={styles.petListName}>{pet.name}</Text>
          <Text style={styles.petListDetails}>{pet.breed} • {pet.pet_age} years</Text>
        </View>
        <TouchableOpacity 
          style={styles.deletePetButton} 
          onPress={() => handleDeletePet(i)}  // ← This calls the delete function
        >
          <Text style={styles.deletePetButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    )) : <Text style={styles.noPetsText}>You don't have any pets yet.</Text>}
  </View>
);

  const handleBottomSave = () => {
    if (activeMode === 'edit') handleSave();
    else if (activeMode === 'add') handleAddPet();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Loading pet data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentData = activeMode === 'edit' ? formData : addPetFormData;
  const setCurrentData = activeMode === 'edit' ? setFormData : setAddPetFormData;
  const updateCurrentField = activeMode === 'edit' ? updateField : updateAddPetField;
  const currentBreedOptions = getPetBreedOptions(currentData.petType);
  const currentBreedsPlaceholder = getBreedsPlaceholder(currentData.petType, loadingBreeds, dogBreeds.length);
  const currentLoadingBreeds = currentData.petType === "dog" && loadingBreeds;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient 
        colors={['#7C3AED', '#EC4899']} 
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {activeMode === 'edit' ? 'Edit Pet' : activeMode === 'add' ? 'Add Pet' : 'Remove Pet'}
          </Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Mode Toggle */}
          <View style={styles.modeToggleSection}>
            <View style={styles.modeToggleButtons}>
              {['edit', 'add', 'remove'].map(mode => (
                <TouchableOpacity
                  key={mode}
                  style={[styles.modeButton, activeMode === mode && styles.activeModeButton]}
                  onPress={() => setActiveMode(mode)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modeButtonText, activeMode === mode && styles.activeModeButtonText]}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Content based on mode */}
          {(activeMode === 'edit' || activeMode === 'add') && (
            <>
              <View style={styles.avatarSection}>
                <View style={styles.avatarContainer}>
                  <Image
                    source={{ uri: currentData.avatar }}
                    style={styles.avatar}
                  />
                  <TouchableOpacity style={styles.changePhotoButton} onPress={handleChangePhoto}>
                    <Text style={styles.changePhotoIcon}>📷</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.changePhotoText}>Tap to change photo</Text>
              </View>

              {/* Name */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={[styles.input, styles.textInput, (errors.name && touched.name) && styles.inputError]}
                  value={currentData.name}
                  onChangeText={(text) => {
                    setCurrentData(prev => ({ ...prev, name: text }));
                    if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                    setTouched(prev => ({ ...prev, name: true }));
                  }}
                  placeholder="Pet's name"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                  autoCorrect={false}
                />
                {errors.name && touched.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              {/* Row for Pet Type and Gender */}
              <View style={styles.row}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <CustomDropdown
                    title="Pet Type *"
                    value={currentData.petType}
                    onSelect={(value) => {
                      setCurrentData(prev => ({ ...prev, petType: value, breed: '' }));
                      setErrors(prev => ({ ...prev, petType: null, breed: null }));
                      setTouched(prev => ({ ...prev, petType: true }));
                    }}
                    options={petTypeOptions}
                    error={errors.petType && touched.petType ? errors.petType : null}
                    placeholder="Select type"
                  />
                </View>

                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <CustomDropdown
                    title="Gender *"
                    value={currentData.petGender}
                    onSelect={(value) => {
                      setCurrentData(prev => ({ ...prev, petGender: value }));
                      setErrors(prev => ({ ...prev, petGender: null }));
                      setTouched(prev => ({ ...prev, petGender: true }));
                    }}
                    options={petGenderOptions}
                    error={errors.petGender && touched.petGender ? errors.petGender : null}
                    placeholder="Select gender"
                  />
                </View>
              </View>

              {/* Row for Breed and Age */}
              <View style={styles.row}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <CustomDropdown
                    title="Breed *"
                    value={currentData.breed}
                    onSelect={(value) => {
                      setCurrentData(prev => ({ ...prev, breed: value }));
                      setErrors(prev => ({ ...prev, breed: null }));
                      setTouched(prev => ({ ...prev, breed: true }));
                    }}
                    options={currentBreedOptions}
                    error={errors.breed && touched.breed ? errors.breed : null}
                    placeholder={currentBreedsPlaceholder}
                    loading={currentLoadingBreeds}
                  />
                </View>

                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.label}>Age (years) *</Text>
                  <TextInput
                    style={[styles.input, styles.textInput, (errors.age && touched.age) && styles.inputError]}
                    value={currentData.age}
                    onChangeText={(text) => {
                      setCurrentData(prev => ({ ...prev, age: text }));
                      if (errors.age) setErrors(prev => ({ ...prev, age: null }));
                      setTouched(prev => ({ ...prev, age: true }));
                    }}
                    placeholder="Age"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                  />
                  {errors.age && touched.age && <Text style={styles.errorText}>{errors.age}</Text>}
                </View>
              </View>

              {/* Weight */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Weight (kg)</Text>
                <TextInput
                  style={[styles.input, styles.textInput]}
                  value={currentData.weight}
                  onChangeText={(text) => {
                    setCurrentData(prev => ({ ...prev, weight: text }));
                    if (errors.weight) setErrors(prev => ({ ...prev, weight: null }));
                    setTouched(prev => ({ ...prev, weight: true }));
                  }}
                  placeholder="Weight"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                />
                {errors.weight && touched.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
              </View>
            </>
          )}
          {activeMode === 'remove' && renderPetsList()}
        </ScrollView>

        {(activeMode === 'edit' || activeMode === 'add') && (
          <TouchableOpacity
            onPress={handleBottomSave}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#7C3AED', '#EC4899']}
              style={styles.bottomSaveButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.bottomSaveButtonText}>{isSaving ? 'Saving...' : 'Save'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ... styles remain exactly the same ...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  flex: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: moderateScale(16), color: '#6B7280', marginTop: verticalScale(10) },
  header: { 
    paddingHorizontal: scale(20), 
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(15),
    borderBottomLeftRadius: moderateScale(20),
    borderBottomRightRadius: moderateScale(20),
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, 
  backButton: { fontSize: moderateScale(28), color: '#FFFFFF', fontWeight: '300' },
  headerTitle: { fontSize: moderateScale(18), fontWeight: '600', color: '#FFFFFF' },
  placeholder: { width: scale(28) },
  content: { flex: 1, paddingHorizontal: scale(20) },
  modeToggleSection: { marginVertical: verticalScale(20), alignItems: 'center' },
  modeToggleButtons: { 
    flexDirection: 'row', 
    backgroundColor: '#FFFFFF', 
    borderRadius: moderateScale(12), 
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  }, 
  modeButton: { flex: 1, paddingVertical: verticalScale(12), alignItems: 'center', paddingHorizontal: scale(20) }, 
  activeModeButton: { backgroundColor: '#7C3AED' },
  modeButtonText: { fontSize: moderateScale(14), color: '#6B7280', fontWeight: '600' }, 
  activeModeButtonText: { color: '#FFFFFF' },
  avatarSection: { alignItems: 'center', paddingVertical: verticalScale(10) },
  avatarContainer: { position: 'relative' },
  avatar: { width: scale(100), height: scale(100), borderRadius: scale(50), borderWidth: scale(4), borderColor: '#FFFFFF' },
  changePhotoButton: { 
    position: 'absolute', 
    bottom: scale(4), 
    right: scale(4), 
    backgroundColor: '#7C3AED', 
    borderRadius: scale(18), 
    width: scale(36), 
    height: scale(36), 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  changePhotoIcon: { fontSize: moderateScale(15) },
  changePhotoText: { fontSize: moderateScale(14), color: '#6b7280' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  inputContainer: {
    marginBottom: verticalScale(12),
  },
  label: { 
    fontSize: moderateScale(14), 
    fontWeight: '500', 
    color: '#374151', 
    marginBottom: verticalScale(8) 
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: moderateScale(8),
    backgroundColor: '#f9fafb',
    minHeight: verticalScale(36),
  },
  textInput: {
    fontSize: moderateScale(16), 
    color: '#1f2937', 
    paddingVertical: verticalScale(8), 
    paddingHorizontal: scale(12) 
  },
  inputError: {
    borderColor: '#E74C3C',
    backgroundColor: '#fef7f7',
  },
  dropdownContainer: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    minHeight: verticalScale(36),
  },
  dropdownText: {
    flex: 1,
    fontSize: moderateScale(16),
    color: '#1f2937',
    fontWeight: '500',
  },
  placeholderText: {
    color: '#999',
    fontWeight: '400',
  },
  dropdownArrow: {
    fontSize: moderateScale(12),
    color: '#2563EB',
    marginLeft: scale(8),
    transform: [{ rotate: '0deg' }],
  },
  dropdownArrowOpen: {
    transform: [{ rotate: '180deg' }],
  },
  loadingIcon: {
    marginRight: scale(8),
  },
  errorText: {
    color: '#E74C3C',
    fontSize: moderateScale(10),
    marginTop: verticalScale(2),
    fontWeight: '500',
    marginLeft: scale(2),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModalContent: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(12),
    width: '90%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#2c3e50',
  },
  optionsList: {
    maxHeight: verticalScale(300),
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  lastOptionItem: {
    borderBottomWidth: 0,
  },
  selectedOptionItem: {
    backgroundColor: '#f0f7ff',
  },
  optionText: {
    fontSize: moderateScale(14),
    color: '#2c3e50',
    flex: 1,
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#2563EB',
    fontWeight: '600',
  },
  checkMark: {
    fontSize: moderateScale(16),
    color: '#2563EB',
    fontWeight: 'bold',
    marginLeft: scale(8),
  },
  closeButton: {
    padding: scale(6),
    borderRadius: moderateScale(16),
    backgroundColor: '#f8f9fa',
  },
  closeButtonText: {
    fontSize: moderateScale(14),
    color: '#666',
    fontWeight: '600',
  },
  bottomSaveButton: { width: "70%", alignSelf: "center", backgroundColor: '#2563EB', borderRadius: scale(12), paddingVertical: verticalScale(15), alignItems: 'center' },
  bottomSaveButtonText: { color: '#fff', fontSize: moderateScale(16), fontWeight: '600' },
  petsListSection: { marginVertical: verticalScale(16) },
  petListItem: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(12), backgroundColor: '#fff', padding: scale(12), borderRadius: scale(12), shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  petListImage: { width: scale(60), height: scale(60), borderRadius: scale(30) },
  petListInfo: { flex: 1, marginLeft: scale(12) },
  petListName: { fontSize: moderateScale(16), fontWeight: '600', color: '#111827' },
  petListDetails: { fontSize: moderateScale(12), color: '#6b7280' },
  deletePetButton: { padding: scale(8) },
  deletePetButtonText: { fontSize: moderateScale(16), color: '#dc2626' },
  noPetsText: { textAlign: 'center', color: '#6b7280', fontSize: moderateScale(14), marginTop: verticalScale(20) },
  sectionTitle: { fontSize: moderateScale(16), fontWeight: '600', color: '#374151', marginBottom: verticalScale(12) },
});

export default EditPetProfile;
