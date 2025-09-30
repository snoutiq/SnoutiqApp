// import AsyncStorage from "@react-native-async-storage/async-storage";
// import React, { useCallback, useEffect, useRef, useState } from "react";
// import {
//     ActivityIndicator,
//     Keyboard,
//     StyleSheet,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     View,
// } from "react-native";

// const ChatInput = ({ onSendMessage, isLoading = false }) => {
//   const [message, setMessage] = useState("");
//   const hasLoadedSavedMessage = useRef(false);

//   // Load saved message only once when component mounts
//   useEffect(() => {
//     const loadMessage = async () => {
//       if (!hasLoadedSavedMessage.current) {
//         try {
//           const savedMessage = await AsyncStorage.getItem("messageIntended");
//           if (savedMessage) {
//             setMessage(savedMessage);
//             console.log("Loaded saved message:", savedMessage);
//           }
//         } catch (e) {
//           console.log("Error loading saved message:", e);
//         }
//         hasLoadedSavedMessage.current = true;
//       }
//     };
//     loadMessage();
//   }, []);

//   // Submit handler
//   const handleSubmit = useCallback(async () => {
//     if (message.trim() && !isLoading) {
//       try {
//         await AsyncStorage.removeItem("messageIntended");
//       } catch (e) {
//         console.log("Error clearing saved message:", e);
//       }
//       onSendMessage(message);
//       setMessage("");
//       Keyboard.dismiss();
//     }
//   }, [message, isLoading, onSendMessage]);

//   // Save message on change
//   const handleChange = useCallback(async (text) => {
//     setMessage(text);
//     try {
//       await AsyncStorage.setItem("messageIntended", text);
//     } catch (e) {
//       console.log("Error saving message:", e);
//     }
//   }, []);

//   return (
//     <View style={styles.container}>
//       {/* Mic Icon (emoji for simplicity) */}
//       <Text style={styles.micIcon}>🎤</Text>

//       {/* Input */}
//       <TextInput
//         style={styles.input}
//         value={message}
//         onChangeText={handleChange}
//         placeholder="Ask anything about your pet"
//         placeholderTextColor="#999"
//         editable={!isLoading}
//         onSubmitEditing={handleSubmit} // Send when pressing enter
//         blurOnSubmit={false}
//       />

//       {/* Send button */}
//       <TouchableOpacity
//         style={[
//           styles.sendButton,
//           (isLoading || !message.trim()) && styles.sendButtonDisabled,
//         ]}
//         onPress={handleSubmit}
//         disabled={isLoading || !message.trim()}
//       >
//         {isLoading ? (
//           <ActivityIndicator size="small" color="#fff" />
//         ) : (
//           <Text style={styles.sendIcon}>📤</Text>
//         )}
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default React.memo(ChatInput);

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 12,
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     margin: 10,
//     backgroundColor: "#fff",
//   },
//   micIcon: {
//     fontSize: 18,
//     color: "#666",
//     marginRight: 8,
//   },
//   input: {
//     flex: 1,
//     fontSize: 16,
//     paddingVertical: 8,
//     paddingHorizontal: 6,
//     color: "#000",
//   },
//   sendButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "#2761E8",
//     alignItems: "center",
//     justifyContent: "center",
//     marginLeft: 8,
//   },
//   sendButtonDisabled: {
//     opacity: 0.5,
//   },
//   sendIcon: {
//     fontSize: 18,
//     color: "#fff",
//   },
// });
import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Text,
  ActivityIndicator,
  ScrollView,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { LinearGradient } from 'expo-linear-gradient';

