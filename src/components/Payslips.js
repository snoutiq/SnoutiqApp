import React, { useEffect, useState, useCallback, useContext } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Dimensions,
} from "react-native";
import {
  Text,
  Card,
  Searchbar,
  ActivityIndicator,
  IconButton,
  Menu,
  Divider,
  useTheme,
} from "react-native-paper";
import { Feather } from "@expo/vector-icons";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import * as WebBrowser from "expo-web-browser";
import { useSafeAreaInsets,SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';


const { width, height } = Dimensions.get('window');

// Custom color constant
const PAYSLIP_COLOR = "#3182CE";

export default function Payslip({ navigation }) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [payslips, setPayslips] = useState([]);
  const [filteredPayslips, setFilteredPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [sortOption, setSortOption] = useState("newest");

  // const ServerURL = process.env.EXPO_PUBLIC_SERVER_URL;
    const ServerURL = Constants.expoConfig.extra.serverUrl;


  // Formatting helpers
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const exponent = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, exponent)).toFixed(1)} ${units[exponent]}`;
  };

  const getFileIcon = () => "file-invoice"; // Only payslips will be shown

  // Data fetching
  const fetchPayslips = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError("");

      const endpoint = `${ServerURL}payslip/employee/${user.employeeId}`;

      if (!user.employeeId) {
        throw new Error("Employee ID not found");
      }

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch payslips");
      }

      setPayslips(data.payslips || []);
      setFilteredPayslips(data.payslips || []);
    } catch (err) {
      console.error("Fetch payslips error:", err);
      setError(err.message);
      setPayslips([]);
      setFilteredPayslips([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPayslips();
  }, [fetchPayslips]);

  // Search and sort functionality
  useEffect(() => {
    const filtered = payslips.filter(
      (payslip) =>
        payslip.payslip_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payslip.uploaded_by?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    let sorted = [...filtered];
    switch (sortOption) {
      case "newest":
        sorted.sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));
        break;
      case "oldest":
        sorted.sort((a, b) => new Date(a.uploaded_at) - new Date(b.uploaded_at));
        break;
      case "name_asc":
        sorted.sort((a, b) => a.payslip_name.localeCompare(b.payslip_name));
        break;
      case "name_desc":
        sorted.sort((a, b) => b.payslip_name.localeCompare(a.payslip_name));
        break;
      default:
        break;
    }

    setFilteredPayslips(sorted);
  }, [searchQuery, payslips, sortOption]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPayslips();
  };

  const openDocument = async (id) => {
    try {
      await WebBrowser.openBrowserAsync(`${ServerURL}/payslip/${id}`, {
        toolbarColor: PAYSLIP_COLOR,
        controlsColor: "#ffffff",
        dismissButtonStyle: "close",
        enableBarCollapsing: true,
      });
    } catch (error) {
      console.error("Failed to open document:", error);
    }
  };

  // UI Components
  const SortMenu = () => (
    <Menu
      visible={sortMenuVisible}
      onDismiss={() => setSortMenuVisible(false)}
      anchor={
        <IconButton
          icon="sort"
          size={24}
          onPress={() => setSortMenuVisible(true)}
          style={[styles.sortButton, { backgroundColor: theme.colors.surface }]}
          iconColor={PAYSLIP_COLOR}
        />
      }
      contentStyle={[styles.menuContent, { backgroundColor: theme.colors.surface }]}
    >
      <Menu.Item
        title="Newest First"
        leadingIcon={sortOption === "newest" ? "check" : null}
        onPress={() => {
          setSortOption("newest");
          setSortMenuVisible(false);
        }}
        titleStyle={{ color: theme.colors.onSurface }}
      />
      <Menu.Item
        title="Oldest First"
        leadingIcon={sortOption === "oldest" ? "check" : null}
        onPress={() => {
          setSortOption("oldest");
          setSortMenuVisible(false);
        }}
        titleStyle={{ color: theme.colors.onSurface }}
      />
      <Divider style={styles.menuDivider} />
      <Menu.Item
        title="A-Z"
        leadingIcon={sortOption === "name_asc" ? "check" : null}
        onPress={() => {
          setSortOption("name_asc");
          setSortMenuVisible(false);
        }}
        titleStyle={{ color: theme.colors.onSurface }}
      />
      <Menu.Item
        title="Z-A"
        leadingIcon={sortOption === "name_desc" ? "check" : null}
        onPress={() => {
          setSortOption("name_desc");
          setSortMenuVisible(false);
        }}
        titleStyle={{ color: theme.colors.onSurface }}
      />
    </Menu>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <FontAwesome5 name="file-invoice" size={48} color={PAYSLIP_COLOR} />
      <Text variant="titleMedium" style={[styles.emptyText, { color: theme.colors.onSurface }]}>
        {searchQuery ? "No matching payslips found" : "No payslips available"}
      </Text>
      <Text style={[styles.emptySubtext, { color: theme.colors.outline }]}>
        {searchQuery
          ? "Try a different search term"
          : "Your payslips will appear here once available"}
      </Text>
    </View>
  );

  const ErrorState = () => (
    <View style={styles.emptyContainer}>
      <Feather name="alert-circle" size={48} color={theme.colors.error} />
      <Text variant="titleMedium" style={[styles.emptyText, { color: theme.colors.onSurface }]}>
        Couldn't load payslips
      </Text>
      <Text style={[styles.emptySubtext, { color: theme.colors.outline }]}>{error}</Text>
      <TouchableOpacity
        style={[styles.retryButton, { backgroundColor: PAYSLIP_COLOR }]}
        onPress={fetchPayslips}
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const PayslipItem = ({ item }) => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <TouchableOpacity onPress={() => openDocument(item.id)} activeOpacity={0.7}>
        <Card.Content>
          <View style={styles.itemContainer}>
            <View style={[styles.iconContainer, { backgroundColor: `${PAYSLIP_COLOR}20` }]}>
              <FontAwesome5
                name={getFileIcon()}
                size={20}
                color={PAYSLIP_COLOR}
              />
            </View>
            <View style={styles.itemTextContainer}>
              <Text
                variant="titleMedium"
                numberOfLines={1}
                style={[styles.itemTitle, { color: theme.colors.onSurface }]}
              >
                {item.payslip_name}
              </Text>
              <View style={styles.itemMeta}>
                <Text variant="bodySmall" style={[styles.metaText, { color: theme.colors.outline }]}>
                  {formatDate(item.uploaded_at)}
                </Text>
                <Text variant="bodySmall" style={[styles.metaText, { color: theme.colors.outline }]}>
                  {formatFileSize(item.file_size)}
                </Text>
              </View>
              {item.uploaded_by && (
                <Text variant="bodySmall" style={[styles.uploaderText, { color: theme.colors.outline }]}>
                  Uploaded by {item.uploaded_by}
                </Text>
              )}
            </View>
            <Feather
              name="download"
              size={20}
              color={PAYSLIP_COLOR}
              style={styles.downloadIcon}
            />
          </View>
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={PAYSLIP_COLOR} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ErrorState />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
          <Text variant="headlineSmall" style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
            My Payslips
          </Text>
          <View style={styles.headerRight} />
        </View>

      <View style={[styles.contentContainer, { backgroundColor: theme.colors.background }]}>
        <View style={styles.headerInfo}>
          <Text variant="bodyMedium" style={[styles.headerSubtitle, { color: theme.colors.outline }]}>
            {filteredPayslips.length} {filteredPayslips.length !== 1 ? "payslips" : "payslip"}
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search payslips..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
            inputStyle={styles.searchInput}
            iconColor={PAYSLIP_COLOR}
            placeholderTextColor={theme.colors.outline}
            elevation={1}
          />
          <SortMenu />
        </View>

        <FlatList
          data={filteredPayslips}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[PAYSLIP_COLOR]}
              tintColor={PAYSLIP_COLOR}
              progressBackgroundColor={theme.colors.surface}
            />
          }
          renderItem={({ item }) => <PayslipItem item={item} />}
          ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.colors.surfaceVariant }]} />}
          ListEmptyComponent={<EmptyState />}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontWeight: "700",
    flex: 1,
    textAlign: 'center',
    marginLeft: -24, // To center the title properly
  },
  headerRight: {
    width: 24,
  },
  headerInfo: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerSubtitle: {
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  searchBar: {
    flex: 1,
    borderRadius: 12,
    height: 48,
  },
  searchInput: {
    minHeight: 48,
    paddingVertical: 0,
    includeFontPadding: false,
  },
  sortButton: {
    marginLeft: 8,
    borderRadius: 12,
    width: 48,
    height: 48,
  },
  menuContent: {
    borderRadius: 12,
    paddingVertical: 8,
  },
  menuDivider: {
    marginVertical: 4,
  },
  listContent: {
    paddingBottom: 16,
    flexGrow: 1,
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontWeight: "500",
    marginBottom: 2,
  },
  itemMeta: {
    flexDirection: "row",
    marginBottom: 4,
  },
  metaText: {
    marginRight: 12,
    fontSize: 13,
  },
  uploaderText: {
    fontSize: 13,
  },
  downloadIcon: {
    marginLeft: 8,
  },
  separator: {
    height: 1,
    opacity: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontWeight: "500",
  },
});