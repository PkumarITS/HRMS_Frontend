import React, { useState } from 'react';
import './style.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // Step 1: Enter email, Step 2: Set new password
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

  const handleEmailSubmit = (event) => {
    event.preventDefault();
    axios
      .post('http://localhost:1010/auth/forgot-password', { email }) // ✅ Updated API URL
      .then((response) => {
        setSuccessMessage("Password reset link sent to your email!");
        setStep(2); // Move to step 2
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to send reset link. Please try again.");
      });
  };

  const handlePasswordSubmit = (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
  
    axios
      .post('http://localhost:1010/auth/reset-password', { email, newPassword }) // ✅ Updated API URL
      .then((response) => {
        setSuccessMessage("Password reset successfully. Redirecting to login...");
        setError(null);
        setTimeout(() => navigate('/login'), 3000); // Redirect to login after 3 seconds
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to reset password. Please try again.");
      });
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 loginPage">
      <div className="p-4 rounded w-25 border loginForm">
        <h2 className="text-center">Forget Password</h2>
        {error && <div className="text-danger mb-3"><strong>{error}</strong></div>}
        {successMessage && <div className="text-success mb-3"><strong>{successMessage}</strong></div>}
        {step === 1 ? (
          <form onSubmit={handleEmailSubmit}>
            <div className="mb-3">
              <label htmlFor="email">
                <strong>Email:</strong>
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                className="form-control rounded-0"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button className="btn btn-primary w-100 rounded-0">
              Send Reset Link
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-3">
              <label htmlFor="newPassword">
                <strong>New Password:</strong>
              </label>
              <input
                type="password"
                id="newPassword"
                placeholder="Enter new password"
                className="form-control rounded-0"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="confirmPassword">
                <strong>Confirm Password:</strong>
              </label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm new password"
                className="form-control rounded-0"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button className="btn btn-success w-100 rounded-0">
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgetPassword;