// import React, { useState, useEffect, useRef, useContext } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   ScrollView,
//   SafeAreaView,
//   StatusBar,
//   Animated,
//   Alert,
//   ActivityIndicator,
//   Dimensions,
//   Platform,
//   BackHandler,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { moderateScale, verticalScale } from "react-native-size-matters";
// import { LinearGradient } from "expo-linear-gradient";
// import { BlurView } from "expo-blur";
// import { socket } from "../context/Socket";
// import axios from "axios";
// import RazorpayCheckout from "react-native-razorpay";
// import { AuthContext } from "../context/AuthContext";

// const { width, height } = Dimensions.get("window");
// const RAZORPAY_KEY_ID = "rzp_test_1nhE9190sR3rkP";

// const PaymentScreen = ({ route, navigation }) => {
//   const {
//     doctor,
//     channel,
//     patientId,
//     callId,
//     onPaymentSuccess,
//     onPaymentFailure,
//   } = route.params;
//   const [doctorInfo, setDoctorInfo] = useState(null);
//   const { user } = useContext(AuthContext);

//   useEffect(() => {
//     if (doctor) {
//       setDoctorInfo({
//         id: doctor.id,
//         name:
//           doctor.name || doctor.email?.split("@")[0] || `Doctor ${doctor.id}`,
//         specialty: "Veterinarian",
//         experience: "5+ years",
//         rating: doctor.rating || "5.0",
//         chat_price: doctor.chat_price || "500.00",
//         user_ratings_total: doctor.user_ratings_total || 2,
//         address: doctor.formatted_address || "Not available",
//       });
//     }
//   }, [doctor]);

//   const currentDoctor = doctorInfo || doctor;

//   const [loading, setLoading] = useState(false);
//   const [paymentStatus, setPaymentStatus] = useState(null);
//   const [selectedMethod, setSelectedMethod] = useState("razorpay");
//   const [timeLeft, setTimeLeft] = useState(10 * 60);
//   const [razorpayOrderId, setRazorpayOrderId] = useState(null);
//   const [isProcessing, setIsProcessing] = useState(false);

//   const progressAnim = useRef(new Animated.Value(0)).current;
//   const slideAnim = useRef(new Animated.Value(height)).current;
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const pulseAnim = useRef(new Animated.Value(1)).current;

//   useEffect(() => {
//     // Entrance animation
//     Animated.parallel([
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 600,
//         useNativeDriver: true,
//       }),
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 800,
//         useNativeDriver: true,
//       }),
//     ]).start();

//     // Pulse animation for urgency
//     const pulseAnimation = Animated.loop(
//       Animated.sequence([
//         Animated.timing(pulseAnim, {
//           toValue: 1.05,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
//         Animated.timing(pulseAnim, {
//           toValue: 1,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
//       ])
//     );
//     pulseAnimation.start();

//     // Countdown timer
//     const timer = setInterval(() => {
//       setTimeLeft((prev) => {
//         if (prev <= 1) {
//           clearInterval(timer);
//           handlePaymentTimeout();
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     // Handle back button
//     const backHandler = BackHandler.addEventListener(
//       "hardwareBackPress",
//       () => {
//         handleBackPress();
//         return true;
//       }
//     );

//     return () => {
//       clearInterval(timer);
//       backHandler.remove();
//       pulseAnimation.stop();
//     };
//   }, []);

//   const handleBackPress = () => {
//     Alert.alert(
//       "Cancel Payment?",
//       "Are you sure you want to cancel the payment? This will end the consultation request.",
//       [
//         { text: "Continue Payment", style: "default" },
//         {
//           text: "Cancel",
//           style: "destructive",
//           onPress: () => {
//             socket.emit("payment-cancelled", {
//               callId,
//               doctorId: currentDoctor.id,
//             });
//             navigation.goBack();
//           },
//         },
//       ]
//     );
//   };

//   const handlePaymentTimeout = () => {
//     setPaymentStatus("timeout");
//     Alert.alert(
//       "Session Expired",
//       "The payment session has expired. Please start a new consultation request.",
//       [{ text: "OK", onPress: () => navigation.goBack() }]
//     );
//   };

