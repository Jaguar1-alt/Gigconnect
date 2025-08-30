import React, { useState } from 'react';
import axios from 'axios';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css'; // Use the same CSS as Register for consistent styling

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(''); // For inline error messages
  const { email, password } = formData;
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      const response = await axios.post('http://localhost:5000/api/login', { idToken });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);

      navigate('/dashboard');

    } catch (err) {
      console.error('Login failed!', err.response ? err.response.data : err.message);
      setError(err.response ? err.response.data.message : err.message);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-card">
        <h2 className="register-title">Login</h2>
        {error && <p className="error-msg">{error}</p>}
        <form onSubmit={handleSubmit} className="register-form">
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


          <button type="submit" className="register-btn">Login</button>

          <p className="login-link">
            Don't have an account? <Link to="/register"><strong>Register here</strong></Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
