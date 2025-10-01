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
import { moderateScale, verticalScale } from "react-native-size-matters";
import { AuthContext } from "../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

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
      console.error("Failed to fetch history:", error);
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
    console.log("Created new chat room:", chat_room_token);

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
    console.error("Failed to create new chat:", error);
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
//   const handleSelectChat = (chatRoomToken) => {
//     if (updateChatRoomToken) {
//       updateChatRoomToken(chatRoomToken);
//     }

//     handleClose();
    
//     // Navigate with the selected chat token - this will trigger message loading
//     navigation.navigate("Chat", { 
//       chat_room_token: chatRoomToken,
//       loadHistory: true // Flag to load chat history
//     });
//   };
// ChatHistorySidebar में handleSelectChat function update करें
const handleSelectChat = (chatRoomToken) => {
  console.log("=== SELECTING CHAT ===");
  console.log("Selected chat room token:", chatRoomToken);
  console.log("Current chat room token:", currentChatRoomToken);
  
  if (updateChatRoomToken) {
    updateChatRoomToken(chatRoomToken);
  }

  handleClose();
  
  // Use setTimeout to ensure navigation happens after modal closes
  setTimeout(() => {
    console.log("Navigating to Chat screen with token:", chatRoomToken);
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
              size={18}
              color={isActive ? "#FFFFFF" : "#3B82F6"}
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
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
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
              colors={["#4F46E5", "#7C3AED"]}
              style={styles.header}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.headerTop}>
                <View>
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
                  <Ionicons name="close" size={24} color="#FFFFFF" />
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
                  <Ionicons name="add-circle" size={20} color="#4F46E5" />
                  <Text style={styles.newChatText}>Start New Chat</Text>
                  <Ionicons name="arrow-forward" size={16} color="#4F46E5" />
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>

            {/* Chat List */}
            <View style={styles.listContainer}>
              {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4F46E5" />
                  <Text style={styles.loadingText}>Loading history...</Text>
                </View>
              ) : history.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIcon}>
                    <Ionicons
                      name="chatbubbles-outline"
                      size={48}
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
                      colors={["#4F46E5", "#7C3AED"]}
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
                <Ionicons name="shield-checkmark" size={16} color="#10B981" />
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
    maxWidth: moderateScale(400),
  },
  sidebarContent: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? verticalScale(50) : verticalScale(20),
    paddingBottom: verticalScale(20),
    paddingHorizontal: moderateScale(20),
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: verticalScale(16),
  },
  headerTitle: {
    fontSize: moderateScale(24),
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: verticalScale(4),
  },
  headerSubtitle: {
    fontSize: moderateScale(13),
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  closeButton: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  newChatButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  newChatGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(14),
    paddingHorizontal: moderateScale(20),
    gap: moderateScale(8),
  },
  newChatText: {
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: "#4F46E5",
  },
  listContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  listContent: {
    padding: moderateScale(16),
    gap: verticalScale(8),
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: moderateScale(14),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chatItemActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#3B82F6",
    borderWidth: 2,
  },
  chatItemLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(12),
  },
  chatIcon: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  chatIconActive: {
    backgroundColor: "#3B82F6",
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: verticalScale(2),
  },
  chatNameActive: {
    color: "#1E40AF",
  },
  chatDate: {
    fontSize: moderateScale(11),
    color: "#9CA3AF",
    fontWeight: "500",
  },
  deleteButton: {
    padding: moderateScale(8),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: verticalScale(60),
  },
  loadingText: {
    marginTop: verticalScale(16),
    fontSize: moderateScale(14),
    color: "#6B7280",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: moderateScale(40),
    paddingVertical: verticalScale(60),
  },
  emptyIcon: {
    width: moderateScale(96),
    height: moderateScale(96),
    borderRadius: moderateScale(48),
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(20),
  },
  emptyTitle: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: verticalScale(8),
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: moderateScale(14),
    color: "#6B7280",
    textAlign: "center",
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(24),
  },
  emptyButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  emptyButtonGradient: {
    paddingVertical: verticalScale(14),
    paddingHorizontal: moderateScale(32),
  },
  emptyButtonText: {
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: "#FFFFFF",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: moderateScale(16),
    backgroundColor: "#F9FAFB",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: moderateScale(8),
  },
  footerIcon: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: moderateScale(12),
    color: "#6B7280",
    fontWeight: "500",
  },
});

export default ChatHistorySidebar;