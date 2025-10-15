import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

// Cache implementation
const CACHE_KEYS = {
  APPOINTMENTS: 'appointments_cache',
  PRESCRIPTIONS: 'prescriptions_cache',
  TIMESTAMP: 'cache_timestamp'
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const cacheData = async (key, data) => {
  try {
    const cacheItem = {
      data,
      timestamp: Date.now()
    };
    await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
  } catch (error) {
    console.error('Cache save error:', error);
  }
};

const getCachedData = async (key) => {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }
  } catch (error) {
    console.error('Cache read error:', error);
  }
  return null;
};

const HealthRecordsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [expandedId, setExpandedId] = useState(null);
  const [expandedType, setExpandedType] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shimmerOpacity] = useState(new Animated.Value(1));
  const [activeTab, setActiveTab] = useState("appointments"); // New state for active tab

  // YouTube-style shimmer animation
  const startShimmerAnimation = useCallback(() => {
    const shimmerAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerOpacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerAnim.start();
    return () => shimmerAnim.stop();
  }, [shimmerOpacity]);

  // Fetch appointments with cache
  const fetchAppointments = useCallback(async (useCache = true) => {
    if (!user?.id) return;

    try {
      let appointmentsData = null;
      
      if (useCache) {
        appointmentsData = await getCachedData(CACHE_KEYS.APPOINTMENTS);
        if (appointmentsData) {
          setAppointments(appointmentsData);
          return appointmentsData;
        }
      }

      const response = await fetch(
        `https://snoutiq.com/backend/api/users/${user.id}/orders`,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      const cleanText = text.trim().replace(/^\uFEFF/, "");

      let result;
      try {
        result = JSON.parse(cleanText);
      } catch (e) {
        console.error("JSON parse failed:", e, "Raw text:", cleanText);
        setAppointments([]);
        return;
      }

      const finalAppointments = Array.isArray(result.orders) ? result.orders : [];
      setAppointments(finalAppointments);
      
      await cacheData(CACHE_KEYS.APPOINTMENTS, finalAppointments);
      
      return finalAppointments;
    } catch (error) {
      console.error("Error fetching appointments:", error);
      
      const cachedData = await getCachedData(CACHE_KEYS.APPOINTMENTS);
      if (cachedData) {
        setAppointments(cachedData);
      } else {
        setAppointments([]);
      }
    }
  }, [user?.id]);

  // Fetch prescriptions with cache
  const fetchPrescriptions = useCallback(async (useCache = true) => {
    if (!user?.id) return;

    try {
      let prescriptionsData = null;
      
      if (useCache) {
        prescriptionsData = await getCachedData(CACHE_KEYS.PRESCRIPTIONS);
        if (prescriptionsData) {
          setPrescriptions(prescriptionsData);
          return prescriptionsData;
        }
      }

      const response = await fetch(
        `https://snoutiq.com/backend/api/prescriptions?user_id=${user.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const text = await response.text();
      const cleanText = text.trim().replace(/^\uFEFF/, "");

      let result;
      try {
        result = JSON.parse(cleanText);
      } catch (e) {
        console.error("JSON parse failed:", e, "Raw text:", cleanText);
        setPrescriptions([]);
        return;
      }

      const finalPrescriptions = Array.isArray(result.data) ? result.data : [];
      setPrescriptions(finalPrescriptions);
      
      await cacheData(CACHE_KEYS.PRESCRIPTIONS, finalPrescriptions);
      
      return finalPrescriptions;
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      
      const cachedData = await getCachedData(CACHE_KEYS.PRESCRIPTIONS);
      if (cachedData) {
        setPrescriptions(cachedData);
      } else {
        setPrescriptions([]);
      }
    }
  }, [user?.id]);

  // Fetch all data
  const fetchAllData = useCallback(async (useCache = true) => {
    setLoading(true);
    startShimmerAnimation();
    
    await Promise.all([
      fetchAppointments(useCache),
      fetchPrescriptions(useCache)
    ]);
    
    setLoading(false);
  }, [fetchAppointments, fetchPrescriptions, startShimmerAnimation]);

  // Refresh handler - bypass cache
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllData(false); // Don't use cache on refresh
    setRefreshing(false);
  }, [fetchAllData]);

  useEffect(() => {
    fetchAllData(true); // Use cache on initial load
  }, [fetchAllData]);

  const toggleExpand = (id, type) => {
    if (expandedId === id && expandedType === type) {
      setExpandedId(null);
      setExpandedType(null);
    } else {
      setExpandedId(id);
      setExpandedType(type);
    }
  };

  // Shimmer loading component
  const ShimmerLoader = () => (
    <View style={styles.shimmerContainer}>
      {[1, 2, 3].map((item) => (
        <Animated.View 
          key={item} 
          style={[styles.shimmerCard, { opacity: shimmerOpacity }]}
        >
          <View style={styles.shimmerHeader}>
            <View style={styles.shimmerAvatar} />
            <View style={styles.shimmerTextContainer}>
              <View style={styles.shimmerTitle} />
              <View style={styles.shimmerSubtitle} />
            </View>
          </View>
          <View style={styles.shimmerContent}>
            <View style={styles.shimmerLine} />
            <View style={styles.shimmerLine} />
            <View style={[styles.shimmerLine, { width: '60%' }]} />
          </View>
        </Animated.View>
      ))}
    </View>
  );

  const getStatusColor = (status) => {
    const colors = {
      confirmed: { bg: "#D1FAE5", text: "#065F46", border: "#A7F3D0" },
      routing: { bg: "#DBEAFE", text: "#1E40AF", border: "#BFDBFE" },
      pending: { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" },
      cancelled: { bg: "#FEE2E2", text: "#991B1B", border: "#FECACA" },
      completed: { bg: "#F3F4F6", text: "#374151", border: "#E5E7EB" },
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      confirmed: "checkmark-circle",
      routing: "hourglass",
      pending: "alert-circle",
      cancelled: "close-circle",
      completed: "checkmark-done-circle",
    };
    return icons[status] || "alert-circle";
  };

  const getUrgencyBadge = (urgency) => {
    const badges = {
      high: { bg: "#FEE2E2", text: "#991B1B", border: "#FECACA" },
      medium: { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" },
      low: { bg: "#D1FAE5", text: "#065F46", border: "#A7F3D0" },
    };
    return badges[urgency] || badges.medium;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const stripHtml = (html) => {
    return (
      html
        ?.replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim() || ""
    );
  };

  const renderAppointmentCard = (appointment) => {
    const isExpanded =
      expandedId === appointment.id && expandedType === "appointment";
    const statusColors = getStatusColor(appointment.status);
    const urgencyColors = getUrgencyBadge(appointment.urgency);

    return (
      <View key={appointment.id} style={styles.card}>
        <TouchableOpacity
          onPress={() => toggleExpand(appointment.id, "appointment")}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <LinearGradient
                colors={["#F3E8FF", "#FCE7F3"]}
                style={styles.iconContainer}
              >
                <Ionicons
                  name={
                    appointment.service_type === "video"
                      ? "videocam"
                      : "business"
                  }
                  size={24}
                  color="#7C3AED"
                />
              </LinearGradient>
              <View style={styles.cardHeaderInfo}>
                <View style={styles.cardHeaderTop}>
                  <Text style={styles.doctorName} numberOfLines={1}>
                    {appointment.doctor_name}
                  </Text>
                  <View
                    style={[
                      styles.urgencyBadge,
                      {
                        backgroundColor: urgencyColors.bg,
                        borderColor: urgencyColors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.urgencyText,
                        { color: urgencyColors.text },
                      ]}
                    >
                      {appointment.urgency}
                    </Text>
                  </View>
                </View>
                <Text style={styles.clinicName} numberOfLines={1}>
                  {appointment.clinic_name}
                </Text>
              </View>
            </View>
            <View style={styles.cardHeaderRight}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: statusColors.bg,
                    borderColor: statusColors.border,
                  },
                ]}
              >
                <Ionicons
                  name={getStatusIcon(appointment.status)}
                  size={14}
                  color={statusColors.text}
                />
                <Text style={[styles.statusText, { color: statusColors.text }]}>
                  {appointment.status}
                </Text>
              </View>
              <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.quickInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar" size={16} color="#7C3AED" />
              <Text style={styles.infoText}>
                {formatDate(appointment.scheduled_date)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="time" size={16} color="#7C3AED" />
              <Text style={styles.infoText}>
                {formatTime(appointment.scheduled_time)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.divider} />
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <View
                  style={[styles.detailIcon, { backgroundColor: "#F3E8FF" }]}
                >
                  <Ionicons name="person" size={16} color="#7C3AED" />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Doctor</Text>
                  <Text style={styles.detailValue}>
                    {appointment.doctor_name}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View
                  style={[styles.detailIcon, { backgroundColor: "#D1FAE5" }]}
                >
                  <Ionicons name="business" size={16} color="#10B981" />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Clinic</Text>
                  <Text style={styles.detailValue}>
                    {appointment.clinic_name}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View
                  style={[styles.detailIcon, { backgroundColor: "#DBEAFE" }]}
                >
                  <Ionicons name="document" size={16} color="#3B82F6" />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Service Type</Text>
                  <Text style={styles.detailValue}>
                    {appointment.service_type === "video"
                      ? "Video Consultation"
                      : "Clinic Consultation"}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View
                  style={[styles.detailIcon, { backgroundColor: "#FEF3C7" }]}
                >
                  <Ionicons name="card" size={16} color="#DC2626" />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Payment Status</Text>
                  <Text style={styles.detailValue}>
                    {appointment.payment_status}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View
                  style={[styles.detailIcon, { backgroundColor: "#F0FDF4" }]}
                >
                  <Ionicons name="pricetag" size={16} color="#16A34A" />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Final Price</Text>
                  <Text style={styles.detailValue}>
                    {appointment.final_price
                      ? `₹${appointment.final_price}`
                      : "Not Set"}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View
                  style={[styles.detailIcon, { backgroundColor: "#F5F3FF" }]}
                >
                  <Ionicons name="time" size={16} color="#7C3AED" />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Scheduled For</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(appointment.scheduled_for)} at{" "}
                    {formatTime(appointment.scheduled_time)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderPrescriptionCard = (prescription) => {
    const isExpanded =
      expandedId === prescription.id && expandedType === "prescription";
    let fullImageUrl = null;
    if (
      prescription.image_path &&
      typeof prescription.image_path === "string"
    ) {
      fullImageUrl = `https://snoutiq.com/backend/${prescription.image_path.replace(
        "prescrriptions",
        "prescriptions"
      )}`;
    }

    return (
      <View key={prescription.id} style={styles.card}>
        <TouchableOpacity
          onPress={() => toggleExpand(prescription.id, "prescription")}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <LinearGradient
                colors={["#DBEAFE", "#E0F2FE"]}
                style={styles.iconContainer}
              >
                <Ionicons name="document-text" size={24} color="#3B82F6" />
              </LinearGradient>
              <View style={styles.cardHeaderInfo}>
                <Text style={styles.doctorName}>
                  Prescription #{prescription.id}
                </Text>
                <Text style={styles.clinicName}>
                  Issued: {formatDate(prescription.created_at)}
                </Text>
              </View>
            </View>
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color="#9CA3AF"
            />
          </View>

          <View style={styles.prescriptionPreview}>
            <Text style={styles.prescriptionPreviewText} numberOfLines={3}>
              {stripHtml(prescription.content_html) ||
                "No prescription details available"}
            </Text>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.divider} />
            <View style={styles.prescriptionDetails}>
              <Text style={styles.detailSectionTitle}>
                Prescription Details
              </Text>
              <Text style={styles.prescriptionDetailText}>
                {stripHtml(prescription.content_html) ||
                  "No prescription details available"}
              </Text>
            </View>

            {fullImageUrl && (
              <View style={styles.prescriptionImageSection}>
                <View style={styles.imageSectionHeader}>
                  <Ionicons name="camera" size={16} color="#6B7280" />
                  <Text style={styles.detailSectionTitle}>
                    Prescription Image
                  </Text>
                </View>
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: fullImageUrl }}
                    style={styles.prescriptionImage}
                    resizeMode="contain"
                    onError={(error) =>
                      console.log(
                        "Image loading error:",
                        error.nativeEvent.error
                      )
                    }
                  />
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient 
        colors={["#667eea", "#764ba2"]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Health Records</Text>
            <Text style={styles.headerSubtitle}>
              Track appointments and prescriptions
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Tab Buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "appointments" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("appointments")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "appointments" && styles.activeTabText,
            ]}
          >
            Appointments ({appointments.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "prescriptions" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("prescriptions")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "prescriptions" && styles.activeTabText,
            ]}
          >
            Prescriptions ({prescriptions.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={["#7C3AED"]}
            tintColor="#7C3AED"
          />
        }
      >
        {/* Loading State with YouTube-style Shimmer */}
        {loading && !refreshing && <ShimmerLoader />}

        {/* Appointments Section */}
        {!loading && activeTab === "appointments" && appointments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={["#7C3AED", "#6D28D9"]}
                style={styles.sectionIcon}
              >
                <Ionicons name="calendar" size={16} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Appointments</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{appointments.length}</Text>
              </View>
            </View>
            {appointments.map(renderAppointmentCard)}
          </View>
        )}

        {/* Prescriptions Section */}
        {!loading && activeTab === "prescriptions" && prescriptions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={["#3B82F6", "#1D4ED8"]}
                style={styles.sectionIcon}
              >
                <Ionicons name="document-text" size={16} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.sectionTitle}>Prescriptions</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{prescriptions.length}</Text>
              </View>
            </View>
            {prescriptions.map(renderPrescriptionCard)}
          </View>
        )}

        {/* Empty State */}
        {!loading && 
         ((activeTab === "appointments" && appointments.length === 0) || 
          (activeTab === "prescriptions" && prescriptions.length === 0)) && (
          <View style={styles.emptyState}>
            <LinearGradient
              colors={["#F8FAFC", "#F1F5F9"]}
              style={styles.emptyStateIcon}
            >
              <Ionicons
                name="folder-open-outline"
                size={64}
                color="#9CA3AF"
              />
            </LinearGradient>
            <Text style={styles.emptyStateTitle}>No Records Found</Text>
            <Text style={styles.emptyStateText}>
              Your {activeTab === "appointments" ? "appointments" : "prescriptions"} will appear here once available
            </Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={onRefresh}
            >
              <Ionicons name="refresh" size={20} color="#7C3AED" />
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4FF",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 4,
    fontWeight: "500",
  },
  // New Tab Styles
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  activeTabButton: {
    backgroundColor: "#7C3AED",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
    flex: 1,
    letterSpacing: -0.5,
  },
  countBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  countText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  cardHeaderTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  doctorName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginLeft: 8,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  clinicName: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  cardHeaderRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  quickInfo: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 14,
    gap: 20,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  infoText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  expandedContent: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginBottom: 20,
  },
  detailsGrid: {
    gap: 16,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "700",
    textTransform: "capitalize",
  },
  prescriptionPreview: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 14,
  },
  prescriptionPreviewText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    fontWeight: "500",
  },
  prescriptionDetails: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    marginBottom: 16,
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
  },
  prescriptionDetailText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
    fontWeight: "500",
  },
  prescriptionImageSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    marginBottom: 16,
  },
  imageSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  imageContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  prescriptionImage: {
    width: width - 104,
    height: 200,
    borderRadius: 12,
  },
  shimmerContainer: {
    marginBottom: 24,
  },
  shimmerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  shimmerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  shimmerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    marginRight: 16,
  },
  shimmerTextContainer: {
    flex: 1,
  },
  shimmerTitle: {
    height: 16,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    marginBottom: 8,
    width: "70%",
  },
  shimmerSubtitle: {
    height: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    width: "50%",
  },
  shimmerContent: {
    gap: 8,
  },
  shimmerLine: {
    height: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    width: "100%",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  refreshButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#7C3AED",
  },
});

export default HealthRecordsScreen;