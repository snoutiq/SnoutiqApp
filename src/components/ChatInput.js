// import React, { useState, useRef } from 'react';
// import {
//   View,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Animated,
//   Platform,
//   Text,
//   ActivityIndicator,
//   ScrollView,
//   Keyboard
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
// import { LinearGradient } from 'expo-linear-gradient';

// // Responsive constants
// const FONT_SIZES = {
//   tiny: moderateScale(10),
//   small: moderateScale(12),
//   medium: moderateScale(14),
//   large: moderateScale(16),
//   xlarge: moderateScale(18),
//   xxlarge: moderateScale(20),
//   xxxlarge: moderateScale(24),
// };

// const SPACING = {
//   xs: moderateScale(4),
//   sm: moderateScale(8),
//   md: moderateScale(12),
//   lg: moderateScale(16),
//   xl: moderateScale(20),
//   xxl: moderateScale(24),
// };

// const ChatInput = ({ onSendMessage, isLoading }) => {
//   const [message, setMessage] = useState('');
//   const [inputHeight, setInputHeight] = useState(verticalScale(48));
//   const [showSuggestions, setShowSuggestions] = useState(true);
//   const scaleAnim = useRef(new Animated.Value(1)).current;
//   const inputRef = useRef(null);

//   const maxHeight = verticalScale(120);
//   const minHeight = verticalScale(48);

//   const handleSend = () => {
//     if (message.trim() && !isLoading) {
//       onSendMessage(message.trim());
//       setMessage('');
//       setInputHeight(minHeight);
//       setShowSuggestions(true);
//       Keyboard.dismiss();
      
//       // Button press animation
//       Animated.sequence([
//         Animated.timing(scaleAnim, {
//           toValue: 0.95,
//           duration: 100,
//           useNativeDriver: true,
//         }),
//         Animated.timing(scaleAnim, {
//           toValue: 1,
//           duration: 100,
//           useNativeDriver: true,
//         }),
//       ]).start();
//     }
//   };

//   const handleContentSizeChange = (event) => {
//     const { height } = event.nativeEvent.contentSize;
//     const newHeight = Math.min(Math.max(height + verticalScale(20), minHeight), maxHeight);
//     setInputHeight(newHeight);
//   };

//   const handleTextChange = (text) => {
//     setMessage(text);
//     setShowSuggestions(text.length === 0);
//   };

//   const handleFocus = () => {
//     setShowSuggestions(message.length === 0);
//   };

//   const quickSuggestions = [
//     { icon: '🤒', text: 'My pet is not eating well' },
//     { icon: '🐕', text: 'Unusual behavior noticed' },
//     { icon: '🏥', text: 'Need vaccination info' },
//     { icon: '💊', text: 'Medication guidance' },
//     { icon: '🌡️', text: 'Fever symptoms' },
//     { icon: '🤢', text: 'Vomiting or diarrhea' },
//   ];

//   const handleSuggestionPress = (suggestion) => {
//     setMessage(suggestion.text);
//     setShowSuggestions(false);
//     inputRef.current?.focus();
//   };

//   return (
//     <View style={styles.container}>
//       {/* Quick Suggestions - Only show when input is empty */}
//       {showSuggestions && message === '' && (
//         <View style={styles.suggestionsContainer}>
//           <Text style={styles.suggestionsTitle}>Quick suggestions:</Text>
//           <ScrollView 
//             horizontal 
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.suggestionsContent}
//           >
//             {quickSuggestions.map((suggestion, index) => (
//               <TouchableOpacity
//                 key={index}
//                 style={styles.suggestionChip}
//                 onPress={() => handleSuggestionPress(suggestion)}
//                 activeOpacity={0.7}
//               >
//                 <Text style={styles.suggestionEmoji}>{suggestion.icon}</Text>
//                 <Text style={styles.suggestionText} numberOfLines={1}>
//                   {suggestion.text}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//         </View>
//       )}

//       {/* Input Container */}
//       <View style={styles.inputContainer}>
//         <View style={[styles.inputWrapper, { height: inputHeight }]}>
//           <TextInput
//             ref={inputRef}
//             style={[styles.textInput, { 
//               height: Math.max(inputHeight - verticalScale(20), verticalScale(28)),
//               maxHeight: maxHeight - verticalScale(20)
//             }]}
//             placeholder="Describe your pet's symptoms or ask a question..."
//             placeholderTextColor="#9CA3AF"
//             value={message}
//             onChangeText={handleTextChange}
//             onFocus={handleFocus}
//             multiline
//             textAlignVertical="center"
//             onContentSizeChange={handleContentSizeChange}
//             scrollEnabled={inputHeight >= maxHeight}
//             maxLength={1000}
//             editable={!isLoading}
//             returnKeyType="send"
//             onSubmitEditing={handleSend}
//             blurOnSubmit={false}
//           />
//         </View>

