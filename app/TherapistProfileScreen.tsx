import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  ActivityIndicator,
  StyleSheet,
  FlatList
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '../config';

export default function TherapistProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { therapistId } = route.params;
  
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    const fetchTherapistDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/therapists/${therapistId}`);
        setTherapist(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching therapist details:', error);
        setLoading(false);
      }
    };
    
    fetchTherapistDetails();
  }, [therapistId]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!therapist) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-500">Therapist profile not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView>
        {/* Header */}
        <View className="bg-emerald-500 pt-12 pb-6 px-4">
          <TouchableOpacity 
            className="bg-white w-10 h-10 rounded-full items-center justify-center mb-4" 
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#10b981" />
          </TouchableOpacity>
          
          <View className="flex-row items-center">
            <Image
              source={{ uri: therapist.imageUrl }}
              style={{ width: 100, height: 100, borderRadius: 50 }}
              resizeMode="cover"
            />
            <View className="ml-4 flex-1">
              <Text className="text-white text-2xl font-bold">{therapist.name}</Text>
              <Text className="text-white opacity-90">{therapist.title}</Text>
              <View className="flex-row items-center mt-2">
                <Icon name="star" size={16} color="#FFD700" />
                <Text className="text-white ml-1">{therapist.rating.toFixed(1)} ({therapist.reviewCount} reviews)</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Tabs */}
        <View className="flex-row border-b border-gray-200 bg-white">
          <TouchableOpacity 
            className={`flex-1 py-4 ${activeTab === 'about' ? 'border-b-2 border-emerald-500' : ''}`}
            onPress={() => setActiveTab('about')}
          >
            <Text className={`text-center font-medium ${activeTab === 'about' ? 'text-emerald-500' : 'text-gray-600'}`}>
              About
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 py-4 ${activeTab === 'reviews' ? 'border-b-2 border-emerald-500' : ''}`}
            onPress={() => setActiveTab('reviews')}
          >
            <Text className={`text-center font-medium ${activeTab === 'reviews' ? 'text-emerald-500' : 'text-gray-600'}`}>
              Reviews
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 py-4 ${activeTab === 'availability' ? 'border-b-2 border-emerald-500' : ''}`}
            onPress={() => setActiveTab('availability')}
          >
            <Text className={`text-center font-medium ${activeTab === 'availability' ? 'text-emerald-500' : 'text-gray-600'}`}>
              Availability
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Tab Content */}
        <View className="p-4">
          {activeTab === 'about' && (
            <View>
              <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                <Text className="text-lg font-semibold mb-2">Bio</Text>
                <Text className="text-gray-700">{therapist.bio}</Text>
              </View>
              
              <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                <Text className="text-lg font-semibold mb-2">Specialties</Text>
                <View className="flex-row flex-wrap">
                  {therapist.specialties && therapist.specialties.map((specialty, index) => (
                    <View key={index} className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2">
                      <Text className="text-gray-700">{specialty}</Text>
                    </View>
                  ))}
                </View>
              </View>
              
              <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                <Text className="text-lg font-semibold mb-2">Session Information</Text>
                <View className="flex-row items-center mb-2">
                  <Icon name="cash-outline" size={18} color="#6b7280" />
                  <Text className="text-gray-700 ml-2">${therapist.sessionCost} per session</Text>
                </View>
                <View className="flex-row items-center mb-2">
                  <Icon name="location-outline" size={18} color="#6b7280" />
                  <Text className="text-gray-700 ml-2">{therapist.location}</Text>
                </View>
                <View className="flex-row items-center mb-2">
                  <Icon name="globe-outline" size={18} color="#6b7280" />
                  <Text className="text-gray-700 ml-2">Languages: {therapist.languages && therapist.languages.join(', ')}</Text>
                </View>
                <View className="flex-row items-center">
                  <Icon name="videocam-outline" size={18} color="#6b7280" />
                  <Text className="text-gray-700 ml-2">
                    Session modes: {therapist.therapyModes && therapist.therapyModes.join(', ')}
                  </Text>
                </View>
              </View>
            </View>
          )}
          
          {activeTab === 'reviews' && (
            <View className="bg-white rounded-xl p-4 shadow-sm">
              <Text className="text-lg font-semibold mb-4">Client Reviews</Text>
              
              {therapist.reviews && therapist.reviews.length > 0 ? (
                therapist.reviews.map((review, index) => (
                  <View key={index} className="mb-4 pb-4 border-b border-gray-100">
                    <View className="flex-row justify-between">
                      <View className="flex-row items-center">
                        <Icon name="person-circle-outline" size={24} color="#6b7280" />
                        <Text className="ml-2 font-medium">Anonymous Client</Text>
                      </View>
                      <View className="flex-row items-center">
                        {[...Array(5)].map((_, i) => (
                          <Icon 
                            key={i} 
                            name={i < review.rating ? "star" : "star-outline"} 
                            size={16} 
                            color="#FFD700" 
                          />
                        ))}
                      </View>
                    </View>
                    <Text className="text-gray-700 mt-2">{review.comment}</Text>
                    <Text className="text-gray-500 text-xs mt-2">
                      {new Date(review.date).toLocaleDateString()}
                    </Text>
                  </View>
                ))
              ) : (
                <Text className="text-gray-500 italic">No reviews yet</Text>
              )}
            </View>
          )}
          
          {activeTab === 'availability' && (
            <View className="bg-white rounded-xl p-4 shadow-sm">
              <Text className="text-lg font-semibold mb-4">Weekly Availability</Text>
              
              {therapist.availability && therapist.availability.length > 0 ? (
                therapist.availability.map((day, index) => (
                  <View key={index} className="mb-4 pb-4 border-b border-gray-100">
                    <Text className="font-medium text-gray-800 mb-2">{day.day}</Text>
                    {day.slots && day.slots.length > 0 ? (
                      <View className="flex-row flex-wrap">
                        {day.slots.map((slot, slotIndex) => (
                          <View
                            key={slotIndex}
                            className={`py-1 px-3 m-1 rounded-lg ${
                              slot.isBooked ? 'bg-gray-200' : 'bg-emerald-100'
                            }`}
                          >
                            <Text
                              className={`${
                                slot.isBooked ? 'text-gray-500' : 'text-emerald-700'
                              }`}
                            >
                              {slot.startTime} - {slot.endTime}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text className="text-gray-500 italic">No slots available</Text>
                    )}
                  </View>
                ))
              ) : (
                <Text className="text-gray-500 italic">No availability information</Text>
              )}
            </View>
          )}
        </View>
        
        {/* Book Button */}
        <View className="px-4 pb-8">
          <TouchableOpacity
            className="bg-emerald-500 py-4 rounded-full"
            onPress={() => navigation.navigate('BookingDetails', { therapist })}
          >
            <Text className="text-white font-bold text-center text-lg">
              Book a Session
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}