import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import {
  memo,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";
import { socket } from "../context/Socket";
import DoctorAppointmentModal from "./DoctorAppointmentModal";
import ProfileCompletionModalAuto from "../utils/ProfileCompletionModalAuto";
import axios from "axios";

const { width, height } = Dimensions.get("window");

// Enhanced responsive functions
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 667) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

// Font sizes with accessibility support
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

// ------------------- DoctorSearchModal -------------------
const DoctorSearchModal = memo(({ visible, onClose, onFailure }) => {
  const [dots, setDots] = useState("");
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(0);
      progressAnim.setValue(0);
      rippleAnim.setValue(0);

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
        duration: 30000,
        useNativeDriver: false,
      }).start();

      const interval = setInterval(() => {
        setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
      }, 500);

      return () => {
        pulse.stop();
        ripple.stop();
        clearInterval(interval);
      };
    } else {
      setDots("");
    }
  }, [visible]);

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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <BlurView intensity={95} tint="dark" style={styles.modalOverlay}>
        <Animated.View style={[styles.modalContent, { opacity: fadeAnim }]}>
          <Animated.View
            style={[
              styles.rippleCircle,
              { transform: [{ scale: rippleScale }], opacity: rippleOpacity },
            ]}
          />
          <Animated.View
            style={[
              styles.rippleCircle,
              styles.rippleCircle2,
              { transform: [{ scale: rippleScale }], opacity: rippleOpacity },
            ]}
          />
          <Animated.View
            style={[
              styles.searchIconContainer,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <LinearGradient
              colors={["#007AFF", "#005BB5"]}
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
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[styles.progressBar, { width: progressWidth }]}
            >
              <LinearGradient
                colors={["#007AFF", "#005BB5"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.progressGradient}
              />
            </Animated.View>
          </View>
          <View style={styles.searchingIndicators}>
            <View style={styles.indicatorRow}>
              <View style={styles.indicatorIconContainer}>
                <Ionicons name="location" size={scale(16)} color="#007AFF" />
              </View>
              <View style={styles.indicatorContent}>
                <Text style={styles.indicatorTitle}>Location Services</Text>
                <Text style={styles.indicatorSubtext}>
                  Scanning nearby clinics
                </Text>
              </View>
              <View style={styles.statusDot}>
                <View style={styles.statusDotInner} />
              </View>
            </View>
            <View style={styles.indicatorRow}>
              <View style={styles.indicatorIconContainer}>
                <Ionicons name="wifi" size={scale(16)} color="#34C759" />
              </View>
              <View style={styles.indicatorContent}>
                <Text style={styles.indicatorTitle}>Network Status</Text>
                <Text style={styles.indicatorSubtext}>
                  Connecting to servers
                </Text>
              </View>
              <ActivityIndicator size="small" color="#34C759" />
            </View>
            <View style={styles.indicatorRow}>
              <View style={styles.indicatorIconContainer}>
                <Ionicons name="people" size={scale(16)} color="#FF9500" />
              </View>
              <View style={styles.indicatorContent}>
                <Text style={styles.indicatorTitle}>Doctor Availability</Text>
                <Text style={styles.indicatorSubtext}>Checking schedules</Text>
              </View>
              <Text style={styles.searchingText}>...</Text>
            </View>
          </View>
          <View style={styles.timerContainer}>
            <Ionicons name="time-outline" size={scale(13)} color="#9CA3AF" />
            <Text style={styles.timerText}>Maximum wait time: 30 seconds</Text>
          </View>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              onClose();
              onFailure?.();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel Search</Text>
          </TouchableOpacity>
        </Animated.View>
      </BlurView>
    </Modal>
  );
});

