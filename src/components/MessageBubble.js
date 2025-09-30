import React, { useState, useEffect, useRef, memo } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale, verticalScale } from "react-native-size-matters";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { socket } from "../context/Socket";

const { width } = Dimensions.get("window");

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
              colors={["#0EA5E9", "#0284C7", "#0369A1"]}
              style={styles.searchIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="search" size={40} color="#FFFFFF" />
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
                colors={["#0EA5E9", "#0284C7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.progressGradient}
              />
            </Animated.View>
          </View>

          <View style={styles.searchingIndicators}>
            <View style={styles.indicatorRow}>
              <View style={styles.indicatorIconContainer}>
                <Ionicons name="location" size={16} color="#0EA5E9" />
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
                <Ionicons name="wifi" size={16} color="#10B981" />
              </View>
              <View style={styles.indicatorContent}>
                <Text style={styles.indicatorTitle}>Network Status</Text>
                <Text style={styles.indicatorSubtext}>
                  Connecting to servers
                </Text>
              </View>
              <ActivityIndicator size="small" color="#10B981" />
            </View>

            <View style={styles.indicatorRow}>
              <View style={styles.indicatorIconContainer}>
                <Ionicons name="people" size={16} color="#F59E0B" />
              </View>
              <View style={styles.indicatorContent}>
                <Text style={styles.indicatorTitle}>Doctor Availability</Text>
                <Text style={styles.indicatorSubtext}>Checking schedules</Text>
              </View>
              <Text style={styles.searchingText}>...</Text>
            </View>
          </View>

          <View style={styles.timerContainer}>
            <Ionicons name="time-outline" size={13} color="#9CA3AF" />
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
  const patientId = 101;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef(null);

  useEffect(() => {
    socket.emit("get-active-doctors");

    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    );
    glow.start();

    socket.on("call-sent", (data) => {
      setCallStatus({ type: "sent", ...data });
    });

    socket.on("call-accepted", (data) => {
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
    });

    socket.on("call-rejected", (data) => {
      setCallStatus({ type: "rejected", ...data });
      handleNoResponse();
    });

    return () => {
      socket.off("call-sent");
      socket.off("call-accepted");
      socket.off("call-rejected");
      glow.stop();
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
      <View style={styles.callButtonWrapper}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[
              styles.callButton,
              buttonDisabled && styles.callButtonDisabled,
            ]}
            onPress={startCall}
            disabled={buttonDisabled}
            activeOpacity={0.85}
          >
            {!buttonDisabled && (
              <Animated.View
                style={[styles.glowEffect, { opacity: glowOpacity }]}
              />
            )}

            <LinearGradient
              colors={
                buttonDisabled
                  ? ["#9CA3AF", "#6B7280"]
                  : ["#10B981", "#059669", "#047857"]
              }
              style={styles.callButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.buttonContent}>
                {buttonDisabled ? (
                  <>
                    <Ionicons name="videocam-off" size={20} color="#fff" />
                    <Text style={styles.callButtonText}>
                      No doctors available
                    </Text>
                  </>
                ) : (
                  <>
                    <View style={styles.iconContainer}>
                      <Ionicons name="videocam" size={19} color="#fff" />
                    </View>
                    <Text style={styles.callButtonText}>
                      Start Video Consultation
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color="#fff" />
                  </>
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {!buttonDisabled && (
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark" size={13} color="#10B981" />
            <Text style={styles.infoText}>
              Licensed veterinarians • Instant connection
            </Text>
          </View>
        )}
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

// ------------------- EmergencyStatusBox -------------------
const EmergencyStatusBox = memo(
  ({ decision, nearbyDoctors, navigation, messageId, isTypingComplete }) => {
    const slideAnim = useRef(new Animated.Value(50)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
      if (decision && isTypingComplete) {
        // Add delay before showing action box
        const timer = setTimeout(() => {
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 400,
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
        }, 300);

        return () => clearTimeout(timer);
      }
    }, [decision, isTypingComplete]);

    if (!decision || !isTypingComplete) return null;

    if (decision.includes("EMERGENCY")) {
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
              colors={["#FEF2F2", "#FEE2E2"]}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.actionHeader}>
                <View style={styles.actionIconWrapper}>
                  <LinearGradient
                    colors={["#EF4444", "#DC2626"]}
                    style={styles.actionIcon}
                  >
                    <Ionicons name="warning" size={24} color="#FFFFFF" />
                  </LinearGradient>
                </View>
                <View style={styles.actionHeaderText}>
                  <View style={styles.urgentBadge}>
                    <View style={styles.pulseDot} />
                    <Text style={styles.urgentBadgeText}>URGENT</Text>
                  </View>
                  <Text style={styles.actionTitle}>
                    Emergency Care Required
                  </Text>
                  <Text style={styles.actionSubtitle}>
                    Immediate attention needed
                  </Text>
                </View>
              </View>

              <View style={styles.warningBox}>
                <Ionicons name="alert-circle" size={18} color="#DC2626" />
                <Text style={styles.actionText}>
                  Your pet's symptoms require emergency care. Please contact a
                  veterinarian immediately.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate("BookClinicVisit")}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#EF4444", "#DC2626"]}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="flash" size={17} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Find Emergency Clinic</Text>
                  <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </Animated.View>
      );
    }

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
              colors={["#EFF6FF", "#DBEAFE"]}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.actionHeader}>
                <View style={styles.actionIconWrapper}>
                  <LinearGradient
                    colors={["#3B82F6", "#2563EB"]}
                    style={styles.actionIcon}
                  >
                    <Ionicons name="videocam" size={24} color="#FFFFFF" />
                  </LinearGradient>
                </View>
                <View style={styles.actionHeaderText}>
                  <View
                    style={[styles.urgentBadge, { backgroundColor: "#DBEAFE" }]}
                  >
                    <Ionicons name="star" size={11} color="#3B82F6" />
                    <Text
                      style={[styles.urgentBadgeText, { color: "#3B82F6" }]}
                    >
                      RECOMMENDED
                    </Text>
                  </View>
                  <Text style={[styles.actionTitle, { color: "#1E40AF" }]}>
                    Video Consultation
                  </Text>
                  <Text style={[styles.actionSubtitle, { color: "#3B82F6" }]}>
                    Connect with a vet instantly
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.warningBox,
                  {
                    backgroundColor: "rgba(255,255,255,0.9)",
                    borderColor: "#BFDBFE",
                  },
                ]}
              >
                <View style={styles.benefitRow}>
                  <Ionicons name="checkmark-circle" size={15} color="#10B981" />
                  <Text style={styles.benefitText}>Instant consultation</Text>
                </View>
                <View style={styles.benefitRow}>
                  <Ionicons name="checkmark-circle" size={15} color="#10B981" />
                  <Text style={styles.benefitText}>Professional advice</Text>
                </View>
              </View>

              <StartCallButton
                nearbyDoctors={nearbyDoctors}
                navigation={navigation}
              />
            </LinearGradient>
          </View>
        </Animated.View>
      );
    }

    if (decision.includes("IN_CLINIC")) {
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
              colors={["#fbf9f9ff", "#d3bad8ff"]}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.actionHeader}>
                <View style={styles.actionIconWrapper}>
                  <LinearGradient
                    colors={["#6B7280", "#4B5563"]}
                    style={styles.actionIcon}
                  >
                    <Ionicons name="medical" size={24} color="#FFFFFF" />
                  </LinearGradient>
                </View>
                <View style={styles.actionHeaderText}>
                  <Text style={[styles.actionTitle, { color: "#1F2937" }]}>
                    Consultation Options
                  </Text>
                  <Text style={[styles.actionSubtitle, { color: "#6B7280" }]}>
                    Choose video call or clinic visit
                  </Text>
                </View>
              </View>

              <View style={styles.optionsContainer}>
                <StartCallButton
                  nearbyDoctors={nearbyDoctors}
                  navigation={navigation}
                />

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => navigation.navigate("BookClinicVisit")}
                  activeOpacity={0.8}
                >
                  <View style={styles.secondaryButtonContent}>
                    <Ionicons name="business" size={18} color="#059669" />
                    <Text style={styles.secondaryButtonText}>
                      Book Clinic Visit
                    </Text>
                    <Ionicons name="arrow-forward" size={15} color="#059669" />
                  </View>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>
      );
    }
  },
  (prevProps, nextProps) => {
    return (
      prevProps.decision === nextProps.decision &&
      prevProps.messageId === nextProps.messageId &&
      prevProps.isTypingComplete === nextProps.isTypingComplete
    );
  }
);

