// import { Ionicons } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useRoute } from '@react-navigation/native';
// import axios from 'axios';
// import { useNavigation } from 'expo-router';
// import { useEffect, useRef, useState } from 'react';
// import { Alert, Animated, FlatList, Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
// import { useAuth } from '../context/AuthContext';
// import ProfileCompletionModalAuto from '../utils/ProfileCompletionModalAuto';

// const HomePage = () => {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { user, chatRoomToken, updateChatRoomToken, justRegistered, clearJustRegistered } = useAuth();
//   const [chatRoomID, setChatRoomID] = useState(0);
//   const [messages, setMessages] = useState([
//     {
//       id: '1',
//       text: "Hello! I'm your Pet Care Assistant. I can help with pet health advice, training tips, behavior questions, and more. What would you like to know about your furry friend?",
//       isUser: false,
//       timestamp: Date.now() - 30000,
//       feedback: null,
//       emergencyStatus: null
//     }
//   ]);
//   const [inputText, setInputText] = useState('');
//   const [isKeyboardVisible, setKeyboardVisible] = useState(false);
//   const flatListRef = useRef(null);
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const [isLoading, setIsLoading] = useState(true);
//   const [sending, setSending] = useState(false);
//   const [contextToken, setContextToken] = useState("");
//   const [weatherData, setWeatherData] = useState(null);

//   const genId = () => `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
//   const currentChatRoomToken = (route?.params && route.params.chat_room_token) ? route.params.chat_room_token : (chatRoomToken || "");

//     const [loading, setLoading] = useState(false);
//   const [callStatus, setCallStatus] = useState(null);
//   const [activeDoctors, setActiveDoctors] = useState([]);
//   // const [selectedDoctor, setSelectedDoctor] = useState(501);
//   const [selectedDoctors, setSelectedDoctors] = useState(
//     nearbyDoctors ? nearbyDoctors.map((doc) => doc.id) : []
//   );
//   const [callDataMap, setCallDataMap] = useState({});
//   const navigate = useNavigate();
//   const [showModal, setShowModal] = useState(false);
//   console.log(nearbyDoctors, "cdfgdfgs");

//   const patientId = 101;
//     useEffect(() => {
//     if (user) {
//       const hasPetData =
//         user.pet_name && user.pet_gender && user.breed && user.pet_age;
//       if (!hasPetData) {
//         console.log("Missing pet data, showing modal");
//         setShowPetModal(true);
//       } else {
//         console.log("Pet data complete, hiding modal");
//         setShowPetModal(false);
//       }
//     } else {
//       setShowPetModal(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     // Get list of active doctors
//     socket.emit("get-active-doctors");

//     // Listen for call responses
//     socket.on("call-sent", (data) => {
//       setCallStatus({ type: "sent", ...data });
//       setLoading(false);
//     });

//     socket.on("call-accepted", (data) => {
//       setCallStatus({ type: "accepted", ...data });
//       setShowModal(false);

//       const doctor = nearbyDoctors.find((d) => d.id === data.doctorId);

//       // Check if payment is required
//       if (data.requiresPayment) {
//            const callData = callDataMap[data.doctorId];
//         // Redirect to payment page with call details
//         setTimeout(() => {
//           navigate(`/payment/${data.callId}`, {
//             state: {
//               doctor, // full doctor object
//               channel: data.channel,
//               patientId,
//                callId: data.callId,
//             },
//           });
//           // navigate(`/payment/${data.callId}?doctorId=${data.doctorId}&channel=${data.channel}&patientId=${patientId}`);
//         }, 2000);
//       } else {
//         // Direct video call (fallback)
//         setTimeout(() => {
//           // navigate(`/call-page/${data.channel}?uid=${patientId}&role=audience`);
//             navigate(`/call-page/${data.channel}?uid=${patientId}&role=audience&callId=${data.callId}`);
//         }, 2000);
//       }
//     });

//     socket.on("call-rejected", (data) => {
//       setCallStatus({ type: "rejected", ...data });
//       setLoading(false);
//       setShowModal(false);
//     });

//     socket.on("active-doctors", (doctors) => {
//       setActiveDoctors(doctors);
//       setShowModal(false);
//     });

//     // Listen for payment completion
//     socket.on("payment-completed", (data) => {
//       if (data.patientId === patientId) {
//         setCallStatus({ type: "payment-completed", ...data });
//         setTimeout(() => {
//           navigate(
//             `/call-page/${data.channel}?uid=${patientId}&role=audience&callId=${data.callId}`
//           );
//         }, 1000);
//       }
//     });

//     return () => {
//       socket.off("call-sent");
//       socket.off("call-accepted");
//       socket.off("call-rejected");
//       socket.off("active-doctors");
//       socket.off("payment-completed");
//     };
//   }, [navigate, patientId]);

//   const startCall = () => {
//     if (!selectedDoctors.length) {
//       alert("Please select at least one doctor");
//       return;
//     }

//     setLoading(true);
//     setShowModal(true);
//     setCallStatus(null);

//     const newCallDataMap = {};

//     selectedDoctors.forEach((doctorId) => {
//       const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
//       const channel = `channel_${callId}`;

//       const callData = {
//         doctorId,
//         patientId,
//         channel,
//         callId, // Include callId in the request
//       };

//       newCallDataMap[doctorId] = callData;

//       socket.emit("call-requested", callData);
//     });

//     setCallDataMap(newCallDataMap);
//   };

//   const getStatusMessage = () => {
//     if (!callStatus) return null;

//     switch (callStatus.type) {
//       case "sent":
//         return "📤 Call request sent to doctor. Waiting for response...";
//       case "accepted":
//         return callStatus.requiresPayment
//           ? "✅ Doctor accepted your call! Redirecting to payment..."
//           : "✅ Doctor accepted your call! Connecting...";
//       case "rejected":
//         return "❌ Doctor is currently unavailable. Please try again later.";
//       case "payment-completed":
//         return "💳 Payment successful! Connecting to video call...";
//       default:
//         return null;
//     }
//   };

//   useEffect(() => {
//     console.log('justRegistered from AuthContext:', justRegistered);
//     if (justRegistered) {
//       console.log('Showing ProfileCompletionModalAuto');
//     }
//   }, [justRegistered]);

//   const handleModalSubmit = async (formData) => {
//     try {
//       setIsLoading(true);
//       const userId = await AsyncStorage.getItem('userId');
//       const email = await AsyncStorage.getItem('userEmail');
//       const google_token = await AsyncStorage.getItem('googleSub');
//       console.log('Submitting pet details:', { userId, email, google_token, formData });

//       const payload = {
//         user_id: userId,
//         pet_name: formData.petName,
//         pet_type: formData.petType,
//         pet_gender: formData.petGender,
//         pet_age: formData.petAge,
//         breed: formData.petBreed,
//         pet_weight: formData.petWeight,
//       };

//       const response = await axios.post("https://snoutiq.com/backend/api/pet-details", payload);

//       if (response.data.status === "success") {
//         Alert.alert("Success", "Pet details saved successfully!");
//         await clearJustRegistered();
//       } else {
//         Alert.alert("Error", response.data.message || "Failed to save pet details.");
//       }
//     } catch (error) {
//       console.error("Error saving pet details:", error.response?.data || error.message);
//       Alert.alert("Error", "Failed to save pet details. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const scrollToBottom = () => {
//     setTimeout(() => {
//       try {
//         flatListRef.current?.scrollToEnd({ animated: true });
//       } catch (e) {}
//     }, 100);
//   };

//   const fetchWeatherData = async () => {
//     try {
//       const res = await axios.get('https://snoutiq.com/backend/api/weather/by-coords?lat=28.6139&lon=77.2090');
//       if (res.data.status === 'success') {
//         setWeatherData(res.data.current);
//       }
//     } catch (err) {
//       console.log("Weather fetch failed", err);
//     }
//   };

//   const fetchChatHistory = async () => {
//     const token = await AsyncStorage.getItem("userToken");
//     if (!token) return;

//     try {
//       setIsLoading(true);
//       let url;
//       if (currentChatRoomToken) {
//         url = `https://snoutiq.com/backend/api/chat-rooms/${currentChatRoomToken}/chats?user_id=${user.id}`;
//       } else {
//         url = `https://snoutiq.com/backend/api/chat-rooms/new?user_id=${user.id}`;
//       }

//       const res = await axios.get(url, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (res.data?.chat_room_token && res.data?.chat_room_id) {
//         updateChatRoomToken(res.data.chat_room_token);
//         setChatRoomID(res.data.chat_room_id);
//         setMessages([{
//           id: genId(),
//           text: "Hello! I'm your Pet Care Assistant. I can help with pet health advice, training tips, behavior questions, and more. What would you like to know about your furry friend?",
//           isUser: false,
//           timestamp: Date.now(),
//           feedback: null,
//           emergencyStatus: null
//         }]);
//       }

//       if (res.data?.room && res.data?.chats) {
//         updateChatRoomToken(res.data.room.chat_room_token);
//         setChatRoomID(res.data.room.id);

//         const msgs = res.data.chats
//           .filter(chat => chat.question || chat.answer)
//           .map(chat => {
//             const createdAt = chat.created_at ? new Date(chat.created_at).getTime() : Date.now();
//             const arr = [];

//             if (chat.question) {
//               arr.push({
//                 id: genId(),
//                 isUser: true,
//                 text: String(chat.question),
//                 timestamp: createdAt,
//                 feedback: null,
//                 emergencyStatus: null
//               });
//             }

//             if (chat.answer) {
//               arr.push({
//                 id: genId(),
//                 isUser: false,
//                 text: String(chat.answer),
//                 displayedText: chat.answer,
//                 timestamp: createdAt,
//                 feedback: null,
//                 emergencyStatus: chat.emergency_status || null
//               });
//             }

