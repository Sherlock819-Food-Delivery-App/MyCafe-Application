import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const validateToken = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    validateToken();
  }, [validateToken]);

  const login = async (token) => {
    console.log('Login with token:', token);
    localStorage.setItem('token', token);
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    localStorage.setItem('userEmail', payload.sub);
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
    localStorage.removeItem('userEmail');
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

