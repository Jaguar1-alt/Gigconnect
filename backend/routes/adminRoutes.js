const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const Gig = require('../models/gigModel');
const auth = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminMiddleware');

// @route   GET /admin/stats
// @desc    Get platform statistics (Admin only)
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalGigs = await Gig.countDocuments();
    const openGigs = await Gig.countDocuments({ status: 'open' });
    const inProgressGigs = await Gig.countDocuments({ status: 'in progress' });
    
    res.json({ totalUsers, totalGigs, openGigs, inProgressGigs });
  } catch (err) {
    console.error('Admin Stats Error:', err.message);
    res.status(500).send('Server Error fetching platform stats.');
  }
});

// @route   GET /admin/payouts
// @desc    Get all gigs ready for payout (Admin only)
router.get('/payouts', auth, adminAuth, async (req, res) => {
  try {
    const gigs = await Gig.find({ status: 'paid' }).populate('hiredFreelancer', 'username upiId');
    res.json(gigs);
  } catch (err) {
    console.error('Admin Payouts Error:', err.message);
    res.status(500).send('Server Error fetching payouts.');
  }
});

// @route   PUT /admin/payouts/:id
// @desc    Process a payout for a gig (Admin only)
router.put('/payouts/:id', auth, adminAuth, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig || gig.status !== 'paid') {
      return res.status(400).json({ message: 'Gig is not ready for payout.' });
    }
    
    console.log(`Processing payout for gig ID: ${gig._id}. Amount: ${gig.finalAmount}`);
    await Gig.findByIdAndUpdate(req.params.id, { status: 'paid-out' });
    
    res.status(200).json({ message: 'Payout processed successfully.' });
  } catch (err) {
    console.error('Admin Process Payout Error:', err.message);
    res.status(500).send('Server Error processing payout.');
  }
});

// @route   GET /admin/users
// @desc    Get all users (Admin only)
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-uid');
    res.json(users);
  } catch (err) {
    console.error('Admin Users Error:', err.message);
    res.status(500).send('Server Error fetching users.');
  }
});

// @route   GET /admin/gigs
// @desc    Get all gigs (Admin only)
router.get('/gigs', auth, adminAuth, async (req, res) => {
  try {
    const gigs = await Gig.find();
    res.json(gigs);
  } catch (err) {
    console.error('Admin Gigs Error:', err.message);
    res.status(500).send('Server Error fetching gigs.');
  }
});

// @route   DELETE /admin/users/:id
// @desc    Delete a user (Admin only)
router.delete('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error('Admin Delete User Error:', err.message);
    res.status(500).send('Server Error deleting user.');
  }
});

// @route   DELETE /admin/gigs/:id
// @desc    Delete a gig (Admin only)
router.delete('/gigs/:id', auth, adminAuth, async (req, res) => {
  try {
    const gig = await Gig.findByIdAndDelete(req.params.id);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found.' });
    }
    res.json({ message: 'Gig deleted successfully.' });
  } catch (err) {
    console.error('Admin Delete Gig Error:', err.message);
    res.status(500).send('Server Error deleting gig.');
  }
});

module.exports = router;