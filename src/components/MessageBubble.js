import React, {
  useState,
  useEffect,
  useRef,
  memo,
  useContext,
  useCallback,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale, verticalScale, scale } from "react-native-size-matters";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { socket } from "../context/Socket";
import DoctorAppointmentModal from "./DoctorAppointmentModal";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import LiveDoctorSelectionModal from "./LiveDoctorSelectionModal";

const { width, height } = Dimensions.get("window");

// Enhanced responsive constants
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

// Enhanced DoctorSearchModal with better UX
const DoctorSearchModal = memo(({ visible, onClose, onFailure, searchTime = 30000 }) => {
  const [dots, setDots] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const timeRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setElapsedTime(0);
      fadeAnim.setValue(0);
      progressAnim.setValue(0);
      rippleAnim.setValue(0);

      // Start timer
      timeRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      const ripple = Animated.loop(
        Animated.sequence([
          Animated.timing(rippleAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(rippleAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
      ripple.start();

      Animated.timing(progressAnim, {
        toValue: 1,
        duration: searchTime,
        useNativeDriver: false,
      }).start();

      const interval = setInterval(() => {
        setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
      }, 500);

      return () => {
        pulse.stop();
        ripple.stop();
        clearInterval(interval);
        if (timeRef.current) {
          clearInterval(timeRef.current);
        }
      };
    } else {
      setDots("");
      setElapsedTime(0);
    }
  }, [visible, searchTime]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.5],
  });

  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 0.3, 0],
  });

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <BlurView intensity={95} tint="dark" style={styles.modalOverlay}>
        <Animated.View style={[styles.modalContent, { opacity: fadeAnim }]}>
          <Animated.View
            style={[
              styles.rippleCircle,
              {
                transform: [{ scale: rippleScale }],
                opacity: rippleOpacity,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.rippleCircle,
              styles.rippleCircle2,
              {
                transform: [{ scale: rippleScale }],
                opacity: rippleOpacity,
              },
            ]}
          />

          <Animated.View
            style={[
              styles.searchIconContainer,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <LinearGradient
              colors={["#7C3AED", "#EC4899"]}
              style={styles.searchIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="search" size={scale(40)} color="#FFFFFF" />
            </LinearGradient>

            <Animated.View
              style={[
                styles.searchIconBorder,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
          </Animated.View>

          <Text style={styles.modalTitle}>
            Searching for Veterinarians{dots}
          </Text>
          <Text style={styles.modalSubtitle}>
            Finding the best available doctors near you
          </Text>

          {/* Time elapsed indicator */}
          <View style={styles.timeIndicator}>
            <Ionicons name="time-outline" size={scale(16)} color="#7C3AED" />
            <Text style={styles.timeText}>
              {formatTime(elapsedTime)}
            </Text>
          </View>

          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[styles.progressBar, { width: progressWidth }]}
            >
              <LinearGradient
                colors={["#7C3AED", "#EC4899"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.progressGradient}
              />
            </Animated.View>
          </View>

          <ScrollView style={styles.searchingIndicators} showsVerticalScrollIndicator={false}>
            <View style={styles.indicatorRow}>
              <View style={styles.indicatorIconContainer}>
                <Ionicons name="location" size={scale(16)} color="#7C3AED" />
              </View>
              <View style={styles.indicatorContent}>
                <Text style={styles.indicatorTitle}>Location Services</Text>
                <Text style={styles.indicatorSubtext}>
                  Scanning nearby clinics
                </Text>
              </View>
              <ActivityIndicator size="small" color="#7C3AED" />
            </View>

            <View style={styles.indicatorRow}>
              <View style={styles.indicatorIconContainer}>
                <Ionicons name="wifi" size={scale(16)} color="#10B981" />
              </View>
              <View style={styles.indicatorContent}>
                <Text style={styles.indicatorTitle}>Network Status</Text>
                <Text style={styles.indicatorSubtext}>
                  Connected to servers
                </Text>
              </View>
              <Ionicons name="checkmark-circle" size={scale(20)} color="#10B981" />
            </View>

            <View style={styles.indicatorRow}>
              <View style={styles.indicatorIconContainer}>
                <Ionicons name="people" size={scale(16)} color="#F59E0B" />
              </View>
              <View style={styles.indicatorContent}>
                <Text style={styles.indicatorTitle}>Doctor Availability</Text>
                <Text style={styles.indicatorSubtext}>
                  {elapsedTime > 10 ? "Expanding search radius" : "Checking schedules"}
                </Text>
              </View>
              <Text style={styles.searchingText}>...</Text>
            </View>

            {elapsedTime > 15 && (
              <View style={[styles.indicatorRow, styles.extendedSearchRow]}>
                <View style={styles.indicatorIconContainer}>
                  <Ionicons name="expand" size={scale(16)} color="#8B5CF6" />
                </View>
                <View style={styles.indicatorContent}>
                  <Text style={styles.indicatorTitle}>Extended Search</Text>
                  <Text style={styles.indicatorSubtext}>
                    Looking for available veterinarians in wider area
                  </Text>
                </View>
                <ActivityIndicator size="small" color="#8B5CF6" />
              </View>
            )}
          </ScrollView>

          <View style={styles.timerContainer}>
            <Ionicons name="information-circle" size={scale(13)} color="#9CA3AF" />
            <Text style={styles.timerText}>
              Typically connects within 15-30 seconds
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.cancelButton, styles.secondaryButton]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.cancelButton, styles.primaryButton]}
              onPress={() => {
                onClose();
                onFailure?.();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.primaryButtonText}>Try Alternative</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </BlurView>
    </Modal>
  );
});

// Enhanced StartCallButton with better error handling and UX
const StartCallButton = memo(({ navigation, onShowLiveDoctors }) => {
  const [loading, setLoading] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [callStatus, setCallStatus] = useState(null);
  const { user, token, updateNearbyDoctors, liveDoctors } = useContext(AuthContext);
  const patientId = user?.id || "101";
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef(null);
  const { updateUser } = useContext(AuthContext);
  const [nearbyDoctors, setNearbyDoctors] = useState([]);
  const [showLiveDoctorsModal, setShowLiveDoctorsModal] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('idle'); // 'idle', 'connecting', 'connected', 'failed'

  // Enhanced doctor fetching with error handling
  const fetchNearbyDoctors = useCallback(async () => {
    if (!token || !user?.id) {
      console.warn("No token or user ID available");
      return;
    }

    try {
      setConnectionStatus('connecting');
      const response = await axios.get(
        `https://snoutiq.com/backend/api/nearby-vets?user_id=${user.id}`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000 // 10 second timeout
        }
      );

      if (response.data && Array.isArray(response.data.data)) {
        updateNearbyDoctors(response.data.data);
        setNearbyDoctors(response.data.data);
        setConnectionStatus(response.data.data.length > 0 ? 'connected' : 'no_doctors');
      } else {
        setConnectionStatus('no_doctors');
      }
    } catch (error) {
      console.error("Failed to fetch nearby doctors:", error);
      setConnectionStatus('failed');
      
      // Show user-friendly error
      if (error.code === 'NETWORK_ERROR') {
        Alert.alert(
          "Connection Error",
          "Unable to connect to the server. Please check your internet connection.",
          [{ text: "OK" }]
        );
      }
    }
  }, [token, user?.id, updateNearbyDoctors]);

  useEffect(() => {
    if (!token || !user?.id) return;

    const fetchData = async () => {
      await fetchNearbyDoctors();
    };

    fetchData();
    const interval = setInterval(fetchData, 2 * 60 * 1000); // Reduced to 2 minutes for better UX

    return () => clearInterval(interval);
  }, [token, user?.id, fetchNearbyDoctors]);

  // Enhanced socket listeners with better error handling
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("get-active-doctors");

    const handleCallSent = (data) => {
      setCallStatus({ type: "sent", ...data });
      setConnectionStatus('connecting');
    };

    const handleCallAccepted = (data) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      setCallStatus({ type: "accepted", ...data });
      setLoading(false);
      setShowSearchModal(false);
      setConnectionStatus('connected');

      const doctor = (nearbyDoctors || []).find((d) => d.id == data.doctorId) ||
        (liveDoctors || []).find((d) => d.id == data.doctorId);

      const patientIdLocal = user?.id || "101";

      // Small delay for smooth UI transition
      setTimeout(() => {
        if (data.requiresPayment) {
          navigation.navigate("PaymentScreen", {
            doctor,
            channel: data.channel,
            patientId: patientIdLocal,
            callId: data.callId,
            role: "audience",
            uid: patientIdLocal,
            onPaymentSuccess: () => {
              navigation.navigate("VideoCallScreen", {
                doctor,
                channel: data.channel,
                patientId: patientIdLocal,
                callId: data.callId,
                role: "audience",
                uid: patientIdLocal,
              });
              setCallStatus(null);
            },
          });
        } else {
          navigation.navigate("VideoCallScreen", {
            doctor,
            channel: data.channel,
            patientId: patientIdLocal,
            callId: data.callId,
            role: "audience",
            uid: patientIdLocal,
          });
          setCallStatus(null);
        }
      }, 600);
    };

    const handleCallRejected = (data) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      setCallStatus({ type: "rejected", ...data });
      setLoading(false);
      setShowSearchModal(false);
      setConnectionStatus('failed');

      Alert.alert(
        "Call Not Available",
        "The veterinarian is currently unavailable. Would you like to try another doctor or schedule a clinic visit?",
        [
          { 
            text: "Try Another", 
            onPress: () => {
              setCallStatus(null);
              setShowLiveDoctorsModal(true);
            } 
          },
          { 
            text: "Book Clinic", 
            style: "default",
            onPress: () => navigation.navigate("BookClinicVisit") 
          },
          { 
            text: "Cancel", 
            style: "cancel" 
          },
        ],
        { cancelable: true }
      );
    };

    const handleSocketError = (error) => {
      console.error("Socket error:", error);
      setConnectionStatus('failed');
    };

    socket.on("call-sent", handleCallSent);
    socket.on("call-accepted", handleCallAccepted);
    socket.on("call-rejected", handleCallRejected);
    socket.on("error", handleSocketError);
    socket.on("connect_error", handleSocketError);

    return () => {
      socket.off("call-sent", handleCallSent);
      socket.off("call-accepted", handleCallAccepted);
      socket.off("call-rejected", handleCallRejected);
      socket.off("error", handleSocketError);
      socket.off("connect_error", handleSocketError);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [nearbyDoctors, liveDoctors, navigation, user]);

  const handleNoResponse = useCallback(() => {
    setLoading(false);
    setShowSearchModal(false);
    setConnectionStatus('failed');

    Alert.alert(
      "No Immediate Response",
      "All veterinarians are currently busy. You can try again or book a clinic appointment for guaranteed care.",
      [
        {
          text: "Try Again",
          style: "default",
          onPress: () => {
            setCallStatus(null);
            setConnectionStatus('idle');
          },
        },
        {
          text: "Book Appointment",
          style: "default",
          onPress: () => navigation.navigate("BookClinicVisit"),
        },
        {
          text: "See Available Doctors",
          onPress: () => setShowLiveDoctorsModal(true),
        },
      ],
      { cancelable: true }
    );
  }, [navigation]);

  const handleCallDoctor = useCallback((doctor) => {
    const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const channel = `channel_${callId}`;
    const patientIdLocal = user?.id || "101";

    socket.emit("call-requested", {
      doctorId: doctor.id,
      patientId: patientIdLocal,
      channel,
      callId,
      timestamp: new Date().toISOString(),
    });

    setShowLiveDoctorsModal(false);
    setShowSearchModal(true);
    setLoading(true);
    setConnectionStatus('connecting');

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (loading && !callStatus) {
        handleNoResponse();
      }
    }, 30000);
  }, [user?.id, loading, callStatus, handleNoResponse]);

  const startCall = useCallback(() => {
    const doctorsToCall = nearbyDoctors && nearbyDoctors.length ? nearbyDoctors : [];

    if (!doctorsToCall.length) {
      Alert.alert(
        "No Doctors Available",
        "There are no nearby veterinarians available at the moment. Please try again later or book a clinic appointment.",
        [
          { 
            text: "Book Appointment", 
            onPress: () => navigation.navigate("BookClinicVisit") 
          },
          { 
            text: "OK", 
            style: "cancel" 
          },
        ]
      );
      return;
    }

    // Enhanced button animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    setLoading(true);
    setShowSearchModal(true);
    setConnectionStatus('connecting');

    const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const channel = `channel_${callId}`;

    // Enhanced error handling for socket emissions
    try {
      doctorsToCall.forEach((doc) => {
        socket.emit("call-requested", {
          doctorId: doc.id,
          patientId,
          channel,
          callId,
          timestamp: new Date().toISOString(),
        });
      });
    } catch (error) {
      console.error("Error sending call requests:", error);
      handleNoResponse();
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (loading && !callStatus) {
        handleNoResponse();
      }
    }, 30000);
  }, [nearbyDoctors, patientId, loading, callStatus, handleNoResponse, scaleAnim, navigation]);

  const getButtonState = () => {
    if (loading) return 'loading';
    if (connectionStatus === 'no_doctors' || connectionStatus === 'failed') return 'unavailable';
    if (!nearbyDoctors?.length && !liveDoctors?.length) return 'unavailable';
    return 'available';
  };

  const buttonState = getButtonState();
  const buttonDisabled = buttonState === 'unavailable' || buttonState === 'loading';

  const getButtonText = () => {
    switch (buttonState) {
      case 'loading':
        return 'Searching for Doctors...';
      case 'unavailable':
        return 'No Doctors Available';
      default:
        return 'Start Video Consultation';
    }
  };

  const getButtonIcon = () => {
    switch (buttonState) {
      case 'loading':
        return <ActivityIndicator size="small" color="#fff" />;
      case 'unavailable':
        return <Ionicons name="videocam-off" size={scale(20)} color="#fff" />;
      default:
        return (
          <View style={styles.iconContainer}>
            <Ionicons name="videocam" size={scale(19)} color="#fff" />
          </View>
        );
    }
  };

  return (
    <>
      <View style={styles.callButtonWrapper}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[
              styles.callButton,
              buttonDisabled && styles.callButtonDisabled,
              buttonState === 'loading' && styles.callButtonLoading,
            ]}
            activeOpacity={0.85}
            onPress={() => {
              if (liveDoctors && liveDoctors.length) {
                setShowLiveDoctorsModal(true);
              } else {
                startCall();
              }
            }}
            disabled={buttonDisabled}
          >
            {!buttonDisabled && buttonState !== 'loading' && (
              <Animated.View
                style={[styles.glowEffect]}
              />
            )}

            <LinearGradient
              colors={
                buttonState === 'loading' ? ["#9CA3AF", "#6B7280"] :
                buttonState === 'unavailable' ? ["#9CA3AF", "#6B7280"] : 
                ["#7C3AED", "#EC4899"]
              }
              style={styles.callButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.buttonContent}>
                {getButtonIcon()}
                <Text style={styles.callButtonText}>
                  {getButtonText()}
                </Text>
                {buttonState === 'available' && (
                  <Ionicons name="arrow-forward" size={scale(16)} color="#fff" />
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {buttonState === 'available' && (
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark" size={scale(13)} color="#10B981" />
            <Text style={styles.infoText}>
              Licensed veterinarians • Instant connection • Secure call
            </Text>
          </View>
        )}

        {buttonState === 'unavailable' && connectionStatus !== 'failed' && (
          <View style={styles.infoRow}>
            <Ionicons name="information-circle" size={scale(13)} color="#F59E0B" />
            <Text style={[styles.infoText, styles.warningText]}>
              Check back soon or book a clinic appointment
            </Text>
          </View>
        )}

        {connectionStatus === 'failed' && (
          <View style={styles.infoRow}>
            <Ionicons name="warning" size={scale(13)} color="#EF4444" />
            <Text style={[styles.infoText, styles.errorText]}>
              Connection issue • Tap to retry
            </Text>
          </View>
        )}
      </View>

      <LiveDoctorSelectionModal
        visible={showLiveDoctorsModal}
        onClose={() => setShowLiveDoctorsModal(false)}
        liveDoctors={liveDoctors}
        onCallDoctor={handleCallDoctor}
        loading={loading}
      />

      <DoctorSearchModal
        visible={showSearchModal}
        onClose={() => {
          setShowSearchModal(false);
          setLoading(false);
          setConnectionStatus('idle');
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        }}
        onFailure={handleNoResponse}
      />
    </>
  );
});

