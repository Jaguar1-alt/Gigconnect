const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  gig: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bidAmount: { type: Number, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  appliedAt: { type: Date, default: Date.now },
});
const Proposal = mongoose.model('Proposal', proposalSchema);
module.exports = Proposal;