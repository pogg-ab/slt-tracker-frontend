// src/components/common/AdminRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Make sure this path is correct

const AdminRoute = () => {
    const { user } = useAuth();

    if (!user) {
        // If user is not logged in, redirect to login page.
        return <Navigate to="/login" />;
    }

    // --- THIS IS THE CORRECTED SECURITY CHECK ---
    // It now uses the EXACT SAME logic as your Layout.jsx for consistency.
    // It checks the 'role' field from your user object.
    const isAuthorized = user && ['Manager', 'Admin', 'Owner'].includes(user.role);

    return isAuthorized ? <Outlet /> : <Navigate to="/projects/null" />;
};

export default AdminRoute;