"use client"
import { useAuth } from "../../context/AuthContext"
import { Link, NavLink, useNavigate } from "react-router-dom"
import UserIcon from "../common/UserIcon"
import LogoutIcon from "../common/LogoutIcon"
import NotificationHandler from "../common/NotificationHandler"
import logo from "/src/assets/logo.png"
import "./Layout.css"

const Layout = ({ children }) => {
  const { user, logout, hasPermission, loading } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  // While user data is loading, don't render the full layout.
  // Also, if there's no user (e.g., on the login page), we don't need the full layout.
  if (loading || !user) {
    return <main className="layout-main">{children}</main>
  }

  const isAdmin = hasPermission("MANAGE_USERS")
  const isCeo = hasPermission("VIEW_COMPANY_OVERVIEW")

  // Dynamically render navigation links based on permissions
  const renderNavLinks = () => {
    if (isAdmin) {
      return <NavLink to="/admin/users">Admin Panel</NavLink>
    }

    if (isCeo) {
      return (
        <>
          <NavLink to="/dashboard" end>
            Dashboard
          </NavLink>
          <NavLink to="/reports">Reports</NavLink>
          {/* Add CEO-specific links here if you create them */}
        </>
      )
    }

    // Default navigation for Managers and Staff
    return (
      <>
        <NavLink to="/dashboard" end>
          Dashboard
        </NavLink>
        {hasPermission("VIEW_REPORTS") && <NavLink to="/reports">Reports</NavLink>}
      </>
    )
  }

  // Determine the correct home page link for the main logo
  const getHomePageLink = () => {
    if (isAdmin) return "/admin/users"
    return "/dashboard"
  }

  return (
    <div className="layout-container">
      {/* Notification Handler - invisible but active for logged-in users */}
      <NotificationHandler />

      <header className="layout-header">
        <div className="header-content">
          <div className="header-left">
            <Link to={getHomePageLink()} className="header-logo">
              <div className="logo-container">
                <img src={logo || "/placeholder.svg"} alt="SLT Icon" className="logo-image" />
              </div>
              <div className="logo-text">
                <span className="logo-title">SLT-Tracker</span>
                <span className="logo-subtitle">Task Management</span>
              </div>
            </Link>

            <nav className="header-nav">
              <div className="nav-links">{renderNavLinks()}</div>
            </nav>
          </div>

          <div className="header-right">
            <div className="user-info">
              <div className="user-avatar">{(user.job_title || user.name).charAt(0).toUpperCase()}</div>
              <div className="user-details">
                <span className="user-name">{user.job_title || user.name}</span>
                <span className="user-role">Welcome back</span>
              </div>
            </div>

            <div className="header-actions">
              <Link to="/profile" className="action-btn profile-btn" title="My Profile">
                <UserIcon />
                <span className="btn-tooltip">Profile</span>
              </Link>
              <button onClick={handleLogout} className="action-btn logout-btn" title="Logout">
                <LogoutIcon />
                <span className="btn-tooltip">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="layout-main">
        <div className="main-content">{children}</div>
      </main>
    </div>
  )
}

export default Layout
