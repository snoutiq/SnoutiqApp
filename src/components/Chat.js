import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import ChatInput from "../components/ChatInput";
import { AuthContext } from "../context/AuthContext";
import ChatHistoryButton from "./ChatHistoryButton";
import DetailedWeatherWidget from "./DetailedWeatherWidget";
import { MessageBubble } from "./MessageBubble";

const { width, height } = Dimensions.get("window");

// Enhanced Responsive Design System
const DESIGN = {
  TYPOGRAPHY: {
    tiny: moderateScale(10),
    small: moderateScale(12),
    medium: moderateScale(14),
    large: moderateScale(16),
    xlarge: moderateScale(18),
    xxlarge: moderateScale(20),
    xxxlarge: moderateScale(24),
  },
  SPACING: {
    xs: moderateScale(4),
    sm: moderateScale(8),
    md: moderateScale(12),
    lg: moderateScale(16),
    xl: moderateScale(20),
    xxl: moderateScale(24),
    xxxl: moderateScale(32),
  },
  VERTICAL_SPACING: {
    xs: verticalScale(4),
    sm: verticalScale(8),
    md: verticalScale(12),
    lg: verticalScale(16),
    xl: verticalScale(20),
    xxl: verticalScale(24),
  },
  RADIUS: {
    sm: moderateScale(6),
    md: moderateScale(12),
    lg: moderateScale(16),
    xl: moderateScale(20),
    full: moderateScale(999),
  },
  COLORS: {
    primary: '#667eea',
    secondary: '#764ba2',
    white: '#FFFFFF',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    background: '#F0F4FF',
    purple50: '#F5F3FF',
    purple100: '#EDE9FE',
    purple500: '#8B5CF6',
    purple600: '#7C3AED',
    purple700: '#6D28D9',
  },
};

