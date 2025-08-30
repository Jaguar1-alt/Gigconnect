

const express = require('express');
const router = express.Router();
const Gig = require('../models/gigModel');
const Proposal = require('../models/proposalModel');
const Review = require('../models/reviewModel');
const auth = require('../middleware/authMiddleware');

router.get('/all', async (req, res) => {
  try {
    const { skills, location, budget } = req.query;
    let filter = { status: 'open' };
    if (skills) filter.skills = { $in: skills.split(',') };
    if (location) filter.location = { $regex: new RegExp(location, 'i') };
    if (budget) filter.budget = { $lte: parseInt(budget) };
    const gigs = await Gig.find(filter).sort({ postedAt: -1 });
    res.json(gigs);
  } catch (err) {
    console.error('Browse Gigs Error:', err.message);
    res.status(500).send('Server Error fetching gigs.');
  }
});
router.get('/mygigs', auth, async (req, res) => {
  try {
    if (req.user.role !== 'client') return res.status(403).json({ message: 'Only clients can view their posted gigs.' });
    const gigs = await Gig.find({ postedBy: req.user.id }).sort({ postedAt: -1 }).populate('hiredFreelancer', 'username profilePicture');
    res.json(gigs);
  } catch (err) {
    console.error('My Gigs Error:', err.message);
    res.status(500).send('Server Error fetching gigs.');
  }
});
router.get('/applied', auth, async (req, res) => {
  try {
    const proposals = await Proposal.find({ freelancer: req.user.id }).populate('gig', 'title postedBy').populate({
      path: 'gig',
      populate: { path: 'postedBy', select: 'username profilePicture' }
    });
    if (!proposals) return res.status(404).json({ message: 'No proposals found for this freelancer.' });
    res.json(proposals);
  } catch (err) {
    console.error('Applied Gigs Error:', err.message);
    res.status(500).send('Server Error fetching applied gigs.');
  }
});
router.get('/proposals/check/:gigId', auth, async (req, res) => {
  try {
    const proposal = await Proposal.findOne({ gig: req.params.gigId, freelancer: req.user.id });
    res.json({ hasApplied: !!proposal });
  } catch (err) {
    console.error('Proposal Check Error:', err.message);
    res.status(500).send('Server Error checking proposal status.');
  }
});
router.get('/hired-freelancers', auth, async (req, res) => {
  try {
    if (req.user.role !== 'client') return res.status(403).json({ message: 'Only clients can view hired freelancers.' });
    const gigs = await Gig.find({ postedBy: req.user.id, status: 'in progress' }).populate('hiredFreelancer', 'username profilePicture');
    res.json(gigs);
  } catch (err) {
    console.error('Hired Freelancers Error:', err.message);
    res.status(500).send('Server Error fetching hired freelancers.');
  }
});
router.get('/freelancer/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ freelancer: req.params.id })
      .populate('client', 'username profilePicture');
    res.json(reviews);
  } catch (err) {
    console.error('Freelancer Reviews Error:', err.message);
    res.status(500).send('Server Error fetching freelancer reviews.');
  }
});
router.get('/:id', async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id).populate('postedBy', 'username profilePicture').populate('hiredFreelancer', 'username profilePicture');
    if (!gig) return res.status(404).json({ message: 'Gig not found.' });
    res.json(gig);
  } catch (err) {
    console.error('Gig Details Error:', err.message);
    res.status(500).send('Server Error fetching gig details.');
  }
});
router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ gig: req.params.id }).populate('client', 'username profilePicture').populate('freelancer', 'username profilePicture');
    res.json(reviews);
  } catch (err) {
    console.error('Fetch Reviews Error:', err.message);
    res.status(500).send('Server Error fetching reviews.');
  }
});
router.post('/', auth, async (req, res) => {
  const { title, description, budget, duration, skills, location } = req.body;
  try {
    if (req.user.role !== 'client') return res.status(403).json({ message: 'Only clients can post gigs.' });
    const newGig = new Gig({ title, description, budget, duration, skills, location, postedBy: req.user.id });
    const gig = await newGig.save();
    res.status(201).json(gig);
  } catch (err) {
    console.error('Gig Posting Error:', err.message);
    res.status(500).send('Server Error posting gig.');
  }
});
router.post('/:id/proposals', auth, async (req, res) => {
  const { bidAmount, message } = req.body;
  const gigId = req.params.id;
  try {
    if (req.user.role !== 'freelancer') return res.status(403).json({ message: 'Only freelancers can submit proposals.' });
    const existingProposal = await Proposal.findOne({ gig: gigId, freelancer: req.user.id });
    if (existingProposal) return res.status(400).json({ message: 'You have already submitted a proposal for this gig.' });
    const newProposal = new Proposal({ gig: gigId, freelancer: req.user.id, bidAmount: parseInt(bidAmount, 10), message });
    const proposal = await newProposal.save();
    res.status(201).json(proposal);
  } catch (err) {
    console.error('Proposal Submission Error:', err.message);
    res.status(500).send('Server Error submitting proposal.');
  }
});

