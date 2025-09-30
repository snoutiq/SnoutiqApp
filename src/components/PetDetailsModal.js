import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const PetDetailsModal = ({ visible, onComplete, updateUser, token, user }) => {
  const [petDetails, setPetDetails] = useState({
    pet_name: user?.pet_name || '',
    pet_gender: user?.pet_gender || '',
    breed: user?.breed || '',
    pet_age: user?.pet_age?.toString() || '',
    pet_weight: user?.pet_weight?.toString() || '',
  });

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const stepProgressAnim = useRef(new Animated.Value(0)).current;

  const steps = [
    {
      title: "What's your pet's name?",
      subtitle: "Let's start with the basics",
      field: 'pet_name',
      placeholder: 'Enter pet name',
      icon: 'paw',
      keyboardType: 'default',
    },
    {
      title: "What's your pet's gender?",
      subtitle: "This helps us provide better care advice",
      field: 'pet_gender',
      options: ['Male', 'Female'],
      icon: 'heart',
    },
    {
      title: "What breed is your pet?",
      subtitle: "Tell us about your pet's breed",
      field: 'breed',
      placeholder: 'e.g., Golden Retriever, Persian Cat',
      icon: 'library',
      keyboardType: 'default',
    },
    {
      title: "How old is your pet?",
      subtitle: "Age in years",
      field: 'pet_age',
      placeholder: 'Enter age',
      icon: 'time',
      keyboardType: 'numeric',
    },
    {
      title: "What's your pet's weight?",
      subtitle: "Weight in kilograms (optional)",
      field: 'pet_weight',
      placeholder: 'Enter weight',
      icon: 'fitness',
      keyboardType: 'numeric',
      optional: true,
    }
  ];

  React.useEffect(() => {
    if (visible) {
      // Entrance animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        })
      ]).start();
      
      updateProgressAnimation();
    } else {
      // Reset animations
      slideAnim.setValue(height);
      fadeAnim.setValue(0);
      stepProgressAnim.setValue(0);
    }
  }, [visible, currentStep]);

  const updateProgressAnimation = () => {
    Animated.timing(stepProgressAnim, {
      toValue: (currentStep + 1) / steps.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleNext = () => {
    const currentStepData = steps[currentStep];
    const value = petDetails[currentStepData.field];

    // Validation
    if (!currentStepData.optional && (!value || value.trim() === '')) {
      Alert.alert('Required Field', `Please enter your pet's ${currentStepData.title.toLowerCase()}`);
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const response = await axios.post(
        'https://snoutiq.com/backend/api/update-pet-details',
        {
          user_id: user.id,
          ...petDetails,
          pet_age: parseInt(petDetails.pet_age) || 0,
          pet_weight: parseFloat(petDetails.pet_weight) || null,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // Update user data
        updateUser({ ...user, ...petDetails });
        Alert.alert('Success', 'Pet details updated successfully!', [
          { text: 'OK', onPress: onComplete }
        ]);
      } else {
        throw new Error('Failed to update pet details');
      }
    } catch (error) {
      console.error('Error updating pet details:', error);
      Alert.alert('Error', 'Failed to update pet details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updatePetDetail = (field, value) => {
    setPetDetails(prev => ({ ...prev, [field]: value }));
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    if (step.options) {
      // Render options for selection
      return (
        <View style={styles.optionsContainer}>
          {step.options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                petDetails[step.field] === option && styles.optionButtonSelected
              ]}
              onPress={() => updatePetDetail(step.field, option)}
            >
              <LinearGradient
                colors={
                  petDetails[step.field] === option
                    ? ['#3B82F6', '#1D4ED8']
                    : ['#F9FAFB', '#F3F4F6']
                }
                style={styles.optionGradient}
              >
                <Text
                  style={[
                    styles.optionText,
                    petDetails[step.field] === option && styles.optionTextSelected
                  ]}
                >
                  {option}
                </Text>
                {petDetails[step.field] === option && (
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                )}
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    // Render text input
    return (
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder={step.placeholder}
          placeholderTextColor="#9CA3AF"
          value={petDetails[step.field]}
          onChangeText={(value) => updatePetDetail(step.field, value)}
          keyboardType={step.keyboardType || 'default'}
          autoFocus={true}
          maxLength={step.field === 'pet_name' ? 50 : 100}
        />
        {step.field === 'pet_name' && petDetails.pet_name && (
          <View style={styles.inputIcon}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      statusBarTranslucent={true}
    >
      <BlurView intensity={50} tint="dark" style={styles.overlay}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Animated.View
            style={[
              styles.modalContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.headerGradient}>
                <View style={styles.headerContent}>
                  <View style={styles.headerLeft}>
                    <View style={styles.iconContainer}>
                      <Ionicons name={steps[currentStep].icon} size={24} color="#FFFFFF" />
                    </View>
                    <View>
                      <Text style={styles.stepCounter}>
                        Step {currentStep + 1} of {steps.length}
                      </Text>
                      <Text style={styles.headerTitle}>Pet Details</Text>
                    </View>
                  </View>
                </View>
                
                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground} />
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: stepProgressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        })
                      }
                    ]}
                  />
                </View>
              </LinearGradient>
            </View>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
                <Text style={styles.stepSubtitle}>{steps[currentStep].subtitle}</Text>
                
                {steps[currentStep].optional && (
                  <View style={styles.optionalBadge}>
                    <Text style={styles.optionalText}>Optional</Text>
                  </View>
                )}

                {renderStepContent()}
              </View>
            </ScrollView>

            {/* Navigation */}
            <View style={styles.navigation}>
              <TouchableOpacity
                style={[
                  styles.navButton,
                  styles.prevButton,
                  currentStep === 0 && styles.navButtonDisabled
                ]}
                onPress={handlePrevious}
                disabled={currentStep === 0}
              >
                <Ionicons 
                  name="chevron-back" 
                  size={20} 
                  color={currentStep === 0 ? '#D1D5DB' : '#6B7280'} 
                />
                <Text style={[
                  styles.navButtonText,
                  currentStep === 0 && styles.navButtonTextDisabled
                ]}>
                  Previous
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.navButton, styles.nextButton]}
                onPress={handleNext}
                disabled={loading}
              >
                <LinearGradient colors={['#3B82F6', '#1D4ED8']} style={styles.nextButtonGradient}>
                  {loading ? (
                    <>
                      <ActivityIndicator color="#FFFFFF" size="small" />
                      <Text style={styles.nextButtonText}>Saving...</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.nextButtonText}>
                        {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                      </Text>
                      <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
  },
  modalContainer: {
    width: '100%',
    maxWidth: moderateScale(400),
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    maxHeight: '85%',
  },
  header: {
    overflow: 'hidden',
  },
  headerGradient: {
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(16),
  },
  headerContent: {
    paddingHorizontal: moderateScale(20),
    marginBottom: verticalScale(12),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(12),
  },
  stepCounter: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: moderateScale(12),
    fontWeight: '500',
    marginBottom: moderateScale(2),
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: moderateScale(18),
    fontWeight: '600',
  },
  progressBarContainer: {
    height: moderateScale(4),
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: moderateScale(20),
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: moderateScale(24),
  },
  stepTitle: {
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: moderateScale(8),
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: moderateScale(24),
    lineHeight: moderateScale(20),
  },
  optionalBadge: {
    alignSelf: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
    borderRadius: 12,
    marginBottom: moderateScale(16),
  },
  optionalText: {
    fontSize: moderateScale(10),
    color: '#92400E',
    fontWeight: '600',
  },
  inputContainer: {
    position: 'relative',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(16),
    fontSize: moderateScale(16),
    color: '#1F2937',
    textAlign: 'center',
  },
  inputIcon: {
    position: 'absolute',
    right: moderateScale(12),
    top: '50%',
    marginTop: moderateScale(-10),
  },
  optionsContainer: {
    gap: moderateScale(12),
  },
  optionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    borderColor: '#3B82F6',
  },
  optionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateScale(16),
    paddingHorizontal: moderateScale(20),
    gap: moderateScale(8),
  },
  optionText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#6B7280',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(16),
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FAFAFA',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(16),
    borderRadius: 10,
    gap: moderateScale(4),
  },
  prevButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#6B7280',
  },
  navButtonTextDisabled: {
    color: '#D1D5DB',
  },
  nextButton: {
    overflow: 'hidden',
    minWidth: moderateScale(100),
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(16),
    gap: moderateScale(4),
  },
  nextButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default PetDetailsModal;