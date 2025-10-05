import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import {
  StyleSheet,
  View,
  Platform,
  Keyboard,
  Animated,
  Dimensions,
} from "react-native";

import HomePage from "../components/HomePage";
import SocialMedia from "../components/SocialMedia";
import Chat from "../components/Chat";
import CommunityScreen from "../components/CommunityScreen";
import ProfileScreen from "../components/ProfileScreen";
import PetServices from "../components/PetServices";

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
        icon: focused ? "home" : "home-outline",
        label: "Home",
        gradient: ["#FF6B6B", "#FF8E8E"],
      },
      Chat: {
        icon: focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline",
        label: "Chat",
        gradient: ["#4ECDC4", "#88D3CE"],
      },
      Social: {
        icon: focused ? "share-social" : "share-social-outline",
        label: "Social",
        gradient: ["#45B7D1", "#7EC8E3"],
      },
      // Community: {
      //   icon: focused ? "people" : "people-outline",
      //   label: "Community",
      //   gradient: ["#96CEB4", "#B2D8B2"]
      // },
      PetServices: {
        icon: focused ? "people" : "people-outline",
        label: "PetServices",
        gradient: ["#96CEB4", "#B2D8B2"],
      },
      Profile: {
        icon: focused ? "person" : "person-outline",
        label: "Profile",
        gradient: ["#FFD166", "#FFDF8E"],
      },
    };

    const config = iconConfig[routeName] || { icon: "paw", label: "Pet" };

    return (
      <View style={styles.iconContainer}>
        <View
          style={[
            styles.iconWrapper,
            focused && styles.iconWrapperFocused,
            focused && { backgroundColor: config.gradient[0] + "20" },
          ]}
        >
          <Ionicons
            name={config.icon}
            size={focused ? 26 : 24}
            color={focused ? config.gradient[0] : color}
          />
        </View>
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
      })}
    >
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
                Home
              </Animated.Text>
            </View>
          ),
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
                  focused && { color: "#96CEB4" },
                ]}
              >
                PetServices
              </Animated.Text>
            </View>
          ),
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
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0,
    height: Platform.OS === "ios" ? 90 : 80,
    paddingBottom: Platform.OS === "ios" ? 30 : 15,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
    position: "absolute",
    left: 16,
    right: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#F1F5F9",
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
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    transition: "all 0.3s ease",
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