//             if (chat.context_token) setContextToken(chat.context_token);
//             return arr;
//           })
//           .flat();

//         if (msgs.length) {
//           setMessages(msgs);
//         }
//       }
//     } catch (err) {
//       console.log("❌ History fetch failed", err);
//     } finally {
//       setIsLoading(false);
//       scrollToBottom();
//     }
//   };

//   useEffect(() => {
//     if (user && isLoading) {
//       fetchChatHistory();
//       fetchWeatherData();
//     }
//   }, [currentChatRoomToken, user, isLoading]);

//   useEffect(() => {
//     const keyboardDidShowListener = Keyboard.addListener(
//       'keyboardDidShow',
//       () => setKeyboardVisible(true),
//     );
//     const keyboardDidHideListener = Keyboard.addListener(
//       'keyboardDidHide',
//       () => setKeyboardVisible(false),
//     );

//     return () => {
//       keyboardDidHideListener?.remove();
//       keyboardDidShowListener?.remove();
//     };
//   }, []);

//   useEffect(() => {
//     if (flatListRef.current && messages.length) {
//       setTimeout(() => flatListRef.current.scrollToEnd({ animated: true }), 100);
//     }
//   }, [messages]);

//   useEffect(() => {
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 300,
//       useNativeDriver: true,
//     }).start();
//   }, [messages]);

//   const handleSendMessage = async (inputMessage) => {
//     if (!inputMessage.trim() || sending) return;
//     setSending(true);

//     const userMsg = {
//       id: genId(),
//       text: inputMessage,
//       isUser: true,
//       timestamp: Date.now(),
//       feedback: null,
//       emergencyStatus: null
//     };

//     setMessages(prev => [...prev, userMsg]);

//     const thinkingId = 'thinking_' + genId();
//     const thinkingMessage = {
//       id: thinkingId,
//       text: "Typing...",
//       isUser: false,
//       timestamp: Date.now(),
//       isThinking: true,
//     };
//     setMessages(prev => [...prev, thinkingMessage]);
//     scrollToBottom();

//     try {
//       const token = await AsyncStorage.getItem("userToken");
//       const payload = {
//         question: inputMessage,
//         user_id: user.id,
//         chat_room_token: currentChatRoomToken || "",
//         chat_room_id: chatRoomID || "",
//         pet_name: user?.pet_name || "Unknown",
//         pet_age: user?.pet_age?.toString() || "Unknown",
//       };
//       const res = await axios.post(
//         "https://snoutiq.com/backend/api/chat/send",
//         payload,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       setMessages(prev => prev.filter(m => m.id !== thinkingId));

//       const fullText = (res.data?.chat?.answer || res.data?.answer || "⚠️ No response").trim();
//       const serverContextToken = res.data?.chat?.context_token || res.data?.context_token;
//       const serverChatRoomToken = res.data?.chat?.chat_room_token || res.data?.chat_room_token;
//       const emergencyStatus = res.data?.emergency_status || null;

//       if (serverContextToken) setContextToken(serverContextToken);
//       if (serverChatRoomToken && updateChatRoomToken) updateChatRoomToken(serverChatRoomToken);

//       const aiMessage = {
//         id: genId(),
//         isUser: false,
//         text: fullText,
//         displayedText: fullText,
//         timestamp: Date.now(),
//         feedback: null,
//         emergencyStatus: emergencyStatus
//       };

//       setMessages(prev => [...prev, aiMessage]);
//       scrollToBottom();

//     } catch (err) {
//       console.log("Send message failed", err);
//       setMessages(prev => prev.filter(m => !m.isThinking));
//       Alert.alert("Error", "Failed to send message");
//     } finally {
//       setSending(false);
//     }
//   };

//   const handleSend = () => {
//     if (!inputText.trim() || sending || justRegistered) return;
//     const textToSend = inputText;
//     setInputText('');
//     handleSendMessage(textToSend);
//   };

//   const handleFeedback = (messageId, feedbackType) => {
//     setMessages(prev => prev.map(msg =>
//       msg.id === messageId ? { ...msg, feedback: feedbackType } : msg
//     ));
//   };

//   const handleEmergencyAction = (actionType, message) => {
//     if (actionType === 'appointment') {
//       Alert.alert(
//         "Emergency Appointment",
//         "We'll help you find an available veterinarian immediately.",
//         [
//           {
//             text: "Cancel",
//             style: "cancel"
//           },
//           {
//             text: "Book Now",
//             onPress: () => navigation.navigate('Appointment', {
//               emergency: true,
//               message: message.text
//             })
//           }
//         ]
//       );
//     } else if (actionType === 'video') {
//       Alert.alert(
//         "Video Consultation",
//         "Connect with a veterinarian for a video consultation.",
//         [
//           {
//             text: "Cancel",
//             style: "cancel"
//           },
//           {
//             text: "Connect",
//             onPress: () => navigation.navigate('VideoConsult', {
//               contextToken: contextToken,
//               message: message.text
//             })
//           }
//         ]
//       );
//     }
//   };

//   const formatTime = (timestamp) => {
//     const date = new Date(timestamp);
//     return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
//   };

//   const handleProfilePress = () => {
//     navigation.navigate('Profile');
//     console.log('Profile pressed');
//   };

//   const renderMessage = ({ item }) => (
//     <Animated.View style={[styles.messageContainer, { opacity: fadeAnim }]}>
//       <View style={styles.messageAvatar}>
//         <View style={[styles.avatarGlow, item.isUser && styles.userAvatarGlow]}>
//           <Ionicons
//             name={item.isUser ? "person" : "paw"}
//             size={scale(18)}
//             color="#2563EB"
//           />
//         </View>
//       </View>

//       <View style={styles.messageContent}>
//         <View style={[
//           styles.messageBubble,
//           item.isUser ? styles.userBubble : styles.botBubble,
//           item.isThinking && styles.thinkingBubble
//         ]}>
//           {item.isThinking ? (
//             <View style={styles.thinkingDots}>
//               <View style={[styles.dot, styles.dot1]} />
//               <View style={[styles.dot, styles.dot2]} />
//               <View style={[styles.dot, styles.dot3]} />
//             </View>
//           ) : (
//             <Text style={item.isUser ? styles.userMessageText : styles.botMessageText}>
//               {item.text}
//             </Text>
//           )}
//         </View>

//         {!item.isThinking && (
//           <View style={styles.messageFooter}>
//             <View style={styles.messageFooterRow}>
//               <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
//               {!item.isUser && (
//                 <View style={styles.feedbackContainer}>
//                   <TouchableOpacity
//                     onPress={() => handleFeedback(item.id, 'like')}
//                     style={[
//                       styles.feedbackButton,
//                       item.feedback === 'like' && styles.feedbackButtonActive
//                     ]}
//                   >
//                     <Ionicons
//                       name="thumbs-up"
//                       size={scale(14)}
//                       color={item.feedback === 'like' ? '#2563EB' : '#64748b'}
//                     />
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     onPress={() => handleFeedback(item.id, 'dislike')}
//                     style={[
//                       styles.feedbackButton,
//                       item.feedback === 'dislike' && styles.feedbackButtonActive
//                     ]}
//                   >
//                     <Ionicons
//                       name="thumbs-down"
//                       size={scale(14)}
//                       color={item.feedback === 'dislike' ? '#2563EB' : '#64748b'}
//                     />
//                   </TouchableOpacity>
//                 </View>
//               )}
//             </View>

//             {!item.isUser && item.emergencyStatus && (
//               <View style={styles.emergencyButtonsContainer}>
//                 {(item.emergencyStatus.includes('URGENT') ||
//                   !item.emergencyStatus.includes('routine')) && (
//                   <TouchableOpacity
//                     style={styles.emergencyButton}
//                     onPress={() => handleEmergencyAction('appointment', item)}
//                     disabled={justRegistered}
//                   >
//                     <Ionicons
//                       name="calendar"
//                       size={scale(14)}
//                       color="#dc2626"
//                     />
//                     <Text style={styles.emergencyButtonText}>Appointment</Text>
//                   </TouchableOpacity>
//                 )}

//                 {(item.emergencyStatus.includes('routine') ||
//                   !item.emergencyStatus.includes('URGENT')) && (
//                   <TouchableOpacity
//                     style={styles.emergencyButton}
//                     // onPress={() => handleEmergencyAction('video', item)}
//                          onPress={startCall}
//                     // disabled={justRegistered}
//                      disabled={loading || selectedDoctors.length === 0}
//                   >
//                     <Ionicons
//                       name="videocam"
//                       size={scale(14)}
//                       color="#2563EB"
//                     />
//                     <Text style={styles.emergencyButtonText}>Video Consult</Text>
//                   </TouchableOpacity>
//                 )}
//               </View>
//             )}
//           </View>
//         )}
//       </View>
//     </Animated.View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <View style={styles.headerContent}>
//           <TouchableOpacity
//             style={styles.profileButton}
//             onPress={() => navigation.openDrawer()}
//             disabled={justRegistered}
//           >
//             <View style={styles.profileAvatar}>
//               <Ionicons name="menu" size={scale(18)} color="#2563EB" />
//             </View>
//           </TouchableOpacity>

//           <View style={styles.headerText}>
//             <Text style={styles.headerTitle}>Pet Care Assistant</Text>
//             <View style={styles.statusContainer}>
//               <View style={styles.onlineIndicator} />
//               <Text style={styles.headerSubtitle}>AI-powered pet advice</Text>
//             </View>
//           </View>

//           <View style={styles.weatherContainer}>
//             {weatherData ? (
//               <View style={styles.weatherInfo}>
//                 <Ionicons
//                   name={weatherData.weather === 'Sunny' ? 'sunny' : 'cloud'}
//                   size={scale(18)}
//                   color="#FFD700"
//                 />
//                 <Text style={styles.weatherText}>
//                   {weatherData.temperatureC}°C {weatherData.weather}
//                 </Text>
//               </View>
//             ) : (
//               <Text style={styles.weatherText}>Loading...</Text>
//             )}
//           </View>
//         </View>
//       </View>

