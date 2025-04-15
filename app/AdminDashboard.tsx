import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  TextInput,
  Image,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import axios from "axios";

// Configure API base URL - update with your actual server IP
// const API_URL = "http://10.0.2.2:5000/api"; // For Android emulator
const API_URL = "http://localhost:5000/api"; // For iOS simulator
// const API_URL = "http://YOUR_LOCAL_IP:5000/api"; // For physical devices

const AdminDashboard = ({ route }) => {
  const navigation = useNavigation();
  const [adminData, setAdminData] = useState(route?.params?.adminData || {});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTherapists: 0,
    pendingApplications: 0,
    activeTherapists: 0,
  });
  
  // Data for different sections
  const [therapists, setTherapists] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState("");
  const [actionReason, setActionReason] = useState("");
  
  // Load admin data from AsyncStorage on component mount
  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const storedAdminData = await AsyncStorage.getItem("adminData");
        if (storedAdminData) {
          setAdminData(JSON.parse(storedAdminData));
        }
      } catch (error) {
        console.error("Error loading admin data:", error);
      }
    };

    if (!adminData.id) {
      loadAdminData();
    }

    fetchDashboardData();
  }, []);

  // Refresh data when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchDashboardData();
      return () => {};
    }, [])
  );

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("adminToken");
      if (!token) {
        Alert.alert("Session Expired", "Please login again.");
        navigation.navigate("AdminLoginScreen");
        return;
      }

      // Set authorization header for all requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Fetch dashboard overview data
      const overviewResponse = await axios.get(`${API_URL}/admin/dashboard/overview`);
      
      if (overviewResponse.data.success) {
        setStats(overviewResponse.data.data);
      }

      // Fetch therapists data
      const therapistsResponse = await axios.get(`${API_URL}/admin/therapists`);
      if (therapistsResponse.data.success) {
        setTherapists(therapistsResponse.data.data);
      }

      // Fetch pending applications
      const applicationsResponse = await axios.get(`${API_URL}/admin/therapists/applications`);
      if (applicationsResponse.data.success) {
        setPendingApplications(applicationsResponse.data.data);
      }

      // Fetch users data
      const usersResponse = await axios.get(`${API_URL}/users`);
      if (usersResponse.data.success) {
        setUsers(usersResponse.data.data);
      }

      // Fetch reports data
      const reportsResponse = await axios.get(`${API_URL}/admin/reports`);
      if (reportsResponse.data.success) {
        setReports(reportsResponse.data.data);
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error.response?.data || error.message);
      Alert.alert(
        "Error",
        "Unable to fetch dashboard data. Please check your connection."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("adminToken");
      await AsyncStorage.removeItem("adminRefreshToken");
      await AsyncStorage.removeItem("adminData");
      navigation.reset({
        index: 0,
        routes: [{ name: "AdminLoginScreen" }],
      });
    } catch (error) {
      console.error("Error during logout:", error);
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  const showModal = (type, item) => {
    setModalType(type);
    setSelectedItem(item);
    setActionReason("");
    setModalVisible(true);
  };

  const handleModalAction = async () => {
    try {
      setLoading(true);
      
      let endpoint = "";
      let payload = { reason: actionReason };
      
      switch (modalType) {
        case "approve_therapist":
          endpoint = `${API_URL}/admin/therapists/${selectedItem._id}/approve`;
          break;
        case "reject_therapist":
          endpoint = `${API_URL}/admin/therapists/${selectedItem._id}/reject`;
          break;
        case "suspend_therapist":
          endpoint = `${API_URL}/admin/therapists/${selectedItem._id}/suspend`;
          break;
        case "suspend_user":
          endpoint = `${API_URL}/admin/users/${selectedItem._id}/suspend`;
          break;
        default:
          setModalVisible(false);
          return;
      }
      
      const response = await axios.post(endpoint, payload);
      
      if (response.data.success) {
        Alert.alert("Success", response.data.message);
        setModalVisible(false);
        fetchDashboardData();
      } else {
        Alert.alert("Error", response.data.message || "Action failed. Please try again.");
      }
    } catch (error) {
      console.error("Error performing action:", error.response?.data || error.message);
      Alert.alert("Error", "Action failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Render dashboard header
  const renderHeader = () => (
    <LinearGradient
      colors={["#1d2755", "#124f0d"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      className="p-6 rounded-b-3xl shadow-lg"
    >
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-white text-2xl font-bold">Admin Dashboard</Text>
          <Text className="text-white/80 mt-1">
            Welcome back, {adminData.name || "Admin"}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-white/20 rounded-full p-2"
        >
          <Ionicons name="log-out-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View className="flex-row mt-6 justify-between">
        <StatCard
          icon="people"
          title="Users"
          value={stats.totalUsers}
          color="#4c6ef5"
        />
        <StatCard
          icon="medkit"
          title="Therapists"
          value={stats.totalTherapists}
          color="#12b886"
        />
        <StatCard
          icon="hourglass"
          title="Pending"
          value={stats.pendingApplications}
          color="#ff922b"
        />
      </View>
    </LinearGradient>
  );

  // Stat card component for header
  const StatCard = ({ icon, title, value, color }) => (
    <View
      className="bg-white/20 rounded-xl p-3 w-24"
      style={{ borderLeftWidth: 3, borderLeftColor: color }}
    >
      <Ionicons name={icon} size={24} color="white" />
      <Text className="text-white font-semibold mt-2">{title}</Text>
      <Text className="text-white text-lg font-bold">{value}</Text>
    </View>
  );

  // Navigation tabs
  const renderTabs = () => (
    <View className="flex-row justify-between px-4 py-3 bg-white rounded-xl mx-4 -mt-5 shadow-md">
      <TabButton
        title="Overview"
        icon="home"
        active={activeTab === "overview"}
        onPress={() => setActiveTab("overview")}
      />
      <TabButton
        title="Applications"
        icon="document-text"
        active={activeTab === "applications"}
        onPress={() => setActiveTab("applications")}
      />
      <TabButton
        title="Therapists"
        icon="people"
        active={activeTab === "therapists"}
        onPress={() => setActiveTab("therapists")}
      />
      <TabButton
        title="Users"
        icon="person"
        active={activeTab === "users"}
        onPress={() => setActiveTab("users")}
      />
    </View>
  );

  // Tab button component
  const TabButton = ({ title, icon, active, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`items-center p-2 ${
        active
          ? "border-b-2 border-green-700"
          : ""
      }`}
    >
      <Ionicons
        name={`${icon}${active ? "" : "-outline"}`}
        size={22}
        color={active ? "#124f0d" : "#777"}
      />
      <Text
        className={`text-xs mt-1 ${
          active ? "text-green-800 font-bold" : "text-gray-500"
        }`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  // Render application card
  const renderApplicationCard = (item) => (
    <View className="bg-white rounded-lg p-4 shadow-sm mb-4 border border-gray-100">
      <View className="flex-row justify-between">
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-gray-100 rounded-full justify-center items-center">
            <Ionicons name="person" size={24} color="#555" />
          </View>
          <View className="ml-3">
            <Text className="font-bold text-lg">{item.name}</Text>
            <Text className="text-gray-600">{item.specialization}</Text>
          </View>
        </View>
        <View className="bg-yellow-100 py-1 px-3 rounded-full">
          <Text className="text-yellow-700 font-medium">Pending</Text>
        </View>
      </View>
      
      <View className="mt-3 pb-3 border-b border-gray-100">
        <Text className="text-gray-500">{item.email}</Text>
        <Text className="text-gray-500">Experience: {item.experience} years</Text>
        <Text className="text-gray-700 mt-2">
          {item.bio?.substring(0, 100)}
          {item.bio?.length > 100 ? "..." : ""}
        </Text>
      </View>
      
      <View className="flex-row justify-end mt-3">
        <TouchableOpacity
          className="bg-red-100 py-2 px-4 rounded-lg mr-3"
          onPress={() => showModal("reject_therapist", item)}
        >
          <Text className="text-red-700 font-medium">Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-green-600 py-2 px-4 rounded-lg"
          onPress={() => showModal("approve_therapist", item)}
        >
          <Text className="text-white font-medium">Approve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render therapist card
  const renderTherapistCard = (item) => (
    <View className="bg-white rounded-lg p-4 shadow-sm mb-4 border border-gray-100">
      <View className="flex-row justify-between">
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-gray-100 rounded-full justify-center items-center">
            <Ionicons name="person" size={24} color="#555" />
          </View>
          <View className="ml-3">
            <Text className="font-bold text-lg">{item.name}</Text>
            <Text className="text-gray-600">{item.specialization}</Text>
          </View>
        </View>
        <View className={`py-1 px-3 rounded-full ${item.isActive ? "bg-green-100" : "bg-red-100"}`}>
          <Text className={item.isActive ? "text-green-700 font-medium" : "text-red-700 font-medium"}>
            {item.isActive ? "Active" : "Suspended"}
          </Text>
        </View>
      </View>
      
      <View className="mt-3 pb-3 border-b border-gray-100">
        <Text className="text-gray-500">{item.email}</Text>
        <Text className="text-gray-500">Clients: {item.clientCount || 0}</Text>
        <Text className="text-gray-500">Rating: {item.rating || "N/A"} ⭐</Text>
      </View>
      
      <View className="flex-row justify-end mt-3">
        <TouchableOpacity
          className="bg-blue-100 py-2 px-4 rounded-lg mr-3"
          onPress={() => navigation.navigate("TherapistProfile", { therapistId: item._id })}
        >
          <Text className="text-blue-700 font-medium">View</Text>
        </TouchableOpacity>
        {item.isActive ? (
          <TouchableOpacity
            className="bg-red-600 py-2 px-4 rounded-lg"
            onPress={() => showModal("suspend_therapist", item)}
          >
            <Text className="text-white font-medium">Suspend</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="bg-green-600 py-2 px-4 rounded-lg"
            onPress={() => handleReactivateTherapist(item._id)}
          >
            <Text className="text-white font-medium">Reactivate</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Render user card
  const renderUserCard = (item) => (
    <View className="bg-white rounded-lg p-4 shadow-sm mb-4 border border-gray-100">
      <View className="flex-row justify-between">
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-gray-100 rounded-full justify-center items-center">
            <Ionicons name="person" size={24} color="#555" />
          </View>
          <View className="ml-3">
            <Text className="font-bold text-lg">{item.name}</Text>
            <Text className="text-gray-500">{item.email}</Text>
          </View>
        </View>
        <View className={`py-1 px-3 rounded-full ${item.isActive ? "bg-green-100" : "bg-red-100"}`}>
          <Text className={item.isActive ? "text-green-700 font-medium" : "text-red-700 font-medium"}>
            {item.isActive ? "Active" : "Suspended"}
          </Text>
        </View>
      </View>
      
      <View className="mt-3 pb-3 border-b border-gray-100">
        <Text className="text-gray-500">Joined: {new Date(item.createdAt).toLocaleDateString()}</Text>
        <Text className="text-gray-500">Sessions: {item.sessionCount || 0}</Text>
      </View>
      
      <View className="flex-row justify-end mt-3">
        <TouchableOpacity
          className="bg-blue-100 py-2 px-4 rounded-lg mr-3"
          onPress={() => navigation.navigate("UserProfile", { userId: item._id })}
        >
          <Text className="text-blue-700 font-medium">View</Text>
        </TouchableOpacity>
        {item.isActive ? (
          <TouchableOpacity
            className="bg-red-600 py-2 px-4 rounded-lg"
            onPress={() => showModal("suspend_user", item)}
          >
            <Text className="text-white font-medium">Suspend</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="bg-green-600 py-2 px-4 rounded-lg"
            onPress={() => handleReactivateUser(item._id)}
          >
            <Text className="text-white font-medium">Reactivate</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Handle reactivate therapist
  const handleReactivateTherapist = async (therapistId) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/admin/therapists/${therapistId}/reactivate`);
      
      if (response.data.success) {
        Alert.alert("Success", "Therapist reactivated successfully");
        fetchDashboardData();
      } else {
        Alert.alert("Error", response.data.message || "Failed to reactivate therapist");
      }
    } catch (error) {
      console.error("Error reactivating therapist:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to reactivate therapist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle reactivate user
  const handleReactivateUser = async (userId) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/admin/users/${userId}/reactivate`);
      
      if (response.data.success) {
        Alert.alert("Success", "User reactivated successfully");
        fetchDashboardData();
      } else {
        Alert.alert("Error", response.data.message || "Failed to reactivate user");
      }
    } catch (error) {
      console.error("Error reactivating user:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to reactivate user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Render overview tab
  const renderOverview = () => (
    <View className="px-4">
      {/* Quick Actions */}
      <View className="mt-4">
        <Text className="text-lg font-bold text-gray-800 mb-3">Quick Actions</Text>
        <View className="flex-row flex-wrap justify-between">
          <ActionButton 
            title="New Therapist" 
            icon="medkit" 
            color="#4263eb" 
            onPress={() => navigation.navigate("RegisterTherapist")}
          />
          <ActionButton 
            title="Reports" 
            icon="bar-chart" 
            color="#f03e3e" 
            onPress={() => navigation.navigate("Reports")}
          />
          <ActionButton 
            title="Settings" 
            icon="settings" 
            color="#1098ad" 
            onPress={() => navigation.navigate("AdminSettings")}
          />
          <ActionButton 
            title="Notifications" 
            icon="notifications" 
            color="#f59f00" 
            onPress={() => navigation.navigate("AdminNotifications")}
          />
        </View>
      </View>

      {/* Recent Applications */}
      <View className="mt-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-bold text-gray-800">Recent Applications</Text>
          <TouchableOpacity onPress={() => setActiveTab("applications")}>
            <Text className="text-green-700">See All</Text>
          </TouchableOpacity>
        </View>

        {pendingApplications.length > 0 ? (
          pendingApplications.slice(0, 2).map((item) => renderApplicationCard(item))
        ) : (
          <View className="bg-gray-50 p-4 rounded-lg items-center">
            <Text className="text-gray-500">No pending applications</Text>
          </View>
        )}
      </View>

      {/* System Stats */}
      <View className="mt-6 mb-8">
        <Text className="text-lg font-bold text-gray-800 mb-3">System Statistics</Text>
        <View className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
            <Text className="text-gray-600">Total Sessions</Text>
            <Text className="font-bold">{stats.totalSessions || 0}</Text>
          </View>
          <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
            <Text className="text-gray-600">Completed Sessions</Text>
            <Text className="font-bold">{stats.completedSessions || 0}</Text>
          </View>
          <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
            <Text className="text-gray-600">Active Therapists</Text>
            <Text className="font-bold">{stats.activeTherapists || 0}</Text>
          </View>
          <View className="flex-row justify-between items-center py-2">
            <Text className="text-gray-600">Active Users</Text>
            <Text className="font-bold">{stats.activeUsers || 0}</Text>
          </View>

          <TouchableOpacity 
            className="bg-blue-50 p-3 rounded-lg mt-3 flex-row justify-center items-center"
            onPress={() => navigation.navigate("FullStatistics")}
          >
            <Text className="text-blue-700 font-medium">View Detailed Statistics</Text>
            <Ionicons name="arrow-forward" size={16} color="#1a73e8" style={{ marginLeft: 5 }} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Action button component
  const ActionButton = ({ title, icon, color, onPress }) => (
    <TouchableOpacity 
      onPress={onPress}
      className="bg-white rounded-xl p-4 mb-3 shadow-sm w-[48%] border border-gray-100"
    >
      <View 
        className="w-12 h-12 rounded-full items-center justify-center mb-2"
        style={{ backgroundColor: `${color}20` }}
      >
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text className="font-medium text-gray-800">{title}</Text>
    </TouchableOpacity>
  );

  // Render modal
  const renderModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white w-[90%] rounded-2xl p-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            {modalType === "approve_therapist" && "Approve Therapist Application"}
            {modalType === "reject_therapist" && "Reject Therapist Application"}
            {modalType === "suspend_therapist" && "Suspend Therapist"}
            {modalType === "suspend_user" && "Suspend User"}
          </Text>
          
          {selectedItem && (
            <View className="bg-gray-50 p-3 rounded-lg mb-4">
              <Text className="font-medium">{selectedItem.name}</Text>
              <Text className="text-gray-600">{selectedItem.email}</Text>
            </View>
          )}
          
          <Text className="mb-2 text-gray-700">Reason:</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 mb-4 text-gray-800"
            placeholder="Enter reason for this action"
            multiline={true}
            numberOfLines={3}
            value={actionReason}
            onChangeText={setActionReason}
          />
          
          <View className="flex-row justify-end">
            <TouchableOpacity 
              className="bg-gray-200 py-2 px-4 rounded-lg mr-3"
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-gray-800 font-medium">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className={`py-2 px-4 rounded-lg ${
                modalType.includes('approve') ? 'bg-green-600' : 'bg-red-600'
              }`}
              onPress={handleModalAction}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-medium">
                  {modalType === "approve_therapist" && "Approve"}
                  {modalType === "reject_therapist" && "Reject"}
                  {modalType === "suspend_therapist" && "Suspend"}
                  {modalType === "suspend_user" && "Suspend"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {renderHeader()}
      {renderTabs()}

      {loading && !refreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#124f0d" />
          <Text className="text-gray-600 mt-2">Loading data...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {activeTab === "overview" && renderOverview()}
          
          {activeTab === "applications" && (
            <View className="px-4 py-4">
              <Text className="text-lg font-bold text-gray-800 mb-3">
                Pending Applications ({pendingApplications.length})
              </Text>
              
              {pendingApplications.length > 0 ? (
                pendingApplications.map((item, index) => (
                  <View key={item._id || index}>
                    {renderApplicationCard(item)}
                  </View>
                ))
              ) : (
                <View className="bg-white p-6 rounded-lg shadow-sm items-center justify-center border border-gray-100">
                  <Ionicons name="document-text-outline" size={48} color="#cccccc" />
                  <Text className="text-gray-500 mt-2">No pending applications</Text>
                </View>
              )}
            </View>
          )}
          
          {activeTab === "therapists" && (
            <View className="px-4 py-4">
              <Text className="text-lg font-bold text-gray-800 mb-3">
                Therapists ({therapists.length})
              </Text>
              
              {therapists.length > 0 ? (
                therapists.map((item, index) => (
                  <View key={item._id || index}>
                    {renderTherapistCard(item)}
                  </View>
                ))
              ) : (
                <View className="bg-white p-6 rounded-lg shadow-sm items-center justify-center border border-gray-100">
                  <Ionicons name="people-outline" size={48} color="#cccccc" />
                  <Text className="text-gray-500 mt-2">No therapists found</Text>
                </View>
              )}
            </View>
          )}
          
          {activeTab === "users" && (
            <View className="px-4 py-4">
              <Text className="text-lg font-bold text-gray-800 mb-3">
                Users ({users.length})
              </Text>
              
              {users.length > 0 ? (
                users.map((item, index) => (
                  <View key={item._id || index}>
                    {renderUserCard(item)}
                  </View>
                ))
              ) : (
                <View className="bg-white p-6 rounded-lg shadow-sm items-center justify-center border border-gray-100">
                  <Ionicons name="person-outline" size={48} color="#cccccc" />
                  <Text className="text-gray-500 mt-2">No users found</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}

      {/* Add Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-green-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={() => navigation.navigate("AdminActions")}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {renderModal()}
    </View>
  );
};

export default AdminDashboard;