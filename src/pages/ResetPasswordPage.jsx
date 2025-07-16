// src/pages/ResetPasswordPage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/api'; // We will add this function next
import './LoginPage.css'; // We can reuse the login page styles
import logo from '../assets/logo.png';

const ResetPasswordPage = () => {
    const { token } = useParams(); // Gets the token from the URL, e.g., /reset-password/:token
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const response = await resetPassword({ token, password });
            setSuccessMessage(response.data.message + " Redirecting to login page in 3 seconds...");
            
            // Redirect to login page after a short delay so the user can see the success message
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <img src={logo} alt="Sky Link Logo" className="login-logo" />
                <form className="login-form" onSubmit={handleSubmit}>
                    <h2>Set New Password</h2>

                    {/* Show success message and hide form, or show form */}
                    {successMessage ? (
                        <p className="success-message" style={{color: 'green', textAlign: 'center'}}>{successMessage}</p>
                    ) : (
                        <>
                            {error && <p className="error-message">{error}</p>}
                            <div className="form-group">
                                <label htmlFor="password">New Password</label>
                                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm New Password</label>
                                <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={isLoading} />
                            </div>
                            <button type="submit" className="btn btn-primary login-button" disabled={isLoading}>
                                {isLoading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;