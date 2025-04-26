import React, { useContext, useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing
} from 'react-native-reanimated';

// Define a context for theme mode
const ThemeContext = React.createContext({
  isDarkMode: false,
  toggleTheme: () => {}
});

export const ThemeProvider = ({ children }) => {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  useEffect(() => {
    setIsDarkMode(colorScheme === 'dark');
  }, [colorScheme]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
<View style={{ flex: 1 }} className={isDarkMode ? "bg-gray-900" : "bg-white"}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = () => useContext(ThemeContext);

const HomeScreen = ({ navigation }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const pulseValue = useSharedValue(1);

  // Animation for the breathing exercise circle
  useEffect(() => {
    pulseValue.value = withRepeat(
      withTiming(1.2, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseValue.value }],
    };
  });

  // Sample data for upcoming sessions
  const upcomingSessions = [
    {
      id: 1,
      therapist: 'Dr. Sarah Johnson',
      date: 'Apr 16, 2025',
      time: '10:00 AM',
      type: 'Video Call',
      avatar: '👩‍⚕️',
    },
    {
      id: 2,
      therapist: 'Dr. Michael Chen',
      date: 'Apr 20, 2025',
      time: '2:30 PM',
      type: 'Chat Session',
      avatar: '👨‍⚕️',
    },
  ];

  // Sample data for mood tracking
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const moodData = [
    { day: 'Mon', mood: 'happy' },
    { day: 'Tue', mood: 'neutral' },
    { day: 'Wed', mood: 'stressed' },
    { day: 'Thu', mood: 'good' },
    { day: 'Fri', mood: 'happy' },
    { day: 'Sat', mood: null },
    { day: 'Sun', mood: null },
  ];

  const getMoodColor = (mood) => {
    switch (mood) {
      case 'happy': return '#48bb78';
      case 'good': return '#81e6d9';
      case 'neutral': return '#ecc94b';
      case 'sad': return '#f6ad55';
      case 'stressed': return '#f56565';
      default: return '#cbd5e0';
    }
  };

  const getMoodIcon = (mood) => {
    switch (mood) {
      case 'happy': return 'grin-beam';
      case 'good': return 'smile';
      case 'neutral': return 'meh';
      case 'sad': return 'frown';
      case 'stressed': return 'angry';
      default: return 'circle';
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className={`flex-1 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        {/* Header with Dark Mode Toggle */}
        <View className="flex-row justify-between items-center p-4">
          <Text className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
            Welcome Back
          </Text>
          <TouchableOpacity 
            onPress={toggleTheme}
            className="w-10 h-10 rounded-full justify-center items-center border border-gray-200 dark:border-gray-700"
          >
            <Ionicons 
              name={isDarkMode ? "sunny-outline" : "moon-outline"} 
              size={22} 
              color={isDarkMode ? "#fff" : "#4a5568"} 
            />
          </TouchableOpacity>
        </View>

        {/* Mood Section */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <View className={`mx-4 p-4 rounded-xl mb-4 ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-sm`}>
            <Text className={`text-lg font-medium mb-3 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
              How are you feeling today?
            </Text>
            <View className="flex-row justify-between">
              {['happy', 'good', 'neutral', 'sad', 'stressed'].map((mood) => (
                <TouchableOpacity
                  key={mood}
                  className="items-center p-2"
                  onPress={() => navigation.navigate('Journal')}
                >
                  <View 
                    className={`w-12 h-12 rounded-full justify-center items-center mb-1`}
                    style={{ backgroundColor: getMoodColor(mood) + '20', borderWidth: 2, borderColor: getMoodColor(mood) }}
                  >
                    <FontAwesome5 name={getMoodIcon(mood)} size={24} color={getMoodColor(mood)} />
                  </View>
                  <Text className={`text-xs capitalize ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{mood}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Weekly Mood Tracker */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <View className={`mx-4 p-4 rounded-xl mb-4 ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-sm`}>
            <Text className={`text-lg font-medium mb-3 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
              Your Week
            </Text>
            <View className="flex-row justify-between">
              {moodData.map((day, index) => (
                <View key={index} className="items-center">
                  <View 
                    className="w-8 h-8 rounded-full justify-center items-center mb-1"
                    style={{ 
                      backgroundColor: day.mood ? getMoodColor(day.mood) + '20' : 'transparent',
                      borderWidth: day.mood ? 0 : 1,
                      borderColor: isDarkMode ? '#4a5568' : '#cbd5e0'
                    }}
                  >
                    {day.mood && (
                      <FontAwesome5 name={getMoodIcon(day.mood)} size={16} color={getMoodColor(day.mood)} />
                    )}
                  </View>
                  <Text className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{day.day}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Breathing Exercise */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <View className={`mx-4 p-4 rounded-xl mb-4 ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-sm`}>
            <Text className={`text-lg font-medium mb-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
              Quick Relief
            </Text>
            <TouchableOpacity
              className="items-center py-6"
              onPress={() => { /* Handle breathing exercise */ }}
            >
              <Animated.View 
                style={[animatedStyle]} 
                className="w-20 h-20 rounded-full bg-teal-100 dark:bg-teal-900 justify-center items-center mb-3"
              >
                <View className="w-16 h-16 rounded-full bg-teal-200 dark:bg-teal-800 justify-center items-center">
                  <MaterialCommunityIcons name="breath" size={32} color={isDarkMode ? "#4fd1c5" : "#0d9488"} />
                </View>
              </Animated.View>
              <Text className={`${isDarkMode ? "text-teal-400" : "text-teal-600"} font-medium`}>Breathing Exercise</Text>
              <Text className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Tap to start</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Upcoming Sessions */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <View className={`mx-4 p-4 rounded-xl mb-4 ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-sm`}>
            <View className="flex-row justify-between items-center mb-3">
              <Text className={`text-lg font-medium ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                Upcoming Sessions
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('MyBookings')}>
                <Text className="text-teal-500">See All</Text>
              </TouchableOpacity>
            </View>
            
            {upcomingSessions.map((session) => (
              <TouchableOpacity 
                key={session.id}
                onPress={() => navigation.navigate('BookingDetails', { id: session.id })}
                className={`flex-row items-center p-3 mb-2 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}
              >
                <View className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-800 justify-center items-center mr-3">
                  <Text className="text-xl">{session.avatar}</Text>
                </View>
                <View className="flex-1">
                  <Text className={`font-medium ${isDarkMode ? "text-white" : "text-gray-800"}`}>{session.therapist}</Text>
                  <Text className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {session.date} • {session.time} • {session.type}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={isDarkMode ? "#a0aec0" : "#718096"} />
              </TouchableOpacity>
            ))}
            
            {upcomingSessions.length === 0 && (
              <View className="py-4 items-center">
                <Text className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>No upcoming sessions</Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Therapists')}
                  className="mt-2 px-4 py-2 bg-teal-500 rounded-full"
                >
                  <Text className="text-white font-medium">Book a Session</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Quick Access Tools */}
        <Animated.View entering={FadeInDown.delay(500).duration(500)}>
          <View className={`mx-4 p-4 rounded-xl mb-8 ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-sm`}>
            <Text className={`text-lg font-medium mb-3 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
              Self-Care Tools
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {[
                { name: 'Journal', icon: 'journal-whills', color: '#9f7aea', route: 'Journal' },
                { name: 'Meditate', icon: 'brain', color: '#4fd1c5', route: '' },
                { name: 'Sleep', icon: 'moon', color: '#667eea', route: '' },
                { name: 'Exercise', icon: 'walking', color: '#f6ad55', route: '' },
              ].map((tool, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => tool.route ? navigation.navigate(tool.route) : null}
                  className={`w-[48%] p-4 rounded-lg mb-3 ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}
                >
                  <View 
                    className="w-12 h-12 rounded-full justify-center items-center mb-2"
                    style={{ backgroundColor: tool.color + '20' }}
                  >
                    <FontAwesome5 name={tool.icon} size={20} color={tool.color} />
                  </View>
                  <Text className={`font-medium ${isDarkMode ? "text-white" : "text-gray-800"}`}>{tool.name}</Text>
                  <Text className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {tool.name === 'Journal' ? 'Record your thoughts' : 'Coming soon'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;