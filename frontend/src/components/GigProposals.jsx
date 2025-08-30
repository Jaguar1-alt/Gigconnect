import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const GigProposals = () => {
  const [gig, setGig] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const token = localStorage.getItem('token');
  const { id } = useParams();

  useEffect(() => {
    const fetchGigDetailsAndProposals = async () => {
      try {
        const gigResponse = await axios.get(`http://localhost:5000/api/gigs/${id}`);
        setGig(gigResponse.data);

        setLoadingProposals(true);
        const proposalsResponse = await axios.get(`http://localhost:5000/api/gigs/${id}/proposals`, {
          headers: { 'x-auth-token': token },
        });
        setProposals(proposalsResponse.data);
      } catch (err) {
        console.error('Failed to fetch gig details or proposals:', err);
      } finally {
        setLoadingProposals(false);
      }
    };
    fetchGigDetailsAndProposals();
  }, [id, token]);

  const handleProposalAction = async (proposalId, action) => {
    try {
      const endpoint = `http://localhost:5000/api/gigs/${id}/proposals/${proposalId}/${action}`;
      await axios.put(endpoint, {}, {
        headers: { 'x-auth-token': token },
      });
      alert(`Proposal ${action} successfully!`);
      const updatedGigResponse = await axios.get(`http://localhost:5000/api/gigs/${id}`);
      const updatedProposalsResponse = await axios.get(`http://localhost:5000/api/gigs/${id}/proposals`, {
        headers: { 'x-auth-token': token },
      });
      setGig(updatedGigResponse.data);
      setProposals(updatedProposalsResponse.data);
    } catch (err) {
      console.error(`Failed to ${action} proposal:`, err);
      alert(`Failed to ${action} proposal.`);
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
    return <div style={{ textAlign: 'center', marginTop: '20px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: 'auto' }}>
      <h2>{gig.title}</h2>
      <p><strong>Description:</strong> {gig.description}</p>
      <p><strong>Posted By:</strong> <Link to={`/profile/${gig.postedBy._id}`}>{gig.postedBy.username}</Link></p>
      
      {gig.status === 'in progress' && gig.hiredFreelancer && (
        <p><strong>Done By:</strong> <Link to={`/profile/${gig.hiredFreelancer._id}`}>{gig.hiredFreelancer.username}</Link></p>
      )}

      <p><strong>Budget:</strong> ₹{gig.budget}</p>
      {gig.status !== 'open' && (
        <p><strong>Final Amount:</strong> ₹{gig.finalAmount}</p>
      )}

      <p><strong>Status:</strong> {gig.status}</p>

      {gig.status === 'in progress' && (
        <button onClick={() => handleGigStatusUpdate('complete')} style={{ marginTop: '10px', padding: '8px 15px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Mark as Complete
        </button>
      )}

      {gig.status === 'completed' && (
        <button onClick={() => handleGigStatusUpdate('paid')} style={{ marginTop: '10px', padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Mark as Paid
        </button>
      )}

      {gig.status === 'paid' && (
        <Link to={`/gig/${gig._id}/review`} style={{ marginTop: '10px', padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', textDecoration: 'none' }}>
          Leave a Review
        </Link>
      )}

      <h3 style={{ marginTop: '30px' }}>Freelancer Proposals ({proposals.length})</h3>
      {loadingProposals ? (
        <p>Loading proposals...</p>
      ) : proposals.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {proposals.map(proposal => (
            <li key={proposal._id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px', borderRadius: '8px' }}>
              <p><strong>Freelancer:</strong> <Link to={`/profile/${proposal.freelancer._id}`}>{proposal.freelancer.username}</Link></p>
              <p><strong>Bid Amount:</strong> ₹{proposal.bidAmount}</p>
              <p><strong>Message:</strong> {proposal.message}</p>
              
              {gig.status === 'open' && (
                <div style={{ marginTop: '10px' }}>
                  <button onClick={() => handleProposalAction(proposal._id, 'accept')} style={{ marginRight: '10px', padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Accept</button>
                  <button onClick={() => handleProposalAction(proposal._id, 'reject')} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reject</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No proposals submitted yet.</p>
      )}
    </div>
  );
};
export default GigProposals;