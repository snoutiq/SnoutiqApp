import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Linking from "expo-linking";
import * as StoreReview from "expo-store-review";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";
import { Platform } from "react-native";
import { Share } from "react-native";
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

const SettingsScreen = ({ navigation }) => {

  const SettingItem = ({
    icon,
    title,
    subtitle,
    type,
    value,
    onToggle,
    onPress,
    iconBg,
    iconColor,
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={type === "navigation" ? onPress : null}
      activeOpacity={type === "navigation" ? 0.7 : 1}
    >
      <View
        style={[
          styles.settingIcon,
          { backgroundColor: iconBg || DESIGN.COLORS.gray100 },
        ]}
      >
        <Ionicons
          name={icon}
          size={scale(22)}
          color={iconColor || DESIGN.COLORS.primary}
        />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {type === "toggle" && (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: DESIGN.COLORS.gray200, true: "#C084FC" }}
          thumbColor={value ? DESIGN.COLORS.primary : DESIGN.COLORS.gray100}
          ios_backgroundColor={DESIGN.COLORS.gray200}
        />
      )}
      {type === "navigation" && (
        <Ionicons
          name="chevron-forward"
          size={scale(20)}
          color={DESIGN.COLORS.gray400}
        />
      )}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title, icon }) => (
    <View style={styles.sectionHeaderContainer}>
      {icon && (
        <Ionicons name={icon} size={scale(16)} color={DESIGN.COLORS.gray600} />
      )}
      <Text style={styles.sectionHeader}>{title}</Text>
    </View>
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
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>Manage your preferences</Text>
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
          {/* Account Section */}
          <SectionHeader title="ACCOUNT" icon="person-outline" />
          <View style={styles.section}>
            <SettingItem
              icon="key-outline"
              title="Change Password"
              subtitle="Update your password"
              type="navigation"
              onPress={() => navigation.navigate("ChangePassword")}
              iconBg="rgba(245, 158, 11, 0.1)"
              iconColor={DESIGN.COLORS.warning}
            />
          </View>
          {/* Support Section */}
          <SectionHeader title="SUPPORT" icon="help-circle-outline" />
          <View style={styles.section}>
            <SettingItem
              icon="help-circle-outline"
              title="Help Center"
              subtitle="Get help and support"
              type="navigation"
              onPress={() => navigation.navigate("HelpCenter")}
              iconBg="rgba(102, 126, 234, 0.1)"
              iconColor={DESIGN.COLORS.primary}
            />
            <SettingItem
              icon="mail-outline"
              title="Contact Us"
              subtitle="Send us your feedback"
              type="navigation"
              onPress={() => navigation.navigate("ContactUs")}
              iconBg="rgba(59, 130, 246, 0.1)"
              iconColor={DESIGN.COLORS.info}
            />
            <SettingItem
              icon="shield-checkmark-outline"
              title="Privacy & Security"
              subtitle="Manage your account security"
              type="navigation"
              onPress={() => navigation.navigate("privacypolicy")}
              iconBg="rgba(16, 185, 129, 0.1)"
              iconColor={DESIGN.COLORS.success}
            />
          </View>

          {/* About Section */}
          <SectionHeader title="ABOUT" icon="information-circle-outline" />
          <View style={styles.section}>
            <SettingItem
              icon="star-outline"
              title="Rate App"
              subtitle="Share your experience"
              type="navigation"
              onPress={async () => {
                try {
                  const isAvailable = await StoreReview.isAvailableAsync();

                  if (isAvailable) {
                    // ✅ Opens native in-app review dialog
                    await StoreReview.requestReview();
                  } else {
                    // ✅ Fallback: open App/Play Store link
                    const storeUrl =
                      Platform.OS === "ios"
                        ? "https://apps.apple.com/app/idYOUR_APPLE_APP_ID" // replace YOUR_APPLE_APP_ID
                        : "https://play.google.com/store/apps/details?id=com.snoutiq.app";

                    const supported = await Linking.canOpenURL(storeUrl);
                    if (supported) {
                      await Linking.openURL(storeUrl);
                    } else {
                      Alert.alert("Error", "Unable to open store page.");
                    }
                  }
                } catch (error) {
                  console.error("Error opening rating:", error);
                  Alert.alert(
                    "Error",
                    "Something went wrong while trying to rate the app."
                  );
                }
              }}
              iconBg="rgba(245, 158, 11, 0.1)"
              iconColor={DESIGN.COLORS.warning}
            />

            <SettingItem
              icon="share-social-outline"
              title="Share with Friends"
              subtitle="Invite your friends to join"
              type="navigation"
              onPress={async () => {
                const message = `🐾 Check out SnoutIQ — India's first AI-powered pet care app!  
Download now: https://play.google.com/store/apps/details?id=com.snoutiq.app`;

                try {
                  const result = await Share.share({
                    message,
                    title: "Share SnoutIQ",
                  });

                  if (result.action === Share.dismissedAction) {
                    console.log("User dismissed share dialog");
                  }
                } catch (error) {
                  console.error("Error sharing app:", error);
                }
              }}
              iconBg="rgba(236, 72, 153, 0.1)"
              iconColor="#EC4899"
            />
            <SettingItem
              icon="logo-instagram"
              title="Follow Us"
              subtitle="Connect on social media"
              type="navigation"
              action={() =>
                Linking.openURL(
                  "https://www.instagram.com/snoutiq_marketplace/"
                )
              }
              iconBg="rgba(124, 58, 237, 0.1)"
              iconColor="#7C3AED"
            />
          </View>

          {/* App Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>SnoutIQ v1.0.0</Text>
            <Text style={styles.versionSubtext}>Made with ❤️ for pets</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;

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
    paddingBottom: DESIGN.SPACING.xxl,
  },
  content: {
    paddingHorizontal: DESIGN.SPACING.lg,
    paddingTop: DESIGN.SPACING.xl,
  },
  sectionHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: DESIGN.SPACING.xs,
    marginTop: DESIGN.SPACING.xl,
    marginBottom: DESIGN.SPACING.md,
    paddingLeft: DESIGN.SPACING.xs,
  },
  sectionHeader: {
    fontSize: DESIGN.TYPOGRAPHY.tiny,
    fontWeight: "700",
    color: DESIGN.COLORS.gray600,
    letterSpacing: 1,
  },
  section: {
    backgroundColor: DESIGN.COLORS.white,
    borderRadius: DESIGN.RADIUS.lg,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: DESIGN.SPACING.md,
    paddingHorizontal: DESIGN.SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN.COLORS.gray100,
    minHeight: verticalScale(68),
  },
  settingIcon: {
    width: scale(44),
    height: scale(44),
    borderRadius: DESIGN.RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: DESIGN.SPACING.md,
  },
  settingContent: {
    flex: 1,
    justifyContent: "center",
  },
  settingTitle: {
    fontSize: DESIGN.TYPOGRAPHY.body,
    fontWeight: "600",
    color: DESIGN.COLORS.gray900,
    marginBottom: DESIGN.SPACING.xs / 2,
  },
  settingSubtitle: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    color: DESIGN.COLORS.gray600,
    lineHeight: scale(16),
  },
  logoutButton: {
    marginTop: DESIGN.SPACING.xl,
    borderRadius: DESIGN.RADIUS.lg,
    overflow: "hidden",
    shadowColor: DESIGN.COLORS.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: DESIGN.SPACING.lg,
    paddingHorizontal: DESIGN.SPACING.xl,
    gap: DESIGN.SPACING.md,
  },
  logoutIconContainer: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: DESIGN.COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    fontSize: DESIGN.TYPOGRAPHY.body,
    fontWeight: "700",
    color: DESIGN.COLORS.error,
  },
  versionContainer: {
    alignItems: "center",
    marginTop: DESIGN.SPACING.xl,
    paddingVertical: DESIGN.SPACING.lg,
  },
  versionText: {
    fontSize: DESIGN.TYPOGRAPHY.caption,
    color: DESIGN.COLORS.gray600,
    fontWeight: "600",
    marginBottom: DESIGN.SPACING.xs / 2,
  },
  versionSubtext: {
    fontSize: DESIGN.TYPOGRAPHY.tiny,
    color: DESIGN.COLORS.gray400,
  },
});
