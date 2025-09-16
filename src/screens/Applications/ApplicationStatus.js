import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions
} from "react-native";
import { Card } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";
import Header from "../../components/Header";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import Constants from 'expo-constants';


const { width } = Dimensions.get('window');

const ApplicationStatus = ({ route, navigation }) => {
  const { params } = route;
  const applicationId = params?.applicationId;
  const jobDetails = params?.jobDetails;

  const [statusHistory, setStatusHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);
  // const ServerURL = process.env.EXPO_PUBLIC_SERVER_URL;
    const ServerURL = Constants.expoConfig.extra.serverUrl;


  useEffect(() => {
    const fetchStatusHistory = async () => {
      try {
        const response = await axios.get(
          `${ServerURL}applications/${applicationId}/status`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.status) {
          setStatusHistory(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching status history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatusHistory();
  }, [applicationId]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1783BB" />
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <Card style={styles.jobCard}>
          <Card.Content>
            <View style={styles.jobHeader}>
              <Icon name="work" size={30} color="#1783BB" />
              <View style={styles.jobText}>
                <Text style={styles.jobTitle}>{jobDetails.title}</Text>
                <Text style={styles.company}>{jobDetails.company}</Text>
              </View>
            </View>

            <View style={styles.currentStatus}>
              <Text style={styles.sectionTitle}>Current Status</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(jobDetails.status) },
                ]}
              >
                <Text style={styles.statusText}>
                  {getStatusLabel(jobDetails.status)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Text style={styles.historyTitle}>Application Timeline</Text>

        <View style={styles.timelineContainer}>
          {statusHistory.length > 0 ? (
            statusHistory.map((status, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={styles.timelineDotContainer}>
                    <View
                      style={[
                        styles.timelineDot,
                        { backgroundColor: getStatusColor(status.status) },
                      ]}
                    />
                    {index < statusHistory.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          {
                            backgroundColor: getStatusColor(status.status),
                            height: index === statusHistory.length - 2 ? 60 : 80
                          }
                        ]}
                      />
                    )}
                  </View>
                </View>
                <View style={styles.timelineRight}>
                  <Text style={styles.timelineStatus}>
                    {getStatusLabel(status.status)}
                  </Text>
                  <Text style={styles.timelineDate}>
                    {new Date(status.changed_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Text>
                  <Text style={styles.timelineTime}>
                    {new Date(status.changed_at).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                  {status.notes && (
                    <Text style={styles.timelineNotes}>{status.notes}</Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noHistory}>No status history available</Text>
          )}
        </View>
      </ScrollView>
    </>
  );
};

const getStatusColor = (status) => {
  if (!status) return "#1783BB";

  switch (status.toLowerCase()) {
    case "under review":
    case "pending":
      return "#FFA500";
    case "shortlisted":
      return "#4CAF50";
    case "interview scheduled":
      return "#2196F3";
    case "offer sent":
      return "#673AB7";
    case "rejected":
      return "#F44336";
    default:
      return "#1783BB";
  }
};

const getStatusLabel = (status) => {
  if (!status) return "Applied";

  switch (status.toLowerCase()) {
    case "pending":
      return "Application Received";
    case "reviewed":
      return "Under Review";
    case "shortlisted":
      return "Shortlisted";
    case "interviewed":
      return "Interview Completed";
    case "accepted":
      return "Offer Accepted";
    case "rejected":
      return "Not Selected";
    default:
      return status;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F9FAFB",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  jobCard: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 3,
  },
  jobHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  jobText: {
    marginLeft: 10,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  company: {
    fontSize: 14,
    color: "#1783BB",
  },
  currentStatus: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 20,
    marginLeft: 16,
  },
  timelineContainer: {
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 10,
  },
  timelineLeft: {
    width: 40,
    alignItems: "center",
  },
  timelineDotContainer: {
    alignItems: "center",
    width: 40,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#fff",
    zIndex: 1,
  },
  timelineLine: {
    width: 3,
    position: "absolute",
    top: 20,
    bottom: 0,
  },
  timelineRight: {
    flex: 1,
    paddingLeft: 16,
    paddingBottom: 20,
  },
  timelineStatus: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  timelineTime: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 8,
  },
  timelineNotes: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 8,
    fontStyle: "italic",
    backgroundColor: "#F3F4F6",
    padding: 8,
    borderRadius: 8,
  },
  noHistory: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 20,
  },
});

export default ApplicationStatus;