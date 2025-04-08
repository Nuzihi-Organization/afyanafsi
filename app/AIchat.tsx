import { useState, useRef } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import Animated, { FadeInRight } from 'react-native-reanimated';

export default function AIChatScreen() {
  const [messages, setMessages] = useState([]);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const handleSend = async (newMessages = []) => {
    setMessages(previous => GiftedChat.append(previous, newMessages));
    
    // Simulate AI response
    const aiResponse = {
      _id: Math.random().toString(),
      text: "I'm here to help. Can you tell me more about how you're feeling?",
      createdAt: new Date(),
      user: { _id: 2, name: 'AI Assistant' }
    };

    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setMessages(previous => GiftedChat.append(previous, [aiResponse]));
    });
  };

  return (
    <Animated.View entering={FadeInRight.duration(500)} className="flex-1 bg-slate-900">
      <GiftedChat
        messages={messages}
        onSend={messages => handleSend(messages)}
        user={{ _id: 1 }}
        renderBubble={props => (
          <Animated.View style={{ 
            transform: [{ scale: animatedValue }],
            backgroundColor: props.position === 'left' ? '#374151' : '#10b981'
          }} className="p-3 rounded-2xl mx-2 my-1">
            <Text className="text-white">{props.currentMessage.text}</Text>
          </Animated.View>
        )}
      />
    </Animated.View>
  );
}