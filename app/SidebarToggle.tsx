import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  withRepeat, 
  withSequence,
  Easing
} from 'react-native-reanimated';

interface SidebarToggleProps {
  onPress: () => void;
  isOpen: boolean;
}

const SidebarToggle: React.FC<SidebarToggleProps> = ({ onPress, isOpen }) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  // Create a subtle animation when the sidebar opens or closes
  React.useEffect(() => {
    if (isOpen) {
      rotation.value = withTiming(90, { duration: 300 });
      scale.value = withSequence(
        withTiming(1.2, { duration: 150 }),
        withTiming(1, { duration: 150 })
      );
    } else {
      rotation.value = withTiming(0, { duration: 300 });
    }
  }, [isOpen]);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: scale.value }
      ]
    };
  });

  return (
    <TouchableOpacity 
      onPress={onPress}
      className="w-10 h-10 rounded-full bg-teal-500 shadow-md justify-center items-center"
    >
      <Animated.View style={animatedStyles}>
        <Feather 
          name={isOpen ? "x" : "menu"} 
          size={24} 
          color="white" 
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default SidebarToggle;