//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, "0")}`;
//   };

//   const getTimeColor = () => {
//     if (timeLeft > 300) return "#10B981";
//     if (timeLeft > 120) return "#F59E0B";
//     return "#DC2626";
//   };

//  const handleRazorpayPayment = async () => {
//   if (loading || isProcessing) return;

//   setLoading(true);
//   setIsProcessing(true);
//   setPaymentStatus("processing");

//   try {
//     // 1️⃣ Create order from backend
//     const orderRes = await axios.post(
//       "https://snoutiq.com/backend/api/create-order",
//       {
//         amount: "1", // for testing
//         callId,
//         doctorId: currentDoctor.id,
//         patientId,
//         channel,
//       }
//     );

//     const data = orderRes.data;

//     // ✅ Support both Live & Test responses
//     const orderId = data.order_id || data.id;
//     const keyId = data.key || RAZORPAY_KEY_ID;

//     if (!orderId) {
//       throw new Error("Failed to create Razorpay order");
//     }

//     // 2️⃣ Razorpay options
//     const options = {
//       description: `Video consultation with ${doctorInfo.name}`,
//       image: "https://snoutiq.com/logo.webp",
//       currency: "INR",
//       key: keyId,
//       amount: Math.round(parseFloat(doctorInfo.chat_price) * 100),
//       name: "Snoutiq Veterinary Consultation",
//       order_id: orderId,
//       prefill: {
//         email: user?.email || "patient@snoutiq.com",
//         contact: user?.phone || "9999999999",
//         name: user?.name || "Patient",
//       },
//       theme: { color: "#4F46E5" },
//       modal: {
//         ondismiss: () => {
//           setLoading(false);
//           setIsProcessing(false);
//           setPaymentStatus(null);
//         },
//       },
//     };

//     // 3️⃣ Open Razorpay Checkout
//     const paymentData = await RazorpayCheckout.open(options);

//     // 4️⃣ Verify payment on backend
//     const verifyRes = await axios.post(
//       "https://snoutiq.com/backend/api/rzp/verify",
//       {
//         razorpay_payment_id: paymentData.razorpay_payment_id,
//         razorpay_order_id: paymentData.razorpay_order_id,
//         razorpay_signature: paymentData.razorpay_signature,
//         callId,
//         doctorId: doctorInfo.id,
//         patientId,
//         channel,
//       }
//     );

//     if (verifyRes.data.success) {
//       setPaymentStatus("success");

//       // 🔔 Notify socket
//       socket.emit("payment-completed", {
//         callId,
//         doctorId: doctorInfo.id,
//         channel,
//         patientId,
//         paymentId: paymentData.razorpay_payment_id,
//       });

//       setTimeout(() => {
//         navigation.replace("VideoCallScreen", {
//           doctor: doctorInfo,
//           channel,
//           patientId,
//           callId,
//           role: "audience",
//           uid: patientId,
//         });
//       }, 2000);
//     } else {
//       throw new Error("Payment verification failed");
//     }
//   } catch (error) {
//     console.error("Payment Error:", error);
//     setLoading(false);
//     setIsProcessing(false);
//     setPaymentStatus("error");

//     Alert.alert(
//       "Payment Error",
//       error.message || "Something went wrong. Please try again."
//     );
//   }
// };

//   const consultationFee = parseFloat(doctorInfo?.chat_price) || 500;
//   const totalAmount = consultationFee;

//   if (!doctorInfo) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#4F46E5" />
//         <Text style={styles.loadingText}>Loading payment information...</Text>
//       </View>
//     );
//   }

//   // Payment methods
//   const paymentMethods = [
//     {
//       id: "razorpay",
//       name: "Pay with Razorpay",
//       icon: "card-outline",
//       description: "UPI, Cards, NetBanking, Wallets",
//       color: "#3395FF",
//       popular: true,
//     },
//   ];

//   if (!currentDoctor) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#4F46E5" />
//         <Text style={styles.loadingText}>Loading payment information...</Text>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />

//       {/* Header */}
//       <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.header}>
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={handleBackPress}
//           disabled={isProcessing}
//         >
//           <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
//         </TouchableOpacity>

