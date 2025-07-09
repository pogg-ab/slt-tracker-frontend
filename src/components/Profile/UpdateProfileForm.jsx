// src/components/Profile/UpdateProfileForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile } from '../../services/api'; // We will add this

const UpdateProfileForm = () => {
    const { user, login } = useAuth(); // We need login to refresh the token
    
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
            
            // To see the name change in the header, we must get a new token.
            // The simplest way is to re-trigger the login logic.
            // This requires saving the user's password, which we can't do.
            // So, for now, we'll just show a message. A full-fledged app might force a re-login.
            // A better solution would be to update the user context directly.
            setTimeout(() => window.location.reload(), 2000); // Simple reload for now

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Update Information</h2>
            <div className="form-group">
                <label>Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            {message && <p style={{color: 'green'}}>{message}</p>}
            {error && <p className="error-message" style={{color: 'red'}}>{error}</p>}
            <button type="submit" disabled={loading}>{loading ? 'Updating...' : 'Update Profile'}</button>
        </form>
    );
};

export default UpdateProfileForm;