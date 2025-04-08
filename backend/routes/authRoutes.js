// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authenticationController');
const authMiddleware = require('../middleware/authMiddleware');

// Authentication routes
router.post('/therapist/login', authController.therapistLogin);
router.post('/user/login', authController.userLogin);
router.post('/admin/login', authController.adminLogin);
router.post('/refresh-token', authController.refreshToken);

// Password management
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/change-password', authMiddleware.verifyToken, authController.changePassword);

module.exports = router;