//       {/* Messages List */}
//       <FlatList
//         ref={flatListRef}
//         data={messages}
//         renderItem={renderMessage}
//         keyExtractor={item => item.id}
//         style={styles.messagesList}
//         contentContainerStyle={styles.messagesContainer}
//         showsVerticalScrollIndicator={false}
//       />

//       {/* Input Container */}
//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         style={styles.inputContainer}
//         keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
//       >
//         <View style={styles.inputWrapper}>
//           <View style={styles.textInputContainer}>
//             <TextInput
//               style={styles.textInput}
//               value={inputText}
//               onChangeText={setInputText}
//               placeholder="Ask about your pet's..."
//               placeholderTextColor="#94a3b8"
//               multiline
//               maxLength={500}
//               editable={!sending && !justRegistered}
//             />
//             <View style={styles.inputActions}>
//               <TouchableOpacity style={styles.attachButton} disabled={justRegistered}>
//                 <Ionicons name="attach" size={scale(16)} color="#64748b" />
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.sendButton, (!inputText.trim() || sending || justRegistered) && styles.sendButtonDisabled]}
//                 onPress={handleSend}
//                 disabled={!inputText.trim() || sending || justRegistered}
//               >
//                 <Ionicons name="send" size={scale(16)} color="white" />
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>

//         <View style={styles.quickActionButtonsContainer}>
//           <TouchableOpacity
//             style={styles.quickActionButton}
//             onPress={() => handleSendMessage("Tell me about my pet's health")}
//             disabled={justRegistered}
//           >
//             <Text style={styles.quickActionButtonText}>Pet Health</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.quickActionButton}
//             onPress={() => handleSendMessage("Give me training tips for my pet")}
//             disabled={justRegistered}
//           >
//             <Text style={styles.quickActionButtonText}>Training Tips</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.quickActionButton}
//             onPress={() => handleSendMessage("Help me with behavior questions")}
//             disabled={justRegistered}
//           >
//             <Text style={styles.quickActionButtonText}>Behavior Qs</Text>
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>

