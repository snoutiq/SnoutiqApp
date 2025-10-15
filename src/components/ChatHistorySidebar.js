import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { AuthContext } from "../context/AuthContext";

const { width, height } = Dimensions.get("window");

// Cache keys
const CACHE_KEYS = {
  CHAT_HISTORY: 'chat_history_cache',
  LAST_FETCH_TIME: 'chat_history_last_fetch',
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes cache
};

// Responsive constants
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

const ChatHistorySidebar = ({
  visible,
  onClose,
  navigation,
  currentChatRoomToken,
}) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);

  const { user, updateChatRoomToken, token } = useContext(AuthContext);
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Skeleton loader data
  const skeletonData = Array(6).fill({ id: Math.random(), isSkeleton: true });

  // Cache management functions
  const getCachedHistory = async () => {
    try {
      const cachedData = await AsyncStorage.getItem(CACHE_KEYS.CHAT_HISTORY);
      const lastFetchTime = await AsyncStorage.getItem(CACHE_KEYS.LAST_FETCH_TIME);
      
      if (cachedData && lastFetchTime) {
        const timeDiff = Date.now() - parseInt(lastFetchTime);
        if (timeDiff < CACHE_KEYS.CACHE_DURATION) {
          console.log("Loading from cache");
          return JSON.parse(cachedData);
        } else {
          console.log("Cache expired, clearing...");
          await clearCache();
        }
      }
      return null;
    } catch (error) {
      console.error("Error reading cache:", error);
      return null;
    }
  };

  const setCachedHistory = async (data) => {
    try {
      await AsyncStorage.setItem(CACHE_KEYS.CHAT_HISTORY, JSON.stringify(data));
      await AsyncStorage.setItem(CACHE_KEYS.LAST_FETCH_TIME, Date.now().toString());
      console.log("Data cached successfully");
    } catch (error) {
      console.error("Error caching data:", error);
    }
  };

  const clearCache = async () => {
    try {
      await AsyncStorage.removeItem(CACHE_KEYS.CHAT_HISTORY);
      await AsyncStorage.removeItem(CACHE_KEYS.LAST_FETCH_TIME);
      console.log("Cache cleared");
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  };

  const updateCacheAfterDelete = async (deletedId) => {
    try {
      const cachedData = await getCachedHistory();
      if (cachedData) {
        const updatedData = cachedData.filter((c) => c.id !== deletedId);
        await setCachedHistory(updatedData);
      }
    } catch (error) {
      console.error("Error updating cache after delete:", error);
    }
  };

  const updateCacheAfterNewChat = async (newChat) => {
    try {
      const cachedData = await getCachedHistory();
      if (cachedData) {
        const updatedData = [newChat, ...cachedData];
        await setCachedHistory(updatedData);
      }
    } catch (error) {
      console.error("Error updating cache after new chat:", error);
    }
  };

  // Fetch chat history with cache
  // const fetchHistory = async (isRefresh = false, forceRefresh = false) => {
  //   if (!user || !token) return;

  //   // Don't show skeleton on refresh
  //   if (isRefresh) {
  //     setRefreshing(true);
  //   } else {
  //     setLoading(true);
  //     if (!forceRefresh) {
  //       setShowSkeleton(true);
  //     }
  //   }

  //   try {
  //     // Try to get from cache first (unless force refresh)
  //     if (!forceRefresh && !isRefresh) {
  //       const cachedData = await getCachedHistory();
  //       if (cachedData) {
  //         console.log("Using cached data");
  //         setHistory(cachedData);
  //         setShowSkeleton(false);
  //         setLoading(false);
  //         return;
  //       }
  //     }

  //     // Fetch from API
  //     console.log("Fetching fresh data from API");
  //     const response = await axios.get(
  //       `https://snoutiq.com/backend/api/chat/listRooms?user_id=${user.id}`,
  //       { 
  //         headers: { Authorization: `Bearer ${token}` },
  //         timeout: 10000
  //       }
  //     );
      
  //     console.log("Chat history API response:", response.data);

  //     if (response.data && response.data.rooms) {
  //       const sorted = response.data.rooms.sort(
  //         (a, b) =>
  //           new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  //       );
  //       setHistory(sorted);
        
  //       // Cache the fresh data
  //       await setCachedHistory(sorted);
  //     } else {
  //       setHistory([]);
  //       await setCachedHistory([]);
  //     }
  //   } catch (error) {
  //     console.error("Failed to load chat history:", error);
      
  //     // If API fails, try to show cached data as fallback
  //     if (!isRefresh) {
  //       const cachedData = await getCachedHistory();
  //       if (cachedData) {
  //         console.log("API failed, using cached data as fallback");
  //         setHistory(cachedData);
  //       } else {
  //         Alert.alert("Error", "Failed to load chat history");
  //         setHistory([]);
  //       }
  //     } else {
  //       Alert.alert("Error", "Failed to refresh chat history");
  //     }
  //   } finally {
  //     setLoading(false);
  //     setRefreshing(false);
  //     setShowSkeleton(false);
  //   }
  // };

  
  const fetchHistory = async (isRefresh = false, forceRefresh = false) => {
  if (!user || !token) return;

  if (isRefresh) {
    setRefreshing(true);
  } else {
    setLoading(true);
    if (!forceRefresh) setShowSkeleton(true);
  }

  try {
    // Start fetching cache and API in parallel
    const cachedPromise = !forceRefresh && !isRefresh ? getCachedHistory() : null;
    const apiPromise = axios.get(
      `https://snoutiq.com/backend/api/chat/listRooms?user_id=${user.id}`,
      { headers: { Authorization: `Bearer ${token}` }, timeout: 8000 }
    );

    // Show cache immediately if available (non-blocking)
    if (cachedPromise) {
      cachedPromise.then((cachedData) => {
        if (cachedData) {
          console.log("⚡ Showing cached data instantly");
          setHistory(cachedData);
          setShowSkeleton(false);
        }
      });
    }

    // Wait for fresh API data
    const response = await apiPromise;
    const rooms = response?.data?.rooms || [];

    const sorted = rooms.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    setHistory(sorted);
    await setCachedHistory(sorted);
  } catch (error) {
    console.error("Failed to load chat history:", error);
    const cachedData = await getCachedHistory();
    if (cachedData) {
      console.log("⚠️ API failed, using cached data fallback");
      setHistory(cachedData);
    } else {
      Alert.alert("Error", "Failed to load chat history");
      setHistory([]);
    }
  } finally {
    setLoading(false);
    setRefreshing(false);
    setShowSkeleton(false);
  }
};


  // Start new chat
  const handleNewChat = async () => {
    if (!user || !token) return;

    try {
      const response = await axios.get(
        `https://snoutiq.com/backend/api/chat-rooms/new?user_id=${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { chat_room_token } = response.data;

      if (updateChatRoomToken) {
        updateChatRoomToken(chat_room_token);
      }

      handleClose();

      setTimeout(() => {
        navigation.navigate("Chat", {
          chat_room_token,
          isNewChat: true,
          loadHistory: false,
          timestamp: Date.now(),
        });
      }, 350);

      // Update cache with new chat
      const newChat = {
        id: Date.now(), // Temporary ID
        chat_room_token,
        name: "New Chat",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await updateCacheAfterNewChat(newChat);
      
      // Refresh history (will use cache first)
      await fetchHistory(false, true); // Force refresh to get actual data

    } catch (error) {
      console.error("Failed to start new chat:", error);
      Alert.alert("Error", "Failed to start new chat");
    }
  };

  // Delete chat
  const handleDeleteChat = async (chatId, chatRoomToken) => {
    if (!user || !token) return;
    
    Alert.alert("Delete Chat", "Are you sure you want to delete this chat?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeletingId(chatId);
          try {
            await axios.delete(
              `https://snoutiq.com/backend/api/chat-rooms/${chatRoomToken}?user_id=${user.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            // Remove from state
            setHistory((prev) => prev.filter((c) => c.id !== chatId));

            // Update cache
            await updateCacheAfterDelete(chatId);

            // If deleted chat is current, create new one
            if (chatRoomToken === currentChatRoomToken) {
              await handleNewChat();
            }
          } catch (error) {
            console.error("Failed to delete chat:", error);
            Alert.alert("Error", "Failed to delete chat");
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  // Select chat from history
  const handleSelectChat = (chatRoomToken) => {
    if (updateChatRoomToken) {
      updateChatRoomToken(chatRoomToken);
    }

    handleClose();

    setTimeout(() => {
      navigation.navigate("Chat", {
        chat_room_token: chatRoomToken,
        loadHistory: true,
        isNewChat: false,
        timestamp: Date.now(),
      });
    }, 350);
  };

  // Format date
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));

    if (diff === 0) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diff === 1) {
      return "Yesterday";
    } else if (diff < 7) {
      return `${diff} days ago`;
    } else {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  // Skeleton loader component
  const SkeletonLoader = () => {
    const pulseAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
      const pulse = Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]);

      Animated.loop(pulse).start();
    }, []);

    return (
      <View style={styles.skeletonItem}>
        <Animated.View style={[styles.skeletonIcon, { opacity: pulseAnim }]} />
        <View style={styles.skeletonContent}>
          <Animated.View
            style={[
              styles.skeletonLine,
              styles.skeletonTitle,
              { opacity: pulseAnim },
            ]}
          />
          <Animated.View
            style={[
              styles.skeletonLine,
              styles.skeletonSubtitle,
              { opacity: pulseAnim },
            ]}
          />
        </View>
        <Animated.View
          style={[styles.skeletonButton, { opacity: pulseAnim }]}
        />
      </View>
    );
  };

  // Render chat item or skeleton
  const renderChatItem = ({ item }) => {
    if (item.isSkeleton) {
      return <SkeletonLoader />;
    }

    const isActive = item.chat_room_token === currentChatRoomToken;
    const isDeleting = deletingId === item.id;

    const lastMessage = item.last_message || item.name || "New Chat";
    const displayName =
      item.name && !item.name.startsWith("New chat -")
        ? item.name
        : lastMessage.length > 50
        ? lastMessage.substring(0, 50) + "..."
        : lastMessage;

    return (
      <TouchableOpacity
        style={[styles.chatItem, isActive && styles.chatItemActive]}
        onPress={() => handleSelectChat(item.chat_room_token)}
        disabled={isDeleting}
        activeOpacity={0.7}
      >
        <View style={styles.chatItemLeft}>
          <View style={[styles.chatIcon, isActive && styles.chatIconActive]}>
            <Ionicons
              name="chatbubble-ellipses"
              size={scale(18)}
              color={isActive ? "#FFFFFF" : "#7C3AED"}
            />
          </View>

          <View style={styles.chatInfo}>
            <Text
              style={[styles.chatName, isActive && styles.chatNameActive]}
              numberOfLines={1}
            >
              {displayName}
            </Text>
            <Text style={styles.chatDate}>{formatDate(item.created_at)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteChat(item.id, item.chat_room_token)}
          disabled={isDeleting}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <Ionicons name="trash-outline" size={scale(18)} color="#EF4444" />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // Open animation
  useEffect(() => {
    if (visible) {
      fetchHistory();

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      setShowSkeleton(false);
    }
  }, [visible]);

  // Close animation
  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent={false}
    >
      <View style={styles.modalContainer}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        <Animated.View
          style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}
        >
          <BlurView intensity={100} tint="light" style={styles.sidebarContent}>
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              style={styles.header}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.headerTop}>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.headerTitle}>Chat History</Text>
                  <Text style={styles.headerSubtitle}>
                    {showSkeleton || loading
                      ? "Loading..."
                      : `${history.length} conversation${
                          history.length !== 1 ? "s" : ""
                        }`}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={scale(24)} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.newChatButton}
                onPress={handleNewChat}
                activeOpacity={0.8}
                disabled={loading}
              >
                <LinearGradient
                  colors={["#FFFFFF", "#F3F4F6"]}
                  style={styles.newChatGradient}
                >
                  <Ionicons
                    name="add-circle"
                    size={scale(20)}
                    color="#EC4899"
                  />
                  <Text style={styles.newChatText}>Start New Chat</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={scale(16)}
                    color="#EC4899"
                  />
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.listContainer}>
              {showSkeleton ? (
                <View style={styles.listContent}>
                  {skeletonData.map((item, index) => (
                    <SkeletonLoader key={index} />
                  ))}
                </View>
              ) : history.length === 0 && !loading ? (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIcon}>
                    <Ionicons
                      name="chatbubbles-outline"
                      size={scale(48)}
                      color="#9CA3AF"
                    />
                  </View>
                  <Text style={styles.emptyTitle}>No chat history yet</Text>
                  <Text style={styles.emptySubtitle}>
                    Start a conversation with our AI veterinarian
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={handleNewChat}
                  >
                    <LinearGradient
                      colors={["#667eea", "#764ba2"]}
                      style={styles.emptyButtonGradient}
                    >
                      <Text style={styles.emptyButtonText}>
                        Start First Chat
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                <FlatList
                  data={history}
                  renderItem={renderChatItem}
                  keyExtractor={(item) => item.id.toString()}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                  refreshing={refreshing}
                  onRefresh={() => fetchHistory(true, true)} // Force refresh on pull
                />
              )}
            </View>

            <View style={styles.footer}>
              <View style={styles.footerIcon}>
                <Ionicons
                  name="shield-checkmark"
                  size={scale(16)}
                  color="#10B981"
                />
              </View>
              <Text style={styles.footerText}>
                All chats are encrypted and secure
              </Text>
            </View>
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Styles remain the same as your previous code...
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.85,
    maxWidth: scale(400),
    minWidth: scale(300),
  },
  sidebarContent: {
    flex: 1,
    backgroundColor: "#F0F4FF",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? verticalScale(50) : verticalScale(30),
    paddingBottom: verticalScale(20),
    paddingHorizontal: SPACING.lg,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: verticalScale(16),
  },
  headerTextContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxxlarge,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.small,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },
  closeButton: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  newChatButton: {
    borderRadius: moderateScale(12),
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.15,
    shadowRadius: scale(8),
    elevation: 6,
  },
  newChatGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(14),
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  newChatText: {
    fontSize: FONT_SIZES.large,
    fontWeight: "700",
    color: "#EC4899",
  },
  listContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  listContent: {
    padding: SPACING.lg,
    gap: verticalScale(8),
    paddingBottom: verticalScale(20),
  },
  skeletonItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: SPACING.md,
    borderRadius: moderateScale(12),
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    minHeight: verticalScale(70),
  },
  skeletonIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: "#E5E7EB",
  },
  skeletonContent: {
    flex: 1,
    marginLeft: SPACING.md,
    gap: SPACING.xs,
  },
  skeletonLine: {
    backgroundColor: "#E5E7EB",
    borderRadius: moderateScale(4),
  },
  skeletonTitle: {
    height: verticalScale(16),
    width: "70%",
  },
  skeletonSubtitle: {
    height: verticalScale(12),
    width: "40%",
  },
  skeletonButton: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    backgroundColor: "#E5E7EB",
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: SPACING.md,
    borderRadius: moderateScale(12),
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.05,
    shadowRadius: scale(4),
    elevation: 2,
    minHeight: verticalScale(70),
  },
  chatItemActive: {
    backgroundColor: "#F5F3FF",
    borderColor: "#7C3AED",
    borderWidth: 2,
  },
  chatItemLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  chatIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: "#F5F3FF",
    justifyContent: "center",
    alignItems: "center",
  },
  chatIconActive: {
    backgroundColor: "#7C3AED",
  },
  chatInfo: {
    flex: 1,
    minWidth: 0,
  },
  chatName: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: SPACING.xs,
  },
  chatNameActive: {
    color: "#5B21B6",
  },
  chatDate: {
    fontSize: FONT_SIZES.tiny,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  deleteButton: {
    padding: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
    paddingVertical: verticalScale(60),
  },
  emptyIcon: {
    width: scale(96),
    height: scale(96),
    borderRadius: scale(48),
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(20),
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.medium,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: FONT_SIZES.medium * 1.4,
    marginBottom: SPACING.xl,
  },
  emptyButton: {
    borderRadius: moderateScale(12),
    overflow: "hidden",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.3,
    shadowRadius: scale(8),
    elevation: 6,
  },
  emptyButtonGradient: {
    paddingVertical: verticalScale(14),
    paddingHorizontal: SPACING.xl,
  },
  emptyButtonText: {
    fontSize: FONT_SIZES.large,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.lg,
    backgroundColor: "#F9FAFB",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: SPACING.sm,
  },
  footerIcon: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: FONT_SIZES.tiny,
    color: "#6B7280",
    fontWeight: "500",
  },
});

export default ChatHistorySidebar;