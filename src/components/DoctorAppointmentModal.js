import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import RazorpayCheckout from "react-native-razorpay";
import { moderateScale, verticalScale } from "react-native-size-matters";
import { AuthContext } from "../context/AuthContext";

const { width, height } = Dimensions.get("window");
const RAZORPAY_KEY_ID = "rzp_test_1nhE9190sR3rkP";

const DoctorAppointmentModal = ({ visible, onClose, onBook }) => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const { nearbyDoctors, fetchNearbyDoctors, user, token } =
    useContext(AuthContext);
  // console.log(nearbyDoctors );

  // Available services with their prices
  const availableServices = [
    { id: 1, name: "General Consultation", price: 800, duration: 30 },
    { id: 2, name: "Vaccination", price: 1200, duration: 30 },
    { id: 3, name: "Dental Checkup", price: 1500, duration: 45 },
    { id: 4, name: "Grooming", price: 1000, duration: 60 },
  ];

  // Process doctor data from your API response
  const processedDoctors =
    nearbyDoctors?.map((doctor) => ({
      id: doctor.id,
      name: doctor.vet_name || doctor.name || "Veterinary Clinic",
      specialty: "Veterinary Doctor",
      rating: parseFloat(doctor.rating) || 4.8,
      experience: "5+ years",
      address: doctor.vet_address || doctor.formatted_address || doctor.address,
      mobile: doctor.mobile,
      email: doctor.email,
      chat_price: doctor.chat_price || "500.00",
      open_now: doctor.open_now,
      user_ratings_total: doctor.user_ratings_total || 0,
      photos: doctor.photos ? JSON.parse(doctor.photos) : [],
    })) || [];

  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedServices([]);
    setStep(1);
    setAvailableTimes([]);
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setStep(2);
  };

  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
    generateTimeSlots(day.dateString);
    setStep(3);
  };

  const generateTimeSlots = (date) => {
    const today = new Date();
    const selected = new Date(date);

    // Generate time slots from 9 AM to 6 PM
    const slots = [];
    const startHour = 9;
    const endHour = 18;

    for (let hour = startHour; hour < endHour; hour++) {
      // Add slots at 30-minute intervals
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        const displayTime = `${hour % 12 || 12}:${
          minute === 0 ? "00" : minute
        } ${hour < 12 ? "AM" : "PM"}`;
        slots.push({
          value: timeString,
          display: displayTime,
        });
      }
    }

    setAvailableTimes(slots);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setStep(4);
  };

  const handleServiceToggle = (service) => {
    setSelectedServices((prev) => {
      const isSelected = prev.find((s) => s.service_id === service.id);
      if (isSelected) {
        return prev.filter((s) => s.service_id !== service.id);
      } else {
        return [
          ...prev,
          {
            service_id: service.id,
            price: service.price,
          },
        ];
      }
    });
  };

  const calculateTotalAmount = () => {
    if (selectedServices.length === 0) {
      const basePrice = selectedDoctor
        ? parseFloat(selectedDoctor.chat_price) || 500
        : 500;
      return basePrice * 100; // Convert to paise for Razorpay
    }

    const total = selectedServices.reduce(
      (sum, service) => sum + service.price,
      0
    );
    return total * 100; // Convert to paise for Razorpay
  };

  const calculateDuration = () => {
    if (selectedServices.length === 0) return 60; // Default 1 hour

    const totalMinutes = selectedServices.reduce((sum, service) => {
      const serviceData = availableServices.find(
        (s) => s.id === service.service_id
      );
      return sum + (serviceData?.duration || 30);
    }, 0);

    return Math.max(30, totalMinutes); // Minimum 30 minutes
  };

  const getEndTime = () => {
    if (!selectedTime) return null;

    const [hours, minutes] = selectedTime.value.split(":").map(Number);
    const duration = calculateDuration();

    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);

    const endDate = new Date(startDate.getTime() + duration * 60000);

    return endDate.toTimeString().slice(0, 5); // Returns "HH:MM" format
  };

  // Send appointment data to backend
  const sendAppointmentToBackend = async (appointmentData) => {
    try {
      console.log("Sending appointment to backend:", appointmentData);
      console.log("Using token:", token);

      const response = await fetch(
        "https://snoutiq.com/backend/api/doctor/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(appointmentData),
        }
      );

      console.log("Backend response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend error response:", errorText);
        throw new Error(`Failed to save appointment: ${response.status}`);
      }

      const result = await response.json();
      console.log("Backend success response:", result);
      return result;
    } catch (error) {
      console.error("Error sending appointment to backend:", error);
      throw error;
    }
  };

  const initiateRazorpayPayment = () => {
    // Check if we have all required data
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      Alert.alert(
        "Missing Information",
        "Please complete all appointment details before proceeding to payment."
      );
      return;
    }

    // Check if user data is available
    if (!user) {
      Alert.alert(
        "Authentication Required",
        "Please log in to book an appointment."
      );
      return;
    }

    const amount = calculateTotalAmount();
    const options = {
      description: `Clinic Consultation with ${
        selectedDoctor?.name || "Veterinarian"
      }`,
      image: "https://via.placeholder.com/100",
      currency: "INR",
      key: RAZORPAY_KEY_ID,
      amount: amount,
      name: "SnoutIQ",
      prefill: {
        email: user?.email || "user@example.com",
        contact: user?.phone || user?.mobile || "9999999999",
        name: user?.name || "Pet Owner",
      },
      theme: { color: "#0EA5E9" },
      modal: {
        ondismiss: () => {
          console.log("Payment modal dismissed");
        },
      },
    };

    setLoading(true);

    RazorpayCheckout.open(options)
      .then((data) => {
        setLoading(false);
        handlePaymentSuccess(data);
      })
      .catch((error) => {
        setLoading(false);
        handlePaymentFailure(error);
      });
  };

