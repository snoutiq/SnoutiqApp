import axios from 'axios';
import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [chatRoomToken, setChatRoomToken] = useState(null);
  const [nearbyDoctors, setNearbyDoctors] = useState([]);

  // 🔹 Load from AsyncStorage on mount
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("token");
        const savedUser = await AsyncStorage.getItem("user");
        const savedChatRoomToken = await AsyncStorage.getItem("chat_room_token");
        const savedDoctors = await AsyncStorage.getItem("nearby_doctors");

        if (savedToken) setToken(savedToken);
        if (savedUser) setUser(JSON.parse(savedUser));
        if (savedChatRoomToken) setChatRoomToken(savedChatRoomToken);
        if (savedDoctors) setNearbyDoctors(JSON.parse(savedDoctors));
      } catch (error) {
        console.error('Error loading auth data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAuthData();
  }, []);

  // 🔹 Fetch nearby doctors
  const fetchNearbyDoctors = useCallback(async () => {
    if (!token || !user?.id) return;

    try {
      const response = await axios.get(
        `https://snoutiq.com/backend/api/nearby-vets?user_id=${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && Array.isArray(response.data.data)) {
        updateNearbyDoctors(response.data.data); // Save in context + AsyncStorage
      }
    } catch (error) {
      console.error("Failed to fetch nearby doctors", error);
    }
  }, [token, user?.id]);

  // 🔹 Login function
  const login = async (userData, jwtToken, initialChatToken = null) => {
    try {
      setUser(userData);
      setToken(jwtToken);

      await AsyncStorage.setItem("token", jwtToken);
      await AsyncStorage.setItem("user", JSON.stringify(userData));

      if (initialChatToken) {
        setChatRoomToken(initialChatToken);
        await AsyncStorage.setItem("chat_room_token", initialChatToken);
      }

      // ✅ Fetch nearby doctors after login
      fetchNearbyDoctors();
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  };

  // 🔹 Update nearby doctors
  const updateNearbyDoctors = async (newDoctors) => {
    try {
      setNearbyDoctors((prev) => {
        const existingIds = new Set(prev.map((d) => d.id));
        const merged = [
          ...prev,
          ...newDoctors.filter((d) => !existingIds.has(d.id)),
        ];
        AsyncStorage.setItem("nearby_doctors", JSON.stringify(merged));
        return merged;
      });
    } catch (error) {
      console.error('Error updating nearby doctors:', error);
    }
  };

  // 🔹 Logout function
  const logout = async () => {
    try {
      setUser(null);
      setToken(null);
      setChatRoomToken(null);
      setNearbyDoctors([]);

      await AsyncStorage.multiRemove(["token", "user", "chat_room_token", "nearby_doctors"]);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const authValue = {
    user,
    token,
    chatRoomToken,
    login,
    logout,
    fetchNearbyDoctors,  // 🔹 Expose function to call manually if needed
    nearbyDoctors,
    updateNearbyDoctors,
    loading,
    isLoggedIn: !!token,
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 🔹 Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
