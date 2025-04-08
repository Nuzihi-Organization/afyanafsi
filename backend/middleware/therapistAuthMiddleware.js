// middlewares/authMiddleware.js
  
const jwt = require('jsonwebtoken');
const Therapist = require('../models/therapist');
const User = require('../models/user');
const Admin = require('../models/admin');

exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Add user info to request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };
      
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Restrict routes based on roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

// Verify account status for therapists
exports.verifyTherapistStatus = async (req, res, next) => {
  try {
    // Only apply to therapist routes
    if (req.user.role !== 'therapist') {
      return next();
    }
    
    const therapist = await Therapist.findById(req.user.id);
    
    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: 'Therapist not found'
      });
    }
    
    // Check if approved
    if (!therapist.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending approval'
      });
    }
    
    // Check if active
    if (!therapist.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }
    
    next();
  } catch (error) {
    console.error('Verify therapist status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    let user;
    let Model;
    const { role, id } = req.user;
    
    // Find user based on role
    switch (role) {
      case 'therapist':
        Model = Therapist;
        break;
      case 'user':
        Model = User;
        break;
      case 'admin':
        Model = Admin;
        break;
      default:
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid role' 
        });
    }
    
    user = await Model.findById(id).select('-password -resetPasswordToken -resetPasswordExpire');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        ...user._doc,
        role
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};