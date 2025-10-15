import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Linking,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { LinearGradient } from "expo-linear-gradient";

// ✅ Your DESIGN system
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
    background: "#F8FAFC",
  },
};

const TermsScreen = () => {
  const navigation = useNavigation();

  const openEmail = () => Linking.openURL("mailto:contact.naukrion@gmail.com");
  const openWebsite = () => Linking.openURL("https://naukrion.com/");

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
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
            <Text style={styles.headerTitle}>Terms & Conditions</Text>
            <Text style={styles.headerSubtitle}>
              Last Updated: May 31, 2025
            </Text>
          </View>
          <View style={styles.headerPlaceholder} />
        </View>
      </LinearGradient>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Last updated: April 18, 2025</Text>

        <Text style={styles.introText}>
          Please read these terms and conditions carefully before using Our
          Service.
        </Text>

        {/* Interpretation and Definitions */}
        <Section title="Interpretation and Definitions">
          <SubSection title="Interpretation">
            <Paragraph>
              The words of which the initial letter is capitalized have meanings
              defined under the following conditions. The following definitions
              shall have the same meaning regardless of whether they appear in
              singular or plural.
            </Paragraph>
          </SubSection>

          <SubSection title="Definitions">
            <Paragraph>
              For the purposes of these Terms and Conditions:
            </Paragraph>

            <Definition term="Affiliate">
              means an entity that controls, is controlled by or is under common
              control with a party, where "control" means ownership of 50% or
              more of the shares, equity interest or other securities entitled
              to vote for election of directors or other managing authority.
            </Definition>

            <Definition term="Country">refers to: Haryana, India</Definition>

            <Definition term="Company">
              (referred to as either "the Company", "We", "Us" or "Our" in this
              Agreement) refers to NaukrionXpert Private Limited, Plot 5, Royal
              Apartment, Nobel Enclave, Sector 22, Gurugram.
            </Definition>

            <Definition term="Device">
              means any device that can access the Service such as a computer, a
              cellphone or a digital tablet.
            </Definition>

            <Definition term="Service">refers to the Website.</Definition>

            <Definition term="Terms and Conditions">
              (also referred as "Terms") mean these Terms and Conditions that
              form the entire agreement between You and the Company regarding
              the use of the Service.
            </Definition>

            <Definition term="Website">
              refers to naukrion, accessible from{" "}
              <Text style={styles.link} onPress={openWebsite}>
                https://naukrion.com/
              </Text>
            </Definition>
          </SubSection>
        </Section>

        {/* Acknowledgment */}
        <Section title="Acknowledgment">
          <Paragraph>
            These are the Terms and Conditions governing the use of this Service
            and the agreement that operates between You and the Company. These
            Terms and Conditions set out the rights and obligations of all users
            regarding the use of the Service.
          </Paragraph>
          <Paragraph>
            Your access to and use of the Service is conditioned on Your
            acceptance of and compliance with these Terms and Conditions.
          </Paragraph>
          <Paragraph>
            By accessing or using the Service You agree to be bound by these
            Terms and Conditions.
          </Paragraph>
          <Paragraph>
            You represent that you are over the age of 18. The Company does not
            permit those under 18 to use the Service.
          </Paragraph>
        </Section>

        {/* Contact Us */}
        <Section title="Contact Us">
          <Paragraph>
            If you have any questions about these Terms and Conditions, You can
            contact us:
          </Paragraph>
          <View style={styles.contactItem}>
            <Ionicons
              name="mail-outline"
              size={DESIGN.TYPOGRAPHY.bodySmall}
              color={DESIGN.COLORS.info}
            />
            <Text style={styles.contactText} onPress={openEmail}>
              contact.naukrion@gmail.com
            </Text>
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
};

// ✅ Reusable Components
const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const SubSection = ({ title, children }) => (
  <View style={styles.subSection}>
    <Text style={styles.subSectionTitle}>{title}</Text>
    {children}
  </View>
);

const Paragraph = ({ children }) => (
  <Text style={styles.paragraph}>{children}</Text>
);

const Definition = ({ term, children }) => (
  <View style={styles.definition}>
    <Text style={styles.term}>{term}</Text>
    <Text style={styles.definitionText}> - {children}</Text>
  </View>
);

// ✅ Styles using DESIGN system
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN.COLORS.gray50,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: DESIGN.SPACING.lg,
    paddingBottom: DESIGN.VERTICAL_SPACING.xl,
  },
  lastUpdated: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    color: DESIGN.COLORS.gray600,
    marginBottom: DESIGN.VERTICAL_SPACING.sm,
  },
  introText: {
    fontSize: DESIGN.TYPOGRAPHY.body,
    color: DESIGN.COLORS.gray700,
    marginBottom: DESIGN.VERTICAL_SPACING.lg,
    lineHeight: verticalScale(20),
  },
  section: {
    marginBottom: DESIGN.VERTICAL_SPACING.xl,
  },
  sectionTitle: {
    fontSize: DESIGN.TYPOGRAPHY.h3,
    fontWeight: "600",
    color: DESIGN.COLORS.primary,
    marginBottom: DESIGN.VERTICAL_SPACING.sm,
  },
  subSection: {
    marginBottom: DESIGN.VERTICAL_SPACING.md,
    marginLeft: DESIGN.SPACING.sm,
  },
  subSectionTitle: {
    fontSize: DESIGN.TYPOGRAPHY.body,
    fontWeight: "600",
    color: DESIGN.COLORS.gray900,
    marginBottom: DESIGN.VERTICAL_SPACING.xs,
  },
  paragraph: {
    fontSize: DESIGN.TYPOGRAPHY.bodySmall,
    color: DESIGN.COLORS.gray700,
    marginBottom: DESIGN.VERTICAL_SPACING.sm,
    lineHeight: verticalScale(20),
  },
  definition: {
    flexDirection: "row",
    marginBottom: DESIGN.VERTICAL_SPACING.xs,
  },
  term: {
    fontSize: DESIGN.TYPOGRAPHY.bodySmall,
    fontWeight: "600",
    color: DESIGN.COLORS.gray900,
  },
  definitionText: {
    fontSize: DESIGN.TYPOGRAPHY.bodySmall,
    color: DESIGN.COLORS.gray700,
    flex: 1,
    lineHeight: verticalScale(20),
  },
  link: {
    color: DESIGN.COLORS.info,
    textDecorationLine: "underline",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: DESIGN.VERTICAL_SPACING.xs,
  },
  contactText: {
    fontSize: DESIGN.TYPOGRAPHY.bodySmall,
    color: DESIGN.COLORS.info,
    marginLeft: DESIGN.SPACING.xs,
    textDecorationLine: "underline",
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

export default TermsScreen;
