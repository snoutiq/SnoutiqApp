import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";
import ProfileCompletionModalAuto from "../utils/ProfileCompletionModalAuto";

const { width, height } = Dimensions.get("window");

// Responsive scaling functions
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 667) * size;
const moderateScale = (size, factor = 0.3) => size + (scale(size) - size) * factor;

// Design System
const DESIGN = {
  TYPOGRAPHY: {
    h1: moderateScale(24),
    h2: moderateScale(20),
    h3: moderateScale(18),
    body: moderateScale(15),
    bodySmall: moderateScale(14),
    caption: moderateScale(13),
    tiny: moderateScale(11),
  },
  SPACING: {
    xs: scale(8),
    sm: scale(12),
    md: scale(16),
    lg: scale(20),
    xl: scale(24),
    xxl: scale(32),
  },
  VERTICAL_SPACING: {
    xs: verticalScale(8),
    sm: verticalScale(12),
    md: verticalScale(16),
    lg: verticalScale(20),
    xl: verticalScale(24),
  },
  RADIUS: {
    sm: moderateScale(8),
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
    gray400: '#9CA3AF',
    gray600: '#6B7280',
    gray700: '#374151',
    gray900: '#1F2937',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    background: '#F0F4FF',
    diwali: {
      orange: '#FF6B35',
      gold: '#FFD700',
      deepOrange: '#FF4500',
      purple: '#8B008B',
      yellow: '#FFA500',
    },
  },
};

// Diwali Carousel Component
const DiwaliCarousel = memo(() => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const { user } = useContext(AuthContext);

  const carouselItems = [
    {
      id: 1,
      title: "🪔 Happy Diwali! 🪔",
      subtitle: "May your pets bring endless joy",
      description: "Celebrate with your furry friends",
      gradient: ['rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.2)'],
      emoji: "🎆",
      img: require("../assets/diwali_slide1.png")
    },
    {
      id: 2,
      title: "✨ Festival of Lights ✨",
      subtitle: "Caring for your furry family",
      description: "Special care during celebrations",
      gradient: ['rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.2)'],
      emoji: "🪔",
      img: require("../assets/diwali_slide2.png")
    },
    {
      id: 3,
      title: "🎇 Celebrate Safely 🎇",
      subtitle: "Keep your pets calm & happy",
      description: "Expert tips for pet safety",
      gradient: ['rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.2)'],
      emoji: "🎊",
      img: require("../assets/diwali_slide3.png")
    },
  ];

  useEffect(() => {
    const sparkle = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    sparkle.start();

    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    glow.start();

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % carouselItems.length;
        scrollViewRef.current?.scrollTo({
          x: next * width,
          animated: true,
        });
        return next;
      });
    }, 4000);

    return () => {
      clearInterval(interval);
      sparkle.stop();
      glow.stop();
    };
  }, []);

  const sparkleOpacity = sparkleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  return (
    <View style={styles.carouselContainer}>
      {/* Header Overlay */}
      <View style={styles.headerOverlay}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.appLogo} numberOfLines={1}>
              SnoutIQ
            </Text>
            <Text style={styles.welcomeSubtext} numberOfLines={1}>
              {user?.name?.split(" ")[0] || "Pet Parent"}!
            </Text>
          </View>
          <TouchableOpacity
            style={styles.userAvatar}
            activeOpacity={0.8}
          >
            <Text style={styles.userAvatarText}>
              {user?.name ? user.name.substring(0, 2).toUpperCase() : "SP"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / width
          );
          setCurrentIndex(index);
        }}
      >
        {carouselItems.map((item, index) => (
          <View key={item.id} style={styles.carouselItem}>
            {/* Image Background */}
            <Image
              source={item.img}
              style={styles.carouselImage}
              resizeMode="cover"
            />

            {/* Content Overlay */}
            <LinearGradient
              colors={item.gradient}
              style={styles.carouselOverlay}
            >
              <View style={styles.carouselContent}>
                <Text style={styles.carouselEmoji}>{item.emoji}</Text>
                <Text style={styles.carouselTitle}>{item.title}</Text>
                <Text style={styles.carouselSubtitle}>{item.subtitle}</Text>
                <Text style={styles.carouselDescription}>{item.description}</Text>

              </View>

              {/* Decorative Elements */}
              <Animated.View
                style={[
                  styles.sparkle,
                  styles.sparkle1,
                  { opacity: sparkleOpacity },
                ]}
              />
              <Animated.View
                style={[
                  styles.sparkle,
                  styles.sparkle2,
                  { opacity: sparkleOpacity },
                ]}
              />
            </LinearGradient>
          </View>
        ))}
      </ScrollView>

      {/* Pagination dots */}
      <View style={styles.paginationContainer}>
        {carouselItems.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              currentIndex === index && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
});

