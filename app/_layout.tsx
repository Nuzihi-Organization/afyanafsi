import React, { useState } from 'react';
import { View, SafeAreaView, Platform, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-gesture-handler';

import HomeScreen from './HomeScreen';
import ChatScreen from './ChatScreen';
import AIchat from './AIchat';
import LoginScreen from './Login';
import SignupScreen from './Signup';
import MyBookings from './MyBookings';
import TherapistsScreen from './Therapists';
import TherapyScreen from './Therapy';
import BookingDetails from './BookingDetails';
import PreferencesScreen from './PrefferencesScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';
import TherapistProfileScreen from './TherapistProfileScreen';
import AdminDashboard from './AdminDashboard';
import Journal from './Journal';
import AdminLoginScreen from './AdminLoginScreen';
import AdminSignupScreen from './AdminSignupScreen';
import RescheduleBooking from './RescheduleBooking';

//  sidebar components
import SidebarMenu from './SidebarMenu';
import SidebarToggle from './SidebarToggle';


const Stack = createStackNavigator();

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* <NavigationContainer> */}
      <ScrollView 
  className={`flex-1 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
  contentContainerStyle={{ flexGrow: 1 }}
></ScrollView>
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
          <StatusBar
            barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
            backgroundColor="#0d9488" // Teal color for Android
          />
          
          <Stack.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: '#0d9488', // Teal color
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              headerLeft: () => (
                <View className="ml-2">
                  <SidebarToggle onPress={toggleSidebar} isOpen={isSidebarOpen} />
                </View>
              ),
            }}
          >
            <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'Nuzihi' }} />
            <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ title: 'Therapist Chat' }} />
            <Stack.Screen name="AIchat" component={AIchat} options={{ title: 'AI Assistant' }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login', headerShown: false }} />
            <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Sign Up', headerShown: false }} />
            <Stack.Screen name="MyBookings" component={MyBookings} options={{ title: 'My Sessions' }} />
            <Stack.Screen name="Therapists" component={TherapistsScreen} options={{ title: 'Find Therapists' }} />
            <Stack.Screen name="Journal" component={Journal} options={{ title: 'My Journal' }} />
            <Stack.Screen name="Therapy" component={TherapyScreen} options={{ title: 'Therapy Options' }} />
            <Stack.Screen name="BookingDetails" component={BookingDetails} options={{ title: 'Session Details' }} />
            <Stack.Screen name="PreferencesScreen" component={PreferencesScreen} options={{ title: 'Preferences' }} />
            <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} options={{ title: 'Reset Password', headerShown: false }} />
            <Stack.Screen name="TherapistProfileScreen" component={TherapistProfileScreen} options={{ title: 'Therapist Profile' }} />
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ title: 'Admin Dashboard' }} />
            <Stack.Screen name="AdminLoginScreen" component={AdminLoginScreen} options={{ title: 'Admin Login', headerShown: false }} />
            <Stack.Screen name="AdminSignupScreen" component={AdminSignupScreen} options={{ title: 'Admin Sign Up', headerShown: false }} />
            <Stack.Screen name="RescheduleBooking" component={RescheduleBooking} options={{ title: 'Reschedule Session' }} />
          </Stack.Navigator>
          
          {/* Sidebar Menu */}
          <SidebarMenu isOpen={isSidebarOpen} onClose={closeSidebar} />
        </SafeAreaView>
      {/* </NavigationContainer> */}
    </GestureHandlerRootView>
  );
}