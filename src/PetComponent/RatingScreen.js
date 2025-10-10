import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const RatingScreen = ({ route, navigation }) => {
  const { doctorId, userId } = route.params;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [visible, setVisible] = useState(true); // modal visible

  const closeModal = () => {
    setVisible(false);
    navigation.pop(3);
  };

  const submitRating = async () => {
    if (rating === 0) {
      Alert.alert("Rating Required", "Please select a star rating.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("https://snoutiq.com/backend/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          doctor_id: doctorId,
          points: rating,
          comment: comment,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Thank You!", "Your feedback has been submitted.", [
          { text: "OK", onPress: () => navigation.pop(3) },
        ]);
      } else {
        Alert.alert("Error", data.message || "Failed to submit rating.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1;
      return (
        <TouchableOpacity
          key={starValue}
          onPress={() => setRating(starValue)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={starValue <= rating ? "star" : "star-outline"}
            size={40}
            color="#FFD700"
            style={{ marginHorizontal: 5 }}
          />
        </TouchableOpacity>
      );
    });
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.title}>Rate Your Doctor</Text>
          <Text style={styles.subtitle}>Tap a star to rate</Text>

          <View style={styles.starsContainer}>{renderStars()}</View>

          <TextInput
            style={styles.commentInput}
            placeholder="Leave a comment (optional)"
            placeholderTextColor="#999"
            multiline
            value={comment}
            onChangeText={setComment}
          />

          <TouchableOpacity
            style={[
              styles.submitButton,
              submitting && { backgroundColor: "#999" },
            ]}
            onPress={submitRating}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Feedback</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default RatingScreen;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    width: width * 0.9,
    backgroundColor: "#1e1e1e",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  closeButton: {
    position: "absolute",
    right: 15,
    top: 15,
    padding: 5,
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#aaa",
    marginVertical: 10,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  commentInput: {
    width: "100%",
    height: 90,
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    color: "#fff",
    textAlignVertical: "top",
    marginBottom: 20,
    backgroundColor: "#2a2a2a",
  },
  submitButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 14,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
});
