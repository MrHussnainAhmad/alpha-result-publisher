
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Login.css';
import backgroundImage from './bg.jpg'; // Import the image

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await authAPI.adminLogin({ email, password });
      
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        onLogin();
        console.log('Login successful');
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.status === 401) {
        setError('Invalid email or password');
      } else if (err.response?.status === 404) {
        setError('Admin account not found');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(`Login failed: ${err.message}`);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="login-container"
      style={{ backgroundImage: `url(${backgroundImage})` }} // Use inline style
    >
      <div className="login-box">
        <h2>
          Admin L
          <span className="login-o-container">
            o
            <div 
              className="secret-admin-dot"
              onClick={() => navigate('/admin/signup')}
              title="Admin Portal"
            />
          </span>
          gin
        </h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
