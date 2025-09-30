// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useState } from 'react';
// import {
//   Alert,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

// const AppointmentScreen = ({ navigation }) => {
//   const [activeTab, setActiveTab] = useState('upcoming');

//   // Mock appointment data
//   const upcomingAppointments = [
//     {
//       id: 1,
//       petName: "Buddy",
//       petType: "Golden Retriever",
//       type: "Regular Checkup",
//       doctor: "Dr. Smith",
//       clinic: "Happy Paws Veterinary Clinic",
//       date: "Aug 31, 2025",
//       time: "2:30 PM",
//       status: "confirmed",
//       isUrgent: false,
//     },
//     {
//       id: 2,
//       petName: "Whiskers",
//       petType: "Persian Cat",
//       type: "Vaccination",
//       doctor: "Dr. Johnson",
//       clinic: "Pet Care Center",
//       date: "Sep 2, 2025",
//       time: "10:00 AM",
//       status: "pending",
//       isUrgent: true,
//     },
//     {
//       id: 3,
//       petName: "Charlie",
//       petType: "Beagle",
//       type: "Dental Cleaning",
//       doctor: "Dr. Williams",
//       clinic: "Animal Health Hospital",
//       date: "Sep 5, 2025",
//       time: "3:15 PM",
//       status: "confirmed",
//       isUrgent: false,
//     },
//   ];

//   const pastAppointments = [
//     {
//       id: 4,
//       petName: "Buddy",
//       petType: "Golden Retriever",
//       type: "Emergency Visit",
//       doctor: "Dr. Smith",
//       clinic: "Happy Paws Veterinary Clinic",
//       date: "Aug 15, 2025",
//       time: "11:30 AM",
//       status: "completed",
//     },
//     {
//       id: 5,
//       petName: "Whiskers",
//       petType: "Persian Cat",
//       type: "Regular Checkup",
//       doctor: "Dr. Johnson",
//       clinic: "Pet Care Center",
//       date: "Jul 22, 2025",
//       time: "9:00 AM",
//       status: "completed",
//     },
//     {
//       id: 6,
//       petName: "Charlie",
//       petType: "Beagle",
//       type: "Vaccination",
//       doctor: "Dr. Williams",
//       clinic: "Animal Health Hospital",
//       date: "Jun 10, 2025",
//       time: "2:00 PM",
//       status: "completed",
//     },
//   ];

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'confirmed': return '✅';
//       case 'pending': return '🕐';
//       case 'completed': return '✔️';
//       default: return '📅';
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'confirmed': return '#16a34a';
//       case 'pending': return '#f59e0b';
//       case 'completed': return '#6b7280';
//       default: return '#2563EB';
//     }
//   };

//   const renderUpcomingCard = (appointment) => (
//     <TouchableOpacity 
//       key={appointment.id} 
//       style={[
//         styles.appointmentCard,
//         appointment.isUrgent && styles.urgentCard
//       ]}
//       onPress={() => Alert.alert("Appointment Details", `View details for ${appointment.petName}'s appointment`)}
//     >
//       {appointment.isUrgent && (
//         <View style={styles.urgentBadge}>
//           <Text style={styles.urgentText}>🚨 Urgent</Text>
//         </View>
//       )}
      
//       <View style={styles.cardHeader}>
//         <View style={styles.petInfo}>
//           <Text style={styles.petName}>{appointment.petName}</Text>
//           <Text style={styles.petType}>{appointment.petType}</Text>
//         </View>
//         <View style={styles.statusContainer}>
//           <Text style={styles.statusIcon}>{getStatusIcon(appointment.status)}</Text>
//           <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>
//             {appointment.status}
//           </Text>
//         </View>
//       </View>

//       <View style={styles.appointmentDetails}>
//         <Text style={styles.appointmentType}>{appointment.type}</Text>
//         <Text style={styles.doctorName}>Dr. {appointment.doctor}</Text>
//         <Text style={styles.clinicName}>{appointment.clinic}</Text>
//       </View>

//       <View style={styles.dateTimeContainer}>
//         <View style={styles.dateTime}>
//           <Text style={styles.dateTimeIcon}>📅</Text>
//           <Text style={styles.dateTimeText}>{appointment.date}</Text>
//         </View>
//         <View style={styles.dateTime}>
//           <Text style={styles.dateTimeIcon}>🕐</Text>
//           <Text style={styles.dateTimeText}>{appointment.time}</Text>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );

