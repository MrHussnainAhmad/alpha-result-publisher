import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AdminSignup from './components/AdminSignup';
import Home from './components/Home';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Basic token validation - you could add JWT decode here
        setIsAuthenticated(true);
        console.log('User is authenticated');
      } else {
        setIsAuthenticated(false);
        console.log('No authentication token found');
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
      localStorage.removeItem('token'); // Clear invalid token
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    console.log('User logged in successfully');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    console.log('User logged out');
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route path="/" element={isAuthenticated ? <Home onLogout={handleLogout} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
