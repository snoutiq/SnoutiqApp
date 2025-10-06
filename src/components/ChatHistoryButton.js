// import React, { useState, useRef } from 'react';
// import {
//   TouchableOpacity,
//   StyleSheet,
//   Animated,
//   View,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { moderateScale } from 'react-native-size-matters';
// import ChatHistorySidebar from './ChatHistorySidebar';

// const ChatHistoryButton = ({ navigation, currentChatRoomToken }) => {
//   const [showSidebar, setShowSidebar] = useState(false);
//   const scaleAnim = useRef(new Animated.Value(1)).current;
//   const rotateAnim = useRef(new Animated.Value(0)).current;

//   const handlePress = () => {
//     // Button animation
//     Animated.sequence([
//       Animated.parallel([
//         Animated.timing(scaleAnim, {
//           toValue: 0.85,
//           duration: 100,
//           useNativeDriver: true,
//         }),
//         Animated.timing(rotateAnim, {
//           toValue: 1,
//           duration: 100,
//           useNativeDriver: true,
//         }),
//       ]),
//       Animated.parallel([
//         Animated.timing(scaleAnim, {
//           toValue: 1,
//           duration: 100,
//           useNativeDriver: true,
//         }),
//         Animated.timing(rotateAnim, {
//           toValue: 0,
//           duration: 100,
//           useNativeDriver: true,
//         }),
//       ]),
//     ]).start();

//     setShowSidebar(true);
//   };

//   const rotate = rotateAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: ['0deg', '15deg'],
//   });

//   return (
//     <>
//       <Animated.View style={{ transform: [{ scale: scaleAnim }, { rotate }] }}>
//         <TouchableOpacity
//           style={styles.button}
//           onPress={handlePress}
//           activeOpacity={0.7}
//         >
//           <View style={styles.iconContainer}>
//             <Ionicons name="time-outline" size={20} color="#FFFFFF" />
//           </View>
//         </TouchableOpacity>
//       </Animated.View>

//       <ChatHistorySidebar
//         visible={showSidebar}
//         onClose={() => setShowSidebar(false)}
//         navigation={navigation}
//         currentChatRoomToken={currentChatRoomToken}
//       />
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   button: {
//     width: moderateScale(40),
//     height: moderateScale(40),
//     borderRadius: moderateScale(20),
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: moderateScale(8),
//   },
//   iconContainer: {
//     position: 'relative',
//   },
//   badge: {
//     position: 'absolute',
//     top: -6,
//     right: -6,
//     backgroundColor: '#EF4444',
//     borderRadius: 10,
//     minWidth: moderateScale(18),
//     height: moderateScale(18),
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: moderateScale(4),
//     borderWidth: 2,
//     borderColor: '#FFFFFF',
//   },
//   badgeText: {
//     fontSize: moderateScale(10),
//     fontWeight: '700',
//     color: '#FFFFFF',
//   },
// });

// export default ChatHistoryButton;

import React, { useState, useRef } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import ChatHistorySidebar from './ChatHistorySidebar';

// Responsive constants
const SPACING = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(12),
  lg: moderateScale(16),
  xl: moderateScale(20),
  xxl: moderateScale(24),
};

const ChatHistoryButton = ({ navigation, currentChatRoomToken }) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    // Button animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.85,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    setShowSidebar(true);
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '15deg'],
  });

  return (
    <>
      <Animated.View style={{ 
        transform: [{ scale: scaleAnim }, { rotate }],
        marginRight: SPACING.sm 
      }}>
        <TouchableOpacity
          style={styles.button}
          onPress={handlePress}
          activeOpacity={0.7}
          hitSlop={{
            top: verticalScale(10),
            bottom: verticalScale(10),
            left: verticalScale(10),
            right: verticalScale(10)
          }}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="time-outline" size={scale(20)} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </Animated.View>

      <ChatHistorySidebar
        visible={showSidebar}
        onClose={() => setShowSidebar(false)}
        navigation={navigation}
        currentChatRoomToken={currentChatRoomToken}
      />
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: verticalScale(-6),
    right: verticalScale(-6),
    backgroundColor: '#EF4444',
    borderRadius: scale(10),
    minWidth: scale(18),
    height: scale(18),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
    borderWidth: scale(2),
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(1) },
    shadowOpacity: 0.2,
    shadowRadius: scale(2),
    elevation: 3,
  },
  badgeText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ChatHistoryButton;