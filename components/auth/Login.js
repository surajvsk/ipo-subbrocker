// ================================
// File: components/auth/Login.js
// Description: Login component. In a full Next.js app with MongoDB,
//              authentication would be handled via NextAuth.js or custom APIs.
//              This is a placeholder for a more complex auth system.
// ================================
import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

// Mock function for simulating login. In a real app, this would hit your /api/login route.
const mockLoginAPI = async (username, password) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // In a real app, this would query your MongoDB 'subBrokers' collection
  // to validate credentials.
  const users = [
    { username: 'admin', password: 'adminpassword', role: 'admin' },
    { username: 'subbroker1', password: 'password123', role: 'subbroker' }
  ];

  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    return { success: true, user };
  } else {
    return { success: false, message: 'Invalid username or password.' };
  }
};

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const response = await mockLoginAPI(username, password); // Use mock API

      if (response.success) {
        setOtpSent(true);
        setMessage("OTP sent to your registered mobile number (simulated). Enter '1234' for OTP.");
      } else {
        setError(response.message);
      }
    } catch (e) {
      console.error("Login error:", e);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = () => {
    if (otp === '1234') { // Simulated OTP
      setError('');
      setMessage("Login successful!");
      // In a real Next.js app, you'd likely set a session cookie here
      // via an API route, then redirect.
      // For this mock, we directly call onLoginSuccess.
      const mockUser = username === 'admin' ? { role: 'admin' } : { role: 'subbroker' };
      onLoginSuccess(mockUser.role);

    } else {
      setError('Invalid OTP.');
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      // Simulate checking if username exists in DB
      const users = [
        { username: 'admin', email: 'admin@example.com' },
        { username: 'subbroker1', email: 'subbroker1@example.com' }
      ];
      const userExists = users.some(u => u.username === username);

      if (userExists) {
        setOtpSent(true);
        setMessage("OTP sent to your registered mobile number (simulated). Enter '1234' to verify.");
      } else {
        setError('Username not found.');
      }
    } catch (e) {
      console.error("Forgot password error:", e);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setError('');
    setMessage('');
    if (otp !== '1234') {
      setError('Invalid OTP.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      // Simulate password update in DB
      console.log(`Simulating password reset for ${username} to new password: ${newPassword}`);
      setMessage('Password reset successfully! You can now log in with your new password.');
      setForgotPasswordMode(false);
      setOtpSent(false);
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setUsername('');
      setPassword('');
    } catch (e) {
      console.error("Password reset error:", e);
      setError('An error occurred during password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-0 shadow-xl p-8 space-y-6">
      <img src="/images/menu-logo.png" alt="IPO Portal Logo" className="mx-auto mb-4 h-16" />
        <h2 className="text-3xl font-bold text-center text-gray-800">
          {forgotPasswordMode ? 'Forgot Password' : 'IPO Portal Login'}
        </h2>

        {error && <p className="text-red-600 text-center text-sm">{error}</p>}
        {message && <p className="text-green-600 text-center text-sm">{message}</p>}

        <Input
          type="text"
          placeholder="Username or Broker Code"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading || otpSent}
        />

        {!forgotPasswordMode && !otpSent && (
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        )}

        {otpSent && (
          <>
            <Input
              type="text"
              placeholder="Enter OTP (e.g., 1234)"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={loading}
            />
            {forgotPasswordMode && (
              <>
                <Input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />
                <Input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </>
            )}
          </>
        )}

        <div className="flex flex-col gap-4">
          {!otpSent ? (
            <Button onClick={forgotPasswordMode ? handleForgotPassword : handleLogin} className='bg-green-600' disabled={loading}>
              {loading ? 'Processing...' : (forgotPasswordMode ? 'Send OTP' : 'Login')}
            </Button>
          ) : (
            <Button onClick={forgotPasswordMode ? handlePasswordReset : handleOtpVerification} className='bg-green-600' disabled={loading}>
              {loading ? 'Verifying...' : (forgotPasswordMode ? 'Reset Password' : 'Verify OTP')}
            </Button>
          )}
        </div>

        <div className="text-center">
          {forgotPasswordMode ? (
            <button
              onClick={() => { setForgotPasswordMode(false); setOtpSent(false); setError(''); setMessage(''); setUsername(''); setPassword(''); setNewPassword(''); setConfirmPassword(''); }}
              className="text-blue-600 hover:underline text-sm"
            >
              Back to Login
            </button>
          ) : (
            <button
              onClick={() => { setForgotPasswordMode(true); setOtpSent(false); setError(''); setMessage(''); setUsername(''); setPassword(''); }}
              className="text-blue-600 hover:underline text-sm"
            >
              Forgot Password?
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;