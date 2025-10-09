// // components/LiveDoctorsModal.js
// import React, { useState } from "react";
// import {
//   Modal,
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   Image,
//   StyleSheet,
//   ActivityIndicator,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";

// const LiveDoctorSelectionModal = ({ visible, onClose, liveDoctors, onCallDoctor, loading }) => {
//   const [selectedDoctor, setSelectedDoctor] = useState(null);

//   const handleCallDoctor = (doctor) => {
//     setSelectedDoctor(doctor.id);
//     onCallDoctor(doctor);
//   };

//   const renderDoctorItem = ({ item }) => (
//     <TouchableOpacity
//       style={styles.doctorCard}
//       onPress={() => handleCallDoctor(item)}
//       disabled={selectedDoctor === item.id}
//       activeOpacity={0.8}
//     >
//       <LinearGradient
//         colors={["#FFFFFF", "#F8FAFC"]}
//         style={styles.cardGradient}
//       >
//         {/* Doctor Avatar */}
//         <View style={styles.avatarContainer}>
//           {item.profile_image ? (
//             <Image
//               source={{ uri: item.profile_image }}
//               style={styles.avatar}
//             />
//           ) : (
//             <View style={styles.avatarPlaceholder}>
//               <Text style={styles.avatarText}>
//                 {item.business_status?.substring(0, 2).toUpperCase()}
//               </Text>
//             </View>
//           )}
//           {/* Live Indicator */}
//           <View style={styles.liveIndicator}>
//             <View style={styles.liveDot} />
//           </View>
//         </View>

//         {/* Doctor Info */}
//         <View style={styles.doctorInfo}>
//           <Text style={styles.doctorName} numberOfLines={1}>
//             Dr. {item.business_status}
//           </Text>
//           <Text style={styles.clinicName} numberOfLines={1}>
//             {item.clinic_name || "Veterinary Clinic"}
//           </Text>

//           {/* Distance & Experience */}
//           <View style={styles.infoRow}>
//             <View style={styles.infoItem}>
//               <Ionicons name="location" size={14} color="#6B7280" />
//               <Text style={styles.infoText}>
//                 {item.distance ? `${item.distance.toFixed(1)} km` : "Nearby"}
//               </Text>
//             </View>
//             {item.experience && (
//               <View style={styles.infoItem}>
//                 <Ionicons name="star" size={14} color="#F59E0B" />
//                 <Text style={styles.infoText}>{item.experience}y exp</Text>
//               </View>
//             )}
//           </View>

//           {/* Call Button */}
//           {selectedDoctor === item.id ? (
//             <View style={styles.callingButton}>
//               <ActivityIndicator size="small" color="#FFFFFF" />
//               <Text style={styles.callingText}>Calling...</Text>
//             </View>
//           ) : (
//             <LinearGradient
//               colors={["#10B981", "#059669"]}
//               style={styles.callButton}
//             >
//               <Ionicons name="videocam" size={18} color="#FFFFFF" />
//               <Text style={styles.callButtonText}>Start Video Call</Text>
//             </LinearGradient>
//           )}

//         </View>
//       </LinearGradient>
//     </TouchableOpacity>
//   );

//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       transparent={true}
//       onRequestClose={onClose}
//     >
//       <View style={styles.modalOverlay}>
//         <View style={styles.modalContent}>
//           {/* Header */}
//           <View style={styles.modalHeader}>
//             <View>
//               <Text style={styles.modalTitle}>Live Veterinarians</Text>
//               <Text style={styles.modalSubtitle}>
//                 {liveDoctors.length} doctor{liveDoctors.length !== 1 ? "s" : ""} available now
//               </Text>
//             </View>
//             <TouchableOpacity onPress={onClose} style={styles.closeButton}>
//               <Ionicons name="close" size={24} color="#6B7280" />
//             </TouchableOpacity>
//           </View>