//       {/* Modal */}
//       <ProfileCompletionModalAuto
//         visible={justRegistered}
//         onSubmit={handleModalSubmit}
//         onClose={async () => await clearJustRegistered()}
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8fafc'
//   },
//   header: {
//     backgroundColor: '#2563EB',
//     paddingHorizontal: scale(20),
//     paddingVertical: verticalScale(12),
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   weatherContainer: {
//     padding: scale(8),
//     borderRadius: scale(20),
//     backgroundColor: '#d3d3d3',
//   },
//   weatherInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   weatherText: {
//     fontSize: moderateScale(12),
//     color: '#1e293b',
//     fontWeight: '500',
//     marginLeft: scale(4),
//   },
//   headerText: {
//     flex: 1,
//     alignItems: 'center',
//     marginLeft: scale(16),
//   },
//   headerTitle: {
//     fontSize: moderateScale(16),
//     fontWeight: '700',
//     color: 'white',
//     marginBottom: verticalScale(2),
//     textAlign: 'center',
//   },
//   statusContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   onlineIndicator: {
//     width: scale(6),
//     height: scale(6),
//     borderRadius: scale(3),
//     backgroundColor: '#10b981',
//     marginRight: scale(6),
//   },
//   headerSubtitle: {
//     fontSize: moderateScale(11),
//     color: 'white',
//     fontWeight: '500',
//     textAlign: 'center',
//   },
//   profileButton: {
//     padding: scale(4),
//   },
//   profileAvatar: {
//     width: scale(36),
//     height: scale(36),
//     borderRadius: scale(18),
//     backgroundColor: '#dbeafe',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#2563EB',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   messagesList: {
//     flex: 1,
//   },
//   messagesContainer: {
//     paddingHorizontal: scale(20),
//     paddingVertical: verticalScale(16),
//   },
//   messageContainer: {
//     flexDirection: 'row',
//     marginBottom: verticalScale(24),
//     alignItems: 'flex-start'
//   },
//   messageAvatar: {
//     marginRight: scale(12),
//     marginTop: verticalScale(4)
//   },
//   avatarGlow: {
//     width: scale(36),
//     height: scale(36),
//     borderRadius: scale(18),
//     backgroundColor: '#dbeafe',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#2563EB',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   userAvatarGlow: {
//     backgroundColor: '#e0e7ff',
//   },
//   messageContent: {
//     flex: 1,
//     alignItems: 'flex-start',
//   },
//   messageBubble: {
//     paddingHorizontal: scale(18),
//     paddingVertical: verticalScale(14),
//     borderRadius: scale(20),
//     marginBottom: verticalScale(6),
//     maxWidth: '85%',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   userBubble: {
//     backgroundColor: '#e0e7ff',
//     borderBottomRightRadius: scale(6),
//   },
//   botBubble: {
//     backgroundColor: '#f1f5f9',
//     borderBottomLeftRadius: scale(6),
//     paddingTop: verticalScale(6),
//   },
//   thinkingBubble: {
//     backgroundColor: '#f1f5f9',
//     paddingHorizontal: scale(16),
//     paddingVertical: verticalScale(12),
//   },
//   thinkingDots: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   dot: {
//     width: scale(6),
//     height: scale(6),
//     borderRadius: scale(3),
//     backgroundColor: '#94a3b8',
//     marginHorizontal: scale(2),
//   },
//   dot1: {},
//   dot2: {},
//   dot3: {},
//   userMessageText: {
//     color: '#1e293b',
//     fontSize: moderateScale(16),
//     lineHeight: moderateScale(24),
//     fontWeight: '400',
//   },
//   botMessageText: {
//     color: '#1e293b',
//     fontSize: moderateScale(16),
//     lineHeight: moderateScale(24),
//     fontWeight: '400',
//   },
//   messageFooter: {
//     width: '100%',
//     marginTop: verticalScale(4),
//   },
//   messageFooterRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     width: '100%',
//   },
//   timestamp: {
//     fontSize: moderateScale(11),
//     color: '#94a3b8',
//     fontWeight: '500',
//   },
//   feedbackContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   feedbackButton: {
//     padding: scale(6),
//     marginLeft: scale(8),
//     borderRadius: scale(12),
//     backgroundColor: 'transparent',
//   },
//   feedbackButtonActive: {
//     backgroundColor: '#f1f5f9',
//   },
//   emergencyButtonsContainer: {
//     flexDirection: 'row',
//     marginTop: verticalScale(8),
//     alignItems: 'center',
//   },
//   emergencyButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: scale(8),
//     borderRadius: scale(12),
//     backgroundColor: '#f1f5f9',
//     marginRight: scale(8),
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//   },
//   emergencyButtonText: {
//     fontSize: moderateScale(12),
//     marginLeft: scale(4),
//     fontWeight: '500',
//     color: '#1e293b',
//   },
//   inputContainer: {
//     backgroundColor: 'white',
//     borderTopWidth: 1,
//     borderTopColor: '#e2e8f0',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//     elevation: 3,
//   },
//   inputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     paddingHorizontal: scale(20),
//     paddingTop: verticalScale(15),
//     paddingBottom: verticalScale(10),
//   },
//   textInputContainer: {
//     flex: 1,
//     backgroundColor: '#f8fafc',
//     borderWidth: 1.5,
//     borderColor: '#e2e8f0',
//     borderRadius: scale(24),
//     overflow: 'hidden',
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingRight: scale(12),
//   },
//   textInput: {
//     flex: 1,
//     paddingHorizontal: scale(18),
//     paddingVertical: verticalScale(10),
//     maxHeight: verticalScale(80),
//     minHeight: verticalScale(44),
//     fontSize: moderateScale(16),
//     color: '#1e293b',
//     lineHeight: moderateScale(22),
//   },
//   inputActions: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: verticalScale(4),
//   },
//   attachButton: {
//     padding: scale(8),
//     borderRadius: scale(12),
//     marginRight: scale(4),
//   },
//   sendButton: {
//     width: scale(36),
//     height: scale(36),
//     borderRadius: scale(18),
//     backgroundColor: '#2563EB',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#2563EB',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   sendButtonDisabled: {
//     backgroundColor: '#cbd5e1',
//     shadowOpacity: 0,
//     elevation: 0,
//   },
//   quickActionButtonsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: moderateScale(45),
//     paddingHorizontal: scale(10),
//     paddingBottom: verticalScale(10)
//   },
//   quickActionButton: {
//     flex: 1,
//     flexDirection: "row",
//     backgroundColor: '#ECF0F1',
//     paddingVertical: verticalScale(8),
//     marginHorizontal: scale(4),
//     borderRadius: scale(10),
//     justifyContent: 'center',
//   },
//   quickActionButtonText: {
//     color: 'black',
//     fontSize: moderateScale(12),
//     fontWeight: '600',
//     textAlign: 'center'
//   }
// });

// export default HomePage;

// import { Ionicons } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useRoute } from '@react-navigation/native';
// import axios from 'axios';
// import { useNavigation } from 'expo-router';
// import { useEffect, useRef, useState } from 'react';
// import { Alert, Animated, FlatList, Keyboard, KeyboardAvoidingView, Modal, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
// import { useAuth } from '../context/AuthContext';
// import ProfileCompletionModalAuto from '../utils/ProfileCompletionModalAuto';
// import { socket } from '../context/Socket';

// const HomePage = () => {
//   const navigation = useNavigation();

//   const route = useRoute();
//   const { user, token, chatRoomToken, updateChatRoomToken, justRegistered, clearJustRegistered, updateNearbyDoctors } = useAuth();

//   const [chatRoomID, setChatRoomID] = useState(0);
//   const [messages, setMessages] = useState([
//     {
//       id: '1',
//       text: "Hello! I'm your Pet Care Assistant. I can help with pet health advice, training tips, behavior questions, and more. What would you like to know about your furry friend?",
//       isUser: false,
//       timestamp: Date.now() - 30000,
//       feedback: null,
//       emergencyStatus: null
//     }
//   ]);
//   const [inputText, setInputText] = useState('');
//   const [isKeyboardVisible, setKeyboardVisible] = useState(false);
//   const flatListRef = useRef(null);
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const [isLoading, setIsLoading] = useState(true);
//   const [sending, setSending] = useState(false);
//   const [contextToken, setContextToken] = useState("");
//   const [weatherData, setWeatherData] = useState(null);

//   const genId = () => `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
//   const currentChatRoomToken = (route?.params && route.params.chat_room_token) ? route.params.chat_room_token : (chatRoomToken || "");

//   const [loading, setLoading] = useState(false);
//   const [callStatus, setCallStatus] = useState(null);
//   const [activeDoctors, setActiveDoctors] = useState([]);
//   const [selectedDoctors, setSelectedDoctors] = useState([]);
//   const [callDataMap, setCallDataMap] = useState({});
//   const [showCallModal, setShowCallModal] = useState(false);
//   const [showPetModal, setShowPetModal] = useState(false);
//   const [nearbyDoctors, setNearbyDoctors] = useState([]);
//    const [showModal, setShowModal] = useState(false);

//   const patientId = user?.id || 101;

//   const fetchNearbyDoctors = async () => {
//     if (!token) {
//       console.log("Token not available");
//       return;
//     }

//     try {
//       console.log("Fetching nearby doctors...");
//       const res = await axios.get(
//         `https://snoutiq.com/backend/api/nearby-vets?user_id=${user.id}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       if (res.data && res.data.status === "success" && Array.isArray(res.data.data)) {
//         const doctors = res.data.data;
//         setNearbyDoctors(doctors);
//         if (updateNearbyDoctors) {
//           updateNearbyDoctors(doctors);
//         }

//         // Auto-select first available doctor
//         if (doctors.length > 0) {
//           setSelectedDoctors([doctors[0].id]);
//           console.log("Selected doctor:", doctors[0].name);
//         }
//       } else {
//         console.log("No doctors found or invalid response format");
//         setNearbyDoctors([]);
//       }
//     } catch (err) {
//       console.error("Failed to fetch nearby doctors:", err.response?.data || err.message);
//       setNearbyDoctors([]);
//     }
//   };

//   useEffect(() => {
//     if (user && token) {
//       fetchNearbyDoctors();
//       const interval = setInterval(fetchNearbyDoctors, 5 * 60 * 1000);
//       return () => clearInterval(interval);
//     }
//   }, [user, token]);

//   useEffect(() => {
//     if (user) {
//       const hasPetData = user.pet_name && user.pet_gender && user.breed && user.pet_age;
//       if (!hasPetData) {
//         console.log("Missing pet data, showing modal");
//         setShowPetModal(true);
//       } else {
//         console.log("Pet data complete, hiding modal");
//         setShowPetModal(false);
//       }
//     } else {
//       setShowPetModal(false);
//     }
//   }, [user]);

//   // ---------------------------------------------------------
//     useEffect(() => {
//     // Get list of active doctors
//     socket.emit("get-active-doctors");

//     // Listen for call responses
//     socket.on("call-sent", (data) => {
//       setCallStatus({ type: "sent", ...data });
//       setLoading(false);
//     });

//     socket.on("call-accepted", (data) => {
//       setCallStatus({ type: "accepted", ...data });
//       setShowModal(false);
//     console.log('hii');
//       const doctor = nearbyDoctors.find((d) => d.id === data.doctorId);

//       // Check if payment is required
//       if (data.requiresPayment) {
//            const callData = callDataMap[data.doctorId];
//         // Redirect to payment page with call details
//         setTimeout(() => {
//           navigation(`/PaymentScreen/${data.callId}`, {
//             state: {
//               doctor, // full doctor object
//               channel: data.channel,
//               patientId,
//                callId: data.callId,
//             },
//           });
//           // navigate(`/payment/${data.callId}?doctorId=${data.doctorId}&channel=${data.channel}&patientId=${patientId}`);
//         }, 2000);
//       } else {
//         // Direct video call (fallback)
//         setTimeout(() => {
//           // navigate(`/call-page/${data.channel}?uid=${patientId}&role=audience`);
//             navigation(`/call-page/${data.channel}?uid=${patientId}&role=audience&callId=${data.callId}`);
//         }, 2000);
//       }
//     });

//     socket.on("call-rejected", (data) => {
//       setCallStatus({ type: "rejected", ...data });
//       setLoading(false);
//       setShowModal(false);
//     });

//     socket.on("active-doctors", (doctors) => {
//       setActiveDoctors(doctors);
//       setShowModal(false);
//     });

//     // Listen for payment completion
//     socket.on("payment-completed", (data) => {
//       if (data.patientId === patientId) {
//         setCallStatus({ type: "payment-completed", ...data });
//         setTimeout(() => {
//           navigation(
//             `/call-page/${data.channel}?uid=${patientId}&role=audience&callId=${data.callId}`
//           );
//         }, 1000);
//       }
//     });

//     return () => {
//       socket.off("call-sent");
//       socket.off("call-accepted");
//       socket.off("call-rejected");
//       socket.off("active-doctors");
//       socket.off("payment-completed");
//     };
//   }, [navigation, patientId]);

//   const startCall = () => {
//     if (!selectedDoctors.length) {
//       alert("Please select at least one doctor");
//       return;
//     }

//     setLoading(true);
//     setShowModal(true);
//     setCallStatus(null);

//     const newCallDataMap = {};

//     selectedDoctors.forEach((doctorId) => {
//       const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
//       const channel = `channel_${callId}`;

//       const callData = {
//         doctorId,
//         patientId,
//         channel,
//         callId, // Include callId in the request
//       };

//       newCallDataMap[doctorId] = callData;

//       socket.emit("call-requested", callData);
//     });

//     setCallDataMap(newCallDataMap);
//   };

//   const getStatusMessage = () => {
//     if (!callStatus) return null;

//     switch (callStatus.type) {
//       case "sent":
//         return "📤 Call request sent to doctor. Waiting for response...";
//       case "accepted":
//         return callStatus.requiresPayment
//           ? "✅ Doctor accepted your call! Redirecting to payment..."
//           : "✅ Doctor accepted your call! Connecting...";
//       case "rejected":
//         return "❌ Doctor is currently unavailable. Please try again later.";
//       case "payment-completed":
//         return "💳 Payment successful! Connecting to video call...";
//       default:
//         return null;
//     }
//   };

//   // ----------------------------------------------------------
//   // Mock socket event handlers
//   useEffect(() => {
//     const mockSocketEvents = () => {
//       if (showCallModal && loading) {
//         const timer = setTimeout(() => {
//           if (selectedDoctors.length > 0) {
//             const doctorId = selectedDoctors[0];
//             const doctor = nearbyDoctors.find(d => d.id === doctorId);

//             if (doctor) {
//               const callId = `call_${Date.now()}`;
//               const channel = `channel_${callId}`;

//               handleCallAccepted({
//                 doctorId,
//                 patientId,
//                 channel,
//                 callId,
//                 requiresPayment: true
//               });
//             } else {
//               console.log("Doctor not found");
//               handleCallRejected();
//             }
//           } else {
//             console.log("No doctors selected");
//             handleCallRejected();
//           }
//         }, 3000);

//         return () => clearTimeout(timer);
//       }
//     };

//     mockSocketEvents();
//   }, [showCallModal, loading, selectedDoctors, nearbyDoctors]);

//   const handleCallAccepted = (data) => {
//     setCallStatus({ type: "accepted", ...data });
//     setLoading(false);

//     const doctor = nearbyDoctors.find((d) => d.id === data.doctorId);

//     if (doctor) {
//       setTimeout(() => {
//         setShowCallModal(false);
//         navigation('PaymentScreen', {
//           doctor,
//           channel: data.channel,
//           patientId,
//           callId: data.callId,
//         });
//       }, 1000);
//     } else {
//       console.log("Doctor not found for payment");
//       handleCallRejected();
//     }
//   };

//   const handleCallRejected = () => {
//     setCallStatus({ type: "rejected" });
//     setLoading(false);

//     setTimeout(() => {
//       setShowCallModal(false);
//       Alert.alert(
//         "No Doctors Available",
//         "Currently no veterinarians are available. Please try again later."
//       );
//     }, 2000);
//   };

//   const getAvailableDoctorsCount = () => {
//     return nearbyDoctors.length;
//   };

//   useEffect(() => {
//     console.log('justRegistered from AuthContext:', justRegistered);
//     if (justRegistered) {
//       console.log('Showing ProfileCompletionModalAuto');
//     }
//   }, [justRegistered]);

//   const handleModalSubmit = async (formData) => {
//     try {
//       setIsLoading(true);
//       const userId = await AsyncStorage.getItem('userId');
//       const email = await AsyncStorage.getItem('userEmail');
//       const google_token = await AsyncStorage.getItem('googleSub');
//       console.log('Submitting pet details:', { userId, email, google_token, formData });

//       const payload = {
//         user_id: userId,
//         pet_name: formData.petName,
//         pet_type: formData.petType,
//         pet_gender: formData.petGender,
//         pet_age: formData.petAge,
//         breed: formData.petBreed,
//         pet_weight: formData.petWeight,
//       };

//       const response = await axios.post("https://snoutiq.com/backend/api/pet-details", payload);

//       if (response.data.status === "success") {
//         Alert.alert("Success", "Pet details saved successfully!");
//         await clearJustRegistered();
//       } else {
//         Alert.alert("Error", response.data.message || "Failed to save pet details.");
//       }
//     } catch (error) {
//       console.error("Error saving pet details:", error.response?.data || error.message);
//       Alert.alert("Error", "Failed to save pet details. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Rest of your existing functions (scrollToBottom, fetchWeatherData, fetchChatHistory, etc.)
//   const scrollToBottom = () => {
//     setTimeout(() => {
//       try {
//         flatListRef.current?.scrollToEnd({ animated: true });
//       } catch (e) {}
//     }, 100);
//   };

//   const fetchWeatherData = async () => {
//     try {
//       const res = await axios.get('https://snoutiq.com/backend/api/weather/by-coords?lat=28.6139&lon=77.2090');
//       if (res.data.status === 'success') {
//         setWeatherData(res.data.current);
//       }
//     } catch (err) {
//       console.log("Weather fetch failed", err);
//     }
//   };

//   const fetchChatHistory = async () => {
//     const token = await AsyncStorage.getItem("userToken");
//     if (!token) return;

//     try {
//       setIsLoading(true);
//       let url;
//       if (currentChatRoomToken) {
//         url = `https://snoutiq.com/backend/api/chat-rooms/${currentChatRoomToken}/chats?user_id=${user.id}`;
//       } else {
//         url = `https://snoutiq.com/backend/api/chat-rooms/new?user_id=${user.id}`;
//       }

//       const res = await axios.get(url, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (res.data?.chat_room_token && res.data?.chat_room_id) {
//         updateChatRoomToken(res.data.chat_room_token);
//         setChatRoomID(res.data.chat_room_id);
//       }

//       if (res.data?.room && res.data?.chats) {
//         updateChatRoomToken(res.data.room.chat_room_token);
//         setChatRoomID(res.data.room.id);

//         const msgs = res.data.chats
//           .filter(chat => chat.question || chat.answer)
//           .map(chat => {
//             const createdAt = chat.created_at ? new Date(chat.created_at).getTime() : Date.now();
//             const arr = [];

//             if (chat.question) {
//               arr.push({
//                 id: genId(),
//                 isUser: true,
//                 text: String(chat.question),
//                 timestamp: createdAt,
//                 feedback: null,
//                 emergencyStatus: null
//               });
//             }

//             if (chat.answer) {
//               arr.push({
//                 id: genId(),
//                 isUser: false,
//                 text: String(chat.answer),
//                 displayedText: chat.answer,
//                 timestamp: createdAt,
//                 feedback: null,
//                 emergencyStatus: chat.emergency_status || null
//               });
//             }

//             if (chat.context_token) setContextToken(chat.context_token);
//             return arr;
//           })
//           .flat();

//         if (msgs.length) {
//           setMessages(msgs);
//         }
//       }
//     } catch (err) {
//       console.log("❌ History fetch failed", err);
//     } finally {
//       setIsLoading(false);
//       scrollToBottom();
//     }
//   };

//   useEffect(() => {
//     if (user && isLoading) {
//       fetchChatHistory();
//       fetchWeatherData();
//     }
//   }, [currentChatRoomToken, user, isLoading]);

//   useEffect(() => {
//     const keyboardDidShowListener = Keyboard.addListener(
//       'keyboardDidShow',
//       () => setKeyboardVisible(true),
//     );
//     const keyboardDidHideListener = Keyboard.addListener(
//       'keyboardDidHide',
//       () => setKeyboardVisible(false),
//     );

//     return () => {
//       keyboardDidHideListener?.remove();
//       keyboardDidShowListener?.remove();
//     };
//   }, []);

//   useEffect(() => {
//     if (flatListRef.current && messages.length) {
//       setTimeout(() => flatListRef.current.scrollToEnd({ animated: true }), 100);
//     }
//   }, [messages]);

//   useEffect(() => {
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 300,
//       useNativeDriver: true,
//     }).start();
//   }, [messages]);

//   const handleSendMessage = async (inputMessage) => {
//     if (!inputMessage.trim() || sending) return;
//     setSending(true);

//     const userMsg = {
//       id: genId(),
//       text: inputMessage,
//       isUser: true,
//       timestamp: Date.now(),
//       feedback: null,
//       emergencyStatus: null
//     };

//     setMessages(prev => [...prev, userMsg]);

//     const thinkingId = 'thinking_' + genId();
//     const thinkingMessage = {
//       id: thinkingId,
//       text: "Typing...",
//       isUser: false,
//       timestamp: Date.now(),
//       isThinking: true,
//     };
//     setMessages(prev => [...prev, thinkingMessage]);
//     scrollToBottom();

//     try {
//       const token = await AsyncStorage.getItem("userToken");
//       const payload = {
//         question: inputMessage,
//         user_id: user.id,
//         chat_room_token: currentChatRoomToken || "",
//         chat_room_id: chatRoomID || "",
//         pet_name: user?.pet_name || "Unknown",
//         pet_age: user?.pet_age?.toString() || "Unknown",
//       };
//       const res = await axios.post(
//         "https://snoutiq.com/backend/api/chat/send",
//         payload,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       setMessages(prev => prev.filter(m => m.id !== thinkingId));

//       const fullText = (res.data?.chat?.answer || res.data?.answer || "⚠️ No response").trim();
//       const serverContextToken = res.data?.chat?.context_token || res.data?.context_token;
//       const serverChatRoomToken = res.data?.chat?.chat_room_token || res.data?.chat_room_token;
//       const emergencyStatus = res.data?.emergency_status || null;

//       if (serverContextToken) setContextToken(serverContextToken);
//       if (serverChatRoomToken && updateChatRoomToken) updateChatRoomToken(serverChatRoomToken);

//       const aiMessage = {
//         id: genId(),
//         isUser: false,
//         text: fullText,
//         displayedText: fullText,
//         timestamp: Date.now(),
//         feedback: null,
//         emergencyStatus: emergencyStatus
//       };

//       setMessages(prev => [...prev, aiMessage]);
//       scrollToBottom();

//     } catch (err) {
//       console.log("Send message failed", err);
//       setMessages(prev => prev.filter(m => !m.isThinking));
//       Alert.alert("Error", "Failed to send message");
//     } finally {
//       setSending(false);
//     }
//   };

//   const handleSend = () => {
//     if (!inputText.trim() || sending || justRegistered) return;
//     const textToSend = inputText;
//     setInputText('');
//     handleSendMessage(textToSend);
//   };

//   const handleFeedback = (messageId, feedbackType) => {
//     setMessages(prev => prev.map(msg =>
//       msg.id === messageId ? { ...msg, feedback: feedbackType } : msg
//     ));
//   };

//   const handleEmergencyAction = (actionType, message) => {
//     if (actionType === 'appointment') {
//       Alert.alert(
//         "Emergency Appointment",
//         "We'll help you find an available veterinarian immediately.",
//         [
//           {
//             text: "Cancel",
//             style: "cancel"
//           },
//           {
//             text: "Book Now",
//             onPress: () => navigation('Appointment', {
//               emergency: true,
//               message: message.text
//             })
//           }
//         ]
//       );
//     } else if (actionType === 'video') {
//       startCall();
//     }
//   };

//   const formatTime = (timestamp) => {
//     const date = new Date(timestamp);
//     return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
//   };

//   const renderMessage = ({ item }) => (
//     <Animated.View style={[styles.messageContainer, { opacity: fadeAnim }]}>
//       <View style={styles.messageAvatar}>
//         <View style={[styles.avatarGlow, item.isUser && styles.userAvatarGlow]}>
//           <Ionicons
//             name={item.isUser ? "person" : "paw"}
//             size={scale(18)}
//             color="#2563EB"
//           />
//         </View>
//       </View>

//       <View style={styles.messageContent}>
//         <View style={[
//           styles.messageBubble,
//           item.isUser ? styles.userBubble : styles.botBubble,
//           item.isThinking && styles.thinkingBubble
//         ]}>
//           {item.isThinking ? (
//             <View style={styles.thinkingDots}>
//               <View style={[styles.dot, styles.dot1]} />
//               <View style={[styles.dot, styles.dot2]} />
//               <View style={[styles.dot, styles.dot3]} />
//             </View>
//           ) : (
//             <Text style={item.isUser ? styles.userMessageText : styles.botMessageText}>
//               {item.text}
//             </Text>
//           )}
//         </View>

//         {!item.isThinking && (
//           <View style={styles.messageFooter}>
//             <View style={styles.messageFooterRow}>
//               <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
//               {!item.isUser && (
//                 <View style={styles.feedbackContainer}>
//                   <TouchableOpacity
//                     onPress={() => handleFeedback(item.id, 'like')}
//                     style={[
//                       styles.feedbackButton,
//                       item.feedback === 'like' && styles.feedbackButtonActive
//                     ]}
//                   >
//                     <Ionicons
//                       name="thumbs-up"
//                       size={scale(14)}
//                       color={item.feedback === 'like' ? '#2563EB' : '#64748b'}
//                     />
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     onPress={() => handleFeedback(item.id, 'dislike')}
//                     style={[
//                       styles.feedbackButton,
//                       item.feedback === 'dislike' && styles.feedbackButtonActive
//                     ]}
//                   >
//                     <Ionicons
//                       name="thumbs-down"
//                       size={scale(14)}
//                       color={item.feedback === 'dislike' ? '#2563EB' : '#64748b'}
//                     />
//                   </TouchableOpacity>
//                 </View>
//               )}
//             </View>

//             {!item.isUser && item.emergencyStatus && (
//               <View style={styles.emergencyButtonsContainer}>
//                 {(item.emergencyStatus.includes('URGENT') ||
//                   !item.emergencyStatus.includes('routine')) && (
//                   <TouchableOpacity
//                     style={styles.emergencyButton}
//                     onPress={() => handleEmergencyAction('appointment', item)}
//                     disabled={justRegistered}
//                   >
//                     <Ionicons
//                       name="calendar"
//                       size={scale(14)}
//                       color="#dc2626"
//                     />
//                     <Text style={styles.emergencyButtonText}>Appointment</Text>
//                   </TouchableOpacity>
//                 )}

//                 {(item.emergencyStatus.includes('routine') ||
//                   !item.emergencyStatus.includes('URGENT')) && (
//                   <TouchableOpacity
//                     style={styles.emergencyButton}
//                     onPress={() => handleEmergencyAction('video', item)}
//                     disabled={loading || justRegistered || nearbyDoctors.length === 0}
//                   >
//                     <Ionicons
//                       name="videocam"
//                       size={scale(14)}
//                       color={nearbyDoctors.length === 0 ? "#94a3b8" : "#2563EB"}
//                     />
//                     <Text style={[
//                       styles.emergencyButtonText,
//                       nearbyDoctors.length === 0 && styles.disabledButtonText
//                     ]}>
//                       Video Consult {nearbyDoctors.length > 0 ? `(${nearbyDoctors.length} available)` : '(None)'}
//                     </Text>
//                   </TouchableOpacity>
//                 )}
//               </View>
//             )}
//           </View>
//         )}
//       </View>
//     </Animated.View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <View style={styles.headerContent}>
//           <TouchableOpacity
//             style={styles.profileButton}
//             onPress={() => navigation.openDrawer()}
//             disabled={justRegistered}
//           >
//             <View style={styles.profileAvatar}>
//               <Ionicons name="menu" size={scale(18)} color="#2563EB" />
//             </View>
//           </TouchableOpacity>

//           <View style={styles.headerText}>
//             <Text style={styles.headerTitle}>Pet Care Assistant</Text>
//             <View style={styles.statusContainer}>
//               <View style={styles.onlineIndicator} />
//               <Text style={styles.headerSubtitle}>
//                 {getAvailableDoctorsCount() > 0
//                   ? `${getAvailableDoctorsCount()} vets available`
//                   : 'Searching for vets...'}
//               </Text>
//             </View>
//           </View>

//           <View style={styles.weatherContainer}>
//             {weatherData ? (
//               <View style={styles.weatherInfo}>
//                 <Ionicons
//                   name={weatherData.weather === 'Sunny' ? 'sunny' : 'cloud'}
//                   size={scale(18)}
//                   color="#FFD700"
//                 />
//                 <Text style={styles.weatherText}>
//                   {weatherData.temperatureC}°C
//                 </Text>
//               </View>
//             ) : (
//               <Text style={styles.weatherText}>Loading...</Text>
//             )}
//           </View>
//         </View>
//       </View>

//       {/* Messages List */}
//       <FlatList
//         ref={flatListRef}
//         data={messages}
//         renderItem={renderMessage}
//         keyExtractor={item => item.id}
//         style={styles.messagesList}
//         contentContainerStyle={styles.messagesContainer}
//         showsVerticalScrollIndicator={false}
//       />

//       {/* Input Container */}
//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         style={styles.inputContainer}
//         keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
//       >
//         <View style={styles.inputWrapper}>
//           <View style={styles.textInputContainer}>
//             <TextInput
//               style={styles.textInput}
//               value={inputText}
//               onChangeText={setInputText}
//               placeholder="Ask about your pet's..."
//               placeholderTextColor="#94a3b8"
//               multiline
//               maxLength={500}
//               editable={!sending && !justRegistered}
//             />
//             <View style={styles.inputActions}>
//               <TouchableOpacity style={styles.attachButton} disabled={justRegistered}>
//                 <Ionicons name="attach" size={scale(16)} color="#64748b" />
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.sendButton, (!inputText.trim() || sending || justRegistered) && styles.sendButtonDisabled]}
//                 onPress={handleSend}
//                 disabled={!inputText.trim() || sending || justRegistered}
//               >
//                 <Ionicons name="send" size={scale(16)} color="white" />
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>

