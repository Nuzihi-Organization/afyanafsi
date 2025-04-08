import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { RadioButton } from 'react-native-paper';

export default function TherapyBookingScreen() {
  const [selectedGender, setSelectedGender] = useState('female');
  const [selectedTown, setSelectedTown] = useState('nairobi');
  const [selectedConsultation, setSelectedConsultation] = useState('individual');
  const [selectedTime, setSelectedTime] = useState('morning');
  const [sessionType, setSessionType] = useState('physical');

  const towns = [
    { label: 'Nairobi', value: 'nairobi' },
    { label: 'Mombasa', value: 'mombasa' },
    { label: 'Kisumu', value: 'kisumu' },
    { label: 'Nakuru', value: 'nakuru' },
  ];

  const consultationTypes = [
    { label: 'Individual', value: 'individual' },
    { label: 'Couple', value: 'couple' },
    { label: 'Group', value: 'group' },
  ];

  const times = [
    { label: 'Morning (8 AM - 12 PM)', value: 'morning' },
    { label: 'Afternoon (1 PM - 5 PM)', value: 'afternoon' },
    { label: 'Evening (6 PM - 9 PM)', value: 'evening' },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-100 p-4">
      <Text className="text-2xl font-bold mb-4">Book A Therapy Session</Text>
      <Text className="text-lg mb-6">Hi Helena, select your therapist preferences:</Text>

      {/* Session Type */}
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">Session Type</Text>
        <View className="flex-row items-center">
          <RadioButton
            value="physical"
            status={sessionType === 'physical' ? 'checked' : 'unchecked'}
            onPress={() => setSessionType('physical')}
            color="#10b981"
          />
          <Text className="ml-2">Physical Session</Text>
        </View>
        <View className="flex-row items-center">
          <RadioButton
            value="virtual"
            status={sessionType === 'virtual' ? 'checked' : 'unchecked'}
            onPress={() => setSessionType('virtual')}
            color="#10b981"
          />
          <Text className="ml-2">Virtual Session</Text>
        </View>
      </View>

      {/* Gender */}
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">Gender</Text>
        <View className="bg-white rounded-lg p-2">
          <Picker
            selectedValue={selectedGender}
            onValueChange={(itemValue) => setSelectedGender(itemValue)}
          >
            <Picker.Item label="Female" value="female" />
            <Picker.Item label="Male" value="male" />
            <Picker.Item label="Non-binary" value="non-binary" />
          </Picker>
        </View>
      </View>

      {/* Nearest Town */}
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">Nearest Town</Text>
        <View className="bg-white rounded-lg p-2">
          <Picker
            selectedValue={selectedTown}
            onValueChange={(itemValue) => setSelectedTown(itemValue)}
          >
            {towns.map((town) => (
              <Picker.Item key={town.value} label={town.label} value={town.value} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Nature of Consultation */}
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">Nature of Consultation</Text>
        <View className="bg-white rounded-lg p-2">
          <Picker
            selectedValue={selectedConsultation}
            onValueChange={(itemValue) => setSelectedConsultation(itemValue)}
          >
            {consultationTypes.map((type) => (
              <Picker.Item key={type.value} label={type.label} value={type.value} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Time */}
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">Preferred Time</Text>
        <View className="bg-white rounded-lg p-2">
          <Picker
            selectedValue={selectedTime}
            onValueChange={(itemValue) => setSelectedTime(itemValue)}
          >
            {times.map((time) => (
              <Picker.Item key={time.value} label={time.label} value={time.value} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        className="bg-emerald-500 py-3 rounded-lg items-center mt-6"
        onPress={() => console.log('Booking submitted')}
      >
        <Text className="text-white text-lg font-semibold">Book Session</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}