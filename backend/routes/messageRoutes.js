const express = require('express');
const router = express.Router();
const Message = require('../models/messageModel');
const auth = require('../middleware/authMiddleware');

router.get('/:gigId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ gig: req.params.gigId })
      .populate('sender', 'username')
      .populate('recipient', 'username')
      .sort('sentAt');
    res.json(messages);
  } catch (err) {
    console.error('Fetch Messages Error:', err.message);
    res.status(500).send('Server Error fetching messages.');
  }
});
module.exports = router;