// src/components/Layout/Layout.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import UserIcon from '../common/UserIcon';
import LogoutIcon from '../common/LogoutIcon';
import logo from '/src/assets/logo.png'; // Using absolute path
import './Layout.css';

const Layout = ({ children }) => {
    const { user, logout, hasPermission, loading } = useAuth(); 
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // While user data is loading, render a simplified view to prevent errors
    if (loading || !user) {
        // You could also render a full-page spinner here for better UX
        return <main className="layout-main">{children}</main>; 
    }

    // === FINAL, HIERARCHICAL NAVIGATION LOGIC ===
    const renderNavLinks = () => {
        // 1. Check for CEO/Owner permission first.
        if (hasPermission('VIEW_COMPANY_OVERVIEW')) {
            return (
                <>
                    {/* The CEO sees all primary navigation links */}
                    <NavLink to="/dashboard" end>Dashboard</NavLink>
                    <NavLink to="/reports">Reports</NavLink>
                    <NavLink to="/ceo/departments">Departments</NavLink>
                </>
            );
        }
        
        // 2. Then, check for Admin permission.
        if (hasPermission('MANAGE_USERS')) {
            // An Admin only sees the "Admin Panel" link.
            return (
                <NavLink to="/admin/users">Admin Panel</NavLink>
            );
        }
        
        // 3. Finally, render the default navigation for regular Managers and Staff.
        return (
            <>
                <NavLink to="/dashboard" end>Dashboard</NavLink>
                {hasPermission('VIEW_REPORTS') && (
                    <NavLink to="/reports">Reports</NavLink>
                )}
            </>
        );
    };

    // Determine the correct home page link for the main logo based on permissions
    const getHomePageLink = () => {
        if (hasPermission('VIEW_COMPANY_OVERVIEW')) return "/dashboard"; // CEO's home is now the dashboard
        if (hasPermission('MANAGE_USERS')) return "/admin/users";
        return "/dashboard";
    };

    return (
        <div className="layout-container">
            <header className="layout-header">
                <div className="header-left">
                    <Link to={getHomePageLink()} className="header-logo">
                        <img src={logo} alt="SLT Icon" style={{ height: '32px' }} />
                        <span>SLT-Tracker</span>
                    </Link>
                    <nav className="header-nav">
                        {renderNavLinks()}
                    </nav>
                </div>

                <div className="header-user">
                    <span className="welcome-text">Welcome, {user.job_title || user.name}</span>
                    <Link to="/profile" className="icon-btn" title="My Profile">
                        <UserIcon />
                    </Link>
                    <button onClick={handleLogout} className="icon-btn" title="Logout">
                        <LogoutIcon />
                    </button>
                </div>
            </header>
            <main className="layout-main">{children}</main>
        </div>
    );
};

export default Layout;