const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  imageUrl: {
    type: String,
    default: ''
  },
  preferences: {
    location: { type: String, default: '' },
    therapyMode: { type: String, default: 'both' }, // 'online', 'in-person', 'both'
    therapyType: { type: String, default: '' },
    languagePreference: { type: String, default: 'English' }
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt before saving
UserSchema.pre('save', async function(next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with stored hashed password
UserSchema.methods.comparePassword = async function (enteredPassword) {
  // Defensive check to ensure both values exist
  if (!enteredPassword || !this.password) {
    return false;
  }
  
  return await bcrypt.compare(enteredPassword, this.password);
};


// Add matchPassword method as an alias to comparePassword for backward compatibility
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await this.comparePassword(enteredPassword);
};

module.exports = mongoose.model('User', UserSchema);