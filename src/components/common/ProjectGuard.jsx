// src/components/common/ProjectGuard.jsx
import React from 'react';
import { useParams, Navigate, Outlet } from 'react-router-dom';

const ProjectGuard = () => {
    const { projectId } = useParams();

    // If the projectId from the URL is not a valid number...
    if (isNaN(projectId)) {
        // ...redirect to our 'null' handler route, which will then find a real project.
        return <Navigate to="/projects/null" replace />;
    }

    // If the projectId is a valid number, render the child component (our ProjectPage).
    // <Outlet /> is a placeholder for nested routes.
    return <Outlet />;
};

export default ProjectGuard;