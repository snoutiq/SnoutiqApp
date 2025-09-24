import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createDrawerNavigator } from '@react-navigation/drawer';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import MainStack from './MainStack';
import SettingsStack from './SettingsStack';

const { width } = Dimensions.get('window');
const Drawer = createDrawerNavigator();

const CustomDrawerContent = ({ navigation }) => {
  const { logout, user, token, updateChatRoomToken } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchRooms = async () => {
    setLoadingRooms(true);
    setError(null);
    try {
      let authToken = token;
      if (!authToken) authToken = await AsyncStorage.getItem('userToken');

      const url = `https://snoutiq.com/backend/api/chat/listRooms?user_id=${user.id}`;
      const res = await axios.get(url, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });

      if (res?.data?.rooms && Array.isArray(res.data.rooms)) {
        const sorted = res.data.rooms
          .slice()
          .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
        setRooms(sorted);
      } else {
        setRooms([]);
      }
    } catch (err) {
      console.error('Failed to fetch chat rooms', err);
      setError('Unable to load chats');
      setRooms([]);
    } finally {
      setLoadingRooms(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRooms();
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const openRoom = async (room) => {
    try {
      if (typeof updateChatRoomToken === 'function') {
        updateChatRoomToken(room.chat_room_token);
      }
    } catch (e) {
      console.warn('updateChatRoomToken not available in AuthContext');
    }

    navigation.navigate('Main', {
      screen: 'Tabs',
      params: {
        screen: 'HomePage',
        params: {
          chat_room_token: room.chat_room_token,
          chat_room_id: room.id,
          roomName: room.name,
        },
      },
    });
  };

  const renderRoom = ({ item }) => {
    const label = item.name ? item.name : `Chat ${item.id}`;
    const subtitle = item.updated_at ? new Date(item.updated_at).toLocaleString() : null;

    return (
      <TouchableOpacity style={styles.menuItem} onPress={() => openRoom(item)}>
        <Icon name="chatbubbles-outline" size={moderateScale(20)} color="#4F4F4F" />
        <View style={{ marginLeft: moderateScale(12), flex: 1 }}>
          <Text numberOfLines={1} style={styles.menuItemText}>
            {label}
          </Text>
          {subtitle ? <Text numberOfLines={1} style={styles.roomSubtitle}>{subtitle}</Text> : null}
        </View>
        <Icon name="chevron-forward" size={moderateScale(16)} color="#828282" />
      </TouchableOpacity>
    );
  };

  const ListEmptyComponent = () => {
    if (loadingRooms) return null;
    return (
      <View style={{ padding: moderateScale(16) }}>
        <Text style={{ color: '#828282', fontSize: moderateScale(13) }}>
          No chats yet — start a new conversation
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.drawerContainer}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        {user?.avatar || user?.profile_pic ? (
          <Image source={{ uri: user.avatar || user.profile_pic }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {user?.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase()}
            </Text>
          </View>
        )}

        <Text style={styles.profileName} numberOfLines={1}>
          {user?.name || user?.fullName || 'PUSHP'}
        </Text>
        <Text style={styles.profileEmail} numberOfLines={1}>
          {user?.email || 'yadavpushp69@example.com'}
        </Text>
      </View>

      {/* Rooms List */}
      <View style={styles.menuContainer}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: moderateScale(20),
            paddingVertical: verticalScale(5),
          }}
        >
          <Text style={[styles.sectionTitle, { color: 'grey' }]}>Chats History</Text>
          <TouchableOpacity
            onPress={() => {
              updateChatRoomToken();
              navigation.navigate('Main', {
                screen: 'Tabs',
                params: {
                  screen: 'HomePage',
                },
              });
            }}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <Ionicons name="add-circle-outline" size={moderateScale(20)} style={{ color: '#2563EB' }} />
            <Text style={styles.sectionTitle}>New Chat</Text>
          </TouchableOpacity>
        </View>

        {loadingRooms && !refreshing ? (
          <View style={{ padding: moderateScale(16) }}>
            <ActivityIndicator size="small" />
          </View>
        ) : (
          <FlatList
            data={rooms}
            keyExtractor={(item) => item.chat_room_token || String(item.id)}
            renderItem={renderRoom}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={<ListEmptyComponent />}
            refreshing={refreshing}
            onRefresh={onRefresh}
            initialNumToRender={10}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: verticalScale(8) }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out-outline" size={moderateScale(22)} color="#EB5757" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>v1.0.0</Text>
      </View>
    </View>
  );
};

const AppDrawer = () => {
  return (
    <>
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          drawerStyle: {
            width: width * 0.8,
            maxWidth: scale(320),
          },
          headerShown: false,
          drawerType: Platform.OS === 'android' ? 'front' : 'slide',
          overlayColor: 'rgba(0,0,0,0.5)',
          sceneContainerStyle: { backgroundColor: '#FFFFFF' },
          headerTitleStyle: { color: '#FFFFFF' },
          headerTintColor: '#FFFFFF',
        }}
      >
        <Drawer.Screen name="Main" component={MainStack} options={{ headerShown: false }} />
        <Drawer.Screen name="Settings" component={SettingsStack} options={{ title: 'Settings', headerShown: false }} />
      </Drawer.Navigator>
    </>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? verticalScale(20) : 0,
  },
  profileHeader: {
    padding: moderateScale(24),
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
    marginTop: verticalScale(30) 
  },
  avatar: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    marginBottom: verticalScale(15),
  },
  avatarPlaceholder: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: '#2F80ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: moderateScale(24),
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#333333',
    maxWidth: '100%',
  },
  profileEmail: {
    fontSize: moderateScale(14),
    color: '#828282',
    maxWidth: '100%',
  },
  menuContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: moderateScale(13),
    fontWeight: '500',
    color: '#2563EB',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    paddingHorizontal: moderateScale(24),
    backgroundColor: '#fff',
  },
  separator: {
    height: verticalScale(1),
    backgroundColor: '#F2F2F2',
    marginLeft: moderateScale(24),
  },
  menuItemText: {
    fontSize: moderateScale(16),
    color: '#4F4F4F',
    marginLeft: 0,
    flex: 1,
  },
  roomSubtitle: {
    fontSize: moderateScale(12),
    color: '#BDBDBD',
    marginTop: verticalScale(2),
  },
  footer: {
    padding: moderateScale(24),
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  logoutText: {
    fontSize: moderateScale(16),
    color: '#EB5757',
    marginLeft: moderateScale(16),
  },
  versionText: {
    fontSize: moderateScale(12),
    color: '#BDBDBD',
    textAlign: 'center',
  },
});

export default AppDrawer;
