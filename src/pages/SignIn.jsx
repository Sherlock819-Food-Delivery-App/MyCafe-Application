import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      await authAPI.sendOTP(email);
      setOtpSent(true);
      setError('');
    } catch (error) {
      setError('Failed to send OTP');
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const response = await authAPI.verifyOTP(email, otp);
      console.log('OTP verification response:', response); // Debug log
      
      if (response.data && response.data.token) {
        await login(response.data.token);
        navigate('/');
      } else {
        console.error('No token in response:', response); // Debug log
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Sign in error:', error); // Debug log
      setError('Invalid OTP. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Sign In</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {!otpSent ? (
        <form onSubmit={handleSendOtp}>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-2">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Send OTP
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignIn}>
          <div className="mb-4">
            <label htmlFor="otp" className="block mb-2">OTP</label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Verify OTP
          </button>
        </form>
      )}
    </div>
  );
};

export default SignIn;

