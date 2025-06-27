// ================================
// File: components/auth/Login.js
// Description: Login component. In a full Next.js app with MongoDB,
//              authentication would be handled via NextAuth.js or custom APIs.
//              This is a placeholder for a more complex auth system.
// ================================
import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState(''); // This will map to branchCode for API calls
  const [password, setPassword] = useState(''); // Password is not used in the provided API flow, but kept for UI consistency
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // API specific states
  const [csrfToken, setCsrfToken] = useState('');
  const [loginToken, setLoginToken] = useState(''); // JWT for subsequent requests
  const [refreshToken, setRefreshToken] = useState('');

  // For simplicity, hardcode branchCode and type as per API examples
  // In a real app, branchCode might be derived from username or selected.
  const branchCode = username || 'AP02'; // Use entered username as branchCode, fallback to AP02
  const type = 'AP'; // Hardcoded as per API example

  // These states are kept from original for UI consistency,
  // but their functionality will be simplified or removed based on API.
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');


  // Step 1: Set CSRF Token
  const fetchCsrfToken = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const response = await fetch('https://korpapuatapi.arihantcapital.com/api/V1/SetCsrfToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchCode: branchCode, type: type }),
      });
      const data = await response.json();

      if (response.ok) {
        if (data.message) {
          setCsrfToken(data.message);
          setMessage("CSRF Token obtained. Proceeding to send OTP.");
          return data.message; // Return token for chaining
        } else {
          throw new Error(data.message || 'Failed to get CSRF token.');
        }
      } else {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
    } catch (e) {
      console.error("Error setting CSRF token:", e);
      setError(`Failed to initiate login process: ${e.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Send OTP
  const sendOtp = async (currentCsrfToken) => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const response = await fetch('https://korpapuatapi.arihantcapital.com/api/V1/sendotp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchCode: branchCode, type: type, CsrfToken: currentCsrfToken }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setOtpSent(true);
        setMessage(`OTP sent to your registered mobile number ending with ${data.result.mobile.slice(-4)} (simulated).`);
        return true;
      } else {
        throw new Error(data.message || 'Failed to send OTP.');
      }
    } catch (e) {
      console.error("Error sending OTP:", e);
      setError(`Failed to send OTP: ${e.message}`);
      setOtpSent(false); // Reset OTP state if sending fails
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Validate OTP
  const validateOtp = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    if (!otp) {
      setError('Please enter the OTP.');
      setLoading(false);
      return false;
    }

    try {
      const response = await fetch('https://korpapuatapi.arihantcapital.com/api/V1/validatingotp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchCode: branchCode, type: type, CsrfToken: csrfToken, otp: otp }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setLoginToken(data.result.Token);
        setRefreshToken(data.result.RefreshToken);
        setMessage("OTP validated successfully. Fetching profile...");
        return data.result.Token; // Return token for chaining
      } else {
        throw new Error(data.message || 'Invalid OTP or failed to validate.');
      }
    } catch (e) {
      console.error("Error validating OTP:", e);
      setError(`OTP verification failed: ${e.message}`);
      setLoginToken(''); // Clear tokens on failure
      setRefreshToken('');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Get Profile
  const getProfile = async (token) => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const response = await fetch('https://korpapuatapi.arihantcapital.com/api/V1/dashboard/getprofile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}` // Standard way to send JWT
          // 'Cookie': `user_auth_token=${token}` // If backend strictly requires Cookie header
        },
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setMessage("Login successful!");
        // Determine role based on profile data
        let role = 'subbroker'; // Default role
        if (data.result && data.result.BranchType === 'EMP') { // Assuming 'EMP' means admin
          role = 'admin';
        }
        onLoginSuccess(role);
        return true;
      } else {
        throw new Error(data.message || 'Failed to fetch profile.');
      }
    } catch (e) {
      console.error("Error getting profile:", e);
      setError(`Failed to retrieve user profile: ${e.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleLoginProcess = async () => {
    if (!username) {
      setError('Username (Branch Code) is required.');
      return;
    }
    // No password input for API, but keeping for UI until confirmed
    // if (!password && !forgotPasswordMode) {
    //   setError('Password is required.');
    //   return;
    // }

    const token = await fetchCsrfToken();
    if (token) {
      await sendOtp(token);
    }
  };

  const handleOtpVerification = async () => {
    const token = await validateOtp();
    if (token) {
      await getProfile(token);
    }
  };

  // The provided API flow doesn't directly support traditional password reset.
  // It's a 2FA (OTP based) login. For a "Forgot Password" flow,
  // you'd typically have a separate API to initiate password reset (e.g., send reset link to email).
  // For now, I'll make the "Forgot Password" button trigger the OTP flow for access,
  // but it won't lead to a password change within this component directly
  // unless the API has a separate endpoint for that after OTP validation.
  const handleForgotPasswordInitiate = async () => {
    if (!username) {
      setError('Username (Branch Code) is required to initiate password reset.');
      return;
    }
    setMessage('For password reset, we will send an OTP for verification. Please proceed.');
    // Treat "Forgot Password" as initiating the same OTP login flow for now.
    // A true password reset would involve different APIs or stages.
    setForgotPasswordMode(true); // Keep this state for UI distinction
    const token = await fetchCsrfToken();
    if (token) {
      await sendOtp(token);
    }
  };

  // This function might need re-evaluation based on actual "forgot password" API
  // Currently, the provided API sequence doesn't include a "set new password" step after OTP.
  const handlePasswordResetComplete = async () => {
    setError('');
    setMessage('');
    if (otp !== '1234') { // This mock '1234' should be replaced by actual API validation
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
      // In a real scenario, after OTP validation (step 3),
      // there would be another API call here to actually update the password.
      // The provided APIs don't have this step.
      // Simulating a success for demonstration.
      console.log(`Simulating password reset for ${username} with new password: ${newPassword}`);
      setMessage('Password reset successfully! You can now log in with your new password.');
      setForgotPasswordMode(false);
      setOtpSent(false);
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setUsername('');
      setPassword(''); // Clear password field
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
          placeholder="Username or Broker Code (e.g., AP02)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading || otpSent}
        />

        {/* Password input is not strictly used by the provided API for initial login, but kept for UI */}
        {!forgotPasswordMode && !otpSent && (
          <Input
            type="password"
            placeholder="Password (Not required for OTP login)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        )}

        {otpSent && (
          <>
            <Input
              type="text"
              placeholder="Enter OTP"
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
            <Button onClick={forgotPasswordMode ? handleForgotPasswordInitiate : handleLoginProcess} className='bg-green-600' disabled={loading}>
              {loading ? 'Processing...' : (forgotPasswordMode ? 'Initiate Reset (Send OTP)' : 'Login (Send OTP)')}
            </Button>
          ) : (
            <Button onClick={forgotPasswordMode ? handlePasswordResetComplete : handleOtpVerification} className='bg-green-600' disabled={loading}>
              {loading ? 'Verifying...' : (forgotPasswordMode ? 'Reset Password' : 'Verify OTP & Login')}
            </Button>
          )}
        </div>

        <div className="text-center">
          {forgotPasswordMode ? (
            <button
              onClick={() => {
                setForgotPasswordMode(false);
                setOtpSent(false);
                setError('');
                setMessage('');
                setUsername('');
                setPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setOtp('');
                setCsrfToken('');
                setLoginToken('');
                setRefreshToken('');
              }}
              className="text-blue-600 hover:underline text-sm"
            >
              Back to Login
            </button>
          ) : (
            <button
              onClick={() => {
                setForgotPasswordMode(true);
                setOtpSent(false);
                setError('');
                setMessage('');
                setUsername('');
                setPassword('');
                setCsrfToken('');
                setLoginToken('');
                setRefreshToken('');
              }}
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