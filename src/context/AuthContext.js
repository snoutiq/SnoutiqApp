import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [chatRoomToken, setChatRoomToken] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      const storedUser = await AsyncStorage.getItem('userData');
      const storedSessionToken = await AsyncStorage.getItem('sessionToken');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setSessionToken(storedSessionToken);
        setIsLoggedIn(true);
        console.log('✅ User authenticated from storage');
      } else {
        console.log('❌ No authentication data found');
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('❌ Error checking auth state:', error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData, userToken, userSessionToken) => {
    try {
      // Store data in AsyncStorage
      await AsyncStorage.setItem('userToken', userToken);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      if (userSessionToken) {
        await AsyncStorage.setItem('sessionToken', userSessionToken);
      }

      // Update state
      setUser(userData);
      setToken(userToken);
      setSessionToken(userSessionToken);
      setIsLoggedIn(true);

      console.log('✅ User logged in successfully');
    } catch (error) {
      console.error('❌ Error saving auth data:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Remove data from AsyncStorage
     const profileKey = user?.id ? `profileCompleted:${user.id}` : null;
		 const keys = ['userToken','userData','sessionToken','chatRoomToken'];
		 if (profileKey) keys.push(profileKey);
		 await AsyncStorage.multiRemove(keys);

      // Clear state
      setUser(null);
      setToken(null);
      setSessionToken(null);
      setIsLoggedIn(false);
      setChatRoomToken(null)

      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('❌ Error during logout:', error);
      throw error;
    }
  };

  const updateUser = async (updatedUserData) => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
      setUser(updatedUserData);
      console.log('✅ User data updated');
    } catch (error) {
      console.error('❌ Error updating user data:', error);
      throw error;
    }
  };

  const updateChatRoomToken = async (token) => {
    try {
      setChatRoomToken(token);
      if (token) {
        await AsyncStorage.setItem('chatRoomToken', token);
      } else {
        await AsyncStorage.removeItem('chatRoomToken');
      }
    } catch (err) {
      console.error("❌ Error storing chatRoomToken:", err);
    }
  };


  const value = {
    user,
    token,
    sessionToken,
    chatRoomToken, // 🆕
    updateChatRoomToken, // 🆕
    isLoggedIn,
    isLoading,
    login,
    logout,
    updateUser,
    checkAuthState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


