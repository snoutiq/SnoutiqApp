// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useEffect, useState } from 'react';
// import {
//   Alert,
//   Image,
//   KeyboardAvoidingView,
//   Platform,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View
// } from 'react-native';
// import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

// const EditPetProfile = ({ navigation, route }) => {
//   const { petIndex = null } = route.params || {};

//   const [formData, setFormData] = useState({
//     name: "",
//     breed: "",
//     gender: "",
//     age: "",
//     weight: "",
//     avatar: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop"
//   });

//   const [addPetFormData, setAddPetFormData] = useState({
//     name: "",
//     breed: "",
//     gender: "",
//     age: "",
//     weight: "",
//     avatar: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop"
//   });

//   const [isLoading, setIsLoading] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const [activeMode, setActiveMode] = useState('edit');
//   const [petsList, setPetsList] = useState([]);

//   useEffect(() => {
//     const fetchPetData = async () => {
//       try {
//         setIsLoading(true);
//         const userDataString = await AsyncStorage.getItem('userData');
//         if (!userDataString) return;

//         const userData = JSON.parse(userDataString);
//         const pets = Array.isArray(userData.pets) ? userData.pets : [];
//         setPetsList(pets);

//         if (petIndex !== null && pets[petIndex]) {
//           const selectedPet = pets[petIndex];
//           setFormData({
//             name: selectedPet.name || "",
//             breed: selectedPet.breed || "",
//             gender: selectedPet.gender || "",
//             age: selectedPet.age ? String(selectedPet.age) : "",
//             weight: selectedPet.weight || "",
//             avatar: selectedPet.avatar || "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop"
//           });
//         } else if (userData.pet_name) {
//           setFormData({
//             name: userData.pet_name,
//             breed: userData.pet_breed,
//             gender: userData.pet_gender || "",
//             age: userData.pet_age ? String(userData.pet_age) : "",
//             weight: userData.pet_weight || "",
//             avatar: userData.pet_avatar || "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop"
//           });
//         }
//       } catch (error) {
//         console.error('Error fetching pet data:', error);
//         Alert.alert("Error", "Failed to load pet data");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchPetData();
//   }, [petIndex]);

//   useEffect(() => {
//     if (activeMode === 'add') {
//       setAddPetFormData({
//         name: "",
//         breed: "",
//         gender: "",
//         age: "",
//         weight: "",
//         avatar: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop"
//       });
//     }
//   }, [activeMode]);

//   const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
//   const updateAddPetField = (field, value) => setAddPetFormData(prev => ({ ...prev, [field]: value }));

//   const handleSave = async () => {
//     try {
//       setIsSaving(true);
//       const userDataString = await AsyncStorage.getItem('userData');
//       if (!userDataString) return;

//       const userData = JSON.parse(userDataString);
//       const updatedPet = { ...formData, age: formData.age ? parseInt(formData.age) : null };

//       let updatedPets = [...petsList];
//       if (petIndex !== null && petsList[petIndex]) {
//         updatedPets[petIndex] = updatedPet;
//       } else {
//         updatedPets = [updatedPet];
//       }

//       const updatedUserData = { ...userData, pets: updatedPets };
//       await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
//       Alert.alert("Success", `${formData.name}'s profile has been updated!`);
//       navigation?.goBack();
//     } catch (error) {
//       console.error('Error saving pet data:', error);
//       Alert.alert("Error", "Failed to save pet data");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleAddPet = async () => {
//     if (!addPetFormData.name.trim()) return Alert.alert("Error", "Pet name is required");
//     try {
//       setIsSaving(true);
//       const userDataString = await AsyncStorage.getItem('userData');
//       if (!userDataString) return;

//       const userData = JSON.parse(userDataString);
//       const newPet = { ...addPetFormData, age: addPetFormData.age ? parseInt(addPetFormData.age) : null };
//       const updatedPets = [...petsList, newPet];

//       await AsyncStorage.setItem('userData', JSON.stringify({ ...userData, pets: updatedPets }));
//       setPetsList(updatedPets);
//       Alert.alert("Success", `${addPetFormData.name} has been added!`);

