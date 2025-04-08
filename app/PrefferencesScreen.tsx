import React, { useState, useEffect } from 'react';
import { 
  ScrollView, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { CheckBox } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

export default function PreferencesScreen() {
  const navigation = useNavigation();
  const [location, setLocation] = useState('');
  const [therapyModes, setTherapyModes] = useState({
    'in-person': false,
    'video': false,
    'chat': false,
  });
  const [therapyTypes, setTherapyTypes] = useState({
    'CBT': false,
    'Psychodynamic': false,
    'Mindfulness': false,
    'Humanistic': false,
    'Integrative': false,
  });
  const [languagePreference, setLanguagePreference] = useState('English');

  useEffect(() => {
    // Load user preferences if available
    const loadPreferences = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const response = await axios.get(`${API_URL}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          const { preferences } = response.data;
          
          if (preferences) {
            setLocation(preferences.location || '');
            
            if (preferences.therapyMode && preferences.therapyMode.length > 0) {
              const modes = {...therapyModes};
              preferences.therapyMode.forEach(mode => {
                modes[mode] = true;
              });
              setTherapyModes(modes);
            }
            
            if (preferences.therapyType && preferences.therapyType.length > 0) {
              const types = {...therapyTypes};
              preferences.therapyType.forEach(type => {
                types[type] = true;
              });
              setTherapyTypes(types);
            }
            
            if (preferences.languagePreference) {
              setLanguagePreference(preferences.languagePreference);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    };
    
    loadPreferences();
  }, []);

  const handleTherapyModeToggle = (mode) => {
    setTherapyModes({
      ...therapyModes,
      [mode]: !therapyModes[mode],
    });
  };

  const handleTherapyTypeToggle = (type) => {
    setTherapyTypes({
      ...therapyTypes,
      [type]: !therapyTypes[type],
    });
  };

  const savePreferences = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        // If not logged in, store preferences temporarily and redirect to login
        await AsyncStorage.setItem('tempPreferences', JSON.stringify({
          location,
          therapyMode: Object.keys(therapyModes).filter(key => therapyModes[key]),
          therapyType: Object.keys(therapyTypes).filter(key => therapyTypes[key]),
          languagePreference,
        }));
        
        navigation.navigate('Login', { redirectTo: 'Therapists' });
        return;
      }
      
      // If logged in, save to server
      await axios.put(
        `${API_URL}/api/users/preferences`,
        {
          location,
          therapyMode: Object.keys(therapyModes).filter(key => therapyModes[key]),
          therapyType: Object.keys(therapyTypes).filter(key => therapyTypes[key]),
          languagePreference,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Navigate to therapists screen with filters applied
      navigation.navigate('Therapists', {
        filters: {
          location,
          modes: Object.keys(therapyModes).filter(key => therapyModes[key]),
          types: Object.keys(therapyTypes).filter(key => therapyTypes[key]),
        },
      });
    } catch (error) {
      console.error('Failed to save preferences:', error);
      alert('Failed to save preferences. Please try again.');
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold mb-6">Your Therapy Preferences</Text>
      
      {/* Location Preference */}
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">Your Location</Text>
        <TextInput
          className="bg-white p-4 rounded-xl border border-gray-200"
          placeholder="Enter your city or region"
          value={location}
          onChangeText={setLocation}
        />
      </View>
      
      {/* Therapy Mode */}
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">Preferred Therapy Mode</Text>
        <View className="bg-white rounded-xl border border-gray-200 p-2">
          {Object.keys(therapyModes).map((mode) => (
            <CheckBox
              key={mode}
              title={mode.charAt(0).toUpperCase() + mode.slice(1)}
              checked={therapyModes[mode]}
              onPress={() => handleTherapyModeToggle(mode)}
              containerStyle={styles.checkboxContainer}
            />
          ))}
        </View>
      </View>
      
      {/* Therapy Type */}
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">Therapy Type</Text>
        <View className="bg-white rounded-xl border border-gray-200 p-2">
          {Object.keys(therapyTypes).map((type) => (
            <CheckBox
              key={type}
              title={type}
              checked={therapyTypes[type]}
              onPress={() => handleTherapyTypeToggle(type)}
              containerStyle={styles.checkboxContainer}
            />
          ))}
        </View>
      </View>
      
      {/* Language Preference */}
      <View className="mb-8">
        <Text className="text-lg font-semibold mb-2">Preferred Language</Text>
        <View className="bg-white rounded-xl border border-gray-200">
          <Picker
            selectedValue={languagePreference}
            onValueChange={(itemValue) => setLanguagePreference(itemValue)}
          >
            <Picker.Item label="English" value="English" />
            <Picker.Item label="Spanish" value="Spanish" />
            <Picker.Item label="French" value="French" />
            <Picker.Item label="Swahili" value="Swahili" />
            <Picker.Item label="Chinese" value="Chinese" />
            <Picker.Item label="Arabic" value="Arabic" />
          </Picker>
        </View>
      </View>
      
      {/* Save Button */}
      <TouchableOpacity
        className="bg-emerald-500 py-4 rounded-full mb-8"
        onPress={savePreferences}
      >
        <Text className="text-white font-bold text-center text-lg">
          Find Therapists Based on Preferences
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  checkboxContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 8,
    marginLeft: 0,
    marginRight: 0,
  },
});