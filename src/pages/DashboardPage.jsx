// src/pages/DashboardPage.jsx

"use client"

import { useState, useEffect } from "react"
import Layout from "../components/Layout/Layout"
import TaskList from "../components/Tasks/TaskList"
import CreateTaskModal from "../components/Tasks/CreateTaskModal"
import { useAuth } from "../context/AuthContext"
import { useApi } from "../hooks/useApi"
import { getDashboardStats } from "../services/api"
import "./DashboardPage.css"

const DashboardPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const { hasPermission, user } = useAuth()

  // --- State and Effect for fetching dashboard statistics ---
  const { 
    data: stats, 
    loading: statsLoading, 
    request: fetchStats 
  } = useApi(getDashboardStats);

  useEffect(() => {
    // Fetch stats when the component first mounts, and re-fetch whenever a new task is created.
    fetchStats();
  }, [fetchStats, refreshKey]);

  const handleTaskCreated = () => {
    // Incrementing the key will re-trigger both the TaskList's and this page's useEffect.
    setRefreshKey((prevKey) => prevKey + 1)
  }

  return (
    <Layout>
      <div className="dashboard-page-container">
        {/* Welcome Section */}
        <div className="dashboard-welcome">
          <div className="welcome-content">
            <div className="welcome-text">
              <h1 className="dashboard-title">Good morning, {user?.name?.split(" ")[0] || "User"}! 👋</h1>
              <p className="dashboard-subtitle">Here's what's happening with your tasks today</p>
            </div>
            <div className="welcome-decoration">
              <div className="decoration-circle circle-1"></div>
              <div className="decoration-circle circle-2"></div>
              <div className="decoration-circle circle-3"></div>
            </div>
          </div>
        </div>

        {/* Stats Cards Section (Now Dynamic) */}
        <div className="dashboard-stats">
          {/* Total Tasks Card */}
          <div className="stat-card">
            <div className="stat-icon stat-icon-blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4" /><path d="M9 11V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></svg>
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{statsLoading ? '...' : stats?.total_tasks ?? '0'}</h3>
              <p className="stat-label">Total Tasks</p>
              <span className="stat-change neutral">In your scope</span>
            </div>
          </div>

          {/* In Progress Card */}
          <div className="stat-card">
            <div className="stat-icon stat-icon-orange">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" /></svg>
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{statsLoading ? '...' : stats?.in_progress_tasks ?? '0'}</h3>
              <p className="stat-label">In Progress</p>
              <span className="stat-change neutral">Currently active</span>
            </div>
          </div>

          {/* Completed Card */}
          <div className="stat-card">
            <div className="stat-icon stat-icon-green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22,4 12,14.01 9,11.01" /></svg>
            </div>
            <div className="stat-content">
              <h3 className="stat-number">{statsLoading ? '...' : stats?.completed_tasks ?? '0'}</h3>
              <p className="stat-label">Completed</p>
              <span className="stat-change positive">All time</span>
            </div>
          </div>

          {/* Team Members Card (Conditionally Rendered) */}
          {hasPermission('VIEW_REPORTS') && (
            <div className="stat-card">
              <div className="stat-icon stat-icon-purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{statsLoading ? '...' : stats?.team_members_count ?? '0'}</h3>
                <p className="stat-label">Team Members</p>
                <span className="stat-change neutral">In department</span>
              </div>
            </div>
          )}
        </div>

        {/* Main Dashboard Header for Task List */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="header-left">
              <h2 className="section-title">Recent Tasks</h2>
              <p className="section-subtitle">Manage and track your tasks efficiently</p>
            </div>
            <div className="header-actions">
              {hasPermission("CREATE_TASK") && (
                <button onClick={() => setIsModalOpen(true)} className="btn btn-primary create-task-btn">
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  Create New Task
                </button>
              )}
              {/* The filter button is currently for show; functionality can be added later */}
              <button className="btn btn-secondary filter-btn">
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" /></svg>
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Task List Container */}
        <div className="task-list-container">
          <TaskList key={refreshKey} />
        </div>

        {/* Modal */}
        {isModalOpen && <CreateTaskModal onClose={() => setIsModalOpen(false)} onTaskCreated={handleTaskCreated} />}
      </div>
    </Layout>
  )
}

export default DashboardPage