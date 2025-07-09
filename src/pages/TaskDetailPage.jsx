import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// Import services and hooks
import { getTaskById, getDepartmentUsers } from '../services/api';
import { useAuth } from '../context/AuthContext'; // 1. Import useAuth to get user info

// Import UI components
import Layout from '../components/Layout/Layout';
import TaskDetail from '../components/Tasks/TaskDetail';
import Spinner from '../components/common/Spinner';

const TaskDetailPage = () => {
    const { taskId } = useParams();      // Get the task ID from the URL
    const { user } = useAuth();          // 2. Get the logged-in user from our AuthContext
    
    // State for the component
    const [task, setTask] = useState(null);
    const [users, setUsers] = useState([]);  // We still need this for passing down to TaskDetail
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // This useEffect hook fetches all the data needed for this page
   // Corrected useEffect block in TaskDetailPage.jsx
useEffect(() => {
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const apiCalls = [
                getTaskById(taskId)
            ];

            // Use our new V2 permission system here
            if (user && user.permissions && user.permissions.includes('CREATE_SUBTASK')) {
                apiCalls.push(getDepartmentUsers());
            }

            const responses = await Promise.all(apiCalls);
            
            setTask(responses[0].data);

            if (responses.length > 1 && responses[1]) {
                setUsers(responses[1].data);
            }
            
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch page data.');
            console.error(err);
        } finally {
            setLoading(false);
            // The stray underscore on the next line has been removed
        }
    };

    if (taskId && user) {
        fetchData();
    }
}, [taskId, user]); // Re-run this effect if the taskId or the user changes

    // Helper function to decide what to render based on state
    const renderContent = () => {
        if (loading) return <Spinner />;
        if (error) return <p className="error-message">{error}</p>;
        // If we have a task, render the TaskDetail component, passing the data down
        if (task) return <TaskDetail task={task} users={users} />;
        return null;
    };

    return (
        <Layout>
            {renderContent()}
        </Layout>
    );
};

export default TaskDetailPage;