// @route   GET /:id/proposals
// @desc    Client gets all pending proposals for their gig
router.get('/:id/proposals', auth, async (req, res) => {
  const gigId = req.params.id;
  try {
    const gig = await Gig.findById(gigId);
    if (!gig || gig.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view these proposals.' });
    }
    const proposals = await Proposal.find({ gig: gigId, status: 'pending' }).populate('freelancer', 'username profilePicture');
    res.json(proposals);
  } catch (err) {
    console.error('Proposal Fetch Error:', err.message);
    res.status(500).send('Server Error fetching proposals.');
  }
});

router.put('/:gigId/proposals/:proposalId/accept', auth, async (req, res) => {
  const { gigId, proposalId } = req.params;
  try {
    const gig = await Gig.findById(gigId);
    if (!gig || gig.postedBy.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized to accept proposals for this gig.' });
    if (gig.status !== 'open') return res.status(400).json({ message: 'Gig is not open for proposals.' });
    const proposal = await Proposal.findById(proposalId);
    if (!proposal || proposal.gig.toString() !== gigId) return res.status(404).json({ message: 'Proposal not found.' });
    gig.status = 'in progress'; gig.hiredFreelancer = proposal.freelancer; gig.finalAmount = proposal.bidAmount; await gig.save();
    proposal.status = 'accepted'; await proposal.save();
    res.status(200).json({ message: 'Proposal accepted successfully.' });
  } catch (err) {
    console.error('Proposal Acceptance Error:', err.message);
    res.status(500).send('Server Error accepting proposal.');
  }
});

router.put('/:gigId/proposals/:proposalId/reject', auth, async (req, res) => {
  const { gigId, proposalId } = req.params;
  try {
    const gig = await Gig.findById(gigId);
    if (!gig || gig.postedBy.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized to reject proposals for this gig.' });
    if (gig.status !== 'open') return res.status(400).json({ message: 'Gig is not open for proposals.' });
    const proposal = await Proposal.findById(proposalId);
    if (!proposal || proposal.gig.toString() !== gigId) return res.status(404).json({ message: 'Proposal not found.' });
    proposal.status = 'rejected'; await proposal.save();
    res.status(200).json({ message: 'Proposal rejected successfully.' });
  } catch (err) {
    console.error('Proposal Rejection Error:', err.message);
    res.status(500).send('Server Error rejecting proposal.');
  }
});

router.put('/:id/complete', auth, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig || gig.postedBy.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized to complete this gig.' });
    if (gig.status !== 'in progress') return res.status(400).json({ message: 'Gig is not in progress.' });
    gig.status = 'completed'; await gig.save();
    res.status(200).json({ message: 'Gig marked as completed.' });
  } catch (err) {
    console.error('Gig Completion Error:', err.message);
    res.status(500).send('Server Error completing gig.');
  }
});