//         <Text style={styles.headerTitle}>Secure Payment</Text>

//         <Animated.View
//           style={[styles.timerContainer, { backgroundColor: getTimeColor() }]}
//         >
//           <Ionicons name="time-outline" size={16} color="#FFFFFF" />
//           <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
//         </Animated.View>
//       </LinearGradient>

//       <Animated.ScrollView
//         style={[
//           styles.scrollView,
//           {
//             transform: [{ translateY: slideAnim }],
//             opacity: fadeAnim,
//           },
//         ]}
//         showsVerticalScrollIndicator={false}
//         scrollEnabled={!isProcessing}
//       >
//         {/* Doctor Info Card */}
//         <Animated.View
//           style={[styles.doctorCard, { transform: [{ scale: pulseAnim }] }]}
//         >
//           <Image
//             source={{
//               uri: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100",
//             }}
//             style={styles.doctorImage}
//           />
//           <View style={styles.doctorInfo}>
//             <Text style={styles.doctorName}>{currentDoctor.name}</Text>
//             <Text style={styles.doctorSpecialty}>Veterinarian</Text>
//             <View style={styles.ratingContainer}>
//               <Ionicons name="star" size={16} color="#F59E0B" />
//               <Text style={styles.ratingText}>
//                 {currentDoctor.rating} • {currentDoctor.user_ratings_total}{" "}
//                 reviews
//               </Text>
//             </View>
//           </View>
//         </Animated.View>

//         {/* Consultation Package */}
//         <View style={styles.packageCard}>
//           <LinearGradient
//             colors={["#EBF4FF", "#DBEAFE"]}
//             style={styles.packageHeader}
//           >
//             <Ionicons name="videocam" size={24} color="#3B82F6" />
//             <Text style={styles.packageTitle}>Video Consultation</Text>
//           </LinearGradient>

//           <View style={styles.featuresList}>
//             {[
//               "30-minute one-on-one session",
//               "Professional veterinary advice",
//               "Digital prescription included",
//             ].map((feature, index) => (
//               <View key={index} style={styles.featureItem}>
//                 <Ionicons name="checkmark-circle" size={18} color="#10B981" />
//                 <Text style={styles.featureText}>{feature}</Text>
//               </View>
//             ))}
//           </View>
//         </View>

//         {/* Payment Methods */}
//         <View style={styles.methodsCard}>
//           <Text style={styles.sectionTitle}>Choose Payment Method</Text>
//           {paymentMethods.map((method) => (
//             <TouchableOpacity
//               key={method.id}
//               style={[
//                 styles.methodItem,
//                 selectedMethod === method.id && styles.methodItemSelected,
//               ]}
//               onPress={() => !isProcessing && setSelectedMethod(method.id)}
//               activeOpacity={0.7}
//               disabled={isProcessing}
//             >
//               <View
//                 style={[styles.methodIcon, { backgroundColor: method.color }]}
//               >
//                 <Ionicons name={method.icon} size={20} color="#FFFFFF" />
//               </View>

//               <View style={styles.methodInfo}>
//                 <Text style={styles.methodName}>{method.name}</Text>
//                 <Text style={styles.methodDescription}>
//                   {method.description}
//                 </Text>
//               </View>

//               <View
//                 style={[
//                   styles.radioButton,
//                   selectedMethod === method.id && styles.radioButtonSelected,
//                 ]}
//               >
//                 {selectedMethod === method.id && (
//                   <Ionicons name="checkmark" size={14} color="#FFFFFF" />
//                 )}
//               </View>
//             </TouchableOpacity>
//           ))}
//         </View>

//         {/* Bill Summary */}
//         <View style={styles.billCard}>
//           <Text style={styles.sectionTitle}>Payment Summary</Text>
//           <View style={styles.billRow}>
//             <Text style={styles.billLabel}>Consultation Fee</Text>
//             <Text style={styles.billAmount}>₹{consultationFee}</Text>
//           </View>
//           <View style={styles.divider} />
//           <View style={styles.billRow}>
//             <Text style={styles.totalLabel}>Total Amount</Text>
//             <Text style={styles.totalAmount}>₹{totalAmount}</Text>
//           </View>
//         </View>

