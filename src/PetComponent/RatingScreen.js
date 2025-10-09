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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const RatingScreen = ({ route, navigation }) => {
  const { doctorId, userId } = route.params; // Pass doctorId & userId from VideoCallScreen
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  console.log(doctorId, userId);
  

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
        console.log(data);
        Alert.alert("Error", data.message || "Failed to submit rating.");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => setRating(i)}>
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={40}
            color="#facc15"
            style={{ marginHorizontal: 5 }}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <View style={styles.container}>
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
        style={[styles.submitButton, submitting && { backgroundColor: "#ccc" }]}
        onPress={submitRating}
        disabled={submitting}
      >
        <Text style={styles.submitButtonText}>
          {submitting ? "Submitting..." : "Submit Feedback"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default RatingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#111",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  commentInput: {
    height: 100,
    borderColor: "#444",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    color: "#fff",
    textAlignVertical: "top",
    marginBottom: 30,
  },
  submitButton: {
    backgroundColor: "#facc15",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111",
  },
});
