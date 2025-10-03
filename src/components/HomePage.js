// // import { Ionicons } from "@expo/vector-icons";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import { LinearGradient } from "expo-linear-gradient";
// // import { useNavigation } from "expo-router";
// // import { useContext, useEffect, useState } from "react";
// // import {
// //   Dimensions,
// //   FlatList,
// //   ScrollView,
// //   StyleSheet,
// //   Text,
// //   TouchableOpacity,
// //   View,
// // } from "react-native";
// // import { SafeAreaView } from "react-native-safe-area-context";
// // import { moderateScale, scale, verticalScale } from "react-native-size-matters";
// // import { AuthContext } from "../context/AuthContext";

// // const { width } = Dimensions.get("window");

// // export default function DashboardScreen({ navigation }) {
// //   const [user, setUser] = useState({ name: "", location: "Delhi" });
// //   const [pet, setPet] = useState({ name: "Your Pet" });
// //   const [liveActivities, setLiveActivities] = useState(12);
// //   const [onlineUsers, setOnlineUsers] = useState(847);
// //   const Navigation = useNavigation();
// //    const { nearbyDoctors, fetchNearbyDoctors, loading } = useContext(AuthContext);

// //   const liveEvents = [
// //     {
// //       id: "1",
// //       title: "Pet Yoga Session",
// //       location: "Connaught Place",
// //       time: "20 min",
// //       participants: 23,
// //       type: "live",
// //     },
// //     {
// //       id: "2",
// //       title: "Dog Training Workshop",
// //       location: "Lodhi Gardens",
// //       time: "1 hr",
// //       participants: 45,
// //       type: "upcoming",
// //     },
// //     {
// //       id: "3",
// //       title: "Adoption Drive",
// //       location: "India Gate",
// //       time: "2 hr",
// //       participants: 67,
// //       type: "upcoming",
// //     },
// //   ];

// //   const trendingChallenges = [
// //     {
// //       id: "1",
// //       title: "Morning Walk Streak",
// //       participants: 127,
// //       progress: 85,
// //       reward: "🏆 Fitness Badge",
// //     },
// //     {
// //       id: "2",
// //       title: "Healthy Treats Challenge",
// //       participants: 89,
// //       progress: 60,
// //       reward: "🥕 Nutrition Expert",
// //     },
// //   ];

// //   const petActivities = [
// //     { id: "1", activity: "Morning Walk", time: "7:00 AM", status: "completed" },
// //     { id: "2", activity: "Breakfast", time: "8:30 AM", status: "completed" },
// //     { id: "3", activity: "Play Time", time: "11:00 AM", status: "upcoming" },
// //   ];

// //   const healthInsights = [
// //     { metric: "Steps Today", value: "8,247", change: "+12%", trend: "up" },
// //     { metric: "Active Hours", value: "4.2h", change: "+5%", trend: "up" },
// //     { metric: "Calories Burned", value: "340", change: "+8%", trend: "up" },
// //     { metric: "Sleep Quality", value: "92%", change: "+3%", trend: "up" },
// //   ];

// //   useEffect(() => {
// //     loadUserData();

// //     const interval = setInterval(() => {
// //       setLiveActivities((prev) => prev + Math.floor(Math.random() * 3) - 1);
// //       setOnlineUsers((prev) => prev + Math.floor(Math.random() * 20) - 10);
// //     }, 5000);

// //     return () => clearInterval(interval);
// //   }, []);

// //   const loadUserData = async () => {
// //     try {
// //       const userData = await AsyncStorage.getItem("userData");
// //       const petData = await AsyncStorage.getItem("petData");

// //       if (userData) {
// //         setUser(JSON.parse(userData));
// //       }
// //       if (petData) {
// //         setPet(JSON.parse(petData));
// //       }
// //     } catch (error) {
// //       console.error("Error loading user data:", error);
// //     }
// //   };

// //   const renderLiveEvent = ({ item }) => (
// //     <View style={styles.eventCard}>
// //       <View style={styles.eventHeader}>
// //         <View style={styles.eventBadge}>
// //           {item.type === "live" && <View style={styles.liveDot} />}
// //           <Text
// //             style={[
// //               styles.eventBadgeText,
// //               {
// //                 color: item.type === "live" ? "#EF4444" : "#3B82F6",
// //               },
// //             ]}
// //           >
// //             {item.type === "live" ? "LIVE" : item.time}
// //           </Text>
// //         </View>
// //         <View style={styles.participantsContainer}>
// //           <Ionicons name="people" size={scale(12)} color="#6B7280" />
// //           <Text style={styles.participantsText}>{item.participants}</Text>
// //         </View>
// //       </View>
// //       <Text style={styles.eventTitle}>{item.title}</Text>
// //       <View style={styles.eventLocation}>
// //         <Ionicons name="location-outline" size={scale(12)} color="#6B7280" />
// //         <Text style={styles.eventLocationText}>{item.location}</Text>
// //       </View>
// //       <TouchableOpacity style={styles.eventButton}>
// //         <Text style={styles.eventButtonText}>
// //           {item.type === "live" ? "Join Now" : "Register"}
// //         </Text>
// //       </TouchableOpacity>
// //     </View>
// //   );

