// src/App.jsx

import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

// --- Core Page Imports ---
import LoginPage from './pages/LoginPage';
import ProjectPage from './pages/ProjectPage';
import ProfilePage from './pages/ProfilePage';
import Layout from './components/Layout/Layout'; // The main layout component

// --- Core Component Imports ---
import ProtectedRoute from './components/ProtectedRoute';

// --- View Imports for Nested Routes ---
import BoardView from './components/Board/BoardView';
import BacklogView from './components/Backlog/BacklogView';
import ReportsView from './components/Reports/ReportsView';
import SettingsView from './components/Settings/SettingsView';
import AdminRoute from './components/common/AdminRoute';
import UserManagementPage from './pages/Admin/UserManagementPage';

/**
 * This is a wrapper component. Any route nested inside it will automatically
 * be rendered within our main <Layout>, ensuring a consistent UI.
 */
const AppLayout = () => (
  <Layout>
    <Outlet />
  </Layout>
);

function App() {
  return (
    <Routes>
      {/* --- Public Route --- */}
      <Route path="/login" element={<LoginPage />} />

      {/* --- This is the main container for ALL protected routes --- */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* All routes defined inside here will automatically have the main Layout */}

        {/* Standalone pages like Profile */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin/users" element={<UserManagementPage />} />
          {/* Add other admin routes here in the future */}
        </Route>
        {/* The main project-related routes */}
        <Route path="/projects/:projectId" element={<ProjectPage />}>
          {/* Child routes that render inside ProjectPage's <Outlet> */}
          <Route path="board" element={<BoardView />} />
          <Route path="backlog" element={<BacklogView />} />
          <Route path="reports" element={<ReportsView />} />
          <Route path="settings" element={<SettingsView />} />

          {/* A default child route: if someone goes to /projects/123, redirect them to the board */}
          <Route index element={<Navigate to="board" replace />} />
        </Route>
      </Route>

      {/* --- Special handler for the initial redirect --- */}
      {/* This route catches the initial "/projects/null" and renders ProjectPage
          within the layout, allowing it to perform the initial redirection while looking correct. */}
      <Route
        path="/projects/null"
        element={
          <ProtectedRoute>
            <Layout>
              <ProjectPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* --- Fallback / Catch-all Route --- */}
      {/* Redirects any other URL (like "/" or "/dashboard") to our initial handler */}
      <Route path="*" element={<Navigate to="/projects/null" replace />} />

    </Routes>
  );
}

export default App;