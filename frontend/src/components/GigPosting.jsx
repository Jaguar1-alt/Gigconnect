import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GigPosting = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    duration: '',
    skills: '',
    location: '',
  });

  const { title, description, budget, duration, skills, location } = formData;
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      const gigData = { ...formData, skills: skillsArray };

      await axios.post('http://localhost:5000/api/gigs', gigData, {
        headers: { 'x-auth-token': token },
      });
      navigate('/my-gigs');
    } catch (err) {
      console.error('Gig posting failed:', err);
    }
  };

  const styles = {
    page: {
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f0f4f8',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      padding: '20px'
    },
    card: {
      backgroundColor: '#fff',
      padding: '40px',
      borderRadius: '15px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
      maxWidth: '700px',
      width: '100%',
      boxSizing: 'border-box',
      marginBottom: '40px'
    },
    title: {
      textAlign: 'center',
      marginBottom: '30px',
      fontSize: '2rem',
      color: '#333',
      fontWeight: '700'
    },
    form: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px'
    },
    fullWidth: { gridColumn: '1 / -1' },
    inputContainer: { position: 'relative', display: 'flex', flexDirection: 'column' },
    label: {
      position: 'absolute',
      top: '14px',
      left: '16px',
      color: '#aaa',
      fontSize: '0.9rem',
      pointerEvents: 'none',
      transition: '0.2s all'
    },
    input: {
      padding: '18px 16px 6px 16px',
      borderRadius: '10px',
      border: '1px solid #ddd',
      fontSize: '1rem',
      outline: 'none',
      background: '#f9f9f9'
    },
    inputFocus: { borderColor: '#007bff' },
    textarea: {
      padding: '18px 16px 6px 16px',
      borderRadius: '10px',
      border: '1px solid #ddd',
      fontSize: '1rem',
      outline: 'none',
      background: '#f9f9f9',
      resize: 'vertical',
      minHeight: '120px'
    },
    button: {
      gridColumn: '1 / -1',
      padding: '16px',
      borderRadius: '10px',
      border: 'none',
      fontSize: '1.1rem',
      fontWeight: '600',
      background: 'linear-gradient(90deg, #2d2f31ff, #303535ff)',
      color: '#fff',
      cursor: 'pointer',
      transition: 'all 0.3s'
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Post a New Gig</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputContainer}>
            <input
              type="text"
              name="title"
              value={title}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <label style={styles.label}>Gig Title</label>
          </div>

          <div style={styles.inputContainer}>
            <input
              type="text"
              name="duration"
              value={duration}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <label style={styles.label}>Duration</label>
          </div>

          <div style={styles.inputContainer}>
            <input
              type="number"
              name="budget"
              value={budget}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <label style={styles.label}>Budget (INR)</label>
          </div>

          <div style={styles.inputContainer}>
            <input
              type="text"
              name="location"
              value={location}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <label style={styles.label}>Location</label>
          </div>

          <div style={styles.inputContainer} className={styles.fullWidth}>
            <textarea
              name="description"
              value={description}
              onChange={handleChange}
              required
              style={styles.textarea}
            ></textarea>
            <label style={styles.label}>Gig Description</label>
          </div>

          <div style={styles.inputContainer} className={styles.fullWidth}>
            <input
              type="text"
              name="skills"
              value={skills}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <label style={styles.label}>Skills (comma separated)</label>
          </div>

          <button type="submit" style={styles.button}>Post Gig</button>
        </form>
      </div>
    </div>
  );
};

export default GigPosting;