//       setAddPetFormData({
//         name: "",
//         breed: "",
//         gender: "",
//         age: "",
//         weight: "",
//         avatar: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop"
//       });
//     } catch (error) {
//       console.error('Error adding pet:', error);
//       Alert.alert("Error", "Failed to add pet");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleDeletePet = async (index) => {
//     Alert.alert(
//       "Delete Pet",
//       `Are you sure you want to delete ${petsList[index].name}?`,
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               const userDataString = await AsyncStorage.getItem('userData');
//               if (!userDataString) return;

//               const userData = JSON.parse(userDataString);
//               const updatedPets = [...petsList];
//               updatedPets.splice(index, 1);

//               await AsyncStorage.setItem('userData', JSON.stringify({ ...userData, pets: updatedPets }));
//               setPetsList(updatedPets);
//               Alert.alert("Success", "Pet deleted!");
//             } catch (error) {
//               console.error('Error deleting pet:', error);
//               Alert.alert("Error", "Failed to delete pet");
//             }
//           }
//         }
//       ]
//     );
//   };

//   const handleChangePhoto = () => {
//     Alert.alert(
//       "Change Pet Photo",
//       "Choose an option",
//       [
//         { text: "Camera", onPress: () => console.log("Open Camera") },
//         { text: "Gallery", onPress: () => console.log("Open Gallery") },
//         { text: "Cancel", style: "cancel" },
//       ]
//     );
//   };

//   if (isLoading) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <LinearGradient colors={['#dbeafe', '#e0e7ff']} style={styles.backgroundGradient} />
//         <View style={styles.loadingContainer}>
//           <Text style={styles.loadingText}>Loading pet data...</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   const renderFormSection = (data, isAddPet = false) => (
//     <View style={styles.formSection}>
//       <Text style={styles.sectionTitle}>Basic Information</Text>
//       <View style={styles.sectionCard}>
//         {["name", "breed", "gender", "age", "weight"].map((key, index) => (
//           <View key={key} style={[styles.inputContainer, index !== 4 && styles.inputBorder]}>
//             <Text style={styles.inputLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
//             <TextInput
//               style={styles.textInput}
//               value={isAddPet ? addPetFormData[key] : formData[key]}
//               onChangeText={v => isAddPet ? updateAddPetField(key, v) : updateField(key, v)}
//               placeholder={`Enter ${key}`}
//               keyboardType={key === 'age' || key === 'weight' ? 'numeric' : 'default'}
//             />
//           </View>
//         ))}
//       </View>
//     </View>
//   );

//   const renderPetsList = () => (
//     <View style={styles.petsListSection}>
//       <Text style={styles.sectionTitle}>Your Pets</Text>
//       {petsList.length ? petsList.map((pet, i) => (
//         <View key={i} style={styles.petListItem}>
//           <Image source={{ uri: pet.avatar }} style={styles.petListImage} />
//           <View style={styles.petListInfo}>
//             <Text style={styles.petListName}>{pet.name}</Text>
//             <Text style={styles.petListDetails}>{pet.breed} • {pet.age} years</Text>
//           </View>
//           <TouchableOpacity style={styles.deletePetButton} onPress={() => handleDeletePet(i)}>
//             <Text style={styles.deletePetButtonText}>🗑️</Text>
//           </TouchableOpacity>
//         </View>
//       )) : <Text style={styles.noPetsText}>You don't have any pets yet.</Text>}
//     </View>
//   );

