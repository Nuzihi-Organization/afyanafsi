const express = require('express');
const Booking = require('../models/booking');
const Therapist = require('../models/therapist');
const User = require('../models/user');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { sendBookingConfirmationEmail } = require('../utils/emailService');

// Create a new booking
router.post('/', protect, async (req, res) => {
  try {
    const { therapistId, date, startTime, endTime, mode, therapyType, notes } = req.body;
    
    // Find therapist
    const therapist = await Therapist.findById(therapistId);
    if (!therapist) {
      return res.status(404).json({ message: 'Therapist not found' });
    }
    
    // Check if slot is available
    const bookingDate = new Date(date);
    const day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][bookingDate.getDay()];
    
    const daySchedule = therapist.availability.find(a => a.day === day);
    if (!daySchedule) {
      return res.status(400).json({ message: 'Therapist not available on this day' });
    }
    
    const slot = daySchedule.slots.find(s => s.startTime === startTime && s.endTime === endTime);
    if (!slot || slot.isBooked) {
      return res.status(400).json({ message: 'This time slot is not available' });
    }
    
    // Create booking
    const booking = new Booking({
      user: req.user._id,
      therapist: therapistId,
      therapistName: therapist.name,
      date: bookingDate,
      startTime,
      endTime,
      mode,
      therapyType,
      notes,
    });
    
    const savedBooking = await booking.save();
    
    // Update therapist availability
    slot.isBooked = true;
    await therapist.save();
    
    // Update user bookings
    await User.findByIdAndUpdate(req.user._id, {
      $push: { bookings: savedBooking._id }
    });
    
    // Send confirmation email
    await sendBookingConfirmationEmail(req.user.email, savedBooking, therapist);
    
    res.status(201).json(savedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get user bookings
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('therapist', 'name imageUrl title');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Cancel booking
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    booking.status = 'cancelled';
    await booking.save();
    
    // Free up the slot
    const therapist = await Therapist.findById(booking.therapist);
    if (therapist) {
      const bookingDate = new Date(booking.date);
      const day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][bookingDate.getDay()];
      
      const daySchedule = therapist.availability.find(a => a.day === day);
      if (daySchedule) {
        const slot = daySchedule.slots.find(s => 
          s.startTime === booking.startTime && s.endTime === booking.endTime
        );
        if (slot) {
          slot.isBooked = false;
          await therapist.save();
        }
      }
    }
    
    res.json({ message: 'Booking cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;