// //   return (
// //     <SafeAreaView style={styles.container}>
// //       <ScrollView
// //         style={styles.scrollView}
// //         showsVerticalScrollIndicator={false}
// //       >
// //         {/* Header */}
// //         <LinearGradient colors={["#7C3AED", "#EC4899"]} style={styles.header}>
// //           <View style={styles.headerTop}>
// //             <View>
// //               <Text style={styles.greeting}>Good morning,</Text>
// //               <Text style={styles.userName}>{user.name || "Pet Parent"}</Text>
// //             </View>
// //             <View style={styles.headerIcons}>
// //               <TouchableOpacity
// //                 onPress={() => navigation.navigate("Notifications")}
// //                 style={styles.notificationButton}
// //               >
// //                 <Ionicons
// //                   name="notifications"
// //                   size={scale(24)}
// //                   color="#FFFFFF"
// //                 />
// //                 <View style={styles.notificationBadge}>
// //                   <Text style={styles.notificationBadgeText}>5</Text>
// //                 </View>
// //               </TouchableOpacity>
// //               <TouchableOpacity
// //                 onPress={() => navigation.navigate("Profile")}
// //                 style={styles.notificationButton}
// //               >
// //                 <View style={styles.profileButton}>
// //                   <Ionicons name="person" size={scale(24)} color="#FFFFFF" />
// //                 </View>
// //               </TouchableOpacity>
// //             </View>
// //           </View>

// //           <View style={styles.liveActivityBar}>
// //             <View style={styles.liveIndicator}>
// //               <View style={styles.liveDot} />
// //               <Text style={styles.liveText}>
// //               {nearbyDoctors.length} {nearbyDoctors.length === 1 ? 'doctor' : 'doctors'} near you
// //               </Text>
// //             </View>
// //             <View style={styles.onlineUsers}>
// //               <Ionicons name="people" size={scale(16)} color="#FFFFFF" />
// //               <Text style={styles.onlineUsersText}>{onlineUsers} online</Text>
// //             </View>
// //           </View>
// //         </LinearGradient>

// //         <View style={styles.content}>
// //           {/* Pet Status Card */}
// //           <View style={styles.petStatusCard}>
// //             <View style={styles.petStatusContent}>
// //               <View style={styles.petAvatar}>
// //                 <Ionicons name="paw" size={scale(32)} color="#FFFFFF" />
// //               </View>
// //               <View style={styles.petInfo}>
// //                 <Text style={styles.petName}>{pet.name}</Text>
// //                 <Text style={styles.petMood}>Feeling energetic today! 🎾</Text>
// //                 <View style={styles.healthStatus}>
// //                   <View style={styles.healthDot} />
// //                   <Text style={styles.healthText}>All vitals excellent</Text>
// //                 </View>
// //               </View>
// //               <View style={styles.moodEmoji}>
// //                 <Text style={styles.emojiText}>😊</Text>
// //                 <Text style={styles.moodText}>Happy</Text>
// //               </View>
// //             </View>
// //           </View>

// //           {/* Live Events */}
// //           <View style={styles.section}>
// //             <View style={styles.sectionHeader}>
// //               <Text style={styles.sectionTitle}>🔴 Happening Now</Text>
// //               <TouchableOpacity>
// //                 <Text style={styles.sectionLink}>View All</Text>
// //               </TouchableOpacity>
// //             </View>
// //             <FlatList
// //               horizontal
// //               data={liveEvents}
// //               renderItem={renderLiveEvent}
// //               keyExtractor={(item) => item.id}
// //               showsHorizontalScrollIndicator={false}
// //               contentContainerStyle={styles.eventsContainer}
// //             />
// //           </View>

// //           {/* Trending Challenges */}
// //           <View style={styles.section}>
// //             <View style={styles.sectionHeader}>
// //               <Text style={styles.sectionTitle}>🔥 Trending Challenges</Text>
// //               <TouchableOpacity>
// //                 <Text style={styles.sectionLink}>Join All</Text>
// //               </TouchableOpacity>
// //             </View>
// //             {trendingChallenges.map((challenge) => (
// //               <View key={challenge.id} style={styles.challengeCard}>
// //                 <View style={styles.challengeHeader}>
// //                   <Text style={styles.challengeTitle}>{challenge.title}</Text>
// //                   <Text style={styles.challengeParticipants}>
// //                     {challenge.participants} joined
// //                   </Text>
// //                 </View>
// //                 <View style={styles.challengeDetails}>
// //                   <Text style={styles.challengeReward}>{challenge.reward}</Text>
// //                   <Text style={styles.challengeProgress}>
// //                     {challenge.progress}% complete
// //                   </Text>
// //                 </View>
// //                 <View style={styles.progressBar}>
// //                   <View
// //                     style={[
// //                       styles.progressFill,
// //                       { width: `${challenge.progress}%` },
// //                     ]}
// //                   />
// //                 </View>
// //                 <TouchableOpacity style={styles.challengeButton}>
// //                   <Text style={styles.challengeButtonText}>Join Challenge</Text>
// //                 </TouchableOpacity>
// //               </View>
// //             ))}
// //           </View>

// //           {/* Quick Actions */}
// //           <View style={styles.section}>
// //             <Text style={styles.sectionTitle}>Quick Actions</Text>
// //             <View style={styles.quickActions}>
// //               <TouchableOpacity
// //                 style={[styles.actionButton, { backgroundColor: "#3B82F6" }]}
// //                 onPress={() => navigation.navigate("Chat")}
// //               >
// //                 <Ionicons name="chatbubble" size={scale(24)} color="#FFFFFF" />
// //                 <Text style={styles.actionTitle}>Ask PetPal AI</Text>
// //                 <Text style={styles.actionSubtitle}>Instant health advice</Text>
// //               </TouchableOpacity>

// //               <TouchableOpacity
// //                 style={[styles.actionButton, { backgroundColor: "#10B981" }]}
// //                 onPress={() => navigation.navigate("Vets")}
// //               >
// //                 <Ionicons name="medical" size={scale(24)} color="#FFFFFF" />
// //                 <Text style={styles.actionTitle}>Find Vet</Text>
// //                 <Text style={styles.actionSubtitle}>4 available now</Text>
// //               </TouchableOpacity>
// //             </View>

