import React,{useContext} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';


const SavedJobsScreen = ({ navigation }) => {
  const { savedJobs, removeJob } = useContext(AuthContext);

  const handleRemove = async (jobId) => {
    try {
      await removeJob(jobId);
      Alert.alert('Removed', 'Job removed from saved jobs');
    } catch (error) {
      Alert.alert('Error', 'Failed to remove job');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Icon name="bookmark" size={22} color="#1783BB" />
        <View style={styles.jobInfo}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.company}>{item.company}</Text>
          <Text style={styles.details}>{item.location}</Text>
          <Text style={styles.details}>{item.salary}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => handleRemove(item.id)}
          style={styles.removeButton}
        >
          <Icon name="delete-outline" size={22} color="#DC2626" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity 
        style={styles.viewButton}
        onPress={() => navigation.navigate('JobDescription', { job: item })}
      >
        <Text style={styles.viewButtonText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );

  if (savedJobs.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Icon name="bookmark-outline" size={50} color="#1783BB" />
        <Text style={styles.emptyText}>No saved jobs yet</Text>
        <Text style={styles.emptySubtext}>Save jobs to view them here</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.screenTitle}>Saved Jobs</Text>
      <FlatList
        data={savedJobs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f8',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f4f8',
  },
  emptyText: {
    fontSize: 18,
    color: '#555',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '600',
    margin: 15,
    color: '#333',
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: '#ccc',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  jobInfo: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1783BB',
  },
  company: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  details: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  removeButton: {
    marginLeft: 10,
  },
  viewButton: {
    backgroundColor: '#1783BB',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default SavedJobsScreen;