// ------------------- MessageBubble -------------------
const MessageBubble = memo(
  ({ msg, index, nearbyDoctors, navigation }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;
    const [isTypingComplete, setIsTypingComplete] = useState(false);

    useEffect(() => {
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
    }, []);

    // Check if typing is complete
    useEffect(() => {
      if (msg.sender === "ai" && msg.text && msg.displayedText) {
        if (msg.displayedText.length >= msg.text.length) {
          setIsTypingComplete(true);
        }
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
            colors={["#0EA5E9", "#0284C7"]}
            style={styles.aiAvatar}
          >
            <Ionicons name="sparkles" size={16} color="#FFFFFF" />
          </LinearGradient>

          <View style={styles.loadingBubble}>
            <View style={styles.loadingHeader}>
              <Text style={styles.loadingText}>AI analyzing</Text>
            </View>
            <View style={styles.loadingDots}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
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
              colors={["#0EA5E9", "#0284C7"]}
              style={styles.aiAvatar}
            >
              <Ionicons name="medical" size={16} color="#FFFFFF" />
            </LinearGradient>
          )}

          <View
            style={[
              styles.bubble,
              isUser ? styles.userBubble : styles.aiBubble,
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
            <Text style={styles.timestamp}>
              {new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
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
      prevProps.msg.decision === nextProps.msg.decision
    );
  }
);

export { MessageBubble, StartCallButton, EmergencyStatusBox };

// ------------------- Styles -------------------
const styles = StyleSheet.create({
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: moderateScale(20),
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: moderateScale(24),
    width: "100%",
    maxWidth: moderateScale(380),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 16,
    position: "relative",
  },
  rippleCircle: {
    position: "absolute",
    width: moderateScale(140),
    height: moderateScale(140),
    borderRadius: moderateScale(70),
    backgroundColor: "#0EA5E9",
    top: moderateScale(30),
  },
  rippleCircle2: {
    backgroundColor: "#0284C7",
  },
  searchIconContainer: {
    marginBottom: verticalScale(20),
    position: "relative",
    zIndex: 2,
  },
  searchIcon: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  searchIconBorder: {
    position: "absolute",
    width: moderateScale(92),
    height: moderateScale(92),
    borderRadius: moderateScale(46),
    borderWidth: 2,
    borderColor: "rgba(14, 165, 233, 0.3)",
    top: -6,
    left: -6,
  },
  modalTitle: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: verticalScale(6),
  },
  modalSubtitle: {
    fontSize: moderateScale(13),
    color: "#64748B",
    textAlign: "center",
    marginBottom: verticalScale(18),
  },
  progressBarContainer: {
    width: "100%",
    height: moderateScale(6),
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
    gap: verticalScale(12),
    marginBottom: verticalScale(20),
  },
  indicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(12),
    paddingHorizontal: moderateScale(16),
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  indicatorIconContainer: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: moderateScale(12),
  },
  indicatorContent: {
    flex: 1,
  },
  indicatorTitle: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: moderateScale(2),
  },
  indicatorSubtext: {
    fontSize: moderateScale(11),
    color: "#6B7280",
  },
  statusDot: {
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: moderateScale(5),
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  statusDotInner: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: "#FFFFFF",
  },
  searchingText: {
    fontSize: moderateScale(14),
    color: "#F59E0B",
    fontWeight: "600",
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(6),
    marginBottom: verticalScale(20),
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(8),
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
  },
  timerText: {
    fontSize: moderateScale(12),
    color: "#92400E",
    fontWeight: "500",
  },
  cancelButton: {
    paddingVertical: verticalScale(14),
    paddingHorizontal: moderateScale(32),
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cancelButtonText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#6B7280",
  },

  // Call Button
  callButtonWrapper: {
    marginVertical: verticalScale(12),
  },
  callButton: {
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
  },
  callButtonDisabled: {
    opacity: 0.6,
  },
  glowEffect: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 14,
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  callButtonGradient: {
    paddingVertical: verticalScale(16),
    paddingHorizontal: moderateScale(20),
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(10),
  },
  iconContainer: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  callButtonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(15),
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(6),
    marginTop: verticalScale(10),
  },
  infoText: {
    fontSize: moderateScale(11),
    color: "#10B981",
    fontWeight: "600",
  },
  secondaryButtonContent: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: verticalScale(16),
    paddingHorizontal: moderateScale(20),
    justifyContent: "space-between",
    backgroundColor: "#cae9dfff",
  },

  // Action Container
  actionContainer: {
    marginVertical: verticalScale(12),
    marginHorizontal: moderateScale(16),
    maxWidth: "90%",
    alignSelf: "flex-start",
  },
  blurCard: {
    borderRadius: 20,
    overflow: "hidden",
  },
  actionCard: {
    borderRadius: 20,
    
  },
  actionGradient: {
    padding: moderateScale(10),
    borderRadius: 20,
  },
  actionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: verticalScale(16),
    gap: moderateScale(14),
    
  },
  actionIconLarge: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  actionHeaderText: {
    flex: 1,
  },

  urgentBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: moderateScale(10),
    paddingVertical: verticalScale(4),
    borderRadius: 6,
    marginBottom: verticalScale(8),
    gap: moderateScale(4),
  },
  pulseDot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: "#DC2626",
  },
  urgentBadgeText: {
    fontSize: moderateScale(10),
    fontWeight: "800",
    color: "#DC2626",
    letterSpacing: 0.5,
  },
  recommendedBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#DBEAFE",
    paddingHorizontal: moderateScale(10),
    paddingVertical: verticalScale(4),
    borderRadius: 6,
    marginBottom: verticalScale(8),
    gap: moderateScale(4),
  },
  recommendedBadgeText: {
    fontSize: moderateScale(10),
    fontWeight: "800",
    color: "#3B82F6",
    letterSpacing: 0.5,
  },
  actionTitle: {
    fontSize: moderateScale(17),
    fontWeight: "700",
    color: "#DC2626",
    marginBottom: verticalScale(4),
    lineHeight: moderateScale(22),
  },
  actionSubtitle: {
    fontSize: moderateScale(13),
    color: "#991B1B",
    fontWeight: "500",
    lineHeight: moderateScale(18),
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255,255,255,0.7)",
    padding: moderateScale(8),
    borderRadius: 12,
    gap: moderateScale(10),
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  actionText: {
    flex: 1,
    fontSize: moderateScale(13),
    color: "#374151",
    lineHeight: moderateScale(19),
    fontWeight: "500",
  },
  benefitsBox: {
    backgroundColor: "rgba(255,255,255,0.7)",
    padding: moderateScale(14),
    borderRadius: 12,
    marginBottom: verticalScale(16),
    gap: verticalScale(8),
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(8),
  },
  benefitText: {
    fontSize: moderateScale(13),
    color: "#1F2937",
    fontWeight: "500",
  },
  actionButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: verticalScale(14),
    paddingHorizontal: moderateScale(20),
    gap: moderateScale(8),
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(15),
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
    marginHorizontal: moderateScale(12),
    fontSize: moderateScale(12),
    fontWeight: "600",
    color: "#9CA3AF",
  },
  secondaryButton: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#059669",
  },
  secondaryButtonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: verticalScale(14),
    paddingHorizontal: moderateScale(20),
    gap: moderateScale(8),
  },
  secondaryButtonText: {
    color: "#059669",
    fontSize: moderateScale(15),
    fontWeight: "700",
  },

  // Message Bubble
  messageContainer: {
    marginVertical: verticalScale(6),
    maxWidth: "85%",
  },
  aiMessageContainer: {
    alignSelf: "flex-start",
  },
  userMessageContainer: {
    alignSelf: "flex-end",
  },
  aiAvatar: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(6),
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  bubble: {
    borderRadius: 18,
    paddingVertical: verticalScale(12),
    paddingHorizontal: moderateScale(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: "#0EA5E9",
    borderBottomRightRadius: 6,
  },
  aiBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  bubbleText: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
  },
  userText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  aiText: {
    color: "#1E293B",
  },
  timestamp: {
    fontSize: moderateScale(10),
    color: "#94A3B8",
    marginTop: verticalScale(4),
    marginLeft: moderateScale(4),
  },

  // Loading
  loadingBubble: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    paddingVertical: verticalScale(12),
    paddingHorizontal: moderateScale(16),
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  loadingHeader: {
    marginBottom: verticalScale(8),
  },
  loadingText: {
    fontSize: moderateScale(12),
    color: "#0EA5E9",
    fontWeight: "600",
  },
  loadingDots: {
    flexDirection: "row",
    gap: moderateScale(6),
  },
  dot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: 4,
    backgroundColor: "#0EA5E9",
  },
});
