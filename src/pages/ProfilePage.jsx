// src/pages/ProfilePage.jsx

import React, { useState, useEffect } from 'react'; // <-- THE FIX IS HERE
import Layout from '../components/Layout/Layout';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile, changePassword } from '../services/api';
import './ProfilePage.css'; // Assuming you have this CSS file

const ProfilePage = () => {
    const { user, login } = useAuth(); // Assuming login updates context

    // State for the update profile form
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

    // State for the change password form
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    // When the component loads, fill the form with the current user's data
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsSubmittingProfile(true);
        setProfileMessage({ type: '', text: '' });
        try {
            const updatedUserData = { name, email };
            const response = await updateUserProfile(updatedUserData);
            
            // OPTIONAL: Update the auth context with the new user data
            // This requires your login function in AuthContext to be able to take user data
            // login(localStorage.getItem('token'), response.data); 
            
            setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setProfileMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
        } finally {
            setIsSubmittingProfile(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setIsSubmittingPassword(true);
        setPasswordMessage({ type: '', text: '' });
        try {
            await changePassword({ oldPassword, newPassword });
            setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
            setOldPassword('');
            setNewPassword('');
        } catch (err) {
            setPasswordMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' });
        } finally {
            setIsSubmittingPassword(false);
        }
    };

    if (!user) {
        return <Layout><p>Loading profile...</p></Layout>;
    }

    return (
        <Layout>
            <div className="profile-page">
                <h1>My Profile</h1>
                <div className="profile-container">
                    {/* Update Profile Widget */}
                    <div className="profile-widget">
                        <h2>Update Information</h2>
                        <form onSubmit={handleProfileUpdate}>
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            {profileMessage.text && <p className={`message ${profileMessage.type}`}>{profileMessage.text}</p>}
                            <button type="submit" className="btn btn-primary" disabled={isSubmittingProfile}>
                                {isSubmittingProfile ? 'Saving...' : 'Save Profile Changes'}
                            </button>
                        </form>
                    </div>

                    {/* Change Password Widget */}
                    <div className="profile-widget">
                        <h2>Change Password</h2>
                        <form onSubmit={handlePasswordChange}>
                            <div className="form-group">
                                <label htmlFor="oldPassword">Current Password</label>
                                <input id="oldPassword" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="newPassword">New Password</label>
                                <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                            </div>
                            {passwordMessage.text && <p className={`message ${passwordMessage.type}`}>{passwordMessage.text}</p>}
                            <button type="submit" className="btn btn-primary" disabled={isSubmittingPassword}>
                                {isSubmittingPassword ? 'Saving...' : 'Change Password'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ProfilePage;