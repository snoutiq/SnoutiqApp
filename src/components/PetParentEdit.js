import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
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

const PetParentEditScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    bio: "",
    avatar: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  // Use useEffect to load data from AsyncStorage when the component mounts
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData !== null) {
          const userData = JSON.parse(storedData);
          setFormData(userData);
        }
      } catch (e) {
        console.error("Failed to load user data from storage", e);
      }
    };

    loadUserData();
  }, []);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(async () => {
      try {
        // Save updated formData back to AsyncStorage
        await AsyncStorage.setItem('userData', JSON.stringify(formData));
        Alert.alert("Success", "Profile updated successfully!");
      } catch (e) {
        console.error("Failed to save user data to storage", e);
        Alert.alert("Error", "Failed to save profile. Please try again.");
      } finally {
        setIsLoading(false);
        navigation?.goBack();
      }
    }, 1000);
  };

  const handleChangePhoto = () => {
    Alert.alert(
      "Change Photo",
      "Choose an option",
      [
        { text: "Camera", onPress: () => console.log("Open Camera") },
        { text: "Gallery", onPress: () => console.log("Open Gallery") },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const formFields = [
    {
      section: "Personal Information",
      fields: [
        { key: "name", label: " Name", placeholder: "Enter your name" },
        { key: "email", label: "Email", placeholder: "Enter email", keyboardType: "email-address" },
        { key: "phone", label: "Phone", placeholder: "Enter phone number", keyboardType: "phone-pad" },
      ]
    },
    {
      section: "Address",
      fields: [
        { key: "address", label: "Street Address", placeholder: "Enter street address" },
        { key: "city", label: "City", placeholder: "Enter city" },
        { key: "zipCode", label: "ZIP Code", placeholder: "Enter ZIP code", keyboardType: "numeric" },
      ]
    },
    {
      section: "About",
      fields: [
        { key: "bio", label: "Bio", placeholder: "Tell us about yourself", multiline: true },
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#dbeafe', '#e0e7ff']}
        style={styles.backgroundGradient}
      />

      {/* Header */}
      <LinearGradient
        colors={['#2563EB', '#3b82f6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Text style={styles.backButton}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave} disabled={isLoading}>
            <Text style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}>
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: formData.avatar }} style={styles.avatar} />
              <TouchableOpacity style={styles.changePhotoButton} onPress={handleChangePhoto}>
                <Text style={styles.changePhotoIcon}>📷</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.changePhotoText}>Tap to change photo</Text>
          </View>

          {/* Form Sections */}
          {formFields.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.formSection}>
              <Text style={styles.sectionTitle}>{section.section}</Text>
              <View style={styles.sectionCard}>
                {section.fields.map((field, fieldIndex) => (
                  <View key={fieldIndex} style={[
                    styles.inputContainer,
                    fieldIndex !== section.fields.length - 1 && styles.inputBorder
                  ]}>
                    <Text style={styles.inputLabel}>{field.label}</Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        field.multiline && styles.textAreaInput
                      ]}
                      value={formData[field.key]}
                      onChangeText={(value) => updateField(field.key, value)}
                      placeholder={field.placeholder}
                      placeholderTextColor="#9ca3af"
                      keyboardType={field.keyboardType || 'default'}
                      multiline={field.multiline}
                      numberOfLines={field.multiline ? 4 : 1}
                    />
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* Delete Account */}
          <View style={styles.dangerSection}>
            <TouchableOpacity style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>Delete Account</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flex: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    paddingHorizontal: scale(20),
    paddingVertical: moderateScale(5)
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    fontSize: moderateScale(28),
    color: '#fff',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#fff',
  },
  saveButton: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#fff',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(20),
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: verticalScale(32),
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: verticalScale(12),
  },
  avatar: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
    borderWidth: scale(4),
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.1,
    shadowRadius: scale(8),
    elevation: 8,
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: scale(4),
    right: scale(4),
    backgroundColor: '#2563EB',
    borderRadius: scale(18),
    width: scale(36),
    height: scale(36),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.2,
    shadowRadius: scale(4),
    elevation: 4,
  },
  changePhotoIcon: {
    fontSize: moderateScale(16),
  },
  changePhotoText: {
    fontSize: moderateScale(14),
    color: '#6b7280',
  },
  formSection: {
    marginBottom: verticalScale(24),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#374151',
    marginBottom: verticalScale(12),
    marginLeft: scale(4),
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: scale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.05,
    shadowRadius: scale(4),
    elevation: 2,
  },
  inputContainer: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
  },
  inputBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  inputLabel: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#374151',
    marginBottom: verticalScale(8),
  },
  textInput: {
    fontSize: moderateScale(16),
    color: '#1f2937',
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(12),
    backgroundColor: '#f9fafb',
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textAreaInput: {
    height: verticalScale(80),
    textAlignVertical: 'top',
  },
  dangerSection: {
    marginTop: verticalScale(32),
    marginBottom: verticalScale(40),
    alignItems: 'center',
  },
  deleteButton: {
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(12),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  deleteButtonText: {
    fontSize: moderateScale(14),
    color: '#dc2626',
    fontWeight: '500',
  },
});

export default PetParentEditScreen;