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
  View,RefreshControl
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";
import { socket } from "../context/Socket";
import DoctorAppointmentModal from "./DoctorAppointmentModal";
import ProfileCompletionModalAuto from "../utils/ProfileCompletionModalAuto";
import axios from "axios";
import DetailedWeatherWidget from "./DetailedWeatherWidget";
import LiveDoctorSelectionModal from "./LiveDoctorSelectionModal";
import { useFocusEffect } from '@react-navigation/native';


const { width, height } = Dimensions.get("window");

// Enhanced responsive functions
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 667) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

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
const StartCallButton = memo(({ navigation, onShowLiveDoctors }) => {
  const { liveDoctors } = useContext(AuthContext);

  return (
    <TouchableOpacity
      style={styles.serviceItem}
      activeOpacity={0.7}
      onPress={onShowLiveDoctors}
      disabled={!liveDoctors?.length}
    >
      <LinearGradient
        colors={
          !liveDoctors?.length ? ["#D1FAE5", "#A7F3D0"] : ["#FEE2E2", "#FECACA"]
        }
        style={styles.serviceIcon}
      >
        <View style={styles.buttonContent}>
          {!liveDoctors?.length ? (
            <>
              <Ionicons name="videocam-off" size={scale(20)} color="#fff" />
            </>
          ) : (
            <>
              <View style={styles.iconContainer}>
                <Ionicons name="videocam" size={scale(19)} color="#fff" />
              </View>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
              </View>
            </>
          )}
        </View>
      </LinearGradient>
      <Text style={styles.serviceTitle} numberOfLines={2}>
        Video Consultation
      </Text>
      {liveDoctors?.length > 0 ? (
        <View style={styles.infoRow}>
          <Text style={styles.liveText} numberOfLines={1}>
            {liveDoctors.length} Doctor{liveDoctors.length > 1 ? "s" : ""} Live
          </Text>
        </View>
      ) : (
        <Text style={styles.serviceSubtitle} numberOfLines={1}>
          Check availability
        </Text>
      )}
    </TouchableOpacity>
  );
});

// ------------------- TrustBadge Component -------------------
const TrustBadge = memo(() => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(1000),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.trustBadgeContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.trustBadge}
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <LinearGradient
          colors={["#F8FAFC", "#FFFFFF"]}
          style={styles.trustBadgeGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.trustBadgeContent}>
            <View style={styles.trustIconsRow}>
              <View style={styles.trustIcon}>
                <Ionicons
                  name="shield-checkmark"
                  size={scale(16)}
                  color="#10B981"
                />
              </View>
              <View style={styles.trustIcon}>
                <Ionicons name="heart" size={scale(16)} color="#EC4899" />
              </View>
              <View style={styles.trustIcon}>
                <Ionicons name="star" size={scale(16)} color="#F59E0B" />
              </View>
            </View>

            <Text style={styles.trustTitle}>Trusted by Pet Parents</Text>

            <View style={styles.trustStats}>
              <View style={styles.trustStatItem}>
                <Text style={styles.trustStatNumber}>100+</Text>
                <Text style={styles.trustStatLabel}>Happy Pets</Text>
              </View>

              <View style={styles.trustStatDivider} />

              <View style={styles.trustStatItem}>
                <Text style={styles.trustStatNumber}>50+</Text>
                <Text style={styles.trustStatLabel}>Expert Vets</Text>
              </View>

              <View style={styles.trustStatDivider} />

              <View style={styles.trustStatItem}>
                <Text style={styles.trustStatNumber}>24/7</Text>
                <Text style={styles.trustStatLabel}>Support</Text>
              </View>
            </View>

            <View style={styles.trustFooter}>
              <Ionicons name="ribbon" size={scale(12)} color="#6B7280" />
              <Text style={styles.trustFooterText}>
                Join 100+ trusted pet parents community
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Floating elements for visual appeal */}
        <View style={styles.floatingElement1} />
        <View style={styles.floatingElement2} />
        <View style={styles.floatingElement3} />
      </TouchableOpacity>
    </Animated.View>
  );
});