//         <View style={styles.spacer} />
//       </Animated.ScrollView>

//       {/* Fixed Payment Button */}
//       <View style={styles.footer}>
//         <TouchableOpacity
//           style={[
//             styles.payButton,
//             (loading || isProcessing) && styles.payButtonDisabled,
//           ]}
//           onPress={handleRazorpayPayment}
//           disabled={loading || isProcessing}
//           activeOpacity={0.8}
//         >
//           <LinearGradient
//             colors={
//               loading || isProcessing
//                 ? ["#9CA3AF", "#6B7280"]
//                 : ["#4F46E5", "#7C3AED"]
//             }
//             style={styles.payButtonGradient}
//           >
//             {loading || isProcessing ? (
//               <>
//                 <ActivityIndicator color="#FFFFFF" size="small" />
//                 <Text style={styles.payButtonText}>Processing...</Text>
//               </>
//             ) : (
//               <>
//                 <Ionicons name="lock-closed" size={18} color="#FFFFFF" />
//                 <Text style={styles.payButtonText}>Pay ₹{totalAmount}</Text>
//               </>
//             )}
//           </LinearGradient>
//         </TouchableOpacity>
//       </View>

//       {/* Payment Status Overlays */}
//       {paymentStatus === "processing" && (
//         <View style={styles.overlay}>
//           <View style={styles.processingCard}>
//             <ActivityIndicator size="large" color="#4F46E5" />
//             <Text style={styles.processingTitle}>Processing Payment...</Text>
//             <Text style={styles.processingText}>
//               Please wait while we initialize payment.
//             </Text>
//           </View>
//         </View>
//       )}

