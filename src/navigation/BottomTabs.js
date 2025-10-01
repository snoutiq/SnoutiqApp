<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { 
  StyleSheet, 
  View, 
  Platform, 
  Keyboard, 
  Animated,
  Dimensions 
} from "react-native";
=======
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { useEffect, useRef, useState } from 'react';
// import { Animated, Dimensions, Keyboard, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
// import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
// import Icon from 'react-native-vector-icons/Ionicons';
// import Appointment from '../components/Appointments';
// import HomePage from '../components/HomePage';
// import ProfileScreen from '../components/ProfileScreen';
// import SocialMedia from '../components/SocialMedia';

// const Tab = createBottomTabNavigator();
// const { width } = Dimensions.get('window');

// const macDockColors = {
//   background: 'rgba(255, 255, 255, 0.9)',
//   border: 'rgba(200, 200, 200, 0.5)',
//   active: '#1783BB',
//   inactive: '#555',
//   indicator: '#1783BB',
// };

// const MacDockTabBar = ({ state, descriptors, navigation }) => {
//   const iconScale = useRef(state.routes.map(() => new Animated.Value(1))).current;
//   const [keyboardVisible, setKeyboardVisible] = useState(false);

//   useEffect(() => {
//     const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
//     const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

//     return () => {
//       showSub.remove();
//       hideSub.remove();
//     };
//   }, []);

//   // If keyboard is visible, hide the dock
//   if (keyboardVisible) return null;

//   return (
//     <View style={styles.dockContainer}>
//       <View style={styles.dock}>
//         {state.routes.map((route, index) => {
//           const { options } = descriptors[route.key];
//           const isFocused = state.index === index;

//           const onPress = () => {
//             const event = navigation.emit({
//               type: 'tabPress',
//               target: route.key,
//               canPreventDefault: true,
//             });

//             if (!isFocused && !event.defaultPrevented) {
//               navigation.navigate(route.name);
//             }

//             Animated.sequence([
//               Animated.timing(iconScale[index], {
//                 toValue: 1.3,
//                 duration: 100,
//                 useNativeDriver: true,
//               }),
//               Animated.timing(iconScale[index], {
//                 toValue: 1,
//                 duration: 200,
//                 useNativeDriver: true,
//               }),
//             ]).start();
//           };

//           const onLongPress = () => {
//             navigation.emit({
//               type: 'tabLongPress',
//               target: route.key,
//             });
//           };

//           const iconName = {
//             HomePage: 'home-outline',
//             SocialMedia: 'images-outline',
//             Appointment: 'document-text-outline',
//             Profile: 'person-outline'
//           }[route.name];

//           return (
//             <TouchableOpacity
//               key={route.key}
//               accessibilityRole="button"
//               accessibilityState={isFocused ? { selected: true } : {}}
//               accessibilityLabel={options.tabBarAccessibilityLabel}
//               testID={options.tabBarTestID}
//               onPress={onPress}
//               onLongPress={onLongPress}
//               style={styles.dockIconContainer}
//             >
//               <Animated.View style={[
//                 styles.dockIconWrapper,
//                 isFocused && styles.dockIconWrapperFocused,
//                 { transform: [{ scale: iconScale[index] }] }
//               ]}>
//                 <Icon
//                   name={iconName}
//                   size={moderateScale(28)}
//                   color={isFocused ? macDockColors.active : macDockColors.inactive}
//                 />
//               </Animated.View>
//               {isFocused && <View style={styles.indicator} />}
//             </TouchableOpacity>
//           );
//         })}
//       </View>
//     </View>
//   );
// };

// const BottomTabs = () => {
//   return (
//     <Tab.Navigator
//       tabBar={props => <MacDockTabBar {...props} />}
//       screenOptions={{
//         headerShown: false,
//         tabBarHideOnKeyboard: true, // This works with keyboard visibility
//       }}
//     >
//       <Tab.Screen name="HomePage" component={HomePage} />
//       <Tab.Screen name="SocialMedia" component={SocialMedia} />
//       <Tab.Screen name="Appointment" component={Appointment} />
//       <Tab.Screen name="Profile" component={ProfileScreen} />
//     </Tab.Navigator>
//   );
// };

