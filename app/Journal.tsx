import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay
} from 'react-native-reanimated';

// Mock data for journal entries
const mockEntries = [
  {
    id: 1,
    date: '2025-04-12',
    title: 'Feeling Better Today',
    content: 'I practiced the mindfulness exercises my therapist recommended. I noticed I felt calmer afterward.',
    mood: 'happy',
  },
  {
    id: 2, 
    date: '2025-04-10',
    title: 'Stress at Work',
    content: 'Had a difficult meeting today. Need to remember the breathing techniques we discussed in therapy.',
    mood: 'stressed',
  },
  {
    id: 3,
    date: '2025-04-07',
    title: 'Weekly Reflection',
    content: 'This week was challenging but I made progress with my communication skills.',
    mood: 'neutral',
  }
];

// Mood options
const moodOptions = [
  { icon: 'grin-beam', label: 'Happy', value: 'happy', color: '#48bb78' },
  { icon: 'smile', label: 'Good', value: 'good', color: '#81e6d9' },
  { icon: 'meh', label: 'Neutral', value: 'neutral', color: '#ecc94b' },
  { icon: 'frown', label: 'Sad', value: 'sad', color: '#f6ad55' },
  { icon: 'angry', label: 'Stressed', value: 'stressed', color: '#f56565' },
];

const Journal = () => {
  const [entries, setEntries] = useState(mockEntries);
  const [newEntry, setNewEntry] = useState({ title: '', content: '', mood: '' });
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const formHeight = useSharedValue(0);
  
  const formAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: formHeight.value,
      overflow: 'hidden',
    };
  });

  const toggleAddEntry = () => {
    if (isAddingEntry) {
      formHeight.value = withTiming(0, { duration: 300 });
      setTimeout(() => setIsAddingEntry(false), 300);
    } else {
      setIsAddingEntry(true);
      formHeight.value = withTiming(400, { duration: 300 });
    }
  };

  const handleAddEntry = () => {
    if (newEntry.title.trim() && newEntry.content.trim() && newEntry.mood) {
      const currentDate = new Date().toISOString().split('T')[0];
      const newEntryWithId = {
        id: entries.length + 1,
        date: currentDate,
        ...newEntry
      };
      
      setEntries([newEntryWithId, ...entries]);
      setNewEntry({ title: '', content: '', mood: '' });
      toggleAddEntry();
      Keyboard.dismiss();
    }
  };

  const getMoodIcon = (mood) => {
    const moodOption = moodOptions.find(option => option.value === mood);
    return {
      icon: moodOption?.icon || 'question-circle',
      color: moodOption?.color || '#718096'
    };
  };

  const animationDelay = useSharedValue(0);
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="flex-row justify-between items-center p-4 bg-teal-600">
        <Text className="text-white text-xl font-bold">My Journal</Text>
        <TouchableOpacity 
          onPress={toggleAddEntry}
          className="bg-white w-10 h-10 rounded-full justify-center items-center shadow-md"
        >
          <Feather name={isAddingEntry ? "x" : "plus"} size={24} color="#0d9488" />
        </TouchableOpacity>
      </View>
      
      <Animated.View style={formAnimatedStyle}>
        {isAddingEntry && (
          <View className="p-4 bg-white dark:bg-gray-800 shadow-md">
            <Text className="text-gray-700 dark:text-gray-200 text-lg font-medium mb-2">New Entry</Text>
            
            <TextInput
              placeholder="Title"
              value={newEntry.title}
              onChangeText={(text) => setNewEntry({...newEntry, title: text})}
              className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md mb-2 text-gray-800 dark:text-gray-100"
            />
            
            <TextInput
              placeholder="How are you feeling today?"
              value={newEntry.content}
              onChangeText={(text) => setNewEntry({...newEntry, content: text})}
              multiline
              numberOfLines={4}
              className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md mb-3 text-gray-800 dark:text-gray-100 h-24"
            />
            
            <Text className="text-gray-700 dark:text-gray-200 mb-2">How's your mood?</Text>
            <View className="flex-row justify-between mb-4">
              {moodOptions.map((mood) => (
                <TouchableOpacity
                  key={mood.value}
                  onPress={() => setNewEntry({...newEntry, mood: mood.value})}
                  className={`items-center p-2 rounded-md ${newEntry.mood === mood.value ? 'bg-teal-100 dark:bg-teal-900' : ''}`}
                >
                  <FontAwesome5 name={mood.icon} size={24} color={mood.color} />
                  <Text className="text-xs mt-1 text-gray-700 dark:text-gray-300">{mood.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity
              onPress={handleAddEntry}
              className="bg-teal-500 p-3 rounded-md items-center"
            >
              <Text className="text-white font-medium">Save Entry</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
      
      <ScrollView className="flex-1 px-4 pt-2">
        {entries.map((entry, index) => {
          const mood = getMoodIcon(entry.mood);
          animationDelay.value = index * 100;
          
          return (
            <Animated.View 
              key={entry.id}
              entering={withDelay(
                animationDelay.value,
                withTiming({ opacity: 1, transform: [{ translateY: 0 }] }, { duration: 300 })
              )}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-4 overflow-hidden"
            >
              <View className="border-l-4 p-4" style={{ borderColor: mood.color }}>
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-gray-800 dark:text-gray-100 font-medium text-lg">{entry.title}</Text>
                  <FontAwesome5 name={mood.icon} size={20} color={mood.color} />
                </View>
                
                <Text className="text-gray-600 dark:text-gray-300 mb-3">{entry.content}</Text>
                
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-500 dark:text-gray-400 text-xs">{entry.date}</Text>
                  
                  <View className="flex-row">
                    <TouchableOpacity className="mr-4">
                      <Feather name="edit-2" size={16} color="#718096" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Feather name="trash-2" size={16} color="#718096" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Animated.View>
          );
        })}
      </ScrollView>
      
      {entries.length === 0 && (
        <View className="flex-1 justify-center items-center">
          <MaterialCommunityIcons name="book-open-page-variant" size={64} color="#cbd5e0" />
          <Text className="text-gray-500 mt-4 text-center">No journal entries yet. Add your first entry!</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Journal;