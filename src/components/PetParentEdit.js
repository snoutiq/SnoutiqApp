import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
  View
} from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useAuth } from '../context/AuthContext';

const PetParentEdit = ({ navigation }) => {
  const { user, updateUser } = useAuth();
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

  useEffect(() => {
    (async () => {
      // Request permission for image picker
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera roll access is needed to change profile picture');
      }
      await loadUserData();
    })();
  }, []);

  const loadUserData = async () => {
    try {
      // Fetch user data from API
      const response = await fetch(`https://snoutiq.com/backend/api/users/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('api_token')}`, // Assuming token is stored
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      if (result.status !== 'success') {
        throw new Error('Failed to fetch user data');
      }

      const apiData = result.data;
      let loadedData = {
        name: apiData.name || '',
        email: apiData.email || '',
        phone: apiData.phone ? apiData.phone.replace('+91', '') : '', // Remove country code for display
        avatar: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?fm=jpg&q=60&w=3000',
        address: apiData.latitude && apiData.longitude ? `${apiData.latitude}, ${apiData.longitude}` : '',
        bio: apiData.summary || ''
      };

      // Check for locally stored avatar
      const storedData = await AsyncStorage.getItem('userData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        loadedData.avatar = parsedData.avatar || loadedData.avatar;
      }

      setUserData(loadedData);
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load profile information');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!userData.name.trim()) newErrors.name = 'Name is required';
    if (!userData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) newErrors.email = 'Invalid email format';
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
        quality: 0.5,
      });

      if (!result.canceled) {
        setUserData(prev => ({ ...prev, avatar: result.assets[0].uri }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      // Prepare data for API
      const [latitude, longitude] = userData.address.split(',').map(coord => parseFloat(coord.trim()) || null);
      const apiData = {
        name: userData.name.trim(),
        phone: `+91${userData.phone.replace(/[^0-9]/g, '').slice(0, 10)}`,
        summary: userData.bio.trim(),
        latitude: latitude || 28.6139, // Fallback to default if not provided
        longitude: longitude || 77.2090,
        // Password is optional; include only if changed (not implemented in form for now)
      };

      // Send update request to API
      const response = await fetch(`https://snoutiq.com/backend/api/users/${user.id}`, {
        method: 'PUT', // Assuming PUT for updating user
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('api_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
      });

      const result = await response.json();
      if (result.status !== 'success') {
        throw new Error('Failed to update profile');
      }

      // Save avatar and other data locally
      const localData = {
        name: userData.name.trim(),
        email: userData.email.trim(),
        phone: userData.phone.replace(/[^0-9]/g, '').slice(0, 10),
        avatar: userData.avatar,
        address: userData.address.trim(),
        bio: userData.bio.trim(),
        updated_at: new Date().toISOString()
      };

      await AsyncStorage.setItem('userData', JSON.stringify(localData));
      
      // Update auth context if available
      if (updateUser) {
        await updateUser({ ...localData, id: user.id });
      }

      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving user data:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
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

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient 
        colors={["#f8fafc", "#e0e7ff", "#dbeafe"]} 
        style={styles.backgroundGradient} 
      />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <LinearGradient 
          colors={["#7C3AED", "#EC4899"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={scale(24)} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={{ width: scale(40) }} />
          </View>
        </LinearGradient>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarSection}>
            <Image source={{ uri: userData.avatar }} style={styles.userAvatar} />
            <TouchableOpacity style={styles.changePhotoButton} onPress={pickImage}>
              <Ionicons name="camera" size={scale(20)} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.avatarHint}>Tap to change profile picture</Text>

          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                <Ionicons name="person" size={scale(18)} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                  value={userData.name}
                  onChangeText={(text) => updateField('name', text)}
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                <Ionicons name="mail" size={scale(18)} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  value={userData.email}
                  onChangeText={(text) => updateField('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={[styles.inputContainer, errors.phone && styles.inputError]}>
                <Ionicons name="call" size={scale(18)} color="#6B7280" style={styles.inputIcon} />
                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  style={[styles.input, { paddingLeft: 0 }]}
                  placeholder="Enter phone number"
                  placeholderTextColor="#9CA3AF"
                  value={userData.phone}
                  onChangeText={(text) => updateField('phone', text.replace(/[^0-9]/g, '').slice(0, 10))}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address (Latitude, Longitude)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="location" size={scale(18)} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter latitude, longitude"
                  placeholderTextColor="#9CA3AF"
                  value={userData.address}
                  onChangeText={(text) => updateField('address', text)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <View style={[styles.inputContainer, errors.bio && styles.inputError]}>
                <Ionicons name="information-circle" size={scale(18)} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { height: verticalScale(80) }]}
                  placeholder="Tell us about yourself"
                  placeholderTextColor="#9CA3AF"
                  value={userData.bio}
                  onChangeText={(text) => updateField('bio', text)}
                  multiline
                  maxLength={200}
                />
              </View>
              <Text style={styles.charCount}>{userData.bio.length}/200</Text>
              {errors.bio && <Text style={styles.errorText}>{errors.bio}</Text>}
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={scale(20)} color="#2563EB" />
              <Text style={styles.infoText}>
                Your profile information helps us provide personalized pet care services and recommendations.
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={scale(20)} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject
  },
  header: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(16),
    borderBottomLeftRadius: moderateScale(20),
    borderBottomRightRadius: moderateScale(20)
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  backButton: {
    padding: scale(8),
    borderRadius: moderateScale(8),
    backgroundColor: 'rgba(255, 255, 255, 0.2)'
  },
  headerTitle: {
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    padding: scale(16),
    paddingBottom: verticalScale(40)
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: verticalScale(12)
  },
  userAvatar: {
    width: scale(120),
    height: scale(120),
    borderRadius: moderateScale(60),
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.15,
    shadowRadius: moderateScale(8),
    elevation: 6
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: verticalScale(0),
    right: scale(130),
    backgroundColor: '#2563EB',
    borderRadius: moderateScale(20),
    width: scale(40),
    height: scale(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.25,
    shadowRadius: moderateScale(4),
    elevation: 5
  },
  avatarHint: {
    fontSize: moderateScale(13),
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: verticalScale(24)
  },
  formSection: {
    gap: verticalScale(20)
  },
  inputGroup: {
    gap: verticalScale(8)
  },
  label: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#374151',
    marginLeft: scale(4)
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: scale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.08,
    shadowRadius: moderateScale(4),
    elevation: 3
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 1.5
  },
  inputIcon: {
    marginRight: scale(8)
  },
  input: {
    flex: 1,
    fontSize: moderateScale(15),
    color: '#1F2937',
    paddingVertical: verticalScale(14)
  },
  countryCode: {
    fontSize: moderateScale(15),
    color: '#1F2937',
    fontWeight: '500',
    marginRight: scale(8)
  },
  errorText: {
    fontSize: moderateScale(12),
    color: '#EF4444',
    marginLeft: scale(12),
    marginTop: verticalScale(4)
  },
  charCount: {
    fontSize: moderateScale(12),
    color: '#6B7280',
    textAlign: 'right',
    marginTop: verticalScale(4)
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    gap: scale(12),
    borderWidth: 1,
    borderColor: '#BFDBFE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(4),
    elevation: 2
  },
  infoText: {
    flex: 1,
    fontSize: moderateScale(13),
    color: '#1E40AF',
    lineHeight: moderateScale(18)
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(16),
    gap: scale(8),
    marginTop: verticalScale(32),
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(8),
    elevation: 5
  },
  saveButtonDisabled: {
    opacity: 0.7,
    backgroundColor: '#93C5FD'
  },
  saveButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#FFFFFF'
  },
  loadingText: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(14),
    color: '#6B7280',
    fontWeight: '500'
  }
});

export default PetParentEdit;