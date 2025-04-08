// models/therapist.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Time slot schema
const timeSlotSchema = new mongoose.Schema({
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  isBooked: {
    type: Boolean,
    default: false
  }
});

// Daily availability schema
const availabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    required: true
  },
  slots: [timeSlotSchema]
});

// Review schema
const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: String,
  date: {
    type: Date,
    default: Date.now
  }
});

// Therapist schema
const therapistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  phone: String,
  imageUrl: String,
  bio: String,
  specialties: [String],
  sessionCost: {
    type: Number,
    default: 0
  },
  location: String,
  languages: [String],
  therapyModes: [String],
  availability: [availabilitySchema],
  rating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  reviews: [reviewSchema],
  isApproved: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
therapistSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
therapistSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full profile
therapistSchema.virtual('fullProfile').get(function() {
  return {
    id: this._id,
    name: this.name,
    title: this.title,
    imageUrl: this.imageUrl,
    bio: this.bio,
    specialties: this.specialties,
    sessionCost: this.sessionCost,
    location: this.location,
    languages: this.languages,
    therapyModes: this.therapyModes,
    availability: this.availability,
    rating: this.rating,
    reviewCount: this.reviewCount,
    reviews: this.reviews
  };
});

// Virtual for list profile (less data)
therapistSchema.virtual('listProfile').get(function() {
  return {
    id: this._id,
    name: this.name,
    title: this.title,
    imageUrl: this.imageUrl,
    specialties: this.specialties,
    sessionCost: this.sessionCost,
    location: this.location,
    rating: this.rating,
    reviewCount: this.reviewCount
  };
});

module.exports = mongoose.model('Therapist', therapistSchema);