//         {/* Send Button */}
//         <Animated.View style={[styles.sendButtonContainer, { transform: [{ scale: scaleAnim }] }]}>
//           <TouchableOpacity
//             style={[
//               styles.sendButton,
//               (message.trim() && !isLoading) ? styles.sendButtonActive : styles.sendButtonInactive
//             ]}
//             onPress={handleSend}
//             disabled={!message.trim() || isLoading}
//             activeOpacity={0.8}
//           >
//             {(message.trim() && !isLoading) ? (
//               <LinearGradient
//                 colors={['#7C3AED', '#EC4899']}
//                 style={styles.sendButtonGradient}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 1 }}
//               >
//                 {isLoading ? (
//                   <ActivityIndicator color="#FFFFFF" size="small" />
//                 ) : (
//                   <Ionicons name="send" size={scale(20)} color="#FFFFFF" />
//                 )}
//               </LinearGradient>
//             ) : (
//               <View style={styles.sendButtonInactiveContent}>
//                 <Ionicons name="send" size={scale(20)} color="#D1D5DB" />
//               </View>
//             )}
//           </TouchableOpacity>
//         </Animated.View>
//       </View>

//       {/* Character Counter */}
//       {message.length > 800 && (
//         <View style={styles.characterCounter}>
//           <Text style={[
//             styles.characterCountText,
//             message.length > 950 && styles.characterCountWarning
//           ]}>
//             {message.length}/1000
//           </Text>
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#FFFFFF',
//     paddingTop: SPACING.xs,
//     paddingBottom: Platform.OS === 'ios' ? verticalScale(90) : verticalScale(50),
//     paddingHorizontal: SPACING.xs,
//     borderTopWidth: 1,
//     borderTopColor: '#F3F4F6',
//   },
//   suggestionsContainer: {
//     marginBottom: SPACING.lg,
//   },
//   suggestionsTitle: {
//     fontSize: FONT_SIZES.small,
//     color: '#6B7280',
//     fontWeight: '600',
//     marginBottom: SPACING.sm,
//     marginHorizontal: SPACING.xs,
//   },
//   suggestionsContent: {
//     paddingHorizontal: SPACING.xs,
//     gap: SPACING.sm,
//   },
//   suggestionChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//     paddingHorizontal: SPACING.lg,
//     paddingVertical: SPACING.sm,
//     borderRadius: moderateScale(20),
//     borderWidth: 1.5,
//     borderColor: '#F3F4F6',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: scale(2) },
//     shadowOpacity: 0.05,
//     shadowRadius: scale(4),
//     elevation: 2,
//     minWidth: scale(120),
//     maxWidth: scale(200),
//   },
//   suggestionEmoji: {
//     fontSize: FONT_SIZES.medium,
//     marginRight: SPACING.sm,
//   },
//   suggestionText: {
//     fontSize: FONT_SIZES.small,
//     color: '#374151',
//     fontWeight: '500',
//     flex: 1,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     gap: SPACING.md,
//   },
//   inputWrapper: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//     borderRadius: moderateScale(24),
//     borderWidth: 1.5,
//     borderColor: '#E5E7EB',
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     paddingHorizontal: SPACING.lg,
//     paddingVertical: SPACING.md,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: scale(2) },
//     shadowOpacity: 0.08,
//     shadowRadius: scale(8),
//     elevation: 3,
//     minHeight: verticalScale(48),
//     maxHeight: verticalScale(120),
//   },
//   textInput: {
//     flex: 1,
//     fontSize: FONT_SIZES.medium,
//     color: '#1F2937',
//     paddingTop: Platform.OS === 'ios' ? verticalScale(10) : verticalScale(6),
//     paddingBottom: Platform.OS === 'ios' ? verticalScale(10) : verticalScale(6),
//     lineHeight: FONT_SIZES.medium * 1.4,
//     textAlignVertical: 'center',
//   },
//   sendButtonContainer: {
//     marginBottom: verticalScale(4),
//   },
//   sendButton: {
//     width: scale(48),
//     height: scale(48),
//     borderRadius: scale(24),
//     overflow: 'hidden',
//     shadowColor: '#7C3AED',
//     shadowOffset: { width: 0, height: scale(3) },
//     shadowOpacity: 0.3,
//     shadowRadius: scale(6),
//     elevation: 6,
//   },
//   sendButtonActive: {
//     transform: [{ scale: 1 }],
//   },
//   sendButtonInactive: {
//     backgroundColor: '#F9FAFB',
//     borderWidth: 1.5,
//     borderColor: '#E5E7EB',
//     shadowOpacity: 0,
//     elevation: 0,
//   },
//   sendButtonGradient: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: scale(24),
//   },
//   sendButtonInactiveContent: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F9FAFB',
//     borderRadius: scale(24),
//   },
//   characterCounter: {
//     alignItems: 'flex-end',
//     marginTop: SPACING.xs,
//     marginRight: SPACING.xs,
//   },
//   characterCountText: {
//     fontSize: FONT_SIZES.tiny,
//     color: '#9CA3AF',
//     fontWeight: '500',
//   },
//   characterCountWarning: {
//     color: '#DC2626',
//     fontWeight: '600',
//   },
// });

