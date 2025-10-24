import React from 'react';
// REMOVE: import Layout from '../components/Layout/Layout';
import UpdateProfileForm from '../components/Profile/UpdateProfileForm';
import ChangePasswordForm from '../components/Profile/ChangePasswordForm';
import './ProfilePage.css';

const ProfilePage = () => {
    return (
        // The <Layout> wrapper is now gone from this file.
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-widget">
                    <UpdateProfileForm />
                </div>
                <div className="profile-widget">
                    <ChangePasswordForm />
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;