import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// Configure API base URL
const API_URL = "http://localhost:5000/api"; // Change to your actual API URL

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user"); // Default role
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("forgot"); // forgot, reset, change
  const navigation = useNavigation();
  const route = useRoute();

  // Check if we arrived with a reset token from email link
  useEffect(() => {
    if (route.params?.token) {
      setResetToken(route.params.token);
      setActiveTab("reset");
    }
  }, [route.params]);

  // Check if user is logged in for the Change Password tab
  useEffect(() => {
    const checkUserSession = async () => {
      if (activeTab === 'change') {
        const userToken = await AsyncStorage.getItem('userToken');
        const userData = await AsyncStorage.getItem('userData');
        
        if (!userToken || !userData) {
          // Show error if user tries to access Change Password without being logged in
          setError("You must be logged in to change your password");
          // Optional: Navigate back to login
          // navigation.navigate('Login');
        } else {
          // If user is logged in, clear any previous errors
          setError("");
          // Get user data
          const user = JSON.parse(userData);
          // Set the role based on the user data
          if (user.role) {
            setRole(user.role);
          }
        }
      }
    };
    
    checkUserSession();
  }, [activeTab]);

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    return password.length >= 8;
  };

  const handleForgotPassword = async () => {
    // Input validation
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      
      const response = await axios.post(`${API_URL}/auth/forgot-password`, {
        email,
        role
      });
      
      if (response.data.success) {
        setSuccess("Password reset email sent. Please check your inbox.");
        
        if (Platform.OS !== 'web') {
          Alert.alert(
            "Email Sent",
            "Password reset instructions have been sent to your email address.",
            [{ text: "OK" }]
          );
        } else {
          toast.success("Password reset email sent!", {
            position: "top-center",
          });
        }
      } else {
        setError(response.data.message || "Failed to send reset email");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      const errorMsg = 
        error.response?.data?.message || 
        "Unable to process your request. Please try again.";
      setError(errorMsg);
      
      if (Platform.OS !== 'web') {
        Alert.alert("Error", errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    // Input validation
    if (!validatePassword(newPassword)) {
      setError("Password must be at least 8 characters long");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        token: resetToken,
        password: newPassword,
        role
      });
      
      if (response.data.success) {
        setSuccess("Password has been reset successfully");
        
        // Clear form fields
        setNewPassword("");
        setConfirmPassword("");
        setResetToken("");
        
        if (Platform.OS !== 'web') {
          Alert.alert(
            "Success", 
            "Your password has been reset successfully. You can now login with your new password.",
            [{ 
              text: "Go to Login", 
              onPress: () => navigation.navigate("Login") 
            }]
          );
        } else {
          toast.success("Password reset successful!", {
            position: "top-center",
          });
          
          // Navigate to login after a short delay
          setTimeout(() => navigation.navigate("Login"), 1500);
        }
      } else {
        setError(response.data.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      const errorMsg = 
        error.response?.data?.message || 
        "Unable to reset password. The token may be invalid or expired.";
      setError(errorMsg);
      
      if (Platform.OS !== 'web') {
        Alert.alert("Error", errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    // Input validation
    if (!currentPassword) {
      setError("Current password is required");
      return;
    }
    
    if (!validatePassword(newPassword)) {
      setError("New password must be at least 8 characters long");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      
      // Get the user data and token
      const userToken = await AsyncStorage.getItem('userToken');
      const userData = JSON.parse(await AsyncStorage.getItem('userData'));
      
      if (!userToken || !userData) {
        setError("You must be logged in to change your password");
        navigation.navigate("Login");
        return;
      }
      
      const response = await axios.post(
        `${API_URL}/auth/change-password`,
        {
          currentPassword,
          newPassword,
          userId: userData.id,
          role: userData.role || role
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`
          }
        }
      );
      
      if (response.data.success) {
        setSuccess("Password updated successfully");
        
        // Clear form fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        
        if (Platform.OS !== 'web') {
          Alert.alert("Success", "Your password has been updated successfully.");
        } else {
          toast.success("Password changed successfully!", {
            position: "top-center",
          });
        }
      } else {
        setError(response.data.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Change password error:", error);
      const errorMsg = 
        error.response?.data?.message || 
        "Unable to change password. Please verify your current password.";
      setError(errorMsg);
      
      if (Platform.OS !== 'web') {
        Alert.alert("Error", errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderTabs = () => {
    return (
      <View className="flex-row mb-6 bg-white/10 backdrop-blur-md rounded-xl overflow-hidden">
        <TouchableOpacity 
          className={`flex-1 py-3 ${activeTab === 'forgot' ? 'bg-white/20' : ''}`}
          onPress={() => {
            setActiveTab('forgot');
            setError("");
            setSuccess("");
          }}
        >
          <Text className="text-white text-center">Forgot</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 py-3 ${activeTab === 'reset' ? 'bg-white/20' : ''}`}
          onPress={() => {
            setActiveTab('reset');
            setError("");
            setSuccess("");
          }}
        >
          <Text className="text-white text-center">Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 py-3 ${activeTab === 'change' ? 'bg-white/20' : ''}`}
          onPress={() => {
            setActiveTab('change');
            setError("");
            setSuccess("");
          }}
        >
          <Text className="text-white text-center">Change</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderForgotPasswordForm = () => {
    return (
      <View>
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
                setSuccess("");
              }}
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View className="bg-white/10 backdrop-blur-md rounded-xl p-1 mb-6">
          <View className="flex-row items-center px-3">
            <Ionicons name="person-outline" size={20} color="white" />
            <View className="flex-1 px-3 py-2">
              <Text className="text-white/80 text-sm mb-1">Account Type</Text>
              <View className="flex-row">
                {['user', 'therapist', 'admin'].map((item) => (
                  <TouchableOpacity
                    key={item}
                    className={`mr-4 px-3 py-1 rounded-full ${role === item ? 'bg-white/30' : 'bg-white/10'}`}
                    onPress={() => setRole(item)}
                  >
                    <Text className="text-white capitalize">{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          className="bg-white/20 backdrop-blur-md py-4 rounded-xl mb-4 overflow-hidden"
          onPress={handleForgotPassword}
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
              Send Reset Link
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderResetPasswordForm = () => {
    return (
      <View>
        {!route.params?.token && (
          <View className="bg-white/10 backdrop-blur-md rounded-xl p-1 mb-4">
            <View className="flex-row items-center px-3">
              <Ionicons name="key-outline" size={20} color="white" />
              <TextInput
                className="flex-1 px-3 py-4 text-white"
                placeholder="Reset Token"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                onChangeText={(text) => {
                  setResetToken(text);
                  setError("");
                  setSuccess("");
                }}
                value={resetToken}
              />
            </View>
          </View>
        )}

        <View className="bg-white/10 backdrop-blur-md rounded-xl p-1 mb-4">
          <View className="flex-row items-center px-3">
            <Ionicons name="lock-closed-outline" size={20} color="white" />
            <TextInput
              className="flex-1 px-3 py-4 text-white"
              placeholder="New Password"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              secureTextEntry
              onChangeText={(text) => {
                setNewPassword(text);
                setError("");
                setSuccess("");
              }}
              value={newPassword}
            />
          </View>
        </View>

        <View className="bg-white/10 backdrop-blur-md rounded-xl p-1 mb-4">
          <View className="flex-row items-center px-3">
            <Ionicons name="lock-closed-outline" size={20} color="white" />
            <TextInput
              className="flex-1 px-3 py-4 text-white"
              placeholder="Confirm New Password"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              secureTextEntry
              onChangeText={(text) => {
                setConfirmPassword(text);
                setError("");
                setSuccess("");
              }}
              value={confirmPassword}
            />
          </View>
        </View>

        <View className="bg-white/10 backdrop-blur-md rounded-xl p-1 mb-6">
          <View className="flex-row items-center px-3">
            <Ionicons name="person-outline" size={20} color="white" />
            <View className="flex-1 px-3 py-2">
              <Text className="text-white/80 text-sm mb-1">Account Type</Text>
              <View className="flex-row">
                {['user', 'therapist', 'admin'].map((item) => (
                  <TouchableOpacity
                    key={item}
                    className={`mr-4 px-3 py-1 rounded-full ${role === item ? 'bg-white/30' : 'bg-white/10'}`}
                    onPress={() => setRole(item)}
                  >
                    <Text className="text-white capitalize">{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          className="bg-white/20 backdrop-blur-md py-4 rounded-xl mb-4 overflow-hidden"
          onPress={handleResetPassword}
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
              Reset Password
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderChangePasswordForm = () => {
    return (
      <View>
        <View className="bg-white/10 backdrop-blur-md rounded-xl p-1 mb-4">
          <View className="flex-row items-center px-3">
            <Ionicons name="lock-closed-outline" size={20} color="white" />
            <TextInput
              className="flex-1 px-3 py-4 text-white"
              placeholder="Current Password"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              secureTextEntry
              onChangeText={(text) => {
                setCurrentPassword(text);
                setError("");
                setSuccess("");
              }}
              value={currentPassword}
            />
          </View>
        </View>

        <View className="bg-white/10 backdrop-blur-md rounded-xl p-1 mb-4">
          <View className="flex-row items-center px-3">
            <Ionicons name="lock-closed-outline" size={20} color="white" />
            <TextInput
              className="flex-1 px-3 py-4 text-white"
              placeholder="New Password"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              secureTextEntry
              onChangeText={(text) => {
                setNewPassword(text);
                setError("");
                setSuccess("");
              }}
              value={newPassword}
            />
          </View>
        </View>

        <View className="bg-white/10 backdrop-blur-md rounded-xl p-1 mb-6">
          <View className="flex-row items-center px-3">
            <Ionicons name="lock-closed-outline" size={20} color="white" />
            <TextInput
              className="flex-1 px-3 py-4 text-white"
              placeholder="Confirm New Password"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              secureTextEntry
              onChangeText={(text) => {
                setConfirmPassword(text);
                setError("");
                setSuccess("");
              }}
              value={confirmPassword}
            />
          </View>
        </View>

        <TouchableOpacity
          className="bg-white/20 backdrop-blur-md py-4 rounded-xl mb-4 overflow-hidden"
          onPress={handleChangePassword}
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
              Update Password
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      {Platform.OS === 'web' && <ToastContainer />}
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
                    <Ionicons name="key" size={40} color="white" />
                  </View>
                  <Text className="text-white text-3xl font-bold">Account Recovery</Text>
                  <Text className="text-white/80 mt-2">
                    {activeTab === 'forgot' && "Request a password reset link"}
                    {activeTab === 'reset' && "Create a new password"}
                    {activeTab === 'change' && "Update your current password"}
                  </Text>
                </View>

                {renderTabs()}

                {error ? (
                  <View className="bg-red-500/20 backdrop-blur-md p-3 rounded-lg mb-4">
                    <Text className="text-white text-center">{error}</Text>
                  </View>
                ) : null}

                {success ? (
                  <View className="bg-green-500/20 backdrop-blur-md p-3 rounded-lg mb-4">
                    <Text className="text-white text-center">{success}</Text>
                  </View>
                ) : null}

                {activeTab === 'forgot' && renderForgotPasswordForm()}
                {activeTab === 'reset' && renderResetPasswordForm()}
                {activeTab === 'change' && renderChangePasswordForm()}

                <View className="flex-row justify-center items-center mt-6">
                  <Text className="text-white/80">
                    Remember your password?{" "}
                  </Text>
                  <TouchableOpacity onPress={() => navigation.navigate("Login")}>
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

export default ForgotPasswordScreen;