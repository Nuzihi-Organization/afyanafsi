import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  ActivityIndicator,
  Modal,
  Alert
} from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

export default function TherapistsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userToken, setUserToken] = useState(null);
  
  // Get filters from route params or use empty object
  const filters = route.params?.filters || {};

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('userToken');
      setUserToken(token);
    };
    
    checkAuth();
    
    const fetchTherapists = async () => {
      try {
        setLoading(true);
        let response;
        
        // If filters are provided, use them
        if (filters && Object.keys(filters).length > 0) {
          response = await axios.post(`${API_URL}/api/therapists/filter`, filters);
        } else {
          response = await axios.get(`${API_URL}/api/therapists`);
        }
        
        setTherapists(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching therapists:', error);
        setLoading(false);
        Alert.alert('Error', 'Failed to load therapists');
      }
    };
    
    fetchTherapists();
  }, [filters]);

  const handleBookSession = (therapist) => {
    if (!userToken) {
      // Save selected therapist ID to AsyncStorage for later booking
      AsyncStorage.setItem('selectedTherapistId', therapist._id);
      navigation.navigate('Login', { redirectTo: 'Booking' });
      return;
    }
    
    setSelectedTherapist(therapist);
    setModalVisible(true);
  };

  const applyFilters = () => {
    navigation.navigate('Preferences');
  };
  
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="mt-4 text-gray-600">Loading therapists...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold">Available Therapists</Text>
          <TouchableOpacity 
            className="flex-row items-center bg-emerald-100 px-3 py-2 rounded-lg"
            onPress={applyFilters}
          >
            <Icon name="filter" size={18} color="#10b981" />
            <Text className="text-emerald-700 ml-1">Filter</Text>
          </TouchableOpacity>
        </View>
        
        {therapists.length === 0 && (
          <View className="py-8 items-center">
            {/* Replaced Lottie animation with a basic icon as fallback */}
            <Icon name="search" size={70} color="#D1D5DB" />
            <Text className="text-gray-500 text-center mt-4">
              No therapists found matching your criteria.
            </Text>
            <TouchableOpacity
              className="mt-4 bg-emerald-500 px-6 py-3 rounded-full"
              onPress={() => navigation.navigate('Preferences')}
            >
              <Text className="text-white font-semibold">Adjust Preferences</Text>
            </TouchableOpacity>
          </View>
        )}

        {therapists.map((therapist, index) => (
          <Animated.View
            key={therapist._id || index}
            entering={FadeInRight.delay(index * 200).duration(500)}
            className="bg-white rounded-xl p-4 mb-6 shadow-lg"
          >
            <View className="flex-row items-center">
              <Image
                source={{ uri: therapist.imageUrl }}
                style={{ width: 100, height: 120, borderRadius: 35 }}
                resizeMode="cover"
              />
              <View className="ml-4 flex-1">
                <Text className="text-xl font-bold">{therapist.name}</Text>
                <Text className="text-gray-600">{therapist.title}</Text>
                {therapist.isTopRated && (
                  <View className="flex-row items-center mt-1">
                    {/* Replaced Lottie animation with Icon */}
                    <Icon name="star" size={18} color="#F59E0B" />
                    <Text className="text-yellow-500 ml-1">Top Rated</Text>
                  </View>
                )}
                <View className="flex-row items-center mt-1">
                  <Icon name="location-outline" size={16} color="#6b7280" />
                  <Text className="text-gray-500 ml-1">{therapist.location}</Text>
                </View>
              </View>
            </View>

            <Text className="text-gray-700 mt-4">{therapist.bio}</Text>
            
            <View className="mt-3 flex-row flex-wrap">
              {therapist.specialties && therapist.specialties.slice(0, 3).map((specialty, idx) => (
                <View key={idx} className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2">
                  <Text className="text-gray-700 text-xs">{specialty}</Text>
                </View>
              ))}
            </View>

            <View className="flex-row justify-between items-center mt-4">
              <View className="flex-row items-center">
                <Text className="text-emerald-600 font-bold">⭐ {therapist.rating.toFixed(1)}</Text>
                <Text className="text-gray-600 ml-2">({therapist.reviewCount} reviews)</Text>
              </View>

              <TouchableOpacity
                className="bg-emerald-500 px-6 py-2 rounded-full"
                onPress={() => handleBookSession(therapist)}
              >
                <Text className="text-white font-semibold">Book A Session</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        ))}
      </ScrollView>
      
      {/* Booking Modal */}
      {selectedTherapist && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 justify-end bg-black bg-opacity-50">
            <View className="bg-white rounded-t-3xl p-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold">Book a Session</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Icon name="close-circle" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              
              <Text className="text-lg font-semibold">{selectedTherapist.name}</Text>
              <Text className="text-gray-600 mb-4">{selectedTherapist.title}</Text>
              
              <TouchableOpacity
                className="bg-emerald-500 py-3 rounded-xl mb-2"
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('BookingDetails', { therapist: selectedTherapist });
                }}
              >
                <Text className="text-white font-bold text-center">Continue to Booking</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="py-3"
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('TherapistProfile', { therapistId: selectedTherapist._id });
                }}
              >
                <Text className="text-emerald-600 font-semibold text-center">View Full Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}