// ------------------- StartCallButton -------------------
const StartCallButton = memo(({ nearbyDoctors, navigation }) => {
  const [loading, setLoading] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [callStatus, setCallStatus] = useState(null);
  const { liveDoctors } = useContext(AuthContext);
  const patientId = 101;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef(null);
  const glowAnimationRef = useRef(null);

  useEffect(() => {
    if (liveDoctors?.length > 0 && glowAnimationRef.current) {
      glowAnimationRef.current.start();
    }

    return () => {
      if (glowAnimationRef.current) {
        glowAnimationRef.current.stop();
      }
    };
  }, [liveDoctors?.length]);

  useEffect(() => {
    socket.emit("get-active-doctors");

    const handleCallSent = (data) => {
      setCallStatus({ type: "sent", ...data });
    };

    const handleCallAccepted = (data) => {
      setCallStatus({ type: "accepted", ...data });
      setLoading(false);
      setShowSearchModal(false);

      const doctor = nearbyDoctors.find((d) => d.id === data.doctorId);

      if (data.requiresPayment) {
        navigation.navigate("PaymentScreen", {
          doctor,
          channel: data.channel,
          patientId,
          callId: data.callId,
          role: "audience",
          uid: patientId,
          onPaymentSuccess: () => {
            navigation.navigate("VideoCallScreen", {
              doctor,
              channel: data.channel,
              patientId,
              callId: data.callId,
              role: "audience",
              uid: patientId,
            });
          },
        });
      } else {
        setTimeout(
          () =>
            navigation.navigate("VideoCallScreen", {
              doctor,
              channel: data.channel,
              patientId,
              callId: data.callId,
              role: "audience",
              uid: patientId,
            }),
          1000
        );
      }
    };

    const handleCallRejected = (data) => {
      setCallStatus({ type: "rejected", ...data });
      handleNoResponse();
    };

    socket.on("call-sent", handleCallSent);
    socket.on("call-accepted", handleCallAccepted);
    socket.on("call-rejected", handleCallRejected);

    return () => {
      socket.off("call-sent", handleCallSent);
      socket.off("call-accepted", handleCallAccepted);
      socket.off("call-rejected", handleCallRejected);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [nearbyDoctors, navigation]);

  const handleNoResponse = () => {
    setLoading(false);
    setShowSearchModal(false);

    Alert.alert(
      "No Doctors Available",
      "All veterinarians are currently busy. Would you like to book a clinic appointment instead?",
      [
        {
          text: "Try Again",
          style: "cancel",
          onPress: () => setCallStatus(null),
        },
        {
          text: "Book Appointment",
          onPress: () => navigation.navigate("BookClinicVisit"),
        },
      ],
      { cancelable: false }
    );
  };

  const startCall = () => {
    if (!nearbyDoctors?.length) {
      return Alert.alert(
        "No Doctors Available",
        "There are no nearby veterinarians available at the moment."
      );
    }

    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        tension: 300,
        friction: 10,
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

    const callId = `call_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 8)}`;
    const channel = `channel_${callId}`;

    nearbyDoctors.forEach((doc) => {
      socket.emit("call-requested", {
        doctorId: doc.id,
        patientId,
        channel,
        callId,
        timestamp: new Date().toISOString(),
      });
    });

    timeoutRef.current = setTimeout(() => {
      if (loading && !callStatus) {
        handleNoResponse();
      }
    }, 30000);
  };

  const buttonDisabled = !nearbyDoctors?.length || loading;

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <>
      <View>
        <TouchableOpacity
          style={styles.serviceItem}
          activeOpacity={0.7}
          onPress={startCall}
          disabled={buttonDisabled}
        >
          <LinearGradient
            colors={
              buttonDisabled ? ["#D1FAE5", "#A7F3D0"] : ["#FEE2E2", "#FECACA"]
            }
            style={styles.serviceIcon}
          >
            <Animated.View
              style={[
                styles.glowEffect,
                { opacity: glowOpacity },
                (buttonDisabled || !liveDoctors?.length) && { opacity: 0 },
              ]}
            />
            <View style={styles.buttonContent}>
              {buttonDisabled ? (
                <>
                  <Ionicons name="videocam-off" size={scale(20)} color="#fff" />
                  <Text style={styles.callButtonText} numberOfLines={2}>
                    No doctors available
                  </Text>
                </>
              ) : (
                <>
                  <View style={styles.iconContainer}>
                    <Ionicons name="videocam" size={scale(19)} color="#fff" />
                  </View>
                  {liveDoctors?.length > 0 && (
                    <View style={styles.liveIndicator}>
                      <View style={styles.liveDot} />
                    </View>
                  )}
                </>
              )}
            </View>
          </LinearGradient>
          <Text style={styles.serviceTitle} numberOfLines={2}>Video Consultation</Text>
          {liveDoctors?.length > 0 && !buttonDisabled ? (
            <View style={styles.infoRow}>
              <Text style={styles.liveText} numberOfLines={1}>
                {liveDoctors.length} Doctor{liveDoctors.length > 1 ? "s" : ""}{" "}
                Live
              </Text>
            </View>
          ) : (
            <Text style={styles.serviceSubtitle} numberOfLines={1}>Check availability</Text>
          )}
        </TouchableOpacity>
      </View>
      <DoctorSearchModal
        visible={showSearchModal}
        onClose={() => {
          setShowSearchModal(false);
          setLoading(false);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }}
        onFailure={handleNoResponse}
      />
    </>
  );
});

// ------------------- HomeScreen -------------------
export default function HomeScreen({ navigation }) {
  const { user, token, updateNearbyDoctors } = useContext(AuthContext);
  const [inputMessage, setInputMessage] = useState("");
  const [temperature, setTemperature] = useState("32°C");
  const [isLoading, setIsLoading] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const { updateUser } = useContext(AuthContext);
  const [nearbyDoctors, setNearbyDoctors] = useState([]);
  const [showPetModal, setShowPetModal] = useState(false);
  
  const fetchNearbyDoctors = useCallback(async () => {
    if (!token || !user?.id) return;

    try {
      const response = await axios.get(
        `https://snoutiq.com/backend/api/nearby-vets?user_id=${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && Array.isArray(response.data.data)) {
        updateNearbyDoctors(response.data.data);
        setNearbyDoctors(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch nearby doctors", error);
    }
  }, [token, user?.id, updateNearbyDoctors]);
  
  useEffect(() => {
    if (!token || !user?.id) return;

    const fetchData = async () => {
      await fetchNearbyDoctors();
    };

    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [token, user?.id, fetchNearbyDoctors]);

  useEffect(() => {
    if (user) {
      const hasPetData =
        user.pet_name && user.pet_gender && user.breed && user.pet_age;

      if (!hasPetData) {
        setShowPetModal(true);
      } else {
        setShowPetModal(false);
      }
    } else {
      setShowPetModal(false);
    }
  }, [user]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "" || isLoading) return;

    const messageToSend = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    try {
      const newChatRoomToken = `chat_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;

      navigation.navigate("Chat", {
        initialMessage: messageToSend,
        isNewChat: true,
        chat_room_token: newChatRoomToken,
        loadHistory: false,
        timestamp: Date.now(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookClinic = () => {
    if (!nearbyDoctors || nearbyDoctors.length === 0) {
      Alert.alert("No Clinics Available", "No clinics available near you.");
      return;
    }
    setShowAppointmentModal(true);
  };

  const handleAppointmentBooked = () => {
    setShowAppointmentModal(false);
    navigation.navigate("AppointmentConfirmation");
  };

  return (
    <SafeAreaView style={styles.container}>
      {showPetModal && (
        <ProfileCompletionModalAuto
          onComplete={() => setShowPetModal(false)}
          updateUser={updateUser}
          token={token}
          user={user}
        />
      )}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={["#7C3AED", "#EC4899"]} style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.appLogo} numberOfLines={1}>SnoutIQ</Text>
            </View>
            <View style={styles.locationInfo}>
              <Ionicons name="location" size={scale(12)} color="#FFFFFF" />
              <Text style={styles.locationText} numberOfLines={1}>
                Gurgaon • <Text style={styles.temperature}>{temperature}</Text>
              </Text>
            </View>
          </View>
          <View style={styles.headerBottom}>
            <View style={styles.petInfo}>
              <Text style={styles.welcomeText} numberOfLines={2}>
                {nearbyDoctors.length} AI Vet is ready to serve
              </Text>
              <View style={styles.petDetails}>
                <View style={styles.petDetailItem}>
                  <Text style={styles.petDetailIcon}>🐕</Text>
                  <Text style={styles.petDetailText} numberOfLines={1}>
                    {user?.breed || "Golden Retriever"}
                  </Text>
                </View>
                <View style={styles.petDetailItem}>
                  <Text style={styles.petDetailIcon}>📅</Text>
                  <Text style={styles.petDetailText} numberOfLines={1}>
                    {user?.pet_age || "3"} years
                  </Text>
                </View>
                <View style={styles.petDetailItem}>
                  <Text style={styles.petDetailIcon}>⚤</Text>
                  <Text style={styles.petDetailText} numberOfLines={1}>
                    {user?.pet_gender || "Male"}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {user?.name ? user.name.substring(0, 2).toUpperCase() : "SP"}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.aiSearchSection}>
          <View style={styles.searchInputWrapper}>
            <TextInput
              style={styles.aiInput}
              placeholder="Describe your pet's symptoms..."
              placeholderTextColor="#999"
              value={inputMessage}
              onChangeText={setInputMessage}
              multiline
              numberOfLines={2}
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                (isLoading || !inputMessage.trim()) && styles.sendBtnDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
            >
              <LinearGradient
                colors={["#4F46E5", "#7C3AED"]}
                style={styles.sendBtnGradient}
              >
                <Ionicons
                  name={isLoading ? "hourglass-outline" : "arrow-forward"}
                  size={scale(20)}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <Text style={styles.aiHelperText}>
            AI will analyze and suggest next steps
          </Text>
        </View>

        <View style={styles.servicesSection}>
          <View style={styles.servicesGrid}>
            <StartCallButton
              nearbyDoctors={nearbyDoctors}
              navigation={navigation}
            />
            <TouchableOpacity
              style={styles.serviceItem}
              onPress={handleBookClinic}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["#E8F4FF", "#F0F8FF"]}
                style={styles.serviceIcon}
              >
                <Ionicons name="medical" size={scale(28)} color="#34C759" />
              </LinearGradient>
              <Text style={styles.serviceTitle} numberOfLines={2}>Book Clinic Visit</Text>
              <Text style={styles.serviceSubtitle} numberOfLines={1}>
                {nearbyDoctors?.length || 0} clinics near you
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.serviceItem}
              onPress={() => navigation.navigate("Health")}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["#E8F4FF", "#F0F8FF"]}
                style={styles.serviceIcon}
              >
                <Ionicons name="document-text" size={scale(28)} color="#007AFF" />
              </LinearGradient>
              <Text style={styles.serviceTitle} numberOfLines={2}>Health Records</Text>
              <Text style={styles.serviceSubtitle} numberOfLines={1}>View pet history</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceItem} activeOpacity={0.7}>
              <LinearGradient
                colors={["#E8F4FF", "#F0F8FF"]}
                style={styles.serviceIcon}
              >
                <Ionicons name="medkit" size={scale(28)} color="#FF3B30" />
              </LinearGradient>
              <Text style={styles.serviceTitle} numberOfLines={2}>Medicines</Text>
              <Text style={styles.serviceSubtitle} numberOfLines={1}>Order & refills</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: SPACING.xxl * 4 }} />
      </ScrollView>

      <DoctorAppointmentModal
        visible={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        onBook={handleAppointmentBooked}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === "ios" ? SPACING.xxl * 2 : SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: moderateScale(24),
    borderBottomRightRadius: moderateScale(24),
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
  },
  appLogo: {
    fontSize: FONT_SIZES.xxxlarge,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: moderateScale(16),
    maxWidth: scale(150),
  },
  locationText: {
    fontSize: FONT_SIZES.small,
    color: "#FFFFFF",
    flexShrink: 1,
  },
  temperature: {
    fontWeight: "600",
    color: "#FFFFFF",
  },
  headerBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  petInfo: {
    flex: 1,
    minWidth: 0,
    marginRight: SPACING.md,
  },
  welcomeText: {
    fontSize: FONT_SIZES.medium,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
    marginBottom: SPACING.sm,
    lineHeight: FONT_SIZES.medium * 1.4,
  },
  petDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  petDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: moderateScale(12),
    maxWidth: scale(120),
  },
  petDetailIcon: {
    fontSize: FONT_SIZES.tiny,
  },
  petDetailText: {
    fontSize: FONT_SIZES.small,
    color: "#FFFFFF",
    flexShrink: 1,
  },
  userAvatar: {
    width: scale(40),
    height: scale(40),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: scale(20),
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: {
    fontSize: FONT_SIZES.large,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  aiSearchSection: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#EC4899",
    borderRadius: moderateScale(16),
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    shadowColor: "#EC4899",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  searchInputWrapper: {
    position: "relative",
    marginBottom: SPACING.md,
  },
  aiInput: {
    width: "100%",
    minHeight: verticalScale(60),
    maxHeight: verticalScale(120),
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    paddingRight: scale(60),
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: moderateScale(12),
    color: "#1F2937",
    fontSize: FONT_SIZES.medium,
    textAlignVertical: "top",
  },
  sendBtn: {
    position: "absolute",
    right: SPACING.sm,
    top: SPACING.md,
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    overflow: "hidden",
    shadowColor: "#EC4899",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendBtnGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  aiHelperText: {
    fontSize: moderateScale(11),
    color: "#6B7280",
  },
  servicesSection: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(24),
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(12),
  },
  serviceItem: {
    width: (width - scale(52)) / 2,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E8F4FF",
    borderRadius: 16,
    padding: scale(20),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceIcon: {
    width: scale(56),
    height: scale(56),
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(14),
    position: "relative",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  iconContainer: {
    width: scale(28),
    height: scale(28),
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  glowEffect: {
    position: "absolute",
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: "#10B981",
    opacity: 0.3,
    borderRadius: 24,
    zIndex: -1,
  },
  liveIndicator: {
    position: "absolute",
    top: -4,
    right: -4,
    width: scale(16),
    height: scale(16),
    borderRadius: scale(8),
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  liveDot: {
    width: scale(10),
    height: scale(10),
    borderRadius: scale(5),
    backgroundColor: "#10B981",
  },
  serviceTitle: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    marginBottom: verticalScale(4),
    color: "#1F2937",
    textAlign: "center",
  },
  serviceSubtitle: {
    fontSize: moderateScale(11),
    color: "#6B7280",
    textAlign: "center",
  },
  callButtonText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    marginTop: verticalScale(8),
  },
  liveText: {
    color: "#10B981",
    fontWeight: "700",
    fontSize: moderateScale(11),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: scale(24),
    width: "90%",
    alignItems: "center",
    position: "relative",
  },
  rippleCircle: {
    position: "absolute",
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
    backgroundColor: "#0EA5E9",
    opacity: 0.6,
  },
  rippleCircle2: {
    backgroundColor: "#0284C7",
    opacity: 0.3,
  },
  searchIconContainer: {
    width: scale(70),
    height: scale(70),
    borderRadius: scale(35),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(16),
  },
  searchIcon: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
    justifyContent: "center",
    alignItems: "center",
  },
  searchIconBorder: {
    position: "absolute",
    width: scale(70),
    height: scale(70),
    borderRadius: scale(35),
    borderWidth: 2,
    borderColor: "#0EA5E9",
    opacity: 0.5,
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: verticalScale(8),
  },
  modalSubtitle: {
    fontSize: moderateScale(14),
    color: "#6B7280",
    textAlign: "center",
    marginBottom: verticalScale(16),
  },
  progressBarContainer: {
    width: "100%",
    height: verticalScale(8),
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: verticalScale(20),
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  progressGradient: {
    flex: 1,
  },
  searchingIndicators: {
    width: "100%",
    gap: verticalScale(12),
    marginBottom: verticalScale(20),
  },
  indicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(12),
  },
  indicatorIconContainer: {
    width: scale(32),
    height: scale(32),
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  indicatorContent: {
    flex: 1,
  },
  indicatorTitle: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#1F2937",
  },
  indicatorSubtext: {
    fontSize: moderateScale(12),
    color: "#6B7280",
  },
  statusDot: {
    width: scale(16),
    height: scale(16),
    borderRadius: 8,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
  },
  statusDotInner: {
    width: scale(8),
    height: scale(8),
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  searchingText: {
    fontSize: moderateScale(14),
    color: "#F59E0B",
    fontWeight: "600",
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
    marginBottom: verticalScale(20),
  },
  timerText: {
    fontSize: moderateScale(12),
    color: "#9CA3AF",
  },
  cancelButton: {
    backgroundColor: "#FEE2E2",
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(20),
    borderRadius: 12,
  },
  cancelButtonText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#EF4444",
  },
});