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

    if (loading || !user) {
        return <main className="layout-main">{children}</main>; 
    }

    // === FINAL, HIERARCHICAL NAVIGATION LOGIC (CORRECTED) ===
    const renderNavLinks = () => {
        // 1. Check for Admin permission FIRST. This is the highest priority.
        if (hasPermission('MANAGE_USERS')) {
            // An Admin only sees the "Admin Panel" link.
            return (
                <NavLink to="/admin/users">Admin Panel</NavLink>
            );
        }
        
        // 2. Then, check for CEO/Owner permission.
        if (hasPermission('VIEW_COMPANY_OVERVIEW')) {
            // The CEO sees their specific set of navigation links.
            return (
                <>
                    <NavLink to="/dashboard" end>Dashboard</NavLink>
                    <NavLink to="/reports">Reports</NavLink>
                    {/* Assuming you have a page for the CEO to view all departments */}
                    {/* <NavLink to="/ceo/departments">Departments</NavLink> */}
                </>
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
        // The check order here must match the logic above
        if (hasPermission('MANAGE_USERS')) return "/admin/users";
        if (hasPermission('VIEW_COMPANY_OVERVIEW')) return "/dashboard";
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