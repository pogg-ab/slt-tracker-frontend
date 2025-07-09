// src/components/common/AdminRedirect.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from './Spinner'; // Make sure Spinner is in the 'common' folder too

const AdminRedirect = () => {
    const { hasPermission, loading } = useAuth();

    // While we are checking permissions, show a loading spinner
    if (loading) {
        return <Spinner />;
    }
    
    // Check for permissions in order of priority: CEO > Admin > Regular User
    if (hasPermission('VIEW_COMPANY_OVERVIEW')) {
        return <Navigate to="/ceo/departments" replace />;
    } 
    else if (hasPermission('MANAGE_USERS')) {
        return <Navigate to="/admin/users" replace />;
    } 
    else {
        return <Navigate to="/dashboard" replace />;
    }
};

export default AdminRedirect;