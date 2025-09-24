import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  BackHandler,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  moderateScale,
  scale,
  verticalScale,
} from 'react-native-size-matters';
import { useAuth } from '../context/AuthContext';

const petTypeOptions = [
  { label: "Dog", value: "dog" },
  { label: "Cat", value: "cat" },
];

const petGenderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

const referenceVisitOptions = [
  { label: "Inhouse Visit", value: "inhouse_visit" },
  { label: "Clinic Visit", value: "clinic_visit" },
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
            <ActivityIndicator size="small" color="#1E88E5" style={styles.loadingIcon} />
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

export default function ProfileCompletionModalAuto({ onComplete }) {
  const { user, updateUser, token } = useAuth();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [dogBreeds, setDogBreeds] = useState([]);
  const [loadingBreeds, setLoadingBreeds] = useState(false);
  const [touched, setTouched] = useState({});

  // Form fields
  const [formData, setFormData] = useState({
    petName: '',
    petType: '',
    petGender: '',
    petAgeYears: '',
    petAgeMonths: '',
    petBreed: '',
    referenceVisit: '',
    petDoc1: null,
    petDoc2: null,
  });
  const [errors, setErrors] = useState({});

  const appState = useRef(AppState.currentState);

  // Helper: profile key
  const profileKey = user?.id ? `profileCompleted:${user.id}` : null;

  // Calculate decimal age for display and API
// Replace your current calculateDecimalAge with this:
const calculateDecimalAge = () => {
  const years = formData.petAgeYears || "0";
  const months = formData.petAgeMonths || "0";

  if (!years && !months) return "";

  return `${years}.${months}`; // e.g. "3.5"
};


  // Read flag and determine visibility
  const checkFlag = async () => {
    if (!user || !profileKey) {
      setVisible(false);
      setLoading(false);
      return;
    }
    try {
      const val = await AsyncStorage.getItem(profileKey);
      setVisible(val !== 'true');
    } catch (err) {
      console.error('Error reading profile completed flag:', err);
      setVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchDogBreeds = async (retryCount = 3, delay = 1000) => {
    if (!visible) return;
    console.log('🚀 Starting fetchDogBreeds...');
    try {
      setLoadingBreeds(true);
      const response = await axios.get("https://snoutiq.com/backend/api/dog-breeds/all", {
        timeout: 10000,
      });
      
      // console.log('📥 API Response:', JSON.stringify(response.data, null, 2));

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
        console.log(`🐕 Successfully loaded ${breeds.length} dog breeds`);
      } else {
        console.error('❌ Invalid API response structure:', response.data);
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
        console.log(`🔄 Retrying fetchDogBreeds (${retryCount} attempts left)...`);
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
      console.log('🏁 fetchDogBreeds completed');
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

  // Initialize and respond to user changes
  useEffect(() => {
    setLoading(true);
    // Pre-fill fields from existing user data if available
    setFormData({
      petName: user?.petName ?? '',
      petType: user?.petType ?? '',
      petGender: user?.petGender ?? '',
      petAgeYears: user?.petAge ? Math.floor(user.petAge).toString() : '',
      petAgeMonths: user?.petAge ? Math.round((user.petAge % 1) * 12).toString() : '',
      petBreed: user?.petBreed ?? '',
      referenceVisit: user?.referenceVisit ?? '',
      petDoc1: null,
      petDoc2: null,
    });
    checkFlag();
    if (visible) {
      fetchDogBreeds();
    }
  }, [user?.id, visible]);

  // AppState listener: when app returns to foreground, re-check flag
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        checkFlag();
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [user?.id]);

  // Block hardware back while modal is visible
  useEffect(() => {
    const onBack = () => {
      if (visible) return true; // consume back press
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [visible]);

  const validate = () => {
    let valid = true;
    let newErrors = {};

    if (!formData.petName.trim()) {
      newErrors.petName = "Pet name is required";
      valid = false;
    }
    if (!formData.petType) {
      newErrors.petType = "Pet type is required";
      valid = false;
    }
    if (!formData.petGender) {
      newErrors.petGender = "Pet gender is required";
      valid = false;
    }
    if (!formData.petAgeYears && !formData.petAgeMonths) {
      newErrors.petAgeYears = "Pet age is required";
      valid = false;
    }
    if (!formData.petBreed) {
      newErrors.petBreed = "Pet breed is required";
      valid = false;
    }
    if (!formData.referenceVisit) {
      newErrors.referenceVisit = "Reference visit preference is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setTouched(Object.fromEntries(Object.keys(formData).map((k) => [k, true])));
      Alert.alert("Validation Error", "Please fix the errors.");
      return;
    }

    setIsLoading(true);
    try {
      // Save flag
      if (!profileKey) throw new Error('Missing user id');
      await AsyncStorage.setItem(profileKey, 'true');

      const submitData = new FormData();
      submitData.append("user_id", user?.id);
      submitData.append("pet_type", formData.petType);
      submitData.append("pet_name", formData.petName.trim());
      submitData.append("pet_gender", formData.petGender);
      submitData.append("reference_visit", formData.referenceVisit);
      // Force send role
      submitData.append("role", "pet");

      // Send pet_age as decimal years
      const decimalAge = calculateDecimalAge();
      submitData.append("pet_age", decimalAge);

      submitData.append("breed", formData.petBreed);
      if (formData.petDoc1) submitData.append("pet_doc1", formData.petDoc1);
      if (formData.petDoc2) submitData.append("pet_doc2", formData.petDoc2);

      console.log("Submitting payload:", {
        user_id: user?.id,
        pet_type: formData.petType,
        pet_name: formData.petName.trim(),
        pet_gender: formData.petGender,
        reference_visit: formData.referenceVisit,
        role: "pet",
        pet_age: decimalAge,
        breed: formData.petBreed,
      });

      const res = await axios.post(
        "https://snoutiq.com/backend/api/auth/register",
        submitData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.message && res.data.message.includes("successfully")) {
        Alert.alert("Success", "Pet profile saved successfully!");

        if (res.data.user) {
          updateUser({ ...res.data.user, role: "pet", profileCompleted: true });
          console.log("Updated user from registration response:", res.data.user);
          setVisible(false);
          if (onComplete) onComplete();
          return;
        }

        // Fetch user if not returned directly
        try {
          const userRes = await axios.get(
            `https://snoutiq.com/backend/api/petparents/${user.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          let updatedUser = userRes.data?.user || userRes.data;
          if (updatedUser) {
            updateUser({ ...updatedUser, role: "pet", profileCompleted: true });
            Alert.alert("Success", "Pet details updated!");
            setVisible(false);
            if (onComplete) onComplete();
          }
        } catch (fetchError) {
          console.error("Error fetching updated user:", fetchError);
          Alert.alert("Error", "Registration successful, but failed to fetch updated data");
          setVisible(false);
          if (onComplete) onComplete();
        }
      } else {
        console.error("Registration failed:", res.data);
        Alert.alert("Error", res.data.message || "Failed to save pet data");
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (error.response) {
        Alert.alert("Error", `Server error: ${error.response.data?.message || 'Registration failed'}`);
      } else if (error.request) {
        Alert.alert("Error", "Network error: Please check your connection");
      } else {
        Alert.alert("Error", "Something went wrong!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPetBreedOptions = () => {
    if (formData.petType === "dog") {
      return dogBreeds;
    } else if (formData.petType === "cat") {
      return catBreedOptions;
    }
    return [];
  };

  const getBreedsPlaceholder = () => {
    if (!formData.petType) {
      return "Please select pet type first";
    } else if (formData.petType === "dog" && loadingBreeds) {
      return "Loading dog breeds...";
    } else if (formData.petType === "dog" && dogBreeds.length <= 2) {
      return "Failed to load breeds, select default";
    } else {
      return `Select ${formData.petType} breed`;
    }
  };

  // If still loading initial state, show nothing
  if (loading) return null;

  // If not visible, render nothing
  if (!visible) return null;

  // Modal UI (full-screen blocking)
  return (
    <Modal visible={visible} animationType="slide" transparent={false} hardwareAccelerated>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <Text style={styles.headerIcon}>🐾</Text>
            <Text style={styles.title}>Complete Pet Profile</Text>
            <Text style={styles.subtitle}>Help us personalize your experience</Text>
          </View>
        </View>
        
        <View style={styles.container}>
          <View style={styles.formContainer}>
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Pet Name *</Text>
                <TextInput
                  style={[styles.input, styles.textInput, errors.petName && styles.inputError]}
                  value={formData.petName}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, petName: text }));
                    if (errors.petName) setErrors(prev => ({ ...prev, petName: null }));
                    setTouched(prev => ({ ...prev, petName: true }));
                  }}
                  placeholder="Pet's name"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                />
                {errors.petName && touched.petName && <Text style={styles.errorText}>{errors.petName}</Text>}
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <CustomDropdown
                  title="Pet Type *"
                  value={formData.petType}
                  onSelect={(value) => {
                    setFormData(prev => ({ ...prev, petType: value, petBreed: '' }));
                    setErrors(prev => ({ ...prev, petType: null, petBreed: null }));
                    setTouched(prev => ({ ...prev, petType: true }));
                  }}
                  options={petTypeOptions}
                  error={errors.petType && touched.petType ? errors.petType : null}
                  placeholder="Select type"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <CustomDropdown
                  title="Gender *"
                  value={formData.petGender}
                  onSelect={(value) => {
                    setFormData(prev => ({ ...prev, petGender: value }));
                    setErrors(prev => ({ ...prev, petGender: null }));
                    setTouched(prev => ({ ...prev, petGender: true }));
                  }}
                  options={petGenderOptions}
                  error={errors.petGender && touched.petGender ? errors.petGender : null}
                  placeholder="Select gender"
                />
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Pet Age *</Text>
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, styles.textInput, styles.ageInput, errors.petAgeYears && styles.inputError]}
                    value={formData.petAgeYears}
                    onChangeText={(text) => {
                      setFormData(prev => ({ ...prev, petAgeYears: text }));
                      if (errors.petAgeYears) setErrors(prev => ({ ...prev, petAgeYears: null }));
                      setTouched(prev => ({ ...prev, petAgeYears: true }));
                    }}
                    placeholder="Years"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, styles.textInput, styles.ageInput, errors.petAgeYears && styles.inputError]}
                    value={formData.petAgeMonths}
                    onChangeText={(text) => {
                      setFormData(prev => ({ ...prev, petAgeMonths: text }));
                      if (errors.petAgeYears) setErrors(prev => ({ ...prev, petAgeYears: null }));
                      setTouched(prev => ({ ...prev, petAgeMonths: true }));
                    }}
                    placeholder="Months"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                </View>
              {(formData.petAgeYears || formData.petAgeMonths) && (
  <Text style={styles.ageDisplay}>
    Age: {calculateDecimalAge()} years
  </Text>
)}

                {errors.petAgeYears && touched.petAgeYears && <Text style={styles.errorText}>{errors.petAgeYears}</Text>}
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <CustomDropdown
                  title="Pet Breed *"
                  value={formData.petBreed}
                  onSelect={(value) => {
                    setFormData(prev => ({ ...prev, petBreed: value }));
                    setErrors(prev => ({ ...prev, petBreed: null }));
                    setTouched(prev => ({ ...prev, petBreed: true }));
                  }}
                  options={getPetBreedOptions()}
                  error={errors.petBreed && touched.petBreed ? errors.petBreed : null}
                  placeholder={getBreedsPlaceholder()}
                  loading={formData.petType === "dog" && loadingBreeds}
                />
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <CustomDropdown
                  title="Reference Visit *"
                  value={formData.referenceVisit}
                  onSelect={(value) => {
                    setFormData(prev => ({ ...prev, referenceVisit: value }));
                    setErrors(prev => ({ ...prev, referenceVisit: null }));
                    setTouched(prev => ({ ...prev, referenceVisit: true }));
                  }}
                  options={referenceVisitOptions}
                  error={errors.referenceVisit && touched.referenceVisit ? errors.referenceVisit : null}
                  placeholder="Select reference visit"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Save & Continue</Text>
                    <Text style={styles.buttonIcon}>→</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.noteContainer}>
              <Text style={styles.note}>
                Complete this form to continue. This helps us provide better pet recommendations.
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headerContainer: {
    backgroundColor: '#1E88E5',
    paddingTop: Platform.OS === 'ios' ? verticalScale(25) : verticalScale(8),
    paddingBottom: verticalScale(8),
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  headerIcon: {
    fontSize: moderateScale(24),
    marginBottom: verticalScale(4),
  },
  title: { 
    fontSize: moderateScale(20), 
    fontWeight: '700', 
    color: '#fff',
    textAlign: 'center',
    marginBottom: verticalScale(4),
  },
  subtitle: {
    fontSize: moderateScale(12),
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '400',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    margin: scale(12),
    borderRadius: moderateScale(12),
    padding: scale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  label: { 
    marginBottom: verticalScale(4), 
    fontSize: moderateScale(13), 
    color: '#2c3e50',
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: verticalScale(12),
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e1e8ed',
    borderRadius: moderateScale(8),
    fontSize: moderateScale(14),
    backgroundColor: '#fff',
    minHeight: verticalScale(36),
  },
  textInput: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
  },
  ageInput: {
    width: '48%',
    marginRight: scale(8),
  },
  ageDisplay: {
    fontSize: moderateScale(12),
    color: '#2c3e50',
    fontWeight: '500',
    marginTop: verticalScale(4),
    marginLeft: scale(2),
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
  inputError: {
    borderColor: '#E74C3C',
    backgroundColor: '#fef7f7',
  },
  dropdownText: {
    flex: 1,
    fontSize: moderateScale(14),
    color: '#2c3e50',
    fontWeight: '500',
  },
  placeholderText: {
    color: '#999',
    fontWeight: '400',
  },
  dropdownArrow: {
    fontSize: moderateScale(12),
    color: '#1E88E5',
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
    color: '#1E88E5',
    fontWeight: '600',
  },
  checkMark: {
    fontSize: moderateScale(16),
    color: '#1E88E5',
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
  button: {
    marginTop: verticalScale(20),
    marginBottom: verticalScale(12),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(8),
    backgroundColor: '#1E88E5',
    shadowColor: '#1E88E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: { 
    opacity: 0.7,
    shadowOpacity: 0.1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: '700',
    fontSize: moderateScale(14),
    marginRight: scale(6),
  },
  buttonIcon: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  noteContainer: {
    backgroundColor: '#f8f9fa',
    padding: scale(12),
    borderRadius: moderateScale(8),
    borderLeftWidth: 3,
    borderLeftColor: '#1E88E5',
  },
  note: { 
    color: '#666', 
    fontSize: moderateScale(11),
    lineHeight: moderateScale(16),
    fontWeight: '400',
    textAlign: 'center',
  },
});