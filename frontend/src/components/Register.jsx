import React, { useState } from 'react';
import axios from 'axios';
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import VerificationMessage from './VerificationMessage';
import './Register.css'; // External CSS for styling

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'client'
  });
  const [isRegistered, setIsRegistered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(''); // For inline error messages
  const { username, email, password, role } = formData;
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Reset error before submitting
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await sendEmailVerification(user);

      await axios.post('http://localhost:5000/api/register', {
        username,
        email,
        role,
        uid: user.uid,
      });

      console.log('Registration successful!');
      setIsRegistered(true);
    } catch (err) {
      console.error('Registration failed!', err.response ? err.response.data : err.message);
      setError(err.response ? err.response.data.message : err.message);
    }
  };

  if (isRegistered) {
    return <VerificationMessage email={email} />;
  }

  return (
    <div className="register-wrapper">
      <div className="register-card">
        <h2 className="register-title">Create Account</h2>
        {error && <p className="error-msg">{error}</p>}
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label>Username</label>
            <input type="text" name="username" value={username} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={email} onChange={handleChange} required />
          </div>

          <div className="form-group password-group">
            <label>Password</label>
            <input type={showPassword ? 'text' : 'password'} name="password" value={password} onChange={handleChange} required />
            <button type="button" className="show-btn" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <div className="form-group">
            <label>Role</label>
            <select name="role" value={role} onChange={handleChange} required>
              <option value="client">Client</option>
              <option value="freelancer">Freelancer</option>
            </select>
          </div>

          <button type="submit" className="register-btn">Register</button>
          <p className="login-link">
            Already have an account? <Link to="/login"><strong>Login here</strong></Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;