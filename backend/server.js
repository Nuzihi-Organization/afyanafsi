const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
// Import any other route files you have

// Load environment variables
dotenv.config();

// Initialize express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Define a route for the root path
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to AfyaNafsi API',
    status: 'Server is running',
    version: '1.0.0'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth/admin', require('./routes/adminAuthRoutes')); // New admin routes
app.use('/api/auth/therapist', require('./routes/therapistRoutes')); // New therapist routes
// Use any other route files you have

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// 404 handler - must be after all other routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });


// generate JWT_SECRET
//   const crypto = require('crypto');
// const jwtrefreshSecret = crypto.randomBytes(64).toString('hex');
// console.log(jwtrefreshSecret);