import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

export default function PetProfileScreen({ navigation }) {
  const [pet, setPet] = useState({
    name: 'Your Pet',
    breed: 'Unknown',
    age: '0',
    weight: '0'
  });

  const healthMetrics = [
    { label: 'Weight (kg)', value: pet.weight || '25', change: null },
    { label: 'Health Score', value: '98%', change: '+2%' },
    { label: 'Days Together', value: '347', change: null }
  ];

  const menuItems = [
    {
      id: '1',
      title: 'Health Records',
      subtitle: 'Vaccinations, medications, visits',
      icon: 'medical',
      color: '#7C3AED',
      screen: null
    },
    {
      id: '2',
      title: 'Photo Gallery',
      subtitle: 'Memories and moments',
      icon: 'camera',
      color: '#10B981',
      screen: null
    },
    {
      id: '3',
      title: 'Achievements',
      subtitle: 'Milestones and badges',
      icon: 'trophy',
      color: '#F59E0B',
      screen: null
    },
    {
      id: '4',
      title: 'Activity Tracker',
      subtitle: 'Daily walks and exercise',
      icon: 'walk',
      color: '#3B82F6',
      screen: null
    },
    {
      id: '5',
      title: 'Training Progress',
      subtitle: 'Commands and skills',
      icon: 'school',
      color: '#EC4899',
      screen: null
    },
    {
      id: '6',
      title: 'Nutrition Plan',
      subtitle: 'Diet and feeding schedule',
      icon: 'restaurant',
      color: '#8B5CF6',
      screen: null
    }
  ];

  const achievements = [
    { id: '1', title: 'First Walk', icon: 'walk', earned: true },
    { id: '2', title: 'Health Champion', icon: 'medical', earned: true },
    { id: '3', title: 'Social Butterfly', icon: 'people', earned: true },
    { id: '4', title: 'Training Master', icon: 'school', earned: false },
  ];

  useEffect(() => {
    loadPetData();
  }, []);

  const loadPetData = async () => {
    try {
      const petData = await AsyncStorage.getItem('petData');
      if (petData) {
        setPet(JSON.parse(petData));
      }
    } catch (error) {
      console.error('Error loading pet data:', error);
    }
  };

  const handleMenuItemPress = (item) => {
    if (item.screen) {
      navigation.navigate(item.screen);
    } else {
      Alert.alert('Coming Soon', `${item.title} feature will be available soon!`);
    }
  };

  const handleEditProfile = () => {
    Alert.alert(
      'Edit Pet Profile',
      'Would you like to update your pet\'s information?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Edit', onPress: () => navigation.navigate('PetSetup') }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#7C3AED', '#EC4899']}
          style={styles.header}
        >
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={scale(24)} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.petProfile}>
            <View style={styles.petAvatar}>
              <Ionicons name="paw" size={scale(48)} color="#FFFFFF" />
            </View>
            <Text style={styles.petName}>{pet.name}</Text>
            <Text style={styles.petBreed}>{pet.breed} • {pet.age}</Text>
            
            <TouchableOpacity 
              style={styles.editButton}
              onPress={handleEditProfile}
            >
              <Ionicons name="pencil" size={scale(14)} color="#7C3AED" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Health Metrics */}
          <View style={styles.metricsContainer}>
            {healthMetrics.map((metric, index) => (
              <View key={index} style={styles.metricCard}>
                <Text style={styles.metricValue}>{metric.value}</Text>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                {metric.change && (
                  <Text style={styles.metricChange}>{metric.change}</Text>
                )}
              </View>
            ))}
          </View>

          {/* Health Status Banner */}
          <View style={styles.healthBanner}>
            <View style={styles.healthContent}>
              <View style={styles.healthIcon}>
                <Ionicons name="checkmark-circle" size={scale(24)} color="#10B981" />
              </View>
              <View style={styles.healthInfo}>
                <Text style={styles.healthTitle}>Excellent Health Status</Text>
                <Text style={styles.healthSubtitle}>
                  All vaccinations current • Last checkup: 2 weeks ago
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity style={[styles.quickAction, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="calendar" size={scale(24)} color="#3B82F6" />
                <Text style={styles.quickActionText}>Schedule Checkup</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.quickAction, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="camera" size={scale(24)} color="#F59E0B" />
                <Text style={styles.quickActionText}>Add Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.quickAction, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="clipboard" size={scale(24)} color="#10B981" />
                <Text style={styles.quickActionText}>Health Log</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.quickAction, { backgroundColor: '#FCE7F3' }]}>
                <Ionicons name="share" size={scale(24)} color="#EC4899" />
                <Text style={styles.quickActionText}>Share Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Achievements */}
          <View style={styles.achievementsContainer}>
            <Text style={styles.sectionTitle}>Recent Achievements</Text>
            <View style={styles.achievementsGrid}>
              {achievements.slice(0, 4).map((achievement) => (
                <View
                  key={achievement.id}
                  style={[
                    styles.achievementBadge,
                    !achievement.earned && styles.achievementBadgeLocked
                  ]}
                >
                  <Ionicons
                    name={achievement.earned ? achievement.icon : 'lock-closed'}
                    size={scale(20)}
                    color={achievement.earned ? '#F59E0B' : '#9CA3AF'}
                  />
                  <Text style={[
                    styles.achievementTitle,
                    !achievement.earned && styles.achievementTitleLocked
                  ]}>
                    {achievement.title}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            <Text style={styles.sectionTitle}>Pet Management</Text>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => handleMenuItemPress(item)}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
                    <Ionicons name={item.icon} size={scale(24)} color={item.color} />
                  </View>
                  <View style={styles.menuItemInfo}>
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                    <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={scale(20)} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Settings */}
          <View style={styles.settingsContainer}>
            <Text style={styles.sectionTitle}>Settings</Text>
            
            <TouchableOpacity style={styles.settingsItem}>
              <View style={styles.settingsLeft}>
                <Ionicons name="notifications" size={scale(20)} color="#6B7280" />
                <Text style={styles.settingsText}>Notification Settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={scale(16)} color="#9CA3AF" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsItem}>
              <View style={styles.settingsLeft}>
                <Ionicons name="shield-checkmark" size={scale(20)} color="#6B7280" />
                <Text style={styles.settingsText}>Privacy Settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={scale(16)} color="#9CA3AF" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsItem}>
              <View style={styles.settingsLeft}>
                <Ionicons name="help-circle" size={scale(20)} color="#6B7280" />
                <Text style={styles.settingsText}>Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={scale(16)} color="#9CA3AF" />
            </TouchableOpacity>
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(32),
  },
  backButton: {
    marginBottom: verticalScale(16),
  },
  petProfile: {
    alignItems: 'center',
  },
  petAvatar: {
    width: scale(96),
    height: scale(96),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: scale(48),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(16),
  },
  petName: {
    color: '#FFFFFF',
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    marginBottom: verticalScale(4),
  },
  petBreed: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: moderateScale(16),
    marginBottom: verticalScale(16),
  },
  editButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: scale(20),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  editButtonText: {
    color: '#7C3AED',
    fontSize: moderateScale(12),
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: scale(24),
    marginTop: verticalScale(-16),
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: scale(16),
    marginBottom: verticalScale(24),
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: scale(12),
    padding: scale(16),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  metricValue: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: verticalScale(4),
  },
  metricLabel: {
    fontSize: moderateScale(12),
    color: '#6B7280',
    textAlign: 'center',
  },
  metricChange: {
    fontSize: moderateScale(10),
    color: '#10B981',
    marginTop: verticalScale(2),
  },
  healthBanner: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: scale(12),
    padding: scale(16),
    marginBottom: verticalScale(24),
  },
  healthContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthIcon: {
    marginRight: scale(12),
  },
  healthInfo: {
    flex: 1,
  },
  healthTitle: {
    fontSize: moderateScale(14),
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: verticalScale(4),
  },
  healthSubtitle: {
    fontSize: moderateScale(12),
    color: '#047857',
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: verticalScale(16),
  },
  quickActionsContainer: {
    marginBottom: verticalScale(32),
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(12),
  },
  quickAction: {
    width: (scale(327) - scale(12)) / 2,
    padding: scale(16),
    borderRadius: scale(12),
    alignItems: 'center',
    gap: verticalScale(8),
  },
  quickActionText: {
    fontSize: moderateScale(12),
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  achievementsContainer: {
    marginBottom: verticalScale(32),
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(12),
  },
  achievementBadge: {
    width: (scale(327) - scale(36)) / 2,
    backgroundColor: '#FEF3C7',
    borderRadius: scale(8),
    padding: scale(12),
    alignItems: 'center',
    gap: verticalScale(8),
  },
  achievementBadgeLocked: {
    backgroundColor: '#F3F4F6',
  },
  achievementTitle: {
    fontSize: moderateScale(10),
    fontWeight: '500',
    color: '#92400E',
    textAlign: 'center',
  },
  achievementTitleLocked: {
    color: '#9CA3AF',
  },
  menuContainer: {
    marginBottom: verticalScale(32),
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(12),
    padding: scale(16),
    marginBottom: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#111827',
    marginBottom: verticalScale(2),
  },
  menuItemSubtitle: {
    fontSize: moderateScale(12),
    color: '#6B7280',
  },
  settingsContainer: {
    marginBottom: verticalScale(32),
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  settingsText: {
    fontSize: moderateScale(14),
    color: '#374151',
  },
});