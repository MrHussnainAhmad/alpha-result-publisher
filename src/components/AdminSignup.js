import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './AdminSignup.css';
import backgroundImage from './bg.jpg';

const AdminSignup = () => {
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await authAPI.adminSignup({
        fullname: formData.fullname,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: 'admin'
      });
      
      // Redirect to login page after successful signup
      alert('Admin account created successfully! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create admin account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="signup-container"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="signup-box">
        <h2>Admin Signup</h2>
        <form onSubmit={handleSignup}>
          <div className="input-group">
            <label htmlFor="fullname">Full Name</label>
            <input
              type="text"
              id="fullname"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
          <div className="login-link">
            Already have an account? <a href="/login">Login here</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSignup;
