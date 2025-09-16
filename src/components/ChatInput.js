import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const ChatInput = ({ onSendMessage, isLoading = false }) => {
  const [message, setMessage] = useState("");
  const hasLoadedSavedMessage = useRef(false);

  // Load saved message only once when component mounts
  useEffect(() => {
    const loadMessage = async () => {
      if (!hasLoadedSavedMessage.current) {
        try {
          const savedMessage = await AsyncStorage.getItem("messageIntended");
          if (savedMessage) {
            setMessage(savedMessage);
            console.log("Loaded saved message:", savedMessage);
          }
        } catch (e) {
          console.log("Error loading saved message:", e);
        }
        hasLoadedSavedMessage.current = true;
      }
    };
    loadMessage();
  }, []);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    if (message.trim() && !isLoading) {
      try {
        await AsyncStorage.removeItem("messageIntended");
      } catch (e) {
        console.log("Error clearing saved message:", e);
      }
      onSendMessage(message);
      setMessage("");
      Keyboard.dismiss();
    }
  }, [message, isLoading, onSendMessage]);

  // Save message on change
  const handleChange = useCallback(async (text) => {
    setMessage(text);
    try {
      await AsyncStorage.setItem("messageIntended", text);
    } catch (e) {
      console.log("Error saving message:", e);
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* Mic Icon (emoji for simplicity) */}
      <Text style={styles.micIcon}>🎤</Text>

      {/* Input */}
      <TextInput
        style={styles.input}
        value={message}
        onChangeText={handleChange}
        placeholder="Ask anything about your pet"
        placeholderTextColor="#999"
        editable={!isLoading}
        onSubmitEditing={handleSubmit} // Send when pressing enter
        blurOnSubmit={false}
      />

      {/* Send button */}
      <TouchableOpacity
        style={[
          styles.sendButton,
          (isLoading || !message.trim()) && styles.sendButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={isLoading || !message.trim()}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.sendIcon}>📤</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default React.memo(ChatInput);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    margin: 10,
    backgroundColor: "#fff",
  },
  micIcon: {
    fontSize: 18,
    color: "#666",
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 6,
    color: "#000",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2761E8",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendIcon: {
    fontSize: 18,
    color: "#fff",
  },
});
