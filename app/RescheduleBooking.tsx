import React, { useState, useEffect } from 'react';

const RescheduleBooking = ({ bookingId, onClose, onReschedule }) => {
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState([]);

  useEffect(() => {
    fetchBookingDetails();
    generateAvailableDates();
  }, [bookingId, currentMonth]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate]);

  const fetchBookingDetails = () => {
    // In a real application, this would be an API call
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      try {
        // Mock data for demonstration
        const mockBooking = {
          id: bookingId,
          therapistName: "Dr. Sarah Johnson",
          therapistPhoto: "/api/placeholder/50/50",
          date: "2025-04-10",
          time: "14:00",
          duration: 50,
          status: "confirmed",
          type: "Video Session"
        };
        
        setBooking(mockBooking);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load booking details. Please try again later.");
        setIsLoading(false);
      }
    }, 600);
  };

  const generateAvailableDates = () => {
    // In a real app, this would come from an API based on therapist availability
    // For demo purposes, we'll generate some dates
    const dates = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      
      // Skip dates in the past and weekends (Saturday and Sunday)
      if (date < new Date() || date.getDay() === 0 || date.getDay() === 6) {
        continue;
      }
      
      dates.push({
        date: date,
        dateString: date.toISOString().split('T')[0],
        hasSlots: Math.random() > 0.3 // 70% chance of having slots available
      });
    }
    
    setAvailableDates(dates);
  };

  const fetchAvailableSlots = (date) => {
    // In a real app, this would be an API call to get available time slots
    // For demo purposes, we'll generate some time slots
    const timeSlots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      // Add slots at the hour and half-hour
      if (Math.random() > 0.5) { // 50% chance of slot being available
        timeSlots.push(`${hour}:00`);
      }
      
      if (Math.random() > 0.5) {
        timeSlots.push(`${hour}:30`);
      }
    }
    
    // Format times properly
    const formattedSlots = timeSlots.map(time => {
      const [hour, minute] = time.split(':');
      return `${hour.padStart(2, '0')}:${minute}`;
    }).sort();
    
    setAvailableSlots(formattedSlots);
  };

  const handleReschedule = () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select both a date and time");
      return;
    }
    
    // In a real app, this would be an API call to reschedule the appointment
    // For demo purposes, we'll just simulate success
    
    // Format the selected date and time for display
    const newDateTime = new Date(`${selectedDate}T${selectedTime}`);
    const formattedDateTime = newDateTime.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
    
    const confirmed = window.confirm(`Reschedule your appointment to ${formattedDateTime}?`);
    
    if (confirmed) {
      // Call the parent component's onReschedule function
      if (onReschedule) {
        onReschedule(bookingId, selectedDate, selectedTime);
      }
      
      alert("Your appointment has been rescheduled successfully!");
      onClose();
    }
  };

  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
          <p className="text-center">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold">Reschedule Appointment</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="mb-6">
            <div className="bg-blue-50 p-4 rounded-md mb-4">
              <h3 className="font-medium">Current Appointment</h3>
              <div className="flex items-center mt-2">
                <img 
                  src={booking.therapistPhoto} 
                  alt={booking.therapistName} 
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="font-medium">{booking.therapistName}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(booking.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })} at {booking.time}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b pb-4 mb-4">
              <h3 className="font-medium mb-3">Select a New Date</h3>
              
              <div className="flex justify-between items-center mb-4">
                <button 
                  onClick={goToPreviousMonth}
                  className="p-1 text-gray-500 hover:text-gray-700"
                  disabled={currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear()}
                >
                  ← Previous
                </button>
                <h4 className="font-medium">
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h4>
                <button 
                  onClick={goToNextMonth}
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  Next →
                </button>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs text-gray-500">
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
                <div>Sun</div>
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {/* Add empty cells for days of the week before the first day of the month */}
                {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() }).map((_, index) => (
                  <div key={`empty-start-${index}`} className="h-10 rounded-md"></div>
                ))}
                
                {/* Display available dates */}
                {availableDates.map(dateObj => (
                  <button
                    key={dateObj.dateString}
                    className={`h-10 rounded-md text-sm ${
                      selectedDate === dateObj.dateString
                        ? 'bg-blue-500 text-white'
                        : dateObj.hasSlots
                          ? 'hover:bg-blue-100 border border-gray-200'
                          : 'text-gray-300 cursor-not-allowed'
                    }`}
                    onClick={() => dateObj.hasSlots && setSelectedDate(dateObj.dateString)}
                    disabled={!dateObj.hasSlots}
                  >
                    {dateObj.date.getDate()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Select a Time</h3>
              
              {selectedDate ? (
                availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {availableSlots.map(time => (
                      <button
                        key={time}
                        className={`py-2 px-1 text-sm rounded-md ${
                          selectedTime === time
                            ? 'bg-blue-500 text-white'
                            : 'hover:bg-blue-100 border border-gray-200'
                        }`}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No available times on this date. Please select another date.</p>
                )
              ) : (
                <p className="text-gray-500">Please select a date to see available times.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button 
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleReschedule}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
              disabled={!selectedDate || !selectedTime}
            >
              Reschedule Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RescheduleBooking;