// TrustBadge Component
const TrustBadge = memo(() => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(1000),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.trustBadgeContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.trustBadge}
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <LinearGradient
          colors={["#F8FAFC", "#FFFFFF"]}
          style={styles.trustBadgeGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.trustBadgeContent}>
            <View style={styles.trustIconsRow}>
              <View style={styles.trustIcon}>
                <Ionicons name="shield-checkmark" size={scale(16)} color={DESIGN.COLORS.success} />
              </View>
              <View style={styles.trustIcon}>
                <Ionicons name="heart" size={scale(16)} color="#EC4899" />
              </View>
              <View style={styles.trustIcon}>
                <Ionicons name="star" size={scale(16)} color={DESIGN.COLORS.warning} />
              </View>
            </View>

            <Text style={styles.trustTitle}>Trusted by Pet Parents</Text>

            <View style={styles.trustStats}>
              <View style={styles.trustStatItem}>
                <Text style={styles.trustStatNumber}>100+</Text>
                <Text style={styles.trustStatLabel}>Happy Pets</Text>
              </View>

              <View style={styles.trustStatDivider} />

              <View style={styles.trustStatItem}>
                <Text style={styles.trustStatNumber}>50+</Text>
                <Text style={styles.trustStatLabel}>Expert Vets</Text>
              </View>

              <View style={styles.trustStatDivider} />

              <View style={styles.trustStatItem}>
                <Text style={styles.trustStatNumber}>24/7</Text>
                <Text style={styles.trustStatLabel}>Support</Text>
              </View>
            </View>

            <View style={styles.trustFooter}>
              <Ionicons name="ribbon" size={scale(12)} color={DESIGN.COLORS.gray600} />
              <Text style={styles.trustFooterText}>
                Join 100+ trusted pet parents community
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.floatingElement1} />
        <View style={styles.floatingElement2} />
        <View style={styles.floatingElement3} />
      </TouchableOpacity>
    </Animated.View>
  );
});