// export default ChatInput;

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

// Responsive constants
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
};

const ChatInput = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const [inputHeight, setInputHeight] = useState(verticalScale(48));
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const inputRef = useRef(null);

  const maxHeight = verticalScale(120);
  const minHeight = verticalScale(48);

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
    const newHeight = Math.min(Math.max(height + verticalScale(20), minHeight), maxHeight);
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
    { icon: '🤒', text: ' not eating ' },
    { icon: '🤢', text: 'Vomiting ' },
    { icon: '💊', text: 'Medication' },
    { icon: '🏥', text: 'vaccination' },
    { icon: '🌡️', text: 'Fever' },
    { icon: '🐕', text: 'Unusual behavior noticed' },
  ];

  const handleSuggestionPress = (suggestion) => {
    if (isLoading) return;
    const text = (suggestion?.text || '').trim();
    if (!text) return;
    onSendMessage(text);
    setMessage('');
    setInputHeight(minHeight);
    setShowSuggestions(true);
    Keyboard.dismiss();
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
                <Text style={styles.suggestionText} numberOfLines={1}>
                  {suggestion.text}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Input Container */}
      <View style={styles.inputContainer}>
        <View style={[styles.inputWrapper, { height: inputHeight, flexDirection: 'row', alignItems: 'center' }]}>
          <Ionicons
            name="paw"
            size={scale(20)}
            color="#7C3AED"
            style={{ marginRight: moderateScale(8) }}
          />
          <TextInput
            ref={inputRef}
            style={[
              styles.textInput, 
              { 
                height: Math.max(inputHeight - verticalScale(20), verticalScale(28)),
                maxHeight: maxHeight - verticalScale(20),
                flex: 1
              }
            ]}
            placeholder="Get free consultation from ai"
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
                colors={['#7C3AED', '#EC4899']}
                style={styles.sendButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Ionicons name="send" size={scale(20)} color="#FFFFFF" />
                )}
              </LinearGradient>
            ) : (
              <View style={styles.sendButtonInactiveContent}>
                <Ionicons name="send" size={scale(20)} color="#D1D5DB" />
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
    backgroundColor: '#FFFFFF',
    paddingBottom: Platform.OS === 'ios' ? verticalScale(90) : verticalScale(50),
  },
  suggestionsContainer: {
    marginBottom: moderateScale(4),
  },
  suggestionsTitle: {
    fontSize: FONT_SIZES.small,
    color: '#6D28D9',
    fontWeight: '600',
    marginBottom: moderateScale(2),
  },
  suggestionsContent: {
    paddingHorizontal: SPACING.xs,
    gap: SPACING.sm,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: moderateScale(20),
    borderWidth: 0.5,
    borderColor: '#6D28D9',
  },
  suggestionEmoji: {
    fontSize: FONT_SIZES.medium,
    marginRight: SPACING.sm,
  },
  suggestionText: {
    fontSize: FONT_SIZES.small,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.md,
    marginBottom:moderateScale(10)
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(24),
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.08,
    shadowRadius: scale(8),
    elevation: 3,
    minHeight: verticalScale(48),
    maxHeight: verticalScale(120),
  },
  textInput: {
    flex: 1,
    fontSize: FONT_SIZES.medium,
    color: '#1F2937',
    paddingVertical: Platform.OS === 'ios' ? verticalScale(8) : verticalScale(4),
   
    // lineHeight: FONT_SIZES.medium * 1.4,
    textAlignVertical: 'center',
  },
  sendButtonContainer: {
    marginBottom: verticalScale(4),
  },
  sendButton: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: scale(3) },
    shadowOpacity: 0.3,
    shadowRadius: scale(6),
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
    borderRadius: scale(24),
  },
  sendButtonInactiveContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: scale(24),
  },
  characterCounter: {
    alignItems: 'flex-end',
    marginTop: SPACING.xs,
    marginRight: SPACING.xs,
  },
  characterCountText: {
    fontSize: FONT_SIZES.tiny,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  characterCountWarning: {
    color: '#DC2626',
    fontWeight: '600',
  },
});

export default ChatInput;