// const styles = StyleSheet.create({
//   dockContainer: {
//     position: 'absolute',
//     bottom: verticalScale(5),
//     left: 0,
//     right: 0,
//     alignItems: 'center',
//     zIndex: 1000,
//   },
//   dock: {
//     flexDirection: 'row',
//     backgroundColor: macDockColors.background,
//     borderRadius: moderateScale(30),
//     paddingHorizontal: scale(15),
//     paddingVertical: verticalScale(1),
//     marginHorizontal: scale(20),
//     borderWidth: 1,
//     borderColor: macDockColors.border,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 8,
//     elevation: 5,
//     ...Platform.select({
//       web: {
//         backdropFilter: 'blur(10px)',
//         WebkitBackdropFilter: 'blur(10px)',
//       },
//     }),
//   },
//   dockIconContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   dockIconWrapper: {
//     width: moderateScale(35),
//     height: moderateScale(35),
//     borderRadius: moderateScale(10),
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: verticalScale(4),
//   },
//   dockIconWrapperFocused: {
//     backgroundColor: 'rgba(23, 131, 187, 0.15)',
//   },
//   indicator: {
//     width: moderateScale(5),
//     height: moderateScale(5),
//     borderRadius: moderateScale(2.5),
//     backgroundColor: macDockColors.indicator,
//   },
// });

// export default BottomTabs;
// import React from 'react';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { Ionicons } from '@expo/vector-icons';

// import HomePage from '../components/HomePage';
// import ProfileScreen from '../components/ProfileScreen';
// import SocialMedia from '../components/SocialMedia';
// import Chat from '../components/Chat';
// import CommunityScreen from '../components/CommunityScreen';

// const Tab = createBottomTabNavigator();

// export default function MainTabNavigator() {
//   return (
//     <Tab.Navigator
//       screenOptions={({ route }) => ({
//         headerShown: false,
//         tabBarIcon: ({ focused, color, size }) => {
//           let iconName;

//           if (route.name === 'Home') {
//             iconName = focused ? 'home' : 'home-outline';
//           } else if (route.name === 'Chat') {
//             iconName = focused ? 'chatbubble' : 'chatbubble-outline';
//           } else if (route.name === 'Community') {
//             iconName = focused ? 'people' : 'people-outline';
//           } else if (route.name === 'Pet') {
//             iconName = focused ? 'heart' : 'heart-outline';
//           }

//           return <Ionicons name={iconName} size={size} color={color} />;
//         },
//         tabBarActiveTintColor: '#7C3AED',
//         tabBarInactiveTintColor: '#9CA3AF',
//         tabBarStyle: {
//           backgroundColor: 'white',
//           borderTopWidth: 1,
//           borderTopColor: '#E5E7EB',
//           paddingBottom: 8,
//           paddingTop: 8,
//           height: 60,
//         },
//         tabBarLabelStyle: {
//           fontSize: 12,
//           fontWeight: '500',
//         },
//       })}
//     >
//       <Tab.Screen name="HomePage" component={HomePage} />
//       <Tab.Screen name="Chat" component={Chat} />
//       <Tab.Screen name="CommunityScreen" component={CommunityScreen} />
//       <Tab.Screen name="ProfileScreen" component={ProfileScreen} />
//     </Tab.Navigator>
//   );
// }

import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View, Platform, Keyboard, Animated } from "react-native";
>>>>>>> fdb97ac69712ac6dd31d59a4c4ffb6804fec3982

