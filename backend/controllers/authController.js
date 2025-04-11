// controllers/authController.js
const Therapist = require('../models/therapist');
const User = require('../models/user');
const Admin = require('../models/admin');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
// const sendEmail = require('../utils/mailingService');
const nodemailer = require('nodemailer');

// Generate tokens
const generateTokens = (user, role) => {
  const accessToken = jwt.sign(
    { id: user._id, email: user.email, role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  const refreshToken = jwt.sign(
    { id: user._id, role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

// Email sending function
const sendEmail = async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: process.env.SMTP_PORT || 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  // Define email options
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'tech@nuzihi.org',
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  // Send email
  const info = await transporter.sendMail(mailOptions);
  console.log('Email sent: ', info.messageId);
  
  return info;
};


// Therapist login
exports.therapistLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find therapist
    const therapist = await Therapist.findOne({ email });
    
    if (!therapist) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Verify password
    const isMatch = await therapist.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
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
    
    // Generate tokens
    const tokens = generateTokens(therapist, 'therapist');
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: therapist._id,
          name: therapist.name,
          email: therapist.email,
          role: 'therapist',
          imageUrl: therapist.imageUrl
        },
        ...tokens
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// User login
// User login
exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user - explicitly selecting the password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Verify password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Generate tokens
    const tokens = generateTokens(user, 'user');
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: 'user',
          imageUrl: user.imageUrl
        },
        ...tokens
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// Admin login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find admin
    const admin = await Admin.findOne({ email }).select('+password');

if (!admin || !admin.password) {
  return res.status(400).json({ success: false, message: 'Invalid credentials' });
}
    
    // Verify password
    const isMatch = await admin.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Generate tokens
    const tokens = generateTokens(admin, 'admin');
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: 'admin'
        },
        ...tokens
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'Refresh token required' 
      });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const { id, role } = decoded;
    
    // Find user based on role
    let user;
    
    switch (role) {
      case 'therapist':
        user = await Therapist.findById(id);
        break;
      case 'user':
        user = await User.findById(id);
        break;
      case 'admin':
        user = await Admin.findById(id);
        break;
      default:
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid token' 
        });
    }
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Generate new tokens
    const tokens = generateTokens(user, role);
    
    res.json({
      success: true,
      data: tokens
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Forgot password

    
// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email, role } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }
    
    // Find user based on role
    let user;
    let Model;
    
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
    
    user = await Model.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token and set to resetPasswordToken field
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Set expire time (30 minutes)
    const resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    
    // Update user
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save({ validateBeforeSave: false });
    
    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/${role}/reset-password/${resetToken}`;
    
    // Create message
    const message = `
      You requested a password reset. Please go to this link to reset your password:
      \n\n${resetUrl}\n\n
      This link is valid for 30 minutes. If you didn't request this, please ignore this email.
    `;
    
    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        message
      });
      
      res.status(200).json({
        success: true,
        message: 'Password reset email sent'
      });
    } catch (error) {
      console.error('Email sending error:', error);
      
      // If email fails, reset the token fields
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      
      return res.status(500).json({
        success: false,
        message: 'Email could not be sent'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { role, token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and password are required'
      });
    }
    
    // Hash token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user based on role
    let Model;
    
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
    
    // Find user with token and not expired
    const user = await Model.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    
    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, userId, role } = req.body;
    
    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    // Verify user ID from token matches requested userId
    if (req.user && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    // Find user based on role
    let user;
    let Model;
    
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
    
    user = await Model.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user has a password (might be undefined in some cases)
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'Account requires password reset. Use forgot password instead.'
      });
    }
    
    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Set new password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
  
  // Logout
  exports.logout = async (req, res) => {
    // Since we're using JWT, we don't need to do anything server-side for logout
    // The client should delete the tokens from local storage
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  };
  
  
  