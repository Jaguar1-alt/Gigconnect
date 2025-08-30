import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './BrowseGigs.css';
import { FaSearch, FaMapMarkerAlt, FaLaptopCode } from 'react-icons/fa';

const BrowseGigs = () => {
  const [gigs, setGigs] = useState([]);
  const [filters, setFilters] = useState({
    skills: '',
    location: '',
    budget: '',
  });

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };
  
  const handleSearch = async () => {
    try {
      const { skills, location, budget } = filters;
      const query = new URLSearchParams();
      if (skills) query.append('skills', skills);
      if (location) query.append('location', location);
      if (budget) query.append('budget', budget);

      const response = await axios.get(`http://localhost:5000/api/gigs/all?${query.toString()}`);
      setGigs(response.data);
    } catch (err) {
      console.error('Failed to fetch gigs:', err);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [filters]);

  const timeAgo = (dateString) => {
    const now = new Date();
    const posted = new Date(dateString);
    const diffTime = Math.abs(now - posted);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  return (
    <div className="browse-gigs-container">
      <h2 className="page-title">Browse Gigs</h2>

      <div className="search-filters">
        <form onSubmit={(e) => e.preventDefault()} className="filter-form">
          <div className="filter-inputs">
            <div className="input-icon">
              <FaLaptopCode className="icon"/>
              <input
                type="text"
                name="skills"
                value={filters.skills}
                onChange={handleChange}
                placeholder="Skills (React, Node.js...)"
              />
            </div>
            <div className="input-icon">
              <FaMapMarkerAlt className="icon"/>
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleChange}
                placeholder="Location"
              />
            </div>
            <input
              type="number"
              name="budget"
              value={filters.budget}
              onChange={handleChange}
              placeholder="Max Budget"
              className="budget-input"
            />
            <button type="button" onClick={handleSearch} className="search-btn">
              <FaSearch style={{ marginRight: '5px' }}/> Search
            </button>
          </div>
        </form>
      </div>

      {gigs.length > 0 ? (
        <ul className="gigs-list">
          {gigs.map(gig => (
            <li key={gig._id} className="gig-card">
              <div className="gig-header">
                <h3>{gig.title}</h3>
                <span className="budget-tag">₹{gig.budget}</span>
              </div>
              <div className="gig-skills">
                {gig.skills.map((skill, idx) => (
                  <span key={idx} className="skill-badge">{skill}</span>
                ))}
              </div>
              <div className="gig-footer">
                <span className="posted-date">Posted: {timeAgo(gig.postedAt)}</span>
                <Link to={`/gig/${gig._id}`} className="view-details-btn">View Details</Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-gigs">No open gigs found at the moment.</p>
      )}
    </div>
  );
};

export default BrowseGigs;
