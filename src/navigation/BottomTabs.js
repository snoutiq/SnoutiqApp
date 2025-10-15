import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Keyboard,
  Platform,
  StyleSheet,
  View,
} from "react-native";

import AppointmentScreen from "../components/AppointmentScreen";
import Chat from "../components/Chat";
import HomePage from "../components/HomePage";
import ProfileScreen from "../components/ProfileScreen";

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get("window");

export default function MainTabNavigator() {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const tabBarOpacity = useState(new Animated.Value(1))[0];
  const tabBarTranslateY = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidHide",
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
          }),
        ]).start();
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
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
          }),
        ]).start();
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const getTabBarIcon = (routeName, focused, color) => {
    const iconConfig = {
      Home: {
        icon: focused ? "medical" : "medical-outline",
        label: "Home",
        gradient: ["#FF6B6B", "#FF8E8E"],
      },
      Chat: {
        icon: focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline",
        label: "Chat",
        gradient: ["#4ECDC4", "#88D3CE"],
      },
      // Social: {
      //   icon: focused ? "share-social" : "share-social-outline",
      //   label: "Social",
      //   gradient: ["#45B7D1", "#7EC8E3"],
      // },
      AppointmentScreen: {
        icon: focused ? "people" : "people-outline",
        label: "AppointmentScreen",
        gradient: ["#96CEB4", "#B2D8B2"]
      },
      // PetServices: {
      //   icon: focused ? "people" : "people-outline",
      //   label: "PetServices",
      //   gradient: ["#96CEB4", "#B2D8B2"],
      // },
      Profile: {
        icon: focused ? "person" : "person-outline",
        label: "Profile",
        gradient: ["#FFD166", "#FFDF8E"],
      },
    };

    const config = iconConfig[routeName] || { icon: "paw", label: "Pet" };

    return (
      <View style={styles.iconContainer}>
        <Animated.View
          style={[
            styles.iconWrapper,
            focused && styles.iconWrapperFocused,
            focused && { transform: [{ translateY: -6 }, { scale: 1.06 }] },
          ]}
        >
          {focused && (
            <LinearGradient
              colors={[config.gradient[0] + "33", config.gradient[1] + "18"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.focusGlow}
            />
          )}
          <Ionicons
            name={config.icon}
            size={focused ? 28 : 24}
            color={focused ? config.gradient[0] : color}
          />
        </Animated.View>
        {focused && (
          <View
            style={[
              styles.activeIndicator,
              { backgroundColor: config.gradient[0] },
            ]}
          />
        )}
      </View>
    );
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        
        tabBarIcon: ({ focused, color }) =>
          getTabBarIcon(route.name, focused, color),
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
                }),
              },
              {
                scale: tabBarOpacity.interpolate({
                  inputRange: [0.9, 1],
                  outputRange: [0.98, 1],
                }),
              },
            ],
            bottom: isKeyboardVisible ? (Platform.OS === "ios" ? -10 : -5) : 0,
          },
        ],
        tabBarBackground: () => (
          <LinearGradient
            colors={["#FFFFFF", "#F8FAFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        ),
      })}
    >
   
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
                  focused && { color: "#4ECDC4" },
                ]}
                options={{ unmountOnBlur: true }}
              >
                Chat
              </Animated.Text>
            </View>
          ),
        }}
      />

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
                  focused && { color: "#FF6B6B" },
                ]}
              >
                Services
              </Animated.Text>
            </View>
          ),
        }}
      />
     
      {/* <Tab.Screen
        name="Social"
        component={SocialMedia}
        options={{
          tabBarLabel: ({ focused }) => (
            <View style={styles.labelContainer}>
              <Animated.Text
                style={[
                  styles.tabBarLabel,
                  focused && styles.tabBarLabelActive,
                  focused && { color: "#45B7D1" },
                ]}
              >
                Social
              </Animated.Text>
            </View>
          ),
        }}
      /> */}
      <Tab.Screen 
        name="AppointmentScreen" 
        component={AppointmentScreen}
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
                Health Records
              </Animated.Text>
            </View>
          )
        }}
      />
      {/* <Tab.Screen
        name="PetServices"
        component={PetServices}
        options={{
          tabBarLabel: ({ focused }) => (
            <View style={styles.labelContainer}>
              <Animated.Text
                style={[
                  styles.tabBarLabel,
                  focused && styles.tabBarLabelActive,
                  focused && { color: "#96CEB4" },
                ]}
              >
                PetServices
              </Animated.Text>
            </View>
          ),
        }}
      /> */}
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
                  focused && { color: "#FFD166" },
                ]}
              >
                Profile
              </Animated.Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderTopWidth: 0,
    height: Platform.OS === "ios" ? 92 : 82,
    paddingBottom: Platform.OS === "ios" ? 28 : 14,
    paddingTop: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -6,
    },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 18,
    position: "absolute",
    left: 12,
    right: 12,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#E9EEF6",
  },
  tabBarItem: {
    paddingVertical: 6,
    height: "100%",
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
    alignItems: "center",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  iconWrapperFocused: {
    backgroundColor: "rgba(255,255,255,0.9)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  focusGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    opacity: 1,
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  // Floating effect styles
  floatingContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 16,
  },
});