// Enhanced EmergencyStatusBox with better animations and UX
const EmergencyStatusBox = memo(
  ({ decision, nearbyDoctors, navigation, messageId, isTypingComplete }) => {
    const slideAnim = useRef(new Animated.Value(50)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);
    const [showLiveDoctorsModal, setShowLiveDoctorsModal] = useState(false);

    useEffect(() => {
      if (decision && isTypingComplete) {
        const timer = setTimeout(() => {
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
              toValue: 0,
              tension: 60,
              friction: 8,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              tension: 60,
              friction: 8,
              useNativeDriver: true,
            }),
          ]).start();
        }, 400); // Slightly longer delay for better UX

        return () => clearTimeout(timer);
      }
    }, [decision, isTypingComplete]);

    if (!decision || !isTypingComplete) return null;

    // Enhanced emergency card
    if (decision.includes("EMERGENCY")) {
      return (
        <>
          <Animated.View
            style={[
              styles.actionContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            <View style={[styles.actionCard, styles.emergencyCard]}>
              <LinearGradient
                colors={["#FEF2F2", "#FEE2E2", "#FECACA"]}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.actionHeader}>
                  <View style={styles.actionIconWrapper}>
                    <Animated.View
                      style={[
                        styles.pulsatingIcon,
                        {
                          transform: [{ scale: scaleAnim }]
                        }
                      ]}
                    >
                      <LinearGradient
                        colors={["#EF4444", "#DC2626"]}
                        style={styles.actionIcon}
                      >
                        <Ionicons name="warning" size={scale(24)} color="#FFFFFF" />
                      </LinearGradient>
                    </Animated.View>
                  </View>
                  <View style={styles.actionHeaderText}>
                    <View style={styles.urgentBadge}>
                      <View style={styles.pulseDot} />
                      <Text style={styles.urgentBadgeText}>URGENT CARE NEEDED</Text>
                    </View>
                    <Text style={styles.actionTitle}>
                      Emergency Care Required
                    </Text>
                    <Text style={styles.actionSubtitle}>
                      Immediate veterinary attention recommended
                    </Text>
                  </View>
                </View>

                <View style={styles.warningBox}>
                  <Ionicons name="alert-circle" size={scale(18)} color="#DC2626" />
                  <Text style={styles.actionText}>
                    Based on the symptoms described, your pet requires immediate medical attention. Please contact a veterinarian right away.
                  </Text>
                </View>

                <View style={styles.emergencyActions}>
                  <TouchableOpacity
                    style={[styles.primaryButton, styles.emergencyButton]}
                    onPress={() => setShowAppointmentModal(true)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={["#EF4444", "#DC2626"]}
                      style={styles.buttonGradient}
                    >
                      <Ionicons name="business" size={scale(17)} color="#FFFFFF" />
                      <Text style={styles.buttonText}>Find Emergency Clinic</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.secondaryButton, styles.emergencySecondaryButton]}
                    onPress={() => {
                      // Direct emergency call functionality
                      Alert.alert(
                        "Emergency Contact",
                        "Would you like to see nearby emergency clinics or contact a veterinarian immediately?",
                        [
                          {
                            text: "See Clinics",
                            onPress: () => setShowAppointmentModal(true)
                          },
                          {
                            text: "Call Now",
                            style: "default",
                            onPress: () => {
                              // Implement emergency call functionality
                              console.log("Emergency call initiated");
                            }
                          },
                          {
                            text: "Cancel",
                            style: "cancel"
                          }
                        ]
                      );
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.secondaryButtonContent}>
                      <Ionicons name="call" size={scale(17)} color="#DC2626" />
                      <Text style={[styles.secondaryButtonText, styles.emergencySecondaryText]}>
                        Emergency Contact
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </Animated.View>

          <DoctorAppointmentModal
            visible={showAppointmentModal}
            onClose={() => setShowAppointmentModal(false)}
            nearbyDoctors={nearbyDoctors}
            emergencyMode={true}
            onBook={(appointment) => {
              console.log("Emergency appointment booked:", appointment);
              Alert.alert(
                "Emergency Appointment Confirmed",
                `Your emergency appointment with ${appointment.doctor.name} has been scheduled. Please proceed to the clinic immediately.`,
                [{ text: "OK", style: "default" }]
              );
              setShowAppointmentModal(false);
            }}
          />
        </>
      );
    }

    // Enhanced video consultation card
    if (decision.includes("VIDEO_CONSULT")) {
      return (
        <Animated.View
          style={[
            styles.actionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.actionCard}>
            <LinearGradient
              colors={["#F5F3FF", "#EDE9FE", "#DDD6FE"]}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.actionHeader}>
                <View style={styles.actionIconWrapper}>
                  <LinearGradient
                    colors={["#7C3AED", "#EC4899"]}
                    style={styles.actionIcon}
                  >
                    <Ionicons name="videocam" size={scale(24)} color="#FFFFFF" />
                  </LinearGradient>
                </View>
                <View style={styles.actionHeaderText}>
                  <View style={[styles.urgentBadge, styles.recommendedBadge]}>
                    <Ionicons name="star" size={scale(11)} color="#7C3AED" />
                    <Text style={[styles.urgentBadgeText, styles.recommendedBadgeText]}>
                      RECOMMENDED
                    </Text>
                  </View>
                  <Text style={[styles.actionTitle, { color: "#5B21B6" }]}>
                    Video Consultation
                  </Text>
                  <Text style={[styles.actionSubtitle, { color: "#7C3AED" }]}>
                    Connect with a veterinarian instantly
                  </Text>
                </View>
              </View>

              <View style={[styles.warningBox, styles.benefitsBox]}>
                <View style={styles.benefitsList}>
                  <View style={styles.benefitRow}>
                    <Ionicons name="checkmark-circle" size={scale(15)} color="#10B981" />
                    <Text style={styles.benefitText}>Instant consultation within minutes</Text>
                  </View>
                  <View style={styles.benefitRow}>
                    <Ionicons name="checkmark-circle" size={scale(15)} color="#10B981" />
                    <Text style={styles.benefitText}>Professional medical advice</Text>
                  </View>
                  <View style={styles.benefitRow}>
                    <Ionicons name="checkmark-circle" size={scale(15)} color="#10B981" />
                    <Text style={styles.benefitText}>Prescriptions if needed</Text>
                  </View>
                </View>
              </View>

              <StartCallButton
                navigation={navigation}
                onShowLiveDoctors={() => setShowLiveDoctorsModal(true)}
              />
            </LinearGradient>
          </View>
        </Animated.View>
      );
    }

    // Enhanced in-clinic card
    if (decision.includes("IN_CLINIC")) {
      return (
        <>
          <Animated.View
            style={[
              styles.actionContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.actionCard}>
              <LinearGradient
                colors={["#F8FAFC", "#F1F5F9", "#E2E8F0"]}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.actionHeader}>
                  <View style={styles.actionIconWrapper}>
                    <LinearGradient
                      colors={["#7C3AED", "#EC4899"]}
                      style={styles.actionIcon}
                    >
                      <Ionicons name="medical" size={scale(24)} color="#FFFFFF" />
                    </LinearGradient>
                  </View>
                  <View style={styles.actionHeaderText}>
                    <Text style={[styles.actionTitle, { color: "#1F2937" }]}>
                      Consultation Options
                    </Text>
                    <Text style={[styles.actionSubtitle, { color: "#6B7280" }]}>
                      Choose the best option for your pet's needs
                    </Text>
                  </View>
                </View>

                <View style={styles.optionsContainer}>
                  <StartCallButton
                    navigation={navigation}
                    onShowLiveDoctors={() => setShowLiveDoctorsModal(true)}
                  />

                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => setShowAppointmentModal(true)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.secondaryButtonContent}>
                      <Ionicons name="business" size={scale(18)} color="#7C3AED" />
                      <Text style={styles.secondaryButtonText}>
                        Book Clinic Visit
                      </Text>
                      <Ionicons name="arrow-forward" size={scale(15)} color="#7C3AED" />
                    </View>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </Animated.View>

          <DoctorAppointmentModal
            visible={showAppointmentModal}
            onClose={() => setShowAppointmentModal(false)}
            nearbyDoctors={nearbyDoctors}
            onBook={(appointment) => {
              console.log("Appointment booked:", appointment);
              Alert.alert(
                "Appointment Confirmed",
                `Your appointment with ${appointment.doctor.name} on ${appointment.date} at ${appointment.time} has been booked successfully!`,
                [{ text: "OK", style: "default" }]
              );
              setShowAppointmentModal(false);
            }}
          />
        </>
      );
    }

    return null;
  },
  (prevProps, nextProps) => {
    return (
      prevProps.decision === nextProps.decision &&
      prevProps.messageId === nextProps.messageId &&
      prevProps.isTypingComplete === nextProps.isTypingComplete
    );
  }
);

