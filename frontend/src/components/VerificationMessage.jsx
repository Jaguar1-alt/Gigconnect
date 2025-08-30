import React from 'react';
import { Link } from 'react-router-dom';

const VerificationMessage = ({ email }) => {
  const wrapperStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
  };

  const cardStyle = {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    textAlign: 'center',
    maxWidth: '400px',
    width: '100%',
  };

  const titleStyle = {
    color: '#4CAF50',
    marginBottom: '1rem',
    fontSize: '1.8rem',
  };

  const messageStyle = {
    color: '#333',
    fontSize: '1rem',
    margin: '10px 0',
  };

  const buttonStyle = {
    display: 'inline-block',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#4CAF50',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    marginTop: '20px',
    transition: 'background-color 0.3s',
  };

  const buttonHover = (e) => {
    e.target.style.backgroundColor = '#45a049';
  };

  const buttonLeave = (e) => {
    e.target.style.backgroundColor = '#4CAF50';
  };

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Registration Successful!</h2>
        <p style={messageStyle}>A verification link has been sent to <strong>{email}</strong>.</p>
        <p style={messageStyle}>Didn't receive it? Please check your spam or junk folder.</p>
        <Link
          to="/login"
          style={buttonStyle}
          onMouseEnter={buttonHover}
          onMouseLeave={buttonLeave}
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
};

export default VerificationMessage;
