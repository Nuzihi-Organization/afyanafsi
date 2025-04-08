import React, { useEffect } from "react";
import "../index.css";

import { View, Text, ImageBackground, TouchableOpacity, Animated, Easing } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";

const SplashScreen = () => {
  const navigation = useNavigation();
  const floatAnim = new Animated.Value(0);

  useEffect(() => {
    // Floating animation for the app name
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  return (
    <ImageBackground
      source={{ uri: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=1951&q=80" }}
      className="flex-1 justify-center items-center"
    >
      <StatusBar style="dark" />
      <View className="flex-1 justify-center items-center">
        {/* App Name with Floating Animation */}
        <Animated.Text
          style={{ transform: [{ translateY }] }}
          className="text-6xl font-bold text-white text-center"
        >
          AfyaNafsi
        </Animated.Text>
        {/* Tagline */}
        <Text className="text-xl text-white mt-4 text-center">
          Wellness Redefined
        </Text>
        {/* Get Started Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Signup")} // Replace "Home" with your desired screen
          className="mt-32 px-8 py-3 bg-blue-600 rounded-lg"
        >
          <Text className="text-white text-lg">Get Started</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default function App() {
  return (
    <View className="flex-1">
      <SplashScreen />
    </View>
  );
}