//         <View style={styles.quickActionButtonsContainer}>
//           <TouchableOpacity
//             style={styles.quickActionButton}
//             onPress={() => handleSendMessage("Tell me about my pet's health")}
//             disabled={justRegistered}
//           >
//             <Text style={styles.quickActionButtonText}>Pet Health</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.quickActionButton}
//             onPress={() => handleSendMessage("Give me training tips for my pet")}
//             disabled={justRegistered}
//           >
//             <Text style={styles.quickActionButtonText}>Training Tips</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.quickActionButton}
//             onPress={() => handleSendMessage("Help me with behavior questions")}
//             disabled={justRegistered}
//           >
//             <Text style={styles.quickActionButtonText}>Behavior Qs</Text>
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>

//       {/* Call Loading Modal */}
//       <Modal
//         visible={showCallModal}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => {
//           if (!loading) {
//             setShowCallModal(false);
//           }
//         }}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <View style={styles.loaderContainer}>
//               <Ionicons name="videocam" size={scale(40)} color="#2563EB" />
//               <Text style={styles.modalTitle}>Connecting to Veterinarian</Text>
//               <Text style={styles.modalSubtitle}>{getStatusMessage()}</Text>

//               {loading && (
//                 <View style={styles.loadingSpinner}>
//                   <Ionicons name="ellipsis-horizontal" size={scale(24)} color="#2563EB" />
//                 </View>
//               )}

