// src/pages/ReportsPage.jsx

"use client"

import { useEffect } from "react"
import Layout from "../components/Layout/Layout"
import DepartmentWorkload from "../components/Reports/DepartmentWorkload"
import TimeAllocation from "../components/Reports/TimeAllocation"
import Spinner from "../components/common/Spinner"
import { useAuth } from "../context/AuthContext"
import { useApi } from "../hooks/useApi"
import { getDepartmentKpiReport } from "../services/api"
import "./ReportsPage.css"

const ReportsPage = () => {
  const { user } = useAuth()

  const { data: kpiData, loading: kpiLoading, request: fetchKpis } = useApi(getDepartmentKpiReport)

  useEffect(() => {
    const loadKpiData = () => {
      if (user?.department_id) {
        fetchKpis(user.department_id)
      }
    }
    loadKpiData()
    window.addEventListener("visibilitychange", loadKpiData)
    return () => {
      window.removeEventListener("visibilitychange", loadKpiData)
    }
  }, [user, fetchKpis])

  return (
    <Layout>
      <div className="reports-page">
        {/* Reports Header */}
        <div className="reports-header">
          <div className="header-content">
            <div className="header-left">
              <div className="header-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <div className="header-text">
                <h1 className="reports-title">Reports Dashboard</h1>
                <p className="reports-subtitle">Analytics and insights for your team's performance</p>
              </div>
            </div>
            <div className="header-actions">
              <button className="refresh-btn" onClick={() => user?.department_id && fetchKpis(user.department_id)}>
                <svg className="refresh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23,4 23,10 17,10" /><polyline points="1,20 1,14 7,14" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                </svg>
                Refresh Data
              </button>
              {/* === The Export button has been removed from here === */}
            </div>
          </div>
        </div>

        {/* KPI Section */}
        <div className="kpi-section">
          <div className="section-header">
            <h2 className="section-title">Key Performance Indicators</h2>
            <p className="section-subtitle">Real-time metrics for your department</p>
          </div>

          <div className="kpi-grid">
            {kpiLoading ? (
              <div className="kpi-loading">
                <Spinner /><p>Loading KPI data...</p>
              </div>
            ) : (
              <>
                <div className="kpi-card-wrapper">
                  <div className="kpi-card pending">
                    <div className="kpi-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" /></svg></div>
                    <div className="kpi-content">
                      <div className="kpi-value">{kpiData?.pending_tasks ?? "0"}</div>
                      <div className="kpi-label">Pending Tasks</div>
                      {/* === The static trend text has been removed === */}
                    </div>
                  </div>
                </div>

                <div className="kpi-card-wrapper">
                  <div className="kpi-card completed">
                    <div className="kpi-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22,4 12,14.01 9,11.01" /></svg></div>
                    <div className="kpi-content">
                      <div className="kpi-value">{kpiData?.completed_this_week ?? "0"}</div>
                      <div className="kpi-label">Completed This Week</div>
                      {/* === The static trend text has been removed === */}
                    </div>
                  </div>
                </div>

                <div className="kpi-card-wrapper">
                  <div className="kpi-card hours">
                    <div className="kpi-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" /></svg></div>
                    <div className="kpi-content">
                      <div className="kpi-value">{kpiData?.hours_this_week ?? "0.0"}</div>
                      <div className="kpi-label">Hours Logged This Week</div>
                      {/* === The static trend text has been removed === */}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="section-header">
            <h2 className="section-title">Detailed Analytics</h2>
            <p className="section-subtitle">Comprehensive insights into team performance</p>
          </div>
          <div className="charts-grid">
            <div className="report-widget workload-widget">
              <div className="widget-header">
                <div className="widget-title">
                  <div className="widget-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg></div>
                  <div><h3>Tasks Assigned Per User</h3><p>Distribution of workload across team members</p></div>
                </div>
                <div className="widget-actions"><button className="widget-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1.06 1.56V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.56-1.06H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1.06-1.56V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.06 1.56 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.56 1.06H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.56 1.06z" /></svg></button></div>
              </div>
              <div className="widget-content"><DepartmentWorkload /></div>
            </div>

            <div className="report-widget time-widget">
              <div className="widget-header">
                <div className="widget-title">
                  <div className="widget-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" /></svg></div>
                  <div><h3>Time Spent Per Task</h3><p>Time allocation breakdown in minutes</p></div>
                </div>
                <div className="widget-actions"><button className="widget-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1.06 1.56V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.56-1.06H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1.06-1.56V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.06 1.56 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.56 1.06H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.56 1.06z" /></svg></button></div>
              </div>
              <div className="widget-content"><TimeAllocation /></div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ReportsPage