//   const handleBottomSave = () => {
//     if (activeMode === 'edit') handleSave();
//     else if (activeMode === 'add') handleAddPet();
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <LinearGradient colors={['#dbeafe', '#e0e7ff']} style={styles.backgroundGradient} />
//       {/* Header */}
//       <LinearGradient colors={['#2563EB', '#3b82f6']} style={styles.header}>
//         <View style={styles.headerContent}>
//           <TouchableOpacity onPress={() => navigation?.goBack()}>
//             <Text style={styles.backButton}>‹</Text>
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>
//             {activeMode === 'edit' ? 'Edit Pet' : activeMode === 'add' ? 'Add Pet' : 'Remove Pet'}
//           </Text>
//           <TouchableOpacity onPress={activeMode === 'edit' ? handleSave : activeMode === 'add' ? handleAddPet : () => { }} disabled={isSaving || (activeMode === 'add' && !addPetFormData.name.trim())} >
//             <Text style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}>
//               {isSaving ? 'Saving...' : activeMode === 'remove' ? 'Done' : 'Save'}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </LinearGradient>
//       <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.flex}>
//         <ScrollView style={styles.content}
//           showsVerticalScrollIndicator={false}>
//           {/* Mode Toggle */}
//           <View style={styles.modeToggleSection}>
//             <View style={styles.modeToggleButtons}>
//               {['edit', 'add', 'remove'].map(mode => (
//                 <TouchableOpacity
//                   key={mode}
//                   style={[styles.modeButton, activeMode === mode && styles.activeModeButton]}
//                   onPress={() => setActiveMode(mode)}
//                 >
//                   <Text style={[styles.modeButtonText, activeMode === mode && styles.activeModeButtonText]}>
//                     {mode.charAt(0).toUpperCase() + mode.slice(1)}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </View>

//           {/* Content based on mode */}
//           {(activeMode === 'edit' || activeMode === 'add') && (
//             <>
//               <View style={styles.avatarSection}>
//                 <View style={styles.avatarContainer}>
//                   <Image
//                     source={{ uri: activeMode === 'edit' ? formData.avatar : addPetFormData.avatar }}
//                     style={styles.avatar}
//                   />
//                   <TouchableOpacity style={styles.changePhotoButton} onPress={handleChangePhoto}>
//                     <Text style={styles.changePhotoIcon}>📷</Text>
//                   </TouchableOpacity>
//                 </View>
//                 <Text style={styles.changePhotoText}>Tap to change photo</Text>
//               </View>

//               {activeMode === 'edit'
//                 ? renderFormSection(formData)
//                 : renderFormSection(addPetFormData, true)}
//             </>
//           )}
//           {activeMode === 'remove' && renderPetsList()}

//         </ScrollView>

//         {(activeMode === 'edit' || activeMode === 'add') && (
//           <TouchableOpacity
//             style={styles.bottomSaveButton}
//             onPress={handleBottomSave}
//             disabled={isSaving || (activeMode === 'add' && !addPetFormData.name.trim())}
//           >
//             <Text style={styles.bottomSaveButtonText}>{isSaving ? 'Saving...' : 'Save'}</Text>
//           </TouchableOpacity>
//         )}
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#fff' },
//   flex: { flex: 1 },
//   backgroundGradient: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
//   container: { flex: 1, backgroundColor: '#fff' }, flex: { flex: 1 },
//   backgroundGradient: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   loadingText: { fontSize: moderateScale(16), color: '#6b7280' },
//   header: { paddingHorizontal: scale(20), paddingVertical: verticalScale(5) },
//   headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, 
//   backButton: { fontSize: moderateScale(28), color: '#fff', fontWeight: '300' },
//   headerTitle: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#fff' },
//   saveButton: { fontSize: moderateScale(16), fontWeight: '600', color: '#fff' }, 
//   saveButtonDisabled: { opacity: 0.6 },
//   content: { flex: 1, paddingHorizontal: scale(20) },
//   modeToggleSection: { marginVertical: verticalScale(16), alignItems: 'center' },
//   modeToggleButtons: { flexDirection: 'row', backgroundColor: '#e5e7eb', borderRadius: scale(12), overflow: 'hidden' }, 
//   modeButton: { flex: 1, paddingVertical: verticalScale(8), alignItems: 'center' }, 
//   activeModeButton: { backgroundColor: '#2563EB' },
//   modeButtonText: { fontSize: moderateScale(14), color: '#6b7280', fontWeight: '500' }, 
//   activeModeButtonText: { color: '#fff' },
//   avatarSection: { alignItems: 'center', paddingVertical: verticalScale(10) },
//   avatarContainer: { position: 'relative' },
//   avatar: { width: scale(100), height: scale(100), borderRadius: scale(50), borderWidth: scale(4), borderColor: '#fff' },
//   changePhotoButton: { position: 'absolute', bottom: scale(4), right: scale(4), backgroundColor: '#2563EB', borderRadius: scale(18), width: scale(36), height: scale(36), alignItems: 'center', justifyContent: 'center' },
//   changePhotoIcon: { fontSize: moderateScale(15) },
//   changePhotoText: { fontSize: moderateScale(14), color: '#6b7280' },
//   formSection: { marginBottom: verticalScale(24) },
//   sectionTitle: { fontSize: moderateScale(16), fontWeight: '600', color: '#374151', marginBottom: verticalScale(12) },
//   sectionCard: { backgroundColor: '#fff', borderRadius: scale(12), padding: moderateScale(16) },
//   inputContainer: { marginBottom: verticalScale(12) },
//   inputBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
//   inputLabel: { fontSize: moderateScale(14), fontWeight: '500', color: '#374151', marginBottom: verticalScale(8) },
//   textInput: { fontSize: moderateScale(16), color: '#1f2937', paddingVertical: verticalScale(8), paddingHorizontal: scale(12), backgroundColor: '#f9fafb', borderRadius: scale(8), borderWidth: 1, borderColor: '#e5e7eb' },
//   bottomSaveButton: { width: "70%", alignSelf: "center", backgroundColor: '#2563EB', borderRadius: scale(12), paddingVertical: verticalScale(15), alignItems: 'center' },
//   bottomSaveButtonText: { color: '#fff', fontSize: moderateScale(16), fontWeight: '600' },
//   petsListSection: { marginVertical: verticalScale(16) },
//   petListItem: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(12), backgroundColor: '#fff', padding: scale(12), borderRadius: scale(12), shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
//   petListImage: { width: scale(60), height: scale(60), borderRadius: scale(30) },
//   petListInfo: { flex: 1, marginLeft: scale(12) },
//   petListName: { fontSize: moderateScale(16), fontWeight: '600', color: '#111827' },
//   petListDetails: { fontSize: moderateScale(12), color: '#6b7280' },
//   deletePetButton: { padding: scale(8) },
//   deletePetButtonText: { fontSize: moderateScale(16), color: '#dc2626' },
//   noPetsText: { textAlign: 'center', color: '#6b7280', fontSize: moderateScale(14), marginTop: verticalScale(20) },
//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   loadingText: { fontSize: moderateScale(16), color: '#6b7280' }
// });

