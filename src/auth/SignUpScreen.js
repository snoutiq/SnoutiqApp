import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import axios from "axios";
import * as Location from "expo-location";
import { useNavigation } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import {
  moderateScale,
  scale,
  ScaledSheet,
  verticalScale
} from 'react-native-size-matters';
import { useAuth } from "../context/AuthContext";

const { width, height } = Dimensions.get('window');

const colors = {
  primary: '#2563EB',
  secondary: '#4ECDC4',
  accent: '#FFD93D',
  background: '#F8F9FA',
  white: '#FFFFFF',
  black: '#2C3E50',
  darkGray: '#34495E',
  lightGray: '#ECF0F1',
  borderGray: '#BDC3C7',
  textGray: '#7F8C8D',
  success: '#2ECC71',
  error: '#E74C3C'
};

const petTypeOptions = [
  { label: "Dog", value: "dog" },
  { label: "Cat", value: "cat" }
];

const petGenderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

const petAgeOptions = [
  { label: "Puppy/Kitten (0-1 year)", value: "1" },
  { label: "Young (1-3 years)", value: "3" },
  { label: "Adult (3-7 years)", value: "7" },
  { label: "Senior (7+ years)", value: "8" }
];

const catBreedOptions = [
  { label: "Indian Street Cat", value: "indian_street_cat" },
  { label: "Persian", value: "persian" },
];

// Configure WebBrowser for auth session
WebBrowser.maybeCompleteAuthSession();