const handlePaymentSuccess = async (paymentData) => {
  try {
    setLoading(true);

    if (!selectedDoctor) {
      throw new Error("Doctor information not found");
    }

    // Prepare appointment data according to your API
    const appointmentData = {
      customer_id: user?.id || user?.user_id,
      date: selectedDate,
      start_time: selectedTime.value + ":00",
      end_time: getEndTime() + ":00",
      services:
        selectedServices.length > 0
          ? selectedServices
          : [
              {
                service_id: 1,
                price: parseFloat(selectedDoctor?.chat_price) || 500,
              },
            ],
      vet_id: selectedDoctor.id,
      user_id: user?.id || user?.user_id,
      total_amount: (calculateTotalAmount() / 100).toString(),
      payment_id: paymentData.razorpay_payment_id,
      payment_status: "completed",
    };

    console.log("Final appointment data:", appointmentData);

    // Send appointment to backend
    const response = await fetch(
      "https://snoutiq.com/backend/api/doctor/bookings",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // if required
        },
        body: JSON.stringify(appointmentData),
      }
    );

    const data = await response.json();

    console.log("Backend response status:", response.status);
    console.log("Backend success response:", data);

    if (response.ok) {
      Alert.alert(
        "🎉 Appointment Confirmed!",
        data.message || "Booking successful",
        [
          {
            text: "Great!",
            onPress: onClose, // Close the modal when user taps "Great!"
          },
        ]
      );
    } else {
      throw new Error(data.message || "Failed to book appointment");
    }
  } catch (error) {
    console.error("Error in payment success handling:", error);
    Alert.alert(
      "Booking Issue",
      error.message || "Something went wrong",
      [{ text: "OK", onPress: onClose }]
    );
  } finally {
    setLoading(false);
  }
};

  const handlePaymentFailure = (error) => {
    console.log("Payment error:", error);
    Alert.alert(
      "Payment Failed",
      "We couldn't process your payment. Please try again or use a different payment method.",
      [
        {
          text: "Try Again",
          onPress: () => initiateRazorpayPayment(),
        },
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setStep(4),
        },
      ]
    );
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4, 5].map((stepNumber) => (
        <View key={stepNumber} style={styles.stepRow}>
          <View
            style={[
              styles.stepCircle,
              step >= stepNumber
                ? styles.stepCircleActive
                : styles.stepCircleInactive,
            ]}
          >
            {step > stepNumber ? (
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            ) : (
              <Text
                style={[
                  styles.stepText,
                  step >= stepNumber
                    ? styles.stepTextActive
                    : styles.stepTextInactive,
                ]}
              >
                {stepNumber}
              </Text>
            )}
          </View>
          {stepNumber < 5 && (
            <View
              style={[
                styles.stepLine,
                step > stepNumber
                  ? styles.stepLineActive
                  : styles.stepLineInactive,
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderStepLabels = () => (
    <View style={styles.stepLabels}>
      <Text style={[styles.stepLabel, step >= 1 && styles.stepLabelActive]}>
        Doctor
      </Text>
      <Text style={[styles.stepLabel, step >= 2 && styles.stepLabelActive]}>
        Date
      </Text>
      <Text style={[styles.stepLabel, step >= 3 && styles.stepLabelActive]}>
        Time
      </Text>
      <Text style={[styles.stepLabel, step >= 4 && styles.stepLabelActive]}>
        Services
      </Text>
      <Text style={[styles.stepLabel, step >= 5 && styles.stepLabelActive]}>
        Confirm
      </Text>
    </View>
  );

  const renderDoctorSelection = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Veterinarian</Text>
      <Text style={styles.stepSubtitle}>Choose your preferred clinic</Text>

      {processedDoctors.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="medkit-outline" size={64} color="#CBD5E1" />
          <Text style={styles.emptyStateText}>No veterinarians available</Text>
          <Text style={styles.emptyStateSubtext}>Please try again later</Text>
        </View>
      ) : (
        <FlatList
          data={processedDoctors}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.doctorList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.doctorCard,
                selectedDoctor?.id === item.id && styles.doctorCardSelected,
              ]}
              onPress={() => handleDoctorSelect(item)}
            >
              <View style={styles.doctorAvatar}>
                <LinearGradient
                  colors={["#0EA5E9", "#0284C7"]}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>
                    {item.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </Text>
                </LinearGradient>
              </View>

              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{item.name}</Text>
                <Text style={styles.doctorSpecialty}>{item.specialty}</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                  <Text style={styles.ratingCount}>
                    ({item.user_ratings_total})
                  </Text>
                  <Text style={styles.experienceText}>• {item.experience}</Text>
                </View>
                <Text style={styles.doctorAddress} numberOfLines={1}>
                  {item.address}
                </Text>
                <View style={styles.availabilityContainer}>
                  <View
                    style={[
                      styles.availabilityDot,
                      item.open_now ? styles.openDot : styles.closedDot,
                    ]}
                  />
                  <Text style={styles.availabilityText}>
                    {item.open_now ? "Open Now" : "Currently Closed"}
                  </Text>
                </View>
              </View>

              <View style={styles.doctorMeta}>
                <View style={styles.priceTag}>
                  <Text style={styles.priceText}>₹{item.chat_price}</Text>
                  <Text style={styles.priceSubtext}>Consultation</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );

  const renderDateSelection = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Date</Text>
      <Text style={styles.stepSubtitle}>
        Choose your preferred date for clinic visit
      </Text>

      <Calendar
        onDayPress={handleDateSelect}
        minDate={new Date().toISOString().split("T")[0]}
        markedDates={
          selectedDate
            ? {
                [selectedDate]: {
                  selected: true,
                  selectedColor: "#0EA5E9",
                  selectedTextColor: "#FFFFFF",
                },
              }
            : {}
        }
        theme={{
          backgroundColor: "#ffffff",
          calendarBackground: "#ffffff",
          textSectionTitleColor: "#0EA5E9",
          selectedDayBackgroundColor: "#0EA5E9",
          selectedDayTextColor: "#ffffff",
          todayTextColor: "#0EA5E9",
          dayTextColor: "#2d4150",
          textDisabledColor: "#d9e1e8",
          dotColor: "#00adf5",
          selectedDotColor: "#ffffff",
          arrowColor: "#0EA5E9",
          monthTextColor: "#0EA5E9",
          indicatorColor: "blue",
          textDayFontWeight: "500",
          textMonthFontWeight: "bold",
          textDayHeaderFontWeight: "500",
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 14,
        }}
        style={styles.calendar}
      />
    </View>
  );

  const renderTimeSelection = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Time</Text>
      <Text style={styles.stepSubtitle}>Choose your preferred time slot</Text>

      <View style={styles.clinicInfo}>
        <Ionicons name="location" size={20} color="#0EA5E9" />
        <Text style={styles.clinicAddress} numberOfLines={2}>
          {selectedDoctor?.address}
        </Text>
      </View>

      <ScrollView
        style={styles.timeSlotsContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.timeSlotsTitle}>Available Time Slots</Text>
        <View style={styles.timeSlotsGrid}>
          {availableTimes.map((time) => (
            <TouchableOpacity
              key={time.value}
              style={[
                styles.timeSlot,
                selectedTime?.value === time.value && styles.timeSlotSelected,
              ]}
              onPress={() => handleTimeSelect(time)}
            >
              <Text
                style={[
                  styles.timeText,
                  selectedTime?.value === time.value && styles.timeTextSelected,
                ]}
              >
                {time.display}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderServiceSelection = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Services</Text>
      <Text style={styles.stepSubtitle}>
        Choose the services you need (optional)
      </Text>

      <ScrollView style={styles.servicesContainer}>
        {availableServices.map((service) => {
          const isSelected = selectedServices.find(
            (s) => s.service_id === service.id
          );

          return (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceCard,
                isSelected && styles.serviceCardSelected,
              ]}
              onPress={() => handleServiceToggle(service)}
            >
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDuration}>
                  {service.duration} mins
                </Text>
              </View>

              <View style={styles.serviceRight}>
                <Text style={styles.servicePrice}>₹{service.price}</Text>
                <View
                  style={[
                    styles.checkbox,
                    isSelected && styles.checkboxSelected,
                  ]}
                >
                  {isSelected && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {selectedServices.length === 0 && (
          <View style={styles.noServicesNote}>
            <Text style={styles.noServicesText}>
              No services selected. Basic consultation fee will be applied.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.servicesSummary}>
        <Text style={styles.servicesSummaryText}>
          Selected Services: {selectedServices.length}
        </Text>
        <Text style={styles.servicesTotalText}>
          Total: ₹{calculateTotalAmount() / 100}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => setStep(5)}
        disabled={!selectedTime}
      >
        <LinearGradient
          colors={["#0EA5E9", "#0284C7"]}
          style={styles.continueButtonGradient}
        >
          <Text style={styles.continueButtonText}>Continue to Payment</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderPayment = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Confirm Booking</Text>
      <Text style={styles.stepSubtitle}>
        Review and complete your clinic appointment
      </Text>

      <View style={styles.bookingSummary}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Appointment Details</Text>
        </View>

        <View style={styles.doctorSummary}>
          <View style={styles.doctorAvatarSmall}>
            <LinearGradient
              colors={["#0EA5E9", "#0284C7"]}
              style={styles.avatarGradientSmall}
            >
              <Text style={styles.avatarTextSmall}>
                {selectedDoctor?.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </Text>
            </LinearGradient>
          </View>
          <View style={styles.doctorSummaryInfo}>
            <Text style={styles.summaryDoctorName}>{selectedDoctor?.name}</Text>
            <Text style={styles.summarySpecialty}>Veterinary Clinic</Text>
            <View style={styles.summaryRating}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.summaryRatingText}>
                {selectedDoctor?.rating}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.summaryDetails}>
          <View style={styles.summaryRow}>
            <Ionicons name="calendar" size={18} color="#64748B" />
            <Text style={styles.summaryLabel}>Date</Text>
            <Text style={styles.summaryValue}>{selectedDate}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Ionicons name="time" size={18} color="#64748B" />
            <Text style={styles.summaryLabel}>Time</Text>
            <Text style={styles.summaryValue}>{selectedTime?.display}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Ionicons name="location" size={18} color="#64748B" />
            <Text style={styles.summaryLabel}>Location</Text>
            <Text style={styles.summaryValue} numberOfLines={2}>
              {selectedDoctor?.address}
            </Text>
          </View>

          {/* Selected Services */}
          {selectedServices.length > 0 && (
            <View style={styles.servicesSummarySection}>
              <Text style={styles.servicesSummaryTitle}>
                Selected Services:
              </Text>
              {selectedServices.map((service, index) => {
                const serviceInfo = availableServices.find(
                  (s) => s.id === service.service_id
                );
                return (
                  <View key={index} style={styles.serviceSummaryRow}>
                    <Text style={styles.serviceSummaryName}>
                      • {serviceInfo?.name}
                    </Text>
                    <Text style={styles.serviceSummaryPrice}>
                      ₹{service.price}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Ionicons name="pricetag" size={18} color="#64748B" />
            <Text style={styles.summaryLabel}>Total Amount</Text>
            <Text style={styles.summaryPrice}>
              ₹{calculateTotalAmount() / 100}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.paymentMethods}>
        <Text style={styles.paymentTitle}>Payment Method</Text>
        <TouchableOpacity style={styles.paymentMethod}>
          <View style={styles.paymentMethodLeft}>
            <View style={styles.razorpayLogo}>
              <Text style={styles.razorpayText}>Razorpay</Text>
            </View>
            <Text style={styles.paymentMethodText}>
              Credit/Debit Card, UPI, Net Banking
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.payButton}
        onPress={initiateRazorpayPayment}
        disabled={loading}
      >
        <LinearGradient
          colors={["#10B981", "#059669"]}
          style={styles.payButtonGradient}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="lock-closed" size={20} color="#FFFFFF" />
              <Text style={styles.payButtonText}>
                Pay ₹{calculateTotalAmount() / 100}
              </Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={onClose}
        disabled={loading}
      >
        <Text style={styles.cancelButtonText}>Cancel Booking</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <BlurView intensity={20} tint="dark" style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={step > 1 ? () => setStep(step - 1) : onClose}
              style={styles.backButton}
            >
              <Ionicons
                name={step > 1 ? "arrow-back" : "close"}
                size={24}
                color="#0F172A"
              />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Book Clinic Appointment</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Step Indicator */}
          {renderStepIndicator()}
          {renderStepLabels()}

          {/* Step Content */}
          <View style={styles.stepContainer}>
            {step === 1 && renderDoctorSelection()}
            {step === 2 && renderDateSelection()}
            {step === 3 && renderTimeSelection()}
            {step === 4 && renderServiceSelection()}
            {step === 5 && renderPayment()}
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

// ... (keep your existing styles exactly the same)
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.95,
    paddingBottom: verticalScale(20),
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backButton: {
    padding: moderateScale(4),
  },
  closeButton: {
    padding: moderateScale(4),
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    flex: 1,
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: moderateScale(20),
    marginTop: verticalScale(16),
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepCircle: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleActive: {
    backgroundColor: "#0EA5E9",
  },
  stepCircleInactive: {
    backgroundColor: "#E2E8F0",
  },
  stepText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
  stepTextActive: {
    color: "#FFFFFF",
  },
  stepTextInactive: {
    color: "#64748B",
  },
  stepLine: {
    width: moderateScale(40),
    height: 2,
    marginHorizontal: moderateScale(4),
  },
  stepLineActive: {
    backgroundColor: "#0EA5E9",
  },
  stepLineInactive: {
    backgroundColor: "#E2E8F0",
  },
  stepLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: moderateScale(20),
    marginTop: verticalScale(8),
    marginBottom: verticalScale(20),
  },
  stepLabel: {
    fontSize: moderateScale(12),
    color: "#94A3B8",
    fontWeight: "500",
  },
  stepLabelActive: {
    color: "#0EA5E9",
  },
  stepContainer: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: moderateScale(20),
  },
  stepTitle: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: verticalScale(4),
  },
  stepSubtitle: {
    fontSize: moderateScale(14),
    color: "#64748B",
    marginBottom: verticalScale(20),
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: moderateScale(16),
    color: "#64748B",
    marginTop: verticalScale(12),
    fontWeight: "600",
  },
  emptyStateSubtext: {
    fontSize: moderateScale(14),
    color: "#94A3B8",
    marginTop: verticalScale(4),
  },
  doctorList: {
    paddingBottom: verticalScale(20),
  },
  doctorCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: moderateScale(16),
    marginBottom: verticalScale(12),
    borderWidth: 2,
    borderColor: "#F1F5F9",
    alignItems: "center",
  },
  doctorCardSelected: {
    borderColor: "#0EA5E9",
    backgroundColor: "#F0F9FF",
  },
  doctorAvatar: {
    marginRight: moderateScale(12),
  },
  avatarGradient: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: moderateScale(16),
    fontWeight: "600",
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: verticalScale(2),
  },
  doctorSpecialty: {
    fontSize: moderateScale(14),
    color: "#64748B",
    marginBottom: verticalScale(4),
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(4),
  },
  ratingText: {
    fontSize: moderateScale(12),
    color: "#0F172A",
    fontWeight: "500",
    marginLeft: moderateScale(4),
    marginRight: moderateScale(4),
  },
  ratingCount: {
    fontSize: moderateScale(12),
    color: "#64748B",
    marginRight: moderateScale(8),
  },
  experienceText: {
    fontSize: moderateScale(12),
    color: "#64748B",
  },
  doctorAddress: {
    fontSize: moderateScale(12),
    color: "#64748B",
    marginBottom: verticalScale(4),
  },
  availabilityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: moderateScale(6),
  },
  openDot: {
    backgroundColor: "#10B981",
  },
  closedDot: {
    backgroundColor: "#EF4444",
  },
  availabilityText: {
    fontSize: moderateScale(12),
    color: "#64748B",
  },
  doctorMeta: {
    alignItems: "flex-end",
  },
  priceTag: {
    alignItems: "center",
  },
  priceText: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#059669",
  },
  priceSubtext: {
    fontSize: moderateScale(10),
    color: "#64748B",
  },
  calendar: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  clinicInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    padding: moderateScale(12),
    borderRadius: 12,
    marginBottom: verticalScale(20),
  },
  clinicAddress: {
    flex: 1,
    fontSize: moderateScale(14),
    color: "#0EA5E9",
    fontWeight: "500",
    marginLeft: moderateScale(8),
  },
  timeSlotsContainer: {
    flex: 1,
  },
  timeSlotsTitle: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: verticalScale(12),
  },
  timeSlotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: moderateScale(8),
  },
  timeSlot: {
    paddingVertical: verticalScale(12),
    paddingHorizontal: moderateScale(16),
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    minWidth: moderateScale(90),
    alignItems: "center",
  },
  timeSlotSelected: {
    borderColor: "#0EA5E9",
    backgroundColor: "#0EA5E9",
  },
  timeText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#64748B",
  },
  timeTextSelected: {
    color: "#FFFFFF",
  },
  bookingSummary: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: moderateScale(8),
    marginBottom: verticalScale(20),
  },
  summaryHeader: {
    marginBottom: verticalScale(16),
  },
  summaryTitle: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: "#0F172A",
  },
  doctorSummary: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },
  doctorAvatarSmall: {
    marginRight: moderateScale(12),
  },
  avatarGradientSmall: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarTextSmall: {
    color: "#FFFFFF",
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
  doctorSummaryInfo: {
    flex: 1,
  },
  summaryDoctorName: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: "#0F172A",
  },
  summarySpecialty: {
    fontSize: moderateScale(14),
    color: "#64748B",
    marginBottom: verticalScale(4),
  },
  summaryRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryRatingText: {
    fontSize: moderateScale(12),
    color: "#64748B",
    marginLeft: moderateScale(4),
  },
  summaryDetails: {
    gap: verticalScale(6),
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  summaryLabel: {
    flex: 1,
    fontSize: moderateScale(14),
    color: "#64748B",
    marginLeft: moderateScale(8),
  },
  summaryValue: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: "#0F172A",
    flex: 2,
    textAlign: "right",
  },
  summaryPrice: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#059669",
  },
  paymentMethods: {
    marginBottom: verticalScale(8),
  },
  paymentTitle: {
    fontSize: moderateScale(8),
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: verticalScale(6),
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: moderateScale(16),
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  paymentMethodLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  razorpayLogo: {
    backgroundColor: "#0EA5E9",
    paddingHorizontal: moderateScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: 6,
    marginRight: moderateScale(12),
  },
  razorpayText: {
    color: "#FFFFFF",
    fontSize: moderateScale(12),
    fontWeight: "700",
  },
  paymentMethodText: {
    fontSize: moderateScale(14),
    color: "#64748B",
  },
  payButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: verticalScale(12),
  },
  payButtonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: verticalScale(16),
    gap: moderateScale(8),
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(16),
    fontWeight: "700",
  },
  cancelButton: {
    padding: verticalScale(8),
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#64748B",
    fontSize: moderateScale(16),
    fontWeight: "600",
  },
  placeholder: {
    width: 24, // Same as back button for balance
  },
  servicesContainer: {
    flex: 1,
    marginBottom: verticalScale(16),
  },
  serviceCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: moderateScale(16),
    borderRadius: 12,
    marginBottom: verticalScale(8),
    borderWidth: 2,
    borderColor: "#F1F5F9",
  },
  serviceCardSelected: {
    borderColor: "#0EA5E9",
    backgroundColor: "#F0F9FF",
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: verticalScale(4),
  },
  serviceDuration: {
    fontSize: moderateScale(12),
    color: "#64748B",
  },
  serviceRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(12),
  },
  servicePrice: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#059669",
  },
  checkbox: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#0EA5E9",
    borderColor: "#0EA5E9",
  },
  noServicesNote: {
    backgroundColor: "#FEF3C7",
    padding: moderateScale(16),
    borderRadius: 12,
    marginTop: verticalScale(8),
  },
  noServicesText: {
    fontSize: moderateScale(14),
    color: "#92400E",
    textAlign: "center",
  },
  servicesSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: moderateScale(16),
    borderRadius: 12,
    marginBottom: verticalScale(16),
  },
  servicesSummaryText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#0F172A",
  },
  servicesTotalText: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#059669",
  },
  continueButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: verticalScale(16),
    gap: moderateScale(8),
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(16),
    fontWeight: "700",
  },
  servicesSummarySection: {
    marginTop: verticalScale(8),
    paddingTop: verticalScale(8),
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  servicesSummaryTitle: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: verticalScale(8),
  },
  serviceSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(4),
  },
  serviceSummaryName: {
    fontSize: moderateScale(14),
    color: "#64748B",
    flex: 1,
  },
  serviceSummaryPrice: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#059669",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: verticalScale(12),
    marginTop: verticalScale(8),
  },
});

export default DoctorAppointmentModal;
