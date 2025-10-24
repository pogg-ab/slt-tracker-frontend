// src/components/Profile/UpdateProfileForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile } from '../../services/api';
import './UpdateProfileForm.css'; // Import CSS

const UpdateProfileForm = () => {
    const { user, login } = useAuth();
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        try {
            await updateUserProfile({ name, email });
            setMessage('Profile updated successfully! Re-logging you in to reflect changes...');
            setTimeout(() => window.location.reload(), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="profile-form">
            <h2>Update Information</h2>
            <div className="form-group">
                <label>Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            {message && <div className="message success-message">{message}</div>}
            {error && <div className="message error-message">{error}</div>}
            <button type="submit" disabled={loading} className={loading ? 'loading' : ''}>
                {loading ? 'Updating...' : 'Update Profile'}
            </button>
        </form>
    );
};

export default UpdateProfileForm;