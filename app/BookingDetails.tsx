import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  ActivityIndicator,
  Alert,
  TextInput
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Picker } from '@react-native-picker/picker';
import { CheckBox } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

export default function BookingDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { therapist } = route.params;
  
  const [selectedDate, setSelectedDate] = useState('');
  const [availability, setAvailability] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [mode, setMode] = useState('video');
  const [therapyType, setTherapyType] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingAvailability, setFetchingAvailability] = useState(false);

  // Format today's date for calendar
  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0];
  
  // Prepare an object for calendar's markedDates
  const markedDates = {};
  if (selectedDate) {
    markedDates[selectedDate] = { selected: true, selectedColor: '#10b981' };
  }

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async () => {
    try {
      setFetchingAvailability(true);
      const response = await axios.get(`${API_URL}/api/therapists/${therapist._id}/availability`);
      
      // Get day of week for the selected date
      const dateObj = new Date(selectedDate);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayOfWeek = days[dateObj.getDay()];
      
      // Find availability for this day
      const dayAvailability = response.data.find(day => day.day === dayOfWeek);
      
      if (dayAvailability) {
        // Filter out booked slots
        const availableSlots = dayAvailability.slots.filter(slot => !slot.isBooked);
        setAvailability(availableSlots);
      } else {
        setAvailability([]);
      }
      
      setFetchingAvailability(false);
    } catch (error) {
      console.error('Error fetching availability:', error);
      setFetchingAvailability(false);
      Alert.alert('Error', 'Failed to fetch availability');
    }
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot || !mode || !therapyType) {
      Alert.alert('Incomplete Information', 'Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Authentication Required', 'Please login to book a session');
        navigation.navigate('Login', { redirectTo: 'Booking' });
        return;
      }
      
      const bookingData = {
        therapistId: therapist._id,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        mode,
        therapyType,
        notes,
      };
      
      const response = await axios.post(
        `${API_URL}/api/bookings`,
        bookingData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setLoading(false);
      
      if (response.status === 201) {
        Alert.alert(
          'Booking Successful',
          'Your session has been booked successfully. Check your email for confirmation.',
          [
            { 
              text: 'View My Bookings', 
              onPress: () => navigation.navigate('MyBookings') 
            },
            {
              text: 'OK',
              onPress: () => navigation.navigate('Home')
            }
          ]
        );
      }
    } catch (error) {
      setLoading(false);
      console.error('Error booking session:', error);
      Alert.alert('Booking Failed', 'There was an error booking your session. Please try again.');
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-6">Book a Session</Text>
        
        {/* Therapist Info */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <View className="flex-row items-center">
            <Image
              source={{ uri: therapist.imageUrl }}
              style={{ width: 70, height: 70, borderRadius: 35 }}
              resizeMode="cover"
            />
            <View className="ml-4">
              <Text className="text-lg font-bold">{therapist.name}</Text>
              <Text className="text-gray-600">{therapist.title}</Text>
              <Text className="text-emerald-600 font-semibold mt-1">
                ${therapist.sessionCost} per session
              </Text>
            </View>
          </View>
        </View>
        
        {/* Select Date */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-lg font-semibold mb-4">Select Date</Text>
          <Calendar
            minDate={formattedToday}
            maxDate={new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              todayTextColor: '#10b981',
              selectedDayBackgroundColor: '#10b981',
              arrowColor: '#10b981',
            }}
          />
        </View>
        
        {/* Select Time Slot */}
        {selectedDate && (
          <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
            <Text className="text-lg font-semibold mb-4">Select Time Slot</Text>
            
            {fetchingAvailability ? (
              <ActivityIndicator size="small" color="#10b981" />
            ) : availability.length > 0 ? (
              <View className="flex-row flex-wrap">
                {availability.map((slot, index) => (
                  <TouchableOpacity
                    key={index}
                    className={`py-2 px-4 m-1 rounded-lg ${
                      selectedSlot && selectedSlot.startTime === slot.startTime
                        ? 'bg-emerald-500'
                        : 'bg-gray-200'
                    }`}
                    onPress={() => setSelectedSlot(slot)}
                  >
                    <Text
                      className={`${
                        selectedSlot && selectedSlot.startTime === slot.startTime
                          ? 'text-white'
                          : 'text-gray-800'
                      }`}
                    >
                      {slot.startTime} - {slot.endTime}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text className="text-gray-500 italic">No available slots for this date</Text>
            )}
          </View>
        )}
        
        {/* Session Type */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-lg font-semibold mb-4">Session Type</Text>
          
          <Text className="font-medium mb-2">Mode:</Text>
          <View className="flex-row flex-wrap mb-4">
            {['video', 'in-person', 'chat'].map((sessionMode) => (
              <TouchableOpacity
                key={sessionMode}
                className={`py-2 px-4 m-1 rounded-lg ${
                  mode === sessionMode ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
                onPress={() => setMode(sessionMode)}
              >
                <Text
                  className={`${
                    mode === sessionMode ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  {sessionMode.charAt(0).toUpperCase() + sessionMode.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text className="font-medium mb-2">Therapy Type:</Text>
          <View className="bg-gray-100 rounded-lg p-1">
            <Picker
              selectedValue={therapyType}
              onValueChange={(itemValue) => setTherapyType(itemValue)}
              style={{ height: 50 }}
            >
              <Picker.Item label="Select therapy type" value="" enabled={false} />
              <Picker.Item label="Cognitive Behavioral Therapy (CBT)" value="CBT" />
              <Picker.Item label="Mindfulness-Based Therapy" value="Mindfulness" />
              <Picker.Item label="Psychodynamic Therapy" value="Psychodynamic" />
              <Picker.Item label="Humanistic Therapy" value="Humanistic" />
              <Picker.Item label="Integrative Therapy" value="Integrative" />
            </Picker>
          </View>
        </View>
        
        {/* Notes */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-lg font-semibold mb-4">Additional Notes</Text>
          <TextInput
            className="bg-gray-100 p-4 rounded-lg"
            placeholder="Any specific issues you'd like to address in this session?"
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
            textAlignVertical="top"
          />
        </View>
        
        {/* Book Button */}
        <TouchableOpacity
          className="bg-emerald-500 py-4 rounded-full mb-8"
          onPress={handleBooking}
          disabled={loading || !selectedDate || !selectedSlot || !mode || !therapyType}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text className="text-white font-bold text-center text-lg">
              Confirm Booking
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
