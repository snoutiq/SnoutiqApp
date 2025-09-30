import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Animated,
  Dimensions,
  Platform,
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale, verticalScale } from "react-native-size-matters";
import { LinearGradient } from "expo-linear-gradient";
import { MessageBubble } from "./MessageBubble";
import ChatInput from "../components/ChatInput";
import PetDetailsModal from "../components/PetDetailsModal";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import ChatHistoryButton from "./ChatHistoryButton";

const { width, height } = Dimensions.get("window");

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

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setIsKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
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

  const loadChatHistory = useCallback(async (roomToken) => {
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
          timeout: 10000
        }
      );

      console.log("Full API response:", JSON.stringify(response.data, null, 2));

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

        messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        console.log("Final sorted messages:", messages);
        setMessages(messages);

        const firstChatWithToken = response.data.chats.find(chat => chat.context_token);
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
  }, [user?.id, token]);

  // Load chat history when token changes
  useEffect(() => {
    console.log("Chat room token changed:", currentChatRoomToken);
    console.log("Route params:", route.params);

    // Only proceed if token actually changed
    if (prevChatRoomToken.current === currentChatRoomToken && !route.params?.timestamp) {
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

    console.log("shouldLoadHistory:", shouldLoadHistory, "isNewChat:", isNewChat);

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
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
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
      const typingSpeed = 25;
      const batchSize = 3;

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
          pet_breed: "Unknown Breed",
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

        const response = await axios.post(
          "https://snoutiq.com/backend/api/chat/send",
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 30000,
          }
        );

        const {
          context_token: newCtx,
          chat = {},
          decision,
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
                  decision: decision,
                }
              : m
          )
        );

        startTypingAnimation(aiId, fullText);
      } catch (error) {
        console.error("Error sending chat:", error);
        Alert.alert("Error", "Something went wrong. Try again.");

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
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#7C3AED", "#EC4899"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <ChatHistoryButton 
              navigation={navigation}
              currentChatRoomToken={currentChatRoomToken}
            />
            <View>
              <Text style={styles.headerTitle}>Snoutiq AI</Text>
              <Text style={styles.headerSubtitle}>
                Ask questions about {user?.pet_name || "your pet"}'s health
              </Text>
            </View>
          </View>
          
          {messages.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearChat}
              disabled={sending}
            >
              <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.contentContainer}>
          <Animated.View style={[styles.messagesContainer, { opacity: fadeAnim }]}>
            <ScrollView
              ref={scrollViewRef}
              style={styles.scrollView}
              contentContainerStyle={styles.messagesContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {messages.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyStateCard}>
                    <LinearGradient
                      colors={['#EBF4FF', '#DBEAFE']}
                      style={styles.emptyStateIcon}
                    >
                      <Ionicons name="chatbubbles-outline" size={32} color="#3B82F6" />
                    </LinearGradient>
                    <Text style={styles.emptyStateTitle}>Start a Conversation</Text>
                    <Text style={styles.emptyStateSubtitle}>
                      Ask questions about your pet's health, behavior, nutrition, or any concerns you might have.
                    </Text>
                    <View style={styles.suggestionBox}>
                      <Text style={styles.suggestionTitle}>Try asking:</Text>
                      <Text style={styles.suggestionText}>• "My dog is vomiting, what should I do?"</Text>
                      <Text style={styles.suggestionText}>• "What vaccines does my kitten need?"</Text>
                      <Text style={styles.suggestionText}>• "Is this behavior normal for my pet?"</Text>
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

          <View style={styles.inputWrapper}>
            <ChatInput onSendMessage={handleSendMessage} isLoading={sending} />
          </View>
        </View>
      </KeyboardAvoidingView>

      <PetDetailsModal
        visible={showPetModal}
        onComplete={() => setShowPetModal(false)}
        updateUser={updateUser}
        token={token}
        user={user}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(12),
  },
  headerTitle: {
    fontSize: moderateScale(22),
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: moderateScale(2),
  },
  headerSubtitle: {
    fontSize: moderateScale(12),
    color: "rgba(255,255,255,0.8)",
  },
  clearButton: {
    padding: moderateScale(8),
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    marginLeft: moderateScale(8),
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: moderateScale(16),
    fontSize: moderateScale(16),
    color: "#6B7280",
  },
  header: {
    paddingHorizontal: moderateScale(20),
    paddingTop: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(16),
    paddingBottom: verticalScale(16),
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  messagesContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  messagesContent: {
    flexGrow: 1,
    paddingHorizontal: moderateScale(16),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(120), // INCREASED FOR TAB BAR + INPUT
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: moderateScale(32),
  },
  emptyStateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: moderateScale(24),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    maxWidth: moderateScale(320),
  },
  emptyStateIcon: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: moderateScale(16),
  },
  emptyStateTitle: {
    fontSize: moderateScale(18),
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: moderateScale(8),
  },
  emptyStateSubtitle: {
    fontSize: moderateScale(14),
    color: "#6B7280",
    textAlign: "center",
    lineHeight: moderateScale(20),
    marginBottom: moderateScale(16),
  },
  suggestionBox: {
    backgroundColor: "#EBF4FF",
    borderRadius: 12,
    padding: moderateScale(12),
    width: "100%",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  suggestionTitle: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    color: "#3B82F6",
    marginBottom: moderateScale(8),
  },
  suggestionText: {
    fontSize: moderateScale(12),
    color: "#1E40AF",
    marginBottom: moderateScale(4),
    lineHeight: moderateScale(16),
  },
  inputWrapper: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(8),
    paddingBottom: Platform.OS === 'ios' ? moderateScale(20) : moderateScale(8),
  },
});

export default Chat;