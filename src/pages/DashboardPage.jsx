import React, { useState } from 'react';
import Layout from '../components/Layout/Layout';
import TaskList from '../components/Tasks/TaskList';
import CreateTaskModal from '../components/Tasks/CreateTaskModal';
import { useAuth } from '../context/AuthContext';
import './DashboardPage.css'; // Don't forget to create and import this CSS file

const DashboardPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0); // This key forces TaskList to re-render
    const { user } = useAuth();

    const handleTaskCreated = () => {
        // When a task is created in the modal, we change the key
        // which forces TaskList to unmount and mount again, triggering a data refetch.
        setRefreshKey(prevKey => prevKey + 1);
    };

    return (
        <Layout>
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                {/* Conditionally render the button only if the user is a Manager */}
                {user?.role === 'Manager' && (
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        className="create-task-btn"
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
        </Layout>
    );
};

export default DashboardPage;