// //             <View style={styles.quickActions}>
// //               <TouchableOpacity
// //                 style={[styles.actionButton, { backgroundColor: "#EC4899" }]}
// //               >
// //                 <Ionicons name="camera" size={scale(24)} color="#FFFFFF" />
// //                 <Text style={styles.actionTitle}>Photo Diary</Text>
// //                 <Text style={styles.actionSubtitle}>Capture moments</Text>
// //               </TouchableOpacity>

// //               <TouchableOpacity
// //                 style={[styles.actionButton, { backgroundColor: "#F59E0B" }]}
// //               >
// //                 <Ionicons name="gift" size={scale(24)} color="#FFFFFF" />
// //                 <Text style={styles.actionTitle}>Rewards</Text>
// //                 <Text style={styles.actionSubtitle}>3 badges earned</Text>
// //               </TouchableOpacity>
// //             </View>
// //           </View>

// //           {/* Today's Schedule */}
// //           <View style={styles.section}>
// //             <Text style={styles.sectionTitle}>Today's Schedule</Text>
// //             {petActivities.map((activity) => (
// //               <View key={activity.id} style={styles.activityCard}>
// //                 <View
// //                   style={[
// //                     styles.activityIcon,
// //                     {
// //                       backgroundColor:
// //                         activity.status === "completed" ? "#10B981" : "#3B82F6",
// //                     },
// //                   ]}
// //                 >
// //                   <Ionicons
// //                     name={
// //                       activity.status === "completed" ? "checkmark" : "time"
// //                     }
// //                     size={scale(20)}
// //                     color="#FFFFFF"
// //                   />
// //                 </View>
// //                 <View style={styles.activityInfo}>
// //                   <Text style={styles.activityTitle}>{activity.activity}</Text>
// //                   <Text style={styles.activityTime}>{activity.time}</Text>
// //                 </View>
// //               </View>
// //             ))}
// //           </View>

// //           {/* Health Insights */}
// //           <View style={styles.section}>
// //             <Text style={styles.sectionTitle}>Health Insights</Text>
// //             <View style={styles.healthGrid}>
// //               {healthInsights.map((insight, index) => (
// //                 <View key={index} style={styles.healthCard}>
// //                   <View style={styles.healthCardHeader}>
// //                     <Text style={styles.healthMetric}>{insight.metric}</Text>
// //                     <Ionicons
// //                       name={
// //                         insight.trend === "up" ? "trending-up" : "trending-down"
// //                       }
// //                       size={scale(16)}
// //                       color={insight.trend === "up" ? "#10B981" : "#EF4444"}
// //                     />
// //                   </View>
// //                   <Text style={styles.healthValue}>{insight.value}</Text>
// //                   <Text
// //                     style={[
// //                       styles.healthChange,
// //                       { color: insight.trend === "up" ? "#10B981" : "#EF4444" },
// //                     ]}
// //                   >
// //                     {insight.change} from yesterday
// //                   </Text>
// //                 </View>
// //               ))}
// //             </View>
// //           </View>

// //           {/* Weather Alert */}
// //           <View style={styles.weatherAlert}>
// //             <View style={styles.weatherContent}>
// //               <Ionicons name="sunny" size={scale(24)} color="#F59E0B" />
// //               <View style={styles.weatherInfo}>
// //                 <Text style={styles.weatherTitle}>Perfect Weather Today!</Text>
// //                 <Text style={styles.weatherDescription}>
// //                   24°C & sunny - Great for outdoor activities
// //                 </Text>
// //               </View>
// //             </View>
// //             <View style={styles.weatherActions}>
// //               <TouchableOpacity style={styles.weatherButton}>
// //                 <Text style={styles.weatherButtonText}>Plan Walk</Text>
// //               </TouchableOpacity>
// //             </View>
// //           </View>

