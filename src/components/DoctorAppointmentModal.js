import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  PixelRatio,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import RazorpayCheckout from "react-native-razorpay";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

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
const API_BASE_URL = "https://snoutiq.com/backend/api";

const DoctorAppointmentModal = ({ visible, onClose, onBook }) => {
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [clinicDoctors, setClinicDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorAvailability, setDoctorAvailability] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pets, setPets] = useState([]);
  const [summary, setSummary] = useState("");
  const [selectedPet, setSelectedPet] = useState(null);

  const { nearbyDoctors, user, token } = useContext(AuthContext);

  const availableServices = [
    { id: 1, name: "General Consultation", price: 800, duration: 30 },
    { id: 2, name: "Vaccination", price: 1200, duration: 30 },
    { id: 3, name: "Dental Checkup", price: 1500, duration: 45 },
    { id: 4, name: "Grooming", price: 1000, duration: 60 },
  ];

 const fetchPets = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://snoutiq.com/backend/api/users/${user.id}/pets`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          timeout: 5000,
        }
      );

      if (
        response.data.status === "success" &&
        Array.isArray(response.data.data)
      ) {
        const transformedPets = response.data.data.map((pet) => ({
          id: pet.id,
          name: pet.name || "Unknown Pet",
          age: pet.pet_age || 0,
          gender: pet.pet_gender || "",
          breed: pet.breed || "Pet",
          avatar: pet.pet_doc1,
          petType: pet.breed?.toLowerCase().includes("cat") ? "cat" : "dog",
          weight: pet.weight || "",
        }));

        setPets(transformedPets);

        // ✅ Automatically select first pet if none selected
        if (transformedPets.length > 0 && !selectedPet) {
          setSelectedPet(transformedPets[0]);
        }
      } else {
        setPets([]);
      }
    } catch (error) {
      console.error("Error fetching pets:", error);
      setPets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchAISummary = async () => {
    setLoading(true); // optional: show loader while fetching
    try {
      const response = await axios.get(
        `https://snoutiq.com/backend/api/ai/summary?user_id=${user.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        }
      );

      if (response.data?.success) {
        // Data exists, update state
        setSummary(response.data.summary || "No summary available");
      } else {
        setSummary("No summary available");
      }
    } catch (error) {
      setSummary("Failed to load summary");
    } finally {
      setLoading(false);
    }
  };

  // useEffect
  useEffect(() => {
    fetchAISummary();
  }, []);

  // Process nearby doctors as clinics
  const processedClinics =
    nearbyDoctors?.map((clinic) => ({
      id: clinic.id,
      name: clinic.vet_name || clinic.name || "Veterinary Clinic",
      rating: parseFloat(clinic.rating) || 4.8,
      address: clinic.vet_address || clinic.formatted_address || clinic.address,
      mobile: clinic.mobile,
      email: clinic.email,
      open_now: clinic.open_now,
      user_ratings_total: clinic.user_ratings_total || 0,
      photos: clinic.photos ? JSON.parse(clinic.photos) : [],
    })) || [];

  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setSelectedClinic(null);
    setClinicDoctors([]);
    setSelectedDoctor(null);
    setDoctorAvailability([]);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedServices([]);
    setStep(1);
    setAvailableTimes([]);
  };

const handleClinicSelect = async (clinic) => {
  setSelectedClinic(clinic);
  setLoading(true); // show loader immediately

  // 🕒 Give React time to render loader
  await new Promise((resolve) => setTimeout(resolve, 80));

  try {
    const response = await fetch(`${API_BASE_URL}/clinics/${clinic.id}/doctors`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const rawText = await response.text();
    let cleaned = rawText.trim();
    const firstBrace = Math.min(
      cleaned.indexOf("{") === -1 ? Infinity : cleaned.indexOf("{"),
      cleaned.indexOf("[") === -1 ? Infinity : cleaned.indexOf("[")
    );
    if (firstBrace > 0) cleaned = cleaned.slice(firstBrace);

    let data;
    try {
      data = JSON.parse(cleaned);
    } catch (parseError) {
      Alert.alert("Error", "Server returned invalid data");
      return;
    }

    if (response.ok && data.doctors) {
      setClinicDoctors(data.doctors);
      // ✅ Move to next step only after doctors set
      setStep(2);
    } else {
      console.warn("Unexpected API data:", data);
      Alert.alert("Error", "Failed to fetch clinic doctors");
    }
  } catch (error) {
    console.error("Error fetching doctors:", error);
    Alert.alert("Error", "Failed to load doctors for this clinic");
  } finally {
    setLoading(false);
  }
};


 

  // Step 2: Select Doctor

  const handleDoctorSelect = async (doctor) => {
    setSelectedDoctor(doctor);
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/clinics/${selectedClinic.id}/availability`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const rawText = await response.text();

      let data;
      try {
        data = JSON.parse(rawText.trim());
      } catch (parseError) {
        console.error("Invalid JSON:", parseError, rawText);
        Alert.alert("Error", "Invalid JSON from server");
        return;
      }

      if (response.ok && data.availability) {
        // Filter availability for selected doctor (video only)
        const doctorAvail = data.availability.filter(
          (avail) =>
            avail.doctor_id === doctor.id && avail.service_type === "video"
        );

        setDoctorAvailability(doctorAvail);
        setStep(3);
      } else {
        console.warn("Unexpected data format:", data);
        Alert.alert("Error", "Failed to fetch doctor availability");
      }
    } catch (error) {
      console.error("Error fetching doctor availability:", error);
      Alert.alert("Error", "Failed to load doctor availability");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Select Date
  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
    setStep(4);
  };

  // Step 4: Fetch available slots
  // const fetchFreeSlots = async () => {
  //   if (!selectedDate || !selectedDoctor) return;

  //   setLoading(true);

  //   try {
  //     const response = await fetch(
  //       `${API_BASE_URL}/doctors/${selectedDoctor.id}/free-slots?date=${selectedDate}&service_type=video`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     const rawText = await response.text();
  //     console.log("Raw slot response:", rawText);

  //     let data;
  //     try {
  //       data = JSON.parse(rawText.trim());
  //     } catch (e) {
  //       console.error("Invalid JSON in slot response:", e);
  //       Alert.alert("Error", "Invalid response from server");
  //       return;
  //     }

  //     console.log("Parsed slot data:", data);

  //     if (response.ok && data.success && data.free_slots) {
  //       const slots = data.free_slots.map((timeString) => {
  //         const [hours, minutes] = timeString.split(":");
  //         const hour = parseInt(hours, 10);
  //         const displayTime = `${hour % 12 || 12}:${minutes} ${hour < 12 ? "AM" : "PM"}`;

  //         return { value: timeString, display: displayTime };
  //       });

  //       setAvailableTimes(slots);
  //     } else {
  //       Alert.alert("No Slots Available", "No free slots for selected date");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching slots:", error);
  //     Alert.alert("Error", "Failed to load available time slots");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  
  const fetchFreeSlots = async () => {
    if (!selectedDate || !selectedDoctor) return;

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/doctors/${selectedDoctor.id}/free-slots?date=${selectedDate}&service_type=video`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const rawText = await response.text();

      let data;
      try {
        data = JSON.parse(rawText.trim());
      } catch (e) {
        console.error("Invalid JSON in slot response:", e);
        Alert.alert("Error", "Invalid response from server");
        return;
      }


      // ✅ Add mock slots if API returned none
      if (data.free_slots && data.free_slots.length === 0) {
        data.free_slots = ["09:00", "10:30", "12:00"]; // mock data for testing
      }

      if (response.ok && data.success && data.free_slots) {
        const slots = data.free_slots.map((timeString) => {
          const [hours, minutes] = timeString.split(":");
          const hour = parseInt(hours, 10);
          const displayTime = `${hour % 12 || 12}:${minutes} ${
            hour < 12 ? "AM" : "PM"
          }`;

          return { value: timeString, display: displayTime };
        });

        setAvailableTimes(slots);
      } else {
        Alert.alert("No Slots Available", "No free slots for selected date");
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      Alert.alert("Error", "Failed to load available time slots");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === 4 && selectedDate && selectedDoctor) {
      fetchFreeSlots();
    }
  }, [step, selectedDate, selectedDoctor]);

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setStep(5);
  };

  // Step 5: Service Selection
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
      return 80000; 
    }

    const total = selectedServices.reduce(
      (sum, service) => sum + service.price,
      0
    );
    return total * 100;
  };

  const calculateDuration = () => {
    if (selectedServices.length === 0) return 20;

    const totalMinutes = selectedServices.reduce((sum, service) => {
      const serviceData = availableServices.find(
        (s) => s.id === service.service_id
      );
      return sum + (serviceData?.duration || 30);
    }, 0);

    return Math.max(20, totalMinutes);
  };

  const getEndTime = () => {
    if (!selectedTime) return null;

    const [hours, minutes, seconds] = selectedTime.value.split(":").map(Number);
    const duration = calculateDuration();

    const startDate = new Date();
    startDate.setHours(hours, minutes, seconds || 0, 0);

    const endDate = new Date(startDate.getTime() + duration * 60000);

    const endHours = endDate.getHours().toString().padStart(2, "0");
    const endMinutes = endDate.getMinutes().toString().padStart(2, "0");
    const endSeconds = endDate.getSeconds().toString().padStart(2, "0");

    return `${endHours}:${endMinutes}:${endSeconds}`;
  };

  const initiateRazorpayPayment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      Alert.alert(
        "Missing Information",
        "Please complete all appointment details before proceeding."
      );
      console.warn("❌ Missing doctor/date/time before payment");
      return;
    }

    if (!user) {
      Alert.alert(
        "Authentication Required",
        "Please log in to book an appointment."
      );
      console.warn("❌ User not authenticated before payment");
      return;
    }

    if (!selectedPet) {
      Alert.alert(
        "Select Pet",
        "Please select a pet before booking an appointment."
      );
      console.warn("❌ Pet not selected");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create booking
      const bookingData = {
        user_id: user.id,
        clinic_id: selectedClinic?.id,
        doctor_id: selectedDoctor?.id,
        service_type: "video",
        scheduled_date: selectedDate,
        scheduled_time: selectedTime.value,
        pet_id: selectedPet.id,
        urgency: "medium",
        ai_summary: (summary || "Video consultation booking").replace(
          /\n/g,
          " "
        ),
        ai_urgency_score: 0.45,
        symptoms: ["consultation"],
        latitude: 28.4949,
        longitude: 77.0868,
        address: selectedClinic?.address || "Clinic Address",
      };

      const createResponse = await fetch(`${API_BASE_URL}/bookings/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      // Get response text and clean it
      let rawText = await createResponse.text();

      // Clean the response: trim whitespace and remove BOM
      rawText = rawText.trim().replace(/^\uFEFF/, "");

      // Extract JSON if response contains non-JSON prefix/suffix
      const jsonMatch = rawText.match(/({.*}|\[.*\])/);
      if (jsonMatch) {
        rawText = jsonMatch[0];
      } else if (!rawText.startsWith("{") && !rawText.startsWith("[")) {
        console.error("❌ Response is not valid JSON:", rawText);
        throw new Error("Booking API returned non-JSON response");
      }

      let createData;
      try {
        createData = JSON.parse(rawText);
      } catch (err) {
        console.error(
          "❌ Failed to parse booking JSON:",
          err,
          "Raw text:",
          rawText
        );
        throw new Error("Booking API returned invalid JSON");
      }

      if (!createResponse.ok || !createData.success) {
        throw new Error(createData.message || "Failed to create booking");
      }

      const { booking_id, payment } = createData;

      if (!booking_id || !payment || !payment.order_id) {
        throw new Error("Booking created but payment info missing");
      }

      const options = {
        description: `Video Consultation with ${selectedDoctor.name}`,
        image: "https://via.placeholder.com/100",
        currency: payment.currency,
        key: payment.key,
        amount: payment.order.amount,
        order_id: payment.order_id,
        name: "SnoutIQ",
        prefill: {
          email: user.email || "user@example.com",
          contact: user.phone || "9999999999",
          name: user.name || "Pet Owner",
        },
        theme: { color: "#0EA5E9" },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      // Step 3: Open Razorpay
      RazorpayCheckout.open(options)
        .then((paymentData) => {
          handlePaymentSuccess(paymentData, booking_id);
        })
        .catch((error) => {
          console.error("❌ Razorpay payment failed:", error);
          handlePaymentFailure(error);
        });
    } catch (error) {
      console.error("❌ Booking creation failed:", error);
      Alert.alert("Booking Error", error.message || "Failed to create booking");
      setLoading(false);
    }
  };

const handlePaymentSuccess = async (paymentData, booking_id) => {
  try {
    setLoading(true);

    // Prepare verification payload
    const verifyPaymentData = {
      razorpay_order_id: paymentData.razorpay_order_id,
      razorpay_payment_id: paymentData.razorpay_payment_id,
      razorpay_signature: paymentData.razorpay_signature,
    };

    // Call verification API
    const verifyResponse = await fetch(
      `${API_BASE_URL}/bookings/${booking_id}/verify-payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(verifyPaymentData),
      }
    );

    // Read raw text
    const verifyRawText = await verifyResponse.text();

    // Clean and extract JSON safely
    let cleaned = verifyRawText.trim().replace(/^\uFEFF/, "");
    const jsonMatch = cleaned.match(/({.*}|\[.*\])/s); 
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    } else {
      console.error("❌ Verify response is not JSON:", cleaned);
      throw new Error("Payment verification returned invalid JSON");
    }

    // Parse JSON
    let verifyData;
    try {
      verifyData = JSON.parse(cleaned);
    } catch (err) {
      console.error("❌ Failed to parse payment verification JSON:", err, cleaned);
      throw new Error("Invalid JSON from payment verification");
    }

    // Check verification result
    if (!verifyResponse.ok || !verifyData.success) {
      throw new Error(verifyData.message || "Payment verification failed");
    }

    // Success alert
    Alert.alert(
      "🎉 Appointment Confirmed!",
      "Your video consultation has been booked successfully. You will receive a confirmation shortly.",
      [
        {
          text: "Great!",
          onPress: () => {
            onClose?.();
            onBook?.(); // Make sure this navigates correctly
        if (navigation.canGoBack()) navigation.pop(3);
          },
        },
      ]
    );

  } catch (error) {
    console.error("❌ Payment Verification Error:", error);
    Alert.alert(
      "Payment Verification Issue",
      "Payment was successful but verification failed. Please contact support with your booking ID: " + booking_id,
      [
        {
          text: "OK",
          onPress: () => {
            onClose?.();
            onBook?.(); // fallback navigation
             if (navigation.canGoBack()) navigation.pop(3);
          },
        },
      ]
    );
  } finally {
    setLoading(false);
  }
};

  const handlePaymentFailure = (error) => {
    console.error("❌ Payment failed:", error);

    let errorMessage = "The payment was cancelled or failed. Please try again.";

    if (error.description) {
      errorMessage = error.description;
    } else if (error.code === 2) {
      errorMessage = "Network error. Please check your internet connection.";
    } else if (error.code === 4) {
      errorMessage = "Payment processing failed. Please try again.";
    } else if (error.code) {
      errorMessage = `Payment error: ${error.code}`;
    }

    Alert.alert("Payment Failed", errorMessage);
    setLoading(false);
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
              <Ionicons name="checkmark" size={scale(14)} color="#FFFFFF" />
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
        Clinic
      </Text>
      <Text style={[styles.stepLabel, step >= 2 && styles.stepLabelActive]}>
        Doctor
      </Text>
      <Text style={[styles.stepLabel, step >= 3 && styles.stepLabelActive]}>
        Date
      </Text>
      <Text style={[styles.stepLabel, step >= 4 && styles.stepLabelActive]}>
        Time
      </Text>
      {/* <Text style={[styles.stepLabel, step >= 5 && styles.stepLabelActive]}>
        Services
      </Text> */}
      <Text style={[styles.stepLabel, step >= 5 && styles.stepLabelActive]}>
        Pay
      </Text>
    </View>
  );

  const renderClinicSelection = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Clinic</Text>
      <Text style={styles.stepSubtitle}>Choose your preferred clinic</Text>

      {processedClinics.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="medical-outline" size={scale(64)} color="#CBD5E1" />
          <Text style={styles.emptyStateText}>No clinics available</Text>
          <Text style={styles.emptyStateSubtext}>Please try again later</Text>
        </View>
      ) : (
        <FlatList
          data={processedClinics}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.doctorList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.doctorCard,
                selectedClinic?.id === item.id && styles.doctorCardSelected,
              ]}
              onPress={() => handleClinicSelect(item)}
              disabled={loading}
            >
              <View style={styles.doctorAvatar}>
                <LinearGradient
                  colors={["#0EA5E9", "#0284C7"]}
                  style={styles.avatarGradient}
                >
                  <Ionicons name="medical" size={scale(24)} color="#FFFFFF" />
                </LinearGradient>
              </View>

              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName} numberOfLines={2}>
                  {item.name}
                </Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={scale(14)} color="#F59E0B" />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                  <Text style={styles.ratingCount}>
                    ({item.user_ratings_total})
                  </Text>
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
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );

  const renderDoctorSelection = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Doctor</Text>
      <Text style={styles.stepSubtitle}>
        Choose your preferred doctor at {selectedClinic?.name}
      </Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0EA5E9" />
          <Text style={styles.loadingText}>Loading ...</Text>
        </View>
      ) : clinicDoctors.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="person-outline" size={scale(64)} color="#CBD5E1" />
          <Text style={styles.emptyStateText}>No doctors available</Text>
          <Text style={styles.emptyStateSubtext}>
            Please try another clinic
          </Text>
        </View>
      ) : (
        <FlatList
          data={clinicDoctors}
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
              disabled={loading}
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
                      .toUpperCase()
                      .slice(0, 2)}
                  </Text>
                </LinearGradient>
              </View>

              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.doctorSpecialty}>Veterinary Doctor</Text>
                {item.email && (
                  <Text style={styles.doctorContact} numberOfLines={1}>
                    {item.email}
                  </Text>
                )}
                {item.phone && (
                  <Text style={styles.doctorContact}>{item.phone}</Text>
                )}
              </View>

              <Ionicons
                name="chevron-forward"
                size={scale(24)}
                color="#64748B"
              />
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
        Choose your preferred date for video consultation
      </Text>

      <View style={styles.doctorInfoBox}>
        <Text style={styles.infoBoxLabel}>Doctor:</Text>
        <Text style={styles.infoBoxValue}>{selectedDoctor?.name}</Text>
      </View>

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

      <View style={styles.doctorInfoBox}>
        <Text style={styles.infoBoxLabel}>Date:</Text>
        <Text style={styles.infoBoxValue}>{selectedDate}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0EA5E9" />
          <Text style={styles.loadingText}>Loading available slots...</Text>
        </View>
      ) : availableTimes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={scale(64)} color="#CBD5E1" />
          <Text style={styles.emptyStateText}>No slots available</Text>
          <Text style={styles.emptyStateSubtext}>Please try another date</Text>
        </View>
      ) : (
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
                    selectedTime?.value === time.value &&
                      styles.timeTextSelected,
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
      )}
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
                    <Ionicons
                      name="checkmark"
                      size={scale(16)}
                      color="#FFFFFF"
                    />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {selectedServices.length === 0 && (
          <View style={styles.noServicesNote}>
            <Text style={styles.noServicesText}>
              No services selected. Basic consultation fee (₹500) will be
              applied.
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
        onPress={() => setStep(6)}
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
        Review and complete your video consultation
      </Text>

      <View style={styles.bookingSummary}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Appointment Details</Text>
        </View>

        <View style={styles.clinicSummary}>
          <Ionicons name="medical" size={scale(24)} color="#0EA5E9" />
          <View style={styles.clinicSummaryInfo}>
            <Text style={styles.summaryLabel}>Clinic</Text>
            <Text style={styles.summaryClinicName} numberOfLines={2}>
              {selectedClinic?.name}
            </Text>
          </View>
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
                  .toUpperCase()
                  .slice(0, 2)}
              </Text>
            </LinearGradient>
          </View>
          <View style={styles.doctorSummaryInfo}>
            <Text style={styles.summaryDoctorName} numberOfLines={2}>
              {selectedDoctor?.name}
            </Text>
            <Text style={styles.summarySpecialty}>Video Consultation</Text>
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
                Pay
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
              Book Video Consultation
            </Text>
            <View style={styles.placeholder} />
          </View>

          {renderStepIndicator()}
          {renderStepLabels()}

          <View style={styles.stepContainer}>
            {step === 1 && renderClinicSelection()}
            {step === 2 && renderDoctorSelection()}
            {step === 3 && renderDateSelection()}
            {step === 4 && renderTimeSelection()}
            {/* {step === 5 && renderServiceSelection()} */}
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
    paddingHorizontal: SPACING.xs,
    marginTop: SPACING.lg,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepCircle: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
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
    fontSize: FONT_SIZES.small,
    fontWeight: "600",
  },
  stepTextActive: {
    color: "#FFFFFF",
  },
  stepTextInactive: {
    color: "#64748B",
  },
  stepLine: {
    width: width < 360 ? scale(20) : scale(30),
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
    justifyContent: "space-evenly",
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  stepLabel: {
    fontSize: FONT_SIZES.tiny,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.xxl,
  },
  loadingText: {
    fontSize: FONT_SIZES.medium,
    color: "#64748B",
    marginTop: SPACING.md,
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
    alignItems: "center",
    minHeight: scale(100),
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
  doctorContact: {
    fontSize: FONT_SIZES.small,
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
  doctorInfoBox: {
    backgroundColor: "#F0F9FF",
    padding: SPACING.md,
    borderRadius: moderateScale(12),
    marginBottom: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
  },
  infoBoxLabel: {
    fontSize: FONT_SIZES.medium,
    color: "#64748B",
    fontWeight: "600",
    marginRight: SPACING.sm,
  },
  infoBoxValue: {
    fontSize: FONT_SIZES.medium,
    color: "#0EA5E9",
    fontWeight: "600",
    flex: 1,
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
  clinicSummary: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  clinicSummaryInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  summaryClinicName: {
    fontSize: FONT_SIZES.large,
    fontWeight: "600",
    color: "#0F172A",
    marginTop: SPACING.xs,
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
    marginTop: SPACING.xs,
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
