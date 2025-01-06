import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    validateToken();
  }, []);

  const validateToken = async () => {
    const token = localStorage.getItem('token');
    console.log('Validating token:', token);

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.validateToken();
      console.log('Token validation response:', response);
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Token validation error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (token) => {
    console.log('Login with token:', token);
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    try {
      const response = await authAPI.validateToken();
      console.log('Initial validation response:', response);
      setUser(response.data);
    } catch (error) {
      console.error('Initial validation error:', error);
      logout();
    }
  };

  const logout = () => {
    console.log('Logging out');
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