// //           <View style={{ height: verticalScale(100) }} />
// //         </View>
// //       </ScrollView>
// //     </SafeAreaView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: "#F9FAFB",
// //   },
// //   scrollView: {
// //     flex: 1,
// //   },
// //   header: {
// //     paddingHorizontal: scale(24),
// //     paddingVertical: verticalScale(24),
// //     borderBottomLeftRadius: scale(24),
// //     borderBottomRightRadius: scale(24),
// //   },
// //   headerTop: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     marginBottom: verticalScale(16),
// //   },
// //   greeting: {
// //     color: "rgba(255, 255, 255, 0.8)",
// //     fontSize: moderateScale(14),
// //   },
// //   userName: {
// //     color: "#FFFFFF",
// //     fontSize: moderateScale(20),
// //     fontWeight: "bold",
// //   },
// //   headerIcons: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     gap: scale(12),
// //   },
// //   notificationButton: {
// //     position: "relative",
// //   },
// //   notificationBadge: {
// //     position: "absolute",
// //     top: -scale(4),
// //     right: -scale(4),
// //     backgroundColor: "#EF4444",
// //     borderRadius: scale(10),
// //     width: scale(20),
// //     height: scale(20),
// //     alignItems: "center",
// //     justifyContent: "center",
// //   },
// //   notificationBadgeText: {
// //     color: "#FFFFFF",
// //     fontSize: moderateScale(10),
// //     fontWeight: "bold",
// //   },
// //   profileButton: {
// //     width: scale(40),
// //     height: scale(40),
// //     backgroundColor: "rgba(255, 255, 255, 0.2)",
// //     borderRadius: scale(20),
// //     alignItems: "center",
// //     justifyContent: "center",
// //   },
// //   liveActivityBar: {
// //     backgroundColor: "rgba(255, 255, 255, 0.1)",
// //     borderRadius: scale(8),
// //     padding: scale(12),
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //   },
// //   liveIndicator: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     gap: scale(8),
// //   },
// //   liveDot: {
// //     width: scale(8),
// //     height: scale(8),
// //     backgroundColor: "#10B981",
// //     borderRadius: scale(4),
// //   },
// //   liveText: {
// //     color: "#FFFFFF",
// //     fontSize: moderateScale(12),
// //   },
// //   onlineUsers: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     gap: scale(4),
// //   },
// //   onlineUsersText: {
// //     color: "#FFFFFF",
// //     fontSize: moderateScale(12),
// //   },
// //   content: {
// //     paddingHorizontal: scale(24),
// //     marginTop: verticalScale(-32),
// //   },
// //   petStatusCard: {
// //     backgroundColor: "#FFFFFF",
// //     borderRadius: scale(16),
// //     padding: scale(20),
// //     marginBottom: verticalScale(24),
// //     shadowColor: "#000",
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 8,
// //     elevation: 4,
// //   },
// //   petStatusContent: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //   },
// //   petAvatar: {
// //     width: scale(64),
// //     height: scale(64),
// //     backgroundColor: "#10B981",
// //     borderRadius: scale(32),
// //     alignItems: "center",
// //     justifyContent: "center",
// //     marginRight: scale(16),
// //   },
// //   petInfo: {
// //     flex: 1,
// //   },
// //   petName: {
// //     fontSize: moderateScale(20),
// //     fontWeight: "bold",
// //     color: "#111827",
// //     marginBottom: verticalScale(4),
// //   },
// //   petMood: {
// //     fontSize: moderateScale(14),
// //     color: "#6B7280",
// //     marginBottom: verticalScale(8),
// //   },
// //   healthStatus: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     gap: scale(8),
// //   },
// //   healthDot: {
// //     width: scale(8),
// //     height: scale(8),
// //     backgroundColor: "#10B981",
// //     borderRadius: scale(4),
// //   },
// //   healthText: {
// //     fontSize: moderateScale(12),
// //     color: "#10B981",
// //     fontWeight: "500",
// //   },
// //   moodEmoji: {
// //     alignItems: "center",
// //   },
// //   emojiText: {
// //     fontSize: moderateScale(24),
// //     marginBottom: verticalScale(4),
// //   },
// //   moodText: {
// //     fontSize: moderateScale(10),
// //     color: "#6B7280",
// //   },
// //   section: {
// //     marginBottom: verticalScale(24),
// //   },
// //   sectionHeader: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     marginBottom: verticalScale(16),
// //   },
// //   sectionTitle: {
// //     fontSize: moderateScale(18),
// //     fontWeight: "bold",
// //     color: "#111827",
// //   },
// //   sectionLink: {
// //     fontSize: moderateScale(14),
// //     color: "#7C3AED",
// //     fontWeight: "500",
// //   },
// //   eventsContainer: {
// //     gap: scale(12),
// //   },
// //   eventCard: {
// //     backgroundColor: "#FFFFFF",
// //     borderRadius: scale(12),
// //     padding: scale(16),
// //     width: width * 0.7,
// //     borderWidth: 1,
// //     borderColor: "#E5E7EB",
// //   },
// //   eventHeader: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     marginBottom: verticalScale(8),
// //   },
// //   eventBadge: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     gap: scale(4),
// //     backgroundColor: "#FEF3F2",
// //     paddingHorizontal: scale(8),
// //     paddingVertical: verticalScale(4),
// //     borderRadius: scale(12),
// //   },
// //   eventBadgeText: {
// //     fontSize: moderateScale(10),
// //     fontWeight: "500",
// //   },
// //   participantsContainer: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     gap: scale(4),
// //   },
// //   participantsText: {
// //     fontSize: moderateScale(12),
// //     color: "#6B7280",
// //   },
// //   eventTitle: {
// //     fontSize: moderateScale(14),
// //     fontWeight: "600",
// //     color: "#111827",
// //     marginBottom: verticalScale(4),
// //   },
// //   eventLocation: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     gap: scale(4),
// //     marginBottom: verticalScale(12),
// //   },
// //   eventLocationText: {
// //     fontSize: moderateScale(12),
// //     color: "#6B7280",
// //   },
// //   eventButton: {
// //     backgroundColor: "#7C3AED",
// //     paddingVertical: verticalScale(8),
// //     borderRadius: scale(8),
// //     alignItems: "center",
// //   },
// //   eventButtonText: {
// //     color: "#FFFFFF",
// //     fontSize: moderateScale(12),
// //     fontWeight: "500",
// //   },
// //   challengeCard: {
// //     backgroundColor: "#FFFFFF",
// //     borderRadius: scale(12),
// //     padding: scale(16),
// //     marginBottom: verticalScale(12),
// //     borderWidth: 1,
// //     borderColor: "#E5E7EB",
// //   },
// //   challengeHeader: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     marginBottom: verticalScale(8),
// //   },
// //   challengeTitle: {
// //     fontSize: moderateScale(14),
// //     fontWeight: "600",
// //     color: "#111827",
// //   },
// //   challengeParticipants: {
// //     fontSize: moderateScale(12),
// //     color: "#6B7280",
// //   },
// //   challengeDetails: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     marginBottom: verticalScale(8),
// //   },
// //   challengeReward: {
// //     fontSize: moderateScale(12),
// //     color: "#6B7280",
// //   },
// //   challengeProgress: {
// //     fontSize: moderateScale(12),
// //     color: "#7C3AED",
// //     fontWeight: "500",
// //   },
// //   progressBar: {
// //     height: verticalScale(8),
// //     backgroundColor: "#E5E7EB",
// //     borderRadius: scale(4),
// //     overflow: "hidden",
// //     marginBottom: verticalScale(12),
// //   },
// //   progressFill: {
// //     height: "100%",
// //     backgroundColor: "#7C3AED",
// //   },
// //   challengeButton: {
// //     backgroundColor: "#F59E0B",
// //     paddingVertical: verticalScale(8),
// //     borderRadius: scale(8),
// //     alignItems: "center",
// //   },
// //   challengeButtonText: {
// //     color: "#FFFFFF",
// //     fontSize: moderateScale(12),
// //     fontWeight: "500",
// //   },
// //   quickActions: {
// //     flexDirection: "row",
// //     gap: scale(16),
// //     marginBottom: verticalScale(16),
// //   },
// //   actionButton: {
// //     flex: 1,
// //     padding: scale(16),
// //     borderRadius: scale(12),
// //     alignItems: "flex-start",
// //     gap: verticalScale(8),
// //   },
// //   actionTitle: {
// //     color: "#FFFFFF",
// //     fontSize: moderateScale(14),
// //     fontWeight: "500",
// //   },
// //   actionSubtitle: {
// //     color: "rgba(255, 255, 255, 0.8)",
// //     fontSize: moderateScale(10),
// //   },
// //   activityCard: {
// //     backgroundColor: "#FFFFFF",
// //     borderRadius: scale(12),
// //     padding: scale(16),
// //     marginBottom: verticalScale(12),
// //     flexDirection: "row",
// //     alignItems: "center",
// //     borderWidth: 1,
// //     borderColor: "#E5E7EB",
// //   },
// //   activityIcon: {
// //     width: scale(48),
// //     height: scale(48),
// //     borderRadius: scale(24),
// //     alignItems: "center",
// //     justifyContent: "center",
// //     marginRight: scale(16),
// //   },
// //   activityInfo: {
// //     flex: 1,
// //   },
// //   activityTitle: {
// //     fontSize: moderateScale(14),
// //     fontWeight: "600",
// //     color: "#111827",
// //     marginBottom: verticalScale(4),
// //   },
// //   activityTime: {
// //     fontSize: moderateScale(12),
// //     color: "#6B7280",
// //   },
// //   healthGrid: {
// //     flexDirection: "row",
// //     flexWrap: "wrap",
// //     gap: scale(12),
// //   },
// //   healthCard: {
// //     backgroundColor: "#FFFFFF",
// //     borderRadius: scale(12),
// //     padding: scale(16),
// //     width: (width - scale(60)) / 2,
// //     borderWidth: 1,
// //     borderColor: "#E5E7EB",
// //   },
// //   healthCardHeader: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     marginBottom: verticalScale(8),
// //   },
// //   healthMetric: {
// //     fontSize: moderateScale(12),
// //     color: "#6B7280",
// //   },
// //   healthValue: {
// //     fontSize: moderateScale(18),
// //     fontWeight: "bold",
// //     color: "#111827",
// //     marginBottom: verticalScale(4),
// //   },
// //   healthChange: {
// //     fontSize: moderateScale(10),
// //   },
// //   weatherAlert: {
// //     backgroundColor: "#FEF3C7",
// //     borderWidth: 1,
// //     borderColor: "#F59E0B",
// //     borderRadius: scale(12),
// //     padding: scale(16),
// //     marginBottom: verticalScale(24),
// //   },
// //   weatherContent: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     gap: scale(12),
// //     marginBottom: verticalScale(12),
// //   },
// //   weatherInfo: {
// //     flex: 1,
// //   },
// //   weatherTitle: {
// //     fontSize: moderateScale(14),
// //     fontWeight: "bold",
// //     color: "#92400E",
// //     marginBottom: verticalScale(4),
// //   },
// //   weatherDescription: {
// //     fontSize: moderateScale(12),
// //     color: "#D97706",
// //   },
// //   weatherActions: {
// //     flexDirection: "row",
// //     gap: scale(8),
// //   },
// //   weatherButton: {
// //     backgroundColor: "#F59E0B",
// //     paddingHorizontal: scale(12),
// //     paddingVertical: verticalScale(6),
// //     borderRadius: scale(16),
// //   },
// //   weatherButtonText: {
// //     color: "#FFFFFF",
// //     fontSize: moderateScale(10),
// //     fontWeight: "500",
// //   },
// // });

