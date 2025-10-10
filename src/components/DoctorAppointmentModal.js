import { Ionicons } from "@expo/vector-icons";
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
  PixelRatio,
} from "react-native";
import { Calendar } from "react-native-calendars";
import RazorpayCheckout from "react-native-razorpay";
import { AuthContext } from "../context/AuthContext";

const { width, height } = Dimensions.get("window");

// Enhanced responsive scaling functions
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 667) * size;
const moderateScale = (size, factor = 0.5) => 
  size + (scale(size) - size) * factor;

// Font scaling that respects accessibility settings
const fontScale = (size) => {
  const pixelRatio = PixelRatio.getFontScale();
  return Math.round(size * pixelRatio);
};

// Responsive font sizes
const FONT_SIZES = {
  tiny: moderateScale(10),
  small: moderateScale(12),
  medium: moderateScale(14),
  large: moderateScale(16),
  xlarge: moderateScale(18),
  xxlarge: moderateScale(20),
};

// Responsive spacing
const SPACING = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(12),
  lg: moderateScale(16),
  xl: moderateScale(20),
  xxl: moderateScale(24),
};

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

  const availableServices = [
    { id: 1, name: "General Consultation", price: 800, duration: 30 },
    { id: 2, name: "Vaccination", price: 1200, duration: 30 },
    { id: 3, name: "Dental Checkup", price: 1500, duration: 45 },
    { id: 4, name: "Grooming", price: 1000, duration: 60 },
  ];

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
    const slots = [];
    const startHour = 9;
    const endHour = 18;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString().padStart(2, "0")}`;
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
      return basePrice * 100;
    }

    const total = selectedServices.reduce(
      (sum, service) => sum + service.price,
      0
    );
    return total * 100;
  };

  const calculateDuration = () => {
    if (selectedServices.length === 0) return 60;

    const totalMinutes = selectedServices.reduce((sum, service) => {
      const serviceData = availableServices.find(
        (s) => s.id === service.service_id
      );
      return sum + (serviceData?.duration || 30);
    }, 0);

    return Math.max(30, totalMinutes);
  };

  const getEndTime = () => {
    if (!selectedTime) return null;

    const [hours, minutes] = selectedTime.value.split(":").map(Number);
    const duration = calculateDuration();

    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);

    const endDate = new Date(startDate.getTime() + duration * 60000);

    return endDate.toTimeString().slice(0, 5);
  };

  const initiateRazorpayPayment = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      Alert.alert(
        "Missing Information",
        "Please complete all appointment details before proceeding to payment."
      );
      return;
    }

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

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          "Appointment Confirmed!",
          data.message || "Booking successful",
          [
            {
              text: "Great!",
              onPress: onClose,
            },
          ]
        );
      } else {
        throw new Error(data.message || "Failed to book appointment");
      }
    } catch (error) {
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
              <Ionicons name="checkmark" size={scale(16)} color="#FFFFFF" />
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
          <Ionicons name="medkit-outline" size={scale(64)} color="#CBD5E1" />
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
                <Text style={styles.doctorName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.doctorSpecialty}>{item.specialty}</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={scale(14)} color="#F59E0B" />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                  <Text style={styles.ratingCount}>
                    ({item.user_ratings_total})
                  </Text>
                  <Text style={styles.experienceText}>• {item.experience}</Text>
                </View>
                <Text style={styles.doctorAddress} numberOfLines={2}>
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
          textDayFontSize: FONT_SIZES.medium,
          textMonthFontSize: FONT_SIZES.large,
          textDayHeaderFontSize: FONT_SIZES.medium,
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
        <Ionicons name="location" size={scale(20)} color="#0EA5E9" />
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
                adjustsFontSizeToFit
                numberOfLines={1}
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

      <ScrollView 
        style={styles.servicesContainer}
        showsVerticalScrollIndicator={false}
      >
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
                <Text style={styles.serviceName} numberOfLines={2}>
                  {service.name}
                </Text>
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
                    <Ionicons name="checkmark" size={scale(16)} color="#FFFFFF" />
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
          <Ionicons name="arrow-forward" size={scale(20)} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderPayment = () => (
    <ScrollView 
      style={styles.stepContent}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.paymentScrollContent}
    >
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
            <Text style={styles.summaryDoctorName} numberOfLines={2}>
              {selectedDoctor?.name}
            </Text>
            <Text style={styles.summarySpecialty}>Veterinary Clinic</Text>
            <View style={styles.summaryRating}>
              <Ionicons name="star" size={scale(14)} color="#F59E0B" />
              <Text style={styles.summaryRatingText}>
                {selectedDoctor?.rating}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.summaryDetails}>
          <View style={styles.summaryRow}>
            <Ionicons name="calendar" size={scale(18)} color="#64748B" />
            <Text style={styles.summaryLabel}>Date</Text>
            <Text style={styles.summaryValue} numberOfLines={1}>
              {selectedDate}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Ionicons name="time" size={scale(18)} color="#64748B" />
            <Text style={styles.summaryLabel}>Time</Text>
            <Text style={styles.summaryValue} numberOfLines={1}>
              {selectedTime?.display}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Ionicons name="location" size={scale(18)} color="#64748B" />
            <Text style={styles.summaryLabel}>Location</Text>
            <Text style={styles.summaryValue} numberOfLines={2}>
              {selectedDoctor?.address}
            </Text>
          </View>

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
                    <Text style={styles.serviceSummaryName} numberOfLines={2}>
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
            <Ionicons name="pricetag" size={scale(18)} color="#64748B" />
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
            <Text style={styles.paymentMethodText} numberOfLines={2}>
              Credit/Debit Card, UPI, Net Banking
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={scale(20)} color="#64748B" />
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
              <Ionicons name="lock-closed" size={scale(20)} color="#FFFFFF" />
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
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={step > 1 ? () => setStep(step - 1) : onClose}
              style={styles.backButton}
            >
              <Ionicons
                name={step > 1 ? "arrow-back" : "close"}
                size={scale(24)}
                color="#0F172A"
              />
            </TouchableOpacity>
            <Text style={styles.modalTitle} numberOfLines={1}>
              Book Clinic Appointment
            </Text>
            <View style={styles.placeholder} />
          </View>

          {renderStepIndicator()}
          {renderStepLabels()}

          <View style={styles.stepContainer}>
            {step === 1 && renderDoctorSelection()}
            {step === 2 && renderDateSelection()}
            {step === 3 && renderTimeSelection()}
            {step === 4 && renderServiceSelection()}
            {step === 5 && renderPayment()}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    height: height * 0.95,
    paddingBottom: SPACING.lg,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backButton: {
    padding: SPACING.xs,
    minWidth: scale(32),
    minHeight: scale(32),
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
  placeholder: {
    width: scale(32),
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepCircle: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
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
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
  },
  stepTextActive: {
    color: "#FFFFFF",
  },
  stepTextInactive: {
    color: "#64748B",
  },
  stepLine: {
    width: width < 360 ? scale(30) : scale(40),
    height: 2,
    marginHorizontal: SPACING.xs,
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
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  stepLabel: {
    fontSize: FONT_SIZES.small,
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
    paddingHorizontal: SPACING.lg,
  },
  stepTitle: {
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: SPACING.xs,
  },
  stepSubtitle: {
    fontSize: FONT_SIZES.medium,
    color: "#64748B",
    marginBottom: SPACING.lg,
    lineHeight: FONT_SIZES.medium * 1.5,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.xxl,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.large,
    color: "#64748B",
    marginTop: SPACING.md,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: FONT_SIZES.medium,
    color: "#94A3B8",
    marginTop: SPACING.xs,
    textAlign: "center",
  },
  doctorList: {
    paddingBottom: SPACING.lg,
  },
  doctorCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(16),
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: "#F1F5F9",
    alignItems: "flex-start",
    minHeight: scale(120),
  },
  doctorCardSelected: {
    borderColor: "#0EA5E9",
    backgroundColor: "#F0F9FF",
  },
  doctorAvatar: {
    marginRight: SPACING.md,
  },
  avatarGradient: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: FONT_SIZES.large,
    fontWeight: "600",
  },
  doctorInfo: {
    flex: 1,
    minWidth: 0,
  },
  doctorName: {
    fontSize: FONT_SIZES.large,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: SPACING.xs,
    flexWrap: "wrap",
  },
  doctorSpecialty: {
    fontSize: FONT_SIZES.medium,
    color: "#64748B",
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
    flexWrap: "wrap",
  },
  ratingText: {
    fontSize: FONT_SIZES.small,
    color: "#0F172A",
    fontWeight: "500",
    marginLeft: SPACING.xs,
    marginRight: SPACING.xs,
  },
  ratingCount: {
    fontSize: FONT_SIZES.small,
    color: "#64748B",
    marginRight: SPACING.sm,
  },
  experienceText: {
    fontSize: FONT_SIZES.small,
    color: "#64748B",
  },
  doctorAddress: {
    fontSize: FONT_SIZES.small,
    color: "#64748B",
    marginBottom: SPACING.xs,
    lineHeight: FONT_SIZES.small * 1.4,
  },
  availabilityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  availabilityDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    marginRight: SPACING.xs,
  },
  openDot: {
    backgroundColor: "#10B981",
  },
  closedDot: {
    backgroundColor: "#EF4444",
  },
  availabilityText: {
    fontSize: FONT_SIZES.small,
    color: "#64748B",
  },
  doctorMeta: {
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: SPACING.sm,
  },
  priceTag: {
    alignItems: "center",
  },
  priceText: {
    fontSize: FONT_SIZES.large,
    fontWeight: "700",
    color: "#059669",
  },
  priceSubtext: {
    fontSize: FONT_SIZES.tiny,
    color: "#64748B",
  },
  calendar: {
    borderRadius: moderateScale(16),
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
    padding: SPACING.md,
    borderRadius: moderateScale(12),
    marginBottom: SPACING.lg,
  },
  clinicAddress: {
    flex: 1,
    fontSize: FONT_SIZES.medium,
    color: "#0EA5E9",
    fontWeight: "500",
    marginLeft: SPACING.sm,
    lineHeight: FONT_SIZES.medium * 1.4,
  },
  timeSlotsContainer: {
    flex: 1,
  },
  timeSlotsTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: SPACING.md,
  },
  timeSlotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  timeSlot: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: moderateScale(12),
    borderWidth: 2,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    minWidth: width < 360 ? scale(85) : scale(95),
    alignItems: "center",
  },
  timeSlotSelected: {
    borderColor: "#0EA5E9",
    backgroundColor: "#0EA5E9",
  },
  timeText: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    color: "#64748B",
  },
  timeTextSelected: {
    color: "#FFFFFF",
  },
  bookingSummary: {
    backgroundColor: "#F8FAFC",
    borderRadius: moderateScale(16),
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  summaryHeader: {
    marginBottom: SPACING.lg,
  },
  summaryTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "600",
    color: "#0F172A",
  },
  doctorSummary: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  doctorAvatarSmall: {
    marginRight: SPACING.md,
  },
  avatarGradientSmall: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    justifyContent: "center",
    alignItems: "center",
  },
  avatarTextSmall: {
    color: "#FFFFFF",
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
  },
  doctorSummaryInfo: {
    flex: 1,
    minWidth: 0,
  },
  summaryDoctorName: {
    fontSize: FONT_SIZES.large,
    fontWeight: "600",
    color: "#0F172A",
    flexWrap: "wrap",
  },
  summarySpecialty: {
    fontSize: FONT_SIZES.medium,
    color: "#64748B",
    marginBottom: SPACING.xs,
  },
  summaryRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryRatingText: {
    fontSize: FONT_SIZES.small,
    color: "#64748B",
    marginLeft: SPACING.xs,
  },
  summaryDetails: {
    gap: SPACING.sm,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: scale(24),
  },
  summaryLabel: {
    flex: 1,
    fontSize: FONT_SIZES.medium,
    color: "#64748B",
    marginLeft: SPACING.sm,
  },
  summaryValue: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "500",
    color: "#0F172A",
    flex: 2,
    textAlign: "right",
    lineHeight: FONT_SIZES.medium * 1.4,
  },
  summaryPrice: {
    fontSize: FONT_SIZES.large,
    fontWeight: "700",
    color: "#059669",
  },
  paymentMethods: {
    marginBottom: SPACING.md,
  },
  paymentTitle: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: SPACING.sm,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(12),
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  paymentMethodLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },
  razorpayLogo: {
    backgroundColor: "#0EA5E9",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: moderateScale(6),
    marginRight: SPACING.md,
  },
  razorpayText: {
    color: "#FFFFFF",
    fontSize: FONT_SIZES.small,
    fontWeight: "700",
  },
  paymentMethodText: {
    fontSize: FONT_SIZES.medium,
    color: "#64748B",
    flex: 1,
    flexWrap: "wrap",
  },
  payButton: {
    borderRadius: moderateScale(16),
    overflow: "hidden",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: SPACING.md,
  },
  payButtonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
    minHeight: scale(56),
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: FONT_SIZES.large,
    fontWeight: "700",
  },
  cancelButton: {
    padding: SPACING.md,
    alignItems: "center",
    minHeight: scale(44),
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#64748B",
    fontSize: FONT_SIZES.large,
    fontWeight: "600",
  },
  servicesContainer: {
    flex: 1,
    marginBottom: SPACING.lg,
  },
  serviceCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: SPACING.lg,
    borderRadius: moderateScale(12),
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: "#F1F5F9",
    minHeight: scale(70),
  },
  serviceCardSelected: {
    borderColor: "#0EA5E9",
    backgroundColor: "#F0F9FF",
  },
  serviceInfo: {
    flex: 1,
    minWidth: 0,
    marginRight: SPACING.md,
  },
  serviceName: {
    fontSize: FONT_SIZES.large,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: SPACING.xs,
    flexWrap: "wrap",
  },
  serviceDuration: {
    fontSize: FONT_SIZES.small,
    color: "#64748B",
  },
  serviceRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  servicePrice: {
    fontSize: FONT_SIZES.large,
    fontWeight: "700",
    color: "#059669",
  },
  checkbox: {
    width: scale(24),
    height: scale(24),
    borderRadius: moderateScale(6),
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
    padding: SPACING.lg,
    borderRadius: moderateScale(12),
    marginTop: SPACING.sm,
  },
  noServicesText: {
    fontSize: FONT_SIZES.medium,
    color: "#92400E",
    textAlign: "center",
    lineHeight: FONT_SIZES.medium * 1.5,
  },
  servicesSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: SPACING.lg,
    borderRadius: moderateScale(12),
    marginBottom: SPACING.lg,
  },
  servicesSummaryText: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    color: "#0F172A",
  },
  servicesTotalText: {
    fontSize: FONT_SIZES.large,
    fontWeight: "700",
    color: "#059669",
  },
  continueButton: {
    borderRadius: moderateScale(16),
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
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
    minHeight: scale(56),
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: FONT_SIZES.large,
    fontWeight: "700",
  },
  servicesSummarySection: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  servicesSummaryTitle: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: SPACING.sm,
  },
  serviceSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.xs,
    minHeight: scale(20),
  },
  serviceSummaryName: {
    fontSize: FONT_SIZES.medium,
    color: "#64748B",
    flex: 1,
    marginRight: SPACING.sm,
    lineHeight: FONT_SIZES.medium * 1.4,
  },
  serviceSummaryPrice: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    color: "#059669",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: SPACING.md,
    marginTop: SPACING.sm,
  },
  paymentScrollContent: {
    paddingBottom: SPACING.xl,
  },

});

export default DoctorAppointmentModal;