//           {/* Doctors List */}
//           {liveDoctors.length > 0 ? (
//             <FlatList
//               data={liveDoctors}
//               renderItem={renderDoctorItem}
//               keyExtractor={(item) => item.id.toString()}
//               contentContainerStyle={styles.listContent}
//               showsVerticalScrollIndicator={false}
//             />
//           ) : (
//             <View style={styles.emptyState}>
//               <Ionicons name="sad-outline" size={48} color="#9CA3AF" />
//               <Text style={styles.emptyText}>No doctors available</Text>
//               <Text style={styles.emptySubtext}>
//                 Please try again in a few moments
//               </Text>
//             </View>
//           )}
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     justifyContent: "flex-end",
//   },
//   modalContent: {
//     backgroundColor: "#FFFFFF",
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     maxHeight: "80%",
//     paddingTop: 20,
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingBottom: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#F3F4F6",
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#1F2937",
//   },
//   modalSubtitle: {
//     fontSize: 14,
//     color: "#6B7280",
//     marginTop: 4,
//   },
//   closeButton: {
//     padding: 8,
//   },
//   listContent: {
//     padding: 20,
//     paddingBottom: 40,
//   },
//   doctorCard: {
//     marginBottom: 16,
//     borderRadius: 16,
//     overflow: "hidden",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   cardGradient: {
//     padding: 16,
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   avatarContainer: {
//     position: "relative",
//     marginRight: 16,
//   },
//   avatar: {
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//   },
//   avatarPlaceholder: {
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     backgroundColor: "#7C3AED",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   avatarText: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#FFFFFF",
//   },
//   liveIndicator: {
//     position: "absolute",
//     bottom: 0,
//     right: 0,
//     width: 18,
//     height: 18,
//     borderRadius: 9,
//     backgroundColor: "#FFFFFF",
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 2,
//     borderColor: "#FFFFFF",
//   },
//   liveDot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: "#10B981",
//   },
//   doctorInfo: {
//     flex: 1,
//   },
//   doctorName: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#1F2937",
//     marginBottom: 4,
//   },
//   clinicName: {
//     fontSize: 14,
//     color: "#6B7280",
//     marginBottom: 8,
//   },
//   infoRow: {
//     flexDirection: "row",
//     gap: 12,
//     marginBottom: 12,
//   },
//   infoItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//   },
//   infoText: {
//     fontSize: 12,
//     color: "#6B7280",
//     fontWeight: "500",
//   },
//   callButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 12,
//   },
//   callButtonText: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#FFFFFF",
//   },
//   callingButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 12,
//     backgroundColor: "#9CA3AF",
//   },
//   callingText: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#FFFFFF",
//   },
//   emptyState: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 60,
//   },
//   emptyText: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#4B5563",
//     marginTop: 16,
//   },
//   emptySubtext: {
//     fontSize: 14,
//     color: "#9CA3AF",
//     marginTop: 8,
//   },
// });

// export default LiveDoctorSelectionModal;

import React, { useState, useMemo, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Share,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

// Enhanced responsive functions
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 667) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// Font sizes with accessibility support
const FONT_SIZES = {
  tiny: moderateScale(10),
  small: moderateScale(12),
  medium: moderateScale(14),
  large: moderateScale(16),
  xlarge: moderateScale(18),
  xxlarge: moderateScale(20),
  xxxlarge: moderateScale(24),
};

const SPACING = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(12),
  lg: moderateScale(16),
  xl: moderateScale(20),
  xxl: moderateScale(24),
  xxxl: moderateScale(32),
};

