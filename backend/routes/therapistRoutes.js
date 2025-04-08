const express = require('express');
const Therapist = require('../models/therapist');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Get all therapists
router.get('/', async (req, res) => {
  try {
    const therapists = await Therapist.find({});
    res.json(therapists);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get filtered therapists
router.post('/filter', async (req, res) => {
  try {
    const { location, modes, types } = req.body;
    
    let query = {};
    
    if (location) {
      query.location = location;
    }
    
    if (modes && modes.length > 0) {
      query.therapyModes = { $in: modes };
    }
    
    if (types && types.length > 0) {
      query.therapyTypes = { $in: types };
    }
    
    const therapists = await Therapist.find(query);
    res.json(therapists);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get therapist details
router.get('/:id', async (req, res) => {
  try {
    const therapist = await Therapist.findById(req.params.id);
    if (therapist) {
      res.json(therapist);
    } else {
      res.status(404).json({ message: 'Therapist not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get therapist availability
router.get('/:id/availability', async (req, res) => {
  try {
    const therapist = await Therapist.findById(req.params.id);
    if (therapist) {
      res.json(therapist.availability);
    } else {
      res.status(404).json({ message: 'Therapist not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;