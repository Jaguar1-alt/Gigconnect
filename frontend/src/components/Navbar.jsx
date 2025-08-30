import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css'; // Import the new CSS file
import logo from '../assets/gigconnect.png'; // adjust the path based on your folder structure


const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const navLinks = (
    <>
      {role === 'client' && (
        <>
          <Link to="/post-gig" className="nav-link" onClick={() => setMenuOpen(false)}>Post a Gig</Link>
          <Link to="/my-gigs" className="nav-link" onClick={() => setMenuOpen(false)}>My Gigs</Link>
        </>
      )}
      {role === 'freelancer' && (
        <>
          <Link to="/browse-gigs" className="nav-link" onClick={() => setMenuOpen(false)}>Browse Gigs</Link>
          <Link to="/applied-gigs" className="nav-link" onClick={() => setMenuOpen(false)}>Applied Gigs</Link>
        </>
      )}
      <Link to="/profile" className="nav-link" onClick={() => setMenuOpen(false)}>Profile</Link>
      <Link to="/dashboard" className="nav-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
      <button onClick={handleLogout} className="nav-link logout-btn">Logout</button>
    </>
  );

  const nonAuthLinks = (
    <>
      <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>Login</Link>
      <Link to="/register" className="nav-link" onClick={() => setMenuOpen(false)}>Register</Link>
    </>
  );

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
  <img src={logo} alt="GigConnect Logo" className="logo-img" />
  <span>𝐆𝐢𝐠𝐂𝐨𝐧𝐧𝐞𝐜𝐭</span>
</Link>


      <button className="menu-toggle" onClick={toggleMenu}>
        {menuOpen ? '✕' : '☰'}
      </button>
      <div className={`nav-menu ${menuOpen ? 'open' : ''}`}>
        {token ? navLinks : nonAuthLinks}
      </div>
    </nav>
  );
};
export default Navbar;