// Enhanced MessageBubble with better typing indicators
const MessageBubble = memo(
  ({ msg, index, nearbyDoctors, navigation }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;
    const [isTypingComplete, setIsTypingComplete] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 80,
            friction: 10,
            useNativeDriver: true,
          }),
        ]).start();
      }, index * 100); // Staggered animation

      return () => clearTimeout(timer);
    }, [index]);

    useEffect(() => {
      if (msg.sender === "ai" && msg.text && msg.displayedText) {
        if (msg.displayedText.length >= msg.text.length) {
          const timer = setTimeout(() => {
            setIsTypingComplete(true);
          }, 500); // Small delay after typing completes
          return () => clearTimeout(timer);
        }
      } else {
        setIsTypingComplete(true);
      }
    }, [msg.displayedText, msg.text, msg.sender]);

    if (msg.type === "loading") {
      return (
        <Animated.View
          style={[
            styles.messageContainer,
            styles.aiMessageContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <LinearGradient
            colors={["#7C3AED", "#EC4899"]}
            style={styles.aiAvatar}
          >
            <Ionicons name="sparkles" size={scale(16)} color="#FFFFFF" />
          </LinearGradient>

          <View style={styles.loadingBubble}>
            <View style={styles.loadingHeader}>
              <Text style={styles.loadingText}>AI analyzing symptoms</Text>
            </View>
            <View style={styles.loadingDots}>
              <Animated.View style={[styles.dot, styles.dot1]} />
              <Animated.View style={[styles.dot, styles.dot2]} />
              <Animated.View style={[styles.dot, styles.dot3]} />
            </View>
          </View>
        </Animated.View>
      );
    }

    const isUser = msg.sender === "user";

    return (
      <>
        <Animated.View
          style={[
            styles.messageContainer,
            isUser ? styles.userMessageContainer : styles.aiMessageContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {!isUser && (
            <LinearGradient
              colors={["#7C3AED", "#EC4899"]}
              style={styles.aiAvatar}
            >
              <Ionicons name="medical" size={scale(16)} color="#FFFFFF" />
            </LinearGradient>
          )}

          <View
            style={[
              styles.bubble,
              isUser ? styles.userBubble : styles.aiBubble,
              !isUser && styles.aiBubbleEnhanced,
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                isUser ? styles.userText : styles.aiText,
              ]}
            >
              {msg.displayedText || msg.text}
            </Text>
          </View>

          {!isUser && (
            <View style={styles.timestampContainer}>
              <Text style={styles.timestamp}>
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              {!isTypingComplete && (
                <View style={styles.typingIndicator}>
                  <Text style={styles.typingText}>typing</Text>
                </View>
              )}
            </View>
          )}
        </Animated.View>

        {!isUser && msg.decision && (
          <EmergencyStatusBox
            decision={msg.decision}
            nearbyDoctors={nearbyDoctors}
            navigation={navigation}
            messageId={msg.id}
            isTypingComplete={isTypingComplete}
          />
        )}
      </>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.msg.displayedText === nextProps.msg.displayedText &&
      prevProps.msg.text === nextProps.msg.text &&
      prevProps.msg.decision === nextProps.msg.decision &&
      prevProps.index === nextProps.index
    );
  }
);

export { MessageBubble, StartCallButton, EmergencyStatusBox };

// Enhanced Styles
const styles = StyleSheet.create({
  // Enhanced Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(24),
    padding: SPACING.xl,
    width: "100%",
    maxWidth: scale(380),
    maxHeight: height * 0.85,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: scale(16) },
    shadowOpacity: 0.3,
    shadowRadius: scale(24),
    elevation: 16,
    position: "relative",
  },
  rippleCircle: {
    position: "absolute",
    width: scale(140),
    height: scale(140),
    borderRadius: scale(70),
    backgroundColor: "#7C3AED",
    top: verticalScale(30),
  },
  rippleCircle2: {
    backgroundColor: "#EC4899",
  },
  searchIconContainer: {
    marginBottom: verticalScale(20),
    position: "relative",
    zIndex: 2,
  },
  searchIcon: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: scale(6) },
    shadowOpacity: 0.35,
    shadowRadius: scale(12),
    elevation: 10,
  },
  searchIconBorder: {
    position: "absolute",
    width: scale(92),
    height: scale(92),
    borderRadius: scale(46),
    borderWidth: 2,
    borderColor: "rgba(124, 58, 237, 0.3)",
    top: -scale(6),
    left: -scale(6),
  },
  modalTitle: {
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: verticalScale(6),
  },
  modalSubtitle: {
    fontSize: FONT_SIZES.small,
    color: "#64748B",
    textAlign: "center",
    marginBottom: verticalScale(18),
  },
  timeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: verticalScale(12),
    paddingHorizontal: SPACING.md,
    paddingVertical: verticalScale(6),
    backgroundColor: "#F5F3FF",
    borderRadius: moderateScale(8),
  },
  timeText: {
    fontSize: FONT_SIZES.small,
    color: "#7C3AED",
    fontWeight: "600",
  },
  progressBarContainer: {
    width: "100%",
    height: verticalScale(6),
    backgroundColor: "#E2E8F0",
    borderRadius: moderateScale(3),
    marginBottom: verticalScale(24),
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: moderateScale(3),
  },
  progressGradient: {
    flex: 1,
  },
  searchingIndicators: {
    width: "100%",
    maxHeight: verticalScale(200),
    gap: verticalScale(12),
    marginBottom: verticalScale(20),
  },
  indicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(12),
    paddingHorizontal: SPACING.lg,
    backgroundColor: "#F9FAFB",
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  extendedSearchRow: {
    borderColor: "#8B5CF6",
    backgroundColor: "#F5F3FF",
  },
  indicatorIconContainer: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  indicatorContent: {
    flex: 1,
  },
  indicatorTitle: {
    fontSize: FONT_SIZES.small,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: SPACING.xs,
  },
  indicatorSubtext: {
    fontSize: FONT_SIZES.tiny,
    color: "#6B7280",
  },
  statusDot: {
    width: scale(10),
    height: scale(10),
    borderRadius: scale(5),
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  statusDotInner: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: "#FFFFFF",
  },
  searchingText: {
    fontSize: FONT_SIZES.medium,
    color: "#F59E0B",
    fontWeight: "600",
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: verticalScale(20),
    paddingHorizontal: SPACING.md,
    paddingVertical: verticalScale(8),
    backgroundColor: "#FEF3C7",
    borderRadius: moderateScale(8),
  },
  timerText: {
    fontSize: FONT_SIZES.tiny,
    color: "#92400E",
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: SPACING.md,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(16),
    borderRadius: moderateScale(12),
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  primaryButton: {
    backgroundColor: "#7C3AED",
  },
  secondaryButtonText: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    color: "#6B7280",
  },
  primaryButtonText: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Enhanced Call Button Styles
  callButtonWrapper: {
    marginVertical: verticalScale(12),
  },
  callButton: {
    borderRadius: moderateScale(16),
    overflow: "hidden",
    position: "relative",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.3,
    shadowRadius: scale(8),
    elevation: 8,
  },
  callButtonDisabled: {
    opacity: 0.7,
  },
  callButtonLoading: {
    opacity: 0.9,
  },
  glowEffect: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: moderateScale(16),
    backgroundColor: "#7C3AED",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: scale(20),
    elevation: 10,
  },
  callButtonGradient: {
    paddingVertical: verticalScale(16),
    paddingHorizontal: SPACING.xl,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.md,
  },
  iconContainer: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  callButtonText: {
    color: "#FFFFFF",
    fontSize: FONT_SIZES.large,
    fontWeight: "700",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    marginTop: verticalScale(8),
    paddingHorizontal: SPACING.md,
  },
  infoText: {
    fontSize: FONT_SIZES.tiny,
    color: "#10B981",
    fontWeight: "600",
    textAlign: "center",
  },
  warningText: {
    color: "#F59E0B",
  },
  errorText: {
    color: "#EF4444",
  },

  // Enhanced Action Container
  actionContainer: {
    marginVertical: verticalScale(12),
    marginHorizontal: SPACING.lg,
    maxWidth: "90%",
    alignSelf: "flex-start",
  },
  actionCard: {
    borderRadius: moderateScale(20),
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: scale(8) },
    shadowOpacity: 0.1,
    shadowRadius: scale(16),
    elevation: 8,
  },
  emergencyCard: {
    borderWidth: 2,
    borderColor: "#FECACA",
  },
  actionGradient: {
    padding: SPACING.xl,
    borderRadius: moderateScale(20),
  },
  actionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: verticalScale(16),
    gap: SPACING.md,
  },
  actionIconWrapper: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.2,
    shadowRadius: scale(8),
    elevation: 6,
  },
  pulsatingIcon: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
  },
  actionIcon: {
    width: "100%",
    height: "100%",
    borderRadius: scale(25),
    justifyContent: "center",
    alignItems: "center",
  },
  actionHeaderText: {
    flex: 1,
  },
  urgentBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: SPACING.sm,
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(6),
    marginBottom: verticalScale(8),
    gap: SPACING.xs,
  },
  recommendedBadge: {
    backgroundColor: "#EDE9FE",
  },
  recommendedBadgeText: {
    color: "#7C3AED",
  },
  pulseDot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: "#DC2626",
  },
  urgentBadgeText: {
    fontSize: FONT_SIZES.tiny,
    fontWeight: "800",
    color: "#DC2626",
    letterSpacing: 0.5,
  },
  actionTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "700",
    marginBottom: verticalScale(4),
    lineHeight: FONT_SIZES.xlarge * 1.3,
  },
  actionSubtitle: {
    fontSize: FONT_SIZES.small,
    fontWeight: "500",
    lineHeight: FONT_SIZES.small * 1.4,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255,255,255,0.7)",
    padding: SPACING.md,
    borderRadius: moderateScale(12),
    gap: SPACING.md,
    borderWidth: 1,
    marginBottom: verticalScale(16),
  },
  benefitsBox: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderColor: "#DDD6FE",
  },
  benefitsList: {
    flex: 1,
    gap: verticalScale(6),
  },
  actionText: {
    flex: 1,
    fontSize: FONT_SIZES.small,
    color: "#374151",
    lineHeight: FONT_SIZES.small * 1.5,
    fontWeight: "500",
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  benefitText: {
    fontSize: FONT_SIZES.small,
    color: "#1F2937",
    fontWeight: "500",
    flex: 1,
  },
  emergencyActions: {
    gap: verticalScale(12),
  },
  primaryButton: {
    borderRadius: moderateScale(12),
    overflow: "hidden",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.3,
    shadowRadius: scale(8),
    elevation: 6,
  },
  emergencyButton: {
    shadowColor: "#EF4444",
  },
  buttonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: verticalScale(14),
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: FONT_SIZES.large,
    fontWeight: "700",
  },
  optionsContainer: {
    gap: verticalScale(14),
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: verticalScale(4),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#D1D5DB",
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    fontSize: FONT_SIZES.tiny,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  secondaryButton: {
    borderRadius: moderateScale(12),
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#7C3AED",
  },
  emergencySecondaryButton: {
    borderColor: "#DC2626",
  },
  secondaryButtonContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: verticalScale(14),
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
    backgroundColor: "#F5F3FF",
  },
  emergencySecondaryContent: {
    backgroundColor: "#FEF2F2",
  },
  secondaryButtonText: {
    color: "#7C3AED",
    fontSize: FONT_SIZES.large,
    fontWeight: "700",
  },
  emergencySecondaryText: {
    color: "#DC2626",
  },

  // Enhanced Message Bubble
  messageContainer: {
    marginVertical: verticalScale(6),
    maxWidth: "85%",
    flexDirection: "row",
    alignItems: "flex-end",
  },
  aiMessageContainer: {
    alignSelf: "flex-start",
  },
  userMessageContainer: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
  },
  aiAvatar: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.3,
    shadowRadius: scale(4),
    elevation: 4,
  },
  bubble: {
    borderRadius: moderateScale(18),
    paddingVertical: verticalScale(12),
    paddingHorizontal: SPACING.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.08,
    shadowRadius: scale(4),
    elevation: 2,
    maxWidth: "100%",
  },
  userBubble: {
    backgroundColor: "#7C3AED",
    borderBottomRightRadius: moderateScale(6),
  },
  aiBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: moderateScale(6),
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  aiBubbleEnhanced: {
    borderColor: "#DDD6FE",
    backgroundColor: "#FAFAFA",
  },
  bubbleText: {
    fontSize: FONT_SIZES.medium,
    lineHeight: FONT_SIZES.medium * 1.4,
  },
  userText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  aiText: {
    color: "#1E293B",
    fontWeight: "400",
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.xs,
    gap: SPACING.xs,
  },
  timestamp: {
    fontSize: FONT_SIZES.tiny,
    color: "#94A3B8",
    marginTop: verticalScale(4),
  },
  typingIndicator: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: SPACING.xs,
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(4),
  },
  typingText: {
    fontSize: FONT_SIZES.tiny,
    color: "#64748B",
    fontStyle: 'italic',
  },

  // Enhanced Loading
  loadingBubble: {
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(18),
    borderBottomLeftRadius: moderateScale(6),
    paddingVertical: verticalScale(12),
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  loadingHeader: {
    marginBottom: verticalScale(8),
  },
  loadingText: {
    fontSize: FONT_SIZES.tiny,
    color: "#7C3AED",
    fontWeight: "600",
  },
  loadingDots: {
    flexDirection: "row",
    gap: SPACING.xs,
  },
  dot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: "#7C3AED",
  },
  dot1: {
    opacity: 0.6,
  },
  dot2: {
    opacity: 0.8,
  },
  dot3: {
    opacity: 1,
  },
});