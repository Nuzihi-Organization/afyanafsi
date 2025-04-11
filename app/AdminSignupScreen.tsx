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

const AdminSignupScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSignup = async () => {
    // Input validation
    if (!name) {
      setError("Name cannot be empty");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const response = await axios.post(`${API_URL}/auth/admin/signup`, {
        name,
        email,
        password,
        role: "admin"
      });
      
      if (response.data.success) {
        toast.success("Signup successful! Please login.", {
          position: "top-center",
        });
        
        // Navigate to login after successful signup
        setTimeout(() => 
          navigation.navigate("AdminLoginScreen"), 
          1500
        );
      } else {
        setError(response.data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
      const errorMsg = 
        error.response?.data?.message || 
        "Unable to connect to server. Please try again.";
      setError(errorMsg);
      
      if (Platform.OS !== 'web') {
        Alert.alert("Signup Error", errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate("AdminLoginScreen");
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
                    <Ionicons name="shield" size={40} color="white" />
                  </View>
                  <Text className="text-white text-3xl font-bold">Admin Signup</Text>
                  <Text className="text-white/80 mt-2">Create your admin account</Text>
                </View>

                <View className="bg-white/10 backdrop-blur-md rounded-xl p-1 mb-4">
                  <View className="flex-row items-center px-3">
                    <Ionicons name="person-outline" size={20} color="white" />
                    <TextInput
                      className="flex-1 px-3 py-4 text-white"
                      placeholder="Full Name"
                      placeholderTextColor="rgba(255, 255, 255, 0.6)"
                      onChangeText={(text) => {
                        setName(text);
                        setError("");
                      }}
                      value={name}
                    />
                  </View>
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

                <View className="bg-white/10 backdrop-blur-md rounded-xl p-1 mb-4">
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

                <View className="bg-white/10 backdrop-blur-md rounded-xl p-1 mb-6">
                  <View className="flex-row items-center px-3">
                    <Ionicons name="lock-closed-outline" size={20} color="white" />
                    <TextInput
                      className="flex-1 px-3 py-4 text-white"
                      placeholder="Confirm Password"
                      placeholderTextColor="rgba(255, 255, 255, 0.6)"
                      secureTextEntry
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        setError("");
                      }}
                      value={confirmPassword}
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
                  onPress={handleSignup}
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
                      Sign Up
                    </Text>
                  )}
                </TouchableOpacity>

                <View className="flex-row justify-center items-center">
                  <Text className="text-white/80">
                    Already have an account?{" "}
                  </Text>
                  <TouchableOpacity onPress={navigateToLogin}>
                    <Text className="text-yellow-300 font-bold">
                      Log In
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

export default AdminSignupScreen;