import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { API_URL } from '../config';

export default function TherapistSignupPortal() {
  const navigation = useNavigation();
  
  // Form state
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  
  // Therapist data
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    email: '',
    password: '',
    phone: '',
    imageUrl: '',
    bio: '',
    specialties: [],
    sessionCost: '',
    location: '',
    languages: [],
    therapyModes: [],
    availability: [
      { day: 'Monday', slots: [] },
      { day: 'Tuesday', slots: [] },
      { day: 'Wednesday', slots: [] },
      { day: 'Thursday', slots: [] },
      { day: 'Friday', slots: [] },
      { day: 'Saturday', slots: [] },
      { day: 'Sunday', slots: [] }
    ]
  });
  
  // Temporary state for input fields that need processing
  const [specialty, setSpecialty] = useState('');
  const [language, setLanguage] = useState('');
  const [therapyMode, setTherapyMode] = useState('');
  const [timeSlot, setTimeSlot] = useState({ startTime: '09:00', endTime: '10:00' });
  const [selectedDay, setSelectedDay] = useState('Monday');
  
  // Handle text input changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle image selection
  const pickImage = async () => {
    try {
      setImageUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        // In a real app, upload to cloud storage and get URL
        // For this example, we'll simulate with a timeout
        setTimeout(() => {
          setFormData(prev => ({ 
            ...prev, 
            imageUrl: result.assets[0].uri 
          }));
          setImageUploading(false);
        }, 1000);
      } else {
        setImageUploading(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setImageUploading(false);
      Alert.alert('Error', 'Failed to select image');
    }
  };
  
  // Add specialty to list
  const addSpecialty = () => {
    if (specialty.trim()) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, specialty.trim()]
      }));
      setSpecialty('');
    }
  };
  
  // Add language to list
  const addLanguage = () => {
    if (language.trim()) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, language.trim()]
      }));
      setLanguage('');
    }
  };
  
  // Add therapy mode to list
  const addTherapyMode = () => {
    if (therapyMode.trim()) {
      setFormData(prev => ({
        ...prev,
        therapyModes: [...prev.therapyModes, therapyMode.trim()]
      }));
      setTherapyMode('');
    }
  };
  
  // Add time slot to selected day
  const addTimeSlot = () => {
    if (timeSlot.startTime && timeSlot.endTime) {
      setFormData(prev => {
        const updatedAvailability = prev.availability.map(day => {
          if (day.day === selectedDay) {
            return {
              ...day,
              slots: [...day.slots, { ...timeSlot, isBooked: false }]
            };
          }
          return day;
        });
        
        return {
          ...prev,
          availability: updatedAvailability
        };
      });
      
      // Reset time slot input
      setTimeSlot({ startTime: '09:00', endTime: '10:00' });
    }
  };
  
  // Remove item from array
  const removeItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };
  
  // Remove time slot from day
  const removeTimeSlot = (dayIndex, slotIndex) => {
    setFormData(prev => {
      const updatedAvailability = [...prev.availability];
      updatedAvailability[dayIndex].slots = updatedAvailability[dayIndex].slots.filter((_, i) => i !== slotIndex);
      return {
        ...prev,
        availability: updatedAvailability
      };
    });
  };
  
  // Navigate to next step
  const nextStep = () => {
    setStep(prev => prev + 1);
  };
  
  // Navigate to previous step
  const prevStep = () => {
    setStep(prev => prev - 1);
  };
  
  // Submit form
  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Basic validation
      if (!formData.name || !formData.email || !formData.password) {
        Alert.alert('Error', 'Please fill all required fields');
        setLoading(false);
        return;
      }
      
      // Add default values for missing fields
      const therapistData = {
        ...formData,
        rating: 0,  // New therapists start with 0 rating
        reviewCount: 0,
        reviews: [],
        imageUrl: formData.imageUrl || 'https://via.placeholder.com/150',
        sessionCost: parseFloat(formData.sessionCost) || 0
      };
      
      // Make API request
      const response = await axios.post(`${API_URL}/api/therapists/signup`, therapistData);
      
      setLoading(false);
      
      if (response.data && response.data.success) {
        Alert.alert(
          'Success', 
          'Your account has been created! Please wait for admin approval.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Failed to create account');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setLoading(false);
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
    }
  };
  
  // Render steps
  const renderStep = () => {
    switch (step) {
      case 1:
        return renderPersonalInfo();
      case 2:
        return renderProfessionalInfo();
      case 3:
        return renderAvailability();
      case 4:
        return renderReview();
      default:
        return renderPersonalInfo();
    }
  };
  
  // Step 1: Personal Information
  const renderPersonalInfo = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView className="p-4">
        <Text className="text-2xl font-bold mb-6">Personal Information</Text>
        
        {/* Profile Image */}
        <View className="items-center mb-6">
          <TouchableOpacity onPress={pickImage} disabled={imageUploading}>
            {formData.imageUrl ? (
              <Image
                source={{ uri: formData.imageUrl }}
                style={{ width: 120, height: 120, borderRadius: 60 }}
              />
            ) : (
              <View className="w-32 h-32 bg-gray-200 rounded-full items-center justify-center">
                <Icon name="camera" size={40} color="#10b981" />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            className="mt-2 py-2 px-4 bg-emerald-100 rounded-full"
            onPress={pickImage}
            disabled={imageUploading}
          >
            <Text className="text-emerald-700">
              {imageUploading ? 'Uploading...' : 'Upload Photo'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Name */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-2">Full Name *</Text>
          <TextInput
            className="bg-white p-4 rounded-xl border border-gray-200"
            placeholder="Dr. Jane Smith"
            value={formData.name}
            onChangeText={(text) => handleChange('name', text)}
          />
        </View>
        
        {/* Title/Profession */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-2">Professional Title *</Text>
          <TextInput
            className="bg-white p-4 rounded-xl border border-gray-200"
            placeholder="Licensed Therapist, PhD"
            value={formData.title}
            onChangeText={(text) => handleChange('title', text)}
          />
        </View>
        
        {/* Email */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-2">Email Address *</Text>
          <TextInput
            className="bg-white p-4 rounded-xl border border-gray-200"
            placeholder="email@example.com"
            value={formData.email}
            onChangeText={(text) => handleChange('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        {/* Password */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-2">Password *</Text>
          <TextInput
            className="bg-white p-4 rounded-xl border border-gray-200"
            placeholder="Create a secure password"
            value={formData.password}
            onChangeText={(text) => handleChange('password', text)}
            secureTextEntry
          />
        </View>
        
        {/* Phone */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-2">Phone Number</Text>
          <TextInput
            className="bg-white p-4 rounded-xl border border-gray-200"
            placeholder="+254 712 345 678"
            value={formData.phone}
            onChangeText={(text) => handleChange('phone', text)}
            keyboardType="phone-pad"
          />
        </View>
        
        {/* Location */}
        <View className="mb-6">
          <Text className="text-gray-700 mb-2">Location *</Text>
          <TextInput
            className="bg-white p-4 rounded-xl border border-gray-200"
            placeholder="Westlands, Nairobi, Kenya"
            value={formData.location}
            onChangeText={(text) => handleChange('location', text)}
          />
        </View>
        
        {/* Navigation */}
        <View className="flex-row justify-end mt-4 mb-8">
          <TouchableOpacity
            className="bg-emerald-500 py-4 px-8 rounded-full"
            onPress={nextStep}
          >
            <Text className="text-white font-bold">Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
  
  // Step 2: Professional Information
  const renderProfessionalInfo = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView className="p-4">
        <Text className="text-2xl font-bold mb-6">Professional Information</Text>
        
        {/* Bio */}
        <View className="mb-6">
          <Text className="text-gray-700 mb-2">Professional Bio *</Text>
          <TextInput
            className="bg-white p-4 rounded-xl border border-gray-200"
            placeholder="Share your background, approach, and expertise..."
            value={formData.bio}
            onChangeText={(text) => handleChange('bio', text)}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>
        
        {/* Session Cost */}
        <View className="mb-6">
          <Text className="text-gray-700 mb-2">Session Cost ($) *</Text>
          <TextInput
            className="bg-white p-4 rounded-xl border border-gray-200"
            placeholder="120"
            value={formData.sessionCost}
            onChangeText={(text) => handleChange('sessionCost', text)}
            keyboardType="numeric"
          />
        </View>
        
        {/* Specialties */}
        <View className="mb-6">
          <Text className="text-gray-700 mb-2">Specialties</Text>
          <View className="flex-row mb-2">
            <TextInput
              className="bg-white p-4 rounded-xl border border-gray-200 flex-1 mr-2"
              placeholder="Add a specialty"
              value={specialty}
              onChangeText={setSpecialty}
            />
            <TouchableOpacity
              className="bg-emerald-500 p-4 rounded-xl"
              onPress={addSpecialty}
            >
              <Icon name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <View className="flex-row flex-wrap mt-2">
            {formData.specialties.map((item, index) => (
              <View key={index} className="bg-gray-100 rounded-full px-3 py-2 mr-2 mb-2 flex-row items-center">
                <Text className="text-gray-700">{item}</Text>
                <TouchableOpacity onPress={() => removeItem('specialties', index)} className="ml-2">
                  <Icon name="close-circle" size={16} color="#6b7280" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
        
        {/* Languages */}
        <View className="mb-6">
          <Text className="text-gray-700 mb-2">Languages</Text>
          <View className="flex-row mb-2">
            <TextInput
              className="bg-white p-4 rounded-xl border border-gray-200 flex-1 mr-2"
              placeholder="Add a language"
              value={language}
              onChangeText={setLanguage}
            />
            <TouchableOpacity
              className="bg-emerald-500 p-4 rounded-xl"
              onPress={addLanguage}
            >
              <Icon name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <View className="flex-row flex-wrap mt-2">
            {formData.languages.map((item, index) => (
              <View key={index} className="bg-gray-100 rounded-full px-3 py-2 mr-2 mb-2 flex-row items-center">
                <Text className="text-gray-700">{item}</Text>
                <TouchableOpacity onPress={() => removeItem('languages', index)} className="ml-2">
                  <Icon name="close-circle" size={16} color="#6b7280" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
        
        {/* Therapy Modes */}
        <View className="mb-6">
          <Text className="text-gray-700 mb-2">Therapy Modes</Text>
          <View className="flex-row mb-2">
            <TextInput
              className="bg-white p-4 rounded-xl border border-gray-200 flex-1 mr-2"
              placeholder="Add a therapy mode (e.g. In-person, Virtual)"
              value={therapyMode}
              onChangeText={setTherapyMode}
            />
            <TouchableOpacity
              className="bg-emerald-500 p-4 rounded-xl"
              onPress={addTherapyMode}
            >
              <Icon name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <View className="flex-row flex-wrap mt-2">
            {formData.therapyModes.map((item, index) => (
              <View key={index} className="bg-gray-100 rounded-full px-3 py-2 mr-2 mb-2 flex-row items-center">
                <Text className="text-gray-700">{item}</Text>
                <TouchableOpacity onPress={() => removeItem('therapyModes', index)} className="ml-2">
                  <Icon name="close-circle" size={16} color="#6b7280" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
        
        {/* Navigation */}
        <View className="flex-row justify-between mt-4 mb-8">
          <TouchableOpacity
            className="bg-gray-300 py-4 px-8 rounded-full"
            onPress={prevStep}
          >
            <Text className="text-gray-700 font-bold">Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="bg-emerald-500 py-4 px-8 rounded-full"
            onPress={nextStep}
          >
            <Text className="text-white font-bold">Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
  
  // Step 3: Availability
  const renderAvailability = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView className="p-4">
        <Text className="text-2xl font-bold mb-6">Set Your Availability</Text>
        
        {/* Select Day */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-2">Select Day</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            {formData.availability.map((dayObj, index) => (
              <TouchableOpacity
                key={index}
                className={`py-2 px-4 rounded-full mr-2 ${
                  selectedDay === dayObj.day ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
                onPress={() => setSelectedDay(dayObj.day)}
              >
                <Text
                  className={`${
                    selectedDay === dayObj.day ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {dayObj.day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Add Time Slot */}
        <View className="mb-6">
          <Text className="text-gray-700 mb-2">Add Time Slot</Text>
          <View className="flex-row mb-2">
            <View className="flex-1 mr-2">
              <Text className="text-xs text-gray-500 mb-1">Start Time</Text>
              <TextInput
                className="bg-white p-4 rounded-xl border border-gray-200"
                placeholder="09:00"
                value={timeSlot.startTime}
                onChangeText={(text) => setTimeSlot(prev => ({ ...prev, startTime: text }))}
              />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-xs text-gray-500 mb-1">End Time</Text>
              <TextInput
                className="bg-white p-4 rounded-xl border border-gray-200"
                placeholder="10:00"
                value={timeSlot.endTime}
                onChangeText={(text) => setTimeSlot(prev => ({ ...prev, endTime: text }))}
              />
            </View>
          </View>
          
          <TouchableOpacity
            className="bg-emerald-500 py-3 rounded-xl items-center mt-2"
            onPress={addTimeSlot}
          >
            <Text className="text-white font-medium">Add Time Slot</Text>
          </TouchableOpacity>
        </View>
        
        {/* Current Time Slots */}
        <View className="mb-6">
          <Text className="text-gray-700 mb-2">
            Time Slots for {selectedDay}
          </Text>
          
          {formData.availability.find(day => day.day === selectedDay)?.slots.length > 0 ? (
            <View className="flex-row flex-wrap">
              {formData.availability
                .find(day => day.day === selectedDay)
                ?.slots.map((slot, slotIndex) => (
                  <View
                    key={slotIndex}
                    className="bg-emerald-100 rounded-lg px-3 py-2 mr-2 mb-2 flex-row items-center"
                  >
                    <Text className="text-emerald-700">
                      {slot.startTime} - {slot.endTime}
                    </Text>
                    <TouchableOpacity 
                      onPress={() => {
                        const dayIndex = formData.availability.findIndex(day => day.day === selectedDay);
                        removeTimeSlot(dayIndex, slotIndex);
                      }} 
                      className="ml-2"
                    >
                      <Icon name="close-circle" size={16} color="#10b981" />
                    </TouchableOpacity>
                  </View>
                ))}
            </View>
          ) : (
            <Text className="text-gray-500 italic">No time slots added</Text>
          )}
        </View>
        
        {/* Navigation */}
        <View className="flex-row justify-between mt-4 mb-8">
          <TouchableOpacity
            className="bg-gray-300 py-4 px-8 rounded-full"
            onPress={prevStep}
          >
            <Text className="text-gray-700 font-bold">Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="bg-emerald-500 py-4 px-8 rounded-full"
            onPress={nextStep}
          >
            <Text className="text-white font-bold">Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
  
  // Step 4: Review Information
  const renderReview = () => (
    <ScrollView className="p-4">
      <Text className="text-2xl font-bold mb-6">Review Your Information</Text>
      
      {/* Basic Info */}
      <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <Text className="text-lg font-semibold mb-2">Personal Information</Text>
        <View className="flex-row items-center mb-4">
          {formData.imageUrl ? (
            <Image
              source={{ uri: formData.imageUrl }}
              style={{ width: 60, height: 60, borderRadius: 30 }}
            />
          ) : (
            <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center">
              <Icon name="person" size={30} color="#10b981" />
            </View>
          )}
          <View className="ml-3">
            <Text className="font-medium">{formData.name || '(Not provided)'}</Text>
            <Text className="text-gray-500">{formData.title || '(Not provided)'}</Text>
            <Text className="text-gray-500">{formData.email}</Text>
          </View>
        </View>
        <View className="flex-row items-center mb-2">
          <Icon name="location-outline" size={18} color="#6b7280" />
          <Text className="text-gray-700 ml-2">{formData.location || '(Not provided)'}</Text>
        </View>
        <View className="flex-row items-center">
          <Icon name="call-outline" size={18} color="#6b7280" />
          <Text className="text-gray-700 ml-2">{formData.phone || '(Not provided)'}</Text>
        </View>
      </View>
      
      {/* Professional Info */}
      <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <Text className="text-lg font-semibold mb-2">Professional Details</Text>
        <Text className="text-gray-700 mb-3">{formData.bio || '(No bio provided)'}</Text>
        
        <View className="flex-row items-center mb-3">
          <Icon name="cash-outline" size={18} color="#6b7280" />
          <Text className="text-gray-700 ml-2">
            ${formData.sessionCost || '0'} per session
          </Text>
        </View>
        
        <Text className="font-medium mb-1">Specialties:</Text>
        <View className="flex-row flex-wrap mb-3">
          {formData.specialties.length > 0 ? (
            formData.specialties.map((specialty, index) => (
              <View key={index} className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2">
                <Text className="text-gray-700">{specialty}</Text>
              </View>
            ))
          ) : (
            <Text className="text-gray-500 italic">(None provided)</Text>
          )}
        </View>
        
        <Text className="font-medium mb-1">Languages:</Text>
        <Text className="text-gray-700 mb-3">
          {formData.languages.length > 0 
            ? formData.languages.join(', ') 
            : '(None provided)'}
        </Text>
        
        <Text className="font-medium mb-1">Therapy Modes:</Text>
        <Text className="text-gray-700">
          {formData.therapyModes.length > 0 
            ? formData.therapyModes.join(', ') 
            : '(None provided)'}
        </Text>
      </View>
      
      {/* Availability */}
      <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <Text className="text-lg font-semibold mb-2">Weekly Availability</Text>
        
        {formData.availability.map((day, index) => (
          <View key={index} className="mb-3">
            <Text className="font-medium text-gray-800 mb-1">{day.day}</Text>
            {day.slots.length > 0 ? (
              <View className="flex-row flex-wrap">
                {day.slots.map((slot, slotIndex) => (
                  <View
                    key={slotIndex}
                    className="py-1 px-3 m-1 rounded-lg bg-emerald-100"
                  >
                    <Text className="text-emerald-700">
                      {slot.startTime} - {slot.endTime}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-gray-500 italic">No slots available</Text>
            )}
          </View>
        ))}
      </View>
      
      {/* Submit */}
      <View className="flex-row justify-between mt-4 mb-8">
        <TouchableOpacity
          className="bg-gray-300 py-4 px-8 rounded-full"
          onPress={prevStep}
          disabled={loading}
        >
          <Text className="text-gray-700 font-bold">Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="bg-emerald-500 py-4 px-8 rounded-full flex-row items-center"
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white font-bold ml-2">Submitting...</Text>
            </>
          ) : (
            <Text className="text-white font-bold">Submit Application</Text>
          )}

          
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
  
  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-emerald-500 pt-12 pb-6 px-4">
        <TouchableOpacity 
          className="bg-white w-10 h-10 rounded-full items-center justify-center mb-4" 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#10b981" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Join As Therapist</Text>
        <Text className="text-white opacity-80">Create your therapist profile</Text>
      </View>
      
      {/* Progress Steps */}
      <View className="flex-row justify-between px-8 py-4 bg-white">
        {[1, 2, 3, 4].map((stepNumber) => (
          <View key={stepNumber} className="items-center">
            <View 
              className={`w-8 h-8 rounded-full items-center justify-center ${
                step >= stepNumber ? 'bg-emerald-500' : 'bg-gray-200'
              }`}
            >
              <Text 
                className={`font-bold ${
                  step >= stepNumber ? 'text-white' : 'text-gray-500'
                }`}
              >
                {stepNumber}
              </Text>
            </View>
            <Text className="text-xs text-gray-500 mt-1">
              {stepNumber === 1 ? 'Personal' : 
                stepNumber === 2 ? 'Professional' : 
                stepNumber === 3 ? 'Schedule' : 'Review'}
            </Text>
          </View>
        ))}
      </View>
      
      {/* Step Content */}
      {renderStep()}
    </View>
  );
}