// HomeScreen Component
export default function HomeScreen({ navigation }) {
  const { token, user, updateUser } = useContext(AuthContext);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPetModal, setShowPetModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      setData(Date.now());
    } catch (error) {
      console.error("Error refreshing HomePage:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  useEffect(() => {
    if (!user) return;

    const hasPetData = !!(
      user.pet_name?.trim() &&
      user.pet_gender?.trim() &&
      user.breed?.trim() &&
      user.pet_age
    );

    if (!hasPetData && user.profileCompleted) {
      updateUser((prev) =>
        prev.profileCompleted ? { ...prev, profileCompleted: false } : prev
      );
    }

    if (!hasPetData && !user.profileCompleted) {
      setShowPetModal(true);
    } else {
      setShowPetModal(false);
    }
  }, [user]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "" || isLoading) return;

    const messageToSend = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    try {
      const newChatRoomToken = `chat_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;

      navigation.navigate("Chat", {
        initialMessage: messageToSend,
        isNewChat: true,
        chat_room_token: newChatRoomToken,
        loadHistory: false,
        timestamp: Date.now(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {showPetModal && (
        <ProfileCompletionModalAuto
          visible={showPetModal}
          onComplete={() => setShowPetModal(false)}
          updateUser={updateUser}
          token={token}
          user={user}
        />
      )}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchData}
            colors={[DESIGN.COLORS.primary]}
            tintColor={DESIGN.COLORS.primary}
          />
        }
      >
        {/* Diwali Carousel */}
        <DiwaliCarousel />

        {/* AI Chat Section */}
        <View style={styles.chatSection}>
          <View style={styles.aiSearchSection}>
            <View style={styles.searchInputWrapper}>
              <TextInput
                style={styles.aiInput}
                placeholder="Describe your pet's symptoms..."
                placeholderTextColor={DESIGN.COLORS.gray400}
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
                  colors={[DESIGN.COLORS.primary, DESIGN.COLORS.secondary]}
                  style={styles.sendBtnGradient}
                >
                  <Ionicons
                    name={isLoading ? "hourglass-outline" : "arrow-forward"}
                    size={scale(20)}
                    color={DESIGN.COLORS.white}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <Text style={styles.aiHelperText}>
              AI will analyze and suggest next steps
            </Text>
          </View>
        </View>

        {/* Services Section */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Quick Services</Text>
          <View style={styles.servicesGrid}>
            <TouchableOpacity
              style={styles.serviceItem}
              onPress={() => navigation.navigate("AppointmentScreen")}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["#E8F4FF", "#F0F8FF"]}
                style={styles.serviceIcon}
              >
                <Ionicons
                  name="document-text"
                  size={scale(28)}
                  color={DESIGN.COLORS.info}
                />
              </LinearGradient>
              <Text style={styles.serviceTitle} numberOfLines={2}>
                Health Records
              </Text>
              <Text style={styles.serviceSubtitle} numberOfLines={1}>
                View pet history
              </Text>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: DESIGN.COLORS.info }]}
                onPress={() => navigation.navigate("AppointmentScreen")}
                activeOpacity={0.8}
              >
                <Text style={styles.actionButtonText}>View Records</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity style={styles.serviceItem} activeOpacity={0.7}>
              <LinearGradient
                colors={["#E8F4FF", "#F0F8FF"]}
                style={styles.serviceIcon}
              >
                <Ionicons name="medkit" size={scale(28)} color={DESIGN.COLORS.error} />
              </LinearGradient>
              <Text style={styles.serviceTitle} numberOfLines={2}>
                Medicines
              </Text>
              <Text style={styles.serviceSubtitle} numberOfLines={1}>
                Order & refills
              </Text>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: DESIGN.COLORS.error }]}
                onPress={() => Alert.alert("Coming Soon..")}
                activeOpacity={0.8}
              >
                <Text style={styles.actionButtonText}>Coming Soon</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </View>

        <TrustBadge />

        <View style={{ height: DESIGN.SPACING.xxl * 2 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN.COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: DESIGN.SPACING.xxl,
  },
  // Carousel Styles
  carouselContainer: {
    marginBottom: DESIGN.SPACING.lg,
    position: 'relative',
  },
  headerOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? DESIGN.SPACING.xl : DESIGN.SPACING.lg,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: DESIGN.SPACING.lg,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
  },
  appLogo: {
    fontSize: DESIGN.TYPOGRAPHY.h1,
    fontWeight: "700",
    color: DESIGN.COLORS.white,
    marginBottom: DESIGN.SPACING.xs / 2,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  welcomeSubtext: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  userAvatar: {
    width: scale(48),
    height: scale(48),
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: scale(24),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  userAvatarText: {
    fontSize: DESIGN.TYPOGRAPHY.h3,
    fontWeight: "700",
    color: DESIGN.COLORS.white,
  },
  carouselItem: {
    width: width,
    height: verticalScale(280),
    position: 'relative',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  carouselOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    padding: DESIGN.SPACING.xl,
  },
  carouselContent: {
    alignItems: 'flex-start',
  },
  carouselEmoji: {
    fontSize: scale(32),
    marginBottom: DESIGN.SPACING.sm,
  },
  carouselTitle: {
    fontSize: DESIGN.TYPOGRAPHY.h1,
    fontWeight: "800",
    color: DESIGN.COLORS.white,
    marginBottom: DESIGN.SPACING.xs,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  carouselSubtitle: {
    fontSize: DESIGN.TYPOGRAPHY.h3,
    color: DESIGN.COLORS.white,
    fontWeight: "600",
    marginBottom: DESIGN.SPACING.xs,
    textShadowColor: "rgba(0, 0, 0, 0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  carouselDescription: {
    fontSize: DESIGN.TYPOGRAPHY.body,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: DESIGN.SPACING.lg,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  ctaButton: {
    backgroundColor: DESIGN.COLORS.white,
    paddingHorizontal: DESIGN.SPACING.lg,
    paddingVertical: DESIGN.SPACING.sm,
    borderRadius: DESIGN.RADIUS.full,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaButtonText: {
    fontSize: DESIGN.TYPOGRAPHY.bodySmall,
    fontWeight: "700",
    color: DESIGN.COLORS.primary,
  },
  sparkle: {
    position: "absolute",
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: DESIGN.COLORS.white,
  },
  sparkle1: {
    top: "30%",
    left: "20%",
  },
  sparkle2: {
    bottom: "40%",
    right: "25%",
  },
  paginationContainer: {
    position: 'absolute',
    bottom: DESIGN.SPACING.lg,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: DESIGN.SPACING.xs,
  },
  paginationDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(6),
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    backgroundColor: DESIGN.COLORS.white,
    width: scale(24),
  },
  // Rest of the styles remain the same...
  chatSection: {
    paddingHorizontal: DESIGN.SPACING.lg,
    marginBottom: DESIGN.SPACING.lg,
  },
  aiSearchSection: {
    backgroundColor: DESIGN.COLORS.white,
    borderWidth: 2,
    borderColor: DESIGN.COLORS.secondary,
    borderRadius: DESIGN.RADIUS.lg,
    padding: DESIGN.SPACING.lg,
    shadowColor: DESIGN.COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  searchInputWrapper: {
    position: "relative",
    marginBottom: DESIGN.SPACING.md,
  },
  aiInput: {
    width: "100%",
    minHeight: verticalScale(60),
    maxHeight: verticalScale(120),
    paddingHorizontal: DESIGN.SPACING.lg,
    paddingTop: DESIGN.SPACING.md,
    paddingBottom: DESIGN.SPACING.md,
    paddingRight: scale(60),
    backgroundColor: DESIGN.COLORS.gray50,
    borderWidth: 1,
    borderColor: DESIGN.COLORS.gray200,
    borderRadius: DESIGN.RADIUS.md,
    color: DESIGN.COLORS.gray900,
    fontSize: DESIGN.TYPOGRAPHY.body,
    textAlignVertical: "top",
  },
  sendBtn: {
    position: "absolute",
    right: DESIGN.SPACING.sm,
    top: DESIGN.SPACING.md,
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    overflow: "hidden",
    shadowColor: DESIGN.COLORS.secondary,
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
    fontSize: DESIGN.TYPOGRAPHY.tiny,
    color: DESIGN.COLORS.gray600,
  },
  servicesSection: {
    paddingHorizontal: DESIGN.SPACING.lg,
  },
  sectionTitle: {
    fontSize: DESIGN.TYPOGRAPHY.h3,
    fontWeight: "700",
    color: DESIGN.COLORS.gray900,
    marginBottom: DESIGN.SPACING.md,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: DESIGN.SPACING.md,
  },
  serviceItem: {
    width: (width - scale(62)) / 2,
    backgroundColor: DESIGN.COLORS.white,
    borderWidth: 2,
    borderColor: "#E8F4FF",
    borderRadius: DESIGN.RADIUS.lg,
    padding: DESIGN.SPACING.lg,
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
    borderRadius: DESIGN.RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: DESIGN.VERTICAL_SPACING.md,
  },
  serviceTitle: {
    fontSize: DESIGN.TYPOGRAPHY.bodySmall,
    fontWeight: "600",
    marginBottom: DESIGN.VERTICAL_SPACING.xs / 2,
    color: DESIGN.COLORS.gray900,
    textAlign: "center",
  },
  serviceSubtitle: {
    fontSize: DESIGN.TYPOGRAPHY.tiny,
    color: DESIGN.COLORS.gray600,
    textAlign: "center",
    marginBottom: DESIGN.VERTICAL_SPACING.sm,
  },
  actionButton: {
    paddingVertical: DESIGN.SPACING.sm,
    paddingHorizontal: DESIGN.SPACING.lg,
    borderRadius: DESIGN.RADIUS.md,
    width: "100%",
    alignItems: "center",
    marginTop: DESIGN.VERTICAL_SPACING.xs,
  },
  actionButtonText: {
    color: DESIGN.COLORS.white,
    fontSize: DESIGN.TYPOGRAPHY.bodySmall,
    fontWeight: "600",
  },
  trustBadgeContainer: {
    marginHorizontal: DESIGN.SPACING.lg,
    marginTop: DESIGN.SPACING.xl,
    marginBottom: DESIGN.SPACING.md,
  },
  trustBadge: {
    borderRadius: DESIGN.RADIUS.xl,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  trustBadgeGradient: {
    padding: DESIGN.SPACING.lg,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  trustBadgeContent: {
    alignItems: "center",
  },
  trustIconsRow: {
    flexDirection: "row",
    gap: DESIGN.SPACING.sm,
    marginBottom: DESIGN.SPACING.md,
  },
  trustIcon: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  trustTitle: {
    fontSize: DESIGN.TYPOGRAPHY.h3,
    fontWeight: "700",
    color: DESIGN.COLORS.gray900,
    marginBottom: DESIGN.SPACING.lg,
    textAlign: "center",
  },
  trustStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    marginBottom: DESIGN.SPACING.lg,
  },
  trustStatItem: {
    alignItems: "center",
    flex: 1,
  },
  trustStatNumber: {
    fontSize: DESIGN.TYPOGRAPHY.h3,
    fontWeight: "800",
    color: "#7C3AED",
    marginBottom: DESIGN.SPACING.xs / 2,
  },
  trustStatLabel: {
    fontSize: DESIGN.TYPOGRAPHY.tiny,
    color: DESIGN.COLORS.gray600,
    fontWeight: "600",
    textAlign: "center",
  },
  trustStatDivider: {
    width: 1,
    height: scale(30),
    backgroundColor: DESIGN.COLORS.gray200,
  },
  trustFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: DESIGN.SPACING.xs,
    paddingHorizontal: DESIGN.SPACING.md,
    paddingVertical: DESIGN.SPACING.sm,
    backgroundColor: "rgba(124, 58, 237, 0.05)",
    borderRadius: DESIGN.RADIUS.md,
  },
  trustFooterText: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    color: DESIGN.COLORS.gray600,
    fontWeight: "500",
  },
  floatingElement1: {
    position: "absolute",
    top: -10,
    right: 20,
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    backgroundColor: "rgba(236, 72, 153, 0.1)",
  },
  floatingElement2: {
    position: "absolute",
    bottom: 15,
    left: 15,
    width: scale(15),
    height: scale(15),
    borderRadius: scale(7.5),
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  floatingElement3: {
    position: "absolute",
    top: 30,
    left: -5,
    width: scale(12),
    height: scale(12),
    borderRadius: scale(6),
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
});