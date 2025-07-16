// src/App.jsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// --- Import Page Components ---
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TaskDetailPage from './pages/TaskDetailPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import UserManagementPage from './pages/UserManagementPage';
import ResetPasswordPage from './pages/ResetPasswordPage'; // <-- 1. IMPORT THE NEW PAGE

// --- Import CEO-Specific Page Components ---
import DepartmentsPage from './pages/ceo/DepartmentsPage';
import DepartmentDetailPage from './pages/ceo/DepartmentDetailPage';
import UserTaskViewPage from './pages/ceo/UserTaskViewPage';

// --- Import Route Protection Components ---
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRedirect from './components/common/AdminRedirect';

function App() {
  return (
    <Routes>
      {/* === PUBLIC ROUTES === */}
      {/* These routes are accessible to anyone, logged in or not. */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} /> {/* <-- 2. ADD THE NEW PUBLIC ROUTE */}
      
      {/* === DEFAULT LANDING ROUTE === */}
      {/* This route redirects logged-in users to their correct starting page. */}
      <Route 
        path="/"
        element={
          <ProtectedRoute>
            <AdminRedirect />
          </ProtectedRoute>
        }
      />

      {/* === CEO-ONLY ROUTES === */}
      <Route 
        path="/ceo/departments"
        element={
          <ProtectedRoute requiredPermission="VIEW_COMPANY_OVERVIEW">
            <DepartmentsPage />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/ceo/department/:deptId"
        element={
          <ProtectedRoute requiredPermission="VIEW_COMPANY_OVERVIEW">
            <DepartmentDetailPage />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/ceo/user/:userId"
        element={
          <ProtectedRoute requiredPermission="VIEW_COMPANY_OVERVIEW">
            <UserTaskViewPage />
          </ProtectedRoute>
        }
      />
      
      {/* === ADMIN-ONLY ROUTES === */}
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requiredPermission="MANAGE_USERS">
            <UserManagementPage />
          </ProtectedRoute>
        }
      />

      {/* === GENERAL PROTECTED ROUTES (for Managers and Staff) === */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tasks/:taskId" 
        element={
          <ProtectedRoute>
            <TaskDetailPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/reports" 
        element={
          <ProtectedRoute requiredPermission="VIEW_REPORTS">
            <ReportsPage />
          </ProtectedRoute>
        } 
      />

      {/* === FALLBACK ROUTE (Simplified) === */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;