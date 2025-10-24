// src/components/Profile/ChangePasswordForm.jsx
import React, { useState } from 'react';
import { changePassword } from '../../services/api';
import './ChangePasswordForm.css'; // Import CSS

const ChangePasswordForm = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters long.');
            return;
        }
        setLoading(true);
        setMessage('');
        setError('');
        try {
            await changePassword({ oldPassword, newPassword });
            setMessage('Password changed successfully!');
            setOldPassword('');
            setNewPassword('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="profile-form">
            <h2>Change Password</h2>
            <div className="form-group">
                <label>Current Password</label>
                <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
            </div>
            <div className="form-group">
                <label>New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            {message && <div className="message success-message">{message}</div>}
            {error && <div className="message error-message">{error}</div>}
            <button type="submit" disabled={loading} className={loading ? 'loading' : ''}>
                {loading ? 'Changing...' : 'Change Password'}
            </button>
        </form>
    );
};

export default ChangePasswordForm;