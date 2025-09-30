import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const [user, setUser] = useState({ name: '', location: 'Delhi' });
  const [pet, setPet] = useState({ name: 'Your Pet' });
  const [liveActivities, setLiveActivities] = useState(12);
  const [onlineUsers, setOnlineUsers] = useState(847);

  const liveEvents = [
    { id: '1', title: 'Pet Yoga Session', location: 'Connaught Place', time: '20 min', participants: 23, type: 'live' },
    { id: '2', title: 'Dog Training Workshop', location: 'Lodhi Gardens', time: '1 hr', participants: 45, type: 'upcoming' },
    { id: '3', title: 'Adoption Drive', location: 'India Gate', time: '2 hr', participants: 67, type: 'upcoming' },
  ];

  const trendingChallenges = [
    { id: '1', title: 'Morning Walk Streak', participants: 127, progress: 85, reward: '🏆 Fitness Badge' },
    { id: '2', title: 'Healthy Treats Challenge', participants: 89, progress: 60, reward: '🥕 Nutrition Expert' },
  ];

  const petActivities = [
    { id: '1', activity: 'Morning Walk', time: '7:00 AM', status: 'completed' },
    { id: '2', activity: 'Breakfast', time: '8:30 AM', status: 'completed' },
    { id: '3', activity: 'Play Time', time: '11:00 AM', status: 'upcoming' },
  ];

  const healthInsights = [
    { metric: 'Steps Today', value: '8,247', change: '+12%', trend: 'up' },
    { metric: 'Active Hours', value: '4.2h', change: '+5%', trend: 'up' },
    { metric: 'Calories Burned', value: '340', change: '+8%', trend: 'up' },
    { metric: 'Sleep Quality', value: '92%', change: '+3%', trend: 'up' },
  ];

  useEffect(() => {
    loadUserData();
    
    const interval = setInterval(() => {
      setLiveActivities(prev => prev + Math.floor(Math.random() * 3) - 1);
      setOnlineUsers(prev => prev + Math.floor(Math.random() * 20) - 10);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const petData = await AsyncStorage.getItem('petData');
      
      if (userData) {
        setUser(JSON.parse(userData));
      }
      if (petData) {
        setPet(JSON.parse(petData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const renderLiveEvent = ({ item }) => (
    <View style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <View style={styles.eventBadge}>
          {item.type === 'live' && <View style={styles.liveDot} />}
          <Text style={[styles.eventBadgeText, { 
            color: item.type === 'live' ? '#EF4444' : '#3B82F6' 
          }]}>
            {item.type === 'live' ? 'LIVE' : item.time}
          </Text>
        </View>
        <View style={styles.participantsContainer}>
          <Ionicons name="people" size={scale(12)} color="#6B7280" />
          <Text style={styles.participantsText}>{item.participants}</Text>
        </View>
      </View>
      <Text style={styles.eventTitle}>{item.title}</Text>
      <View style={styles.eventLocation}>
        <Ionicons name="location-outline" size={scale(12)} color="#6B7280" />
        <Text style={styles.eventLocationText}>{item.location}</Text>
      </View>
      <TouchableOpacity style={styles.eventButton}>
        <Text style={styles.eventButtonText}>
          {item.type === 'live' ? 'Join Now' : 'Register'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#7C3AED', '#EC4899']}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Good morning,</Text>
              <Text style={styles.userName}>{user.name || 'Pet Parent'}</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Notifications')}
                style={styles.notificationButton}
              >
                <Ionicons name="notifications" size={scale(24)} color="#FFFFFF" />
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>5</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.profileButton}>
                <Ionicons name="person" size={scale(24)} color="#FFFFFF" />
              </View>
            </View>
          </View>

          <View style={styles.liveActivityBar}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>{liveActivities} live activities near you</Text>
            </View>
            <View style={styles.onlineUsers}>
              <Ionicons name="people" size={scale(16)} color="#FFFFFF" />
              <Text style={styles.onlineUsersText}>{onlineUsers} online</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Pet Status Card */}
          <View style={styles.petStatusCard}>
            <View style={styles.petStatusContent}>
              <View style={styles.petAvatar}>
                <Ionicons name="paw" size={scale(32)} color="#FFFFFF" />
              </View>
              <View style={styles.petInfo}>
                <Text style={styles.petName}>{pet.name}</Text>
                <Text style={styles.petMood}>Feeling energetic today! 🎾</Text>
                <View style={styles.healthStatus}>
                  <View style={styles.healthDot} />
                  <Text style={styles.healthText}>All vitals excellent</Text>
                </View>
              </View>
              <View style={styles.moodEmoji}>
                <Text style={styles.emojiText}>😊</Text>
                <Text style={styles.moodText}>Happy</Text>
              </View>
            </View>
          </View>

          {/* Live Events */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🔴 Happening Now</Text>
              <TouchableOpacity>
                <Text style={styles.sectionLink}>View All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={liveEvents}
              renderItem={renderLiveEvent}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.eventsContainer}
            />
          </View>

          {/* Trending Challenges */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🔥 Trending Challenges</Text>
              <TouchableOpacity>
                <Text style={styles.sectionLink}>Join All</Text>
              </TouchableOpacity>
            </View>
            {trendingChallenges.map((challenge) => (
              <View key={challenge.id} style={styles.challengeCard}>
                <View style={styles.challengeHeader}>
                  <Text style={styles.challengeTitle}>{challenge.title}</Text>
                  <Text style={styles.challengeParticipants}>{challenge.participants} joined</Text>
                </View>
                <View style={styles.challengeDetails}>
                  <Text style={styles.challengeReward}>{challenge.reward}</Text>
                  <Text style={styles.challengeProgress}>{challenge.progress}% complete</Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[styles.progressFill, { width: `${challenge.progress}%` }]} 
                  />
                </View>
                <TouchableOpacity style={styles.challengeButton}>
                  <Text style={styles.challengeButtonText}>Join Challenge</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
                onPress={() => navigation.navigate('Chat')}
              >
                <Ionicons name="chatbubble" size={scale(24)} color="#FFFFFF" />
                <Text style={styles.actionTitle}>Ask PetPal AI</Text>
                <Text style={styles.actionSubtitle}>Instant health advice</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#10B981' }]}
                onPress={() => navigation.navigate('Vets')}
              >
                <Ionicons name="medical" size={scale(24)} color="#FFFFFF" />
                <Text style={styles.actionTitle}>Find Vet</Text>
                <Text style={styles.actionSubtitle}>4 available now</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.quickActions}>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#EC4899' }]}>
                <Ionicons name="camera" size={scale(24)} color="#FFFFFF" />
                <Text style={styles.actionTitle}>Photo Diary</Text>
                <Text style={styles.actionSubtitle}>Capture moments</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#F59E0B' }]}>
                <Ionicons name="gift" size={scale(24)} color="#FFFFFF" />
                <Text style={styles.actionTitle}>Rewards</Text>
                <Text style={styles.actionSubtitle}>3 badges earned</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Today's Schedule */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            {petActivities.map((activity) => (
              <View key={activity.id} style={styles.activityCard}>
                <View style={[
                  styles.activityIcon,
                  { backgroundColor: activity.status === 'completed' ? '#10B981' : '#3B82F6' }
                ]}>
                  <Ionicons 
                    name={activity.status === 'completed' ? 'checkmark' : 'time'} 
                    size={scale(20)} 
                    color="#FFFFFF" 
                  />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>{activity.activity}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Health Insights */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Health Insights</Text>
            <View style={styles.healthGrid}>
              {healthInsights.map((insight, index) => (
                <View key={index} style={styles.healthCard}>
                  <View style={styles.healthCardHeader}>
                    <Text style={styles.healthMetric}>{insight.metric}</Text>
                    <Ionicons 
                      name={insight.trend === 'up' ? 'trending-up' : 'trending-down'} 
                      size={scale(16)} 
                      color={insight.trend === 'up' ? '#10B981' : '#EF4444'} 
                    />
                  </View>
                  <Text style={styles.healthValue}>{insight.value}</Text>
                  <Text style={[
                    styles.healthChange,
                    { color: insight.trend === 'up' ? '#10B981' : '#EF4444' }
                  ]}>
                    {insight.change} from yesterday
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Weather Alert */}
          <View style={styles.weatherAlert}>
            <View style={styles.weatherContent}>
              <Ionicons name="sunny" size={scale(24)} color="#F59E0B" />
              <View style={styles.weatherInfo}>
                <Text style={styles.weatherTitle}>Perfect Weather Today!</Text>
                <Text style={styles.weatherDescription}>24°C & sunny - Great for outdoor activities</Text>
              </View>
            </View>
            <View style={styles.weatherActions}>
              <TouchableOpacity style={styles.weatherButton}>
                <Text style={styles.weatherButtonText}>Plan Walk</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: verticalScale(100) }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(24),
    borderBottomLeftRadius: scale(24),
    borderBottomRightRadius: scale(24),
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  greeting: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: moderateScale(14),
  },
  userName: {
    color: '#FFFFFF',
    fontSize: moderateScale(20),
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -scale(4),
    right: -scale(4),
    backgroundColor: '#EF4444',
    borderRadius: scale(10),
    width: scale(20),
    height: scale(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: moderateScale(10),
    fontWeight: 'bold',
  },
  profileButton: {
    width: scale(40),
    height: scale(40),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: scale(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveActivityBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: scale(8),
    padding: scale(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  liveDot: {
    width: scale(8),
    height: scale(8),
    backgroundColor: '#10B981',
    borderRadius: scale(4),
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: moderateScale(12),
  },
  onlineUsers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  onlineUsersText: {
    color: '#FFFFFF',
    fontSize: moderateScale(12),
  },
  content: {
    paddingHorizontal: scale(24),
    marginTop: verticalScale(-32),
  },
  petStatusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(16),
    padding: scale(20),
    marginBottom: verticalScale(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  petStatusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petAvatar: {
    width: scale(64),
    height: scale(64),
    backgroundColor: '#10B981',
    borderRadius: scale(32),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(16),
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: verticalScale(4),
  },
  petMood: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    marginBottom: verticalScale(8),
  },
  healthStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  healthDot: {
    width: scale(8),
    height: scale(8),
    backgroundColor: '#10B981',
    borderRadius: scale(4),
  },
  healthText: {
    fontSize: moderateScale(12),
    color: '#10B981',
    fontWeight: '500',
  },
  moodEmoji: {
    alignItems: 'center',
  },
  emojiText: {
    fontSize: moderateScale(24),
    marginBottom: verticalScale(4),
  },
  moodText: {
    fontSize: moderateScale(10),
    color: '#6B7280',
  },
  section: {
    marginBottom: verticalScale(24),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#111827',
  },
  sectionLink: {
    fontSize: moderateScale(14),
    color: '#7C3AED',
    fontWeight: '500',
  },
  eventsContainer: {
    gap: scale(12),
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(12),
    padding: scale(16),
    width: width * 0.7,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  eventBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    backgroundColor: '#FEF3F2',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: scale(12),
  },
  eventBadgeText: {
    fontSize: moderateScale(10),
    fontWeight: '500',
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  participantsText: {
    fontSize: moderateScale(12),
    color: '#6B7280',
  },
  eventTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#111827',
    marginBottom: verticalScale(4),
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    marginBottom: verticalScale(12),
  },
  eventLocationText: {
    fontSize: moderateScale(12),
    color: '#6B7280',
  },
  eventButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: verticalScale(8),
    borderRadius: scale(8),
    alignItems: 'center',
  },
  eventButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(12),
    fontWeight: '500',
  },
  challengeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(12),
    padding: scale(16),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  challengeTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#111827',
  },
  challengeParticipants: {
    fontSize: moderateScale(12),
    color: '#6B7280',
  },
  challengeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  challengeReward: {
    fontSize: moderateScale(12),
    color: '#6B7280',
  },
  challengeProgress: {
    fontSize: moderateScale(12),
    color: '#7C3AED',
    fontWeight: '500',
  },
  progressBar: {
    height: verticalScale(8),
    backgroundColor: '#E5E7EB',
    borderRadius: scale(4),
    overflow: 'hidden',
    marginBottom: verticalScale(12),
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7C3AED',
  },
  challengeButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: verticalScale(8),
    borderRadius: scale(8),
    alignItems: 'center',
  },
  challengeButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(12),
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    gap: scale(16),
    marginBottom: verticalScale(16),
  },
  actionButton: {
    flex: 1,
    padding: scale(16),
    borderRadius: scale(12),
    alignItems: 'flex-start',
    gap: verticalScale(8),
  },
  actionTitle: {
    color: '#FFFFFF',
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  actionSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: moderateScale(10),
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(12),
    padding: scale(16),
    marginBottom: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activityIcon: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(16),
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#111827',
    marginBottom: verticalScale(4),
  },
  activityTime: {
    fontSize: moderateScale(12),
    color: '#6B7280',
  },
  healthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(12),
  },
  healthCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(12),
    padding: scale(16),
    width: (width - scale(60)) / 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  healthCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  healthMetric: {
    fontSize: moderateScale(12),
    color: '#6B7280',
  },
  healthValue: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: verticalScale(4),
  },
  healthChange: {
    fontSize: moderateScale(10),
  },
  weatherAlert: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: scale(12),
    padding: scale(16),
    marginBottom: verticalScale(24),
  },
  weatherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
    marginBottom: verticalScale(12),
  },
  weatherInfo: {
    flex: 1,
  },
  weatherTitle: {
    fontSize: moderateScale(14),
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: verticalScale(4),
  },
  weatherDescription: {
    fontSize: moderateScale(12),
    color: '#D97706',
  },
  weatherActions: {
    flexDirection: 'row',
    gap: scale(8),
  },
  weatherButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: scale(16),
  },
  weatherButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(10),
    fontWeight: '500',
  },
});