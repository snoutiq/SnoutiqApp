import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import { useNavigation } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, FlatList, Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useAuth } from '../context/AuthContext';
import ProfileCompletionModalAuto from '../utils/ProfileCompletionModalAuto';

const HomePage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, chatRoomToken, updateChatRoomToken, justRegistered, clearJustRegistered } = useAuth();
  const [chatRoomID, setChatRoomID] = useState(0);
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: "Hello! I'm your Pet Care Assistant. I can help with pet health advice, training tips, behavior questions, and more. What would you like to know about your furry friend?",
      isUser: false,
      timestamp: Date.now() - 30000,
      feedback: null,
      emergencyStatus: null
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const flatListRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const [isLoading, setIsLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [contextToken, setContextToken] = useState("");
  const [weatherData, setWeatherData] = useState(null);

  const genId = () => `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const currentChatRoomToken = (route?.params && route.params.chat_room_token) ? route.params.chat_room_token : (chatRoomToken || "");

  useEffect(() => {
    console.log('justRegistered from AuthContext:', justRegistered);
    if (justRegistered) {
      console.log('Showing ProfileCompletionModalAuto');
    }
  }, [justRegistered]);

  // Enhanced animations
  useEffect(() => {
    // Pulse animation for online indicator
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Slide in animation for input
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();

    return () => pulseAnimation.stop();
  }, []);

  const handleModalSubmit = async (formData) => {
    try {
      setIsLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      const email = await AsyncStorage.getItem('userEmail');
      const google_token = await AsyncStorage.getItem('googleSub');
      console.log('Submitting pet details:', { userId, email, google_token, formData });

      const payload = {
        user_id: userId,
        pet_name: formData.petName,
        pet_type: formData.petType,
        pet_gender: formData.petGender,
        pet_age: formData.petAge,
        breed: formData.petBreed,
        pet_weight: formData.petWeight,
      };

      const response = await axios.post("https://snoutiq.com/backend/api/pet-details", payload);
      
      if (response.data.status === "success") {
        Alert.alert("Success", "Pet details saved successfully!");
        await clearJustRegistered();
      } else {
        Alert.alert("Error", response.data.message || "Failed to save pet details.");
      }
    } catch (error) {
      console.error("Error saving pet details:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to save pet details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      try {
        flatListRef.current?.scrollToEnd({ animated: true });
      } catch (e) {}
    }, 100);
  };

  const fetchWeatherData = async () => {
    try {
      const res = await axios.get('https://snoutiq.com/backend/api/weather/by-coords?lat=28.6139&lon=77.2090');
      if (res.data.status === 'success') {
        setWeatherData(res.data.current);
      }
    } catch (err) {
      console.log("Weather fetch failed", err);
    }
  };

  const fetchChatHistory = async () => {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) return;

    try {
      setIsLoading(true);
      let url;
      if (currentChatRoomToken) {
        url = `https://snoutiq.com/backend/api/chat-rooms/${currentChatRoomToken}/chats?user_id=${user.id}`;
      } else {
        url = `https://snoutiq.com/backend/api/chat-rooms/new?user_id=${user.id}`;
      }

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.chat_room_token && res.data?.chat_room_id) {
        updateChatRoomToken(res.data.chat_room_token);
        setChatRoomID(res.data.chat_room_id);
        setMessages([{
          id: genId(),
          text: "Hello! I'm your Pet Care Assistant. I can help with pet health advice, training tips, behavior questions, and more. What would you like to know about your furry friend?",
          isUser: false,
          timestamp: Date.now(),
          feedback: null,
          emergencyStatus: null
        }]);
      }

      if (res.data?.room && res.data?.chats) {
        updateChatRoomToken(res.data.room.chat_room_token);
        setChatRoomID(res.data.room.id);

        const msgs = res.data.chats
          .filter(chat => chat.question || chat.answer)
          .map(chat => {
            const createdAt = chat.created_at ? new Date(chat.created_at).getTime() : Date.now();
            const arr = [];

            if (chat.question) {
              arr.push({
                id: genId(),
                isUser: true,
                text: String(chat.question),
                timestamp: createdAt,
                feedback: null,
                emergencyStatus: null
              });
            }

            if (chat.answer) {
              arr.push({
                id: genId(),
                isUser: false,
                text: String(chat.answer),
                displayedText: chat.answer,
                timestamp: createdAt,
                feedback: null,
                emergencyStatus: chat.emergency_status || null
              });
            }

            if (chat.context_token) setContextToken(chat.context_token);
            return arr;
          })
          .flat();

        if (msgs.length) {
          setMessages(msgs);
        }
      }
    } catch (err) {
      console.log("❌ History fetch failed", err);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  useEffect(() => {
    if (user && isLoading) {
      fetchChatHistory();
      fetchWeatherData();
    }
  }, [currentChatRoomToken, user, isLoading]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true),
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false),
    );

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, []);

  useEffect(() => {
    if (flatListRef.current && messages.length) {
      setTimeout(() => flatListRef.current.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [messages]);

  const handleSendMessage = async (inputMessage) => {
    if (!inputMessage.trim() || sending) return;
    setSending(true);

    const userMsg = {
      id: genId(),
      text: inputMessage,
      isUser: true,
      timestamp: Date.now(),
      feedback: null,
      emergencyStatus: null
    };

    setMessages(prev => [...prev, userMsg]);

    const thinkingId = 'thinking_' + genId();
    const thinkingMessage = {
      id: thinkingId,
      text: "Typing...",
      isUser: false,
      timestamp: Date.now(),
      isThinking: true,
    };
    setMessages(prev => [...prev, thinkingMessage]);
    scrollToBottom();

    try {
      const token = await AsyncStorage.getItem("userToken");
      const payload = {
        question: inputMessage,
        user_id: user.id,
        chat_room_token: currentChatRoomToken || "",
        chat_room_id: chatRoomID || "",
        pet_name: user?.pet_name || "Unknown",
        pet_age: user?.pet_age?.toString() || "Unknown",
      };
      const res = await axios.post(
        "https://snoutiq.com/backend/api/chat/send",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages(prev => prev.filter(m => m.id !== thinkingId));

      const fullText = (res.data?.chat?.answer || res.data?.answer || "⚠️ No response").trim();
      const serverContextToken = res.data?.chat?.context_token || res.data?.context_token;
      const serverChatRoomToken = res.data?.chat?.chat_room_token || res.data?.chat_room_token;
      const emergencyStatus = res.data?.emergency_status || null;

      if (serverContextToken) setContextToken(serverContextToken);
      if (serverChatRoomToken && updateChatRoomToken) updateChatRoomToken(serverChatRoomToken);

      const aiMessage = {
        id: genId(),
        isUser: false,
        text: fullText,
        displayedText: fullText,
        timestamp: Date.now(),
        feedback: null,
        emergencyStatus: emergencyStatus
      };

      setMessages(prev => [...prev, aiMessage]);
      scrollToBottom();

    } catch (err) {
      console.log("Send message failed", err);
      setMessages(prev => prev.filter(m => !m.isThinking));
      Alert.alert("Error", "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleSend = () => {
    if (!inputText.trim() || sending || justRegistered) return;
    const textToSend = inputText;
    setInputText('');
    handleSendMessage(textToSend);
  };

  const handleFeedback = (messageId, feedbackType) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, feedback: feedbackType } : msg
    ));
  };

  const handleEmergencyAction = (actionType, message) => {
    if (actionType === 'appointment') {
      Alert.alert(
        "Emergency Appointment",
        "We'll help you find an available veterinarian immediately.",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          { 
            text: "Book Now", 
            onPress: () => navigation.navigate('Appointment', { 
              emergency: true,
              message: message.text 
            })
          }
        ]
      );
    } else if (actionType === 'video') {
      Alert.alert(
        "Video Consultation",
        "Connect with a veterinarian for a video consultation.",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          { 
            text: "Connect", 
            onPress: () => navigation.navigate('VideoConsult', { 
              contextToken: contextToken,
              message: message.text 
            })
          }
        ]
      );
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile');
    console.log('Profile pressed');
  };

  const renderMessage = ({ item, index }) => (
    <Animated.View 
      style={[
        styles.messageContainer, 
        { 
          opacity: fadeAnim,
          transform: [{
            translateX: item.isUser ? slideAnim : Animated.multiply(slideAnim, -1)
          }]
        }
      ]}
    >
      <View style={styles.messageAvatar}>
        <Animated.View style={[
          styles.avatarGlow, 
          item.isUser && styles.userAvatarGlow,
          !item.isUser && { transform: [{ scale: pulseAnim }] }
        ]}>
          <Ionicons
            name={item.isUser ? "person" : "paw"}
            size={scale(18)}
            color={item.isUser ? "#7c3aed" : "#2563EB"}
          />
        </Animated.View>
      </View>

      <View style={styles.messageContent}>
        <View style={[
          styles.messageBubble,
          item.isUser ? styles.userBubble : styles.botBubble,
          item.isThinking && styles.thinkingBubble
        ]}>
          {item.isThinking ? (
            <View style={styles.thinkingDots}>
              <Animated.View style={[styles.dot, styles.dot1]} />
              <Animated.View style={[styles.dot, styles.dot2]} />
              <Animated.View style={[styles.dot, styles.dot3]} />
            </View>
          ) : (
            <Text style={item.isUser ? styles.userMessageText : styles.botMessageText}>
              {item.text}
            </Text>
          )}
        </View>

        {!item.isThinking && (
          <View style={styles.messageFooter}>
            <View style={styles.messageFooterRow}>
              <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
              {!item.isUser && (
                <View style={styles.feedbackContainer}>
                  <TouchableOpacity
                    onPress={() => handleFeedback(item.id, 'like')}
                    style={[
                      styles.feedbackButton,
                      item.feedback === 'like' && styles.feedbackButtonActive
                    ]}
                  >
                    <Ionicons
                      name="thumbs-up"
                      size={scale(14)}
                      color={item.feedback === 'like' ? '#10b981' : '#64748b'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleFeedback(item.id, 'dislike')}
                    style={[
                      styles.feedbackButton,
                      item.feedback === 'dislike' && styles.feedbackButtonActive
                    ]}
                  >
                    <Ionicons
                      name="thumbs-down"
                      size={scale(14)}
                      color={item.feedback === 'dislike' ? '#ef4444' : '#64748b'}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>
            
            {!item.isUser && item.emergencyStatus && (
              <View style={styles.emergencyButtonsContainer}>
                {(item.emergencyStatus.includes('URGENT') || 
                  !item.emergencyStatus.includes('routine')) && (
                  <TouchableOpacity
                    style={styles.emergencyButton}
                    onPress={() => handleEmergencyAction('appointment', item)}
                    disabled={justRegistered}
                  >
                    <Ionicons
                      name="calendar"
                      size={scale(14)}
                      color="#dc2626"
                    />
                    <Text style={styles.emergencyButtonText}>Appointment</Text>
                  </TouchableOpacity>
                )}
                
                {(item.emergencyStatus.includes('routine') || 
                  !item.emergencyStatus.includes('URGENT')) && (
                  <TouchableOpacity
                    style={styles.emergencyButton}
                    onPress={() => handleEmergencyAction('video', item)}
                    disabled={justRegistered}
                  >
                    <Ionicons
                      name="videocam"
                      size={scale(14)}
                      color="#2563EB"
                    />
                    <Text style={styles.emergencyButtonText}>Video Consult</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>

      {/* Modal */}
      <ProfileCompletionModalAuto
        visible={justRegistered}
        onSubmit={handleModalSubmit}
        onClose={async () => await clearJustRegistered()}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBackground} />
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.openDrawer()}
            disabled={justRegistered}
          >
            <View style={styles.profileAvatar}>
              <Ionicons name="menu" size={scale(18)} color="#2563EB" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Pet Care Assistant</Text>
            <View style={styles.statusContainer}>
              <Animated.View 
                style={[
                  styles.onlineIndicator, 
                  { transform: [{ scale: pulseAnim }] }
                ]} 
              />
              <Text style={styles.headerSubtitle}>AI-powered pet advice</Text>
            </View>
          </View>

          <View style={styles.weatherContainer}>
            {weatherData ? (
              <View style={styles.weatherInfo}>
                <Ionicons
                  name={weatherData.weather === 'Sunny' ? 'sunny' : 'cloud'}
                  size={scale(18)}
                  color="#FFD700"
                />
                <Text style={styles.weatherText}>
                  {weatherData.temperatureC}°C {weatherData.weather}
                </Text>
              </View>
            ) : (
              <Text style={styles.weatherText}>Loading...</Text>
            )}
          </View>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Input Container */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inputContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <Animated.View 
          style={[
            styles.inputWrapper,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask about your pet's..."
              placeholderTextColor="#94a3b8"
              multiline
              maxLength={500}
              editable={!sending && !justRegistered}
            />
            <View style={styles.inputActions}>
              <TouchableOpacity style={styles.attachButton} disabled={justRegistered}>
                <Ionicons name="attach" size={scale(16)} color="#64748b" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sendButton, (!inputText.trim() || sending || justRegistered) && styles.sendButtonDisabled]}
                onPress={handleSend}
                disabled={!inputText.trim() || sending || justRegistered}
              >
                <Ionicons name="send" size={scale(16)} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
         
        <Animated.View 
          style={[
            styles.quickActionButtonsContainer,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <TouchableOpacity 
            style={[styles.quickActionButton, styles.healthButton]} 
            onPress={() => handleSendMessage("Tell me about my pet's health")} 
            disabled={justRegistered}
          >
            <Ionicons name="medical" size={scale(16)} color="#10b981" />
            <Text style={[styles.quickActionButtonText, styles.healthText]}>Pet Health</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.quickActionButton, styles.trainingButton]} 
            onPress={() => handleSendMessage("Give me training tips for my pet")} 
            disabled={justRegistered}
          >
            <Ionicons name="school" size={scale(16)} color="#f59e0b" />
            <Text style={[styles.quickActionButtonText, styles.trainingText]}>Training Tips</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.quickActionButton, styles.behaviorButton]} 
            onPress={() => handleSendMessage("Help me with behavior questions")} 
            disabled={justRegistered}
          >
            <Ionicons name="chatbubbles" size={scale(16)} color="#8b5cf6" />
            <Text style={[styles.quickActionButtonText, styles.behaviorText]}>Behavior Qs</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  header: {
    position: 'relative',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(12),
    overflow: 'hidden',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 1,
  },
  weatherContainer: {
    padding: scale(10),
    borderRadius: scale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherText: {
    fontSize: moderateScale(12),
    color: 'white',
    fontWeight: '600',
    marginLeft: scale(4),
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
    marginLeft: scale(16),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: 'white',
    marginBottom: verticalScale(2),
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineIndicator: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: '#10b981',
    marginRight: scale(6),
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  headerSubtitle: {
    fontSize: moderateScale(12),
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    textAlign: 'center',
  },
  profileButton: {
    padding: scale(4),
  },
  profileAvatar: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(20),
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: verticalScale(28),
    alignItems: 'flex-start'
  },
  messageAvatar: {
    marginRight: scale(14),
    marginTop: verticalScale(4)
  },
  avatarGlow: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  userAvatarGlow: {
    backgroundColor: '#f3e8ff',
    shadowColor: '#7c3aed',
  },
  messageContent: {
    flex: 1,
    alignItems: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(16),
    borderRadius: scale(24),
    marginBottom: verticalScale(8),
    maxWidth: '88%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  userBubble: {
    backgroundColor: '#f3e8ff',
    borderBottomRightRadius: scale(8),
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.1)',
  },
  botBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: scale(8),
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.1)',
  },
  thinkingBubble: {
    backgroundColor: 'white',
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(14),
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.1)',
  },
  thinkingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: '#2563EB',
    marginHorizontal: scale(3),
    opacity: 0.6,
  },
  dot1: {},
  dot2: {},
  dot3: {},
  userMessageText: {
    color: '#1e293b',
    fontSize: moderateScale(16),
    lineHeight: moderateScale(24),
    fontWeight: '500',
  },
  botMessageText: {
    color: '#1e293b',
    fontSize: moderateScale(16),
    lineHeight: moderateScale(24),
    fontWeight: '400',
  },
  messageFooter: {
    width: '100%',
    marginTop: verticalScale(6),
  },
  messageFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  timestamp: {
    fontSize: moderateScale(11),
    color: '#94a3b8',
    fontWeight: '500',
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackButton: {
    padding: scale(8),
    marginLeft: scale(6),
    borderRadius: scale(16),
    backgroundColor: 'transparent',
  },
  feedbackButtonActive: {
    backgroundColor: '#f1f5f9',
  },
  emergencyButtonsContainer: {
    flexDirection: 'row',
    marginTop: verticalScale(8),
    alignItems: 'center',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(8),
    borderRadius: scale(12),
    backgroundColor: '#f1f5f9',
    marginRight: scale(8),
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emergencyButtonText: {
    fontSize: moderateScale(12),
    marginLeft: scale(4),
    fontWeight: '500',
    color: '#1e293b',
  },
  inputContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(15),
    paddingBottom: verticalScale(10),
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: scale(24),
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: scale(12),
  },
  textInput: {
    flex: 1,
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(10),
    maxHeight: verticalScale(80),
    minHeight: verticalScale(44),
    fontSize: moderateScale(16),
    color: '#1e293b',
    lineHeight: moderateScale(22),
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(4),
  },
  attachButton: {
    padding: scale(8),
    borderRadius: scale(12),
    marginRight: scale(4),
  },
  sendButton: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
    elevation: 0,
  },
  quickActionButtonsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: moderateScale(45), 
    paddingHorizontal: scale(10), 
    paddingBottom: verticalScale(10) 
  },
  quickActionButton: { 
    flex: 1, 
    flexDirection: "row", 
    backgroundColor: '#ECF0F1', 
    paddingVertical: verticalScale(8), 
    marginHorizontal: scale(4), 
    borderRadius: scale(10), 
    justifyContent: 'center',
  },
  quickActionButtonText: { 
    color: 'black', 
    fontSize: moderateScale(12), 
    fontWeight: '600', 
    textAlign: 'center' 
  }
});

export default HomePage;