const ChatInput = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const [inputHeight, setInputHeight] = useState(moderateScale(48));
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const inputRef = useRef(null);

  const maxHeight = moderateScale(120);
  const minHeight = moderateScale(48);

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
      setInputHeight(minHeight);
      setShowSuggestions(true);
      Keyboard.dismiss();
      
      // Button press animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleContentSizeChange = (event) => {
    const { height } = event.nativeEvent.contentSize;
    const newHeight = Math.min(Math.max(height + moderateScale(20), minHeight), maxHeight);
    setInputHeight(newHeight);
  };

  const handleTextChange = (text) => {
    setMessage(text);
    setShowSuggestions(text.length === 0);
  };

  const handleFocus = () => {
    setShowSuggestions(message.length === 0);
  };

  const quickSuggestions = [
    { icon: '🤒', text: 'My pet is not eating well' },
    { icon: '🐕', text: 'Unusual behavior noticed' },
    { icon: '🏥', text: 'Need vaccination info' },
    { icon: '💊', text: 'Medication guidance' },
  ];

  const handleSuggestionPress = (suggestion) => {
    setMessage(suggestion.text);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <View style={styles.container}>
      {/* Quick Suggestions - Only show when input is empty */}
      {showSuggestions && message === '' && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Quick suggestions:</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsContent}
          >
            {quickSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionChip}
                onPress={() => handleSuggestionPress(suggestion)}
                activeOpacity={0.7}
              >
                <Text style={styles.suggestionEmoji}>{suggestion.icon}</Text>
                <Text style={styles.suggestionText}>{suggestion.text}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Input Container */}
      <View style={styles.inputContainer}>
        <View style={[styles.inputWrapper, { height: inputHeight }]}>
          <TextInput
            ref={inputRef}
            style={[styles.textInput, { height: inputHeight - moderateScale(20) }]}
            placeholder="Type your message..."
            placeholderTextColor="#9CA3AF"
            value={message}
            onChangeText={handleTextChange}
            onFocus={handleFocus}
            multiline
            textAlignVertical="center"
            onContentSizeChange={handleContentSizeChange}
            scrollEnabled={inputHeight >= maxHeight}
            maxLength={1000}
            editable={!isLoading}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          
          {/* Attachment Button */}
          <TouchableOpacity
            style={styles.attachButton}
            onPress={() => {
              // Handle attachment functionality
            }}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="camera-outline" 
              size={22} 
              color={isLoading ? '#D1D5DB' : '#6B7280'} 
            />
          </TouchableOpacity>
        </View>

        {/* Send Button */}
        <Animated.View style={[styles.sendButtonContainer, { transform: [{ scale: scaleAnim }] }]}>
          <TouchableOpacity
            style={[
              styles.sendButton,
              (message.trim() && !isLoading) ? styles.sendButtonActive : styles.sendButtonInactive
            ]}
            onPress={handleSend}
            disabled={!message.trim() || isLoading}
            activeOpacity={0.8}
          >
            {(message.trim() && !isLoading) ? (
              <LinearGradient
                colors={['#4F46E5', '#7C3AED']}
                style={styles.sendButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Ionicons name="send" size={20} color="#FFFFFF" />
                )}
              </LinearGradient>
            ) : (
              <View style={styles.sendButtonInactiveContent}>
                <Ionicons name="send" size={20} color="#D1D5DB" />
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Character Counter */}
      {message.length > 800 && (
        <View style={styles.characterCounter}>
          <Text style={[
            styles.characterCountText,
            message.length > 950 && styles.characterCountWarning
          ]}>
            {message.length}/1000
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: moderateScale(84),
  },
  suggestionsContainer: {
    marginBottom: moderateScale(16),
  },
  suggestionsTitle: {
    fontSize: moderateScale(12),
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: moderateScale(8),
    marginHorizontal: moderateScale(4),
  },
  suggestionsContent: {
    paddingHorizontal: moderateScale(4),
    gap: moderateScale(8),
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(8),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minWidth: moderateScale(120),
  },
  suggestionEmoji: {
    fontSize: moderateScale(16),
    marginRight: moderateScale(8),
  },
  suggestionText: {
    fontSize: moderateScale(12),
    color: '#374151',
    fontWeight: '500',
    flexShrink: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: moderateScale(12),
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    minHeight: moderateScale(48),
  },
  textInput: {
    flex: 1,
    fontSize: moderateScale(16),
    color: '#1F2937',
    paddingTop: Platform.OS === 'ios' ? moderateScale(10) : moderateScale(6),
    paddingBottom: Platform.OS === 'ios' ? moderateScale(10) : moderateScale(6),
    lineHeight: moderateScale(22),
    maxHeight: moderateScale(100),
  },
  attachButton: {
    marginLeft: moderateScale(8),
    marginBottom: moderateScale(2),
  },
  sendButtonContainer: {
    marginBottom: moderateScale(4),
  },
  sendButton: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  sendButtonActive: {
    transform: [{ scale: 1 }],
  },
  sendButtonInactive: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonInactiveContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  characterCounter: {
    alignItems: 'flex-end',
    marginTop: moderateScale(6),
    marginRight: moderateScale(4),
  },
  characterCountText: {
    fontSize: moderateScale(10),
    color: '#9CA3AF',
    fontWeight: '500',
  },
  characterCountWarning: {
    color: '#DC2626',
  },
});

export default ChatInput;