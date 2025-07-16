"use client"

import { useState, useEffect } from "react"
import Layout from "../components/Layout/Layout"
import { useAuth } from "../context/AuthContext"
import { updateUserProfile, changePassword } from "../services/api"
import "./ProfilePage.css"

const ProfilePage = () => {
  const { user, login } = useAuth() // Assuming login updates context

  // State for the update profile form
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false)
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" })

  // State for the change password form
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" })

  // Password visibility states
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  // When the component loads, fill the form with the current user's data
  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setEmail(user.email || "")
    }
  }, [user])

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setIsSubmittingProfile(true)
    setProfileMessage({ type: "", text: "" })

    try {
      const updatedUserData = { name, email }
      const response = await updateUserProfile(updatedUserData)

      // OPTIONAL: Update the auth context with the new user data
      // This requires your login function in AuthContext to be able to take user data
      // login(localStorage.getItem('token'), response.data);

      setProfileMessage({ type: "success", text: "Profile updated successfully!" })
    } catch (err) {
      setProfileMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile.",
      })
    } finally {
      setIsSubmittingProfile(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setIsSubmittingPassword(true)
    setPasswordMessage({ type: "", text: "" })

    try {
      await changePassword({ oldPassword, newPassword })
      setPasswordMessage({ type: "success", text: "Password changed successfully!" })
      setOldPassword("")
      setNewPassword("")
    } catch (err) {
      setPasswordMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to change password.",
      })
    } finally {
      setIsSubmittingPassword(false)
    }
  }

  if (!user) {
    return (
      <Layout>
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="profile-page">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="header-content">
            <div className="user-avatar-large">{user.name?.charAt(0)?.toUpperCase() || "U"}</div>
            <div className="header-info">
              <h1 className="profile-title">My Profile</h1>
              <p className="profile-subtitle">Manage your account settings and preferences</p>
              <div className="user-meta">
                <span className="user-role">{user.job_title || "User"}</span>
                <span className="user-status">
                  <div className="status-dot"></div>
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Container */}
        <div className="profile-container">
          {/* Update Profile Widget */}
          <div className="profile-widget">
            <div className="widget-header">
              <div className="widget-icon profile-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="widget-title">
                <h2>Update Information</h2>
                <p>Keep your profile information up to date</p>
              </div>
            </div>

            <form onSubmit={handleProfileUpdate} className="profile-form">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Full Name
                </label>
                <div className="input-container">
                  <input
                    id="name"
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    disabled={isSubmittingProfile}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  Email Address
                </label>
                <div className="input-container">
                  <input
                    id="email"
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    disabled={isSubmittingProfile}
                  />
                </div>
              </div>

              {profileMessage.text && (
                <div className={`message-container ${profileMessage.type}`}>
                  <div className="message-icon">
                    {profileMessage.type === "success" ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22,4 12,14.01 9,11.01" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                    )}
                  </div>
                  <p className="message-text">{profileMessage.text}</p>
                </div>
              )}

              <button type="submit" className="btn btn-primary profile-btn" disabled={isSubmittingProfile}>
                {isSubmittingProfile ? (
                  <div className="button-loading">
                    <div className="loading-spinner small"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="button-content">
                    <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <polyline points="17,21 17,13 7,13 7,21" />
                      <polyline points="7,3 7,8 15,8" />
                    </svg>
                    Save Profile Changes
                  </div>
                )}
              </button>
            </form>
          </div>

          {/* Change Password Widget */}
          <div className="profile-widget">
            <div className="widget-header">
              <div className="widget-icon password-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <circle cx="12" cy="16" r="1" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="widget-title">
                <h2>Change Password</h2>
                <p>Update your password to keep your account secure</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="profile-form">
              <div className="form-group">
                <label htmlFor="oldPassword" className="form-label">
                  <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <circle cx="12" cy="16" r="1" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Current Password
                </label>
                <div className="input-container password-container">
                  <input
                    id="oldPassword"
                    type={showOldPassword ? "text" : "password"}
                    className="form-input"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter your current password"
                    disabled={isSubmittingPassword}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    disabled={isSubmittingPassword}
                  >
                    {showOldPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">
                  <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <circle cx="12" cy="16" r="1" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  New Password
                </label>
                <div className="input-container password-container">
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    className="form-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                    disabled={isSubmittingPassword}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={isSubmittingPassword}
                  >
                    {showNewPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {passwordMessage.text && (
                <div className={`message-container ${passwordMessage.type}`}>
                  <div className="message-icon">
                    {passwordMessage.type === "success" ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22,4 12,14.01 9,11.01" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                    )}
                  </div>
                  <p className="message-text">{passwordMessage.text}</p>
                </div>
              )}

              <button type="submit" className="btn btn-primary password-btn" disabled={isSubmittingPassword}>
                {isSubmittingPassword ? (
                  <div className="button-loading">
                    <div className="loading-spinner small"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="button-content">
                    <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                      <polyline points="16,6 12,2 8,6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                    Change Password
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ProfilePage
