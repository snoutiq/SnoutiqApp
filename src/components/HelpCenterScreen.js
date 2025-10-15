import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 667) * size;
const moderateScale = (size, factor = 0.3) =>
  size + (scale(size) - size) * factor;

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
    primary: "#667eea",
    secondary: "#764ba2",
    white: "#FFFFFF",
    gray50: "#F9FAFB",
    gray100: "#F3F4F6",
    gray200: "#E5E7EB",
    gray400: "#9CA3AF",
    gray600: "#6B7280",
    gray700: "#374151",
    gray900: "#1F2937",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
    background: "#F0F4FF",
  },
};

const HelpCenter = ({ navigation }) => {
  const handleEmail = () => {
    Linking.openURL(
      "mailto:support@snoutiq.com?subject=Help Center Support&body=Hello, I need help with..."
    );
  };

  const handleWhatsApp = () => {
    Linking.openURL(
      "https://wa.me/918588007466?text=Hello, I need help with my app"
    );
  };

  const handleCall = () => {
    Linking.openURL("tel:+918588007466");
  };

  const FAQ_DATA = [
    {
      id: 1,
      question: "How do I update my profile information?",
      onPress: () => navigation.navigate("Profile"),
    },
    {
      id: 2,
      question: "How can I change my password?",
      onPress: () => navigation.navigate("ChangePassword"),
    },
    {
      id: 3,
      question: "How do I contact support?",
      onPress: () => Linking.openURL("mailto:snoutiqoffice@gmail.com"),
    },
  ];

  const CONTACT_DATA = [
    {
      id: 1,
      icon: "mail-outline",
      title: "Email Support",
      subtitle: "Get help via email",
      detail: "support@snoutiq.com",
      onPress: handleEmail,
      color: DESIGN.COLORS.info,
    },
    {
      id: 2,
      icon: "logo-whatsapp",
      title: "WhatsApp Chat",
      subtitle: "Instant messaging support",
      detail: "+91 85880 07466",
      onPress: handleWhatsApp,
      color: "#25D366",
    },
    {
      id: 3,
      icon: "call-outline",
      title: "Call Support",
      subtitle: "Speak directly with us",
      detail: "+91 85880 07466",
      onPress: handleCall,
      color: DESIGN.COLORS.success,
    },
  ];

  const FAQItem = ({ question, onPress }) => (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.faqQuestion}>{question}</Text>
      <Ionicons
        name="chevron-forward"
        size={DESIGN.TYPOGRAPHY.h3}
        color={DESIGN.COLORS.gray400}
      />
    </TouchableOpacity>
  );

  const ContactItem = ({ icon, title, subtitle, detail, onPress, color }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={DESIGN.TYPOGRAPHY.h3} color={color} />
      </View>
      <View style={styles.contactTextContainer}>
        <Text style={styles.contactTitle}>{title}</Text>
        <Text style={styles.contactSubtitle}>{subtitle}</Text>
        <Text style={styles.contactDetail}>{detail}</Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={DESIGN.TYPOGRAPHY.body}
        color={DESIGN.COLORS.gray400}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[DESIGN.COLORS.primary, DESIGN.COLORS.secondary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-back"
              size={scale(28)}
              color={DESIGN.COLORS.white}
            />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Help Center</Text>
            <Text style={styles.headerSubtitle}>We're here to help</Text>
          </View>
          <View style={styles.headerPlaceholder} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={[DESIGN.COLORS.primary, DESIGN.COLORS.secondary]}
          style={styles.heroSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>How can we help you?</Text>
            <Text style={styles.heroSubtitle}>
              Find answers to common questions or contact our support team
              directly for personalized assistance.
            </Text>
          </View>
          <View style={styles.heroIcon}>
            <Ionicons
              name="help-circle-outline"
              size={DESIGN.SPACING.xxl}
              color={DESIGN.COLORS.white}
            />
          </View>
        </LinearGradient>

        {/* FAQ Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.faqContainer}>
            {FAQ_DATA.map((item) => (
              <FAQItem
                key={item.id}
                question={item.question}
                onPress={item.onPress}
              />
            ))}
          </View>
        </View>

        {/* Contact Support Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Contact Support</Text>
            <Text style={styles.sectionSubtitle}>We're here to help you</Text>
          </View>

          <View style={styles.contactContainer}>
            {CONTACT_DATA.map((item) => (
              <ContactItem
                key={item.id}
                icon={item.icon}
                title={item.title}
                subtitle={item.subtitle}
                detail={item.detail}
                onPress={item.onPress}
                color={item.color}
              />
            ))}
          </View>
        </View>

        {/* Additional Info */}
        <View style={styles.infoSection}>
          <Ionicons
            name="time-outline"
            size={DESIGN.TYPOGRAPHY.h2}
            color={DESIGN.COLORS.gray600}
          />
          <Text style={styles.infoTitle}>Response Time</Text>
          <Text style={styles.infoText}>
            We typically respond within 2-4 hours during business days. For
            urgent matters, please call us directly.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpCenter;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN.COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: DESIGN.VERTICAL_SPACING.xl,
  },
  heroSection: {
    marginHorizontal: DESIGN.SPACING.md,
    marginTop: DESIGN.VERTICAL_SPACING.lg,
    padding: DESIGN.SPACING.lg,
    borderRadius: DESIGN.RADIUS.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: DESIGN.COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  heroContent: {
    flex: 1,
    marginRight: DESIGN.SPACING.md,
  },
  heroIcon: {
    opacity: 0.9,
  },
  heroTitle: {
    fontSize: DESIGN.TYPOGRAPHY.h2,
    fontWeight: "700",
    color: DESIGN.COLORS.white,
    marginBottom: DESIGN.VERTICAL_SPACING.xs,
  },
  heroSubtitle: {
    fontSize: DESIGN.TYPOGRAPHY.bodySmall,
    color: DESIGN.COLORS.white,
    opacity: 0.95,
    lineHeight: DESIGN.VERTICAL_SPACING.md,
  },
  section: {
    marginTop: DESIGN.VERTICAL_SPACING.xl,
    paddingHorizontal: DESIGN.SPACING.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: DESIGN.VERTICAL_SPACING.md,
  },
  sectionTitle: {
    fontSize: DESIGN.TYPOGRAPHY.h3,
    fontWeight: "600",
    color: DESIGN.COLORS.gray900,
  },
  sectionSubtitle: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    color: DESIGN.COLORS.gray600,
    marginTop: DESIGN.VERTICAL_SPACING.xs,
  },
  seeAllText: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    color: DESIGN.COLORS.primary,
    fontWeight: "500",
  },
  faqContainer: {
    backgroundColor: DESIGN.COLORS.white,
    borderRadius: DESIGN.RADIUS.lg,
    overflow: "hidden",
    shadowColor: DESIGN.COLORS.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: DESIGN.COLORS.gray100,
  },
  faqItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: DESIGN.SPACING.md,
    paddingVertical: DESIGN.VERTICAL_SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN.COLORS.gray100,
  },
  faqQuestion: {
    flex: 1,
    fontSize: DESIGN.TYPOGRAPHY.body,
    color: DESIGN.COLORS.gray700,
    fontWeight: "400",
    marginRight: DESIGN.SPACING.sm,
  },
  contactContainer: {
    gap: DESIGN.VERTICAL_SPACING.sm,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DESIGN.COLORS.white,
    padding: DESIGN.SPACING.md,
    borderRadius: DESIGN.RADIUS.lg,
    shadowColor: DESIGN.COLORS.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: DESIGN.COLORS.gray100,
  },
  iconContainer: {
    width: DESIGN.SPACING.xxl,
    height: DESIGN.SPACING.xxl,
    borderRadius: DESIGN.RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: DESIGN.SPACING.md,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactTitle: {
    fontSize: DESIGN.TYPOGRAPHY.body,
    fontWeight: "600",
    color: DESIGN.COLORS.gray900,
    marginBottom: DESIGN.VERTICAL_SPACING.xs,
  },
  contactSubtitle: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    color: DESIGN.COLORS.gray600,
    marginBottom: DESIGN.VERTICAL_SPACING.xs,
  },
  contactDetail: {
    fontSize: DESIGN.TYPOGRAPHY.bodySmall,
    color: DESIGN.COLORS.primary,
    fontWeight: "500",
  },
  infoSection: {
    marginHorizontal: DESIGN.SPACING.md,
    marginTop: DESIGN.VERTICAL_SPACING.xl,
    padding: DESIGN.SPACING.lg,
    backgroundColor: DESIGN.COLORS.white,
    borderRadius: DESIGN.RADIUS.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: DESIGN.COLORS.gray100,
    shadowColor: DESIGN.COLORS.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoTitle: {
    fontSize: DESIGN.TYPOGRAPHY.body,
    fontWeight: "600",
    color: DESIGN.COLORS.gray900,
    marginTop: DESIGN.VERTICAL_SPACING.sm,
    marginBottom: DESIGN.VERTICAL_SPACING.xs,
  },
  infoText: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    color: DESIGN.COLORS.gray600,
    textAlign: "center",
    lineHeight: DESIGN.VERTICAL_SPACING.md,
  },

  header: {
    paddingHorizontal: DESIGN.SPACING.lg,
    paddingTop: DESIGN.SPACING.md,
    paddingBottom: DESIGN.SPACING.xl,
    borderBottomLeftRadius: DESIGN.RADIUS.xl,
    borderBottomRightRadius: DESIGN.RADIUS.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    padding: DESIGN.SPACING.xs,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: DESIGN.TYPOGRAPHY.h1,
    fontWeight: "700",
    color: DESIGN.COLORS.white,
    marginBottom: DESIGN.SPACING.xs / 2,
  },
  headerSubtitle: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "500",
  },
  headerPlaceholder: {
    width: scale(28),
  },
});
