import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const AppointmentScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('upcoming');

  // Mock appointment data
  const upcomingAppointments = [
    {
      id: 1,
      petName: "Buddy",
      petType: "Golden Retriever",
      type: "Regular Checkup",
      doctor: "Dr. Smith",
      clinic: "Happy Paws Veterinary Clinic",
      date: "Aug 31, 2025",
      time: "2:30 PM",
      status: "confirmed",
      isUrgent: false,
    },
    {
      id: 2,
      petName: "Whiskers",
      petType: "Persian Cat",
      type: "Vaccination",
      doctor: "Dr. Johnson",
      clinic: "Pet Care Center",
      date: "Sep 2, 2025",
      time: "10:00 AM",
      status: "pending",
      isUrgent: true,
    },
    {
      id: 3,
      petName: "Charlie",
      petType: "Beagle",
      type: "Dental Cleaning",
      doctor: "Dr. Williams",
      clinic: "Animal Health Hospital",
      date: "Sep 5, 2025",
      time: "3:15 PM",
      status: "confirmed",
      isUrgent: false,
    },
  ];

  const pastAppointments = [
    {
      id: 4,
      petName: "Buddy",
      petType: "Golden Retriever",
      type: "Emergency Visit",
      doctor: "Dr. Smith",
      clinic: "Happy Paws Veterinary Clinic",
      date: "Aug 15, 2025",
      time: "11:30 AM",
      status: "completed",
    },
    {
      id: 5,
      petName: "Whiskers",
      petType: "Persian Cat",
      type: "Regular Checkup",
      doctor: "Dr. Johnson",
      clinic: "Pet Care Center",
      date: "Jul 22, 2025",
      time: "9:00 AM",
      status: "completed",
    },
    {
      id: 6,
      petName: "Charlie",
      petType: "Beagle",
      type: "Vaccination",
      doctor: "Dr. Williams",
      clinic: "Animal Health Hospital",
      date: "Jun 10, 2025",
      time: "2:00 PM",
      status: "completed",
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return '✅';
      case 'pending': return '🕐';
      case 'completed': return '✔️';
      default: return '📅';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#16a34a';
      case 'pending': return '#f59e0b';
      case 'completed': return '#6b7280';
      default: return '#2563EB';
    }
  };

  const renderUpcomingCard = (appointment) => (
    <TouchableOpacity 
      key={appointment.id} 
      style={[
        styles.appointmentCard,
        appointment.isUrgent && styles.urgentCard
      ]}
      onPress={() => Alert.alert("Appointment Details", `View details for ${appointment.petName}'s appointment`)}
    >
      {appointment.isUrgent && (
        <View style={styles.urgentBadge}>
          <Text style={styles.urgentText}>🚨 Urgent</Text>
        </View>
      )}
      
      <View style={styles.cardHeader}>
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{appointment.petName}</Text>
          <Text style={styles.petType}>{appointment.petType}</Text>
        </View>
        <View style={styles.statusContainer}>
          <Text style={styles.statusIcon}>{getStatusIcon(appointment.status)}</Text>
          <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>
            {appointment.status}
          </Text>
        </View>
      </View>

      <View style={styles.appointmentDetails}>
        <Text style={styles.appointmentType}>{appointment.type}</Text>
        <Text style={styles.doctorName}>Dr. {appointment.doctor}</Text>
        <Text style={styles.clinicName}>{appointment.clinic}</Text>
      </View>

      <View style={styles.dateTimeContainer}>
        <View style={styles.dateTime}>
          <Text style={styles.dateTimeIcon}>📅</Text>
          <Text style={styles.dateTimeText}>{appointment.date}</Text>
        </View>
        <View style={styles.dateTime}>
          <Text style={styles.dateTimeIcon}>🕐</Text>
          <Text style={styles.dateTimeText}>{appointment.time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHistoryCard = (appointment) => (
    <TouchableOpacity 
      key={appointment.id} 
      style={styles.historyCard}
      onPress={() => Alert.alert("Past Appointment", `View details for ${appointment.petName}'s past visit`)}
    >
      <View style={styles.historyHeader}>
        <Text style={styles.historyIcon}>📋</Text>
        <View style={styles.historyInfo}>
          <Text style={styles.historyPetName}>{appointment.petName}</Text>
          <Text style={styles.historyType}>{appointment.type}</Text>
        </View>
        <View style={styles.historyDate}>
          <Text style={styles.historyDateText}>{appointment.date}</Text>
          <Text style={styles.completedIcon}>✔️</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#dbeafe', '#e0e7ff']}
        style={styles.backgroundGradient}
      />
      
      {/* Header */}
      <LinearGradient
        colors={['#2563EB', '#3b82f6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.openDrawer()}
            >
            <View style={styles.profileAvatar}>
              <Ionicons name="menu" size={scale(18)} color="#2563EB" />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Appointments</Text>
          <TouchableOpacity onPress={() => Alert.alert("Add Appointment", "Book a new appointment")}>
            <Text style={styles.addButton}>+</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'upcoming' ? (
          <View>
            <Text style={styles.sectionHeader}>Upcoming Appointments</Text>
            {upcomingAppointments.map(renderUpcomingCard)}
          </View>
        ) : (
          <View>
            <Text style={styles.sectionHeader}>Appointment History</Text>
            {pastAppointments.map(renderHistoryCard)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    paddingHorizontal: scale(20),
   paddingVertical:verticalScale(5)
  },
  profileAvatar: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    fontSize: moderateScale(28),
    color: '#fff',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    fontSize: moderateScale(28),
    color: '#fff',
    fontWeight: '300',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: scale(20),
    marginTop: verticalScale(16),
    borderRadius: scale(12),
    padding: scale(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.05,
    shadowRadius: scale(4),
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: verticalScale(12),
    alignItems: 'center',
    borderRadius: scale(8),
  },
  activeTab: {
    backgroundColor: '#2563EB',
  },
  tabText: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(20),
  },
  sectionHeader: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: verticalScale(24),
    marginBottom: verticalScale(16),
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: scale(16),
    padding: scale(20),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.08,
    shadowRadius: scale(8),
    elevation: 4,
  },
  urgentCard: {
    borderColor: '#f59e0b',
    borderWidth: 2,
    backgroundColor: '#fffbeb',
  },
  urgentBadge: {
    position: 'absolute',
    top: scale(-8),
    right: scale(16),
    backgroundColor: '#f59e0b',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(4),
    borderRadius: scale(12),
  },
  urgentText: {
    fontSize: moderateScale(10),
    color: '#fff',
    fontWeight: 'bold',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(12),
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#1f2937',
  },
  petType: {
    fontSize: moderateScale(12),
    color: '#6b7280',
    marginTop: verticalScale(2),
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: moderateScale(16),
  },
  statusText: {
    fontSize: moderateScale(10),
    fontWeight: '500',
    textTransform: 'capitalize',
    marginTop: verticalScale(2),
  },
  appointmentDetails: {
    marginBottom: verticalScale(16),
  },
  appointmentType: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#2563EB',
    marginBottom: verticalScale(4),
  },
  doctorName: {
    fontSize: moderateScale(14),
    color: '#374151',
    marginBottom: verticalScale(2),
  },
  clinicName: {
    fontSize: moderateScale(12),
    color: '#6b7280',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
    borderRadius: scale(8),
    flex: 0.48,
  },
  dateTimeIcon: {
    fontSize: moderateScale(14),
    marginRight: scale(6),
  },
  dateTimeText: {
    fontSize: moderateScale(12),
    color: '#1e40af',
    fontWeight: '500',
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: scale(12),
    padding: scale(16),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(1) },
    shadowOpacity: 0.05,
    shadowRadius: scale(4),
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIcon: {
    fontSize: moderateScale(20),
    marginRight: scale(12),
  },
  historyInfo: {
    flex: 1,
  },
  historyPetName: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#1f2937',
  },
  historyType: {
    fontSize: moderateScale(12),
    color: '#6b7280',
    marginTop: verticalScale(2),
  },
  historyDate: {
    alignItems: 'flex-end',
  },
  historyDateText: {
    fontSize: moderateScale(12),
    color: '#6b7280',
    marginBottom: verticalScale(4),
  },
  completedIcon: {
    fontSize: moderateScale(16),
  },
});

export default AppointmentScreen;