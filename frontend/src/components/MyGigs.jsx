import React, { useState, useEffect } from 'react'; 
import axios from 'axios'; 
import { Link, useNavigate } from 'react-router-dom'; 
import './MyGigs.css'; // LinkedIn-style CSS

const MyGigs = () => { 
  const [gigs, setGigs] = useState([]); 
  const [proposals, setProposals] = useState({}); 
  const [loadingProposals, setLoadingProposals] = useState(false); 
  const [showProposals, setShowProposals] = useState({}); 
  const token = localStorage.getItem('token'); 
  const role = localStorage.getItem('role'); 
  const navigate = useNavigate();

  const fetchMyGigs = async () => { 
    try { 
      if (role !== 'client') return; 
      const response = await axios.get('http://localhost:5000/api/gigs/mygigs', { 
        headers: { 'x-auth-token': token }, 
      }); 
      setGigs(response.data); 
    } catch (err) { 
      console.error('Failed to fetch my gigs:', err); 
    } 
  }; 

  const fetchProposalsForGig = async (gigId) => { 
    setLoadingProposals(true); 
    try { 
      const response = await axios.get(`http://localhost:5000/api/gigs/${gigId}/proposals`, { 
        headers: { 'x-auth-token': token }, 
      }); 
      setProposals(prev => ({ ...prev, [gigId]: response.data })); 
    } catch (err) { 
      console.error('Failed to fetch proposals:', err); 
    } finally { 
      setLoadingProposals(false); 
    } 
  }; 
   
  const handleProposalAction = async (gigId, proposalId, action) => { 
    try { 
      const endpoint = `http://localhost:5000/api/gigs/${gigId}/proposals/${proposalId}/${action}`; 
      await axios.put(endpoint, {}, { headers: { 'x-auth-token': token } }); 
      alert(`Proposal ${action} successfully!`); 
      fetchMyGigs(); 
      fetchProposalsForGig(gigId); 
    } catch (err) { 
      console.error(`Failed to ${action} proposal:`, err); 
      alert(`Failed to ${action} proposal.`); 
    } 
  }; 
   
  const handleGigStatusUpdate = async (gigId, newStatus) => { 
    try { 
      await axios.put(`http://localhost:5000/api/gigs/${gigId}/${newStatus}`, {}, { headers: { 'x-auth-token': token } }); 
      alert(`Gig status updated to ${newStatus}!`); 
      fetchMyGigs(); 
    } catch (err) { 
      console.error(`Failed to update gig status:`, err); 
      alert(`Failed to update gig status.`); 
    } 
  }; 

  const toggleProposals = (gigId) => { 
    setShowProposals(prev => ({ ...prev, [gigId]: !prev[gigId] })); 
    if (!proposals[gigId]) fetchProposalsForGig(gigId); 
  }; 

  useEffect(() => { fetchMyGigs(); }, [token, role]); 

  return (
    <div className="mygigs-page">
      <div className="mygigs-container">
        <h2>My Posted Gigs</h2>
        {gigs.length > 0 ? (
          <div className="mygigs-list">
            {gigs.map((gig) => (
              <div key={gig._id} className={`gig-card fade-in ${gig.status.replace(' ', '-')}`}>
                <div className="gig-info">
                  <h3>{gig.title}</h3>
                  <p>Budget: ₹{gig.budget}</p>
                  <p>Status: <span className={`gig-status ${gig.status.replace(' ', '-')}`}>{gig.status}</span></p>
                  {gig.hiredFreelancer && (
                    <p>
                      Hired Freelancer: 
                      <Link to={`/profile/${gig.hiredFreelancer._id}`} className="freelancer-link">
                        {gig.hiredFreelancer.username}
                      </Link>
                    </p>
                  )}
                </div>

                <div className="gig-actions">
                  {role === 'client' && gig.status === 'open' && (
                    <>
                      <Link to={`/gig/${gig._id}`} className="action-btn view">View Gig</Link>
                      <button onClick={() => toggleProposals(gig._id)} className="action-btn proposals">
                        {showProposals[gig._id] ? 'Hide Proposals' : 'View Proposals'}
                      </button>
                    </>
                  )}
                  {gig.status === 'in progress' && gig.hiredFreelancer && (
                    <>
                      <button onClick={() => handleGigStatusUpdate(gig._id, 'complete')} className="action-btn complete">Mark as Complete</button>
                      <Link to={`/message/${gig._id}/${gig.hiredFreelancer._id}`} className="action-btn message">Message Freelancer</Link>
                    </>
                  )}
                  {gig.status === 'completed' && (
                    <button onClick={() => navigate(`/checkout/${gig._id}`)} className="action-btn payment">Proceed to Payment</button>
                  )}
                  {gig.status === 'paid' && (
                    <Link to={`/gig/${gig._id}/review`} className="action-btn review">Leave a Review</Link>
                  )}
                </div>

                {loadingProposals && <p className="loading-text">Loading proposals...</p>}
                {showProposals[gig._id] && (
                  <div className="proposals-container">
                    {proposals[gig._id] && proposals[gig._id].length > 0 ? (
                      proposals[gig._id].map(proposal => (
                        <div key={proposal._id} className="proposal-card fade-in">
                          <p>
                            Freelancer: 
                            <Link to={`/profile/${proposal.freelancer._id}`} className="freelancer-link">
                              {proposal.freelancer.username}
                            </Link>
                          </p>
                          <p>Bid Amount: ₹{proposal.bidAmount}</p>
                          <p>Message: {proposal.message}</p>
                          <div className="proposal-actions">
                            <button onClick={() => handleProposalAction(gig._id, proposal._id, 'accept')} className="action-btn accept">Accept</button>
                            <button onClick={() => handleProposalAction(gig._id, proposal._id, 'reject')} className="action-btn reject">Reject</button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="no-proposals">No proposals submitted yet.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="no-proposals">You have not posted any gigs yet. <Link to="/post-gig">Post one now</Link>!</p>
        )}
      </div>
    </div>
  );
};

export default MyGigs;
