// src/pages/DashboardPage.jsx
import React, { useState } from 'react';
import Layout from '../components/Layout/Layout';
import TaskList from '../components/Tasks/TaskList';
import CreateTaskModal from '../components/Tasks/CreateTaskModal';
import { useAuth } from '../context/AuthContext';
import './DashboardPage.css'; // This CSS file will now style the container

const DashboardPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    // useAuth provides the hasPermission function
    const { hasPermission } = useAuth();

    const handleTaskCreated = () => {
        setRefreshKey(prevKey => prevKey + 1);
    };

    return (
        <Layout>
            {/* 1. The entire page content is wrapped in our new container class */}
            <div className="dashboard-page-container">
            
                <div className="dashboard-header">
                    <h1>Dashboard</h1>
                    
                    {/* Check for 'CREATE_TASK' permission */}
                    {hasPermission('CREATE_TASK') && (
                        // In DashboardPage.jsx
<button 
    onClick={() => setIsModalOpen(true)} 
    className="btn btn-primary" // <-- This is correct
>
    + Create New Task
</button>
                    )}
                </div>
                
                <TaskList key={refreshKey} />

                {isModalOpen && (
                    <CreateTaskModal 
                        onClose={() => setIsModalOpen(false)} 
                        onTaskCreated={handleTaskCreated}
                    />
                )}
                
            </div>
        </Layout>
    );
};

export default DashboardPage;