//               {callStatus?.type === 'accepted' && callStatus.requiresPayment && (
//                 <View style={styles.successContainer}>
//                   <Ionicons name="checkmark-circle" size={scale(24)} color="#10B981" />
//                   <Text style={styles.successText}>Redirecting to payment...</Text>
//                 </View>
//               )}

//               {callStatus?.type === 'rejected' && (
//                 <View style={styles.errorContainer}>
//                   <Ionicons name="close-circle" size={scale(24)} color="#DC2626" />
//                   <Text style={styles.errorText}>No doctors available</Text>
//                 </View>
//               )}

//               {!loading && callStatus?.type !== 'accepted' && (
//                 <TouchableOpacity
//                   style={styles.cancelButton}
//                   onPress={() => setShowCallModal(false)}
//                 >
//                   <Text style={styles.cancelButtonText}>Cancel</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* Profile Completion Modal */}
//       <ProfileCompletionModalAuto
//         visible={justRegistered}
//         onSubmit={handleModalSubmit}
//         onClose={async () => await clearJustRegistered()}
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8fafc'
//   },
//   header: {
//     backgroundColor: '#2563EB',
//     paddingHorizontal: scale(20),
//     paddingVertical: verticalScale(12),
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   weatherContainer: {
//     padding: scale(8),
//     borderRadius: scale(20),
//     backgroundColor: 'rgba(255,255,255,0.2)',
//   },
//   weatherInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   weatherText: {
//     fontSize: moderateScale(12),
//     color: 'white',
//     fontWeight: '500',
//     marginLeft: scale(4),
//   },
//   headerText: {
//     flex: 1,
//     alignItems: 'center',
//     marginLeft: scale(16),
//   },
//   headerTitle: {
//     fontSize: moderateScale(16),
//     fontWeight: '700',
//     color: 'white',
//     marginBottom: verticalScale(2),
//     textAlign: 'center',
//   },
//   statusContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   onlineIndicator: {
//     width: scale(6),
//     height: scale(6),
//     borderRadius: scale(3),
//     backgroundColor: '#10b981',
//     marginRight: scale(6),
//   },
//   headerSubtitle: {
//     fontSize: moderateScale(11),
//     color: 'white',
//     fontWeight: '500',
//     textAlign: 'center',
//   },
//   profileButton: {
//     padding: scale(4),
//   },
//   profileAvatar: {
//     width: scale(36),
//     height: scale(36),
//     borderRadius: scale(18),
//     backgroundColor: '#dbeafe',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#2563EB',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   messagesList: {
//     flex: 1,
//   },
//   messagesContainer: {
//     paddingHorizontal: scale(20),
//     paddingVertical: verticalScale(16),
//   },
//   messageContainer: {
//     flexDirection: 'row',
//     marginBottom: verticalScale(24),
//     alignItems: 'flex-start'
//   },
//   messageAvatar: {
//     marginRight: scale(12),
//     marginTop: verticalScale(4)
//   },
//   avatarGlow: {
//     width: scale(36),
//     height: scale(36),
//     borderRadius: scale(18),
//     backgroundColor: '#dbeafe',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#2563EB',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   userAvatarGlow: {
//     backgroundColor: '#e0e7ff',
//   },
//   messageContent: {
//     flex: 1,
//     alignItems: 'flex-start',
//   },
//   messageBubble: {
//     paddingHorizontal: scale(18),
//     paddingVertical: verticalScale(14),
//     borderRadius: scale(20),
//     marginBottom: verticalScale(6),
//     maxWidth: '85%',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   userBubble: {
//     backgroundColor: '#e0e7ff',
//     borderBottomRightRadius: scale(6),
//   },
//   botBubble: {
//     backgroundColor: '#f1f5f9',
//     borderBottomLeftRadius: scale(6),
//     paddingTop: verticalScale(6),
//   },
//   thinkingBubble: {
//     backgroundColor: '#f1f5f9',
//     paddingHorizontal: scale(16),
//     paddingVertical: verticalScale(12),
//   },
//   thinkingDots: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   dot: {
//     width: scale(6),
//     height: scale(6),
//     borderRadius: scale(3),
//     backgroundColor: '#94a3b8',
//     marginHorizontal: scale(2),
//   },
//   dot1: {},
//   dot2: {},
//   dot3: {},
//   userMessageText: {
//     color: '#1e293b',
//     fontSize: moderateScale(16),
//     lineHeight: moderateScale(24),
//     fontWeight: '400',
//   },
//   botMessageText: {
//     color: '#1e293b',
//     fontSize: moderateScale(16),
//     lineHeight: moderateScale(24),
//     fontWeight: '400',
//   },
//   messageFooter: {
//     width: '100%',
//     marginTop: verticalScale(4),
//   },
//   messageFooterRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     width: '100%',
//   },
//   timestamp: {
//     fontSize: moderateScale(11),
//     color: '#94a3b8',
//     fontWeight: '500',
//   },
//   feedbackContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   feedbackButton: {
//     padding: scale(6),
//     marginLeft: scale(8),
//     borderRadius: scale(12),
//     backgroundColor: 'transparent',
//   },
//   feedbackButtonActive: {
//     backgroundColor: '#f1f5f9',
//   },
//   emergencyButtonsContainer: {
//     flexDirection: 'row',
//     marginTop: verticalScale(8),
//     alignItems: 'center',
//   },
//   emergencyButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: scale(8),
//     borderRadius: scale(12),
//     backgroundColor: '#f1f5f9',
//     marginRight: scale(8),
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//   },
//   emergencyButtonText: {
//     fontSize: moderateScale(12),
//     marginLeft: scale(4),
//     fontWeight: '500',
//     color: '#1e293b',
//   },
//   disabledButtonText: {
//     color: '#94a3b8',
//   },
//   inputContainer: {
//     backgroundColor: 'white',
//     borderTopWidth: 1,
//     borderTopColor: '#e2e8f0',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//     elevation: 3,
//   },
//   inputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     paddingHorizontal: scale(20),
//     paddingTop: verticalScale(15),
//     paddingBottom: verticalScale(10),
//   },
//   textInputContainer: {
//     flex: 1,
//     backgroundColor: '#f8fafc',
//     borderWidth: 1.5,
//     borderColor: '#e2e8f0',
//     borderRadius: scale(24),
//     overflow: 'hidden',
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingRight: scale(12),
//   },
//   textInput: {
//     flex: 1,
//     paddingHorizontal: scale(18),
//     paddingVertical: verticalScale(10),
//     maxHeight: verticalScale(80),
//     minHeight: verticalScale(44),
//     fontSize: moderateScale(16),
//     color: '#1e293b',
//     lineHeight: moderateScale(22),
//   },
//   inputActions: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: verticalScale(4),
//   },
//   attachButton: {
//     padding: scale(8),
//     borderRadius: scale(12),
//     marginRight: scale(4),
//   },
//   sendButton: {
//     width: scale(36),
//     height: scale(36),
//     borderRadius: scale(18),
//     backgroundColor: '#2563EB',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#2563EB',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   sendButtonDisabled: {
//     backgroundColor: '#cbd5e1',
//     shadowOpacity: 0,
//     elevation: 0,
//   },
//   quickActionButtonsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',

//     marginBottom: moderateScale(45),
//     paddingHorizontal: scale(10),
//     paddingBottom: verticalScale(10)
//   },
//   quickActionButton: {
//     flex: 1,
//     flexDirection: "row",
//     backgroundColor: '#ECF0F1',
//     paddingVertical: verticalScale(8),
//     marginHorizontal: scale(4),
//     borderRadius: scale(10),
//     justifyContent: 'center',
//   },
//   quickActionButtonText: {
//     color: 'black',
//     fontSize: moderateScale(12),
//     fontWeight: '600',
//     textAlign: 'center'
//   },
//   // Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     borderRadius: 20,
//     padding: moderateScale(24),
//     margin: moderateScale(20),
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//     minWidth: '80%',
//   },
//   loaderContainer: {
//     alignItems: 'center',
//     padding: moderateScale(16),
//   },
//   modalTitle: {
//     fontSize: moderateScale(18),
//     fontWeight: '600',
//     color: '#1e293b',
//     marginTop: verticalScale(16),
//     textAlign: 'center',
//   },
//   modalSubtitle: {
//     fontSize: moderateScale(14),
//     color: '#64748b',
//     textAlign: 'center',
//     marginTop: verticalScale(8),
//     lineHeight: moderateScale(20),
//   },
//   loadingSpinner: {
//     marginTop: verticalScale(20),
//   },
//   successContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: verticalScale(20),
//     backgroundColor: '#f0fdf4',
//     padding: moderateScale(12),
//     borderRadius: 12,
//   },
//   successText: {
//     fontSize: moderateScale(14),
//     color: '#059669',
//     // fontWeight}
//   }
// })
// export default HomePage;

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useNavigation } from "expo-router";