//   const renderHistoryCard = (appointment) => (
//     <TouchableOpacity 
//       key={appointment.id} 
//       style={styles.historyCard}
//       onPress={() => Alert.alert("Past Appointment", `View details for ${appointment.petName}'s past visit`)}
//     >
//       <View style={styles.historyHeader}>
//         <Text style={styles.historyIcon}>📋</Text>
//         <View style={styles.historyInfo}>
//           <Text style={styles.historyPetName}>{appointment.petName}</Text>
//           <Text style={styles.historyType}>{appointment.type}</Text>
//         </View>
//         <View style={styles.historyDate}>
//           <Text style={styles.historyDateText}>{appointment.date}</Text>
//           <Text style={styles.completedIcon}>✔️</Text>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <LinearGradient
//         colors={['#dbeafe', '#e0e7ff']}
//         style={styles.backgroundGradient}
//       />
      
//       {/* Header */}
//       <LinearGradient
//         colors={['#2563EB', '#3b82f6']}
//         style={styles.header}
//       >
//         <View style={styles.headerContent}>
//           <TouchableOpacity 
//             style={styles.profileButton}
//             onPress={() => navigation.openDrawer()}
//             >
//             <View style={styles.profileAvatar}>
//               <Ionicons name="menu" size={scale(18)} color="#2563EB" />
//             </View>
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Appointments</Text>
//           <TouchableOpacity onPress={() => Alert.alert("Add Appointment", "Book a new appointment")}>
//             <Text style={styles.addButton}>+</Text>
//           </TouchableOpacity>
//         </View>
//       </LinearGradient>

//       {/* Tab Navigation */}
//       <View style={styles.tabContainer}>
//         <TouchableOpacity 
//           style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
//           onPress={() => setActiveTab('upcoming')}
//         >
//           <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
//             Upcoming
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity 
//           style={[styles.tab, activeTab === 'history' && styles.activeTab]}
//           onPress={() => setActiveTab('history')}
//         >
//           <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
//             History
//           </Text>
//         </TouchableOpacity>
//       </View>

