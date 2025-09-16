import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Constants from 'expo-constants';


const NotificationsScreen = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  // const ServerURL = process.env.EXPO_PUBLIC_SERVER_URL;
    const ServerURL = Constants.expoConfig.extra.serverUrl;

  const navigation = useNavigation();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          `${ServerURL}notification/notifications/${user.id}`
        );
        const data = res.data.data || [];

        // Filter only notifications with company_name
        const validNotifications = data.filter((n) => n.company_name);
        setNotifications(validNotifications);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    const markAllRead = async () => {
      try {
        await axios.put(
          `${ServerURL}notification/notifications/mark_all_read/${user.id}`
        );
      } catch (err) {
        console.error("Mark read error:", err);
      }
    };

    fetchNotifications();
    markAllRead();
  }, [user.id]);

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#1783BB"
        style={{ marginTop: 40 }}
      />
    );
  }

  const renderItem = ({ item }) => {
    const isUnread = !item.is_read;

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          isUnread && styles.unreadNotificationItem
        ]}
        onPress={() =>
          navigation.navigate("Main", {
            screen: "ApplicationStatus",
            params: {
              applicationId: item.reference_id,
              jobDetails: {
                title: item.title,
                company: item.company_name || "Company Name",
                status: item.message?.split(" ").pop(),
              },
            },
          })
        }
      >
        <Text style={[styles.title, isUnread && styles.unreadTitle]}>
          {item.title}
        </Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>
          {new Date(item.created_at).toLocaleString()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {notifications.length === 0 ? (
        <Text style={styles.noNotifications}>No notifications available</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
backgroundColor: "#F0F4FF",
  },
  notificationItem: {
    backgroundColor: "#F3F4F6", // Read
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#E5E7EB", // subtle gray for read
  },
  unreadNotificationItem: {
    backgroundColor: "#E0F2FE", // Unread bg light blue
    borderLeftColor: "#0284C7", // Blue accent
  },
  title: {
    fontWeight: "bold",
    color: "#111827",
    fontSize: 16,
  },
  unreadTitle: {
    color: "#0F172A", // Slightly darker for unread
  },
  message: {
    color: "#374151",
    marginTop: 4,
  },
  time: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 6,
    textAlign: "right",
  },
  noNotifications: {
    textAlign: "center",
    marginTop: 40,
    color: "#9CA3AF",
    fontSize: 16,
  },
});

export default NotificationsScreen;
