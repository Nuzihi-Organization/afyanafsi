import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// Configure API base URL
const API_URL = "http://localhost:5000/api"; // Change to your actual API URL

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleLogin = async () => {
    // Input validation
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!password) {
      setError("Password cannot be empty");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      // Changed to match the backend endpoint from authRoutes.js
      const response = await axios.post(`${API_URL}/auth/user/login`, {
        email,
        password,
      });
      
      // Handle the response structure from your backend
      if (response.data.success) {
        // Extract the user's name from the response
        const userData = {
          id: response.data.data.user.id,
          name: response.data.data.user.name,
          email: response.data.data.user.email,
          role: response.data.data.user.role,
        };
        
        await AsyncStorage.setItem('userToken', response.data.data.accessToken);
        await AsyncStorage.setItem('refreshToken', response.data.data.refreshToken);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        
        toast.success("Login successful!", {
          position: "top-center",
        });
        
        // Navigate to HomeScreen with user data
        setTimeout(() => 
          navigation.navigate("HomeScreen", { userData }), 
          1500
        );
      } else {
        setError(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      const errorMsg = 
        error.response?.data?.message || 
        "Unable to connect to server. Please try again.";
      setError(errorMsg);
      
      if (Platform.OS !== 'web') {
        Alert.alert("Login Error", errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const navigateToSignup = () => {
    navigation.navigate("Signup");
  };

  const navigateToForgotPassword = () => {
    navigation.navigate("ForgotPasswordScreen");
  };

  return (
    <>
      <ToastContainer />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <LinearGradient
          colors={['#1d2755', '#124f0d']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-1"
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View className="flex-1 justify-center items-center px-6 py-12">
              <View className="w-full max-w-md bg-white/20 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-white/30">
                <View className="items-center mb-6">
                  <View className="w-20 h-20 bg-white/30 backdrop-blur-md rounded-full items-center justify-center mb-4">
                    <Ionicons name="person" size={40} color="white" />
                  </View>
                  <Text className="text-white text-3xl font-bold">Welcome Back</Text>
                  <Text className="text-white/80 mt-2">Enter your credentials to continue</Text>
                </View>

                <View className="bg-white/10 backdrop-blur-md rounded-xl p-1 mb-4">
                  <View className="flex-row items-center px-3">
                    <Ionicons name="mail-outline" size={20} color="white" />
                    <TextInput
                      className="flex-1 px-3 py-4 text-white"
                      placeholder="Email Address"
                      placeholderTextColor="rgba(255, 255, 255, 0.6)"
                      onChangeText={(text) => {
                        setEmail(text);
                        setError("");
                      }}
                      value={email}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View className="bg-white/10 backdrop-blur-md rounded-xl p-1 mb-6">
                  <View className="flex-row items-center px-3">
                    <Ionicons name="lock-closed-outline" size={20} color="white" />
                    <TextInput
                      className="flex-1 px-3 py-4 text-white"
                      placeholder="Password"
                      placeholderTextColor="rgba(255, 255, 255, 0.6)"
                      secureTextEntry
                      onChangeText={(text) => {
                        setPassword(text);
                        setError("");
                      }}
                      value={password}
                    />
                  </View>
                </View>

                {error && (
                  <View className="bg-red-500/20 backdrop-blur-md p-3 rounded-lg mb-4">
                    <Text className="text-white text-center">{error}</Text>
                  </View>
                )}

                <TouchableOpacity
                  className="bg-white/20 backdrop-blur-md py-4 rounded-xl mb-6 overflow-hidden"
                  onPress={handleLogin}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="absolute top-0 left-0 right-0 bottom-0"
                  />
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white text-center font-bold text-lg">
                      Log In
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={navigateToForgotPassword}
                  className="mb-6"
                >
                  <Text className="text-center text-white/80">
                    Forgot your password?
                  </Text>
                </TouchableOpacity>

                <View className="flex-row justify-center items-center">
                  <Text className="text-white/80">
                    Don't have an account?{" "}
                  </Text>
                  <TouchableOpacity onPress={navigateToSignup}>
                    <Text className="text-yellow-300 font-bold">
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </>
  );
};

export default LoginScreen;