const { width } = Dimensions.get("window");

export default function DashboardScreen({ navigation }) {
  const [user, setUser] = useState({ name: "", location: "Delhi" });
  const [pet, setPet] = useState({ name: "Your Pet" });
  const [liveActivities, setLiveActivities] = useState(12);
  const [onlineUsers, setOnlineUsers] = useState(847);
  const Navigation = useNavigation();

  const liveEvents = [
    {
      id: "1",
      title: "Pet Yoga Session",
      location: "Connaught Place",
      time: "20 min",
      participants: 23,
      type: "live",
    },
    {
      id: "2",
      title: "Dog Training Workshop",
      location: "Lodhi Gardens",
      time: "1 hr",
      participants: 45,
      type: "upcoming",
    },
    {
      id: "3",
      title: "Adoption Drive",
      location: "India Gate",
      time: "2 hr",
      participants: 67,
      type: "upcoming",
    },
  ];

  const trendingChallenges = [
    {
      id: "1",
      title: "Morning Walk Streak",
      participants: 127,
      progress: 85,
      reward: "🏆 Fitness Badge",
    },
    {
      id: "2",
      title: "Healthy Treats Challenge",
      participants: 89,
      progress: 60,
      reward: "🥕 Nutrition Expert",
    },
  ];

  const petActivities = [
    { id: "1", activity: "Morning Walk", time: "7:00 AM", status: "completed" },
    { id: "2", activity: "Breakfast", time: "8:30 AM", status: "completed" },
    { id: "3", activity: "Play Time", time: "11:00 AM", status: "upcoming" },
  ];

  const healthInsights = [
    { metric: "Steps Today", value: "8,247", change: "+12%", trend: "up" },
    { metric: "Active Hours", value: "4.2h", change: "+5%", trend: "up" },
    { metric: "Calories Burned", value: "340", change: "+8%", trend: "up" },
    { metric: "Sleep Quality", value: "92%", change: "+3%", trend: "up" },
  ];

  useEffect(() => {
    loadUserData();

    const interval = setInterval(() => {
      setLiveActivities((prev) => prev + Math.floor(Math.random() * 3) - 1);
      setOnlineUsers((prev) => prev + Math.floor(Math.random() * 20) - 10);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      const petData = await AsyncStorage.getItem("petData");

      if (userData) {
        setUser(JSON.parse(userData));
      }
      if (petData) {
        setPet(JSON.parse(petData));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const renderLiveEvent = ({ item }) => (
    <View style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <View style={styles.eventBadge}>
          {item.type === "live" && <View style={styles.liveDot} />}
          <Text
            style={[
              styles.eventBadgeText,
              {
                color: item.type === "live" ? "#EF4444" : "#3B82F6",
              },
            ]}
          >
            {item.type === "live" ? "LIVE" : item.time}
          </Text>
        </View>
        <View style={styles.participantsContainer}>
          <Ionicons name="people" size={scale(12)} color="#6B7280" />
          <Text style={styles.participantsText}>{item.participants}</Text>
        </View>
      </View>
      <Text style={styles.eventTitle}>{item.title}</Text>
      <View style={styles.eventLocation}>
        <Ionicons name="location-outline" size={scale(12)} color="#6B7280" />
        <Text style={styles.eventLocationText}>{item.location}</Text>
      </View>
      <TouchableOpacity style={styles.eventButton}>
        <Text style={styles.eventButtonText}>
          {item.type === "live" ? "Join Now" : "Register"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient colors={["#7C3AED", "#EC4899"]} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Good morning,</Text>
              <Text style={styles.userName}>{user.name || "Pet Parent"}</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                onPress={() => navigation.navigate("Notifications")}
                style={styles.notificationButton}
              >
                <Ionicons
                  name="notifications"
                  size={scale(24)}
                  color="#FFFFFF"
                />
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>5</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate("Profile")}
                style={styles.notificationButton}
              >
                <View style={styles.profileButton}>
                  <Ionicons name="person" size={scale(24)} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.liveActivityBar}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>
                {liveActivities} live activities near you
              </Text>
            </View>
            <View style={styles.onlineUsers}>
              <Ionicons name="people" size={scale(16)} color="#FFFFFF" />
              <Text style={styles.onlineUsersText}>{onlineUsers} online</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Pet Status Card */}
          <View style={styles.petStatusCard}>
            <View style={styles.petStatusContent}>
              <View style={styles.petAvatar}>
                <Ionicons name="paw" size={scale(32)} color="#FFFFFF" />
              </View>
              <View style={styles.petInfo}>
                <Text style={styles.petName}>{pet.name}</Text>
                <Text style={styles.petMood}>Feeling energetic today! 🎾</Text>
                <View style={styles.healthStatus}>
                  <View style={styles.healthDot} />
                  <Text style={styles.healthText}>All vitals excellent</Text>
                </View>
              </View>
              <View style={styles.moodEmoji}>
                <Text style={styles.emojiText}>😊</Text>
                <Text style={styles.moodText}>Happy</Text>
              </View>
            </View>
          </View>

          {/* Live Events */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🔴 Happening Now</Text>
              <TouchableOpacity>
                <Text style={styles.sectionLink}>View All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={liveEvents}
              renderItem={renderLiveEvent}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.eventsContainer}
            />
          </View>

          {/* Trending Challenges */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🔥 Trending Challenges</Text>
              <TouchableOpacity>
                <Text style={styles.sectionLink}>Join All</Text>
              </TouchableOpacity>
            </View>
            {trendingChallenges.map((challenge) => (
              <View key={challenge.id} style={styles.challengeCard}>
                <View style={styles.challengeHeader}>
                  <Text style={styles.challengeTitle}>{challenge.title}</Text>
                  <Text style={styles.challengeParticipants}>
                    {challenge.participants} joined
                  </Text>
                </View>
                <View style={styles.challengeDetails}>
                  <Text style={styles.challengeReward}>{challenge.reward}</Text>
                  <Text style={styles.challengeProgress}>
                    {challenge.progress}% complete
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${challenge.progress}%` },
                    ]}
                  />
                </View>
                <TouchableOpacity style={styles.challengeButton}>
                  <Text style={styles.challengeButtonText}>Join Challenge</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#3B82F6" }]}
                onPress={() => navigation.navigate("Chat")}
              >
                <Ionicons name="chatbubble" size={scale(24)} color="#FFFFFF" />
                <Text style={styles.actionTitle}>Ask PetPal AI</Text>
                <Text style={styles.actionSubtitle}>Instant health advice</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#10B981" }]}
                onPress={() => navigation.navigate("Vets")}
              >
                <Ionicons name="medical" size={scale(24)} color="#FFFFFF" />
                <Text style={styles.actionTitle}>Find Vet</Text>
                <Text style={styles.actionSubtitle}>4 available now</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.quickActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#EC4899" }]}
              >
                <Ionicons name="camera" size={scale(24)} color="#FFFFFF" />
                <Text style={styles.actionTitle}>Photo Diary</Text>
                <Text style={styles.actionSubtitle}>Capture moments</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#F59E0B" }]}
              >
                <Ionicons name="gift" size={scale(24)} color="#FFFFFF" />
                <Text style={styles.actionTitle}>Rewards</Text>
                <Text style={styles.actionSubtitle}>3 badges earned</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Today's Schedule */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            {petActivities.map((activity) => (
              <View key={activity.id} style={styles.activityCard}>
                <View
                  style={[
                    styles.activityIcon,
                    {
                      backgroundColor:
                        activity.status === "completed" ? "#10B981" : "#3B82F6",
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      activity.status === "completed" ? "checkmark" : "time"
                    }
                    size={scale(20)}
                    color="#FFFFFF"
                  />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>{activity.activity}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Health Insights */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Health Insights</Text>
            <View style={styles.healthGrid}>
              {healthInsights.map((insight, index) => (
                <View key={index} style={styles.healthCard}>
                  <View style={styles.healthCardHeader}>
                    <Text style={styles.healthMetric}>{insight.metric}</Text>
                    <Ionicons
                      name={
                        insight.trend === "up" ? "trending-up" : "trending-down"
                      }
                      size={scale(16)}
                      color={insight.trend === "up" ? "#10B981" : "#EF4444"}
                    />
                  </View>
                  <Text style={styles.healthValue}>{insight.value}</Text>
                  <Text
                    style={[
                      styles.healthChange,
                      { color: insight.trend === "up" ? "#10B981" : "#EF4444" },
                    ]}
                  >
                    {insight.change} from yesterday
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Weather Alert */}
          <View style={styles.weatherAlert}>
            <View style={styles.weatherContent}>
              <Ionicons name="sunny" size={scale(24)} color="#F59E0B" />
              <View style={styles.weatherInfo}>
                <Text style={styles.weatherTitle}>Perfect Weather Today!</Text>
                <Text style={styles.weatherDescription}>
                  24°C & sunny - Great for outdoor activities
                </Text>
              </View>
            </View>
            <View style={styles.weatherActions}>
              <TouchableOpacity style={styles.weatherButton}>
                <Text style={styles.weatherButtonText}>Plan Walk</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: verticalScale(100) }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(24),
    borderBottomLeftRadius: scale(24),
    borderBottomRightRadius: scale(24),
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(16),
  },
  greeting: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: moderateScale(14),
  },
  userName: {
    color: "#FFFFFF",
    fontSize: moderateScale(20),
    fontWeight: "bold",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(12),
  },
  notificationButton: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -scale(4),
    right: -scale(4),
    backgroundColor: "#EF4444",
    borderRadius: scale(10),
    width: scale(20),
    height: scale(20),
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadgeText: {
    color: "#FFFFFF",
    fontSize: moderateScale(10),
    fontWeight: "bold",
  },
  profileButton: {
    width: scale(40),
    height: scale(40),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: scale(20),
    alignItems: "center",
    justifyContent: "center",
  },
  liveActivityBar: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: scale(8),
    padding: scale(12),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  liveDot: {
    width: scale(8),
    height: scale(8),
    backgroundColor: "#10B981",
    borderRadius: scale(4),
  },
  liveText: {
    color: "#FFFFFF",
    fontSize: moderateScale(12),
  },
  onlineUsers: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
  },
  onlineUsersText: {
    color: "#FFFFFF",
    fontSize: moderateScale(12),
  },
  content: {
    paddingHorizontal: scale(24),
    marginTop: verticalScale(-32),
  },
  petStatusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: scale(16),
    padding: scale(20),
    marginBottom: verticalScale(24),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  petStatusContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  petAvatar: {
    width: scale(64),
    height: scale(64),
    backgroundColor: "#10B981",
    borderRadius: scale(32),
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(16),
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: moderateScale(20),
    fontWeight: "bold",
    color: "#111827",
    marginBottom: verticalScale(4),
  },
  petMood: {
    fontSize: moderateScale(14),
    color: "#6B7280",
    marginBottom: verticalScale(8),
  },
  healthStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  healthDot: {
    width: scale(8),
    height: scale(8),
    backgroundColor: "#10B981",
    borderRadius: scale(4),
  },
  healthText: {
    fontSize: moderateScale(12),
    color: "#10B981",
    fontWeight: "500",
  },
  moodEmoji: {
    alignItems: "center",
  },
  emojiText: {
    fontSize: moderateScale(24),
    marginBottom: verticalScale(4),
  },
  moodText: {
    fontSize: moderateScale(10),
    color: "#6B7280",
  },
  section: {
    marginBottom: verticalScale(24),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(16),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
    color: "#111827",
  },
  sectionLink: {
    fontSize: moderateScale(14),
    color: "#7C3AED",
    fontWeight: "500",
  },
  eventsContainer: {
    gap: scale(12),
  },
  eventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: scale(12),
    padding: scale(16),
    width: width * 0.7,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },
  eventBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
    backgroundColor: "#FEF3F2",
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: scale(12),
  },
  eventBadgeText: {
    fontSize: moderateScale(10),
    fontWeight: "500",
  },
  participantsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
  },
  participantsText: {
    fontSize: moderateScale(12),
    color: "#6B7280",
  },
  eventTitle: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#111827",
    marginBottom: verticalScale(4),
  },
  eventLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
    marginBottom: verticalScale(12),
  },
  eventLocationText: {
    fontSize: moderateScale(12),
    color: "#6B7280",
  },
  eventButton: {
    backgroundColor: "#7C3AED",
    paddingVertical: verticalScale(8),
    borderRadius: scale(8),
    alignItems: "center",
  },
  eventButtonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(12),
    fontWeight: "500",
  },
  challengeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: scale(12),
    padding: scale(16),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  challengeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },
  challengeTitle: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#111827",
  },
  challengeParticipants: {
    fontSize: moderateScale(12),
    color: "#6B7280",
  },
  challengeDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },
  challengeReward: {
    fontSize: moderateScale(12),
    color: "#6B7280",
  },
  challengeProgress: {
    fontSize: moderateScale(12),
    color: "#7C3AED",
    fontWeight: "500",
  },
  progressBar: {
    height: verticalScale(8),
    backgroundColor: "#E5E7EB",
    borderRadius: scale(4),
    overflow: "hidden",
    marginBottom: verticalScale(12),
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#7C3AED",
  },
  challengeButton: {
    backgroundColor: "#F59E0B",
    paddingVertical: verticalScale(8),
    borderRadius: scale(8),
    alignItems: "center",
  },
  challengeButtonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(12),
    fontWeight: "500",
  },
  quickActions: {
    flexDirection: "row",
    gap: scale(16),
    marginBottom: verticalScale(16),
  },
  actionButton: {
    flex: 1,
    padding: scale(16),
    borderRadius: scale(12),
    alignItems: "flex-start",
    gap: verticalScale(8),
  },
  actionTitle: {
    color: "#FFFFFF",
    fontSize: moderateScale(14),
    fontWeight: "500",
  },
  actionSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: moderateScale(10),
  },
  activityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: scale(12),
    padding: scale(16),
    marginBottom: verticalScale(12),
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  activityIcon: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(16),
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#111827",
    marginBottom: verticalScale(4),
  },
  activityTime: {
    fontSize: moderateScale(12),
    color: "#6B7280",
  },
  healthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(12),
  },
  healthCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: scale(12),
    padding: scale(16),
    width: (width - scale(60)) / 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  healthCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },
  healthMetric: {
    fontSize: moderateScale(12),
    color: "#6B7280",
  },
  healthValue: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
    color: "#111827",
    marginBottom: verticalScale(4),
  },
  healthChange: {
    fontSize: moderateScale(10),
  },
  weatherAlert: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#F59E0B",
    borderRadius: scale(12),
    padding: scale(16),
    marginBottom: verticalScale(24),
  },
  weatherContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(12),
    marginBottom: verticalScale(12),
  },
  weatherInfo: {
    flex: 1,
  },
  weatherTitle: {
    fontSize: moderateScale(14),
    fontWeight: "bold",
    color: "#92400E",
    marginBottom: verticalScale(4),
  },
  weatherDescription: {
    fontSize: moderateScale(12),
    color: "#D97706",
  },
  weatherActions: {
    flexDirection: "row",
    gap: scale(8),
  },
  weatherButton: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: scale(16),
  },
  weatherButtonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(10),
    fontWeight: "500",
  },
});