//       {paymentStatus === "success" && (
//         <View style={styles.overlay}>
//           <View style={styles.successCard}>
//             <Ionicons name="checkmark-circle" size={64} color="#10B981" />
//             <Text style={styles.successTitle}>Payment Successful!</Text>
//             <Text style={styles.successText}>
//               Connecting you to {currentDoctor.name}...
//             </Text>
//           </View>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// };
// // Styles remain the same as original...
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F8FAFC",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#F8FAFC",
//   },
//   loadingText: {
//     marginTop: moderateScale(16),
//     fontSize: moderateScale(16),
//     color: "#6B7280",
//     textAlign: "center",
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: moderateScale(20),
//     paddingVertical: verticalScale(15),
//     paddingTop: Platform.OS === "ios" ? verticalScale(50) : verticalScale(15),
//   },
//   backButton: {
//     padding: moderateScale(8),
//     backgroundColor: "rgba(255,255,255,0.2)",
//     borderRadius: 20,
//   },
//   headerTitle: {
//     color: "#FFFFFF",
//     fontSize: moderateScale(18),
//     fontWeight: "700",
//   },
//   timerContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: moderateScale(12),
//     paddingVertical: moderateScale(6),
//     borderRadius: 20,
//   },
//   timerText: {
//     color: "#FFFFFF",
//     fontSize: moderateScale(14),
//     fontWeight: "700",
//     marginLeft: moderateScale(4),
//   },
//   scrollView: {
//     flex: 1,
//   },
//   doctorCard: {
//     backgroundColor: "#FFFFFF",
//     margin: moderateScale(16),
//     padding: moderateScale(16),
//     borderRadius: 16,
//     flexDirection: "row",
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 8,
//     borderWidth: 2,
//     borderColor: "#E5F3FF",
//   },
//   doctorImage: {
//     width: moderateScale(70),
//     height: moderateScale(70),
//     borderRadius: 35,
//     marginRight: moderateScale(16),
//   },
//   doctorInfo: {
//     flex: 1,
//   },
//   doctorName: {
//     fontSize: moderateScale(18),
//     fontWeight: "700",
//     color: "#1F2937",
//     marginBottom: moderateScale(4),
//   },
//   doctorSpecialty: {
//     fontSize: moderateScale(14),
//     color: "#6B7280",
//     marginBottom: moderateScale(6),
//   },
//   ratingContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: moderateScale(6),
//   },
//   ratingText: {
//     fontSize: moderateScale(12),
//     color: "#6B7280",
//     marginLeft: moderateScale(4),
//   },
//   onlineIndicator: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   onlineDot: {
//     width: moderateScale(8),
//     height: moderateScale(8),
//     borderRadius: 4,
//     backgroundColor: "#10B981",
//     marginRight: moderateScale(6),
//   },
//   onlineText: {
//     fontSize: moderateScale(12),
//     color: "#10B981",
//     fontWeight: "600",
//   },
//   packageCard: {
//     backgroundColor: "#FFFFFF",
//     margin: moderateScale(16),
//     borderRadius: 16,
//     overflow: "hidden",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   packageHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: moderateScale(16),
//     borderBottomWidth: 1,
//     borderBottomColor: "#E5F3FF",
//   },
//   packageTitle: {
//     fontSize: moderateScale(16),
//     fontWeight: "700",
//     color: "#1F2937",
//     marginLeft: moderateScale(8),
//   },
//   featuresList: {
//     padding: moderateScale(16),
//     gap: moderateScale(12),
//   },
//   featureItem: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   featureText: {
//     fontSize: moderateScale(14),
//     color: "#4B5563",
//     marginLeft: moderateScale(10),
//     flex: 1,
//   },
//   methodsCard: {
//     backgroundColor: "#FFFFFF",
//     margin: moderateScale(16),
//     padding: moderateScale(16),
//     borderRadius: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   sectionTitle: {
//     fontSize: moderateScale(16),
//     fontWeight: "700",
//     color: "#1F2937",
//     marginBottom: moderateScale(16),
//   },
//   methodItem: {
//     position: "relative",
//     flexDirection: "row",
//     alignItems: "center",
//     padding: moderateScale(16),
//     borderRadius: 12,
//     marginBottom: moderateScale(12),
//     borderWidth: 2,
//     borderColor: "#E5E7EB",
//     backgroundColor: "#FAFAFA",
//   },
//   methodItemSelected: {
//     borderColor: "#4F46E5",
//     backgroundColor: "#F5F3FF",
//   },
//   popularBadge: {
//     position: "absolute",
//     top: -6,
//     right: 12,
//     backgroundColor: "#DC2626",
//     paddingHorizontal: moderateScale(8),
//     paddingVertical: moderateScale(2),
//     borderRadius: 10,
//   },
//   popularText: {
//     fontSize: moderateScale(8),
//     color: "#FFFFFF",
//     fontWeight: "700",
//   },
//   methodIcon: {
//     width: moderateScale(40),
//     height: moderateScale(40),
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: moderateScale(12),
//   },
//   methodInfo: {
//     flex: 1,
//   },
//   methodName: {
//     fontSize: moderateScale(14),
//     fontWeight: "600",
//     color: "#1F2937",
//     marginBottom: moderateScale(2),
//   },
//   methodDescription: {
//     fontSize: moderateScale(12),
//     color: "#6B7280",
//   },
//   methodBalance: {
//     fontSize: moderateScale(12),
//     color: "#059669",
//     fontWeight: "600",
//     marginTop: moderateScale(2),
//   },
//   radioButton: {
//     width: moderateScale(20),
//     height: moderateScale(20),
//     borderRadius: 10,
//     borderWidth: 2,
//     borderColor: "#D1D5DB",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   radioButtonSelected: {
//     backgroundColor: "#4F46E5",
//     borderColor: "#4F46E5",
//   },
//   securityCard: {
//     backgroundColor: "#FFFFFF",
//     margin: moderateScale(16),
//     padding: moderateScale(16),
//     borderRadius: 16,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   securityTitle: {
//     fontSize: moderateScale(14),
//     fontWeight: "600",
//     color: "#1F2937",
//     marginBottom: moderateScale(12),
//   },
//   securityFeatures: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     width: "100%",
//   },
//   securityFeature: {
//     alignItems: "center",
//     flex: 1,
//   },
//   securityText: {
//     fontSize: moderateScale(10),
//     color: "#6B7280",
//     marginTop: moderateScale(4),
//     textAlign: "center",
//   },
//   billCard: {
//     backgroundColor: "#FFFFFF",
//     margin: moderateScale(16),
//     padding: moderateScale(16),
//     borderRadius: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   billRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: moderateScale(8),
//   },
//   billLabel: {
//     fontSize: moderateScale(14),
//     color: "#6B7280",
//   },
//   billAmount: {
//     fontSize: moderateScale(14),
//     color: "#1F2937",
//     fontWeight: "500",
//   },
//   divider: {
//     height: 1,
//     backgroundColor: "#E5E7EB",
//     marginVertical: moderateScale(12),
//   },
//   totalLabel: {
//     fontSize: moderateScale(16),
//     color: "#1F2937",
//     fontWeight: "700",
//   },
//   totalAmount: {
//     fontSize: moderateScale(18),
//     color: "#4F46E5",
//     fontWeight: "800",
//   },
//   spacer: {
//     height: moderateScale(120),
//   },
//   footer: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     padding: moderateScale(16),
//     paddingBottom:
//       Platform.OS === "ios" ? moderateScale(34) : moderateScale(16),
//     borderTopWidth: 1,
//     borderTopColor: "rgba(229, 231, 235, 0.3)",
//   },
//   payButton: {
//     borderRadius: 16,
//     overflow: "hidden",
//     marginBottom: moderateScale(8),
//     shadowColor: "#4F46E5",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 12,
//     elevation: 8,
//   },
//   payButtonDisabled: {
//     opacity: 0.6,
//   },
//   payButtonGradient: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: moderateScale(16),
//     gap: moderateScale(8),
//   },
//   payButtonText: {
//     color: "#FFFFFF",
//     fontSize: moderateScale(16),
//     fontWeight: "700",
//   },
//   footerText: {
//     fontSize: moderateScale(11),
//     color: "#6B7280",
//     textAlign: "center",
//     lineHeight: moderateScale(16),
//   },
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(0,0,0,0.6)",
//     justifyContent: "center",
//     alignItems: "center",
//     zIndex: 1000,
//   },
//   processingCard: {
//     backgroundColor: "#FFFFFF",
//     margin: moderateScale(32),
//     padding: moderateScale(32),
//     borderRadius: 20,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.3,
//     shadowRadius: 20,
//     elevation: 15,
//   },
//   processingTitle: {
//     fontSize: moderateScale(18),
//     fontWeight: "700",
//     color: "#1F2937",
//     marginTop: moderateScale(16),
//     marginBottom: moderateScale(8),
//   },
//   processingText: {
//     fontSize: moderateScale(14),
//     color: "#6B7280",
//     textAlign: "center",
//     lineHeight: moderateScale(20),
//   },
//   successCard: {
//     backgroundColor: "#FFFFFF",
//     margin: moderateScale(32),
//     padding: moderateScale(32),
//     borderRadius: 20,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.3,
//     shadowRadius: 20,
//     elevation: 15,
//   },
//   successIconContainer: {
//     marginBottom: moderateScale(20),
//   },
//   successTitle: {
//     fontSize: moderateScale(20),
//     fontWeight: "700",
//     color: "#1F2937",
//     marginBottom: moderateScale(8),
//     textAlign: "center",
//   },
//   successText: {
//     fontSize: moderateScale(14),
//     color: "#6B7280",
//     textAlign: "center",
//     lineHeight: moderateScale(20),
//     marginBottom: moderateScale(20),
//   },
//   connectingIndicator: {
//     marginTop: moderateScale(8),
//   },
// });

