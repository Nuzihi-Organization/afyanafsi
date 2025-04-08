// controllers/therapistController.js
const Therapist = require('../models/therapist');
const mongoose = require('mongoose');
const cloudinary = require('../utils/cloudinaryConfig');

// Get all therapists (with filtering)
exports.getAllTherapists = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    let filter = { isApproved: true, isActive: true };
    
    // Count total documents
    const totalDocs = await Therapist.countDocuments(filter);
    
    // Get therapists
    const therapists = await Therapist.find(filter)
      .skip(skip)
      .limit(limit)
      .select('name title imageUrl specialties sessionCost location rating reviewCount')
      .lean();
    
    res.json({
      success: true,
      data: therapists,
      pagination: {
        total: totalDocs,
        page,
        pages: Math.ceil(totalDocs / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching therapists:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Search therapists with filters
exports.searchTherapists = async (req, res) => {
  try {
    const {
      specialty,
      location,
      language,
      therapyMode,
      minPrice,
      maxPrice,
      minRating,
      page = 1,
      limit = 10
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build query
    let query = { isApproved: true, isActive: true };
    
    if (specialty) {
      query.specialties = { $in: [new RegExp(specialty, 'i')] };
    }
    
    if (location) {
      query.location = new RegExp(location, 'i');
    }
    
    if (language) {
      query.languages = { $in: [new RegExp(language, 'i')] };
    }
    
    if (therapyMode) {
      query.therapyModes = { $in: [new RegExp(therapyMode, 'i')] };
    }
    
    // Price range
    if (minPrice || maxPrice) {
      query.sessionCost = {};
      if (minPrice) query.sessionCost.$gte = parseInt(minPrice);
      if (maxPrice) query.sessionCost.$lte = parseInt(maxPrice);
    }
    
    // Minimum rating
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }
    
    // Count total matching documents
    const totalDocs = await Therapist.countDocuments(query);
    
    // Get therapists
    const therapists = await Therapist.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .select('name title imageUrl specialties sessionCost location rating reviewCount')
      .lean();
    
    res.json({
      success: true,
      data: therapists,
      pagination: {
        total: totalDocs,
        page: parseInt(page),
        pages: Math.ceil(totalDocs / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error searching therapists:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get therapist by ID
exports.getTherapistById = async (req, res) => {
  try {
    const therapist = await Therapist.findById(req.params.id);
    
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found' });
    }
    
    res.json({
      success: true,
      data: {
        id: therapist._id,
        name: therapist.name,
        title: therapist.title,
        imageUrl: therapist.imageUrl,
        bio: therapist.bio,
        specialties: therapist.specialties,
        sessionCost: therapist.sessionCost,
        location: therapist.location,
        languages: therapist.languages,
        therapyModes: therapist.therapyModes,
        availability: therapist.availability,
        rating: therapist.rating,
        reviewCount: therapist.reviewCount,
        reviews: therapist.reviews
      }
    });
  } catch (error) {
    console.error('Error fetching therapist:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new therapist
exports.createTherapist = async (req, res) => {
  try {
    // Check if email already exists
    const existingTherapist = await Therapist.findOne({ email: req.body.email });
    if (existingTherapist) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }
    
    // Process image if it's a data URL
    let imageUrl = req.body.imageUrl;
    if (imageUrl && imageUrl.startsWith('data:image')) {
      const uploadRes = await cloudinary.uploader.upload(imageUrl, {
        folder: 'therapist_profiles'
      });
      imageUrl = uploadRes.secure_url;
    }
    
    // Create new therapist
    const therapistData = {
      ...req.body,
      imageUrl,
      rating: 0,
      reviewCount: 0,
      isApproved: false // Requires admin approval
    };
    
    const therapist = new Therapist(therapistData);
    await therapist.save();
    
    res.status(201).json({
      success: true,
      message: 'Therapist profile created successfully! Awaiting approval.',
      data: { id: therapist._id }
    });
  } catch (error) {
    console.error('Error creating therapist:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update therapist profile
exports.updateTherapist = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Remove sensitive fields that shouldn't be updated directly
    delete updates.isApproved;
    delete updates.rating;
    delete updates.reviewCount;
    delete updates.reviews;
    delete updates.password;
    
    // Process image if it's a data URL
    if (updates.imageUrl && updates.imageUrl.startsWith('data:image')) {
      const uploadRes = await cloudinary.uploader.upload(updates.imageUrl, {
        folder: 'therapist_profiles'
      });
      updates.imageUrl = uploadRes.secure_url;
    }
    
    const therapist = await Therapist.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found' });
    }
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: therapist.listProfile
    });
  } catch (error) {
    console.error('Error updating therapist:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add a review for therapist
exports.addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }
    
    const therapist = await Therapist.findById(id);
    
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found' });
    }
    
    // Check if user already reviewed this therapist
    const existingReviewIndex = therapist.reviews.findIndex(
      review => review.userId.toString() === userId
    );
    
    if (existingReviewIndex !== -1) {
      // Update existing review
      therapist.reviews[existingReviewIndex] = {
        userId,
        rating,
        comment,
        date: Date.now()
      };
    } else {
      // Add new review
      therapist.reviews.push({
        userId,
        rating,
        comment,
        date: Date.now()
      });
      therapist.reviewCount += 1;
    }
    
    // Update average rating
    const totalRating = therapist.reviews.reduce((sum, review) => sum + review.rating, 0);
    therapist.rating = therapist.reviewCount > 0 ? totalRating / therapist.reviewCount : 0;
    
    await therapist.save();
    
    res.json({
      success: true,
      message: 'Review added successfully',
      data: {
        rating: therapist.rating,
        reviewCount: therapist.reviewCount
      }
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get therapist availability
exports.getTherapistAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    
    const therapist = await Therapist.findById(id).select('availability');
    
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found' });
    }
    
    res.json({
      success: true,
      data: therapist.availability
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update availability
exports.updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { availability } = req.body;
    
    const therapist = await Therapist.findByIdAndUpdate(
      id,
      { $set: { availability } },
      { new: true }
    );
    
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found' });
    }
    
    res.json({
      success: true,
      message: 'Availability updated successfully',
      data: therapist.availability
    });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update specific time slot
exports.updateTimeSlot = async (req, res) => {
  try {
    const { id, dayIndex, slotIndex } = req.params;
    const slotData = req.body;
    
    const therapist = await Therapist.findById(id);
    
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found' });
    }
    
    if (!therapist.availability[dayIndex] || 
        !therapist.availability[dayIndex].slots[slotIndex]) {
      return res.status(404).json({ success: false, message: 'Time slot not found' });
    }
    
    // Update the specific slot
    therapist.availability[dayIndex].slots[slotIndex] = {
      ...therapist.availability[dayIndex].slots[slotIndex],
      ...slotData
    };
    
    await therapist.save();
    
    res.json({
      success: true,
      message: 'Time slot updated successfully',
      data: therapist.availability[dayIndex]
    });
  } catch (error) {
    console.error('Error updating time slot:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete time slot
exports.deleteTimeSlot = async (req, res) => {
  try {
    const { id, dayIndex, slotIndex } = req.params;
    
    const therapist = await Therapist.findById(id);
    
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found' });
    }
    
    if (!therapist.availability[dayIndex]) {
      return res.status(404).json({ success: false, message: 'Day not found' });
    }
    
    // Remove the slot
    therapist.availability[dayIndex].slots.splice(slotIndex, 1);
    await therapist.save();
    
    res.json({
      success: true,
      message: 'Time slot deleted successfully',
      data: therapist.availability[dayIndex]
    });
  } catch (error) {
    console.error('Error deleting time slot:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Approve therapist
exports.approveTherapist = async (req, res) => {
  try {
    const { id } = req.params;
    
    const therapist = await Therapist.findByIdAndUpdate(
      id,
      { $set: { isApproved: true } },
      { new: true }
    );
    
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found' });
    }
    
    res.json({
      success: true,
      message: 'Therapist approved successfully'
    });
  } catch (error) {
    console.error('Error approving therapist:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Toggle therapist status (active/inactive)
exports.toggleTherapistStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    const therapist = await Therapist.findByIdAndUpdate(
      id,
      { $set: { isActive } },
      { new: true }
    );
    
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found' });
    }
    
    res.json({
      success: true,
      message: `Therapist ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error updating therapist status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Delete therapist
exports.deleteTherapist = async (req, res) => {
  try {
    const { id } = req.params;
    
    const therapist = await Therapist.findByIdAndDelete(id);
    
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found' });
    }
    
    res.json({
      success: true,
      message: 'Therapist deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting therapist:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};