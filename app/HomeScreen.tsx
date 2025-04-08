import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import LottieView from 'lottie-react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const HomeScreen = () => {
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  const user = {
    name: 'Alex',
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

  const formatDate = () => {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return currentTime.toLocaleDateString(undefined, options);
  };

  return (
    <View className="flex-1 bg-indigo-50">
      <StatusBar style="dark" />

      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="pt-12 pb-6 px-5 rounded-b-3xl"
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-lg font-medium">{greeting},</Text>
            <Text className="text-white text-2xl font-bold">{user.name}</Text>
            <Text className="text-indigo-100 text-sm mt-1">{formatDate()}</Text>
          </View>
          <TouchableOpacity className="bg-white/20 p-2 rounded-full">
            <Ionicons name="person" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="items-center justify-center py-4">
          <View className="w-40 h-40">
            <Text className="text-center text-indigo-500">
              [Animation placeholder - Meditation figure with flowing energy]
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between px-4 mb-4">
          <View className="bg-white rounded-2xl p-4 shadow w-30 items-center">
            <MaterialCommunityIcons name="fire" size={28} color="#EC4899" />
            <Text className="text-gray-500 text-xs mt-1">Streak</Text>
            <Text className="text-lg font-bold text-gray-800">{user.streak} days</Text>
          </View>

          <View className="bg-white rounded-2xl p-4 shadow w-30 items-center">
            <MaterialCommunityIcons name="clock-outline" size={28} color="#8B5CF6" />
            <Text className="text-gray-500 text-xs mt-1">Meditation</Text>
            <Text className="text-lg font-bold text-gray-800">{user.meditationMinutes} mins</Text>
          </View>

          <View className="bg-white rounded-2xl p-4 shadow w-30 items-center">
            <MaterialCommunityIcons name="star-outline" size={28} color="#10B981" />
            <Text className="text-gray-500 text-xs mt-1">Weekly Goal</Text>
            <Text className="text-lg font-bold text-gray-800">{user.weeklyGoalProgress}%</Text>
          </View>
        </View>

        <View className="px-4 mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">Today's Focus</Text>

          <TouchableOpacity className="bg-white rounded-2xl p-4 shadow mb-3">
            <View className="flex-row items-center">
              <View className="bg-purple-100 p-3 rounded-xl mr-3">
                <MaterialCommunityIcons name="account-group" size={24} color="#8B5CF6" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-800 font-bold">{user.upcomingSession.title}</Text>
                <Text className="text-gray-500 text-sm">
                  {user.upcomingSession.type} · {user.upcomingSession.time}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8B5CF6" />
            </View>
          </TouchableOpacity>

          <View className="flex-row justify-between">
            <TouchableOpacity className="bg-white rounded-2xl p-4 shadow flex-1 mr-2">
              <View className="items-center">
                <View className="bg-blue-100 p-3 rounded-xl mb-2">
                  <MaterialCommunityIcons name="brain" size={24} color="#3B82F6" />
                </View>
                <Text className="text-gray-800 font-medium text-center">Start Therapy</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="bg-white rounded-2xl p-4 shadow flex-1 ml-2">
              <View className="items-center">
                <View className="bg-green-100 p-3 rounded-xl mb-2">
                  <MaterialCommunityIcons name="meditation" size={24} color="#10B981" />
                </View>
                <Text className="text-gray-800 font-medium text-center">Meditate</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-4 mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold text-gray-800">Live Discussions</Text>
            <TouchableOpacity>
              <Text className="text-indigo-500 font-medium">See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity className="bg-white rounded-2xl p-4 shadow mr-3 w-64">
              <View className="flex-row items-center mb-2">
                <View className="bg-red-100 p-2 rounded-full">
                  <MaterialCommunityIcons name="microphone" size={16} color="#EF4444" />
                </View>
                <Text className="ml-2 text-red-500 font-medium">LIVE NOW</Text>
              </View>
              <Text className="text-gray-800 font-bold mb-1">Navigating Social Anxiety</Text>
              <Text className="text-gray-500 text-sm">56 listeners · Dr. Sanchez hosting</Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-white rounded-2xl p-4 shadow mr-3 w-64">
              <View className="flex-row items-center mb-2">
                <View className="bg-gray-100 p-2 rounded-full">
                  <MaterialCommunityIcons name="clock" size={16} color="#4B5563" />
                </View>
                <Text className="ml-2 text-gray-500 font-medium">IN 30 MIN</Text>
              </View>
              <Text className="text-gray-800 font-bold mb-1">Mindfulness Practice</Text>
              <Text className="text-gray-500 text-sm">23 registered · Community session</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View className="px-4 pb-8">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold text-gray-800">For You</Text>
            <TouchableOpacity>
              <Text className="text-indigo-500 font-medium">Browse Library</Text>
            </TouchableOpacity>
          </View>

          {user.recommendedContent.map(item => (
            <TouchableOpacity key={item.id} className="bg-white rounded-2xl p-4 shadow mb-3">
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
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View className="flex-row bg-white border-t border-gray-200 pt-2 pb-6">
        <TouchableOpacity className="flex-1 items-center">
          <Ionicons name="home" size={24} color="#6366F1" />
          <Text className="text-xs text-indigo-500 font-medium mt-1">Home</Text>
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
  );
};

export default HomeScreen;