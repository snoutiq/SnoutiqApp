import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
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
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useAuth } from "../context/AuthContext";

// Responsive constants
const FONT_SIZES = {
  tiny: moderateScale(10),
  small: moderateScale(12),
  medium: moderateScale(14),
  large: moderateScale(16),
  xlarge: moderateScale(18),
  xxlarge: moderateScale(20),
  xxxlarge: moderateScale(24),
};

const SPACING = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(12),
  lg: moderateScale(16),
  xl: moderateScale(20),
  xxl: moderateScale(24),
};

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
  { label: "Siamese", value: "siamese" },
  { label: "Maine Coon", value: "maine_coon" },
  { label: "Bengal", value: "bengal" },
  { label: "Ragdoll", value: "ragdoll" },
  { label: "British Shorthair", value: "british_shorthair" },
  { label: "Sphynx", value: "sphynx" },
];

// Custom Dropdown Component with Search
const CustomDropdown = ({
  title,
  value,
  onSelect,
  options,
  error,
  placeholder,
  loading = false,
  showSearch = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const selectedOption = options.find((option) => option.value === value);

  const filteredOptions = showSearch
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const handleSelect = (value) => {
    onSelect(value);
    setIsVisible(false);
    setSearchQuery("");
  };

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
            <ActivityIndicator
              size="small"
              color="#7C3AED"
              style={styles.loadingIcon}
            />
          )}
          <Text
            style={[
              styles.dropdownText,
              !selectedOption && styles.placeholderText,
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {loading
              ? "Loading..."
              : selectedOption
              ? selectedOption.label
              : placeholder || `Select ${title.toLowerCase()}`}
          </Text>
          <Ionicons
            name={isVisible ? "chevron-up" : "chevron-down"}
            size={scale(16)}
            color="#7C3AED"
          />
        </View>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setIsVisible(false);
          setSearchQuery("");
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dropdownModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {title}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setIsVisible(false);
                  setSearchQuery("");
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={scale(20)} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {showSearch && (
              <View style={styles.searchContainer}>
                <Ionicons
                  name="search"
                  size={scale(16)}
                  color="#9CA3AF"
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder={`Search ${title.toLowerCase()}...`}
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery("")}
                    style={styles.clearSearch}
                  >
                    <Ionicons
                      name="close-circle"
                      size={scale(16)}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}

            <ScrollView
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {filteredOptions.length === 0 ? (
                <View style={styles.noResults}>
                  <Ionicons
                    name="search-outline"
                    size={scale(40)}
                    color="#D1D5DB"
                  />
                  <Text style={styles.noResultsText}>No results found</Text>
                  <Text style={styles.noResultsSubtext}>
                    Try different search terms
                  </Text>
                </View>
              ) : (
                filteredOptions.map((item, index) => (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.optionItem,
                      item.value === value && styles.selectedOptionItem,
                      index === filteredOptions.length - 1 &&
                        styles.lastOptionItem,
                    ]}
                    onPress={() => handleSelect(item.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        item.value === value && styles.selectedOptionText,
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.label}
                    </Text>
                    {item.value === value && (
                      <Ionicons
                        name="checkmark"
                        size={scale(16)}
                        color="#7C3AED"
                      />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default function ProfileCompletionModalAuto({
  visible,
  onComplete,
  updateUser,
  token,
  user,
}) {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [dogBreeds, setDogBreeds] = useState([]);
  const [loadingBreeds, setLoadingBreeds] = useState(false);
  const [touched, setTouched] = useState({});
  const [modalVisible, setModalVisible] = useState(visible);

  // Form fields
  const [formData, setFormData] = useState({
    petName: "",
    petType: "",
    petGender: "",
    petAgeYears: "",
    petAgeMonths: "",
    petBreed: "",
    referenceVisit: "",
    petDoc1: null,
    petDoc2: null,
  });
  const [errors, setErrors] = useState({});

  const appState = useRef(AppState.currentState);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          // Note: navigation is not defined in this component, so ensure it's passed as a prop or handled in the parent
        },
      },
    ]);
  };

  // Calculate form completion percentage
  const calculateCompletion = () => {
    const fields = [
      "petName",
      "petType",
      "petGender",
      "petAgeYears",
      "petAgeMonths",
      "petBreed",
      "referenceVisit",
    ];
    const filledFields = fields.filter(
      (key) => formData[key] && formData[key].toString().trim() !== ""
    ).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  // Helper: profile key
  const profileKey = user?.id ? `profileCompleted:${user.id}` : null;

  // Check profile completion flag and validate against user data
  const checkFlag = async () => {
    if (!user || !profileKey) {
      setModalVisible(false);
      setLoading(false);
      return;
    }
    try {
      const val = await AsyncStorage.getItem(profileKey);
      const hasPetData = !!(
        user.pet_name?.trim() &&
        user.pet_gender?.trim() &&
        user.breed?.trim() &&
        user.pet_age
      );

      if (!hasPetData && val === "true") {
        await AsyncStorage.setItem(profileKey, "false");
        setModalVisible(true);
      } else {
        setModalVisible(!hasPetData);
      }
    } catch (err) {
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchDogBreeds = async (retryCount = 3, delay = 1000) => {
    if (!modalVisible) return;
    try {
      setLoadingBreeds(true);
      const response = await axios.get(
        "https://snoutiq.com/backend/api/dog-breeds/all",
        {
          timeout: 10000,
        }
      );
      if (response.data.status === "success" && response.data.breeds) {
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
          { label: "Mixed Breed", value: "mixed_breed" },
          { label: "Other", value: "other" }
        );
        setDogBreeds(breeds);
      } else {
        throw new Error("Invalid API response structure");
      }
    } catch (error) {
      if (retryCount > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchDogBreeds(retryCount - 1, delay * 2);
      }
      setDogBreeds([
        { label: "Mixed Breed", value: "mixed_breed" },
        { label: "Other", value: "other" },
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
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    if (subBreed) {
      const formattedSubBreed = subBreed
        .split(/[-_\s]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      formattedName = `${formattedSubBreed} ${formattedName}`;
    }
    return formattedName;
  };

  useEffect(() => {
    setLoading(true);
    setFormData({
      petName: user?.pet_name ?? "",
      petType: user?.pet_type ?? "",
      petGender: user?.pet_gender ?? "",
      petAgeYears: user?.pet_age ? Math.floor(user.pet_age / 12).toString() : "",
      petAgeMonths: user?.pet_age
        ? (user.pet_age % 12).toString()
        : "",
      petBreed: user?.breed ?? "",
      referenceVisit: user?.reference_visit ?? "",
      petDoc1: null,
      petDoc2: null,
    });
    checkFlag();
    if (modalVisible) {
      fetchDogBreeds();
    }
  }, [user?.id, modalVisible]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        checkFlag();
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [user?.id]);

  useEffect(() => {
    const onBack = () => {
      if (modalVisible) return true;
      return false;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", onBack);
    return () => sub.remove();
  }, [modalVisible]);

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
      setTouched(
        Object.fromEntries(Object.keys(formData).map((k) => [k, true]))
      );
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
      submitData.append("reference_visit", formData.referenceVisit);
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
        if (profileKey) {
          await AsyncStorage.setItem(profileKey, "true");
        }

        if (res.data.user) {
          updateUser({ ...res.data.user, role: "pet", profileCompleted: true });
          setModalVisible(false);
          if (onComplete) onComplete();
          return;
        }

        try {
          const userRes = await axios.get(
            `https://snoutiq.com/backend/api/petparents/${user.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          let updatedUser = userRes.data?.user || userRes.data;
          if (updatedUser) {
            updateUser({ ...updatedUser, role: "pet", profileCompleted: true });
            setModalVisible(false);
            if (onComplete) onComplete();
          }
        } catch (fetchError) {
          setModalVisible(false);
          if (onComplete) onComplete();
        }
      } else {
        Alert.alert("Error", res.data.message || "Failed to save pet data");
      }
    } catch (error) {
      if (error.response) {
        Alert.alert(
          "Error",
          `Server error: ${error.response.data?.message || "Registration failed"}`
        );
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!modalVisible) return null;

  return (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={() => {}}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={styles.headerContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerIcon}>🐾</Text>
            <Text style={styles.title}>Create Your Pet's Profile</Text>
            <Text style={styles.subtitle}>
              Let's personalize your pet's experience
            </Text>
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${calculateCompletion()}%` },
                ]}
              />
            </View>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutButton}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out" size={scale(20)} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Pet Name *</Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textInput,
                    errors.petName && styles.inputError,
                  ]}
                  value={formData.petName}
                  onChangeText={(text) => {
                    setFormData((prev) => ({ ...prev, petName: text }));
                    if (errors.petName)
                      setErrors((prev) => ({ ...prev, petName: null }));
                    setTouched((prev) => ({ ...prev, petName: true }));
                  }}
                  placeholder="Enter pet's name"
                  placeholderTextColor="#9CA3AF"
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
                    setFormData((prev) => ({
                      ...prev,
                      petType: value,
                      petBreed: "",
                    }));
                    setErrors((prev) => ({
                      ...prev,
                      petType: null,
                      petBreed: null,
                    }));
                    setTouched((prev) => ({ ...prev, petType: true }));
                  }}
                  options={petTypeOptions}
                  error={
                    errors.petType && touched.petType ? errors.petType : null
                  }
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
                  error={
                    errors.petGender && touched.petGender
                      ? errors.petGender
                      : null
                  }
                  placeholder="Select gender"
                />
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Pet Age *</Text>
                <View style={styles.ageRow}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.textInput,
                      styles.ageInput,
                      errors.petAgeYears && styles.inputError,
                    ]}
                    value={formData.petAgeYears}
                    onChangeText={(text) => {
                      setFormData((prev) => ({
                        ...prev,
                        petAgeYears: text.replace(/[^0-9]/g, ""),
                      }));
                      if (errors.petAgeYears)
                        setErrors((prev) => ({ ...prev, petAgeYears: null }));
                      setTouched((prev) => ({ ...prev, petAgeYears: true }));
                    }}
                    placeholder="Years"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    maxLength={2}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      styles.textInput,
                      styles.ageInput,
                      errors.petAgeYears && styles.inputError,
                    ]}
                    value={formData.petAgeMonths}
                    onChangeText={(text) => {
                      setFormData((prev) => ({
                        ...prev,
                        petAgeMonths: text.replace(/[^0-9]/g, ""),
                      }));
                      if (errors.petAgeYears)
                        setErrors((prev) => ({ ...prev, petAgeYears: null }));
                      setTouched((prev) => ({ ...prev, petAgeMonths: true }));
                    }}
                    placeholder="Months"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
                {(formData.petAgeYears || formData.petAgeMonths) && (
                  <Text style={styles.ageDisplay}>
                    Age: {formData.petAgeYears || 0} years{" "}
                    {formData.petAgeMonths || 0} months
                  </Text>
                )}
                {errors.petAgeYears && touched.petAgeYears && (
                  <Text style={styles.errorText}>{errors.petAgeYears}</Text>
                )}
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.fullWidth]}>
                <CustomDropdown
                  title="Pet Breed *"
                  value={formData.petBreed}
                  onSelect={(value) => {
                    setFormData((prev) => ({ ...prev, petBreed: value }));
                    setErrors((prev) => ({ ...prev, petBreed: null }));
                    setTouched((prev) => ({ ...prev, petBreed: true }));
                  }}
                  options={getPetBreedOptions()}
                  error={
                    errors.petBreed && touched.petBreed ? errors.petBreed : null
                  }
                  placeholder={getBreedsPlaceholder()}
                  loading={formData.petType === "dog" && loadingBreeds}
                  showSearch={true}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.fullWidth]}>
                <CustomDropdown
                  title="Reference Visit *"
                  value={formData.referenceVisit}
                  onSelect={(value) => {
                    setFormData((prev) => ({ ...prev, referenceVisit: value }));
                    setErrors((prev) => ({ ...prev, referenceVisit: null }));
                    setTouched((prev) => ({ ...prev, referenceVisit: true }));
                  }}
                  options={referenceVisitOptions}
                  error={
                    errors.referenceVisit && touched.referenceVisit
                      ? errors.referenceVisit
                      : null
                  }
                  placeholder="Select visit type"
                />
              </View>
            </View>

            <LinearGradient
              colors={
                isLoading ? ["#9CA3AF", "#6B7280"] : ["#7C3AED", "#EC4899"]
              }
              style={[styles.button, isLoading && styles.buttonDisabled]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
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
                      <Ionicons
                        name="arrow-forward"
                        size={scale(18)}
                        color="#fff"
                      />
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.noteContainer}>
              <Ionicons
                name="information-circle"
                size={scale(16)}
                color="#7C3AED"
              />
              <Text style={styles.note}>
                Complete all required fields to personalize your pet's experience
                and unlock all features.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  headerContainer: {
    paddingTop: Platform.OS === "ios" ? verticalScale(50) : verticalScale(30),
    paddingBottom: verticalScale(25),
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: moderateScale(24),
    borderBottomRightRadius: moderateScale(24),
  },
  headerContent: {
    alignItems: "center",
  },
  headerIcon: {
    fontSize: moderateScale(36),
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxxlarge,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.medium,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    fontWeight: "400",
    marginBottom: SPACING.lg,
  },
  progressContainer: {
    width: "80%",
    height: verticalScale(6),
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: moderateScale(3),
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#34C759",
    borderRadius: moderateScale(3),
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#F8FAFC",
    paddingBottom: SPACING.xxl,
  },
  formContainer: {
    backgroundColor: "#fff",
    margin: SPACING.lg,
    borderRadius: moderateScale(16),
    padding: SPACING.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  row: {
    marginBottom: SPACING.xs,
    flexGrow: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  fullWidth: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: moderateScale(12),
    fontSize: FONT_SIZES.medium,
    backgroundColor: "#F9FAFB",
    minHeight: verticalScale(48),
  },
  textInput: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    color: "#1F2937",
  },
  ageInput: {
    width: "48%",
  },
  ageDisplay: {
    fontSize: FONT_SIZES.small,
    color: "#6B7280",
    fontWeight: "500",
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  dropdownContainer: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  dropdownContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    minHeight: verticalScale(48),
    justifyContent: "space-between",
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  dropdownText: {
    flex: 1,
    fontSize: FONT_SIZES.medium,
    color: "#1F2937",
    fontWeight: "500",
    marginRight: SPACING.sm,
  },
  placeholderText: {
    color: "#9CA3AF",
    fontWeight: "400",
  },
  loadingIcon: {
    marginRight: SPACING.sm,
  },
  errorText: {
    color: "#EF4444",
    fontSize: FONT_SIZES.small,
    marginTop: SPACING.xs,
    fontWeight: "500",
    marginLeft: SPACING.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  dropdownModalContent: {
    backgroundColor: "#fff",
    borderRadius: moderateScale(16),
    width: "100%",
    maxHeight: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "700",
    color: "#1F2937",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.medium,
    color: "#1F2937",
    paddingVertical: SPACING.sm,
  },
  clearSearch: {
    padding: SPACING.xs,
  },
  optionsList: {
    maxHeight: verticalScale(300),
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  lastOptionItem: {
    borderBottomWidth: 0,
  },
  selectedOptionItem: {
    backgroundColor: "#F5F3FF",
  },
  optionText: {
    fontSize: FONT_SIZES.medium,
    color: "#1F2937",
    flex: 1,
    fontWeight: "500",
  },
  selectedOptionText: {
    color: "#7C3AED",
    fontWeight: "600",
  },
  noResults: {
    alignItems: "center",
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },
  noResultsText: {
    fontSize: FONT_SIZES.medium,
    color: "#6B7280",
    fontWeight: "600",
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  noResultsSubtext: {
    fontSize: FONT_SIZES.small,
    color: "#9CA3AF",
    textAlign: "center",
  },
  closeButton: {
    padding: SPACING.xs,
    borderRadius: moderateScale(16),
  },
  button: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: moderateScale(12),
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
    shadowOpacity: 0.1,
  },
  buttonTouchable: {
    paddingVertical: SPACING.md,
    borderRadius: moderateScale(12),
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: FONT_SIZES.large,
    marginRight: SPACING.sm,
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F5F3FF",
    padding: SPACING.md,
    borderRadius: moderateScale(8),
    borderLeftWidth: 4,
    borderLeftColor: "#7C3AED",
  },
  note: {
    color: "#6B7280",
    fontSize: FONT_SIZES.small,
    lineHeight: FONT_SIZES.medium,
    fontWeight: "400",
    flex: 1,
    marginLeft: SPACING.sm,
  },
  logoutButton: {
    position: "absolute",
    top: Platform.OS === "android" ? verticalScale(30) : verticalScale(45),
    right: SPACING.lg,
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: moderateScale(8),
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});