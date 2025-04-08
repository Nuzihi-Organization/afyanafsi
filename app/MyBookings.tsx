import React, { useState, useEffect } from 'react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    // In a real application, this would be an API call
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    // Simulating API call with mock data
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      try {
        // Mock data for demonstration
        const mockBookings = [
          {
            id: 1,
            therapistName: "Dr. Sarah Johnson",
            therapistPhoto: "/api/placeholder/50/50",
            date: "2025-04-10",
            time: "14:00",
            duration: 50,
            status: "confirmed",
            type: "Video Session",
            notes: "Initial consultation"
          },
          {
            id: 2,
            therapistName: "Dr. Michael Chen",
            therapistPhoto: "/api/placeholder/50/50",
            date: "2025-04-17",
            time: "10:30",
            duration: 50,
            status: "confirmed",
            type: "Video Session",
            notes: "Follow-up session"
          },
          {
            id: 3,
            therapistName: "Dr. Sarah Johnson",
            therapistPhoto: "/api/placeholder/50/50",
            date: "2025-03-20",
            time: "15:00",
            duration: 50,
            status: "completed",
            type: "Video Session",
            notes: "Discussed anxiety management techniques"
          }
        ];
        
        setBookings(mockBookings);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load bookings. Please try again later.");
        setIsLoading(false);
      }
    }, 1000);
  };

  const cancelBooking = (bookingId) => {
    // In a real app, this would be an API call
    const confirmed = window.confirm("Are you sure you want to cancel this appointment?");
    
    if (confirmed) {
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? {...booking, status: "cancelled"} 
            : booking
        )
      );
    }
  };

  const rescheduleBooking = (bookingId) => {
    // In a real app, this would navigate to a reschedule page
    alert(`Redirecting to reschedule page for booking ${bookingId}`);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const filterBookings = (status) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (status === 'upcoming') {
      return bookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= today && booking.status !== 'cancelled';
      });
    } else if (status === 'past') {
      return bookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate < today || booking.status === 'completed';
      });
    } else if (status === 'cancelled') {
      return bookings.filter(booking => booking.status === 'cancelled');
    }
    
    return bookings;
  };

  const filteredBookings = filterBookings(activeTab);

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading your bookings...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4 bg-red-50 rounded-md">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Therapy Sessions</h1>
      
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button 
          className={`py-2 px-4 font-medium ${activeTab === 'upcoming' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming
        </button>
        <button 
          className={`py-2 px-4 font-medium ${activeTab === 'past' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('past')}
        >
          Past
        </button>
        <button 
          className={`py-2 px-4 font-medium ${activeTab === 'cancelled' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('cancelled')}
        >
          Cancelled
        </button>
      </div>
      
      {/* Bookings list */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No {activeTab} bookings found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(booking => (
            <div key={booking.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex items-center mb-3 md:mb-0">
                  <img 
                    src={booking.therapistPhoto} 
                    alt={booking.therapistName} 
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="font-medium">{booking.therapistName}</h3>
                    <p className="text-sm text-gray-600">{booking.type}</p>
                  </div>
                </div>
                
                <div className="flex flex-col md:items-end">
                  <p className="font-medium">{formatDate(booking.date)}</p>
                  <p className="text-gray-600">{booking.time} ({booking.duration} minutes)</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                    {booking.notes && (
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Notes:</span> {booking.notes}
                      </p>
                    )}
                  </div>
                  
                  {booking.status === 'confirmed' && (
                    <div className="flex mt-4 md:mt-0 space-x-2">
                      <button 
                        onClick={() => rescheduleBooking(booking.id)}
                        className="px-4 py-1 text-sm border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
                      >
                        Reschedule
                      </button>
                      <button 
                        onClick={() => cancelBooking(booking.id)}
                        className="px-4 py-1 text-sm border border-red-500 text-red-500 rounded hover:bg-red-50"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  
                  {booking.status === 'confirmed' && new Date(booking.date) <= new Date() && (
                    <a 
                      href="#" 
                      className="mt-4 md:mt-0 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-center"
                    >
                      Join Session
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Cancellation Policy</h3>
        <p className="text-sm text-gray-600">
          Appointments can be cancelled or rescheduled up to 24 hours before the scheduled time without penalty. 
          Late cancellations or no-shows may be subject to a fee.
        </p>
      </div>
    </div>
  );
};

export default MyBookings;