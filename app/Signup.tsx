import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Animated, 
  Easing, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator 
} from 'react-native';
import { useWindowDimensions } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Configure API base URL
const API_URL = "http://localhost:5000/api"; // Change to your actual API URL

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0)); // Animation state
  const { width, height } = useWindowDimensions(); // Device adaptability
  const navigation = useNavigation();

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    if (text && !isValidEmail(text)) {
      setError('Please enter a valid email address');
    } else {
      setError('');
    }
  };

  const handleSignUpWithEmail = async () => {
    // Input validation
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Call backend register endpoint
      const response = await axios.post(`${API_URL}/users`, {
        name,
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
      
      // Navigate to Main Screen or preferences setup
      navigation.navigate("MainScreen");
    } catch (error) {
      const errorMsg = 
        error.response?.data?.message || 
        "Registration failed. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpWithGoogle = () => {
    // Google Sign-up implementation would go here
    console.log('Signing up with Google - not implemented yet');
    setError('Google sign-up not implemented yet');
  };

  // Animation effect
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 2000,
    easing: Easing.bounce,
    useNativeDriver: true,
  }).start();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View
          className={`flex-1 justify-center items-center`}
          style={{
            backgroundColor: '#124f0d',
            minHeight: height,
            paddingHorizontal: width * 0.05,
          }}
        >
          <Animated.View style={{ opacity: fadeAnim }} className="w-full max-w-md">
            <Text className="text-white text-center text-lg mb-6">
              Create a personalized experience for your friends and family
            </Text>

            <View className="bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg p-6 rounded-lg shadow-lg">
              <Text className="text-black text-2xl font-bold mb-4">
                Create an account
              </Text>
              <Text className="text-black mb-4 text-sm">
                Enter your details to sign up for AfyaNafsi
              </Text>

              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-2 mb-2 text-black w-full bg-white"
                placeholder="Your name"
                placeholderTextColor="#666"
                onChangeText={text => setName(text)}
                value={name}
              />

              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-2 mb-2 text-black w-full bg-white"
                placeholder="myemail@domain.com"
                placeholderTextColor="#666"
                onChangeText={handleEmailChange}
                value={email}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-2 mb-2 text-black w-full bg-white"
                placeholder="Password (at least 6 characters)"
                placeholderTextColor="#666"
                secureTextEntry
                onChangeText={text => setPassword(text)}
                value={password}
              />

              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-2 mb-2 text-black w-full bg-white"
                placeholder="Confirm password"
                placeholderTextColor="#666"
                secureTextEntry
                onChangeText={text => setConfirmPassword(text)}
                value={confirmPassword}
              />

              {error && <Text className="text-red-500 text-xs mb-4">{error}</Text>}

              <TouchableOpacity
                className="bg-black py-3 rounded-lg mb-4"
                onPress={handleSignUpWithEmail}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-semibold">
                    Sign up with email
                  </Text>
                )}
              </TouchableOpacity>

              <Text className="text-black text-center mb-4 text-sm">or continue with</Text>

              <TouchableOpacity
                className="bg-black py-3 rounded-lg mb-4"
                onPress={handleSignUpWithGoogle}
              >
                <Text className="text-white text-center font-semibold">Google</Text>
              </TouchableOpacity>

              <Text className="text-center text-xs text-black">
                By clicking continue, you agree to our{' '}
                <Text className="text-pink-600 underline">Terms of Service</Text>{' '}
                and <Text className="text-pink-600 underline">Privacy Policy</Text>
              </Text>

              <Text className="text-center text-xs text-black mt-6">
                Already have an account?{' '}
                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                  <Text className="text-blue-600 underline">Sign in</Text>
                </TouchableOpacity>
              </Text>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Signup;