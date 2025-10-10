import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
const { width } = Dimensions.get('window');

const AppointmentScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [expandedId, setExpandedId] = useState(null);
  const [prescriptionHistory, setPrescriptionHistory] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch appointments with useCallback to prevent recreation
  const fetchAppointments = useCallback(async () => {
    if (!user?.id) {
      console.log('No user ID found');
      setAppointments([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `https://snoutiq.com/backend/api/doctor/bookings?user_id=${user.id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result = await res.json();
      console.log('Appointments API Response:', result);

      if (result?.data && Array.isArray(result.data)) {
        setAppointments(result.data);
      } else {
        console.log('No appointment data found');
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch prescription history with useCallback
  const fetchPrescriptionHistory = useCallback(async () => {
    if (activeTab !== 'history' || !user?.id) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `https://snoutiq.com/backend/api/prescriptions?user_id=${user.id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result = await res.json();
      console.log('Prescription API Response:', result);

      if (result?.data && Array.isArray(result.data)) {
        setPrescriptionHistory(result.data);
      } else {
        console.log('No prescription data found');
        setPrescriptionHistory([]);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      setPrescriptionHistory([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, user?.id]);

  useEffect(() => {
    fetchAppointments();
    fetchPrescriptionHistory();
  }, [fetchAppointments, fetchPrescriptionHistory]);

  // Memoized appointments processing
  const processedAppointments = useMemo(() => {
    if (!appointments.length) return [];

    const mappedAppointments = appointments.map((appt) => {
      let services;
      try {
        services = JSON.parse(appt.services);
      } catch (e) {
        services = [];
        console.error('Error parsing services:', e);
      }

      return {
        id: appt.id,
        doctor: appt.vet_name || appt.vet_email || 'Unknown Vet',
        specialty: 'Veterinarian',
        date: appt.date,
        time: appt.start_time,
        location: appt.vet_address,
        phone: appt.vet_email,
        reason: services.length > 0 ? `Service ID: ${services[0].service_id}` : 'General Visit',
        notes: '',
        petName: 'Unknown Pet',
        petType: 'Unknown',
        petBreed: 'Unknown',
        petAge: 'Unknown',
        status: appt.status,
        prescriptions: activeTab === 'history' ? prescriptionHistory : [],
      };
    });

    // Filter appointments based on activeTab
    return mappedAppointments.filter((appt) => {
      const apptDate = new Date(appt.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return activeTab === 'upcoming'
        ? apptDate >= today && appt.status !== 'Completed'
        : apptDate < today || appt.status === 'Completed';
    });
  }, [appointments, prescriptionHistory, activeTab]);

  // Memoized toggle function
  const toggleExpand = useCallback((id) => {
    setExpandedId(prevId => prevId === id ? null : id);
  }, []);

  // Memoized prescription content renderer
  const renderPrescriptionContent = useCallback((html) => {
    if (!html) return null;

    const plain = html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return plain ? (
      <View style={styles.prescriptionContent}>
        <Text style={styles.prescriptionContentText}>{plain}</Text>
      </View>
    ) : (
      <View style={styles.noPrescriptionContent}>
        <Text style={styles.noPrescriptionText}>No prescription details available</Text>
      </View>
    );
  }, []);

  // Memoized prescription image renderer
  const renderPrescriptionImage = useCallback((imagePath) => {
    if (!imagePath) return null;

    const fullImageUrl = imagePath.startsWith('http')
      ? imagePath
      : `https://snoutiq.com/backend/storage/${imagePath}`;

    return (
      <View style={styles.prescriptionImageContainer}>
        <Text style={styles.prescriptionImageLabel}>Prescription Image:</Text>
        <Image
          source={{ uri: fullImageUrl }}
          style={styles.prescriptionImg}
          resizeMode="contain"
          onError={(error) => console.log('Image loading error:', error.nativeEvent.error)}
        />
      </View>
    );
  }, []);

  // Memoized AppointmentCard component
  const AppointmentCard = useCallback(({ appointment, isHistory }) => {
    const expanded = expandedId === appointment.id;
    const initial = appointment.doctor?.split(' ')[1]?.[0] || 'V';

    return (
      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => toggleExpand(appointment.id)}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={styles.doctorInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
              <View style={styles.doctorDetails}>
                <Text style={styles.doctorName}>{appointment.doctor}</Text>
                <Text style={styles.specialty}>{appointment.specialty}</Text>
                <View style={styles.petInfo}>
                  <Text style={styles.petIcon}>🐾</Text>
                  <Text style={styles.petName}>
                    {appointment.petName} • {appointment.petBreed}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.expandIcon}>{expanded ? '▲' : '▼'}</Text>
            </View>
          </View>

          <View style={styles.basicInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📅</Text>
              <Text style={styles.infoText}>{appointment.date}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🕐</Text>
              <Text style={styles.infoText}>{appointment.time}</Text>
            </View>
          </View>

          {expanded && (
            <View style={styles.expandedSection}>
              <View style={styles.divider} />

              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>📍</Text>
                  <Text style={styles.detailText}>{appointment.location}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>📞</Text>
                  <Text style={styles.detailText}>{appointment.phone}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>📝</Text>
                  <Text style={styles.detailText}>{appointment.reason}</Text>
                </View>
                {appointment.notes && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>💡</Text>
                    <Text style={styles.detailText}>{appointment.notes}</Text>
                  </View>
                )}
              </View>

              {isHistory && appointment.prescriptions?.length > 0 && (
                <View style={styles.prescriptionsSection}>
                  <Text style={styles.sectionTitle}>Prescriptions</Text>
                  {appointment.prescriptions.map((prescription, idx) => (
                    <View key={prescription.id || idx} style={styles.prescriptionItem}>
                      {renderPrescriptionContent(prescription.content_html)}
                      {renderPrescriptionImage(prescription.image_path)}
                      <Text style={styles.prescriptionDate}>
                        Issued: {new Date(prescription.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {isHistory && (
                <View style={styles.statusContainer}>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>✓ {appointment.status}</Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  }, [expandedId, toggleExpand, renderPrescriptionContent, renderPrescriptionImage]);

  // Memoized tab change handler
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setExpandedId(null); // Reset expanded state on tab change
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#7C3AED" barStyle="light-content" />

      <LinearGradient
        colors={["#7C3AED", "#8B5CF6"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Appointments</Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => handleTabChange('upcoming')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => handleTabChange('history')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#7C3AED" size="large" />
            <Text style={styles.loadingText}>Loading appointments...</Text>
          </View>
        )}

        {!loading && (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {processedAppointments.length > 0 ? (
              processedAppointments.map((appt) => (
                <AppointmentCard
                  key={appt.id}
                  appointment={appt}
                  isHistory={activeTab === 'history'}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>📅</Text>
                <Text style={styles.emptyStateTitle}>
                  {activeTab === 'upcoming' ? 'No Upcoming Appointments' : 'No Appointment History'}
                </Text>
                <Text style={styles.emptyStateText}>
                  {activeTab === 'upcoming'
                    ? 'Your upcoming appointments will appear here.'
                    : 'Your completed appointments will appear here.'}
                </Text>
              </View>
            )}

            {activeTab === 'history' && !loading && prescriptionHistory.length === 0 && processedAppointments.length > 0 && (
              <View style={styles.infoState}>
                <Text style={styles.infoStateText}>No prescription history available</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

// Styles remain the same...
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  header: {
    paddingTop: StatusBar.currentHeight,
    paddingHorizontal: 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  backButtonText: { 
    fontSize: 24, 
    color: '#fff', 
    fontWeight: 'bold' 
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 32,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tab: { 
    flex: 1, 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderRadius: 8,
  },
  activeTab: { 
    backgroundColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: { 
    color: '#6B7280', 
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  activeTabText: { 
    color: '#fff',
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  scrollContent: { 
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cardContainer: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  doctorInfo: { 
    flexDirection: 'row', 
    alignItems: 'flex-start',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '700' 
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: { 
    fontSize: 16, 
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  specialty: { 
    fontSize: 13, 
    color: '#7C3AED',
    fontWeight: '500',
    marginBottom: 4,
  },
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  petName: { 
    fontSize: 13, 
    color: '#6B7280',
    fontWeight: '500',
  },
  headerRight: {
    marginLeft: 8,
  },
  expandIcon: { 
    fontSize: 12, 
    color: '#9CA3AF',
    fontWeight: 'bold',
  },
  basicInfo: {
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoIcon: {
    fontSize: 12,
    marginRight: 8,
    width: 16,
  },
  infoText: { 
    color: '#4B5563', 
    fontSize: 13, 
    fontWeight: '500',
  },
  expandedSection: {
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  detailsContainer: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailIcon: {
    fontSize: 12,
    marginRight: 10,
    width: 16,
    marginTop: 1,
  },
  detailText: { 
    color: '#374151', 
    fontSize: 13, 
    fontWeight: '400',
    flex: 1,
    lineHeight: 18,
  },
  prescriptionsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  sectionTitle: { 
    fontWeight: '600', 
    fontSize: 15, 
    marginBottom: 12,
    color: '#1F2937',
  },
  prescriptionItem: { 
    backgroundColor: '#F8FAFC', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  prescriptionContent: { 
    backgroundColor: '#fff', 
    padding: 12, 
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  prescriptionContentText: { 
    fontSize: 13, 
    color: '#374151',
    lineHeight: 18,
  },
  noPrescriptionContent: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    marginBottom: 12,
  },
  noPrescriptionText: {
    fontSize: 13,
    color: '#92400E',
    fontStyle: 'italic',
  },
  prescriptionImageContainer: {
    marginBottom: 12,
  },
  prescriptionImageLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 8,
  },
  prescriptionImg: { 
    width: '100%', 
    height: 200, 
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  prescriptionDate: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 8,
  },
  statusContainer: {
    marginTop: 16,
  },
  statusBadge: {
    backgroundColor: '#D1FAE5',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: { 
    color: '#065F46', 
    fontSize: 12, 
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  loadingContainer: { 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: { 
    fontSize: 14, 
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  infoState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  infoStateText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});

export default AppointmentScreen;