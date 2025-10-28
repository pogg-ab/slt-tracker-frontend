"use client"

import { useState } from "react"
import "./LoginPage.css"
import logo from "../assets/logo.png"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  // --- STEP 1: Add state for password visibility ---
  const [showPassword, setShowPassword] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await login({ email, password })
      navigate("/dashboard")
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login failed."
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // --- STEP 2: Create the toggle function ---
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logo || "/placeholder.svg"} alt="Sky Link Logo" className="login-logo" />
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Tracker Login</h2>
          <p>Access your project management dashboard</p>
          {error && <p className="error-message">{error}</p>}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          {/* --- STEP 3: Update the JSX for the password input --- */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <span className="password-toggle-icon" onClick={togglePasswordVisibility}>
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>
          </div>
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
