import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import Voice from '@react-native-voice/voice';
import { Ionicons } from '@expo/vector-icons';
// import { classNames } from 'nativewind';

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollViewRef = useRef();

  useEffect(() => {
    // Initialize voice recognition
    const initVoice = async () => {
      try {
        await Voice.start('en-US');
        Voice.onSpeechStart = onSpeechStart;
        Voice.onSpeechEnd = onSpeechEnd;
        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechError = onSpeechError;
      } catch (e) {
        console.error(e);
      }
    };

    // Add welcome message
    setMessages([
      { 
        id: '1', 
        text: "Hello! I'm your AI assistant. How can I help you with the app today?", 
        isUser: false 
      }
    ]);

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechStart = () => {
    console.log('Speech started');
  };

  const onSpeechEnd = () => {
    setIsRecording(false);
  };

  const onSpeechResults = (event) => {
    if (event.value && event.value[0]) {
      setInputText(event.value[0]);
      // Automatically send the voice message
      handleSendMessage(event.value[0]);
    }
  };

  const onSpeechError = (error) => {
    console.error('Speech recognition error:', error);
    setIsRecording(false);
  };

  const startRecording = async () => {
    try {
      await Voice.start('en-US');
      setIsRecording(true);
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecording = async () => {
    try {
      await Voice.stop();
      setIsRecording(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (text = inputText) => {
    if (!text.trim()) return;
    
    // Add user message to chat
    const userMessage = { id: Date.now().toString(), text, isUser: true };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);
    
    try {
      // Send message to backend
      const response = await fetch('http://localhost:6000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          conversation: updatedMessages.map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.text
          }))
        }),
      });
      
      const data = await response.json();
      
      // Add AI response to chat
      const aiMessage = { 
        id: (Date.now() + 1).toString(), 
        text: data.reply, 
        isUser: false 
      };
      
      setMessages([...updatedMessages, aiMessage]);
      
      // Speak the response
      speakMessage(data.reply);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages([
        ...updatedMessages, 
        { 
          id: (Date.now() + 1).toString(), 
          text: "Sorry, I'm having trouble connecting to the server.", 
          isUser: false 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakMessage = (text) => {
    setIsSpeaking(true);
    Speech.speak(text, {
      language: 'en',
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });
  };

  const stopSpeaking = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <ScrollView 
        ref={scrollViewRef}
        className="flex-1 mb-4" 
        onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <View 
            key={message.id} 
            className={`p-3 my-1 rounded-lg max-w-4/5 ${
              message.isUser ? 'bg-blue-500 self-end ml-auto' : 'bg-gray-300 self-start mr-auto'
            }`}
          >
            <Text className={`${message.isUser ? 'text-white' : 'text-black'}`}>
              {message.text}
            </Text>
          </View>
        ))}
        {isLoading && (
          <View className="p-3 my-1 rounded-lg bg-gray-300 self-start mr-auto">
            <ActivityIndicator size="small" color="#0000ff" />
          </View>
        )}
      </ScrollView>
      
      <View className="flex-row items-center bg-white rounded-full p-2">
        <TextInput
          className="flex-1 h-10 pl-4"
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          onSubmitEditing={() => handleSendMessage()}
        />
        
        {isSpeaking ? (
          <TouchableOpacity 
            onPress={stopSpeaking}
            className="p-2 ml-2 bg-red-500 rounded-full"
          >
            <Ionicons name="volume-mute" size={24} color="white" />
          </TouchableOpacity>
        ) : null}
        
        <TouchableOpacity 
          onPress={isRecording ? stopRecording : startRecording}
          className={`p-2 ml-2 rounded-full ${isRecording ? 'bg-red-500' : 'bg-gray-300'}`}
        >
          <Ionicons name="mic" size={24} color={isRecording ? "white" : "black"} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => handleSendMessage()}
          className="p-2 ml-2 bg-blue-500 rounded-full"
          disabled={!inputText.trim()}
        >
          <Ionicons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}