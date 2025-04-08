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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
      
      // Call backend login endpoint
      const response = await axios.post(`${API_URL}/users/login`, {
        email,
        password,
      });
      
      // Store user data and token
      await AsyncStorage.setItem('userToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify({
        id: response.data._id,
        name: response.data.name,
        email: response.data.email,
      }));
      
      toast.success("Login successful!", {
        position: "top-center",
      });
      
      // Navigate to Main Screen
      setTimeout(() => navigation.navigate("HomeScreen"), 1500);
    } catch (error) {
      const errorMsg = 
        error.response?.data?.message || 
        "Unable to connect to server. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const navigateToSignup = () => {
    navigation.navigate("Signup");
  };

  return (
    <>
      <ToastContainer />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 justify-center items-center bg-gradient-to-tr from-[#1d2755] to-[#124f0d] px-6">
            <View className="w-full max-w-md bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg p-6 rounded-lg shadow-lg">
              <Text className="text-black text-2xl font-bold mb-4">Log In</Text>
              <Text className="text-black mb-4 text-sm">
                Enter your credentials to log in
              </Text>

              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-2 mb-2 text-black w-full bg-white"
                placeholder="myemail@domain.com"
                placeholderTextColor="#666"
                onChangeText={(text) => {
                  setEmail(text);
                  setError("");
                }}
                value={email}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-2 mb-2 text-black w-full bg-white"
                placeholder="Password"
                placeholderTextColor="#666"
                secureTextEntry
                onChangeText={(text) => {
                  setPassword(text);
                  setError("");
                }}
                value={password}
              />
              {error && <Text className="text-red-500 text-xs mb-4">{error}</Text>}

              <TouchableOpacity
                className="bg-black py-3 rounded-lg mb-4"
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-semibold">
                    Log In
                  </Text>
                )}
              </TouchableOpacity>

              <Text className="text-center text-xs text-black">
                Don't have an account?{" "}
                <Text 
                  className="text-yellow-600 underline"
                  onPress={navigateToSignup}
                >
                  Sign Up
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default LoginScreen;