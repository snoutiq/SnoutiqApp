import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Dimensions,
  Platform
} from 'react-native';
import { Card, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../../components/Header';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import Constants from 'expo-constants';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isTablet = width >= 600;

const ApplicationsScreen = ({ navigation }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, token } = useContext(AuthContext);
  const ServerURL = Constants.expoConfig.extra.serverUrl;

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${ServerURL}applications/user/${user.email}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status) {
        setApplications(response.data.data);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to fetch applications');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch applications'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchApplications);
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchApplications();
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1783BB" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <Header navigation={navigation} title="My Applications" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1783BB']}
            tintColor="#1783BB"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>My Applications</Text>

        {applications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="work-off" size={isSmallDevice ? 40 : 50} color="#9CA3AF" />
            <Text style={styles.emptyText}>No applications yet</Text>
            <Text style={styles.emptySubtext}>Apply to jobs to see them here</Text>
            <Button
              mode="contained"
              style={styles.applyButton}
              labelStyle={styles.applyButtonLabel}
              onPress={() => navigation.navigate('Jobs')}
            >
              Browse Jobs
            </Button>
          </View>
        ) : (
          applications.map((app) => (
            <Card key={app.id} style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.headerRow}>
                  <View style={styles.iconContainer}>
                    <Icon name="work-outline" size={isSmallDevice ? 20 : 24} color="#1783BB" />
                  </View>
                  <View style={styles.jobInfo}>
                    <Text style={styles.jobTitle} numberOfLines={1} ellipsizeMode="tail">
                      {app.job_title || 'Job Title'}
                    </Text>
                    <Text style={styles.company} numberOfLines={1} ellipsizeMode="tail">
                      {app.company_name || 'Company'}
                    </Text>
                  </View>
                </View>

                <View style={styles.statusContainer}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(app.status) }]} />
                  <Text style={styles.statusText}>{app.status || 'Pending'}</Text>
                </View>

                <View style={styles.datesContainer}>
                  <Text style={styles.dateText}>
                    Applied: {new Date(app.applied_at).toLocaleDateString()}
                  </Text>
                  {app.status_update_at && (
                    <Text style={styles.updateText}>
                      Updated: {new Date(app.status_update_at).toLocaleDateString()}
                    </Text>
                  )}
                </View>

                <Button
                  mode="outlined"
                  icon="eye"
                  style={styles.detailsButton}
                  labelStyle={styles.buttonLabel}
                  onPress={() =>
                    navigation.navigate('ApplicationStatus', {
                      applicationId: app.id,
                      jobDetails: {
                        title: app.job_title,
                        company: app.company_name,
                        status: app.status
                      }
                    })
                  }
                >
                  View Details
                </Button>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const getStatusColor = (status) => {
  if (!status) return '#1783BB';

  switch (status.toLowerCase()) {
    case 'under review':
    case 'pending':
      return '#FFA500';
    case 'shortlisted':
      return '#4CAF50';
    case 'interview scheduled':
      return '#2196F3';
    case 'offer sent':
      return '#673AB7';
    case 'rejected':
      return '#F44336';
    default:
      return '#1783BB';
  }
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    paddingHorizontal: isTablet ? 24 : 16,
    paddingTop: 10,
    paddingBottom: 24,
    minHeight: height - 100, 
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: isSmallDevice ? 20 : 40,
    marginTop: height * 0.15,
  },
  emptyText: {
    fontSize: isSmallDevice ? 16 : 18,
    color: '#6B7280',
    marginTop: 16,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#9CA3AF',
    marginTop: 8,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: isSmallDevice ? 10 : 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: isSmallDevice ? 8 : 12,
    marginTop: 8,
  },
  card: {
    borderRadius: 12,
    marginBottom: isSmallDevice ? 8 : 12,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  cardContent: {
    padding: isSmallDevice ? 8 : 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isSmallDevice ? 5 : 8,
  },
  iconContainer: {
    marginRight: isSmallDevice ? 5 : 8,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: isSmallDevice ? 12 : 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  company: {
    fontSize: isSmallDevice ? 13 : 14,
    fontFamily: 'Inter-Medium',
    color: '#1783BB',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: isSmallDevice ? 5 : 6,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: isSmallDevice ? 13 : 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  datesContainer: {
    marginBottom: isSmallDevice ? 8 : 12,
  },
  dateText: {
    fontSize: isSmallDevice ? 11 : 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  updateText: {
    fontSize: isSmallDevice ? 11 : 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  detailsButton: {
    borderColor: '#1783BB',
    borderRadius: 8,
    marginTop: isSmallDevice ? 4 : 8,
  },
  buttonLabel: {
    fontSize: isSmallDevice ? 13 : 14,
    fontFamily: 'Inter-Medium',
  },
  applyButton: {
    borderRadius: 8,
    backgroundColor: '#1783BB',
    marginTop: 14,
    width: isSmallDevice ? '80%' : '60%',
  },
  applyButtonLabel: {
    color: '#FFFFFF',
    fontSize: isSmallDevice ? 14 : 15,
    fontFamily: 'Inter-SemiBold',
  },
});

export default ApplicationsScreen;