// export default PaymentScreen;
<<<<<<< HEAD
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
=======
import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StyleSheet,
  Alert,
>>>>>>> fdb97ac69712ac6dd31d59a4c4ffb6804fec3982
} from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import { AuthContext } from "../context/AuthContext";
import { socket } from "../context/Socket";
<<<<<<< HEAD
=======
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
>>>>>>> fdb97ac69712ac6dd31d59a4c4ffb6804fec3982

const EnhancedPaymentScreen = ({ route, navigation }) => {
  const { doctor, channel, patientId, callId } = route.params;
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [timeLeft, setTimeLeft] = useState(5 * 60);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPaymentStatus("timeout");
          socket.emit("payment-cancelled", { callId, patientId, doctorId: doctor.id, reason: "timeout" });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePayment = async () => {
    if (!user) return Alert.alert("Error", "User info missing");
    setLoading(true);
    setPaymentStatus(null);

    try {
      // Create order
      const orderRes = await axios.post(
        "https://snoutiq.com/backend/api/create-order",
        {
          amount: parseFloat(doctor.chat_price || 500),
          call_id: callId,
          doctor_id: doctor.id,
          patient_id: patientId,
          channel,
        }
      );

      const orderData = orderRes.data;
      if (!orderData.order_id) throw new Error("Order ID missing");

      const options = {
        description: `Video consultation with ${doctor.name}`,
        image: "https://snoutiq.com/logo.webp",
        currency: "INR",
        key: orderData.key || "rzp_test_1nhE9190sR3rkP",
        amount: Math.round((doctor.chat_price || 500) * 100),
        order_id: orderData.order_id,
        prefill: { email: user.email, contact: user.phone, name: user.name },
        theme: { color: "#4F46E5" },
      };

      const paymentData = await RazorpayCheckout.open(options);

      // Verify payment
      await axios.post("https://snoutiq.com/backend/api/rzp/verify", {
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_signature: paymentData.razorpay_signature,
        call_id: callId,
        doctor_id: doctor.id,
        patient_id: patientId,
        channel,
      });

      socket.emit("payment-completed", {
        callId,
        patientId,
        doctorId: doctor.id,
        channel,
        paymentId: paymentData.razorpay_payment_id,
      });

      setPaymentStatus("success");

      // Navigate to VideoCallScreen
      navigation.navigate("VideoCallScreen", {
        doctor,
       channelName: channel,
        patientId,
        callId,
        role: "audience",
      });
    } catch (error) {
      console.error(error);
      setPaymentStatus("error");
      Alert.alert("Payment Error", error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Video Call Payment</Text>
        <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
      </View>

      <View style={styles.doctorCard}>
        <Image source={{ uri: doctor.image || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100" }} style={styles.doctorImage} />
        <View>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.doctorSpecialty}>Veterinarian</Text>
          <Text style={styles.doctorFee}>₹{doctor.chat_price || 500}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.payButton, loading && styles.payButtonDisabled]}
        onPress={handlePayment}
        disabled={loading || timeLeft <= 0}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="lock-closed" size={18} color="#fff" />
            <Text style={styles.payText}>Pay ₹{doctor.chat_price || 500} & Join Call</Text>
          </>
        )}
      </TouchableOpacity>

      {paymentStatus === "success" && <Text style={styles.successText}>Payment successful! Joining call...</Text>}
      {paymentStatus === "error" && <Text style={styles.errorText}>Payment failed. Try again.</Text>}
      {paymentStatus === "timeout" && <Text style={styles.errorText}>Payment window expired.</Text>}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f8" },
  header: { padding: 20, backgroundColor: "#4F46E5", alignItems: "center" },
  headerTitle: { fontSize: 20, color: "#fff", fontWeight: "bold" },
  timer: { fontSize: 16, color: "#fff", marginTop: 4 },
  doctorCard: { flexDirection: "row", backgroundColor: "#fff", margin: 20, padding: 15, borderRadius: 12, alignItems: "center" },
  doctorImage: { width: 70, height: 70, borderRadius: 35, marginRight: 15 },
  doctorName: { fontSize: 18, fontWeight: "700" },
  doctorSpecialty: { fontSize: 14, color: "#666" },
  doctorFee: { fontSize: 16, color: "#4F46E5", fontWeight: "600" },
  payButton: { flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: "#4F46E5", paddingVertical: 15, marginHorizontal: 20, borderRadius: 12 },
  payButtonDisabled: { backgroundColor: "#a5a1f5" },
  payText: { color: "#fff", fontWeight: "700", marginLeft: 8 },
  successText: { color: "green", textAlign: "center", marginTop: 10 },
  errorText: { color: "red", textAlign: "center", marginTop: 10 },
});

export default EnhancedPaymentScreen;