// import React, { useState, useContext, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   TextInput,
//   ScrollView,
//   Dimensions,
//   Platform,
//   Alert,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { moderateScale, scale, verticalScale } from "react-native-size-matters";
// import { AuthContext } from "../context/AuthContext";
// import axios from "axios";
// import DoctorAppointmentModal from "./DoctorAppointmentModal";

// const { width } = Dimensions.get("window");

// export default function HomeScreen({ navigation }) {
//   const { user, token, nearbyDoctors, updateChatRoomToken } =
//     useContext(AuthContext);
//   const [inputMessage, setInputMessage] = useState("");
//   const [temperature, setTemperature] = useState("32°C");
//   const [isLoading, setIsLoading] = useState(false);
//   const [showAppointmentModal, setShowAppointmentModal] = useState(false);

//   const handleSendMessage = async () => {
//     if (inputMessage.trim() === "" || isLoading) return;

//     setIsLoading(true);

//     try {
//       // Create new chat room
//       const response = await axios.post(
//         "https://snoutiq.com/backend/api/chat-rooms",
//         { user_id: user.id },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       const newChatRoomToken = response.data?.chat_room_token;

//       if (newChatRoomToken) {
//         updateChatRoomToken(newChatRoomToken);

//         // Navigate to Chat screen with the message and new chat room token
//         navigation.navigate("Chat", {
//           chat_room_token: newChatRoomToken,
//           initialMessage: inputMessage.trim(),
//           isNewChat: true,
//           timestamp: Date.now(),
//         });

//         setInputMessage("");
//       }
//     } catch (error) {
//       console.error("Error creating chat room:", error);
//       Alert.alert("Error", "Failed to start chat. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleVideoCall = () => {
//     if (nearbyDoctors.length === 0) {
//       Alert.alert(
//         "No Doctors Available",
//         "There are no doctors available for video consultation at the moment."
//       );
//       return;
//     }

