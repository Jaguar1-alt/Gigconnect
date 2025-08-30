const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const auth = require('../middleware/authMiddleware');
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

// ------------------- REGISTER -------------------
router.post('/register', async (req, res) => {
  const { username, email, role, uid } = req.body;
  try {
    let existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists.' });

    const newUser = new User({ username, email, role, uid });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    console.error('Registration Error:', err.message);
    res.status(500).send('Server Error during registration.');
  }
});

// ------------------- LOGIN -------------------
router.post('/login', async (req, res) => {
  const { idToken } = req.body;
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const emailVerified = decodedToken.email_verified;
    if (!emailVerified) return res.status(401).json({ message: 'Please verify your email.' });

    let user = await User.findOne({ uid });
    if (!user) return res.status(400).json({ message: 'User not found in database.' });

    const payload = { user: { id: user._id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, role: user.role });
  } catch (err) {
    console.error('Login Error:', err.message);
    if (err.code === 'auth/id-token-expired') return res.status(401).json({ message: 'Session expired.' });
    res.status(500).send('Server Error during login.');
  }
});

// ------------------- DASHBOARD (own data) -------------------
router.get('/dashboard', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-__v');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    console.error('Dashboard Error:', err.message);
    res.status(500).send('Server Error fetching dashboard.');
  }
});

// ------------------- GET OWN PROFILE -------------------
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-__v');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    console.error('Profile Error:', err.message);
    res.status(500).send('Server Error fetching profile.');
  }
});

// ------------------- UPDATE OWN PROFILE -------------------
router.put('/profile', auth, async (req, res) => {
  const { username, email, profilePicture, skills, description, portfolio, upiId } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Update freelancer-specific fields
    if (user.role === 'freelancer') {
      user.skills = skills || [];
      user.description = description || '';
      user.portfolio = portfolio || [];
      user.upiId = upiId || '';
    }

    // Update common fields
    user.username = username || user.username;
    user.email = email || user.email;
    user.profilePicture = profilePicture || user.profilePicture;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error('Profile Update Error:', err.message);
    res.status(500).send('Server Error updating profile.');
  }
});

// ------------------- GET USER BY ID (for viewing other profiles) -------------------
// @route   GET /profile/:id
// @desc    Get a specific user's profile by ID
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (err) {
    console.error('Profile Data Error:', err.message);
    res.status(500).send('Server Error fetching profile data.');
  }
});

module.exports = router;
