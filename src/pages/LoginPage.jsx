// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '/src/assets/logo.png'; // Correct absolute path import for the logo
import Spinner from '../components/common/Spinner'; // Correct import for the Spinner
import './LoginPage.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // The login function in AuthContext will fetch user details and permissions
            const loggedInUser = await login({ email, password });
            
            // Intelligent Redirection Logic
            if (loggedInUser && loggedInUser.permissions && loggedInUser.permissions.includes('MANAGE_USERS')) {
                // If they have the Admin permission, redirect to the Admin Panel
                navigate('/admin/users');
            } else {
                // Otherwise, redirect to the regular user dashboard
                navigate('/dashboard');
            }

        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <img src={logo} alt="Sky Link Logo" className="login-logo" />
                <form className="login-form" onSubmit={handleSubmit}>
                    <h2>Tracker Login</h2>
                    {error && <p className="error-message">{error}</p>}
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary login-button" disabled={isLoading}>
                        {isLoading ? <Spinner small={true} /> : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;