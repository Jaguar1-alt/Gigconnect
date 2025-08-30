import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import './AdminDashboard.css'; // Import CSS

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [gigs, setGigs] = useState([]);
  const [stats, setStats] = useState({});
  const [payouts, setPayouts] = useState([]);
  const navigate = useNavigate();

  const fetchAdminData = async () => {
    try {
      const statsResponse = await api.get('/admin/stats');
      setStats(statsResponse.data);

      const usersResponse = await api.get('/admin/users');
      setUsers(usersResponse.data);

      const gigsResponse = await api.get('/admin/gigs');
      setGigs(gigsResponse.data);
      
      const payoutsResponse = await api.get('/admin/payouts');
      setPayouts(payoutsResponse.data);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
      if (err.response && err.response.status === 403) {
        alert('Access Denied: Admin privileges required.');
        navigate('/dashboard');
      }
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (id) => {
    try {
      if (window.confirm('Are you sure you want to delete this user?')) {
        await api.delete(`/admin/users/${id}`);
        alert('User deleted successfully!');
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to delete user:', err);
      alert('Failed to delete user.');
    }
  };

  const handleDeleteGig = async (id) => {
    try {
      if (window.confirm('Are you sure you want to delete this gig?')) {
        await api.delete(`/admin/gigs/${id}`);
        alert('Gig deleted successfully!');
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to delete gig:', err);
      alert('Failed to delete gig.');
    }
  };

  const handleProcessPayout = async (id) => {
    try {
      if (window.confirm('Are you sure you want to process this payout?')) {
        await api.put(`/admin/payouts/${id}`);
        alert('Payout processed successfully!');
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to process payout:', err);
      alert('Failed to process payout.');
    }
  };

  return (
    <div className="admin-container">
      <h2>Admin Dashboard</h2>

      {/* Platform Stats */}
      <div className="stats-container">
        <div className="stat-card">
          <h4>Total Users</h4>
          <p>{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h4>Total Gigs</h4>
          <p>{stats.totalGigs}</p>
        </div>
        <div className="stat-card">
          <h4>Open Gigs</h4>
          <p>{stats.openGigs}</p>
        </div>
        <div className="stat-card">
          <h4>Gigs in Progress</h4>
          <p>{stats.inProgressGigs}</p>
        </div>
      </div>

      {/* Payouts */}
      <h3 className="section-title">Payouts ({payouts.length})</h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Gig Title</th>
            <th>Freelancer</th>
            <th>Amount (₹)</th>
            <th>UPI ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {payouts.map(payout => (
            <tr key={payout._id}>
              <td>{payout.title}</td>
              <td>
                <Link to={`/profile/${payout.hiredFreelancer._id}`} className="profile-link">
                  {payout.hiredFreelancer.username}
                </Link>
              </td>
              <td>{payout.finalAmount}</td>
              <td>{payout.hiredFreelancer.upiId}</td>
              <td>
                <button className="process-btn" onClick={() => handleProcessPayout(payout._id)}>Process Payout</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Users */}
      <h3 className="section-title">Manage Users ({users.length})</h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>
                <Link to={`/profile/${user._id}`} className="profile-link">
                  {user.username}
                </Link>
              </td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button className="delete-btn" onClick={() => handleDeleteUser(user._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Gigs */}
      <h3 className="section-title">Manage Gigs ({gigs.length})</h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Posted By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {gigs.map(gig => {
            const poster = users.find(u => u._id === gig.postedBy);
            return (
              <tr key={gig._id}>
                <td>{gig.title}</td>
                <td>{gig.status}</td>
                <td>
                  {poster ? (
                    <Link to={`/profile/${poster._id}`} className="profile-link">
                      {poster.username}
                    </Link>
                  ) : (
                    gig.postedBy
                  )}
                </td>
                <td>
                  <button className="delete-btn" onClick={() => handleDeleteGig(gig._id)}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