//     // Navigate to Vets screen to show available doctors
//     navigation.navigate("Vets", {
//       showVideoCallOptions: true,
//     });
//   };

//   const handleBookClinic = () => {
//     if (nearbyDoctors.length === 0) {
//       Alert.alert(
//         "No Clinics Available",
//         "There are no clinics available near you at the moment."
//       );
//       return;
//     }
//     setShowAppointmentModal(true);
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView
//         style={styles.scrollView}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Header */}
//         <LinearGradient colors={["#7C3AED", "#EC4899"]} style={styles.header}>
//           <View style={styles.headerTop}>
//             <View style={styles.headerLeft}>
//               <Text style={styles.appLogo}>SnoutIQ</Text>
//             </View>
//             <View style={styles.locationInfo}>
//               <Ionicons name="location" size={12} color="#FFFFFF" />
//               <Text style={styles.locationText}>
//                 Gurgaon • <Text style={styles.temperature}>{temperature}</Text>
//               </Text>
//             </View>
//           </View>

//           <View style={styles.headerBottom}>
//             <View style={styles.petInfo}>
//               <Text style={styles.welcomeText}>AI Vet is ready to serve</Text>
//               <View style={styles.petDetails}>
//                 <View style={styles.petDetailItem}>
//                   <Text style={styles.petDetailIcon}>🐕</Text>
//                   <Text style={styles.petDetailText}>
//                     {user?.breed || "Golden Retriever"}
//                   </Text>
//                 </View>
//                 <View style={styles.petDetailItem}>
//                   <Text style={styles.petDetailIcon}>📅</Text>
//                   <Text style={styles.petDetailText}>
//                     {user?.pet_age || "3"} years
//                   </Text>
//                 </View>
//                 <View style={styles.petDetailItem}>
//                   <Text style={styles.petDetailIcon}>⚤</Text>
//                   <Text style={styles.petDetailText}>
//                     {user?.pet_gender || "Male"}
//                   </Text>
//                 </View>
//               </View>
//             </View>
//             <View style={styles.userAvatar}>
//               <Text style={styles.userAvatarText}>
//                 {user?.name ? user.name.substring(0, 2).toUpperCase() : "SP"}
//               </Text>
//             </View>
//           </View>
//         </LinearGradient>

//         {/* AI Search Section */}
//         <View style={styles.aiSearchSection}>
//           <View style={styles.searchInputWrapper}>
//             <TextInput
//               style={styles.aiInput}
//               placeholder="Describe your pet's symptoms..."
//               placeholderTextColor="#999"
//               value={inputMessage}
//               onChangeText={setInputMessage}
//               multiline
//               numberOfLines={2}
//               maxLength={500}
//             />
//             <TouchableOpacity
//               style={[styles.sendBtn, isLoading && styles.sendBtnDisabled]}
//               onPress={handleSendMessage}
//               disabled={isLoading || !inputMessage.trim()}
//             >
//               <LinearGradient
//                 colors={["#4F46E5", "#7C3AED"]}
//                 style={styles.sendBtnGradient}
//               >
//                 <Ionicons
//                   name={isLoading ? "hourglass-outline" : "arrow-forward"}
//                   size={20}
//                   color="#FFFFFF"
//                 />
//               </LinearGradient>
//             </TouchableOpacity>
//           </View>
//           <Text style={styles.aiHelperText}>
//             AI will analyze and suggest next steps
//           </Text>
//         </View>

//         {/* Services Grid */}
//         <View style={styles.servicesSection}>
//           <View style={styles.servicesGrid}>
//             <TouchableOpacity
//               style={styles.serviceItem}
//               onPress={handleVideoCall}
//               activeOpacity={0.7}
//             >
//               <LinearGradient
//                 colors={["#E8F4FF", "#F0F8FF"]}
//                 style={styles.serviceIcon}
//               >
//                 <Ionicons name="videocam" size={28} color="#4F46E5" />
//               </LinearGradient>
//               <Text style={styles.serviceTitle}>Video Consultation</Text>
//               <Text style={styles.serviceSubtitle}>
//                 {nearbyDoctors.length}{" "}
//                 {nearbyDoctors.length === 1 ? "vet" : "vets"} available online
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.serviceItem}
//               onPress={handleBookClinic}
//               activeOpacity={0.7}
//             >
//               <LinearGradient
//                 colors={["#E8F4FF", "#F0F8FF"]}
//                 style={styles.serviceIcon}
//               >
//                 <Ionicons name="medical" size={28} color="#10B981" />
//               </LinearGradient>
//               <Text style={styles.serviceTitle}>Book Clinic Visit</Text>
//               <Text style={styles.serviceSubtitle}>
//                 {nearbyDoctors.length} clinics near you
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.serviceItem}
//               onPress={() => navigation.navigate("Health")}
//               activeOpacity={0.7}
//             >
//               <LinearGradient
//                 colors={["#E8F4FF", "#F0F8FF"]}
//                 style={styles.serviceIcon}
//               >
//                 <Ionicons name="document-text" size={28} color="#3B82F6" />
//               </LinearGradient>
//               <Text style={styles.serviceTitle}>Health Records</Text>
//               <Text style={styles.serviceSubtitle}>View pet history</Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.serviceItem} activeOpacity={0.7}>
//               <LinearGradient
//                 colors={["#E8F4FF", "#F0F8FF"]}
//                 style={styles.serviceIcon}
//               >
//                 <Ionicons name="medkit" size={28} color="#EC4899" />
//               </LinearGradient>
//               <Text style={styles.serviceTitle}>Medicines</Text>
//               <Text style={styles.serviceSubtitle}>Order & refills</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         <View style={{ height: verticalScale(100) }} />

