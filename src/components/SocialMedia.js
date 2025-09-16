import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const SocialScreen = ({ navigation }) => {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [posts, setPosts] = useState([]);

  // Mock social posts data
  const socialPosts = [
    {
      id: 1,
      author: {
        name: "Emma Wilson",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
      },
      pet: {
        name: "Max",
        image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop"
      },
      content: "Max had his first swimming lesson today! 🏊‍♂️ He was so brave and loved every minute of it. Can't wait for our next water adventure! 🐕💙",
      timeAgo: "2h ago",
      likes: 24,
      comments: 8,
      isLiked: false,
    },
    {
      id: 2,
      author: {
        name: "Michael Chen",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
      },
      pet: {
        name: "Luna",
        image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=300&fit=crop"
      },
      content: "Luna's first vet checkup went perfectly! Dr. Johnson said she's growing beautifully. So proud of my little princess! 👑🐱",
      timeAgo: "4h ago",
      likes: 31,
      comments: 12,
      isLiked: true,
    },
    {
      id: 3,
      author: {
        name: "Sarah Johnson",
        avatar: "https://static.vecteezy.com/system/resources/thumbnails/053/630/749/small/a-beautiful-young-business-woman-in-a-suit-and-tie-photo.jpeg",
      },
      pet: {
        name: "Charlie",
        image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop"
      },
      content: "Training session with Charlie today! He finally mastered the 'stay' command. Small victories but they mean everything! 🎾🐾",
      timeAgo: "6h ago",
      likes: 18,
      comments: 5,
      isLiked: false,
    },
  ];

  const handleCreatePost = () => {
    if (newPostText.trim()) {
      Alert.alert("Post Created", "Your post has been shared!");
      setNewPostText('');
      setShowCreatePost(false);
    }
  };

  const handleLike = (postId) => {
    Alert.alert("Liked!", `You liked this post`);
  };

  const handleComment = (postId) => {
    Alert.alert("Comments", "View comments for this post");
  };

  const handleShare = (postId) => {
    Alert.alert("Share", "Share this post");
  };

  const renderPost = (post) => (
    <View key={post.id} style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <Image source={{ uri: post.author.avatar }} style={styles.authorAvatar} />
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{post.author.name}</Text>
          <Text style={styles.postTime}>{post.timeAgo}</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Text style={styles.moreIcon}>⋯</Text>
        </TouchableOpacity>
      </View>

      {/* Post Content */}
      <Text style={styles.postContent}>{post.content}</Text>

      {/* Pet Image */}
      <Image source={{ uri: post.pet.image }} style={styles.petImage} />

      {/* Post Stats */}
      <View style={styles.postStats}>
        <Text style={styles.statsText}>❤️ {post.likes} likes</Text>
        <Text style={styles.statsText}>💬 {post.comments} comments</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleLike(post.id)}
        >
          <Text style={[styles.actionIcon, post.isLiked && styles.likedIcon]}>❤️</Text>
          <Text style={[styles.actionText, post.isLiked && styles.likedText]}>Like</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleComment(post.id)}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleShare(post.id)}
        >
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#dbeafe', '#e0e7ff']}
        style={styles.backgroundGradient}
      />
      
      {/* Header */}
      <LinearGradient
        colors={['#2563EB', '#3b82f6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          {/* <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Text style={styles.backButton}>‹</Text>
          </TouchableOpacity> */}
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.openDrawer()}
            >
            <View style={styles.profileAvatar}>
              <Ionicons name="menu" size={scale(18)} color="#2563EB" />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pet Community</Text>
          <TouchableOpacity onPress={() => setShowCreatePost(true)}>
            <Text style={styles.createPostButton}>✏️</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Create Post Button */}
      <TouchableOpacity 
        style={styles.quickCreatePost}
        onPress={() => setShowCreatePost(true)}
      >
        <Text style={styles.quickCreateIcon}>📝</Text>
        <Text style={styles.quickCreateText}>Share something about your pet...</Text>
        <Text style={styles.quickCreateButton}>Post</Text>
      </TouchableOpacity>

      {/* Posts Feed */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {socialPosts.map(renderPost)}
      </ScrollView>

      {/* Create Post Modal */}
      <Modal
        visible={showCreatePost}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <LinearGradient
            colors={['#2563EB', '#3b82f6']}
            style={styles.modalHeader}
          >
            <View style={styles.modalHeaderContent}>
              <TouchableOpacity onPress={() => setShowCreatePost(false)}>
                <Text style={styles.modalCancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Create Post</Text>
              <TouchableOpacity onPress={handleCreatePost}>
                <Text style={styles.modalSaveButton}>Post</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <View style={styles.modalContent}>
            <TextInput
              style={styles.postTextInput}
              value={newPostText}
              onChangeText={setNewPostText}
              placeholder="What's happening with your pet today?"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            
            <TouchableOpacity style={styles.addPhotoButton}>
              <Text style={styles.addPhotoIcon}>📷</Text>
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    paddingHorizontal: scale(20),
   paddingVertical:verticalScale(5)
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    fontSize: moderateScale(28),
    color: '#fff',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#fff',
  },
    profileAvatar: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  createPostButton: {
    fontSize: moderateScale(20),
    color: '#fff',
  },
  quickCreatePost: {
    width:"90%",
    alignSelf:"center",
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: scale(10),
    marginTop: verticalScale(10),
    padding: scale(15),
    borderRadius: scale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.05,
    shadowRadius: scale(4),
    elevation: 2,
  },
  quickCreateIcon: {
    fontSize: moderateScale(18),
    marginRight: scale(12),
  },
  quickCreateText: {
    flex: 1,
    fontSize: moderateScale(14),
    color: '#9ca3af',
  },
  quickCreateButton: {
    fontSize: moderateScale(14),
    color: '#2563EB',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: verticalScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.08,
    shadowRadius: scale(8),
    elevation: 4,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  authorAvatar: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    marginRight: scale(12),
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#1f2937',
  },
  postTime: {
    fontSize: moderateScale(12),
    color: '#6b7280',
    marginTop: verticalScale(2),
  },
  moreButton: {
    padding: scale(4),
  },
  moreIcon: {
    fontSize: moderateScale(16),
    color: '#9ca3af',
  },
  postContent: {
    fontSize: moderateScale(14),
    color: '#374151',
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(12),
  },
  petImage: {
    width: '100%',
    height: verticalScale(200),
    borderRadius: scale(12),
    marginBottom: verticalScale(12),
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(8),
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  statsText: {
    fontSize: moderateScale(12),
    color: '#6b7280',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: verticalScale(12),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: scale(20),
    backgroundColor: '#f8fafc',
  },
  actionIcon: {
    fontSize: moderateScale(14),
    marginRight: scale(6),
  },
  actionText: {
    fontSize: moderateScale(12),
    color: '#6b7280',
    fontWeight: '500',
  },
  likedIcon: {
    color: '#dc2626',
  },
  likedText: {
    color: '#dc2626',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(20),
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    fontSize: moderateScale(16),
    color: '#fff',
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#fff',
  },
  modalSaveButton: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#fff',
  },
  modalContent: {
    flex: 1,
    padding: scale(20),
  },
  postTextInput: {
    backgroundColor: '#f9fafb',
    borderRadius: scale(12),
    padding: scale(16),
    fontSize: moderateScale(16),
    color: '#1f2937',
    height: verticalScale(120),
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: verticalScale(20),
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dbeafe',
    paddingVertical: verticalScale(16),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#2563EB',
    borderStyle: 'dashed',
  },
  addPhotoIcon: {
    fontSize: moderateScale(18),
    marginRight: scale(8),
  },
  addPhotoText: {
    fontSize: moderateScale(14),
    color: '#2563EB',
    fontWeight: '500',
  },
});

export default SocialScreen;