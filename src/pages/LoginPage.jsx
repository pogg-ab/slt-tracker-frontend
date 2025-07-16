"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import logo from "/src/assets/logo.png"
import Spinner from "../components/common/Spinner"
import RequestPasswordResetModal from "../components/common/RequestPasswordResetModal"
import "./LoginPage.css"

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const loggedInUser = await login({ email, password })

      if (loggedInUser?.permissions.includes("MANAGE_USERS")) {
        navigate("/admin/users")
      } else {
        navigate("/dashboard")
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login failed. Please check your credentials."
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      {/* Background Decoration */}
      <div className="login-background">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
        <div className="bg-shape shape-4"></div>
      </div>

      {/* Login Card */}
      <div className="login-card">
        {/* Logo Section */}
        <div className="login-header">
          <div className="logo-container">
            <img src={logo || "/placeholder.svg"} alt="Sky Link Logo" className="login-logo" />
          </div>
          <div className="login-title">
            <h1>Welcome Back</h1>
            <p>Sign in to your account to continue</p>
          </div>
        </div>

        {/* Login Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-container">
              <div className="error-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <p className="error-message">{error}</p>
            </div>
          )}

          {/* Email Field */}
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
                type="email"
                id="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <circle cx="12" cy="16" r="1" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Password
            </label>
            <div className="input-container password-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
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

          {/* Login Button */}
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? (
              <div className="button-loading">
                <Spinner small={true} />
                <span>Signing in...</span>
              </div>
            ) : (
              <div className="button-content">
                <span>Sign In</span>
                <svg className="button-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12,5 19,12 12,19" />
                </svg>
              </div>
            )}
          </button>

          {/* Forgot Password Link */}
          <div className="login-links">
            <button
              type="button"
              className="forgot-password-link"
              onClick={() => setIsForgotPasswordOpen(true)}
              disabled={isLoading}
            >
              <svg className="link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Forgot your password?
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <p>© 2024 SLT-Tracker. All rights reserved.</p>
        </div>
      </div>

      {/* Modal */}
      {isForgotPasswordOpen && <RequestPasswordResetModal onClose={() => setIsForgotPasswordOpen(false)} />}
    </div>
  )
}

export default LoginPage