//         {/* ✅ Modal */}
//         <DoctorAppointmentModal
//           visible={showAppointmentModal}
//           onClose={() => setShowAppointmentModal(false)}
//           onBook={(appointment) => {
//             console.log("Appointment booked:", appointment);
//             Alert.alert(
//               "Success",
//               `Appointment with ${appointment.vet_name} on ${appointment.date} at ${appointment.start_time} booked successfully!`
//             );
//             setShowAppointmentModal(false);
//           }}
//         />
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F8FAFC",
//   },
//   scrollView: {
//     flex: 1,
//   },
//   header: {
//     paddingHorizontal: scale(20),
//     paddingTop: Platform.OS === "ios" ? verticalScale(50) : verticalScale(16),
//     paddingBottom: verticalScale(20),
//     borderBottomLeftRadius: 24,
//     borderBottomRightRadius: 24,
//   },
//   headerTop: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: verticalScale(16),
//   },
//   headerLeft: {
//     flex: 1,
//   },
//   appLogo: {
//     fontSize: moderateScale(24),
//     fontWeight: "700",
//     color: "#FFFFFF",
//   },
//   locationInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: scale(6),
//     backgroundColor: "rgba(255, 255, 255, 0.2)",
//     paddingHorizontal: scale(12),
//     paddingVertical: verticalScale(6),
//     borderRadius: 16,
//   },
//   locationText: {
//     fontSize: moderateScale(12),
//     color: "#FFFFFF",
//   },
//   temperature: {
//     fontWeight: "600",
//     color: "#FFFFFF",
//   },
//   headerBottom: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//   },
//   petInfo: {
//     flex: 1,
//   },
//   welcomeText: {
//     fontSize: moderateScale(14),
//     color: "rgba(255, 255, 255, 0.9)",
//     fontWeight: "500",
//     marginBottom: verticalScale(8),
//   },
//   petDetails: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: scale(8),
//   },
//   petDetailItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: scale(4),
//     backgroundColor: "rgba(255, 255, 255, 0.2)",
//     paddingHorizontal: scale(8),
//     paddingVertical: verticalScale(4),
//     borderRadius: 12,
//   },
//   petDetailIcon: {
//     fontSize: moderateScale(10),
//   },
//   petDetailText: {
//     fontSize: moderateScale(11),
//     color: "#FFFFFF",
//   },
//   userAvatar: {
//     width: scale(40),
//     height: scale(40),
//     backgroundColor: "rgba(255, 255, 255, 0.2)",
//     borderRadius: 20,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   userAvatarText: {
//     fontSize: moderateScale(16),
//     fontWeight: "600",
//     color: "#FFFFFF",
//   },
//   aiSearchSection: {
//     backgroundColor: "#FFFFFF",
//     borderWidth: 2,
//     borderColor: "#7C3AED",
//     borderRadius: 16,
//     padding: scale(20),
//     marginHorizontal: scale(20),
//     marginTop: verticalScale(24),
//     shadowColor: "#7C3AED",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 8,
//   },
//   searchInputWrapper: {
//     position: "relative",
//     marginBottom: verticalScale(10),
//   },
//   aiInput: {
//     width: "100%",
//     minHeight: verticalScale(60),
//     maxHeight: verticalScale(120),
//     paddingHorizontal: scale(16),
//     paddingTop: verticalScale(14),
//     paddingBottom: verticalScale(14),
//     paddingRight: scale(60),
//     backgroundColor: "#F9FAFB",
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     borderRadius: 12,
//     color: "#1F2937",
//     fontSize: moderateScale(14),
//     textAlignVertical: "top",
//   },
//   sendBtn: {
//     position: "absolute",
//     right: scale(8),
//     top: verticalScale(12),
//     width: scale(40),
//     height: scale(40),
//     borderRadius: 20,
//     overflow: "hidden",
//     shadowColor: "#4F46E5",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   sendBtnDisabled: {
//     opacity: 0.5,
//   },
//   sendBtnGradient: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   aiHelperText: {
//     fontSize: moderateScale(11),
//     color: "#6B7280",
//   },
//   servicesSection: {
//     paddingHorizontal: scale(20),
//     paddingTop: verticalScale(24),
//   },
//   servicesGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: scale(12),
//   },
//   serviceItem: {
//     width: (width - scale(52)) / 2,
//     backgroundColor: "#FFFFFF",
//     borderWidth: 2,
//     borderColor: "#E8F4FF",
//     borderRadius: 16,
//     padding: scale(20),
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   serviceIcon: {
//     width: scale(56),
//     height: scale(56),
//     borderRadius: 14,
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: verticalScale(14),
//   },
//   serviceTitle: {
//     fontSize: moderateScale(14),
//     fontWeight: "600",
//     marginBottom: verticalScale(4),
//     color: "#1F2937",
//     textAlign: "center",
//   },
//   serviceSubtitle: {
//     fontSize: moderateScale(11),
//     color: "#6B7280",
//     textAlign: "center",
//   },
// });

import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useContext, useEffect, useRef, useState } from "react";
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
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { AuthContext } from "../context/AuthContext";
import { socket } from "../context/Socket";
import DoctorAppointmentModal from "./DoctorAppointmentModal";

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
  const { liveDoctors } = useContext(AuthContext); // Access liveDoctors from AuthContext
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
                buttonDisabled && { opacity: 0 },
              ]}
            />
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
                  {liveDoctors?.length > 0 && (
                    <View style={styles.liveIndicator}>
                      <View style={styles.liveDot} />
                    </View>
                  )}
                </>
              )}
            </View>
          </LinearGradient>
          <Text style={styles.serviceTitle}>Video Consultation</Text>
          {liveDoctors?.length > 0 && !buttonDisabled ? (
            <View style={styles.infoRow}>
              <Text style={styles.liveText}>
                {liveDoctors.length} Doctor{liveDoctors.length > 1 ? "s" : ""}{" "}
                Live
              </Text>
            </View>
          ) : (
            <Text style={styles.serviceSubtitle}>Check availability</Text>
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
  const { user, token, nearbyDoctors, userId } = useContext(AuthContext);
  const [inputMessage, setInputMessage] = useState("");
  const [temperature, setTemperature] = useState("32°C");
  const [isLoading, setIsLoading] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const glowAnim = useRef(new Animated.Value(0)).current;

  // ✨ Glow Animation
  useEffect(() => {
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
    return () => glow.stop();
  }, []);

// 💬 Send Message
const handleSendMessage = async () => {
  if (inputMessage.trim() === "" || isLoading) return;
  
  const messageToSend = inputMessage.trim();
  setInputMessage(""); // Clear input immediately
  setIsLoading(true);

  try {
    // Generate unique chat room token for new conversation
    const newChatRoomToken = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    navigation.navigate("Chat", {
      initialMessage: messageToSend,
      isNewChat: true,
      chat_room_token: newChatRoomToken,
      loadHistory: false, // Don't load old history
      timestamp: Date.now(),
    });
  } finally {
    setIsLoading(false);
  }
};

  // 📅 Book Clinic Visit
  const handleBookClinic = () => {
    if (!nearbyDoctors || nearbyDoctors.length === 0) {
      Alert.alert("No Clinics Available", "No clinics available near you.");
      return;
    }
    setShowAppointmentModal(true);
  };

  // 📅 Handle Appointment Booked
  const handleAppointmentBooked = () => {
    setShowAppointmentModal(false);
    navigation.navigate("AppointmentConfirmation");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={["#7C3AED", "#EC4899"]} style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.appLogo}>SnoutIQ</Text>
            </View>
            <View style={styles.locationInfo}>
              <Ionicons name="location" size={12} color="#FFFFFF" />
              <Text style={styles.locationText}>
                Gurgaon • <Text style={styles.temperature}>{temperature}</Text>
              </Text>
            </View>
          </View>
          <View style={styles.headerBottom}>
            <View style={styles.petInfo}>
              <Text style={styles.welcomeText}>AI Vet is ready to serve</Text>
              <View style={styles.petDetails}>
                <View style={styles.petDetailItem}>
                  <Text style={styles.petDetailIcon}>🐕</Text>
                  <Text style={styles.petDetailText}>
                    {user?.breed || "Golden Retriever"}
                  </Text>
                </View>
                <View style={styles.petDetailItem}>
                  <Text style={styles.petDetailIcon}>📅</Text>
                  <Text style={styles.petDetailText}>
                    {user?.pet_age || "3"} years
                  </Text>
                </View>
                <View style={styles.petDetailItem}>
                  <Text style={styles.petDetailIcon}>⚤</Text>
                  <Text style={styles.petDetailText}>
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
                  size={20}
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
                <Ionicons name="medical" size={28} color="#10B981" />
              </LinearGradient>
              <Text style={styles.serviceTitle}>Book Clinic Visit</Text>
              <Text style={styles.serviceSubtitle}>
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
                <Ionicons name="document-text" size={28} color="#3B82F6" />
              </LinearGradient>
              <Text style={styles.serviceTitle}>Health Records</Text>
              <Text style={styles.serviceSubtitle}>View pet history</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceItem} activeOpacity={0.7}>
              <LinearGradient
                colors={["#E8F4FF", "#F0F8FF"]}
                style={styles.serviceIcon}
              >
                <Ionicons name="medkit" size={28} color="#EC4899" />
              </LinearGradient>
              <Text style={styles.serviceTitle}>Medicines</Text>
              <Text style={styles.serviceSubtitle}>Order & refills</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: verticalScale(100) }} />
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
    paddingHorizontal: scale(20),
    paddingTop: Platform.OS === "ios" ? verticalScale(50) : verticalScale(16),
    paddingBottom: verticalScale(20),
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(16),
  },
  headerLeft: {
    flex: 1,
  },
  appLogo: {
    fontSize: moderateScale(24),
    fontWeight: "700",
    color: "#FFFFFF",
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: 16,
  },
  locationText: {
    fontSize: moderateScale(12),
    color: "#FFFFFF",
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
  },
  welcomeText: {
    fontSize: moderateScale(14),
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
    marginBottom: verticalScale(8),
  },
  petDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(8),
  },
  petDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: 12,
  },
  petDetailIcon: {
    fontSize: moderateScale(10),
  },
  petDetailText: {
    fontSize: moderateScale(11),
    color: "#FFFFFF",
  },
  userAvatar: {
    width: scale(40),
    height: scale(40),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  aiSearchSection: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#7C3AED",
    borderRadius: 16,
    padding: scale(20),
    marginHorizontal: scale(20),
    marginTop: verticalScale(24),
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  searchInputWrapper: {
    position: "relative",
    marginBottom: verticalScale(10),
  },
  aiInput: {
    width: "100%",
    minHeight: verticalScale(60),
    maxHeight: verticalScale(120),
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(14),
    paddingBottom: verticalScale(14),
    paddingRight: scale(60),
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    color: "#1F2937",
    fontSize: moderateScale(14),
    textAlignVertical: "top",
  },
  sendBtn: {
    position: "absolute",
    right: scale(8),
    top: verticalScale(12),
    width: scale(40),
    height: scale(40),
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#4F46E5",
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
  liveIndicator: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
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
    width: 10,
    height: 10,
    borderRadius: 5,
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
  liveText: {
    color: "#10B981",
    fontWeight: "700",
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
  callButtonWrapper: {
    alignItems: "center",
    marginBottom: verticalScale(24),
  },
  callButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  callButtonDisabled: {
    opacity: 0.6,
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
  callButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(20),
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
  infoText: {
    fontSize: moderateScale(11),
    color: "#6B7280",
  },
});
