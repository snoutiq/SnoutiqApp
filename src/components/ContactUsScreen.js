import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  Dimensions,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

const ContactUsScreen = ({ navigation }) => {
  const contactMethods = [
    {
      icon: "call",
      title: "Call Us",
      subtitle: "Mon-Fri, 9AM-6PM",
      value: "+91 85880 07466",
      action: () => Linking.openURL("tel:+918588007466"),
      gradient: ["rgba(16, 185, 129, 0.1)", "rgba(16, 185, 129, 0.05)"],
      iconColor: DESIGN.COLORS.success,
    },
    {
      icon: "mail",
      title: "Email Us",
      subtitle: "Get response within 24hrs",
      value: "support@snoutiq.com",
      action: () => Linking.openURL("mailto:support@snoutiq.com"),
      gradient: ["rgba(59, 130, 246, 0.1)", "rgba(59, 130, 246, 0.05)"],
      iconColor: DESIGN.COLORS.info,
    },
    {
      icon: "logo-whatsapp",
      title: "WhatsApp",
      subtitle: "Chat with us instantly",
      value: "+91 85880 07466",
      action: () => Linking.openURL("https://wa.me/918588007466"),
      gradient: ["rgba(34, 197, 94, 0.1)", "rgba(34, 197, 94, 0.05)"],
      iconColor: "#25D366",
    },
    {
      icon: "location",
      title: "Visit Us",
      subtitle: "Our office location",
      value: "Block: H, Plot no 20, 1/A,  \nSector 63, Noida, Uttar Pradesh 201301",
      action: () =>
        Linking.openURL(
          "https://www.google.com/maps/place/Snoutiq+by+Thinktail+Global+Pvt+Ltd/@28.629889,77.37568,17z/data=!3m1!4b1!4m6!3m5!1s0x390ce5a35d4e5855:0x3bcbfe9ad288dbf1!8m2!3d28.629889!4d77.37568!16s%2Fg%2F11y12mn4sm?entry=ttu&g_ep=EgoyMDI1MTAxMi4wIKXMDSoASAFQAw%3D%3D"
        ),
      gradient: ["rgba(239, 68, 68, 0.1)", "rgba(239, 68, 68, 0.05)"],
      iconColor: DESIGN.COLORS.error,
    },
  ];

  const socialMedia = [
    {
      icon: "logo-linkedin",
      name: "LinkedIn",
      color: "#0077B5",
      action: () => Linking.openURL("https://www.linkedin.com/company/snoutiq"),
    },
    {
      icon: "logo-twitter", // Ionicons icon name
      name: "X (Twitter)",
      color: "#1DA1F2",
      action: () => Linking.openURL("https://x.com/snoutiq"),
    },

    {
      icon: "logo-facebook",
      name: "Facebook",
      color: "#4267B2",
      action: () =>
        Linking.openURL(
          "https://www.facebook.com/people/Snoutiq/61578226867078/"
        ),
    },
    {
      icon: "logo-instagram",
      name: "Instagram",
      color: "#E1306C",
      action: () =>
        Linking.openURL("https://www.instagram.com/snoutiq_marketplace/#"),
    },
  ];

  const ContactCard = ({
    icon,
    title,
    subtitle,
    value,
    action,
    gradient,
    iconColor,
  }) => (
    <TouchableOpacity
      style={styles.contactCard}
      onPress={action}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={gradient}
        style={styles.contactCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View
          style={[
            styles.contactIconContainer,
            { backgroundColor: iconColor + "20" },
          ]}
        >
          <Ionicons name={icon} size={scale(24)} color={iconColor} />
        </View>
        <View style={styles.contactContent}>
          <Text style={styles.contactTitle}>{title}</Text>
          <Text style={styles.contactSubtitle}>{subtitle}</Text>
          <Text style={styles.contactValue} numberOfLines={2}>
            {value}
          </Text>
        </View>
        <View style={styles.contactArrow}>
          <Ionicons
            name="chevron-forward"
            size={scale(20)}
            color={DESIGN.COLORS.gray400}
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const SocialButton = ({ icon, name, color, action }) => (
    <TouchableOpacity
      style={styles.socialButton}
      onPress={action}
      activeOpacity={0.7}
    >
      <View
        style={[styles.socialIconContainer, { backgroundColor: color + "15" }]}
      >
        <Ionicons name={icon} size={scale(26)} color={color} />
      </View>
      <Text style={styles.socialName}>{name}</Text>
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
            <Text style={styles.headerTitle}>Contact Us</Text>
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
        <View style={styles.content}>
          {/* Company Info Card */}
          <View style={styles.companyCard}>
            <LinearGradient
              colors={["rgba(102, 126, 234, 0.1)", "rgba(118, 75, 162, 0.1)"]}
              style={styles.companyGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.companyLogoContainer}>
                <Text style={styles.companyLogo}>🐾</Text>
              </View>
              <Text style={styles.companyName}>SnoutIQ</Text>
              <Text style={styles.companyTagline}>
                Your Pet's Health Partner
              </Text>
              <View style={styles.companyDivider} />
              <Text style={styles.companyDescription}>
                Powered by NaukrionXpert Private Limited
              </Text>
            </LinearGradient>
          </View>

          {/* Contact Methods Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="chatbubbles"
                size={scale(20)}
                color={DESIGN.COLORS.primary}
              />
              <Text style={styles.sectionTitle}>Get In Touch</Text>
            </View>
            <View style={styles.contactList}>
              {contactMethods.map((method, index) => (
                <ContactCard key={index} {...method} />
              ))}
            </View>
          </View>

          {/* Social Media Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="share-social"
                size={scale(20)}
                color={DESIGN.COLORS.primary}
              />
              <Text style={styles.sectionTitle}>Connect With Us</Text>
            </View>
            <View style={styles.socialGrid}>
              {socialMedia.map((social, index) => (
                <SocialButton key={index} {...social} />
              ))}
            </View>
          </View>

          {/* Business Hours */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="time"
                size={scale(20)}
                color={DESIGN.COLORS.primary}
              />
              <Text style={styles.sectionTitle}>Business Hours</Text>
            </View>
            <View style={styles.hoursCard}>
              <View style={styles.hourRow}>
                <View style={styles.hourLeft}>
                  <Ionicons
                    name="calendar-outline"
                    size={scale(18)}
                    color={DESIGN.COLORS.gray600}
                  />
                  <Text style={styles.hourDay}>Monday - Friday</Text>
                </View>
                <View style={styles.hourBadge}>
                  <Text style={styles.hourTime}>9:00 AM - 6:00 PM</Text>
                </View>
              </View>
              <View style={styles.hourDivider} />
              <View style={styles.hourRow}>
                <View style={styles.hourLeft}>
                  <Ionicons
                    name="calendar-outline"
                    size={scale(18)}
                    color={DESIGN.COLORS.gray600}
                  />
                  <Text style={styles.hourDay}>Saturday - Sunday</Text>
                </View>
                <View style={[styles.hourBadge, styles.hourBadgeClosed]}>
                  <Text style={styles.hourTimeClosed}>Closed</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Quick Info */}
          <View style={styles.infoCard}>
            <Ionicons
              name="information-circle"
              size={scale(24)}
              color={DESIGN.COLORS.info}
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Response Time</Text>
              <Text style={styles.infoText}>
                We typically respond to inquiries within 24 hours during
                business days.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ContactUsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN.COLORS.background,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: DESIGN.SPACING.xxl * 2,
  },
  content: {
    paddingHorizontal: DESIGN.SPACING.lg,
    paddingTop: DESIGN.SPACING.xl,
  },
  companyCard: {
    marginBottom: DESIGN.SPACING.xl,
    borderRadius: DESIGN.RADIUS.lg,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  companyGradient: {
    padding: DESIGN.SPACING.xl,
    alignItems: "center",
    backgroundColor: DESIGN.COLORS.white,
  },
  companyLogoContainer: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: DESIGN.COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: DESIGN.SPACING.md,
    shadowColor: DESIGN.COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  companyLogo: {
    fontSize: scale(40),
  },
  companyName: {
    fontSize: DESIGN.TYPOGRAPHY.h2,
    fontWeight: "800",
    color: DESIGN.COLORS.gray900,
    marginBottom: DESIGN.SPACING.xs,
  },
  companyTagline: {
    fontSize: DESIGN.TYPOGRAPHY.body,
    color: DESIGN.COLORS.gray600,
    fontWeight: "500",
    marginBottom: DESIGN.SPACING.md,
  },
  companyDivider: {
    width: scale(60),
    height: 2,
    backgroundColor: DESIGN.COLORS.primary,
    borderRadius: 1,
    marginBottom: DESIGN.SPACING.md,
  },
  companyDescription: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    color: DESIGN.COLORS.gray600,
    textAlign: "center",
  },
  section: {
    marginBottom: DESIGN.SPACING.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: DESIGN.SPACING.sm,
    marginBottom: DESIGN.SPACING.md,
  },
  sectionTitle: {
    fontSize: DESIGN.TYPOGRAPHY.h3,
    fontWeight: "700",
    color: DESIGN.COLORS.gray900,
  },
  contactList: {
    gap: DESIGN.SPACING.md,
  },
  contactCard: {
    borderRadius: DESIGN.RADIUS.lg,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contactCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: DESIGN.SPACING.lg,
    backgroundColor: DESIGN.COLORS.white,
    gap: DESIGN.SPACING.md,
  },
  contactIconContainer: {
    width: scale(50),
    height: scale(50),
    borderRadius: DESIGN.RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: DESIGN.TYPOGRAPHY.body,
    fontWeight: "700",
    color: DESIGN.COLORS.gray900,
    marginBottom: DESIGN.SPACING.xs / 2,
  },
  contactSubtitle: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    color: DESIGN.COLORS.gray600,
    marginBottom: DESIGN.SPACING.xs,
  },
  contactValue: {
    fontSize: DESIGN.TYPOGRAPHY.bodySmall,
    color: DESIGN.COLORS.gray700,
    fontWeight: "500",
  },
  contactArrow: {
    padding: DESIGN.SPACING.xs,
  },
  socialGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: DESIGN.SPACING.md,
  },
  socialButton: {
    width: (width - DESIGN.SPACING.lg * 2 - DESIGN.SPACING.xl) / 2,
    alignItems: "center",
    backgroundColor: DESIGN.COLORS.white,
    borderRadius: DESIGN.RADIUS.lg,
    padding: DESIGN.SPACING.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  socialIconContainer: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: DESIGN.SPACING.sm,
  },
  socialName: {
    fontSize: DESIGN.TYPOGRAPHY.bodySmall,
    fontWeight: "600",
    color: DESIGN.COLORS.gray900,
  },
  hoursCard: {
    backgroundColor: DESIGN.COLORS.white,
    borderRadius: DESIGN.RADIUS.lg,
    padding: DESIGN.SPACING.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  hourRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hourLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: DESIGN.SPACING.sm,
    flex: 1,
  },
  hourDay: {
    fontSize: DESIGN.TYPOGRAPHY.bodySmall,
    fontWeight: "600",
    color: DESIGN.COLORS.gray900,
  },
  hourBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: DESIGN.SPACING.md,
    paddingVertical: DESIGN.SPACING.xs,
    borderRadius: DESIGN.RADIUS.sm,
  },
  hourBadgeClosed: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  hourTime: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    fontWeight: "700",
    color: DESIGN.COLORS.success,
  },
  hourTimeClosed: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    fontWeight: "700",
    color: DESIGN.COLORS.error,
  },
  hourDivider: {
    height: 1,
    backgroundColor: DESIGN.COLORS.gray200,
    marginVertical: DESIGN.SPACING.md,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "rgba(59, 130, 246, 0.08)",
    borderRadius: DESIGN.RADIUS.lg,
    padding: DESIGN.SPACING.lg,
    gap: DESIGN.SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: DESIGN.COLORS.info,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: DESIGN.TYPOGRAPHY.bodySmall,
    fontWeight: "700",
    color: DESIGN.COLORS.info,
    marginBottom: DESIGN.SPACING.xs / 2,
  },
  infoText: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    color: DESIGN.COLORS.gray700,
    lineHeight: scale(18),
  },
});