const LiveDoctorSelectionModal = React.memo(
  ({ visible, onClose, liveDoctors, onCallDoctor, loading }) => {
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const [profileDoctor, setProfileDoctor] = useState(null);

    // Memoized doctor count
    const doctorCountText = useMemo(() => {
      const count = liveDoctors?.length || 0;
      return `${count} doctor${count !== 1 ? "s" : ""} available now`;
    }, [liveDoctors?.length]);

    // Memoized handle functions with useCallback
    const handleCallDoctor = useCallback(
      (doctor) => {
        setSelectedDoctor(doctor.id);
        onCallDoctor(doctor);
      },
      [onCallDoctor]
    );

    const handleViewProfile = useCallback((doctor) => {
      setProfileDoctor(doctor);
      setShowProfile(true);
    }, []);

    const handleCloseProfile = useCallback(() => {
      setShowProfile(false);
      setTimeout(() => {
        setProfileDoctor(null);
      }, 300);
    }, []);

    const handleShareDoctor = useCallback(async (doctor) => {
      try {
        const shareUrl = `https://snoutiq.com/backend/vet/${doctor.slug}`;
        const message = `Check out Dr. ${
          doctor.business_status || doctor.name
        }\n${doctor.clinic_name || "Veterinary Clinic"}\n\n${shareUrl}`;

        await Share.share({
          message: message,
          url: shareUrl,
          title: `Dr. ${doctor.business_status || doctor.name}`,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }, []);

    // Memoized doctor item renderer
    const renderDoctorItem = useCallback(
      ({ item }) => (
        <TouchableOpacity
          style={styles.doctorCard}
          onPress={() => handleViewProfile(item)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#FFFFFF", "#F8FAFC"]}
            style={styles.cardGradient}
          >
            {/* Doctor Avatar */}
            <View style={styles.avatarContainer}>
              {item.profile_image ? (
                <Image
                  source={{ uri: item.profile_image }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {item.business_status?.substring(0, 2).toUpperCase() ||
                      "DR"}
                  </Text>
                </View>
              )}
              {/* Live Indicator */}
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
              </View>
            </View>

            {/* Doctor Info */}
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName} numberOfLines={1}>
                Dr. {item.business_status || item.name || "Veterinarian"}
              </Text>
              <Text style={styles.clinicName} numberOfLines={1}>
                {item.clinic_name || item.name || "Veterinary Clinic"}
              </Text>

              {/* Distance & Rating */}
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Ionicons
                    name="location"
                    size={moderateScale(14)}
                    color="#6B7280"
                  />
                  <Text style={styles.infoText}>
                    {item.distance
                      ? `${item.distance.toFixed(1)} km`
                      : "Nearby"}
                  </Text>
                </View>
                {item.rating && (
                  <View style={styles.infoItem}>
                    <Ionicons
                      name="star"
                      size={moderateScale(14)}
                      color="#F59E0B"
                    />
                    <Text style={styles.infoText}>{item.rating} ★</Text>
                  </View>
                )}
              </View>

              {/* Quick Actions */}
              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleViewProfile(item)}
                >
                  <Ionicons
                    name="eye-outline"
                    size={moderateScale(16)}
                    color="#7C3AED"
                  />
                  <Text style={styles.actionButtonText}>View Profile</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Call Icon */}
            <TouchableOpacity
              style={styles.quickCallButton}
              onPress={() => handleCallDoctor(item)}
              disabled={selectedDoctor === item.id}
            >
              {selectedDoctor === item.id ? (
                <ActivityIndicator size="small" color="#0EA5E9" />
              ) : (
                <Ionicons
                  name="videocam"
                  size={moderateScale(24)}
                  color="#0EA5E9"
                />
              )}
            </TouchableOpacity>
          </LinearGradient>
        </TouchableOpacity>
      ),
      [handleViewProfile, handleCallDoctor, selectedDoctor]
    );

    // Memoized key extractor
    const keyExtractor = useCallback((item) => item.id.toString(), []);

    // Memoized empty state
    const emptyState = useMemo(
      () => (
        <View style={styles.emptyState}>
          <Ionicons
            name="sad-outline"
            size={moderateScale(48)}
            color="#9CA3AF"
          />
          <Text style={styles.emptyText}>No doctors available</Text>
          <Text style={styles.emptySubtext}>
            Please try again in a few moments
          </Text>
        </View>
      ),
      []
    );

    // Memoized doctors list
    const doctorsList = useMemo(
      () => (
        <FlatList
          data={liveDoctors}
          renderItem={renderDoctorItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
        />
      ),
      [liveDoctors, renderDoctorItem, keyExtractor]
    );

    // Doctor Profile Modal Component
    const DoctorProfileView = useMemo(() => {
      if (!profileDoctor) return null;

      return (
        <Modal
          visible={showProfile}
          animationType="slide"
          transparent={false}
          onRequestClose={handleCloseProfile}
          statusBarTranslucent={false}
        >
          <View style={styles.profileModalContainer}>
            {/* Header */}
            <View style={styles.profileHeader}>
              <TouchableOpacity
                onPress={handleCloseProfile}
                style={styles.backButton}
              >
                <Ionicons
                  name="arrow-back"
                  size={moderateScale(24)}
                  color="#1F2937"
                />
              </TouchableOpacity>
              <Text style={styles.profileHeaderTitle}>Doctor Profile</Text>
              <TouchableOpacity
                onPress={() => handleShareDoctor(profileDoctor)}
                style={styles.shareButton}
              >
                <Ionicons
                  name="share-outline"
                  size={moderateScale(24)}
                  color="#0EA5E9"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.profileScrollContent}
            >
              {/* Doctor Card */}
              <LinearGradient
                colors={["#7C3AED", "#EC4899"]}
                style={styles.profileDoctorCard}
              >
                <View style={styles.profileAvatarContainer}>
                  {profileDoctor.profile_image ? (
                    <Image
                      source={{ uri: profileDoctor.profile_image }}
                      style={styles.profileAvatar}
                    />
                  ) : (
                    <View style={styles.profileAvatarPlaceholder}>
                      <Text style={styles.profileAvatarText}>
                        {profileDoctor.business_status
                          ?.substring(0, 2)
                          .toUpperCase() || "DR"}
                      </Text>
                    </View>
                  )}
                  <View style={styles.profileLiveIndicator}>
                    <View style={styles.profileLiveDot} />
                    <Text style={styles.profileLiveText}>Live Now</Text>
                  </View>
                </View>

                <Text style={styles.profileDoctorName}>
                  Dr.{" "}
                  {profileDoctor.business_status ||
                    profileDoctor.name ||
                    "Veterinarian"}
                </Text>
                <Text style={styles.profileClinicName}>
                  {profileDoctor.clinic_name ||
                    profileDoctor.name ||
                    "Veterinary Clinic"}
                </Text>

                {/* Stats Row */}
                <View style={styles.profileStatsRow}>
                  {profileDoctor.rating && (
                    <View style={styles.profileStatItem}>
                      <Ionicons
                        name="star"
                        size={moderateScale(20)}
                        color="#FCD34D"
                      />
                      <Text style={styles.profileStatText}>
                        {profileDoctor.rating}
                      </Text>
                    </View>
                  )}
                  {profileDoctor.user_ratings_total && (
                    <View style={styles.profileStatItem}>
                      <Ionicons
                        name="people"
                        size={moderateScale(20)}
                        color="#FFFFFF"
                      />
                      <Text style={styles.profileStatText}>
                        {profileDoctor.user_ratings_total} reviews
                      </Text>
                    </View>
                  )}
                  {profileDoctor.distance && (
                    <View style={styles.profileStatItem}>
                      <Ionicons
                        name="location"
                        size={moderateScale(20)}
                        color="#FFFFFF"
                      />
                      <Text style={styles.profileStatText}>
                        {profileDoctor.distance.toFixed(1)} km
                      </Text>
                    </View>
                  )}
                </View>
              </LinearGradient>

              {/* Details Section */}
              <View style={styles.detailsSection}>
                {/* Contact Info */}
                <View style={styles.detailCard}>
                  <View style={styles.detailHeader}>
                    <Ionicons
                      name="call-outline"
                      size={moderateScale(20)}
                      color="#7C3AED"
                    />
                    <Text style={styles.detailTitle}>Contact Information</Text>
                  </View>
                  <View style={styles.detailContent}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Phone:</Text>
                      <Text style={styles.detailValue}>
                        {profileDoctor.mobile || "Not available"}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Email:</Text>
                      <Text style={styles.detailValue} numberOfLines={1}>
                        {profileDoctor.email || "Not available"}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Address */}
                <View style={styles.detailCard}>
                  <View style={styles.detailHeader}>
                    <Ionicons
                      name="location-outline"
                      size={moderateScale(20)}
                      color="#7C3AED"
                    />
                    <Text style={styles.detailTitle}>Address</Text>
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.addressText}>
                      {profileDoctor.address ||
                        profileDoctor.formatted_address ||
                        "Address not available"}
                    </Text>
                    <Text style={styles.cityText}>
                      {profileDoctor.city}, {profileDoctor.pincode}
                    </Text>
                  </View>
                </View>

                {/* Consultation Fee */}
                <View style={styles.detailCard}>
                  <View style={styles.detailHeader}>
                    <Ionicons
                      name="cash-outline"
                      size={moderateScale(20)}
                      color="#7C3AED"
                    />
                    <Text style={styles.detailTitle}>Consultation Fee</Text>
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.feeText}>
                      ₹{profileDoctor.chat_price || "500"}/session
                    </Text>
                  </View>
                </View>

                {/* Bio */}
                {profileDoctor.bio &&
                  profileDoctor.bio !== "null" &&
                  profileDoctor.bio.trim() !== "" && (
                    <View style={styles.detailCard}>
                      <View style={styles.detailHeader}>
                        <Ionicons
                          name="information-circle-outline"
                          size={moderateScale(20)}
                          color="#7C3AED"
                        />
                        <Text style={styles.detailTitle}>About</Text>
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.bioText}>{profileDoctor.bio}</Text>
                      </View>
                    </View>
                  )}

                {profileDoctor.photos &&
                  (() => {
                    try {
                      const photos = JSON.parse(profileDoctor.photos);

                      // Function to get proper Google Places photo URL
                      const getPhotoUrl = (photoReference) => {
                        // Extract the actual photo_reference from the complex URL
                        const match =
                          photoReference.match(/1s([A-Za-z0-9_-]+)/);
                        if (match && match[1]) {
                          const actualPhotoRef = match[1];
                          return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${actualPhotoRef}&key=AIzaSyDSiWYPatUTt_CCokGa9ZW1rsQhP5THCpA`;
                        }

                        // If it's already a simple photo_reference, use it directly
                        if (photoReference.length < 100) {
                          return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=AIzaSyDSiWYPatUTt_CCokGa9ZW1rsQhP5THCpA`;
                        }

                        return null;
                      };

                      return (
                        photos &&
                        photos.length > 0 && (
                          <View style={styles.detailCard}>
                            <View style={styles.detailHeader}>
                              <Ionicons
                                name="images-outline"
                                size={moderateScale(20)}
                                color="#7C3AED"
                              />
                              <Text style={styles.detailTitle}>
                                Clinic Photos
                              </Text>
                            </View>
                            <ScrollView
                              horizontal
                              showsHorizontalScrollIndicator={false}
                              style={styles.photosScroll}
                            >
                              {photos.slice(0, 5).map((photo, index) => {
                                const photoUrl = getPhotoUrl(
                                  photo.photo_reference
                                );

                                return photoUrl ? (
                                  <View
                                    key={index}
                                    style={styles.photoContainer}
                                  >
                                    <Image
                                      source={{ uri: photoUrl }}
                                      style={styles.clinicPhoto}
                                      resizeMode="cover"
                                      onError={(error) => {
                                        console.log(
                                          "Image load error:",
                                          error.nativeEvent.error
                                        );
                                        console.log("Failed URL:", photoUrl);
                                      }}
                                    />
                                  </View>
                                ) : null;
                              })}
                            </ScrollView>
                          </View>
                        )
                      );
                    } catch (e) {
                      console.log("Photo parse error:", e);
                      return null;
                    }
                  })()}
              </View>
            </ScrollView>

            {/* Fixed Call Button */}
            <View style={styles.fixedCallButtonContainer}>
              {selectedDoctor === profileDoctor.id ? (
                <View style={styles.callingFixedButton}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.callingFixedText}>Calling...</Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    handleCloseProfile();
                    setTimeout(() => {
                      handleCallDoctor(profileDoctor);
                    }, 300);
                  }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#0EA5E9", "#3aa1d1ff"]}
                    style={styles.callFixedButton}
                  >
                    <Ionicons
                      name="videocam"
                      size={moderateScale(24)}
                      color="#FFFFFF"
                    />
                    <Text style={styles.callFixedButtonText}>
                      Start Video Call
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      );
    }, [
      profileDoctor,
      showProfile,
      handleCloseProfile,
      handleShareDoctor,
      handleCallDoctor,
      selectedDoctor,
    ]);

    return (
      <>
        <Modal
          visible={visible}
          animationType="slide"
          transparent={true}
          onRequestClose={onClose}
          statusBarTranslucent={true}
        >
          <StatusBar
            backgroundColor="rgba(0, 0, 0, 0.5)"
            barStyle="light-content"
          />
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Live Veterinarians</Text>
                  <Text style={styles.modalSubtitle}>{doctorCountText}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons
                    name="close"
                    size={moderateScale(24)}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>

              {/* Doctors List */}
              {liveDoctors?.length > 0 ? doctorsList : emptyState}
            </View>
          </View>
        </Modal>

        {/* Doctor Profile Modal */}
        {DoctorProfileView}
      </>
    );
  }
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: SPACING.xl,
    borderTopRightRadius: SPACING.xl,
    maxHeight: "85%",
    paddingTop: SPACING.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: "700",
    color: "#1F2937",
  },
  modalSubtitle: {
    fontSize: FONT_SIZES.medium,
    color: "#6B7280",
    marginTop: SPACING.xs,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  doctorCard: {
    marginBottom: SPACING.md,
    borderRadius: SPACING.md,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardGradient: {
    padding: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: SPACING.md,
  },
  avatar: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(32),
  },
  avatarPlaceholder: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(32),
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  liveIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: moderateScale(18),
    height: moderateScale(18),
    borderRadius: moderateScale(9),
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  liveDot: {
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: moderateScale(5),
    backgroundColor: "#0EA5E9",
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: FONT_SIZES.large,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: SPACING.xs,
  },
  clinicName: {
    fontSize: FONT_SIZES.medium,
    color: "#6B7280",
    marginBottom: SPACING.sm,
  },
  infoRow: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  infoText: {
    fontSize: FONT_SIZES.small,
    color: "#6B7280",
    fontWeight: "500",
  },
  quickActions: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    backgroundColor: "#F3F4F6",
    borderRadius: SPACING.sm,
  },
  actionButtonText: {
    fontSize: FONT_SIZES.small,
    fontWeight: "600",
    color: "#7C3AED",
  },
  quickCallButton: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: SPACING.sm,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xxxl * 2,
  },
  emptyText: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "600",
    color: "#4B5563",
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.medium,
    color: "#9CA3AF",
    marginTop: SPACING.sm,
  },

  // Profile Modal Styles
  profileModalContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.md,
    paddingTop: SPACING.xl,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: SPACING.sm,
  },
  profileHeaderTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "700",
    color: "#1F2937",
  },
  shareButton: {
    padding: SPACING.sm,
  },
  profileScrollContent: {
    paddingBottom: moderateScale(120),
  },
  profileDoctorCard: {
    padding: SPACING.xl,
    alignItems: "center",
    borderBottomLeftRadius: SPACING.xxl,
    borderBottomRightRadius: SPACING.xxl,
  },
  profileAvatarContainer: {
    position: "relative",
    marginBottom: SPACING.md,
  },
  profileAvatar: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  profileAvatarPlaceholder: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  profileAvatarText: {
    fontSize: moderateScale(36),
    fontWeight: "700",
    color: "#FFFFFF",
  },
  profileLiveIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    gap: SPACING.xs,
  },
  profileLiveDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: "#10B981",
  },
  profileLiveText: {
    fontSize: FONT_SIZES.small,
    fontWeight: "600",
    color: "#10B981",
  },
  profileDoctorName: {
    fontSize: FONT_SIZES.xxxlarge,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: SPACING.xs,
    textAlign: "center",
  },
  profileClinicName: {
    fontSize: FONT_SIZES.large,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  profileStatsRow: {
    flexDirection: "row",
    gap: SPACING.xl,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  profileStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  profileStatText: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  detailsSection: {
    padding: SPACING.md,
  },
  detailCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: SPACING.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  detailTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "600",
    color: "#1F2937",
  },
  detailContent: {
    gap: SPACING.sm,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: FONT_SIZES.medium,
    color: "#6B7280",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: FONT_SIZES.medium,
    color: "#1F2937",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  addressText: {
    fontSize: FONT_SIZES.medium,
    color: "#4B5563",
    lineHeight: moderateScale(20),
  },
  cityText: {
    fontSize: FONT_SIZES.medium,
    color: "#6B7280",
    marginTop: SPACING.xs,
  },
  feeText: {
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: "700",
    color: "#10B981",
  },
  bioText: {
    fontSize: FONT_SIZES.medium,
    color: "#4B5563",
    lineHeight: moderateScale(20),
  },
  photosScroll: {
    marginTop: SPACING.md,
  },
  clinicPhoto: {
    width: moderateScale(120),
    height: moderateScale(120),
    borderRadius: SPACING.md,
    marginRight: SPACING.md,
    backgroundColor: "#F3F4F6",
  },
  fixedCallButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  callFixedButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: SPACING.md,
  },
  callFixedButtonText: {
    fontSize: FONT_SIZES.large,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  callingFixedButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: SPACING.md,
    backgroundColor: "#9CA3AF",
  },
  callingFixedText: {
    fontSize: FONT_SIZES.large,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

export default LiveDoctorSelectionModal;
