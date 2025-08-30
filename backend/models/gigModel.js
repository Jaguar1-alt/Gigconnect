const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number, required: true },
  duration: { type: String, required: true },
  skills: { type: [String], required: true },
  location: { type: String, required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hiredFreelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['open', 'in progress', 'completed', 'paid'], default: 'open' },
  finalAmount: { type: Number, default: null },
  postedAt: { type: Date, default: Date.now },
});
const Gig = mongoose.model('Gig', gigSchema);
module.exports = Gig;