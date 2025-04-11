const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const Admin = require('../models/admin');

// @route   POST api/auth/admin/signup
// @desc    Register an admin
// @access  Public
router.post(
  '/signup',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { name, email, password } = req.body;

    try {
      // Check if admin already exists
      let admin = await Admin.findOne({ email });

      if (admin) {
        return res.status(400).json({ success: false, message: 'Admin already exists' });
      }

      admin = new Admin({
        name,
        email,
        password
      });

      // Password encryption is handled by the pre('save') hook in the model

      await admin.save();

      // Create JWT
      const payload = {
        admin: {
          id: admin.id,
          role: admin.role
        }
      };

      const accessToken = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '1h' }
      );

      const refreshToken = jwt.sign(
        payload,
        process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'Admin registered successfully',
        data: {
          admin: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role
          },
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      console.error('Error in admin signup:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// @route   POST api/auth/admin/login
// @desc    Authenticate admin & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    try {
      // Check if admin exists
      const admin = await Admin.findOne({ email }).select('+password');

      if (!admin) {
        return res.status(400).json({ success: false, message: 'Invalid credentials' });
      }

      // Compare password
      const isMatch = await admin.comparePassword(password);

      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid credentials' });
      }

      // Create JWT
      const payload = {
        admin: {
          id: admin.id,
          role: admin.role
        }
      };

      const accessToken = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '1h' }
      );

      const refreshToken = jwt.sign(
        payload,
        process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret',
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Admin logged in successfully',
        data: {
          admin: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role
          },
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      console.error('Error in admin login:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// @route   POST api/auth/admin/forgot-password
// @desc    Send password reset email
// @access  Public
router.post(
  '/forgot-password',
  [
    check('email', 'Please include a valid email').isEmail()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { email } = req.body;

    try {
      const admin = await Admin.findOne({ email });

      if (!admin) {
        return res.status(404).json({ success: false, message: 'Admin not found' });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(20).toString('hex');

      // Hash token and set to resetPasswordToken field
      admin.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      // Set expire time
      admin.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

      await admin.save();

      // In a real application, you would send an email with the reset token
      // For this example, we'll just return the token in the response
      res.json({
        success: true,
        message: 'Password reset token sent',
        data: {
          resetToken
        }
      });
    } catch (error) {
      console.error('Error in forgot password:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// @route   POST api/auth/admin/reset-password/:resetToken
// @desc    Reset password
// @access  Public
router.post(
  '/reset-password/:resetToken',
  [
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    try {
      const admin = await Admin.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
      });

      if (!admin) {
        return res.status(400).json({ success: false, message: 'Invalid or expired token' });
      }

      // Set new password
      admin.password = req.body.password;
      admin.resetPasswordToken = undefined;
      admin.resetPasswordExpire = undefined;
      
      await admin.save();

      res.json({
        success: true,
        message: 'Password reset successful'
      });
    } catch (error) {
      console.error('Error in reset password:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

module.exports = router;