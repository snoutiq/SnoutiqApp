import { Ionicons } from "@expo/vector-icons";
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
import { moderateScale, verticalScale, scale } from "react-native-size-matters";
import { AuthContext } from "../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

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

  const { user, updateChatRoomToken } = useContext(AuthContext);
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fetch chat history
  const fetchHistory = async (isRefresh = false) => {
    if (!user) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const token = await AsyncStorage.getItem("token");

      const response = await axios.get(
        `https://snoutiq.com/backend/api/chat/listRooms?user_id=${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const sorted = response.data.rooms.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setHistory(sorted);
    } catch (error) {
      Alert.alert("Error", "Failed to load chat history");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Start new chat
  const handleNewChat = async () => {
    if (!user) return;

    try {
      const token = await AsyncStorage.getItem("token");
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
          timestamp: Date.now()
        });
      }, 350);

      await fetchHistory();
    } catch (error) {
      Alert.alert("Error", "Failed to start new chat");
    }
  };

  // Delete chat
  const handleDeleteChat = async (chatId, chatRoomToken) => {
    Alert.alert("Delete Chat", "Are you sure you want to delete this chat?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeletingId(chatId);
          try {
            const token = await AsyncStorage.getItem("token");
            await axios.delete(
              `https://snoutiq.com/backend/api/chat-rooms/${chatRoomToken}?user_id=${user.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Remove from state
            setHistory((prev) => prev.filter((c) => c.id !== chatId));

            // If deleted chat is current, create new one
            if (chatRoomToken === currentChatRoomToken) {
              await handleNewChat();
            }
          } catch (error) {
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
    
    // Use setTimeout to ensure navigation happens after modal closes
    setTimeout(() => {
      navigation.navigate("Chat", { 
        chat_room_token: chatRoomToken,
        loadHistory: true, 
        isNewChat: false,
        timestamp: Date.now() // Force update
      });
    }, 350); // Increased delay slightly
  };

  // Format date
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) {
      // Today - show time
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diff === 1) {
      return "Yesterday";
    } else if (diff < 7) {
      return `${diff} days ago`;
    } else {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
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

  // Render chat item
  const renderChatItem = ({ item }) => {
    const isActive = item.chat_room_token === currentChatRoomToken;
    const isDeleting = deletingId === item.id;

    // Get the last message preview if available
    const lastMessage = item.last_message || item.name || "New Chat";
    const displayName = item.name && !item.name.startsWith("New chat -")
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent={false} 
    >
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        {/* Sidebar Panel */}
        <Animated.View
          style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}
        >
          <BlurView intensity={100} tint="light" style={styles.sidebarContent}>
            {/* Header */}
            <LinearGradient
              colors={["#7C3AED", "#EC4899"]}
              style={styles.header}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.headerTop}>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.headerTitle}>Chat History</Text>
                  <Text style={styles.headerSubtitle}>
                    {history.length} conversation
                    {history.length !== 1 ? "s" : ""}
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

              {/* New Chat Button */}
              <TouchableOpacity
                style={styles.newChatButton}
                onPress={handleNewChat}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#FFFFFF", "#F3F4F6"]}
                  style={styles.newChatGradient}
                >
                  <Ionicons name="add-circle" size={scale(20)} color="#EC4899" />
                  <Text style={styles.newChatText}>Start New Chat</Text>
                  <Ionicons name="arrow-forward" size={scale(16)} color="#EC4899" />
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>

            {/* Chat List */}
            <View style={styles.listContainer}>
              {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#7C3AED" />
                  <Text style={styles.loadingText}>Loading history...</Text>
                </View>
              ) : history.length === 0 ? (
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
                      colors={["#7C3AED", "#EC4899"]}
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
                  onRefresh={() => fetchHistory(true)}
                />
              )}
            </View>

            {/* Footer Info */}
            <View style={styles.footer}>
              <View style={styles.footerIcon}>
                <Ionicons name="shield-checkmark" size={scale(16)} color="#10B981" />
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
    backgroundColor: "#FFFFFF",
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
    minWidth: 0, // Important for text truncation
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: verticalScale(60),
  },
  loadingText: {
    marginTop: SPACING.lg,
    fontSize: FONT_SIZES.medium,
    color: "#6B7280",
    fontWeight: "500",
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