//       <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
//         {activeTab === 'upcoming' ? (
//           <View>
//             <Text style={styles.sectionHeader}>Upcoming Appointments</Text>
//             {upcomingAppointments.map(renderUpcomingCard)}
//           </View>
//         ) : (
//           <View>
//             <Text style={styles.sectionHeader}>Appointment History</Text>
//             {pastAppointments.map(renderHistoryCard)}
//           </View>
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   backgroundGradient: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     top: 0,
//     bottom: 0,
//   },
//   header: {
//     paddingHorizontal: scale(20),
//    paddingVertical:verticalScale(5)
//   },
//   profileAvatar: {
//     width: scale(36),
//     height: scale(36),
//     borderRadius: scale(18),
//     backgroundColor: '#dbeafe',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#2563EB',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   backButton: {
//     fontSize: moderateScale(28),
//     color: '#fff',
//     fontWeight: '300',
//   },
//   headerTitle: {
//     fontSize: moderateScale(20),
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   addButton: {
//     fontSize: moderateScale(28),
//     color: '#fff',
//     fontWeight: '300',
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#fff',
//     marginHorizontal: scale(20),
//     marginTop: verticalScale(16),
//     borderRadius: scale(12),
//     padding: scale(4),
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: verticalScale(2) },
//     shadowOpacity: 0.05,
//     shadowRadius: scale(4),
//     elevation: 2,
//   },
//   tab: {
//     flex: 1,
//     paddingVertical: verticalScale(12),
//     alignItems: 'center',
//     borderRadius: scale(8),
//   },
//   activeTab: {
//     backgroundColor: '#2563EB',
//   },
//   tabText: {
//     fontSize: moderateScale(14),
//     fontWeight: '500',
//     color: '#6b7280',
//   },
//   activeTabText: {
//     color: '#fff',
//   },
//   content: {
//     flex: 1,
//     paddingHorizontal: scale(20),
//   },
//   sectionHeader: {
//     fontSize: moderateScale(18),
//     fontWeight: 'bold',
//     color: '#1f2937',
//     marginTop: verticalScale(24),
//     marginBottom: verticalScale(16),
//   },
//   appointmentCard: {
//     backgroundColor: '#fff',
//     borderRadius: scale(16),
//     padding: scale(20),
//     marginBottom: verticalScale(16),
//     borderWidth: 1,
//     borderColor: '#e5e7eb',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: verticalScale(2) },
//     shadowOpacity: 0.08,
//     shadowRadius: scale(8),
//     elevation: 4,
//   },
//   urgentCard: {
//     borderColor: '#f59e0b',
//     borderWidth: 2,
//     backgroundColor: '#fffbeb',
//   },
//   urgentBadge: {
//     position: 'absolute',
//     top: scale(-8),
//     right: scale(16),
//     backgroundColor: '#f59e0b',
//     paddingHorizontal: scale(12),
//     paddingVertical: verticalScale(4),
//     borderRadius: scale(12),
//   },
//   urgentText: {
//     fontSize: moderateScale(10),
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: verticalScale(12),
//   },
//   petInfo: {
//     flex: 1,
//   },
//   petName: {
//     fontSize: moderateScale(18),
//     fontWeight: 'bold',
//     color: '#1f2937',
//   },
//   petType: {
//     fontSize: moderateScale(12),
//     color: '#6b7280',
//     marginTop: verticalScale(2),
//   },
//   statusContainer: {
//     alignItems: 'center',
//   },
//   statusIcon: {
//     fontSize: moderateScale(16),
//   },
//   statusText: {
//     fontSize: moderateScale(10),
//     fontWeight: '500',
//     textTransform: 'capitalize',
//     marginTop: verticalScale(2),
//   },
//   appointmentDetails: {
//     marginBottom: verticalScale(16),
//   },
//   appointmentType: {
//     fontSize: moderateScale(16),
//     fontWeight: '600',
//     color: '#2563EB',
//     marginBottom: verticalScale(4),
//   },
//   doctorName: {
//     fontSize: moderateScale(14),
//     color: '#374151',
//     marginBottom: verticalScale(2),
//   },
//   clinicName: {
//     fontSize: moderateScale(12),
//     color: '#6b7280',
//   },
//   dateTimeContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   dateTime: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#dbeafe',
//     paddingHorizontal: scale(12),
//     paddingVertical: verticalScale(8),
//     borderRadius: scale(8),
//     flex: 0.48,
//   },
//   dateTimeIcon: {
//     fontSize: moderateScale(14),
//     marginRight: scale(6),
//   },
//   dateTimeText: {
//     fontSize: moderateScale(12),
//     color: '#1e40af',
//     fontWeight: '500',
//   },
//   historyCard: {
//     backgroundColor: '#fff',
//     borderRadius: scale(12),
//     padding: scale(16),
//     marginBottom: verticalScale(12),
//     borderWidth: 1,
//     borderColor: '#f3f4f6',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: verticalScale(1) },
//     shadowOpacity: 0.05,
//     shadowRadius: scale(4),
//     elevation: 2,
//   },
//   historyHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   historyIcon: {
//     fontSize: moderateScale(20),
//     marginRight: scale(12),
//   },
//   historyInfo: {
//     flex: 1,
//   },
//   historyPetName: {
//     fontSize: moderateScale(16),
//     fontWeight: '600',
//     color: '#1f2937',
//   },
//   historyType: {
//     fontSize: moderateScale(12),
//     color: '#6b7280',
//     marginTop: verticalScale(2),
//   },
//   historyDate: {
//     alignItems: 'flex-end',
//   },
//   historyDateText: {
//     fontSize: moderateScale(12),
//     color: '#6b7280',
//     marginBottom: verticalScale(4),
//   },
//   completedIcon: {
//     fontSize: moderateScale(16),
//   },
// });

// export default AppointmentScreen;







import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import {
  moderateScale,
  scale,
  ScaledSheet,
  verticalScale
} from 'react-native-size-matters';
import { useAuth } from '../context/AuthContext';

const { width: windowWidth, height } = Dimensions.get('window');

const colors = {
  primary: '#2563EB',
  secondary: '#4ECDC4',
  accent: '#FFD93D',
  background: '#F8F9FA',
  white: '#FFFFFF',
  black: '#2C3E50',
  darkGray: '#34495E',
  lightGray: '#ECF0F1',
  borderGray: '#BDC3C7',
  textGray: '#7F8C8D',
  success: '#2ECC71',
  error: '#E74C3C',
  rating: '#FFC107'
};

// Razorpay key (using test key; switch to live key for production)
const RAZORPAY_KEY_ID = 'rzp_test_1nhE9190sR3rkP';

