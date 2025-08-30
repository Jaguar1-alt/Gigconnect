import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './GigDetails.css'; // Import the new CSS file

const GigDetails = () => {
  const [gig, setGig] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [message, setMessage] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  const { id } = useParams();
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setCurrentUserId(decodedToken.user.id);
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }

    const fetchGigDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/gigs/${id}`);
        setGig(response.data);
      } catch (err) {
        console.error('Failed to fetch gig details:', err);
      }
    };
    fetchGigDetails();

    const checkIfApplied = async () => {
      if (!token || role !== 'freelancer') return;
      try {
        const response = await axios.get(`http://localhost:5000/api/gigs/proposals/check/${id}`, {
          headers: { 'x-auth-token': token }
        });
        setHasApplied(response.data.hasApplied);
      } catch (err) {
        console.error('Failed to check if applied:', err);
      }
    };
    checkIfApplied();
  }, [id, token, role]);

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://localhost:5000/api/gigs/${id}/proposals`,
        { bidAmount, message },
        { headers: { 'x-auth-token': token }
      });
      alert('Proposal submitted successfully!');
      setHasApplied(true);
    } catch (err) {
      console.error('Proposal submission failed:', err.response.data);
      alert('Failed to submit proposal.');
    }
  };
  
  const handleGigStatusUpdate = async (newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/gigs/${id}/${newStatus}`, {}, {
        headers: { 'x-auth-token': token },
      });
      alert(`Gig status updated to ${newStatus}!`);
      const updatedGigResponse = await axios.get(`http://localhost:5000/api/gigs/${id}`);
      setGig(updatedGigResponse.data);
    } catch (err) {
      console.error(`Failed to update gig status:`, err);
      alert(`Failed to update gig status.`);
    }
  };

  if (!gig) {
    return <div>Loading gig details...</div>;
  }
  
  const isFreelancerNotClient = role === 'freelancer' && gig.postedBy._id !== currentUserId;
  const showProposalForm = isFreelancerNotClient && gig.status === 'open' && !hasApplied;
  const isHiredFreelancer = gig.status === 'in progress' && gig.hiredFreelancer && gig.hiredFreelancer._id === currentUserId;

  return (
    <div className="gig-details-overlay">
      <div className="gig-details-card">
        <button className="close-btn" onClick={() => navigate(-1)}>×</button>

        <h2>{gig.title}</h2>
        <p>
          <strong>Posted By:</strong> 
          <Link to={`/profile/${gig.postedBy._id}`} className="user-link">
            {gig.postedBy.username}
          </Link>
        </p>
        
        {gig.status !== 'open' && gig.hiredFreelancer && (
          <p>
            <strong>Done By:</strong> 
            <Link to={`/profile/${gig.hiredFreelancer._id}`} className="user-link">
              {gig.hiredFreelancer.username}
            </Link>
          </p>
        )}

        <p><strong>Description:</strong> {gig.description}</p>
        <p><strong>Budget:</strong> ₹{gig.budget}</p>
        <p><strong>Duration:</strong> {gig.duration}</p>
        <p><strong>Location:</strong> {gig.location}</p>
        <p><strong>Skills Required:</strong> {gig.skills.join(', ')}</p>
        <p>
          <strong>Status:</strong>{' '}
          <span className={`gig-status ${gig.status.toLowerCase().replace(' ', '-')}`}>
            {gig.status}
          </span>
        </p>

        {showProposalForm ? (
          <div className="proposal-form">
            <h3>Submit a Proposal</h3>
            <form onSubmit={handleProposalSubmit}>
              <input 
                type="number" 
                value={bidAmount} 
                onChange={(e) => setBidAmount(e.target.value)} 
                placeholder="Your Bid Amount" 
                required 
              />
              <textarea 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                placeholder="Your message to the client" 
                required
              ></textarea>
              <button type="submit" className="submit-btn">Submit Proposal</button>
            </form>
          </div>
        ) : isHiredFreelancer ? (
          <Link to={`/message/${gig._id}/${gig.postedBy._id}`} className="message-btn">
            Message Client
          </Link>
        ) : hasApplied && (
          <p className="already-applied">You have already submitted a proposal for this gig.</p>
        )}
      </div>
    </div>
  );
};

export default GigDetails;
