// src/components/Tasks/TaskList.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks, deleteTask as apiDeleteTask } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../common/Spinner';
import './TaskList.css';

const TaskList = ({ refreshKey }) => {
    // Using standard useState for direct control over the task list
    const [tasks, setTasks] = useState([]); 
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const navigate = useNavigate();
    const { user, hasPermission } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    // useCallback stabilizes the fetchTasks function reference
    const fetchTasks = useCallback(async (params) => {
        try {
            setLoading(true);
            const response = await getTasks(params);
            setTasks(response.data);
        } catch (err) {
            setError('Failed to load tasks.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // This effect handles fetching and debouncing the search
    useEffect(() => {
        const params = {};
        if (searchTerm.trim() !== '') {
            params.search = searchTerm;
        }
        const delayDebounceFn = setTimeout(() => {
            fetchTasks(params);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [fetchTasks, searchTerm, refreshKey]);

    const handleDeleteTask = async (taskIdToDelete, event) => {
        event.stopPropagation();
        if (window.confirm('Are you sure you want to permanently delete this task?')) {
            try {
                await apiDeleteTask(taskIdToDelete);
                setTasks(currentTasks => currentTasks.filter(task => task.task_id !== taskIdToDelete));
            } catch (err) {
                if (err.response && err.response.status === 404) {
                     setTasks(currentTasks => currentTasks.filter(task => task.task_id !== taskIdToDelete));
                } else {
                    alert('Failed to delete the task.');
                }
            }
        }
    };

    // === FINAL 3-SECTION LOGIC ===
    // 1. Tasks assigned TO the logged-in user
    const myAssignedTasks = tasks?.filter(task => task.assignee_id === user.user_id) || [];
    
    // 2. Tasks assigned BY the logged-in user to SOMEONE ELSE
    const myCreatedTasks = tasks?.filter(task => task.assigner_id === user.user_id && task.assignee_id !== user.user_id) || [];
    
    // 3. All other tasks in the department (visible only if user has VIEW_ANY_TASK permission)
    const otherDepartmentTasks = hasPermission('VIEW_ANY_TASK') 
        ? tasks?.filter(task => task.assignee_id !== user.user_id && task.assigner_id !== user.user_id) || []
        : [];
    // =============================

    if (loading) return <Spinner />;
    if (error) return <p className="error-message">{error}</p>;

    const renderTaskItem = (task, context) => (
    <li key={task.task_id} className="task-item" onClick={() => navigate(`/tasks/${task.task_id}`)}>
        <div className="task-item-content">
            <div className="task-info">
                <span className="task-title">{task.title}</span>
                <span className="task-priority">
                    {context === 'my-tasks' ? `From: ${task.assigner_name}` : `To: ${task.assignee_name}`}
                </span>
            </div>
        </div>
        <div className="task-footer">
            <div className={`task-status status-${task.status.toLowerCase().replace(' ', '-')}`}>{task.status}</div>
            {hasPermission('DELETE_ANY_TASK') && (
                <button className="delete-btn" title="Delete Task" onClick={(e) => handleDeleteTask(task.task_id, e)}>×</button>
            )}
        </div>
    </li>
);
    return (
        <div className="task-list-container">
            {/* --- Section 1: My Tasks --- */}
            <div className="task-section">
                <div className="task-list-header">
                    <h2>My Tasks</h2>
                    <div className="task-search">
                        <input type="text" placeholder="Search all tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>
                {myAssignedTasks.length > 0 ? (
                    <ul className="task-list">{myAssignedTasks.map(task => renderTaskItem(task, 'my-tasks'))}</ul>
                ) : (
                    <div className="no-tasks-view"><p>You have no tasks assigned to you. Great job!</p></div>
                )}
            </div>

            {/* --- Section 2: Tasks I've Assigned --- */}
            {myCreatedTasks.length > 0 && (
                <div className="task-section">
                    <div className="task-list-header"><h2>Tasks I've Assigned</h2></div>
                    <ul className="task-list">{myCreatedTasks.map(task => renderTaskItem(task, 'created-by-me'))}</ul>
                </div>
            )}
            
            {/* --- Section 3: All Other Department Tasks (for CEO) --- */}
            {otherDepartmentTasks.length > 0 && (
                <div className="task-section">
                    <div className="task-list-header"><h2>All Department Tasks</h2></div>
                    <ul className="task-list">{otherDepartmentTasks.map(task => renderTaskItem(task, 'other'))}</ul>
                </div>
            )}
        </div>
    );
};

export default TaskList;