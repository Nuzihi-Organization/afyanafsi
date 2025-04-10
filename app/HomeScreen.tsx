import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import LottieView from 'lottie-react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = (props) => {
  // Safely handle navigation props - this is the key fix
  const route = props.route || {};
  const navigation = props.navigation;
  
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;
  
  // Animation references
  const lottieRef = useRef(null);

  const user = {
    streak: 7,
    meditationMinutes: 143,
    weeklyGoalProgress: 68,
    upcomingSession: {
      title: 'Anxiety Management',
      time: '4:30 PM',
      type: 'Group Session'
    },
    recommendedContent: [
      { id: 1, title: 'Managing Stress in College', category: 'Education', duration: '8 min' },
      { id: 2, title: 'Quick Breathing Technique', category: 'Meditation', duration: '3 min' }
    ]
  };

  // Get user data either from route params or AsyncStorage
  useFocusEffect(
    React.useCallback(() => {
      const getUserData = async () => {
        try {
          // First check if we have userData in route params (with safety check)
          if (route.params?.userData?.name) {
            setUserName(route.params.userData.name);
          } else {
            // If not, try to get from AsyncStorage
            const userDataString = await AsyncStorage.getItem('userData');
            if (userDataString) {
              const userData = JSON.parse(userDataString);
              setUserName(userData.name || 'User'); // Fallback to 'User' if name is missing
            } else {
              // Fallback if no userData is found anywhere
              setUserName('User');
            }
          }
          setIsLoading(false);
        } catch (error) {
          console.error("Error getting user data:", error);
          setUserName('User'); // Fallback on error
          setIsLoading(false);
        }
      };

      getUserData();
    }, [route?.params]) // Safe dependency
  );

  useEffect(() => {
    const updateGreeting = () => {
      const currentHour = new Date().getHours();
      if (currentHour >= 5 && currentHour < 12) {
        setGreeting('Good morning');
      } else if (currentHour >= 12 && currentHour < 18) {
        setGreeting('Good afternoon');
      } else {
        setGreeting('Good evening');
      }
    };

    updateGreeting();

    const interval = setInterval(() => {
      setCurrentTime(new Date());
      updateGreeting();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Run animations when component mounts
  useEffect(() => {
    if (!isLoading) {
      // Play Lottie animation
      if (lottieRef.current) {
        try {
          lottieRef.current.play();
        } catch (error) {
          console.log('Lottie animation error:', error);
        }
      }

      // Animate content in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoading, fadeAnim, scaleAnim, translateYAnim]);

  const formatDate = () => {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return currentTime.toLocaleDateString(undefined, options);
  };

  // Neomorphic Shadow Component
  const NeomorphBox = ({ children, style }) => {
    return (
      <View className="bg-white rounded-2xl shadow" style={style}>
        <LinearGradient
          colors={['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.5)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute top-0 left-0 right-0 bottom-0 rounded-2xl opacity-80"
        />
        <View className="p-4 z-10">{children}</View>
      </View>
    );
  };

  // Glass Morphism Box Component
  const GlassBox = ({ children, style }) => {
    return (
      <View className={`bg-white/20 backdrop-blur-lg rounded-2xl shadow-md ${style}`}>
        <LinearGradient
          colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute top-0 left-0 right-0 bottom-0 rounded-2xl"
        />
        <View className="p-4 z-10">{children}</View>
      </View>
    );
  };

  // Handle loading state with a placeholder instead of requiring Lottie animation
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-indigo-50">
        <Text className="text-indigo-500 font-bold text-xl">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-indigo-50">
      <StatusBar style="light" />

      <LinearGradient
        colors={['#10B981', '#059669']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="pt-12 pb-8 px-5 rounded-b-3xl shadow-md"
      >
        <Animated.View 
          className="flex-row justify-between items-center"
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: translateYAnim }]
          }}
        >
          <View>
            <Text className="text-white text-lg font-medium">{greeting},</Text>
            <Text className="text-white text-3xl font-bold">{userName}</Text>
            <Text className="text-green-100 text-sm mt-1">{formatDate()}</Text>
          </View>
          <TouchableOpacity className="bg-white/30 backdrop-blur-md p-3 rounded-full shadow-lg">
            <Ionicons name="person" size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="items-center justify-center py-4">
          <View className="w-56 h-56">
            <LottieView
              ref={lottieRef}
              source={require('../assets/animations/meditation-animation.json')} // You'll need to create or download this animation
              style={{ width: '100%', height: '100%' }}
              loop
            />
          </View>
        </View>

        <Animated.View 
          className="px-4 mb-6"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: translateYAnim }]
          }}
        >
          {/* Changed to more compact layout for streak, meditation and weekly goal boxes */}
          <View className="flex-row justify-between">
            <NeomorphBox style={{ flex: 1, marginRight: 4 }}>
              <View className="items-center">
                <MaterialCommunityIcons name="fire" size={24} color="#EC4899" />
                <Text className="text-gray-500 text-xs mt-1">Streak</Text>
                <Text className="text-base font-bold text-gray-800">{user.streak} days</Text>
              </View>
            </NeomorphBox>

            <NeomorphBox style={{ flex: 1, marginHorizontal: 2 }}>
              <View className="items-center">
                <MaterialCommunityIcons name="clock-outline" size={24} color="#8B5CF6" />
                <Text className="text-gray-500 text-xs mt-1">Meditation</Text>
                <Text className="text-base font-bold text-gray-800">{user.meditationMinutes} mins</Text>
              </View>
            </NeomorphBox>

            <NeomorphBox style={{ flex: 1, marginLeft: 4 }}>
              <View className="items-center">
                <MaterialCommunityIcons name="star-outline" size={24} color="#10B981" />
                <Text className="text-gray-500 text-xs mt-1">Weekly Goal</Text>
                <Text className="text-base font-bold text-gray-800">{user.weeklyGoalProgress}%</Text>
              </View>
            </NeomorphBox>
          </View>
        </Animated.View>

        <Animated.View 
          className="px-4 mb-6"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: translateYAnim }]
          }}
        >
          <Text className="text-lg font-bold text-gray-800 mb-3">Today's Focus</Text>

          <GlassBox style="mb-4">
            <View className="flex-row items-center">
              <View className="bg-purple-100 p-3 rounded-xl mr-3">
                <MaterialCommunityIcons name="account-group" size={24} color="#8B5CF6" />
              </View>
              <View className="flex-1">
                <Text className="text-black font-bold">{user.upcomingSession.title}</Text>
                <Text className="text-black/80 text-sm">
                  {user.upcomingSession.type} · {user.upcomingSession.time}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </View>
          </GlassBox>

          <View className="flex-row justify-between">
            <TouchableOpacity className="flex-1 mr-2" activeOpacity={0.8}>
              <NeomorphBox>
                <View className="items-center">
                  <View className="bg-blue-100 p-3 rounded-xl mb-2">
                    <MaterialCommunityIcons name="brain" size={24} color="#3B82F6" />
                  </View>
                  <Text className="text-gray-800 font-medium text-center">Start Therapy</Text>
                </View>
              </NeomorphBox>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1 ml-2" activeOpacity={0.8}>
              <NeomorphBox>
                <View className="items-center">
                  <View className="bg-green-100 p-3 rounded-xl mb-2">
                    <MaterialCommunityIcons name="meditation" size={24} color="#10B981" />
                  </View>
                  <Text className="text-gray-800 font-medium text-center">Meditate</Text>
                </View>
              </NeomorphBox>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View 
          className="px-4 mb-6"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: translateYAnim }]
          }}
        >
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold text-gray-800">Live Discussions</Text>
            <TouchableOpacity>
              <Text className="text-green-600 font-medium">See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity className="mr-3 w-64" activeOpacity={0.9}>
              <GlassBox>
                <View className="flex-row items-center mb-2">
                  <View className="bg-red-100 p-2 rounded-full">
                    <MaterialCommunityIcons name="microphone" size={16} color="#EF4444" />
                  </View>
                  <Text className="ml-2 text-red-500 font-medium">LIVE NOW</Text>
                </View>
                {/* Fixed text color from white to dark gray for better visibility */}
                <Text className="text-gray-800 font-bold mb-1">Navigating Social Anxiety</Text>
                <Text className="text-gray-600 text-sm">56 listeners · Dr. Sanchez hosting</Text>
              </GlassBox>
            </TouchableOpacity>

            <TouchableOpacity className="mr-3 w-64" activeOpacity={0.9}>
              <GlassBox>
                <View className="flex-row items-center mb-2">
                  <View className="bg-gray-100 p-2 rounded-full">
                    <MaterialCommunityIcons name="clock" size={16} color="#4B5563" />
                  </View>
                  <Text className="ml-2 text-gray-600 font-medium">IN 30 MIN</Text>
                </View>
                {/* Fixed text color from white to dark gray for better visibility */}
                <Text className="text-gray-800 font-bold mb-1">Mindfulness Practice</Text>
                <Text className="text-gray-600 text-sm">23 registered · Community session</Text>
              </GlassBox>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>

        <Animated.View 
          className="px-4 pb-8"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: translateYAnim }]
          }}
        >
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold text-gray-800">For You</Text>
            <TouchableOpacity>
              <Text className="text-green-600 font-medium">Browse Library</Text>
            </TouchableOpacity>
          </View>

          {user.recommendedContent.map(item => (
            <TouchableOpacity key={item.id} className="mb-3" activeOpacity={0.8}>
              <NeomorphBox>
                <View className="flex-row items-center">
                  <View className="bg-indigo-100 p-3 rounded-xl mr-3">
                    <MaterialCommunityIcons 
                      name={item.category === 'Education' ? 'book-open-variant' : 'meditation'} 
                      size={24} 
                      color="#6366F1" 
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-800 font-bold">{item.title}</Text>
                    <Text className="text-gray-500 text-sm">
                      {item.category} · {item.duration} read
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#6366F1" />
                </View>
              </NeomorphBox>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </ScrollView>

      <View className="bg-white border-t border-gray-200 pt-2 pb-6">
        <LinearGradient
          colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute top-0 left-0 right-0 bottom-0"
        />
        <View className="flex-row">
          <TouchableOpacity className="flex-1 items-center">
            <Ionicons name="home" size={24} color="#10B981" />
            <Text className="text-xs text-green-600 font-medium mt-1">Home</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 items-center">
            <Ionicons name="calendar-outline" size={24} color="#9CA3AF" />
            <Text className="text-xs text-gray-400 font-medium mt-1">Sessions</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 items-center">
            <Ionicons name="people-outline" size={24} color="#9CA3AF" />
            <Text className="text-xs text-gray-400 font-medium mt-1">Groups</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 items-center">
            <Ionicons name="book-outline" size={24} color="#9CA3AF" />
            <Text className="text-xs text-gray-400 font-medium mt-1">Learn</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 items-center">
            <Ionicons name="settings-outline" size={24} color="#9CA3AF" />
            <Text className="text-xs text-gray-400 font-medium mt-1">Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default HomeScreen;