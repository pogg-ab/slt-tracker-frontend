"use client"

// src/components/Layout/Layout.jsx

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

// Context & Component Imports
import { useAuth } from "../../context/AuthContext"
import UserIcon from "../common/UserIcon"
import LogoutIcon from "../common/LogoutIcon"
import CreateProjectModal from "../Projects/CreateProjectModal"

// CSS Import
import "./Layout.css"

const Layout = ({ children }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleProjectCreated = (newProject) => {
    setIsProjectModalOpen(false)
    navigate(`/projects/${newProject.project_id}/board`)
  }

  return (
    <>
      <div className="layout-container">
        <header className="main-header">
          <div className="header-left">
            <Link to="/projects/null" className="header-logo">
              SLT-Tracker
            </Link>
            <nav className="header-nav">
              {/* The "Create" button logic (Your original, working code) */}
              {user && ["Manager", "Admin", "Owner"].includes(user.role) && (
                <button className="create-btn" onClick={() => setIsProjectModalOpen(true)}>
                  Create
                </button>
              )}

              {/* --- CORRECTED USER MANAGEMENT LINK --- */}
              {/* This now uses the EXACT SAME logic as your "Create" button */}
              {user && ["Manager", "Admin", "Owner"].includes(user.role) && (
                <Link to="/admin/users" className="nav-link">
                  User Management
                </Link>
              )}
            </nav>
          </div>

          <div className="header-right">
            <span className="welcome-text">Welcome, {user?.name}</span>

            <button onClick={() => navigate("/profile")} className="icon-btn" title="My Profile">
              <UserIcon />
            </button>

            <button onClick={handleLogout} className="icon-btn" title="Logout">
              <LogoutIcon />
            </button>
          </div>
        </header>

        <main className="layout-main">{children}</main>
      </div>

      {isProjectModalOpen && (
        <CreateProjectModal onClose={() => setIsProjectModalOpen(false)} onProjectCreated={handleProjectCreated} />
      )}
    </>
  )
}

export default Layout