const AppointmentScreen = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Calendar states
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const flatListRef = useRef(null);

  // Generate calendar days for specified month and year
  const generateCalendarDays = (month, year) => {
    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < todayMidnight;
      
      days.push({
        day,
        date,
        isToday,
        isPast,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }
    
    return days;
  };

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM', '06:00 PM'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Fetch doctors from API
  const fetchDoctors = async () => {
    try {
      setError(null);
      const response = await axios.get(`https://snoutiq.com/backend/api/nearby-vets?user_id=${user.id}`);
      
      if (response.data.status === 'success') {
        setDoctors(response.data.data);
      } else {
        setError('Failed to fetch doctors');
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Unable to load doctors. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDoctors();
  };

  // Create Razorpay order, converting amount from rupees to paise for backend
  const createRazorpayOrder = async (amountInRupees) => {
    try {
      const amountInPaise = parseFloat(amountInRupees) * 100; // Convert rupees to paise
      console.log('Creating Razorpay order with amount (paise):', amountInPaise);
      const response = await axios.post('https://snoutiq.com/backend/api/create-order', {
        amount: amountInPaise, // Send amount in paise to backend
        currency: 'INR'
      });

      console.log('Create order response:', response.data);

      if (response.data.success && response.data.order_id && response.data.key) {
        return {
          orderId: response.data.order_id,
          key: response.data.key
        };
      } else {
        throw new Error('Invalid order response from server');
      }
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      Alert.alert('Error', 'Failed to create payment order. Please try again.');
      return null;
    }
  };

  // Verify payment
  const verifyPayment = async (paymentData) => {
    try {
      const response = await axios.post('https://snoutiq.com/backend/api/rzp/verify', {
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_signature: paymentData.razorpay_signature
      });

      return response.data.success;
    } catch (error) {
      console.error('Payment verification failed:', error);
      return false;
    }
  };

  // Handle Razorpay payment
  const handleRazorpayPayment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select date and time before booking.');
      return;
    }

    setPaymentLoading(true);

    try {
      // 1. Create order from backend, passing amount in rupees
      console.log('Starting payment process for doctor:', selectedDoctor);
      const orderData = await createRazorpayOrder(selectedDoctor.chat_price);
      if (!orderData) {
        setPaymentLoading(false);
        return;
      }

      const { orderId, key } = orderData;

      // 2. Razorpay options, converting amount to paise for Razorpay SDK
      const options = {
        description: `Appointment with ${selectedDoctor.formatted_address ? selectedDoctor.formatted_address.split(',')[0] : 'Veterinary Clinic'}`,
        image: 'https://snoutiq.com/logo.webp',
        currency: 'INR',
        key: key,
        amount: parseFloat(selectedDoctor.chat_price) * 100, // Convert rupees to paise for Razorpay
        name: 'Snoutiq Veterinary Appointment',
        order_id: orderId,
        prefill: {
          email: user.email || 'patient@example.com',
          contact: user.phone || '9999999999',
          name: user.name || 'Patient Name',
        },
        theme: { color: colors.primary },
      };

      console.log('Razorpay Options:', JSON.stringify(options, null, 2));
      console.log('RazorpayCheckout:', RazorpayCheckout);

      // 3. Check if RazorpayCheckout is available
      if (!RazorpayCheckout || typeof RazorpayCheckout.open !== 'function') {
        throw new Error('RazorpayCheckout module is not initialized. Please check library installation.');
      }

      // 4. Open Razorpay checkout
      RazorpayCheckout.open(options)
        .then(async (paymentData) => {
          console.log('Payment Success:', paymentData);
          const isVerified = await verifyPayment(paymentData);
          
          if (isVerified) {
            await handlePaymentSuccess(paymentData);
          } else {
            throw new Error('Payment verification failed');
          }
        })
        .catch((error) => {
          setPaymentLoading(false);
          console.error('Payment error:', error);
          
          if (error.code !== 0) { // 0 means user cancelled
            Alert.alert(
              'Payment Failed',
              error.description || 'Payment was not completed. Please try again.',
              [{ text: 'OK' }]
            );
          }
        });
    } catch (error) {
      setPaymentLoading(false);
      console.error('Payment process error:', error);
      Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
    }
  };

  // Handle successful payment
  const handlePaymentSuccess = async (paymentData) => {
    try {
      // Convert selectedTime to 24-hour format and calculate end time
      const startTime = selectedTime;
      const [hours, minutes] = startTime.split(':').map(part => part.replace(/\D/g, ''));
      const isPM = startTime.includes('PM');
      let hour24 = parseInt(hours, 10);
      if (isPM && hour24 !== 12) hour24 += 12;
      if (!isPM && hour24 === 12) hour24 = 0;
      
      // Calculate end time (assuming 1-hour appointment)
      const endHour24 = hour24 + 1;
      const endTime = `${endHour24.toString().padStart(2, '0')}:${minutes}`;
      
      // Format date as YYYY-MM-DD HH:MM:SS
      const appointmentDateTime = `${selectedDate.date.toISOString().split('T')[0]} ${startTime.replace(/\s(AM|PM)/, '')}:00`;

      // Prepare services array, ensuring price is in rupees
      const services = [
        {
          service_id: "12313", // Placeholder: Replace with actual service ID
          price: parseFloat(selectedDoctor.chat_price) // Price in rupees for backend
        }
      ];

      // Save appointment to backend
      const appointmentResponse = await axios.post('https://snoutiq.com/backend/api/store_booking', {
        customer_type: "k", // Placeholder: Replace with actual customer type
        customer_id: user.id.toString(),
        customer_pet_id: "12334", // Placeholder: Replace with actual pet ID
        date: appointmentDateTime,
        start_time: startTime.replace(/\s(AM|PM)/, ''),
        user_id: user.id.toString(),
        end_time: endTime,
        services: services,
        groomer_employees_id: selectedDoctor.id.toString()
      });

      if (appointmentResponse.data.message === 'Booking booked successfully!') {
        Alert.alert(
          'Appointment Booked!', 
          `Your appointment with ${selectedDoctor.formatted_address ? selectedDoctor.formatted_address.split(',')[0] : 'Veterinary Clinic'} has been scheduled for ${selectedDate.date.toDateString()} at ${selectedTime}`,
          [
            {
              text: 'OK',
              onPress: () => {
                setModalVisible(false);
                setSelectedDate(null);
                setSelectedTime(null);
                setSelectedDoctor(null);
                setPaymentLoading(false);
              }
            }
          ]
        );
      } else {
        throw new Error('Failed to save appointment');
      }
    } catch (error) {
      console.error('Error saving appointment:', error);
      Alert.alert(
        'Payment Successful but Appointment Failed',
        'Your payment was successful but we encountered an issue saving your appointment. Please contact support.',
        [
          {
            text: 'OK',
            onPress: () => {
              setModalVisible(false);
              setPaymentLoading(false);
            }
          }
        ]
      );
    }
  };

  // Modal handlers
  const handleBookAppointment = (doctor) => {
    setSelectedDoctor(doctor);
    setModalVisible(true);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleDateSelect = (dayData) => {
    if (dayData && !dayData.isPast) {
      setSelectedDate(dayData);
      setSelectedTime(null); // Reset time when date changes
    }
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleConfirmBooking = () => {
    if (selectedDate && selectedTime && selectedDoctor) {
      handleRazorpayPayment();
    }
  };

  // Get first photo from photos array
  const getFirstPhoto = (photosString) => {
    try {
      if (!photosString) return null;
      const photos = JSON.parse(photosString);
      return photos && photos.length > 0 ? photos[0].photo_reference : null;
    } catch (error) {
      return null;
    }
  };

  // Format distance
  const formatDistance = (distance) => {
    if (!distance) return 'Distance not available';
    return `${distance.toFixed(1)} km away`;
  };

  // Handle phone call
  const handleCall = (mobile) => {
    if (mobile && mobile !== 'N/A') {
      Linking.openURL(`tel:${mobile}`);
    } else {
      Alert.alert('Phone Not Available', 'No phone number available for this doctor.');
    }
  };

  // Handle email
  const handleEmail = (email) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };

  // Render doctor card
  const renderDoctorCard = ({ item }) => {
    const firstPhoto = getFirstPhoto(item.photos);
    const isOpen = item.open_now === 1;
    
    return (
      <View style={styles.doctorCard}>
        <View style={styles.cardHeader}>
          <View style={styles.doctorImageContainer}>
            {firstPhoto ? (
              <Image 
                source={{ uri: 'https://static.vecteezy.com/system/resources/previews/026/375/249/non_2x/ai-generative-portrait-of-confident-male-doctor-in-white-coat-and-stethoscope-standing-with-arms-crossed-and-looking-at-camera-photo.jpg' }} 
                style={styles.doctorImage}
              />
            ) : (
              <View style={styles.defaultImageContainer}>
                <Text style={styles.defaultImageText}>👨‍⚕️</Text>
              </View>
            )}
          </View>
          
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName} numberOfLines={2}>
              {item.formatted_address ? item.formatted_address.split(',')[0] : 'Veterinary Clinic'}
            </Text>
            <Text style={styles.doctorEmail} numberOfLines={1}>
              {item.email}
            </Text>
            <Text style={styles.doctorPhone}>
              📞 {item.mobile}
            </Text>
            
            {/* Rating */}
            {item.rating && (
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingText}>⭐ {item.rating}</Text>
                <Text style={styles.reviewCount}>({item.user_ratings_total} reviews)</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📍 Location:</Text>
            <Text style={styles.detailValue} numberOfLines={2}>
              {item.city}, {item.pincode}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📏 Distance:</Text>
            <Text style={styles.detailValue}>
              {formatDistance(item.distance)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>💰 Appointment Price:</Text>
            <Text style={styles.priceText}>
              ₹{parseFloat(item.chat_price).toFixed(2)} {/* Ensure display in rupees */}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🏥 Status:</Text>
            <View style={[styles.statusBadge, isOpen ? styles.openBadge : styles.closedBadge]}>
              <Text style={[styles.statusText, isOpen ? styles.openText : styles.closedText]}>
                {isOpen ? 'OPEN' : 'CLOSED'}
              </Text>
            </View>
          </View>

          {item.bio && item.bio !== 'na' && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>ℹ️ Bio:</Text>
              <Text style={styles.detailValue}>
                {item.bio}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleCall(item.mobile)}
          >
            <Text style={styles.actionButtonText}>📞 Call</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleEmail(item.email)}
          >
            <Text style={styles.actionButtonText}>✉️ Email</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => handleBookAppointment(item)}
          >
            <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
              📅 Book Appointment
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading available doctors...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchDoctors}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Available Doctors</Text>
        <Text style={styles.headerSubtitle}>
          {doctors.length} veterinarians near you
        </Text>
      </View>

      <FlatList
        data={doctors}
        renderItem={renderDoctorCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No doctors available at the moment</Text>
          </View>
        }
      />

      {/* Booking Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Appointment</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
                disabled={paymentLoading}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Doctor Info */}
            {selectedDoctor && (
              <View style={styles.modalDoctorInfo}>
                <Text style={styles.modalDoctorName}>
                  {selectedDoctor.formatted_address ? selectedDoctor.formatted_address.split(',')[0] : 'Veterinary Clinic'}
                </Text>
                <Text style={styles.modalDoctorDetails}>
                  {selectedDoctor.email} • ₹{parseFloat(selectedDoctor.chat_price).toFixed(2)} {/* Ensure display in rupees */}
                </Text>
              </View>
            )}

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Calendar Section */}
              <View style={styles.calendarSection}>
                <FlatList
                  ref={flatListRef}
                  data={[0, 1, 2]}
                  renderItem={({ item: index }) => {
                    const monthOffset = index - 1;
                    let displayMonth = currentMonth + monthOffset;
                    let displayYear = currentYear;
                    if (displayMonth < 0) {
                      displayMonth += 12;
                      displayYear -= 1;
                    } else if (displayMonth >= 12) {
                      displayMonth -= 12;
                      displayYear += 1;
                    }
                    const monthName = new Date(displayYear, displayMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                    const days = generateCalendarDays(displayMonth, displayYear);
                    return (
                      <View style={{ width: windowWidth, paddingHorizontal: scale(20), alignItems: 'center' }}>
                        <Text style={styles.sectionTitle}>{monthName}</Text>
                        <View style={styles.weekDaysContainer}>
                          {weekDays.map((day) => (
                            <Text key={day} style={styles.weekDayText}>{day}</Text>
                          ))}
                        </View>
                        <View style={styles.calendarGrid}>
                          {days.map((dayData, idx) => (
                            <TouchableOpacity
                              key={idx}
                              style={[
                                styles.dayButton,
                                (!dayData || dayData?.isPast) && styles.pastDay,
                                dayData?.isToday && styles.today,
                                selectedDate &&
                                selectedDate.date.getDate() === dayData?.day &&
                                selectedDate.date.getMonth() === displayMonth &&
                                selectedDate.date.getFullYear() === displayYear &&
                                styles.selectedDay,
                              ]}
                              onPress={() => handleDateSelect(dayData)}
                              disabled={!dayData || dayData.isPast || paymentLoading}
                            >
                              {dayData && (
                                <>
                                  <Text
                                    style={[
                                      styles.dayText,
                                      dayData.isPast && styles.pastDayText,
                                      dayData.isToday && styles.todayText,
                                      selectedDate &&
                                      selectedDate.date.getDate() === dayData.day &&
                                      selectedDate.date.getMonth() === displayMonth &&
                                      selectedDate.date.getFullYear() === displayYear &&
                                      styles.selectedDayText,
                                    ]}
                                  >
                                    {dayData.day}
                                  </Text>
                                  <Text
                                    style={[
                                      styles.dayNameText,
                                      dayData.isPast && styles.pastDayText,
                                      selectedDate &&
                                      selectedDate.date.getDate() === dayData.day &&
                                      selectedDate.date.getMonth() === displayMonth &&
                                      selectedDate.date.getFullYear() === displayYear &&
                                      styles.selectedDayText,
                                    ]}
                                  >
                                    {dayData.dayName}
                                  </Text>
                                </>
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    );
                  }}
                  horizontal={true}
                  pagingEnabled={true}
                  showsHorizontalScrollIndicator={false}
                  initialScrollIndex={1}
                  getItemLayout={(data, index) => ({
                    length: windowWidth,
                    offset: windowWidth * index,
                    index,
                  })}
                  viewabilityConfig={{
                    itemVisiblePercentThreshold: 50,
                  }}
                  onViewableItemsChanged={({ viewableItems }) => {
                    if (viewableItems.length > 0) {
                      const newIndex = viewableItems[0].index;
                      if (newIndex !== 1) {
                        const offset = newIndex - 1;
                        setCurrentMonth((prevMonth) => {
                          let newMonth = prevMonth + offset;
                          let newYear = currentYear;
                          while (newMonth < 0) {
                            newMonth += 12;
                            newYear -= 1;
                          }
                          while (newMonth >= 12) {
                            newMonth -= 12;
                            newYear += 1;
                          }
                          setCurrentYear(newYear);
                          setTimeout(() => {
                            flatListRef.current?.scrollToIndex({ index: 1, animated: false });
                          }, 0);
                          return newMonth;
                        });
                      }
                    }
                  }}
                  keyExtractor={(item) => item.toString()}
                  style={{ marginHorizontal: -scale(20) }}
                />
              </View>

              {/* Time Selection */}
              {selectedDate && (
                <View style={styles.timeSection}>
                  <Text style={styles.sectionTitle}>
                    Available Times - {selectedDate.date.toDateString()}
                  </Text>
                  <View style={styles.timeSlotsContainer}>
                    {timeSlots.map((time) => (
                      <TouchableOpacity
                        key={time}
                        style={[
                          styles.timeSlot,
                          selectedTime === time && styles.selectedTimeSlot,
                        ]}
                        onPress={() => handleTimeSelect(time)}
                        disabled={paymentLoading}
                      >
                        <Text style={[
                          styles.timeSlotText,
                          selectedTime === time && styles.selectedTimeSlotText,
                        ]}>
                          {time}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Book Button */}
            {selectedDate && selectedTime && (
              <View style={styles.bookButtonContainer}>
                <TouchableOpacity
                  style={[styles.bookButton, paymentLoading && styles.bookButtonDisabled]}
                  onPress={handleConfirmBooking}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.bookButtonText}>
                      Pay ₹{parseFloat(selectedDoctor?.chat_price).toFixed(2)} & Confirm Appointment {/* Ensure display in rupees */}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(20),
    borderBottomLeftRadius: moderateScale(20),
    borderBottomRightRadius: moderateScale(20),
  },
  headerTitle: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: moderateScale(14),
    color: colors.white,
    textAlign: 'center',
    marginTop: verticalScale(5),
    opacity: 0.9,
  },
  listContainer: {
    padding: scale(16),
    paddingBottom: verticalScale(100),
  },
  doctorCard: {
    backgroundColor: colors.white,
    borderRadius: moderateScale(15),
    marginBottom: verticalScale(16),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    padding: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  doctorImageContainer: {
    marginRight: scale(12),
  },
  doctorImage: {
    width: scale(60),
    height: scale(60),
    borderRadius: moderateScale(30),
  },
  defaultImageContainer: {
    width: scale(60),
    height: scale(60),
    borderRadius: moderateScale(30),
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultImageText: {
    fontSize: moderateScale(24),
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: colors.darkGray,
    marginBottom: verticalScale(4),
  },
  doctorEmail: {
    fontSize: moderateScale(12),
    color: colors.textGray,
    marginBottom: verticalScale(4),
  },
  doctorPhone: {
    fontSize: moderateScale(12),
    color: colors.darkGray,
    marginBottom: verticalScale(4),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: moderateScale(12),
    color: colors.rating,
    fontWeight: 'bold',
    marginRight: scale(4),
  },
  reviewCount: {
    fontSize: moderateScale(10),
    color: colors.textGray,
  },
  cardBody: {
    padding: scale(16),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(8),
    flexWrap: 'wrap',
  },
  detailLabel: {
    fontSize: moderateScale(12),
    fontWeight: 'bold',
    color: colors.darkGray,
    marginRight: scale(8),
    minWidth: scale(80),
  },
  detailValue: {
    fontSize: moderateScale(12),
    color: colors.textGray,
    flex: 1,
  },
  priceText: {
    fontSize: moderateScale(12),
    color: colors.success,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(10),
  },
  openBadge: {
    backgroundColor: colors.success,
  },
  closedBadge: {
    backgroundColor: colors.error,
  },
  statusText: {
    fontSize: moderateScale(10),
    fontWeight: 'bold',
  },
  openText: {
    color: colors.white,
  },
  closedText: {
    color: colors.white,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: scale(16),
    backgroundColor: colors.lightGray,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.white,
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(12),
    borderRadius: moderateScale(8),
    marginHorizontal: scale(4),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderGray,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionButtonText: {
    fontSize: moderateScale(10),
    color: colors.darkGray,
    fontWeight: 'bold',
  },
  primaryButtonText: {
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: verticalScale(16),
    fontSize: moderateScale(16),
    color: colors.textGray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
  },
  errorText: {
    fontSize: moderateScale(16),
    color: colors.error,
    textAlign: 'center',
    marginBottom: verticalScale(20),
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(8),
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: moderateScale(14),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(50),
  },
  emptyText: {
    fontSize: moderateScale(16),
    color: colors.textGray,
    textAlign: 'center',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    height: height * 0.8,
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    paddingTop: verticalScale(10),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(15),
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  modalTitle: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: colors.darkGray,
  },
  closeButton: {
    padding: scale(5),
  },
  closeButtonText: {
    fontSize: moderateScale(20),
    color: colors.textGray,
    fontWeight: 'bold',
  },
  modalDoctorInfo: {
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(10),
    backgroundColor: colors.lightGray,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },
  modalDoctorName: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: colors.darkGray,
  },
  modalDoctorDetails: {
    fontSize: moderateScale(12),
    color: colors.textGray,
    marginTop: verticalScale(2),
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: scale(20),
  },
  
  // Calendar Styles
  calendarSection: {
    marginVertical: verticalScale(20),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: colors.darkGray,
    marginBottom: verticalScale(15),
    textAlign: 'center',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: verticalScale(10),
  },
  weekDayText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: colors.textGray,
    textAlign: 'center',
    flex: 1,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayButton: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: verticalScale(2),
    borderRadius: moderateScale(8),
  },
  dayText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: colors.darkGray,
  },
  dayNameText: {
    fontSize: moderateScale(10),
    color: colors.textGray,
    marginTop: verticalScale(2),
  },
  pastDay: {
    opacity: 0.3,
  },
  pastDayText: {
    color: colors.textGray,
  },
  today: {
    backgroundColor: '#E3F2FD',
  },
  todayText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  selectedDay: {
    backgroundColor: colors.primary,
  },
  selectedDayText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  
  // Time Selection Styles
  timeSection: {
    marginBottom: verticalScale(20),
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(10),
  },
  timeSlot: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(20),
    borderWidth: 1,
    borderColor: colors.borderGray,
    backgroundColor: colors.lightGray,
    minWidth: '30%',
    alignItems: 'center',
  },
  selectedTimeSlot: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeSlotText: {
    fontSize: moderateScale(14),
    color: colors.darkGray,
  },
  selectedTimeSlotText: {
    color: colors.white,
    fontWeight: '600',
  },

  // Book Button Styles
  bookButtonContainer: {
    padding: scale(20),
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  bookButton: {
    backgroundColor: colors.primary,
    paddingVertical: verticalScale(15),
    borderRadius: moderateScale(10),
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: colors.borderGray,
  },
  bookButtonText: {
    color: colors.white,
    fontSize: moderateScale(18),
    fontWeight: 'bold',
  },
});

export default AppointmentScreen;