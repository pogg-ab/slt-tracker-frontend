// src/components/Layout/Layout.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import UserIcon from '../common/UserIcon';
import LogoutIcon from '../common/LogoutIcon';
import logo from '/src/assets/logo.png';
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

    const renderNavLinks = () => {
        // 1. Check for Admin first
        if (hasPermission('MANAGE_USERS')) {
            return <NavLink to="/admin/users">Admin Panel</NavLink>;
        }
        
        // 2. Then, check for CEO/Owner
        if (hasPermission('VIEW_COMPANY_OVERVIEW')) {
            return (
                <>
                    <NavLink to="/dashboard" end>Dashboard</NavLink>
                    <NavLink to="/reports">Reports</NavLink>
                    {/* === THIS IS THE FIX for BUG #1 === */}
                    {/* The link is now active and checks for its specific permission */}
                    {hasPermission('MANAGE_DEPARTMENTS') && (
                        <NavLink to="/admin/users">Departments</NavLink>
                    )}
                </>
            );
        }
        
        // 3. Default for Managers and Staff
        return (
            <>
                <NavLink to="/dashboard" end>Dashboard</NavLink>
                {hasPermission('VIEW_REPORTS') && (
                    <NavLink to="/reports">Reports</NavLink>
                )}
            </>
        );
    };

    const getHomePageLink = () => {
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