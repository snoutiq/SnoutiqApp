import React, { useEffect, useState, useContext } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const DetailedWeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://snoutiq.com/backend/api/weather/by-coords?lat=${user.latitude}&lon=${user.longitude}`
      );
      if (response.data.status === "success") {
        setWeather(response.data);
        setError(null);
      } else {
        setError("Unable to fetch weather data");
      }
    } catch (err) {
      setError("Failed to load weather");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (condition) => {
    if (!condition) return "cloud-outline";
    const c = condition.toLowerCase();
    if (c.includes("sun") || c.includes("clear")) return "sunny-outline";
    if (c.includes("cloud")) return "cloud-outline";
    if (c.includes("rain")) return "rainy-outline";
    if (c.includes("fog") || c.includes("mist")) return "cloudy-outline";
    if (c.includes("snow")) return "snow-outline";
    return "partly-sunny-outline";
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingText}>Loading weather...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning-outline" size={16} color="#DC2626" />
        <Text style={styles.errorText}>Weather unavailable</Text>
      </View>
    );
  }

  if (!weather) return null;

  return (
    <LinearGradient
      colors={["#E0F2FE", "#F0F9FF"]}
      style={styles.weatherContainer}
    >
      <Ionicons
        name={getWeatherIcon(weather.current.weather)}
        size={20}
        color="#0284C7"
        style={styles.icon}
      />
      <Text style={styles.tempText}>{weather.current.temperatureC}°C</Text>
      <Text style={styles.detailsText}>
        {weather.current.weather} • Feels like {weather.current.feelsLikeC}°C
      </Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  weatherContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#E0F2FE",
  },
  icon: {
    marginRight: 6,
  },
  tempText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0369A1",
    marginRight: 6,
  },
  detailsText: {
    fontSize: 12,
    color: "#0284C7",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F2FE",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  loadingText: {
    fontSize: 12,
    color: "#0369A1",
    marginLeft: 6,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  errorText: {
    fontSize: 12,
    color: "#DC2626",
    marginLeft: 4,
  },
});

export default DetailedWeatherWidget;