const Chat = ({ navigation, route }) => {
  const [showPetModal, setShowPetModal] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const {
    updateUser,
    user,
    token,
    chatRoomToken,
    updateChatRoomToken,
    updateNearbyDoctors,
  } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [contextToken, setContextToken] = useState("");
  const [nearbyDoctors, setNearbyDoctors] = useState([]);

  // Get current chat room token from route params or context
  const currentChatRoomToken = route.params?.chat_room_token || chatRoomToken;

  // Refs
  const scrollViewRef = useRef(null);
  const typingTimeouts = useRef(new Map());
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const prevChatRoomToken = useRef(currentChatRoomToken);
  const isUserDraggingRef = useRef(false);
  const isNearBottomRef = useRef(true);

  // Auto-send initial message
  useEffect(() => {
    if (route.params?.initialMessage && route.params?.isNewChat) {
      console.log("Auto-sending initial message:", route.params.initialMessage);

      const timer = setTimeout(() => {
        handleSendMessage(route.params.initialMessage);
        navigation.setParams({ initialMessage: null, isNewChat: false });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [route.params?.initialMessage, route.params?.isNewChat]);

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setIsKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Generate unique ID
  const genId = () => Date.now() + Math.random();

  // Check if pet data is complete
  useEffect(() => {
    if (user) {
      const hasPetData =
        user.pet_name && user.pet_gender && user.breed && user.pet_age;
      setShowPetModal(!hasPetData);
    }
  }, [user]);

  // Fetch nearby doctors
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

  const loadChatHistory = useCallback(
    async (roomToken) => {
      if (!roomToken || !user?.id || !token) {
        console.log("Missing required parameters for loading chat history");
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.get(
          `https://snoutiq.com/backend/api/chat-rooms/${roomToken}/chats?user_id=${user.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 100,
          }
        );

        console.log(
          "Full API response:",
          JSON.stringify(response.data, null, 2)
        );

        const messages = [];

        if (response.data && Array.isArray(response.data.chats)) {
          response.data.chats.forEach((chat) => {
            if (chat.question && chat.question.trim() !== "") {
              messages.push({
                id: `user-${chat.id}`,
                text: chat.question,
                sender: "user",
                timestamp: new Date(chat.created_at),
                displayedText: chat.question,
              });
            }

            if (chat.answer && chat.answer.trim() !== "") {
              messages.push({
                id: `ai-${chat.id}`,
                text: chat.answer,
                sender: "ai",
                timestamp: new Date(chat.created_at),
                displayedText: chat.answer,
                decision: chat.diagnosis,
                emergency_status: chat.emergency_status,
              });
            }
          });

          messages.sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          );

          console.log("Final sorted messages:", messages);
          setMessages(messages);

          const firstChatWithToken = response.data.chats.find(
            (chat) => chat.context_token
          );
          if (firstChatWithToken) {
            setContextToken(firstChatWithToken.context_token);
          }
        } else {
          console.log("No chats found in response");
          setMessages([]);
        }

        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 300);
      } catch (error) {
        console.error("Failed to load chat history:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, token]
  );

  // Load chat history when token changes
  useEffect(() => {
    console.log("Chat room token changed:", currentChatRoomToken);
    console.log("Route params:", route.params);

    // If there's an initial message to send, skip loading history
    if (route.params?.initialMessage && route.params?.isNewChat) {
      console.log("Has initial message, skipping history load");
      if (updateChatRoomToken && currentChatRoomToken !== chatRoomToken) {
        updateChatRoomToken(currentChatRoomToken);
      }
      return;
    }

    // Only proceed if token actually changed
    if (
      prevChatRoomToken.current === currentChatRoomToken &&
      !route.params?.timestamp
    ) {
      console.log("Token hasn't changed, skipping load");
      return;
    }

    prevChatRoomToken.current = currentChatRoomToken;

    if (!currentChatRoomToken) {
      console.log("No chat room token available");
      setMessages([]);
      return;
    }

    if (updateChatRoomToken && currentChatRoomToken !== chatRoomToken) {
      updateChatRoomToken(currentChatRoomToken);
    }

    const shouldLoadHistory = route.params?.loadHistory !== false;
    const isNewChat = route.params?.isNewChat === true;

    console.log(
      "shouldLoadHistory:",
      shouldLoadHistory,
      "isNewChat:",
      isNewChat
    );

    if (isNewChat) {
      console.log("Starting new chat - clearing messages");
      setMessages([]);
      setContextToken("");
    } else if (shouldLoadHistory) {
      console.log("Loading chat history for room:", currentChatRoomToken);
      loadChatHistory(currentChatRoomToken);
    } else {
      console.log("Skipping history load due to route params");
    }
  }, [currentChatRoomToken, route.params?.timestamp]);

  const scrollToBottom = useCallback(() => {
    if (!isUserDraggingRef.current && isNearBottomRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, []);

  const updateNearBottomFromEvent = useCallback((nativeEvent) => {
    if (!nativeEvent) return;
    const { contentSize, layoutMeasurement, contentOffset } = nativeEvent;
    const distanceFromBottom =
      (contentSize?.height || 0) - ((contentOffset?.y || 0) + (layoutMeasurement?.height || 0));
    isNearBottomRef.current = distanceFromBottom <= verticalScale(120);
  }, []);

  useEffect(() => {
    if (isKeyboardVisible) {
      scrollToBottom();
    }
  }, [isKeyboardVisible, scrollToBottom]);

  const cleanupTypingAnimation = useCallback((messageId) => {
    if (typingTimeouts.current.has(messageId)) {
      clearTimeout(typingTimeouts.current.get(messageId));
      typingTimeouts.current.delete(messageId);
    }
  }, []);

  const startTypingAnimation = useCallback(
    (messageId, fullText) => {
      cleanupTypingAnimation(messageId);

      let charIndex = 0;
      const typingSpeed = 40;
      const batchSize = 6;

      const typeNextBatch = () => {
        if (charIndex >= fullText.length) {
          cleanupTypingAnimation(messageId);
          scrollToBottom();
          return;
        }

        const nextIndex = Math.min(charIndex + batchSize, fullText.length);

        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, displayedText: fullText.slice(0, nextIndex) }
              : m
          )
        );

        charIndex = nextIndex;
        scrollToBottom();

        const timeoutId = setTimeout(typeNextBatch, typingSpeed);
        typingTimeouts.current.set(messageId, timeoutId);
      };

      const initialTimeout = setTimeout(typeNextBatch, 300);
      typingTimeouts.current.set(messageId, initialTimeout);
    },
    [cleanupTypingAnimation, scrollToBottom]
  );

  const handleSendMessage = useCallback(
    async (inputMessage) => {
      if (inputMessage.trim() === "" || sending) return;

      setSending(true);

      const userMsgId = genId();
      const loaderId = "__loader__";

      const userMessage = {
        id: userMsgId,
        text: inputMessage,
        sender: "user",
        timestamp: new Date(),
        displayedText: inputMessage,
      };

      const loaderMessage = {
        id: loaderId,
        type: "loading",
        sender: "ai",
        text: "",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage, loaderMessage]);
      scrollToBottom();

      try {
        const petData = {
          pet_name: user?.pet_name || "Unknown",
          pet_breed: user?.breed || "Unknown Breed",
          pet_age: user?.pet_age?.toString() || "Unknown",
          pet_location: "Unknown Location",
        };

        const payload = {
          user_id: user.id,
          question: inputMessage,
          context_token: contextToken || "",
          chat_room_token: currentChatRoomToken || "",
          ...petData,
        };

        console.log("Sending payload:", payload);

        const response = await axios.post(
          "https://snoutiq.com/backend/api/chat/send",
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 30000,
          }
        );

        console.log("API response:", response.data);

        const {
          context_token: newCtx,
          chat = {},
          decision,
          emergency_status,
        } = response.data || {};

        if (newCtx) setContextToken(newCtx);

        const fullText = String(chat.answer || "");
        const aiId = genId();

        setMessages((prev) =>
          prev.map((m) =>
            m.id === loaderId
              ? {
                  id: aiId,
                  sender: "ai",
                  text: fullText,
                  displayedText: "",
                  timestamp: new Date(),
                  decision,
                  emergency_status,
                }
              : m
          )
        );

        startTypingAnimation(aiId, fullText);
      } catch (error) {
        console.error("Error sending chat:", error);
        Alert.alert("Error", "Something went wrong. Please try again.");

        setMessages((prev) => {
          const filteredMessages = prev.filter((m) => m.id !== loaderId);
          const errorMessage = {
            id: genId(),
            text: "⚠️ Sorry, I'm having trouble connecting right now.",
            sender: "ai",
            timestamp: new Date(),
            isError: true,
            displayedText: "⚠️ Sorry, I'm having trouble connecting right now.",
          };
          return [...filteredMessages, errorMessage];
        });
      } finally {
        setSending(false);
      }
    },
    [
      sending,
      user,
      contextToken,
      currentChatRoomToken,
      token,
      startTypingAnimation,
      scrollToBottom,
    ]
  );

  const clearChat = useCallback(() => {
    Alert.alert(
      "Clear Chat",
      "Are you sure you want to clear the chat history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            typingTimeouts.current.forEach((timeout) => clearTimeout(timeout));
            typingTimeouts.current.clear();
            setMessages([]);
            setContextToken("");
          },
        },
      ]
    );
  }, []);

  const handleFeedback = useCallback(
    async (feedback, timestamp) => {
      try {
        const consultationId = messages.find(
          (msg) => msg.timestamp.getTime() === timestamp.getTime()
        )?.consultationId;

        if (!consultationId) return;

        await axios.post("/api/feedback", {
          consultationId,
          feedback,
        });

        Alert.alert("Success", "Thanks for your feedback!");
      } catch (error) {
        Alert.alert("Error", "Failed to submit feedback");
      }
    },
    [messages]
  );

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
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  if (isLoading && messages.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={DESIGN.COLORS.purple600} />
        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ===== ENHANCED PROFESSIONAL HEADER ===== */}
      <LinearGradient
        colors={[DESIGN.COLORS.primary, DESIGN.COLORS.secondary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          {/* Top Row - Logo and Navigation */}
          <View style={styles.headerTopRow}>
            <View style={styles.brandSection}>
              <Text style={styles.appLogo} numberOfLines={1}>
                SnoutIQ
              </Text>
                <View style={styles.greetingSection}>
            <Text style={styles.welcomeText}>
             Welcome {user?.name?.split(" ")[0] || "Pet Parent"}! 👋
            </Text>
          </View>
            </View>
            
            <View style={styles.headerActions}>
              <ChatHistoryButton
                navigation={navigation}
                currentChatRoomToken={currentChatRoomToken}
              />
            </View>
          </View>

          {/* User Greeting */}
     

          {/* Pet Info Card */}
          <View style={styles.petInfoCard}>
            <View style={styles.petInfoMain}>
              <View style={styles.petAvatar}>
                <Text style={styles.petAvatarEmoji}>
                  {user?.pet_gender === "Male" ? "🐕" : user?.pet_gender === "Female" ? "🐩" : "🐕‍🦺"}
                </Text>
                <View style={styles.petStatusIndicator} />
              </View>
              
              <View style={styles.petDetails}>
                <Text style={styles.petName} numberOfLines={1}>
                  {user?.pet_name || "Your Pet"}
                </Text>
                <Text style={styles.petBreed} numberOfLines={1}>
                  {user?.breed || "Add pet details"}
                </Text>
              </View>
            </View>

            <View style={styles.petStats}>
              <View style={styles.petStat}>
                <Text style={styles.petStatLabel}>Age</Text>
                <Text style={styles.petStatValue}>
                  {user?.pet_age || "?"}y
                </Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.petStat}>
                <Text style={styles.petStatLabel}>Gender</Text>
                <Text style={styles.petStatValue}>
                  {user?.pet_gender === "Male" ? "♂" : 
                   user?.pet_gender === "Female" ? "♀" : "⚤"}
                </Text>
              </View>
            </View>
          </View>

          {/* Location and Weather Row */}
          <View style={styles.locationWeatherRow}>
            <View style={styles.locationSection}>
              <Ionicons name="location" size={scale(14)} color={DESIGN.COLORS.white} />
              <Text style={styles.locationText} numberOfLines={1}>
                {user?.city || "Gurugram"}
              </Text>
            </View>
            
            <DetailedWeatherWidget />
          </View>
        </View>
      </LinearGradient>

      {/* ===== CHAT CONTENT AREA ===== */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? verticalScale(0) : 0}
      >
        <View style={styles.contentContainer}>
          {/* Loading Overlay */}
          {isLoading && messages.length === 0 && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={DESIGN.COLORS.purple600} />
            </View>
          )}

          {/* Messages Area */}
          <Animated.View
            style={[styles.messagesContainer, { opacity: fadeAnim }]}
          >
            <ScrollView
              ref={scrollViewRef}
              style={styles.scrollView}
              onScrollBeginDrag={() => {
                isUserDraggingRef.current = true;
              }}
              onScrollEndDrag={(e) => {
                isUserDraggingRef.current = false;
                updateNearBottomFromEvent(e?.nativeEvent);
              }}
              onMomentumScrollBegin={() => {
                isUserDraggingRef.current = true;
              }}
              onMomentumScrollEnd={(e) => {
                isUserDraggingRef.current = false;
                updateNearBottomFromEvent(e?.nativeEvent);
              }}
              onScroll={(e) => {
                updateNearBottomFromEvent(e?.nativeEvent);
              }}
              contentContainerStyle={[
                styles.messagesContent,
                {
                  paddingBottom: keyboardHeight > 0 ? 
                    DESIGN.VERTICAL_SPACING.xxl * 2 : 
                    DESIGN.VERTICAL_SPACING.xxl,
                },
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              keyboardDismissMode="interactive"
            >
              {messages.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyStateCard}>
                    {/* Welcome Illustration */}
                    <View style={styles.welcomeIllustration}>
                      <LinearGradient
                        colors={[DESIGN.COLORS.purple50, DESIGN.COLORS.purple100]}
                        style={styles.illustrationCircle}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Ionicons
                          name="sparkles"
                          size={scale(32)}
                          color={DESIGN.COLORS.purple600}
                        />
                      </LinearGradient>
                    </View>

                    {/* Welcome Text */}
                    <Text style={styles.emptyStateTitle}>
                      AI Pet Health Assistant
                    </Text>
                    <Text style={styles.emptyStateSubtitle}>
                      Get instant answers about your pet's health, behavior & care from our verified veterinary network
                    </Text>

                    {/* Features Grid */}
                    <View style={styles.featuresGrid}>
                      <View style={styles.featureItem}>
                        <View style={styles.featureIconContainer}>
                          <Ionicons name="flash" size={scale(16)} color={DESIGN.COLORS.purple600} />
                        </View>
                        <Text style={styles.featureText}>Instant Diagnosis</Text>
                      </View>
                      
                      <View style={styles.featureItem}>
                        <View style={styles.featureIconContainer}>
                          <Ionicons name="checkmark-circle" size={scale(16)} color={DESIGN.COLORS.purple600} />
                        </View>
                        <Text style={styles.featureText}>Vet Verified</Text>
                      </View>
                      
                      <View style={styles.featureItem}>
                        <View style={styles.featureIconContainer}>
                          <Ionicons name="time" size={scale(16)} color={DESIGN.COLORS.purple600} />
                        </View>
                        <Text style={styles.featureText}>24/7 Available</Text>
                      </View>
                      
                      <View style={styles.featureItem}>
                        <View style={styles.featureIconContainer}>
                          <Ionicons name="shield-checkmark" size={scale(16)} color={DESIGN.COLORS.purple600} />
                        </View>
                        <Text style={styles.featureText}>Personalized</Text>
                      </View>
                    </View>

                  </View>
                </View>
              ) : (
                messages.map((msg, index) => (
                  <MessageBubble
                    key={msg.id || `msg-${index}`}
                    msg={msg}
                    index={index}
                    onFeedback={handleFeedback}
                    nearbyDoctors={nearbyDoctors}
                    navigation={navigation}
                  />
                ))
              )}
            </ScrollView>
          </Animated.View>

          {/* Input Area */}
          <View
            style={[
              styles.inputContainer,
              {
                paddingBottom: keyboardHeight > 0 ? 
                  Platform.OS === 'ios' ? keyboardHeight - DESIGN.SPACING.md : DESIGN.SPACING.lg 
                  : DESIGN.SPACING.lg,
              },
            ]}
          >
            <ChatInput onSendMessage={handleSendMessage} isLoading={sending} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN.COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    position: "relative",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: DESIGN.COLORS.background,
    padding: DESIGN.SPACING.xxl,
  },
  loadingText: {
    marginTop: DESIGN.SPACING.lg,
    fontSize: DESIGN.TYPOGRAPHY.medium,
    color: DESIGN.COLORS.gray600,
    fontWeight: "500",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(248, 250, 252, 0.8)",
    zIndex: 10,
  },

  // ===== ENHANCED HEADER STYLES =====
  headerContent: {
    paddingHorizontal: DESIGN.SPACING.lg,
    paddingTop: Platform.OS === "ios" ? DESIGN.SPACING.sm : DESIGN.SPACING.md,
    paddingBottom: DESIGN.SPACING.lg,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  brandSection: {
    flex: 1,
  },
  appLogo: {
    fontSize: DESIGN.TYPOGRAPHY.xxxlarge,
    fontWeight: "800",
    color: DESIGN.COLORS.white,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: DESIGN.SPACING.md,
  },
  greetingSection: {
    marginBottom: DESIGN.SPACING.xs,
  },
  welcomeText: {
    fontSize: DESIGN.TYPOGRAPHY.large,
    color: "rgba(255, 255, 255, 0.95)",
    fontWeight: "600",
  },
  petInfoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: DESIGN.RADIUS.lg,
    padding: DESIGN.SPACING.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: DESIGN.SPACING.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  petInfoMain: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: DESIGN.SPACING.md,
  },
  petAvatar: {
    position: "relative",
  },
  petAvatarEmoji: {
    fontSize: scale(32),
  },
  petStatusIndicator: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: scale(14),
    height: scale(14),
    borderRadius: scale(7),
    backgroundColor: DESIGN.COLORS.success,
    borderWidth: 2,
    borderColor: DESIGN.COLORS.white,
  },
  petDetails: {
    flex: 1,
  },
  petName: {
    fontSize: DESIGN.TYPOGRAPHY.large,
    fontWeight: "700",
    color: DESIGN.COLORS.white,
    marginBottom: DESIGN.SPACING.xs / 2,
  },
  petBreed: {
    fontSize: DESIGN.TYPOGRAPHY.small,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "500",
  },
  petStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: DESIGN.SPACING.md,
  },
  petStat: {
    alignItems: "center",
    minWidth: scale(40),
  },
  petStatLabel: {
    fontSize: DESIGN.TYPOGRAPHY.tiny,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: DESIGN.SPACING.xs / 2,
    fontWeight: "500",
  },
  petStatValue: {
    fontSize: DESIGN.TYPOGRAPHY.large,
    fontWeight: "700",
    color: DESIGN.COLORS.white,
  },
  statDivider: {
    width: 1,
    height: verticalScale(24),
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  locationWeatherRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: DESIGN.SPACING.md,
  },
  locationSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: DESIGN.SPACING.xs,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: DESIGN.SPACING.md,
    paddingVertical: DESIGN.SPACING.xs,
    borderRadius: DESIGN.RADIUS.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    flex: 1,
  },
  locationText: {
    fontSize: DESIGN.TYPOGRAPHY.small,
    color: DESIGN.COLORS.white,
    fontWeight: "600",
    flex: 1,
  },

  // ===== MESSAGES & CONTENT STYLES =====
  messagesContainer: {
    flex: 1,
    backgroundColor: DESIGN.COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  messagesContent: {
    flexGrow: 1,
    paddingHorizontal: DESIGN.SPACING.lg,
    paddingTop: DESIGN.VERTICAL_SPACING.lg,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: DESIGN.SPACING.xl,
    minHeight: verticalScale(400),
  },
  emptyStateCard: {
    backgroundColor: DESIGN.COLORS.white,
    borderRadius: DESIGN.RADIUS.xl,
    padding: DESIGN.SPACING.xxl,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    width: "100%",
    maxWidth: scale(320),
    borderWidth: 1,
    borderColor: DESIGN.COLORS.gray100,
  },
  welcomeIllustration: {
    marginBottom: DESIGN.SPACING.xl,
  },
  illustrationCircle: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: DESIGN.COLORS.purple100,
  },
  emptyStateTitle: {
    fontSize: DESIGN.TYPOGRAPHY.xlarge,
    fontWeight: "700",
    color: DESIGN.COLORS.gray900,
    textAlign: "center",
    marginBottom: DESIGN.SPACING.md,
    lineHeight: DESIGN.TYPOGRAPHY.xlarge * 1.2,
  },
  emptyStateSubtitle: {
    fontSize: DESIGN.TYPOGRAPHY.medium,
    color: DESIGN.COLORS.gray600,
    textAlign: "center",
    lineHeight: DESIGN.TYPOGRAPHY.medium * 1.5,
    marginBottom: DESIGN.SPACING.xxl,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: DESIGN.SPACING.md,
    marginBottom: DESIGN.SPACING.xl,
    justifyContent: "center",
  },
  featureItem: {
    alignItems: "center",
    width: scale(70),
  },
  featureIconContainer: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: DESIGN.COLORS.purple50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: DESIGN.SPACING.xs,
    borderWidth: 1,
    borderColor: DESIGN.COLORS.purple100,
  },
  featureText: {
    fontSize: DESIGN.TYPOGRAPHY.tiny,
    fontWeight: "600",
    color: DESIGN.COLORS.purple700,
    textAlign: "center",
    lineHeight: DESIGN.TYPOGRAPHY.tiny * 1.2,
  },
  inputContainer: {
    backgroundColor: DESIGN.COLORS.white,
    borderTopWidth: 1,
    borderTopColor: DESIGN.COLORS.gray200,
    paddingHorizontal: DESIGN.SPACING.lg,
    paddingTop: DESIGN.SPACING.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
});
export default Chat;