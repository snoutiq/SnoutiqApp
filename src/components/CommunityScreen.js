import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

export default function CommunityScreen({ navigation }) {
  const [selectedTab, setSelectedTab] = useState('posts');

  const communityStats = {
    members: 1247,
    activeNow: 23,
    eventsToday: 5
  };

  const communityPosts = [
    {
      id: '1',
      user: 'Priya M.',
      pet: 'Buddy',
      content: '🌅 Beautiful sunrise walk at Lodhi Gardens! Buddy loved chasing butterflies 🦋',
      likes: 23,
      comments: 8,
      time: '2h ago',
      trending: true,
      location: 'Lodhi Gardens',
      image: null
    },
    {
      id: '2',
      user: 'Rahul K.',
      pet: 'Milo',
      content: '💉 First vaccination done! Such a brave boy 🐕 Dr. Sharma was amazing!',
      likes: 34,
      comments: 12,
      time: '4h ago',
      trending: false,
      location: 'Pet Clinic',
      image: null
    },
    {
      id: '3',
      user: 'Aisha P.',
      pet: 'Luna',
      content: '🎾 Luna learned her 10th trick today! Teaching "roll over" was so much fun 🤸‍♀️',
      likes: 19,
      comments: 6,
      time: '1h ago',
      trending: true,
      location: 'Home',
      image: null
    },
    {
      id: '4',
      user: 'Vikram S.',
      pet: 'Rocky',
      content: '🏆 We won the agility competition! Rocky was absolutely fantastic today! 🥇',
      likes: 67,
      comments: 24,
      time: '6h ago',
      trending: true,
      location: 'Pet Arena',
      image: null
    }
  ];

  const upcomingEvents = [
    {
      id: '1',
      title: 'Morning Pet Yoga',
      time: 'Tomorrow 7:00 AM',
      location: 'Central Park',
      participants: 12,
      type: 'fitness'
    },
    {
      id: '2',
      title: 'Adoption Drive',
      time: 'This Weekend',
      location: 'India Gate',
      participants: 45,
      type: 'social'
    },
    {
      id: '3',
      title: 'Pet Training Workshop',
      time: 'Sunday 4:00 PM',
      location: 'Community Center',
      participants: 28,
      type: 'education'
    }
  ];

  const handleLikePost = (postId) => {
    // In real app, update the post's like count
    console.log('Liked post:', postId);
  };

  const handleCommentPost = (postId) => {
    // In real app, navigate to comments screen
    console.log('Comment on post:', postId);
  };

  const handleSharePost = (postId) => {
    // In real app, open share dialog
    console.log('Share post:', postId);
  };

  const renderPost = ({ item: post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={scale(24)} color="#7C3AED" />
          </View>
          <View style={styles.userDetails}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName}>{post.user}</Text>
              {post.trending && (
                <Ionicons name="flame" size={scale(16)} color="#F59E0B" />
              )}
            </View>
            <Text style={styles.postMeta}>
              with {post.pet} • {post.time}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.postContent}>{post.content}</Text>

      {post.image && (
        <View style={styles.postImage}>
          <View style={styles.imagePlaceholder}>
            <Ionicons name="camera" size={scale(32)} color="#9CA3AF" />
          </View>
        </View>
      )}

      <View style={styles.postActions}>
        <View style={styles.actionsLeft}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLikePost(post.id)}
          >
            <Ionicons name="heart-outline" size={scale(20)} color="#6B7280" />
            <Text style={styles.actionText}>{post.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleCommentPost(post.id)}
          >
            <Ionicons name="chatbubble-outline" size={scale(20)} color="#6B7280" />
            <Text style={styles.actionText}>{post.comments}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => handleSharePost(post.id)}>
          <Ionicons name="share-outline" size={scale(20)} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEvent = ({ item: event }) => (
    <View style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <View style={[
          styles.eventIcon,
          { backgroundColor: 
            event.type === 'fitness' ? '#DBEAFE' :
            event.type === 'social' ? '#FEF3C7' : '#D1FAE5'
          }
        ]}>
          <Ionicons 
            name={
              event.type === 'fitness' ? 'fitness' :
              event.type === 'social' ? 'people' : 'school'
            }
            size={scale(20)}
            color={
              event.type === 'fitness' ? '#3B82F6' :
              event.type === 'social' ? '#F59E0B' : '#10B981'
            }
          />
        </View>
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventTime}>{event.time}</Text>
          <View style={styles.eventDetails}>
            <Ionicons name="location-outline" size={scale(12)} color="#6B7280" />
            <Text style={styles.eventLocation}>{event.location}</Text>
          </View>
        </View>
        <View style={styles.participantCount}>
          <Text style={styles.participantNumber}>{event.participants}</Text>
          <Text style={styles.participantLabel}>joined</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.joinEventButton}>
        <Text style={styles.joinEventText}>Join Event</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#7C3AED', '#EC4899']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Pet Community</Text>
            <Text style={styles.headerSubtitle}>
              Connect with pet parents in Delhi
            </Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{communityStats.members.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{communityStats.activeNow}</Text>
            <Text style={styles.statLabel}>Active Now</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{communityStats.eventsToday}</Text>
            <Text style={styles.statLabel}>Events Today</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.newPostButton}>
            <Ionicons name="add" size={scale(20)} color="#7C3AED" />
            <Text style={styles.newPostText}>New Post</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.eventsButton}>
            <Text style={styles.eventsButtonText}>Events</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === 'posts' && styles.activeTabButton
            ]}
            onPress={() => setSelectedTab('posts')}
          >
            <Text style={[
              styles.tabText,
              selectedTab === 'posts' && styles.activeTabText
            ]}>
              Community Posts
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === 'events' && styles.activeTabButton
            ]}
            onPress={() => setSelectedTab('events')}
          >
            <Text style={[
              styles.tabText,
              selectedTab === 'events' && styles.activeTabText
            ]}>
              Upcoming Events
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {selectedTab === 'posts' ? (
          <FlatList
            data={communityPosts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
            style={styles.postsList}
            contentContainerStyle={styles.postsContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            data={upcomingEvents}
            renderItem={renderEvent}
            keyExtractor={(item) => item.id}
            style={styles.eventsList}
            contentContainerStyle={styles.eventsContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(24),
    borderBottomLeftRadius: scale(24),
    borderBottomRightRadius: scale(24),
  },
  headerContent: {
    marginBottom: verticalScale(16),
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: moderateScale(20),
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: moderateScale(14),
    marginTop: verticalScale(4),
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: scale(16),
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: scale(12),
    borderRadius: scale(8),
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    color: '#FFFFFF',
    fontSize: moderateScale(18),
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: moderateScale(10),
    marginTop: verticalScale(4),
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(24),
    marginTop: verticalScale(-16),
  },
  actionButtons: {
    flexDirection: 'row',
    gap: scale(12),
    marginBottom: verticalScale(24),
  },
  newPostButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#7C3AED',
    paddingVertical: verticalScale(12),
    borderRadius: scale(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
  },
  newPostText: {
    color: '#7C3AED',
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  eventsButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(12),
    borderRadius: scale(12),
  },
  eventsButtonText: {
    color: '#374151',
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: scale(8),
    padding: scale(4),
    marginBottom: verticalScale(24),
  },
  tabButton: {
    flex: 1,
    paddingVertical: verticalScale(8),
    alignItems: 'center',
    borderRadius: scale(6),
  },
  activeTabButton: {
    backgroundColor: '#7C3AED',
  },
  tabText: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  postsList: {
    flex: 1,
  },
  postsContent: {
    gap: verticalScale(16),
    paddingBottom: verticalScale(100),
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(12),
    padding: scale(16),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  postHeader: {
    marginBottom: verticalScale(12),
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: scale(48),
    height: scale(48),
    backgroundColor: '#F3E8FF',
    borderRadius: scale(24),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  userDetails: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  userName: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#111827',
  },
  postMeta: {
    fontSize: moderateScale(12),
    color: '#6B7280',
    marginTop: verticalScale(2),
  },
  postContent: {
    fontSize: moderateScale(14),
    color: '#111827',
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(16),
  },
  postImage: {
    marginBottom: verticalScale(16),
  },
  imagePlaceholder: {
    width: '100%',
    height: verticalScale(192),
    backgroundColor: '#F3F4F6',
    borderRadius: scale(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: verticalScale(12),
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionsLeft: {
    flexDirection: 'row',
    gap: scale(24),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  actionText: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#6B7280',
  },
  eventsList: {
    flex: 1,
  },
  eventsContent: {
    gap: verticalScale(12),
    paddingBottom: verticalScale(100),
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(12),
    padding: scale(16),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  eventIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#111827',
    marginBottom: verticalScale(4),
  },
  eventTime: {
    fontSize: moderateScale(12),
    color: '#7C3AED',
    fontWeight: '500',
    marginBottom: verticalScale(4),
  },
  eventDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  eventLocation: {
    fontSize: moderateScale(12),
    color: '#6B7280',
  },
  participantCount: {
    alignItems: 'center',
  },
  participantNumber: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: '#111827',
  },
  participantLabel: {
    fontSize: moderateScale(10),
    color: '#6B7280',
  },
  joinEventButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: verticalScale(8),
    borderRadius: scale(8),
    alignItems: 'center',
  },
  joinEventText: {
    color: '#FFFFFF',
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
});