const CustomInput = ({ 
  title, 
  value, 
  onChangeText, 
  keyboardType = 'default', 
  autoCapitalize = 'sentences',
  isPassword = false,
  icon,
  error,
  placeholder,
  unit
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
    
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{title}</Text>
      <View style={[
        styles.inputWrapper, 
        isFocused && styles.inputWrapperFocused,
        error && styles.inputError
      ]}>
        {icon && <Text style={styles.inputIcon}>{icon}</Text>}
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={isPassword && !showPassword}
          placeholder={placeholder || `Enter your ${title.toLowerCase()}`}
          placeholderTextColor={colors.textGray}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {unit && (
          <Text style={styles.unitText}>{unit}</Text>
        )}
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.eyeIconText}>
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

// Custom Dropdown Component
const CustomDropdown = ({ title, value, onSelect, options, icon, error, placeholder, loading = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const selectedOption = options.find(option => option.value === value);

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{title}</Text>
      <TouchableOpacity
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          error && styles.inputError,
        ]}
        onPress={() => setIsVisible(true)}
        disabled={loading || options.length === 0}
      >
        {icon && <Text style={styles.inputIcon}>{icon}</Text>}
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 10 }} />
        ) : null}
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
        <Text style={styles.dropdownArrow}>▼</Text>
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
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {title}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    item.value === value && styles.selectedOptionItem
                  ]}
                  onPress={() => {
                    onSelect(item.value);
                    setIsVisible(false);
                  }}
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
              )}
              style={styles.optionsList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// Custom Button Component
const CustomButton = ({ title, onPress, loading = false, style, variant = 'primary' }) => (
  <TouchableOpacity 
    style={[
      styles.button, 
      variant === 'secondary' && styles.secondaryButton,
      style
    ]} 
    onPress={onPress}
    disabled={loading}
  >
    {loading ? (
      <ActivityIndicator color={colors.white} size={moderateScale(20)} />
    ) : (
      <Text style={[
        styles.buttonText,
        variant === 'secondary' && styles.secondaryButtonText
      ]}>
        {title}
      </Text>
    )}
  </TouchableOpacity>
);

const SignUpScreen = () => {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [userType, setUserType] = useState('pet_owner');
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Form data for pet owner signup
  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    petName: "",
    petType: "",
    petGender: "",
    petAge: "",
    petBreed: "",
    petWeight: "",
    google_token: ""
  });
  
  // Dog breeds state
  const [dogBreeds, setDogBreeds] = useState([]);
  const [loadingBreeds, setLoadingBreeds] = useState(false);

  // Store email and google_token in AsyncStorage when Google account is selected
  useEffect(() => {
    if (selectedGoogleAccount?.email && selectedGoogleAccount?.google_token) {
      AsyncStorage.multiSet([
        ['userEmail', selectedGoogleAccount.email],
        ['googleSub', selectedGoogleAccount.google_token]
      ]).catch(err => console.error("Failed to save email or google_token:", err));
    }
  }, [selectedGoogleAccount]);

  // Function to format breed name for display
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

  // Function to fetch dog breeds from API
  const fetchDogBreeds = async () => {
    try {
      setLoadingBreeds(true);
      
      const response = await axios.get("https://snoutiq.com/backend/api/dog-breeds/all");
      
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
      }
    } catch (error) {
      console.error("❌ Error fetching dog breeds:", error.response?.data || error.message);
      setDogBreeds([
        { label: "Mixed Breed", value: "mixed_breed" },
        { label: "Other", value: "other" }
      ]);
      Alert.alert("Warning", "Could not load dog breeds. Please try again later.");
    } finally {
      setLoadingBreeds(false);
    }
  };

  // Fetch dog breeds when component mounts
  useEffect(() => {
    fetchDogBreeds();
  }, []);

  // Get breed options based on pet type
  const getPetBreedOptions = () => {
    if (formData.petType === "dog") {
      return dogBreeds;
    } else if (formData.petType === "cat") {
      return catBreedOptions;
    }
    return [];
  };

  const validateStep = () => {
    let valid = true;
    let newErrors = {};

    if (currentStep === 1) {
      if (!selectedGoogleAccount) {
        newErrors.googleAccount = "Please select a Google account";
        valid = false;
      }
    } else if (currentStep === 2 && userType === 'pet_owner') {
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Full name is required";
        valid = false;
      }
      if (!formData.mobileNumber.trim()) {
        newErrors.mobileNumber = "Mobile number is required";
        valid = false;
      } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
        newErrors.mobileNumber = "Enter valid 10-digit mobile number";
        valid = false;
      }
      if (!formData.password) {
        newErrors.password = "Password is required";
        valid = false;
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
        valid = false;
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
        valid = false;
      }
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
      if (!formData.petAge) {
        newErrors.petAge = "Pet age is required";
        valid = false;
      }
      if (!formData.petBreed) {
        newErrors.petBreed = "Pet breed is required";
        valid = false;
      }
      if (!formData.petWeight.trim()) {
        newErrors.petWeight = "Pet weight is required";
        valid = false;
      } else if (!/^\d+(\.\d{1,2})?$/.test(formData.petWeight)) {
        newErrors.petWeight = "Enter a valid weight (e.g., 12.5)";
        valid = false;
      }
    }

    setErrors(newErrors);
    if (!valid) {
      console.log("Validation errors:", newErrors);
      Alert.alert("Validation Error", "Please fill in all required fields correctly.");
    }
    return valid;
  };

  const handleNext = async () => {
    setErrors({});
    
    if (!validateStep()) {
      return;
    }

    setLoading(true);
    try {
      if (currentStep === 1) {
        console.log(`Selected user type: ${userType}`);
        console.log('Selected Google account:', selectedGoogleAccount);
        
        if (userType === 'vet') {
          Alert.alert('Veterinarian Registration', 'Vet registration will be implemented soon!');
          navigation.navigate('Login');
        } else {
          setCurrentStep(2);
        }
      } else if (currentStep === 2 && userType === 'pet_owner') {
        const success = await handlePetOwnerRegistration();
        console.log(success)
      }
    } catch (error) {
      console.error('Error in handleNext:', error);
      Alert.alert("Error", "An error occurred during registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (idToken) => {
    try {
      setLoading(true);
      console.log("Google OAuth success, ID Token:", idToken);

      // Decode Google JWT to get the sub (unique ID)
      const base64Url = idToken.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      const googleData = JSON.parse(jsonPayload);
      console.log("Google user data:", googleData);
      console.log("Google unique ID (sub):", googleData.sub);

      const account = {
        idToken,
        email: googleData.email || "",
        name: googleData.name || "",
        avatar: googleData.picture || null,
        google_token: googleData.sub
      };

      setFormData((prev) => ({
        ...prev,
        fullName: googleData.name || "",
        email: googleData.email || "",
        mobileNumber: "",
        google_token: googleData.sub
      }));

      setSelectedGoogleAccount(account);
      
      // Save to AsyncStorage
      await AsyncStorage.multiSet([
        ['userEmail', googleData.email],
        ['googleSub', googleData.sub]
      ]);
      
      console.log("✅ Google sub saved to AsyncStorage:", googleData.sub);
      Alert.alert("Success", "Google login successful. Continue with pet details!");
      setCurrentStep(2);
    } catch (error) {
      console.error("Google login failed:", error);
      Alert.alert("Error", "Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePetOwnerRegistration = async () => {
    const emailFromGoogle = selectedGoogleAccount?.email;
    const tokenFromGoogle = selectedGoogleAccount?.google_token;
    
    if (!emailFromGoogle) {
      console.error("No email found in selectedGoogleAccount");
      Alert.alert("Error", "No email found from selected Google account");
      return false;
    }

    if (!tokenFromGoogle) {
      console.error("No google_token found in selectedGoogleAccount");
      Alert.alert("Error", "No Google unique ID found");
      return false;
    }

    // Get location permission and coordinates
    let location = null;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          "Permission required",
          "Location is needed to complete registration. Please enable it in your settings."
        );
        return false;
      }
      location = await Location.getCurrentPositionAsync({});
    } catch (locationError) {
      console.error("Location error:", locationError);
      Alert.alert("Warning", "Location access failed. Continuing without location data.");
    }

    const coords = location ? {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    } : { lat: null, lng: null };

    const payload = {
      fullName: formData.fullName,
      email: emailFromGoogle,
      google_token: tokenFromGoogle,
      mobileNumber: formData.mobileNumber,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      pet_name: formData.petName,
      pet_type: formData.petType,
      pet_gender: formData.petGender,
      pet_age: formData.petAge,
      breed: formData.petBreed,
      pet_weight: formData.petWeight,
      latitude: coords.lat,
      longitude: coords.lng,
      pet_doc1: "https://yourcdn.com/files/bruno-vaccine.pdf",
      pet_doc2: "https://yourcdn.com/files/bruno-photo.jpg",
    };

    console.log("📤 Register Payload:", payload);

    try {
      const response = await axios.post("https://snoutiq.com/backend/api/auth/register", payload);
      console.log("Registration response:", response.data);

      if (response.data.message === "User registered successfully" || response.data.token) {
        try {
          console.log("Attempting login with:", { login: emailFromGoogle, password: formData.password });
          const loginResponse = await axios.post(
            "https://snoutiq.com/backend/api/auth/login",
            {
              login: emailFromGoogle,
              password: formData.password,
              role: 'pet'
            }
          );
          console.log("Login response:", loginResponse.data);

          const loginData = loginResponse.data || {};
          const user = loginData.user || loginData.data?.user || loginData.data;
          const token = loginData.token || loginData.accessToken || loginData.data?.token;
          const chatRoomToken = loginData.chat_room?.token || loginData.sessionToken || loginData.data?.SessionToken || null;

          if (user && token) {
            try {
              console.log("Calling login function with:", { user, token, chatRoomToken });
              await login(user, token, chatRoomToken);
              Alert.alert("✅ Registration & Login successful!");
              
              // Clear form data after successful registration
              setFormData({
                fullName: "",
                mobileNumber: "",
                password: "",
                confirmPassword: "",
                petName: "",
                petType: "",
                petGender: "",
                petAge: "",
                petBreed: "",
                petWeight: "",
                google_token: ""
              });
              
              setSelectedGoogleAccount(null);
              setCurrentStep(1);
              
              return true; // Success
              
            } catch (loginError) {
              console.error("Error during login function or AsyncStorage:", {
                message: loginError.message,
                stack: loginError.stack
              });
              Alert.alert("Error", "Failed to complete login. Please try again.");
              return false;
            }
          } else {
            console.error("Invalid login response:", loginData);
            Alert.alert("Success", "Registration successful! Please login with your credentials.");
            navigation.navigate('Login');
            return false;
          }
        } catch (loginError) {
          console.error("Login API error:", {
            message: loginError.message,
            response: loginError.response?.data,
            status: loginError.response?.status
          });
          Alert.alert("Success", "Registration successful! Please login with your credentials.");
          return false;
        }
      } else {
        console.error("Registration failed:", response.data);
        Alert.alert("Error", response.data.message || "Registration failed. Please try again.");
        return false;
      }
    } catch (error) {
      console.error("Registration error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 422) {
        const serverErrors = error.response.data.errors;
        if (serverErrors) {
          let errorMessage = "Please fix the following errors:\n";
          Object.keys(serverErrors).forEach(key => {
            errorMessage += `• ${serverErrors[key][0]}\n`;
          });
          Alert.alert("Validation Error", errorMessage);
        } else {
          Alert.alert("Error", error.response.data.message || "Validation failed");
        }
      } else {
        Alert.alert(
          "Error",
          error.response?.data?.message || "An error occurred during registration. Please try again."
        );
      }
      return false;
    }
  };

  const startSignInFlow = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const signInResponse = await GoogleSignin.signIn();
      
      if (signInResponse.type === 'success') {
        console.log('✅ Google Sign-In Successful. Account Data:', signInResponse.data);
        await handleGoogleSuccess(signInResponse.data.idToken);
      } else if (signInResponse.type === 'noSavedCredentialFound') {
        console.log('ℹ️ No saved credentials found.');
        const createResponse = await GoogleSignin.createAccount();
        
        if (createResponse.type === 'success') {
          console.log('✅ Google Account Creation Successful. Account Data:', createResponse.data);
          await handleGoogleSuccess(createResponse.data.idToken);
        } else if (createResponse.type === 'noSavedCredentialFound') {
          console.log('ℹ️ No Google user account present on device.');
          const explicitResponse = await GoogleSignin.presentExplicitSignIn();
          
          if (explicitResponse.type === 'success') {
            console.log('✅ Explicit Google Sign-In Successful. Account Data:', explicitResponse.data);
            await handleGoogleSuccess(explicitResponse.data.idToken);
          } else {
            console.log('ℹ️ Explicit sign-in failed or cancelled:', explicitResponse);
          }
        }
      } else {
        console.log('ℹ️ Google Sign-In Cancelled or Failed:', signInResponse);
      }
    } catch (error) {
      console.error('❌ Main Google Sign-In Error:', error);
      Alert.alert("Error", "An error occurred during Google Sign-In. Please try again.");
    }
  };

  const handleChange = (name, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      
      if (name === "petType") {
        newData.petBreed = "";
      }
      
      return newData;
    });
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    
    if (name === "petType" && errors.petBreed) {
      setErrors((prev) => ({ ...prev, petBreed: null }));
    }
  };

  const getBreedsPlaceholder = () => {
    if (!formData.petType) {
      return "Please select pet type first";
    } else if (formData.petType === "dog" && loadingBreeds) {
      return "Loading dog breeds...";
    } else {
      return `Select ${formData.petType} breed`;
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('login');
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Create Account';
      case 2: return 'Complete Registration';
      default: return 'Register';
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1: return 'Choose your role and connect with Google';
      case 2: return 'Tell us about you and your pet';
      default: return 'Join our pet community';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerSection}>
          <View style={styles.petIllustration}>
            <Image style={styles.logoContainer} source={require("../assets/snoutiqBlueLogo.png")} />
          </View>
          <Text style={styles.welcomeTitle}>{getStepTitle()}</Text>
          <Text style={styles.welcomeSubtitle}>{getStepSubtitle()}</Text>
        </View>

        <View style={styles.formContainer}>
          {userType === 'pet_owner' && (
            <View style={styles.stepIndicator}>
              {[1, 2].map((step) => (
                <View key={step} style={styles.stepContainer}>
                  <View style={[
                    styles.stepCircle,
                    currentStep >= step ? styles.activeStepCircle : styles.inactiveStepCircle
                  ]}>
                    <Text style={[
                      styles.stepText,
                    currentStep >= step ? styles.activeStepText : styles.inactiveStepText
                    ]}>
                      {step}
                    </Text>
                  </View>
                  {step < 2 && (
                    <View style={[
                      styles.stepLine,
                      currentStep > step ? styles.activeStepLine : styles.inactiveStepLine
                    ]} />
                  )}
                </View>
              ))}
            </View>
          )}

          {currentStep === 1 && (
            <>
              <View style={styles.userTypeContainer}>
                <Text style={styles.sectionTitle}>Register as a:</Text>
                <View style={styles.toggleContainer}>
                  <TouchableOpacity
                    style={[
                      styles.toggleOption,
                      userType === 'pet_owner' ? styles.activeToggle : styles.inactiveToggle
                    ]}
                    onPress={() => setUserType('pet_owner')}
                  >
                    <Text style={styles.toggleIcon}>🐾</Text>
                    <Text style={[
                      styles.toggleText,
                      userType === 'pet_owner' ? styles.activeToggleText : styles.inactiveToggleText
                    ]}>
                      Pet Owner
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.toggleOption,
                      userType === 'vet' ? styles.activeToggle : styles.inactiveToggle
                    ]}
                    onPress={() => setUserType('vet')}
                  >
                    <Text style={styles.toggleIcon}>👨‍⚕️</Text>
                    <Text style={[
                      styles.toggleText,
                      userType === 'vet' ? styles.activeToggleText : styles.inactiveToggleText
                    ]}>
                      Veterinarian
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <GoogleSigninButton onPress={startSignInFlow} label="Sign in with Google" />
            </>
          )}

          {currentStep === 2 && userType === 'pet_owner' && (
            <>
              <CustomInput
                title="Full Name"
                value={formData.fullName}
                onChangeText={(text) => handleChange("fullName", text)}
                icon="👤"
                error={errors.fullName}
              />
              <CustomInput
                title="Mobile Number"
                value={formData.mobileNumber}
                onChangeText={(text) => handleChange("mobileNumber", text)}
                keyboardType="phone-pad"
                icon="📱"
                error={errors.mobileNumber}
              />
              <CustomInput
                title="Password"
                value={formData.password}
                onChangeText={(text) => handleChange("password", text)}
                isPassword={true}
                icon="🔒"
                error={errors.password}
              />
              <CustomInput
                title="Confirm Password"
                value={formData.confirmPassword}
                onChangeText={(text) => handleChange("confirmPassword", text)}
                isPassword={true}
                icon="🔒"
                error={errors.confirmPassword}
              />
              <CustomInput
                title="Pet Name"
                value={formData.petName}
                onChangeText={(text) => handleChange("petName", text)}
                icon="🐾"
                error={errors.petName}
              />
              
              <CustomDropdown
                title="Pet Type"
                value={formData.petType}
                onSelect={(value) => handleChange("petType", value)}
                options={petTypeOptions}
                icon="🐱"
                error={errors.petType}
              />
              
              <CustomDropdown
                title="Pet Gender"
                value={formData.petGender}
                onSelect={(value) => handleChange("petGender", value)}
                options={petGenderOptions}
                icon="⚧️"
                error={errors.petGender}
              />
              
              <CustomDropdown
                title="Pet Age"
                value={formData.petAge}
                onSelect={(value) => handleChange("petAge", value)}
                options={petAgeOptions}
                icon="📅"
                error={errors.petAge}
              />
              
              <CustomDropdown
                title="Pet Breed"
                value={formData.petBreed}
                onSelect={(value) => handleChange("petBreed", value)}
                options={getPetBreedOptions()}
                icon={formData.petType === "cat" ? "🐱" : "🐕"}
                error={errors.petBreed}
                placeholder={getBreedsPlaceholder()}
                loading={formData.petType === "dog" && loadingBreeds}
              />

              {/* New Weight Input Field */}
              <CustomInput
                title="Pet Weight"
                value={formData.petWeight}
                onChangeText={(text) => handleChange("petWeight", text)}
                keyboardType="decimal-pad"
                icon="⚖️"
                error={errors.petWeight}
                placeholder="Enter pet weight"
                unit="kg"
              />
            </>
          )}

          {currentStep === 1 ? null : (
            <CustomButton
              title={currentStep === 1 ? 'Continue' : 'Complete Registration'}
              onPress={handleNext}
              loading={loading}
            />
          )}

          <TouchableOpacity style={styles.backToLoginContainer} onPress={handleBackToLogin}>
            <Text style={styles.backToLoginText}>
              Already have an account? 
              <Text style={styles.backToLoginLink}> Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  logoContainer: {
    height: verticalScale(40),
    width: "80%",
    borderRadius: moderateScale(20),
    resizeMode: "contain",
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: verticalScale(15),
    paddingBottom: verticalScale(20),
    backgroundColor: colors.primary,
    borderBottomLeftRadius: moderateScale(30),
    borderBottomRightRadius: moderateScale(30),
  },
  petIllustration: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: moderateScale(40),
    paddingVertical: moderateScale(5),
    paddingHorizontal: moderateScale(1),
    marginTop: verticalScale(20),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  welcomeTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: colors.white,
    marginVertical: verticalScale(3),
  },
  welcomeSubtitle: {
    fontSize: moderateScale(14),
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(18),
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(25),
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(15),
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStepCircle: {
    backgroundColor: colors.primary,
  },
  inactiveStepCircle: {
    backgroundColor: colors.lightGray,
    borderWidth: moderateScale(2),
    borderColor: colors.borderGray,
  },
  stepText: {
    fontSize: moderateScale(12),
    fontWeight: 'bold',
  },
  activeStepText: {
    color: colors.white,
  },
  inactiveStepText: {
    color: colors.textGray,
  },
  stepLine: {
    width: scale(50),
    height: moderateScale(2),
  },
  activeStepLine: {
    backgroundColor: colors.primary,
  },
  inactiveStepLine: {
    backgroundColor: colors.borderGray,
  },
  userTypeContainer: {
    marginBottom: verticalScale(20),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: colors.darkGray,
    marginBottom: verticalScale(12),
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.lightGray,
    padding: moderateScale(4),
    borderRadius: moderateScale(12),
  },
  toggleOption: {
    flex: 1,
    paddingVertical: verticalScale(5),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeToggle: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  inactiveToggle: {
    backgroundColor: 'transparent',
  },
  toggleIcon: {
    fontSize: moderateScale(24),
    marginBottom: verticalScale(4),
  },
  toggleText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  activeToggleText: {
    color: colors.white,
  },
  inactiveToggleText: {
    color: colors.textGray,
  },
  inputContainer: {
    marginBottom: verticalScale(12),
  },
  inputLabel: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: colors.darkGray,
    marginBottom: verticalScale(6),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: moderateScale(1.5),
    borderColor: colors.borderGray,
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(15),
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.1,
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: '#FFF5F5',
  },
  inputIcon: {
    fontSize: moderateScale(18),
    marginRight: scale(12),
  },
  textInput: {
    flex: 1,
    paddingVertical: verticalScale(12),
    fontSize: moderateScale(15),
    color: colors.darkGray,
  },
  googleSelector: {
    borderWidth: moderateScale(1.5),
    borderColor: colors.borderGray,
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(12),
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  googleSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleIcon: {
    height: verticalScale(25),
    width: moderateScale(25),
    marginRight: scale(12),
  },
  selectedAccountInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedAccountAvatar: {
    fontSize: moderateScale(20),
    marginRight: scale(10),
  },
  accountDetails: {
    flex: 1,
  },
  selectedAccountName: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: colors.darkGray,
  },
  selectedAccountEmail: {
    fontSize: moderateScale(12),
    color: colors.textGray,
  },
  googleSelectorPlaceholder: {
    flex: 1,
    fontSize: moderateScale(15),
    color: colors.textGray,
  },
  dropdownIcon: {
    fontSize: moderateScale(12),
    color: colors.textGray,
  },
  googleOptionsContainer: {
    marginTop: verticalScale(8),
    backgroundColor: colors.white,
    borderRadius: moderateScale(12),
    borderWidth: moderateScale(1),
    borderColor: colors.borderGray,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  googleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(12),
    borderBottomWidth: moderateScale(1),
    borderBottomColor: colors.lightGray,
  },
  accountAvatar: {
    fontSize: moderateScale(20),
    marginRight: scale(12),
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: colors.darkGray,
  },
  accountEmail: {
    fontSize: moderateScale(12),
    color: colors.textGray,
  },
  addAccountOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(12),
  },
  addAccountIcon: {
    fontSize: moderateScale(16),
    marginRight: scale(12),
  },
  addAccountText: {
    fontSize: moderateScale(14),
    color: colors.primary,
    fontWeight: '600',
  },
  noAccountsText: {
    fontSize: moderateScale(14),
    color: colors.textGray,
    padding: moderateScale(15),
    textAlign: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: moderateScale(11),
    marginTop: verticalScale(3),
    fontWeight: '500',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    marginBottom: verticalScale(12),
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: colors.white,
  },
  dropdownText: {
    flex: 1,
    paddingVertical: verticalScale(12),
    fontSize: moderateScale(15),
    color: colors.darkGray,
  },
  placeholderText: {
    color: colors.textGray,
  },
  dropdownArrow: {
    fontSize: moderateScale(12),
    color: colors.textGray,
    marginLeft: scale(8),
  },
  eyeIcon: {
    padding: moderateScale(5),
  },
  eyeIconText: {
    fontSize: moderateScale(18),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: moderateScale(12),
    width: '85%',
    maxHeight: '70%',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  modalTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: colors.darkGray,
  },
  closeButton: {
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(15),
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: moderateScale(14),
    color: colors.textGray,
  },
  secondaryButton: {
    backgroundColor: colors.white,
    borderWidth: moderateScale(1.5),
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    color: colors.primary,
  },
  backToLoginContainer: {
    alignItems: 'center',
    paddingBottom: verticalScale(20),
  },
  backToLoginText: {
    fontSize: moderateScale(14),
    color: colors.textGray,
    textAlign: 'center',
  },
  backToLoginLink: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  selectedOptionItem: {
    backgroundColor: colors.primary + '10',
  },
  optionText: {
    fontSize: moderateScale(15),
    color: colors.darkGray,
  },
  selectedOptionText: {
    color: colors.primary,
    fontWeight: '600',
  },
  checkMark: {
    fontSize: moderateScale(16),
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default SignUpScreen;