// export default EditPetProfile;

import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const { petIndex = null } = route.params || {};

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

  useEffect(() => {
    fetchDogBreeds();
  }, []);

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
            petType: selectedPet.petType || "",
            petGender: selectedPet.petGender || "",
            breed: selectedPet.breed || "",
            age: selectedPet.age ? String(selectedPet.age) : "",
            weight: selectedPet.weight || "",
            avatar: selectedPet.avatar || "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop"
          });
        } else if (userData.pet_name) {
          setFormData({
            name: userData.pet_name,
            petType: userData.pet_type || "",
            petGender: userData.pet_gender || "",
            breed: userData.pet_breed || "",
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

  const fetchDogBreeds = async (retryCount = 3, delay = 1000) => {
    console.log('🚀 Starting fetchDogBreeds...');
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

  const handleSave = async () => {
    if (!validate(formData)) {
      Alert.alert("Validation Error", "Please fix the errors.");
      return;
    }

    try {
      setIsSaving(true);
      const userDataString = await AsyncStorage.getItem('userData');
      if (!userDataString) return;

      const userData = JSON.parse(userDataString);
      const updatedPet = { 
        ...formData, 
        age: formData.age ? parseFloat(formData.age) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null 
      };

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
    if (!validate(addPetFormData)) {
      Alert.alert("Validation Error", "Please fix the errors.");
      return;
    }

    try {
      setIsSaving(true);
      const userDataString = await AsyncStorage.getItem('userData');
      if (!userDataString) return;

      const userData = JSON.parse(userDataString);
      const newPet = { 
        ...addPetFormData, 
        age: addPetFormData.age ? parseFloat(addPetFormData.age) : null,
        weight: addPetFormData.weight ? parseFloat(addPetFormData.weight) : null 
      };
      const updatedPets = [...petsList, newPet];

      await AsyncStorage.setItem('userData', JSON.stringify({ ...userData, pets: updatedPets }));
      setPetsList(updatedPets);
      Alert.alert("Success", `${addPetFormData.name} has been added!`);

      setAddPetFormData({
        name: "",
        petType: "",
        petGender: "",
        breed: "",
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