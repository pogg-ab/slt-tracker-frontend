// src/components/ManagerRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ManagerRoute = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    // 1. Check if user is authenticated
    if (!isAuthenticated) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. Check if the authenticated user is a Manager
    if (user.role !== 'Manager') {
        // If they are logged in but not a manager, send them to the dashboard
        return <Navigate to="/dashboard" replace />;
    }

    // 3. If they are authenticated AND a manager, render the page
    return children;
};

export default ManagerRoute;