import HomePage from "../components/HomePage";
import SocialMedia from "../components/SocialMedia";
import Chat from "../components/Chat";
import CommunityScreen from "../components/CommunityScreen";
<<<<<<< HEAD
import ProfileScreen from "../components/ProfileScreen";
import PetServices from "../components/PetServices";
=======
>>>>>>> fdb97ac69712ac6dd31d59a4c4ffb6804fec3982

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const tabBarOpacity = useState(new Animated.Value(1))[0];
<<<<<<< HEAD
  const tabBarTranslateY = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(true);
        Animated.parallel([
          Animated.timing(tabBarOpacity, {
            toValue: 0.9,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(tabBarTranslateY, {
            toValue: 5,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start();
=======

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        // Keep tab bar visible but slightly transparent during keyboard usage
        Animated.timing(tabBarOpacity, {
          toValue: 0.95,
          duration: 250,
          useNativeDriver: true,
        }).start();
>>>>>>> fdb97ac69712ac6dd31d59a4c4ffb6804fec3982
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
<<<<<<< HEAD
        Animated.parallel([
          Animated.timing(tabBarOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(tabBarTranslateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start();
=======
        Animated.timing(tabBarOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start();
>>>>>>> fdb97ac69712ac6dd31d59a4c4ffb6804fec3982
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

<<<<<<< HEAD
  const getTabBarIcon = (routeName, focused, color) => {
    const iconConfig = {
      Home: {
        icon: focused ? "home" : "home-outline",
        label: "Home",
        gradient: ["#FF6B6B", "#FF8E8E"]
      },
      Chat: {
        icon: focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline",
        label: "Chat",
        gradient: ["#4ECDC4", "#88D3CE"]
      },
      Social: {
        icon: focused ? "share-social" : "share-social-outline",
        label: "Social",
        gradient: ["#45B7D1", "#7EC8E3"]
      },
      // Community: {
      //   icon: focused ? "people" : "people-outline",
      //   label: "Community",
      //   gradient: ["#96CEB4", "#B2D8B2"]
      // },
      PetServices: {
        icon: focused ? "people" : "people-outline",
        label: "PetServices",
        gradient: ["#96CEB4", "#B2D8B2"]
      },
      Profile: {
        icon: focused ? "person" : "person-outline",
        label: "Profile",
        gradient: ["#FFD166", "#FFDF8E"]
      }
    };

    const config = iconConfig[routeName] || { icon: "paw", label: "Pet" };

    return (
      <View style={styles.iconContainer}>
        <View style={[
          styles.iconWrapper,
          focused && styles.iconWrapperFocused,
          focused && { backgroundColor: config.gradient[0] + '20' }
        ]}>
          <Ionicons 
            name={config.icon} 
            size={focused ? 26 : 24} 
            color={focused ? config.gradient[0] : color} 
          />
        </View>
        {focused && (
          <View style={[styles.activeIndicator, { backgroundColor: config.gradient[0] }]} />
        )}
      </View>
    );
  };

=======
>>>>>>> fdb97ac69712ac6dd31d59a4c4ffb6804fec3982
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
<<<<<<< HEAD
        tabBarIcon: ({ focused, color }) => getTabBarIcon(route.name, focused, color),
        tabBarActiveTintColor: "#FF6B6B",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarHideOnKeyboard: false,
        tabBarStyle: [
          styles.tabBar,
          {
            opacity: tabBarOpacity,
            transform: [
              { 
                translateY: tabBarTranslateY.interpolate({
                  inputRange: [0, 5],
                  outputRange: [0, 2],
                }) 
              },
              { 
                scale: tabBarOpacity.interpolate({
                  inputRange: [0.9, 1],
                  outputRange: [0.98, 1],
                }) 
              }
            ],
            bottom: isKeyboardVisible ? (Platform.OS === 'ios' ? -10 : -5) : 0,
=======
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let iconSize = focused ? 26 : 24;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Chat") {
            iconName = focused
              ? "chatbubble-ellipses"
              : "chatbubble-ellipses-outline";
          } else if (route.name === "Community") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "Social") {
            iconName = focused ? "share-social" : "share-social-outline";
          }

          return (
            <View
              style={
                focused ? styles.iconContainerFocused : styles.iconContainer
              }
            >
              <Ionicons name={iconName} size={iconSize} color={color} />
              {focused && <View style={styles.activeDot} />}
            </View>
          );
        },
        tabBarActiveTintColor: "#4F46E5",
        tabBarInactiveTintColor: "#6B7280",
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarHideOnKeyboard: false, // Keep tab bar visible
        tabBarStyle: [
          styles.tabBar,
          {
            // Dynamic positioning - stay at bottom but adjust for keyboard
            position: 'absolute',
            bottom: Platform.OS === 'ios' 
              ? (isKeyboardVisible ? 0 : 25) 
              : (isKeyboardVisible ? 0 : 10),
            left: isKeyboardVisible ? 0 : 20,
            right: isKeyboardVisible ? 0 : 20,
            borderRadius: isKeyboardVisible ? 0 : 20,
            opacity: tabBarOpacity,
            transform: [{ 
              scale: tabBarOpacity.interpolate({
                inputRange: [0.95, 1],
                outputRange: [0.98, 1],
              }) 
            }],
>>>>>>> fdb97ac69712ac6dd31d59a4c4ffb6804fec3982
          }
        ],
      })}
    >
<<<<<<< HEAD
      <Tab.Screen 
        name="Home" 
        component={HomePage}
        options={{
          tabBarLabel: ({ focused }) => (
            <View style={styles.labelContainer}>
              <Animated.Text 
                style={[
                  styles.tabBarLabel,
                  focused && styles.tabBarLabelActive,
                  focused && { color: "#FF6B6B" }
                ]}
              >
                Home
              </Animated.Text>
            </View>
          )
        }}
      />
      <Tab.Screen 
        name="Chat" 
        component={Chat}
        options={{
          tabBarLabel: ({ focused }) => (
            <View style={styles.labelContainer}>
              <Animated.Text 
                style={[
                  styles.tabBarLabel,
                  focused && styles.tabBarLabelActive,
                  focused && { color: "#4ECDC4" }
                ]}
              >
                Chat
              </Animated.Text>
            </View>
          )
        }}
      />
      <Tab.Screen 
        name="Social" 
        component={SocialMedia}
        options={{
          tabBarLabel: ({ focused }) => (
            <View style={styles.labelContainer}>
              <Animated.Text 
                style={[
                  styles.tabBarLabel,
                  focused && styles.tabBarLabelActive,
                  focused && { color: "#45B7D1" }
                ]}
              >
                Social
              </Animated.Text>
            </View>
          )
        }}
      />
      {/* <Tab.Screen 
        name="Community" 
        component={CommunityScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <View style={styles.labelContainer}>
              <Animated.Text 
                style={[
                  styles.tabBarLabel,
                  focused && styles.tabBarLabelActive,
                  focused && { color: "#96CEB4" }
                ]}
              >
                Community
              </Animated.Text>
            </View>
          )
        }}
      /> */}
       <Tab.Screen 
        name="PetServices" 
        component={PetServices}
        options={{
          tabBarLabel: ({ focused }) => (
            <View style={styles.labelContainer}>
              <Animated.Text 
                style={[
                  styles.tabBarLabel,
                  focused && styles.tabBarLabelActive,
                  focused && { color: "#96CEB4" }
                ]}
              >
                PetServices
              </Animated.Text>
            </View>
          )
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <View style={styles.labelContainer}>
              <Animated.Text 
                style={[
                  styles.tabBarLabel,
                  focused && styles.tabBarLabelActive,
                  focused && { color: "#FFD166" }
                ]}
              >
                Profile
              </Animated.Text>
            </View>
          )
        }}
      />
=======
      <Tab.Screen name="Home" component={HomePage} />
      <Tab.Screen name="Chat" component={Chat} />
      <Tab.Screen name="Social" component={SocialMedia} />
      <Tab.Screen name="Community" component={CommunityScreen} />
>>>>>>> fdb97ac69712ac6dd31d59a4c4ffb6804fec3982
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#FFFFFF",
<<<<<<< HEAD
    borderTopWidth: 0,
    height: Platform.OS === 'ios' ? 90 : 80,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { 
      width: 0, 
      height: -4 
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  tabBarItem: {
    paddingVertical: 6,
    height: '100%',
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
    color: "#94A3B8",
    letterSpacing: -0.2,
  },
  tabBarLabelActive: {
    fontWeight: "700",
    fontSize: 11.5,
  },
  labelContainer: {
    alignItems: 'center',
=======
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    height: 80,
    paddingBottom: 12,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tabBarItem: {
    paddingVertical: 4,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
>>>>>>> fdb97ac69712ac6dd31d59a4c4ffb6804fec3982
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
<<<<<<< HEAD
    position: 'relative',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    transition: 'all 0.3s ease',
  },
  iconWrapperFocused: {
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  // Floating effect styles
  floatingContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 16,
  }
=======
    padding: 4,
  },
  iconContainerFocused: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    backgroundColor: "#EEF2FF",
    borderRadius: 16,
    marginBottom: 4,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#4F46E5",
    marginTop: 4,
  },
>>>>>>> fdb97ac69712ac6dd31d59a4c4ffb6804fec3982
});