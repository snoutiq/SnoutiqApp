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
import { LinearGradient } from 'expo-linear-gradient'; // For gradient button

const petTypeOptions = [
  { label: 'Dog', value: 'dog' },
  { label: 'Cat', value: 'cat' },
];

const petGenderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
];

const referenceVisitOptions = [
  { label: 'Inhouse Visit', value: 'inhouse_visit' },
  { label: 'Clinic Visit', value: 'clinic_visit' },
];

const catBreedOptions = [
  { label: 'Indian Street Cat', value: 'indian_street_cat' },
  { label: 'Persian', value: 'persian' },
];

// Custom Dropdown Component
const CustomDropdown = ({ title, value, onSelect, options, error, placeholder, loading = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{title}</Text>
      <TouchableOpacity
        style={[styles.input, styles.dropdownContainer, error && styles.inputError]}
        onPress={() => setIsVisible(true)}
        disabled={loading || options.length === 0}
        activeOpacity={0.7}
      >
        <View style={styles.dropdownContent}>
          {loading && <ActivityIndicator size="small" color="#007AFF" style={styles.loadingIcon} />}
          <Text
            style={[styles.dropdownText, !selectedOption && styles.placeholderText]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {loading ? 'Loading...' : selectedOption ? selectedOption.label : placeholder || `Select ${title.toLowerCase()}`}
          </Text>
          <Text style={[styles.dropdownArrow, isVisible && styles.dropdownArrowOpen]}>▼</Text>
        </View>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={isVisible}
        animationType="fade"
        transparent={true}
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
                    index === options.length - 1 && styles.lastOptionItem,
                  ]}
                  onPress={() => {
                    onSelect(item.value);
                    setIsVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.optionText, item.value === value && styles.selectedOptionText]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.label}
                  </Text>
                  {item.value === value && <Text style={styles.checkMark}>✓</Text>}
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
  console.log(updateUser,'sdfd');
  

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

  // Calculate form completion percentage
  const calculateCompletion = () => {
    const fields = ['petName', 'petType', 'petGender', 'petAgeYears', 'petAgeMonths', 'petBreed', 'referenceVisit'];
    const filledFields = fields.filter((key) => formData[key] && formData[key].toString().trim() !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  };

  // Helper: profile key
  const profileKey = user?.id ? `profileCompleted:${user.id}` : null;
  

  // Calculate decimal age
  const calculateDecimalAge = () => {
    const years = formData.petAgeYears || '0';
    const months = formData.petAgeMonths || '0';
    if (!years && !months) return '';
    return `${years}.${months}`;
  };

  // Check profile completion flag
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
    try {
      setLoadingBreeds(true);
      const response = await axios.get('https://snoutiq.com/backend/api/dog-breeds/all', {
        timeout: 10000,
      });
      if (response.data.status === 'success' && response.data.breeds) {
        const breeds = [];
        Object.keys(response.data.breeds).forEach((breedKey) => {
          const subBreeds = response.data.breeds[breedKey];
          if (subBreeds.length === 0) {
            breeds.push({
              label: formatBreedName(breedKey),
              value: breedKey,
            });
          } else {
            breeds.push({
              label: formatBreedName(breedKey),
              value: breedKey,
            });
            subBreeds.forEach((subBreed) => {
              breeds.push({
                label: formatBreedName(breedKey, subBreed),
                value: `${breedKey}/${subBreed}`,
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
      } else {
        throw new Error('Invalid API response structure');
      }
    } catch (error) {
      console.error('Error fetching dog breeds:', error);
      if (retryCount > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchDogBreeds(retryCount - 1, delay * 2);
      }
      setDogBreeds([
        { label: 'Mixed Breed', value: 'mixed_breed' },
        { label: 'Other', value: 'other' },
      ]);
      Alert.alert('Error', 'Could not load dog breeds. Using default options.', [{ text: 'OK' }]);
    } finally {
      setLoadingBreeds(false);
    }
  };

  const formatBreedName = (breedKey, subBreed = null) => {
    let formattedName = breedKey
      .split(/[-_\s]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    if (subBreed) {
      const formattedSubBreed = subBreed
        .split(/[-_\s]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      formattedName = `${formattedSubBreed} ${formattedName}`;
    }
    return formattedName;
  };

  useEffect(() => {
    setLoading(true);
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

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        checkFlag();
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [user?.id]);

  useEffect(() => {
    const onBack = () => {
      if (visible) return true;
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [visible]);

  const validate = () => {
    let valid = true;
    let newErrors = {};

    if (!formData.petName.trim()) {
      newErrors.petName = 'Pet name is required';
      valid = false;
    }
    if (!formData.petType) {
      newErrors.petType = 'Pet type is required';
      valid = false;
    }
    if (!formData.petGender) {
      newErrors.petGender = 'Pet gender is required';
      valid = false;
    }
    if (!formData.petAgeYears && !formData.petAgeMonths) {
      newErrors.petAgeYears = 'Pet age is required';
      valid = false;
    }
    if (!formData.petBreed) {
      newErrors.petBreed = 'Pet breed is required';
      valid = false;
    }
    if (!formData.referenceVisit) {
      newErrors.referenceVisit = 'Reference visit preference is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // const handleSubmit = async () => {
  //   if (!validate()) {
  //     setTouched(Object.fromEntries(Object.keys(formData).map((k) => [k, true])));
  //     Alert.alert('Validation Error', 'Please fill all required fields.');
  //     return;
  //   }

  //   setIsLoading(true);
  //   try {
  //     if (!profileKey) throw new Error('Missing user id');
  //     await AsyncStorage.setItem(profileKey, 'true');

  //     const submitData = new FormData();
  //     submitData.append('user_id', user?.id);
  //     submitData.append('pet_type', formData.petType);
  //     submitData.append('pet_name', formData.petName.trim());
  //     submitData.append('pet_gender', formData.petGender);
  //     submitData.append('reference_visit', formData.referenceVisit);
  //     submitData.append('role', 'pet');
  //     submitData.append('pet_age', calculateDecimalAge());
  //     submitData.append('breed', formData.petBreed);
  //     if (formData.petDoc1) submitData.append('pet_doc1', formData.petDoc1);
  //     if (formData.petDoc2) submitData.append('pet_doc2', formData.petDoc2);

  //     const res = await axios.post(
  //       'https://snoutiq.com/backend/api/auth/register',
  //       submitData,
  //       { headers: { 'Content-Type': 'multipart/form-data' } }
  //     );

  //     if (res.data.message && res.data.message.includes('successfully')) {
  //       if (res.data.user) {
  //         updateUser({ ...res.data.user, role: 'pet', profileCompleted: true });
  //         setVisible(false);
  //         if (onComplete) onComplete();
  //         Alert.alert('Success', 'Pet profile saved successfully!');
  //         return;
  //       }

  //       try {
  //         const userRes = await axios.get(
  //           `https://snoutiq.com/backend/api/petparents/${user.id}`,
  //           { headers: { Authorization: `Bearer ${token}` } }
  //         );
  //         let updatedUser = userRes.data?.user || userRes.data;
  //         if (updatedUser) {
  //           updateUser({ ...updatedUser, role: 'pet', profileCompleted: true });
  //           setVisible(false);
  //           if (onComplete) onComplete();
  //           Alert.alert('Success', 'Pet details updated!');
  //         }
  //       } catch (fetchError) {
  //         console.error('Error fetching updated user:', fetchError);
  //         Alert.alert('Error', 'Registration successful, but failed to fetch updated data');
  //         setVisible(false);
  //         if (onComplete) onComplete();
  //       }
  //     } else {
  //       Alert.alert('Error', res.data.message || 'Failed to save pet data');
  //     }
  //   } catch (error) {
  //     console.error('Registration error:', error);
  //     Alert.alert(
  //       'Error',
  //       error.response
  //         ? `Server error: ${error.response.data?.message || 'Registration failed'}`
  //         : error.request
  //         ? 'Network error: Please check your connection'
  //         : 'Something went wrong!'
  //     );
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSubmit = async () => {
  if (!validate()) {
    setTouched(Object.fromEntries(Object.keys(formData).map((k) => [k, true])));
  Alert.alert("Validation Error", "Please fix the errors");

    return;
  }

  setIsLoading(true);
  try {
    const submitData = new FormData();
    submitData.append("user_id", user?.id);
    submitData.append("pet_type", formData.petType);
    submitData.append("pet_name", formData.petName.trim());
    submitData.append("pet_gender", formData.petGender);
    submitData.append("home_visit", formData.homeVisit);

    // ✅ Role ko force send karo
    submitData.append("role", "pet");

    // Convert years+months → total months
    const years = parseInt(formData.petAgeYears || 0, 10);
    const months = parseInt(formData.petAgeMonths || 0, 10);
    const totalMonths = years * 12 + months;
    submitData.append("pet_age", totalMonths);

    submitData.append("breed", formData.petBreed);
    if (formData.petDoc1) submitData.append("pet_doc1", formData.petDoc1);
    if (formData.petDoc2) submitData.append("pet_doc2", formData.petDoc2);

    const res = await axios.post(
      "https://snoutiq.com/backend/api/auth/register",
      submitData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    if (res.data.message && res.data.message.includes("successfully")) {
      Alert.alert("Pet profile saved successfully!");

      if (res.data.user) {
        // ✅ role ko force set karna for safety
        // updateUser({ ...res.data.user, role: "pet" });
        updateUser({ ...res.data.user, role: "pet", profileCompleted: true });


        console.log("Updated user from registration response:", res.data.user);
        if (onComplete) onComplete();
        return;
      }

      // agar direct user return nahi hua toh fetch karo
      try {
        const userRes = await axios.get(
          `https://snoutiq.com/backend/api/petparents/${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        let updatedUser = userRes.data?.user || userRes.data;
        if (updatedUser) {
    updateUser({ ...res.data.user, role: "pet", profileCompleted: true });
          Alert.alert("Pet details updated!");
          if (onComplete) onComplete();
        }
      } catch (fetchError) {
        console.error("Error fetching updated user:", fetchError);
        Alert.alert.error("Registration successful, but failed to fetch updated data");
        if (onComplete) onComplete();
      }
    } else {
      console.error("Registration failed:", res.data);
      Alert.alert(res.data.message || "Failed to save pet data");
    }
  } catch (error) {
    console.error("Registration error:", error);
    if (error.response) {
      Alert.alert(`Server error: ${error.response.data?.message || 'Registration failed'}`);
    } else if (error.request) {
      Alert.alert("Network error: Please check your connection");
    } else {
      Alert.alert("Something went wrong!");
    }
  } finally {
    setIsLoading(false);
  }
};

  const getPetBreedOptions = () => {
    if (formData.petType === 'dog') {
      return dogBreeds;
    } else if (formData.petType === 'cat') {
      return catBreedOptions;
    }
    return [];
  };

  const getBreedsPlaceholder = () => {
    if (!formData.petType) {
      return 'Please select pet type first';
    } else if (formData.petType === 'dog' && loadingBreeds) {
      return 'Loading dog breeds...';
    } else if (formData.petType === 'dog' && dogBreeds.length <= 2) {
      return 'Failed to load breeds, select default';
    } else {
      return `Select ${formData.petType} breed`;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={() => {}}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <LinearGradient
          colors={['#007AFF', '#005BB5']}
          style={styles.headerContainer}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerIcon}>🐾</Text>
            <Text style={styles.title}>Create Your Pet’s Profile</Text>
            <Text style={styles.subtitle}>Let’s personalize your pet’s experience</Text>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${calculateCompletion()}%` }]} />
            </View>
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.formContainer}>
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Pet Name *</Text>
                <TextInput
                  style={[styles.input, styles.textInput, errors.petName && styles.inputError]}
                  value={formData.petName}
                  onChangeText={(text) => {
                    setFormData((prev) => ({ ...prev, petName: text }));
                    if (errors.petName) setErrors((prev) => ({ ...prev, petName: null }));
                    setTouched((prev) => ({ ...prev, petName: true }));
                  }}
                  placeholder="Enter pet's name"
                  placeholderTextColor="#8E8E93"
                  autoCapitalize="words"
                />
                {errors.petName && touched.petName && (
                  <Text style={styles.errorText}>{errors.petName}</Text>
                )}
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <CustomDropdown
                  title="Pet Type *"
                  value={formData.petType}
                  onSelect={(value) => {
                    setFormData((prev) => ({ ...prev, petType: value, petBreed: '' }));
                    setErrors((prev) => ({ ...prev, petType: null, petBreed: null }));
                    setTouched((prev) => ({ ...prev, petType: true }));
                  }}
                  options={petTypeOptions}
                  error={errors.petType && touched.petType ? errors.petType : null}
                  placeholder="Select pet type"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <CustomDropdown
                  title="Gender *"
                  value={formData.petGender}
                  onSelect={(value) => {
                    setFormData((prev) => ({ ...prev, petGender: value }));
                    setErrors((prev) => ({ ...prev, petGender: null }));
                    setTouched((prev) => ({ ...prev, petGender: true }));
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
                      setFormData((prev) => ({ ...prev, petAgeYears: text }));
                      if (errors.petAgeYears) setErrors((prev) => ({ ...prev, petAgeYears: null }));
                      setTouched((prev) => ({ ...prev, petAgeYears: true }));
                    }}
                    placeholder="Years"
                    placeholderTextColor="#8E8E93"
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, styles.textInput, styles.ageInput, errors.petAgeYears && styles.inputError]}
                    value={formData.petAgeMonths}
                    onChangeText={(text) => {
                      setFormData((prev) => ({ ...prev, petAgeMonths: text }));
                      if (errors.petAgeYears) setErrors((prev) => ({ ...prev, petAgeYears: null }));
                      setTouched((prev) => ({ ...prev, petAgeMonths: true }));
                    }}
                    placeholder="Months"
                    placeholderTextColor="#8E8E93"
                    keyboardType="numeric"
                  />
                </View>
                {(formData.petAgeYears || formData.petAgeMonths) && (
                  <Text style={styles.ageDisplay}>Age: {calculateDecimalAge()} years</Text>
                )}
                {errors.petAgeYears && touched.petAgeYears && (
                  <Text style={styles.errorText}>{errors.petAgeYears}</Text>
                )}
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <CustomDropdown
                  title="Pet Breed *"
                  value={formData.petBreed}
                  onSelect={(value) => {
                    setFormData((prev) => ({ ...prev, petBreed: value }));
                    setErrors((prev) => ({ ...prev, petBreed: null }));
                    setTouched((prev) => ({ ...prev, petBreed: true }));
                  }}
                  options={getPetBreedOptions()}
                  error={errors.petBreed && touched.petBreed ? errors.petBreed : null}
                  placeholder={getBreedsPlaceholder()}
                  loading={formData.petType === 'dog' && loadingBreeds}
                />
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <CustomDropdown
                  title="Reference Visit *"
                  value={formData.referenceVisit}
                  onSelect={(value) => {
                    setFormData((prev) => ({ ...prev, referenceVisit: value }));
                    setErrors((prev) => ({ ...prev, referenceVisit: null }));
                    setTouched((prev) => ({ ...prev, referenceVisit: true }));
                  }}
                  options={referenceVisitOptions}
                  error={errors.referenceVisit && touched.referenceVisit ? errors.referenceVisit : null}
                  placeholder="Select visit type"
                />
              </View>
            </View>

            <LinearGradient
              colors={isLoading ? ['#A0A0A0', '#8E8E8E'] : ['#007AFF', '#005BB5']}
              style={[styles.button, isLoading && styles.buttonDisabled]}
            >
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading}
                activeOpacity={0.8}
                style={styles.buttonTouchable}
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
            </LinearGradient>

            <View style={styles.noteContainer}>
              <Text style={styles.note}>
                Complete all required fields to personalize your pet’s experience and unlock all features.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? verticalScale(40) : verticalScale(20),
    paddingBottom: verticalScale(16),
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  headerIcon: {
    fontSize: moderateScale(32),
    marginBottom: verticalScale(8),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: moderateScale(14),
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '400',
    marginTop: verticalScale(4),
  },
  progressContainer: {
    width: '80%',
    height: verticalScale(4),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: moderateScale(2),
    marginTop: verticalScale(12),
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: moderateScale(2),
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#F7F7FC',
    paddingBottom: verticalScale(20),
  },
  formContainer: {
    backgroundColor: '#fff',
    margin: scale(16),
    borderRadius: moderateScale(16),
    padding: scale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(8),
  },
  halfWidth: {
    width: '48%',
  },
  inputContainer: {
    marginBottom: verticalScale(16),
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#1C2526',
    marginBottom: verticalScale(6),
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: moderateScale(12),
    fontSize: moderateScale(16),
    backgroundColor: '#fff',
    minHeight: verticalScale(48),
  },
  textInput: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(12),
    color: '#1C2526',
  },
  ageInput: {
    width: '48%',
    marginRight: scale(8),
  },
  ageDisplay: {
    fontSize: moderateScale(12),
    color: '#1C2526',
    fontWeight: '500',
    marginTop: verticalScale(6),
    marginLeft: scale(4),
  },
  dropdownContainer: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    minHeight: verticalScale(48),
  },
  inputError: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFF1F0',
  },
  dropdownText: {
    flex: 1,
    fontSize: moderateScale(16),
    color: '#1C2526',
    fontWeight: '500',
  },
  placeholderText: {
    color: '#8E8E93',
    fontWeight: '400',
  },
  dropdownArrow: {
    fontSize: moderateScale(14),
    color: '#007AFF',
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
    color: '#FF3B30',
    fontSize: moderateScale(12),
    marginTop: verticalScale(4),
    fontWeight: '500',
    marginLeft: scale(4),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModalContent: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(16),
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
    borderBottomColor: '#F2F2F7',
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#1C2526',
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
    borderBottomColor: '#F2F2F7',
  },
  lastOptionItem: {
    borderBottomWidth: 0,
  },
  selectedOptionItem: {
    backgroundColor: '#F0F7FF',
  },
  optionText: {
    fontSize: moderateScale(16),
    color: '#1C2526',
    flex: 1,
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  checkMark: {
    fontSize: moderateScale(16),
    color: '#007AFF',
    fontWeight: 'bold',
    marginLeft: scale(8),
  },
  closeButton: {
    padding: scale(8),
    borderRadius: moderateScale(16),
    backgroundColor: '#F2F2F7',
  },
  closeButtonText: {
    fontSize: moderateScale(14),
    color: '#1C2526',
    fontWeight: '600',
  },
  button: {
    marginTop: verticalScale(24),
    marginBottom: verticalScale(16),
    borderRadius: moderateScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
    shadowOpacity: 0.1,
  },
  buttonTouchable: {
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: moderateScale(16),
    marginRight: scale(8),
  },
  buttonIcon: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  noteContainer: {
    backgroundColor: '#F0F7FF',
    padding: scale(12),
    borderRadius: moderateScale(8),
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  note: {
    color: '#1C2526',
    fontSize: moderateScale(12),
    lineHeight: moderateScale(18),
    fontWeight: '400',
    textAlign: 'center',
  },
});