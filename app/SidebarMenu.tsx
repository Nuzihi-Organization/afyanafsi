import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { Feather, Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

// Define menu items
const menuItems = [
  { 
    title: 'Home', 
    icon: (active: boolean) => <Feather name="home" size={24} color={active ? "#38b2ac" : "#718096"} />,
    route: 'HomeScreen',
    notification: 0
  },
  { 
    title: 'Chat', 
    icon: (active: boolean) => <Ionicons name="chatbubble-ellipses-outline" size={24} color={active ? "#38b2ac" : "#718096"} />,
    route: 'ChatScreen',
    notification: 2
  },
  { 
    title: 'AI Chat', 
    icon: (active: boolean) => <MaterialCommunityIcons name="robot-outline" size={24} color={active ? "#38b2ac" : "#718096"} />,
    route: 'AIchat',
    notification: 0
  },
  { 
    title: 'My Bookings', 
    icon: (active: boolean) => <Feather name="calendar" size={24} color={active ? "#38b2ac" : "#718096"} />,
    route: 'MyBookings',
    notification: 1
  },
  { 
    title: 'Therapists', 
    icon: (active: boolean) => <FontAwesome5 name="user-md" size={24} color={active ? "#38b2ac" : "#718096"} />,
    route: 'Therapists',
    notification: 0
  },
  { 
    title: 'Therapy Sessions', 
    icon: (active: boolean) => <MaterialCommunityIcons name="head-heart-outline" size={24} color={active ? "#38b2ac" : "#718096"} />,
    route: 'Therapy',
    notification: 0
  },
  { 
    title: 'Journal', 
    icon: (active: boolean) => <FontAwesome5 name="journal-whills" size={24} color={active ? "#38b2ac" : "#718096"} />,
    route: 'Journal',
    notification: 0
  },
  { 
    title: 'Preferences', 
    icon: (active: boolean) => <Ionicons name="settings-outline" size={24} color={active ? "#38b2ac" : "#718096"} />,
    route: 'PreferencesScreen',
    notification: 0
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SidebarMenu: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigation = useNavigation();
  const progress = useSharedValue(0);
  const [activeRoute, setActiveRoute] = React.useState('HomeScreen');

  useEffect(() => {
    progress.value = withTiming(isOpen ? 1 : 0, { duration: 300 });
  }, [isOpen]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      progress.value,
      [0, 1],
      [-300, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateX }],
      opacity: progress.value,
    };
  });

  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(progress.value, [0, 1], [0, 0.7]),
      display: progress.value === 0 ? 'none' : 'flex',
    };
  });

  const handleNavigation = (route: string) => {
    setActiveRoute(route);
    // @ts-ignore - Navigation type issue
    navigation.navigate(route);
    onClose();
  };

  if (Platform.OS === 'web') {
    return (
      <>
        <Animated.View 
          style={[{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'black',
            zIndex: 10
          }, backdropStyle]} 
          className="absolute inset-0 bg-black"
          onTouchStart={onClose}
        />
        <Animated.View 
          style={[animatedStyle]} 
          className="absolute left-0 top-0 bottom-0 w-64 bg-gray-100 dark:bg-gray-900 shadow-xl z-20"
        >
          <SidebarContent 
            activeRoute={activeRoute} 
            handleNavigation={handleNavigation}
            onClose={onClose}
          />
        </Animated.View>
      </>
    );
  }

  return (
    <>
      <Animated.View 
        style={[{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'black',
          zIndex: 10
        }, backdropStyle]} 
        className="absolute inset-0 bg-black"
        onTouchStart={onClose}
      />
      <Animated.View 
        style={[animatedStyle]} 
        className="absolute left-0 top-0 bottom-0 w-64 bg-gray-50 dark:bg-gray-900 shadow-xl z-20"
      >
        <SidebarContent 
          activeRoute={activeRoute} 
          handleNavigation={handleNavigation}
          onClose={onClose}
        />
      </Animated.View>
    </>
  );
};

interface SidebarContentProps {
  activeRoute: string;
  handleNavigation: (route: string) => void;
  onClose: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ 
  activeRoute, 
  handleNavigation,
  onClose 
}) => {
  return (
    <View className="flex-1 flex flex-col">
      {/* Header */}
      <View className="pt-12 pb-6 px-4 flex-row justify-between items-center bg-teal-600">
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-white justify-center items-center">
            <MaterialCommunityIcons name="brain" size={28} color="#38b2ac" />
          </View>
          <View className="ml-3">
            <Text className="text-white text-lg font-bold">MindWell</Text>
            <Text className="text-teal-100 text-xs">Therapy & Support</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onClose} className="p-2">
          <Feather name="x" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* User Profile */}
      <View className="py-4 px-4 border-b border-gray-200 dark:border-gray-800">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-teal-100 justify-center items-center">
            <FontAwesome5 name="user-alt" size={16} color="#38b2ac" />
          </View>
          <View className="ml-3">
            <Text className="text-gray-800 dark:text-gray-100 font-medium">User Profile</Text>
            <TouchableOpacity onPress={() => handleNavigation('Profile')}>
              <Text className="text-teal-600 text-xs">View Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Menu Items */}
      <ScrollView className="flex-1">
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleNavigation(item.route)}
            className={`flex-row items-center py-4 px-4 ${
              activeRoute === item.route ? 'bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-500' : ''
            }`}
          >
            <View className="w-8">{item.icon(activeRoute === item.route)}</View>
            <Text className={`ml-3 ${
              activeRoute === item.route ? 'text-teal-600 dark:text-teal-400 font-medium' : 'text-gray-700 dark:text-gray-300'
            }`}>
              {item.title}
            </Text>
            {item.notification > 0 && (
              <View className="ml-auto bg-red-500 rounded-full w-6 h-6 justify-center items-center">
                <Text className="text-white text-xs font-bold">{item.notification}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer */}
      <View className="pt-2 pb-8 px-4 border-t border-gray-200 dark:border-gray-800">
        <TouchableOpacity 
          onPress={() => handleNavigation('Login')}
          className="flex-row items-center py-3"
        >
          <Feather name="log-out" size={20} color="#f56565" />
          <Text className="ml-3 text-red-500">Logout</Text>
        </TouchableOpacity>
        
        <View className="mt-4 flex-row justify-between">
          <TouchableOpacity className="p-2">
            <Feather name="help-circle" size={20} color="#718096" />
          </TouchableOpacity>
          <TouchableOpacity className="p-2">
            <Feather name="settings" size={20} color="#718096" />
          </TouchableOpacity>
          <TouchableOpacity className="p-2">
            <Ionicons name="moon-outline" size={20} color="#718096" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default SidebarMenu;