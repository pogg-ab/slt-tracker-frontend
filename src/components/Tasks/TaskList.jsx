import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../common/Spinner';
import './TaskList.css';

const TaskList = ({ refreshKey }) => {
    const { data: tasks, error, loading, request: fetchTasks } = useApi(getTasks);
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

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

    if (loading) {
        return (
            <div className="task-list-container">
                <div className="loading-state">
                    <Spinner />
                    <p>Loading tasks...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="task-list-container">
                <div className="error-message">
                    Error fetching tasks: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="task-list-container">
            <div className="task-list-header">
                <h2>My Tasks</h2>
                <div className="task-search">
                    <input
                        type="text"
                        placeholder="Search tasks by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            
            {tasks && tasks.length > 0 ? (
                <ul className="task-list">
                    {tasks.map(task => (
                        <li 
                            key={task.task_id} 
                            className={`task-item status-${task.status.toLowerCase().replace(' ', '-')}`}
                            onClick={() => navigate(`/tasks/${task.task_id}`)}
                        >
                            <div className="task-info">
                                <span className="task-title">{task.title}</span>
                                <div className="task-meta">
                                    <span className={`task-priority ${task.priority.toLowerCase()}`}>
                                        {task.priority}
                                    </span>
                                    {task.project_key && (
                                        <span className="task-project">
                                            {task.project_key}-{task.task_id}
                                        </span>
                                    )}
                                    {task.assignee && (
                                        <span className="task-assignee">
                                            <div className="assignee-avatar">
                                                {task.assignee.name ? task.assignee.name.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                            {task.assignee.name || 'Unassigned'}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="task-status">{task.status}</div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="no-tasks-view">
                    <h3>No Tasks Found</h3>
                    {searchTerm ? (
                        <p>Your search for "{searchTerm}" did not match any tasks.</p>
                    ) : user?.role === 'Manager' ? (
                        <p>Try creating a new task for your team!</p>
                    ) : (
                        <p>You have no tasks assigned to you. Great job!</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default TaskList;