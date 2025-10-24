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
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // --- THIS IS THE CORRECTED LOGIC ---
                // Start with an array of API calls that everyone needs
                const apiCalls = [
                    getTaskById(taskId) // Everyone needs to fetch the task itself
                ];

                // 3. Conditionally add the second API call ONLY if the user is a Manager
                if (user && user.role === 'Manager') {
                    apiCalls.push(getDepartmentUsers());
                }

                // 4. Execute all the necessary API calls in parallel
                const responses = await Promise.all(apiCalls);
                
                // 5. Process the responses
                setTask(responses[0].data); // The first response is always the task

                if (responses.length > 1 && responses[1]) {
                    // If there was a second response, it's the users list
                    setUsers(responses[1].data);
                }
                
            } catch (err) {
                // If any API call fails, set the error state
                setError(err.response?.data?.message || 'Failed to fetch page data.');
                console.error(err);
            } finally {
                setLoading(false);
_            }
        };

        // Ensure we have both a taskId and a user object before fetching
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