// ------------------- HomeScreen -------------------
export default function HomeScreen({ navigation }) {
  const { token, updateNearbyDoctors, liveDoctors } = useContext(AuthContext);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [nearbyDoctors, setNearbyDoctors] = useState([]);
  const [showLiveDoctorsModal, setShowLiveDoctorsModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [callStatus, setCallStatus] = useState(null);
  const { user, updateUser } = useContext(AuthContext);
  const [showPetModal, setShowPetModal] = useState(false);
  const timeoutRef = useRef(null);
   const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      console.log('Refreshing Home Page data...');
      await new Promise((r) => setTimeout(r, 1000));
      setData(Date.now()); 
    } catch (error) {
      console.error('Error refreshing HomePage:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

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
  if (!user) return;

  const hasPetData = !!(
    user.pet_name?.trim() &&
    user.pet_gender?.trim() &&
    user.breed?.trim() &&
    user.pet_age
  );

  if (!hasPetData && user.profileCompleted) {
    // Only update once
    updateUser((prev) =>
      prev.profileCompleted ? { ...prev, profileCompleted: false } : prev
    );
  }

  if (!hasPetData && !user.profileCompleted) {
    setShowPetModal(true);
  } else {
    setShowPetModal(false);
  }
}, [user]);


  // Socket listeners for call handling
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
      const patientId = user?.id || "101";

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
  }, [nearbyDoctors, navigation, user]);

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

  const handleCallDoctor = (doctor) => {
    const callId = `call_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 8)}`;
    const channel = `channel_${callId}`;
    const patientId = user?.id || "101";

    socket.emit("call-requested", {
      doctorId: doctor.id,
      patientId,
      channel,
      callId,
      timestamp: new Date().toISOString(),
    });

    setShowLiveDoctorsModal(false);
    setShowSearchModal(true);
    setLoading(true);

    // Set timeout for no response
    timeoutRef.current = setTimeout(() => {
      if (loading && !callStatus) {
        handleNoResponse();
      }
    }, 30000);
  };

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
          visible={showPetModal}
          onComplete={() => setShowPetModal(false)}
          updateUser={updateUser}
          token={token}
          user={user}
        />
      )}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchData} />
      }
      >
        <LinearGradient colors={["#7C3AED", "#EC4899"]} style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.appLogo} numberOfLines={1}>
                SnoutIQ
              </Text>
              <Text style={styles.welcomeSubtext} numberOfLines={1}>
                Welcome back, {user?.name?.split(" ")[0] || "Pet Parent"}!
              </Text>
            </View>
            <TouchableOpacity style={styles.userAvatar} activeOpacity={0.8}>
              <Text style={styles.userAvatarText}>
                {user?.name ? user.name.substring(0, 2).toUpperCase() : "SP"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Pet Info Card */}
          <View style={styles.petInfoCard}>
            <View style={styles.petCardLeft}>
              <View style={styles.petAvatarContainer}>
                <Text style={styles.petAvatarEmoji}>🐕</Text>
                <View style={styles.petStatusDot} />
              </View>
              <View style={styles.petCardInfo}>
                <Text style={styles.petName} numberOfLines={1}>
                  {user?.pet_name || "Max"}
                </Text>
                <Text style={styles.petBreed} numberOfLines={1}>
                  {user?.breed || "Golden Retriever"}
                </Text>
              </View>
            </View>
            <View style={styles.petCardRight}>
              <View style={styles.petStatItem}>
                <Text style={styles.petStatLabel}>Age</Text>
                <Text style={styles.petStatValue}>{user?.pet_age || "3"}y</Text>
              </View>
              <View style={styles.petStatDivider} />
              <View style={styles.petStatItem}>
                <Text style={styles.petStatLabel}>Gender</Text>
                <Text style={styles.petStatValue}>
                  {user?.pet_gender === "Male"
                    ? "♂"
                    : user?.pet_gender === "Female"
                    ? "♀"
                    : "⚤"}
                </Text>
              </View>
            </View>
          </View>

          {/* Location & Weather */}
          <View style={styles.locationWeatherRow}>
            <View style={styles.locationTag}>
              <Ionicons name="location" size={scale(14)} color="#FFFFFF" />
              <Text style={styles.locationTagText} numberOfLines={1}>
                {user?.city || "Gurugram"}
              </Text>
            </View>
            <DetailedWeatherWidget />
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
              navigation={navigation}
              onShowLiveDoctors={() => setShowLiveDoctorsModal(true)}
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
              <Text style={styles.serviceTitle} numberOfLines={2}>
                Book Clinic Visit
              </Text>
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
                <Ionicons
                  name="document-text"
                  size={scale(28)}
                  color="#007AFF"
                />
              </LinearGradient>
              <Text style={styles.serviceTitle} numberOfLines={2}>
                Health Records
              </Text>
              <Text style={styles.serviceSubtitle} numberOfLines={1}>
                View pet history
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceItem} activeOpacity={0.7}>
              <LinearGradient
                colors={["#E8F4FF", "#F0F8FF"]}
                style={styles.serviceIcon}
              >
                <Ionicons name="medkit" size={scale(28)} color="#FF3B30" />
              </LinearGradient>
              <Text style={styles.serviceTitle} numberOfLines={2}>
                Medicines
              </Text>
              <Text style={styles.serviceSubtitle} numberOfLines={1}>
                Order & refills
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Trust Badge Section */}
        <TrustBadge />

        <View style={{ height: SPACING.xxl * 2 }} />
      </ScrollView>

      {/* Modals */}
      <DoctorAppointmentModal
        visible={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        onBook={handleAppointmentBooked}
      />

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
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }}
        onFailure={handleNoResponse}
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
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: SPACING.xxl,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === "ios" ? SPACING.xl : SPACING.md,
    paddingBottom: SPACING.md,
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
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: SPACING.xs / 2,
  },
  welcomeSubtext: {
    fontSize: FONT_SIZES.small,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "500",
  },
  userAvatar: {
    width: scale(48),
    height: scale(48),
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: scale(24),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  userAvatarText: {
    fontSize: FONT_SIZES.large,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  petInfoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: moderateScale(16),
    padding: SPACING.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  petCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: SPACING.md,
  },
  petAvatarContainer: {
    position: "relative",
  },
  petAvatarEmoji: {
    fontSize: scale(40),
  },
  petStatusDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: scale(12),
    height: scale(12),
    borderRadius: scale(6),
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  petCardInfo: {
    flex: 1,
  },
  petName: {
    fontSize: FONT_SIZES.large,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: SPACING.xs / 2,
  },
  petBreed: {
    fontSize: FONT_SIZES.small,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "500",
  },
  petCardRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  petStatItem: {
    alignItems: "center",
  },
  petStatLabel: {
    fontSize: FONT_SIZES.tiny,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: SPACING.xs / 2,
    fontWeight: "500",
  },
  petStatValue: {
    fontSize: FONT_SIZES.large,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  petStatDivider: {
    width: 1,
    height: scale(30),
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  locationWeatherRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: SPACING.sm,
  },
  locationTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: moderateScale(20),
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  locationTagText: {
    fontSize: FONT_SIZES.small,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  sliderWrapper: {
    marginTop: -moderateScale(5),
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  sliderContainer: {
    borderRadius: moderateScale(16),
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  slide: {
    width: width - SPACING.lg * 2,
    height: verticalScale(120),
  },
  slideGradient: {
    flex: 1,
    borderRadius: moderateScale(16),
    padding: SPACING.lg,
    justifyContent: "center",
  },
  slideContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.lg,
  },
  slideIconContainer: {
    width: scale(56),
    height: scale(56),
    borderRadius: moderateScale(28),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  slideTextContainer: {
    flex: 1,
  },
  slideTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: SPACING.xs,
  },
  slideSubtitle: {
    fontSize: FONT_SIZES.small,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.xs,
    position: "absolute",
    bottom: SPACING.sm,
    alignSelf: "center",
  },
  paginationDot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  paginationDotActive: {
    width: scale(20),
    backgroundColor: "#FFFFFF",
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
  // Trust Badge Styles
  trustBadgeContainer: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  trustBadge: {
    borderRadius: moderateScale(20),
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  trustBadgeGradient: {
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  trustBadgeContent: {
    alignItems: "center",
  },
  trustIconsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  trustIcon: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  trustTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: SPACING.lg,
    textAlign: "center",
  },
  trustStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    marginBottom: SPACING.lg,
  },
  trustStatItem: {
    alignItems: "center",
    flex: 1,
  },
  trustStatNumber: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "800",
    color: "#7C3AED",
    marginBottom: SPACING.xs / 2,
  },
  trustStatLabel: {
    fontSize: FONT_SIZES.tiny,
    color: "#6B7280",
    fontWeight: "600",
    textAlign: "center",
  },
  trustStatDivider: {
    width: 1,
    height: scale(30),
    backgroundColor: "#E5E7EB",
  },
  trustFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: "rgba(124, 58, 237, 0.05)",
    borderRadius: moderateScale(12),
  },
  trustFooterText: {
    fontSize: FONT_SIZES.small,
    color: "#6B7280",
    fontWeight: "500",
  },
  floatingElement1: {
    position: "absolute",
    top: -10,
    right: 20,
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    backgroundColor: "rgba(236, 72, 153, 0.1)",
  },
  floatingElement2: {
    position: "absolute",
    bottom: 15,
    left: 15,
    width: scale(15),
    height: scale(15),
    borderRadius: scale(7.5),
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  floatingElement3: {
    position: "absolute",
    top: 30,
    left: -5,
    width: scale(12),
    height: scale(12),
    borderRadius: scale(6),
    backgroundColor: "rgba(59, 130, 246, 0.1)",
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
