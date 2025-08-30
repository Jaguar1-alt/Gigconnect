import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ReviewForm = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating.');
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/gigs/${id}/review`, { rating, comment }, {
        headers: { 'x-auth-token': token },
      });
      alert('Review submitted successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Review submission failed:', err.response.data);
      alert(err.response.data.message || 'Failed to submit review.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Leave a Review</h2>
      <p>Your rating and review will be publicly visible.</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <h4>Rating:</h4>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => handleRatingChange(star)}
              style={{
                cursor: 'pointer',
                fontSize: '2rem',
                color: star <= rating ? 'gold' : 'gray',
              }}
            >
              ★
            </span>
          ))}
        </div>
        <textarea
          name="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Your review..."
          required
          style={{ padding: '10px', minHeight: '100px' }}
        ></textarea>
        <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Submit Review
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;