router.put('/:id/paid', auth, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig || gig.postedBy.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized to mark this gig as paid.' });
    if (gig.status !== 'completed') return res.status(400).json({ message: 'Gig is not completed yet.' });
    gig.status = 'paid'; await gig.save();
    res.status(200).json({ message: 'Gig marked as paid.' });
  } catch (err) {
    console.error('Gig Paid Error:', err.message);
    res.status(500).send('Server Error marking gig as paid.');
  }
});

router.post('/:id/review', auth, async (req, res) => {
  const { rating, comment } = req.body;
  const gigId = req.params.id;
  try {
    const gig = await Gig.findById(gigId);
    if (!gig || gig.status !== 'paid') return res.status(400).json({ message: 'Cannot leave a review for this gig.' });
    if (gig.postedBy.toString() !== req.user.id && gig.hiredFreelancer.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized to leave a review for this gig.' });
    const existingReview = await Review.findOne({ gig: gigId });
    if (existingReview) return res.status(400).json({ message: 'A review for this gig already exists.' });
    const newReview = new Review({ gig: gigId, client: gig.postedBy, freelancer: gig.hiredFreelancer, rating, comment });
    await newReview.save();
    res.status(201).json({ message: 'Review submitted successfully.' });
  } catch (err) {
    console.error('Review Submission Error:', err.message);
    res.status(500).send('Server Error submitting review.');
  }
});

router.get('/hired-freelancers', auth, async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ message: 'Only clients can view hired freelancers.' });
    }
    const gigs = await Gig.find({ postedBy: req.user.id, status: 'in progress' }).populate('hiredFreelancer', 'username profilePicture');
    res.json(gigs);
  } catch (err) {
    console.error('Hired Freelancers Error:', err.message);
    res.status(500).send('Server Error fetching hired freelancers.');
  }
});
// backend/routes/gigRoutes.js

// ... (your existing routes)

// @route   GET /:id/checkout-details
// @desc    Get details for the checkout page
router.get('/:id/checkout-details', auth, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id)
      .populate('postedBy', 'username')
      .populate('hiredFreelancer', 'username');
    
    if (!gig) return res.status(404).json({ message: 'Gig not found.' });

    const acceptedProposal = await Proposal.findOne({ 
      gig: req.params.id, 
      status: 'accepted' 
    }).populate('freelancer', 'username');

    if (!acceptedProposal) {
      return res.status(404).json({ message: 'No accepted proposal found for this gig.' });
    }

    res.json({
      gigDetails: gig,
      bidAmount: acceptedProposal.bidAmount,
      freelancerName: acceptedProposal.freelancer.username,
    });
  } catch (err) {
    console.error('Checkout Details Error:', err.message);
    res.status(500).send('Server Error fetching checkout details.');
  }
});
// GET /gigs/client/stats
router.get('/client/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'client') return res.status(403).json({ message: 'Only clients can access stats.' });

    const gigs = await Gig.find({ postedBy: req.user.id });
    const stats = {
      completed: gigs.filter(g => g.status === 'completed' || g.status === 'paid').length,
      active: gigs.filter(g => g.status === 'open').length,
      inProgress: gigs.filter(g => g.status === 'in progress').length,
    };

    res.json(stats);
  } catch (err) {
    console.error('Client Stats Error:', err.message);
    res.status(500).send('Server Error fetching client stats.');
  }
});

// GET /gigs/freelancer/stats
router.get('/freelancer/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'freelancer') return res.status(403).json({ message: 'Only freelancers can access stats.' });

    const proposals = await Proposal.find({ freelancer: req.user.id }).populate('gig');
    const completedGigs = proposals.filter(p => p.gig && (p.gig.status === 'completed' || p.gig.status === 'paid'));
    const inProgressGigs = proposals.filter(p => p.gig && p.gig.status === 'in progress');

    const earnings = completedGigs.reduce((sum, p) => sum + (p.gig.finalAmount || 0), 0);

    const stats = {
      completed: completedGigs.length,
      inProgress: inProgressGigs.length,
      earnings,
    };

    res.json(stats);
  } catch (err) {
    console.error('Freelancer Stats Error:', err.message);
    res.status(500).send('Server Error fetching freelancer stats.');
  }
});

module.exports = router;

