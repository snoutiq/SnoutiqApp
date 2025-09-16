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
  View
} from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const EditPetProfile = ({ navigation, route }) => {
  const { petIndex = null } = route.params || {};

  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    gender: "",
    age: "",
    weight: "",
    avatar: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop"
  });

  const [addPetFormData, setAddPetFormData] = useState({
    name: "",
    breed: "",
    gender: "",
    age: "",
    weight: "",
    avatar: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop"
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeMode, setActiveMode] = useState('edit');
  const [petsList, setPetsList] = useState([]);

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        setIsLoading(true);
        const userDataString = await AsyncStorage.getItem('userData');
        if (!userDataString) return;

        const userData = JSON.parse(userDataString);
        const pets = Array.isArray(userData.pets) ? userData.pets : [];
        setPetsList(pets);

        if (petIndex !== null && pets[petIndex]) {
          const selectedPet = pets[petIndex];
          setFormData({
            name: selectedPet.name || "",
            breed: selectedPet.breed || "",
            gender: selectedPet.gender || "",
            age: selectedPet.age ? String(selectedPet.age) : "",
            weight: selectedPet.weight || "",
            avatar: selectedPet.avatar || "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop"
          });
        } else if (userData.pet_name) {
          setFormData({
            name: userData.pet_name,
            breed: userData.pet_breed,
            gender: userData.pet_gender || "",
            age: userData.pet_age ? String(userData.pet_age) : "",
            weight: userData.pet_weight || "",
            avatar: userData.pet_avatar || "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop"
          });
        }
      } catch (error) {
        console.error('Error fetching pet data:', error);
        Alert.alert("Error", "Failed to load pet data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPetData();
  }, [petIndex]);

  useEffect(() => {
    if (activeMode === 'add') {
      setAddPetFormData({
        name: "",
        breed: "",
        gender: "",
        age: "",
        weight: "",
        avatar: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop"
      });
    }
  }, [activeMode]);

  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const updateAddPetField = (field, value) => setAddPetFormData(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const userDataString = await AsyncStorage.getItem('userData');
      if (!userDataString) return;

      const userData = JSON.parse(userDataString);
      const updatedPet = { ...formData, age: formData.age ? parseInt(formData.age) : null };

      let updatedPets = [...petsList];
      if (petIndex !== null && petsList[petIndex]) {
        updatedPets[petIndex] = updatedPet;
      } else {
        updatedPets = [updatedPet];
      }

      const updatedUserData = { ...userData, pets: updatedPets };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
      Alert.alert("Success", `${formData.name}'s profile has been updated!`);
      navigation?.goBack();
    } catch (error) {
      console.error('Error saving pet data:', error);
      Alert.alert("Error", "Failed to save pet data");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPet = async () => {
    if (!addPetFormData.name.trim()) return Alert.alert("Error", "Pet name is required");
    try {
      setIsSaving(true);
      const userDataString = await AsyncStorage.getItem('userData');
      if (!userDataString) return;

      const userData = JSON.parse(userDataString);
      const newPet = { ...addPetFormData, age: addPetFormData.age ? parseInt(addPetFormData.age) : null };
      const updatedPets = [...petsList, newPet];

      await AsyncStorage.setItem('userData', JSON.stringify({ ...userData, pets: updatedPets }));
      setPetsList(updatedPets);
      Alert.alert("Success", `${addPetFormData.name} has been added!`);

      setAddPetFormData({
        name: "",
        breed: "",
        gender: "",
        age: "",
        weight: "",
        avatar: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop"
      });
    } catch (error) {
      console.error('Error adding pet:', error);
      Alert.alert("Error", "Failed to add pet");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePet = async (index) => {
    Alert.alert(
      "Delete Pet",
      `Are you sure you want to delete ${petsList[index].name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const userDataString = await AsyncStorage.getItem('userData');
              if (!userDataString) return;

              const userData = JSON.parse(userDataString);
              const updatedPets = [...petsList];
              updatedPets.splice(index, 1);

              await AsyncStorage.setItem('userData', JSON.stringify({ ...userData, pets: updatedPets }));
              setPetsList(updatedPets);
              Alert.alert("Success", "Pet deleted!");
            } catch (error) {
              console.error('Error deleting pet:', error);
              Alert.alert("Error", "Failed to delete pet");
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#dbeafe', '#e0e7ff']} style={styles.backgroundGradient} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading pet data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderFormSection = (data, isAddPet = false) => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Basic Information</Text>
      <View style={styles.sectionCard}>
        {["name", "breed", "gender", "age", "weight"].map((key, index) => (
          <View key={key} style={[styles.inputContainer, index !== 4 && styles.inputBorder]}>
            <Text style={styles.inputLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
            <TextInput
              style={styles.textInput}
              value={isAddPet ? addPetFormData[key] : formData[key]}
              onChangeText={v => isAddPet ? updateAddPetField(key, v) : updateField(key, v)}
              placeholder={`Enter ${key}`}
              keyboardType={key === 'age' || key === 'weight' ? 'numeric' : 'default'}
            />
          </View>
        ))}
      </View>
    </View>
  );

  const renderPetsList = () => (
    <View style={styles.petsListSection}>
      <Text style={styles.sectionTitle}>Your Pets</Text>
      {petsList.length ? petsList.map((pet, i) => (
        <View key={i} style={styles.petListItem}>
          <Image source={{ uri: pet.avatar }} style={styles.petListImage} />
          <View style={styles.petListInfo}>
            <Text style={styles.petListName}>{pet.name}</Text>
            <Text style={styles.petListDetails}>{pet.breed} • {pet.age} years</Text>
          </View>
          <TouchableOpacity style={styles.deletePetButton} onPress={() => handleDeletePet(i)}>
            <Text style={styles.deletePetButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      )) : <Text style={styles.noPetsText}>You don't have any pets yet.</Text>}
    </View>
  );

  const handleBottomSave = () => {
    if (activeMode === 'edit') handleSave();
    else if (activeMode === 'add') handleAddPet();
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#dbeafe', '#e0e7ff']} style={styles.backgroundGradient} />
      {/* Header */}
      <LinearGradient colors={['#2563EB', '#3b82f6']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Text style={styles.backButton}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {activeMode === 'edit' ? 'Edit Pet' : activeMode === 'add' ? 'Add Pet' : 'Remove Pet'}
          </Text>
          <TouchableOpacity onPress={activeMode === 'edit' ? handleSave : activeMode === 'add' ? handleAddPet : () => { }} disabled={isSaving || (activeMode === 'add' && !addPetFormData.name.trim())} >
            <Text style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}>
              {isSaving ? 'Saving...' : activeMode === 'remove' ? 'Done' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <ScrollView style={styles.content}
          showsVerticalScrollIndicator={false}>
          {/* Mode Toggle */}
          <View style={styles.modeToggleSection}>
            <View style={styles.modeToggleButtons}>
              {['edit', 'add', 'remove'].map(mode => (
                <TouchableOpacity
                  key={mode}
                  style={[styles.modeButton, activeMode === mode && styles.activeModeButton]}
                  onPress={() => setActiveMode(mode)}
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
                    source={{ uri: activeMode === 'edit' ? formData.avatar : addPetFormData.avatar }}
                    style={styles.avatar}
                  />
                  <TouchableOpacity style={styles.changePhotoButton} onPress={handleChangePhoto}>
                    <Text style={styles.changePhotoIcon}>📷</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.changePhotoText}>Tap to change photo</Text>
              </View>

              {activeMode === 'edit'
                ? renderFormSection(formData)
                : renderFormSection(addPetFormData, true)}
            </>
          )}
          {activeMode === 'remove' && renderPetsList()}

        </ScrollView>

        {(activeMode === 'edit' || activeMode === 'add') && (
          <TouchableOpacity
            style={styles.bottomSaveButton}
            onPress={handleBottomSave}
            disabled={isSaving || (activeMode === 'add' && !addPetFormData.name.trim())}
          >
            <Text style={styles.bottomSaveButtonText}>{isSaving ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  backgroundGradient: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  container: { flex: 1, backgroundColor: '#fff' }, flex: { flex: 1 },
  backgroundGradient: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: moderateScale(16), color: '#6b7280' },
  header: { paddingHorizontal: scale(20), paddingVertical: verticalScale(5) },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, 
  backButton: { fontSize: moderateScale(28), color: '#fff', fontWeight: '300' },
  headerTitle: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#fff' },
  saveButton: { fontSize: moderateScale(16), fontWeight: '600', color: '#fff' }, 
  saveButtonDisabled: { opacity: 0.6 },
  content: { flex: 1, paddingHorizontal: scale(20) },
  modeToggleSection: { marginVertical: verticalScale(16), alignItems: 'center' },
  modeToggleButtons: { flexDirection: 'row', backgroundColor: '#e5e7eb', borderRadius: scale(12), overflow: 'hidden' }, 
  modeButton: { flex: 1, paddingVertical: verticalScale(8), alignItems: 'center' }, 
  activeModeButton: { backgroundColor: '#2563EB' },
  modeButtonText: { fontSize: moderateScale(14), color: '#6b7280', fontWeight: '500' }, 
  activeModeButtonText: { color: '#fff' },
  avatarSection: { alignItems: 'center', paddingVertical: verticalScale(10) },
  avatarContainer: { position: 'relative' },
  avatar: { width: scale(100), height: scale(100), borderRadius: scale(50), borderWidth: scale(4), borderColor: '#fff' },
  changePhotoButton: { position: 'absolute', bottom: scale(4), right: scale(4), backgroundColor: '#2563EB', borderRadius: scale(18), width: scale(36), height: scale(36), alignItems: 'center', justifyContent: 'center' },
  changePhotoIcon: { fontSize: moderateScale(15) },
  changePhotoText: { fontSize: moderateScale(14), color: '#6b7280' },
  formSection: { marginBottom: verticalScale(24) },
  sectionTitle: { fontSize: moderateScale(16), fontWeight: '600', color: '#374151', marginBottom: verticalScale(12) },
  sectionCard: { backgroundColor: '#fff', borderRadius: scale(12), padding: moderateScale(16) },
  inputContainer: { marginBottom: verticalScale(12) },
  inputBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  inputLabel: { fontSize: moderateScale(14), fontWeight: '500', color: '#374151', marginBottom: verticalScale(8) },
  textInput: { fontSize: moderateScale(16), color: '#1f2937', paddingVertical: verticalScale(8), paddingHorizontal: scale(12), backgroundColor: '#f9fafb', borderRadius: scale(8), borderWidth: 1, borderColor: '#e5e7eb' },
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: moderateScale(16), color: '#6b7280' }
});

export default EditPetProfile;
