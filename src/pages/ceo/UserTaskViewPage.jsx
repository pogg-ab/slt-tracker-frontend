// src/pages/ceo/UserTaskViewPage.jsx
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import { useApi } from '../../hooks/useApi';
import { getRelatedTasksForUser, getUserWithPermissions } from '../../services/api';
import Spinner from '../../components/common/Spinner';
import './CeoPages.css';

const UserTaskViewPage = () => {
    const { userId } = useParams();
    const { data: tasks, loading: tasksLoading, request: fetchTasks } = useApi(getRelatedTasksForUser);
    const { data: user, loading: userLoading, request: fetchUser } = useApi(getUserWithPermissions);

    useEffect(() => {
        if (userId) {
            fetchTasks(userId);
            fetchUser(userId);
        }
    }, [userId, fetchTasks, fetchUser]);

    const loading = tasksLoading || userLoading;

    return (
        <Layout>
            <div className="ceo-page-container">
                <div className="ceo-header">
                    <h1>Task View for {user ? user.name : '...'}</h1>
                    {user && (
                         <Link to={`/ceo/department/${user.department_id}`} className="back-link">← Back to Department</Link>
                    )}
                </div>
                {loading && <Spinner />}
                {!loading && tasks && tasks.length > 0 ? (
                    <ul className="ceo-task-list">
                        {tasks.map(task => (
                            <li key={task.task_id} className={`ceo-task-item status-border-${task.status.toLowerCase().replace(' ', '-')}`}>
                                <div className="task-info">
                                    <span className="task-title">{task.title}</span>
                                    <span className="task-assignment">
                                        From: {task.assigner_name} → To: {task.assignee_name}
                                    </span>
                                </div>
                                <div className="task-status">{task.status}</div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    !loading && <p>This user is not currently assigned to or has not assigned any tasks.</p>
                )}
            </div>
        </Layout>
    );
};

export default UserTaskViewPage;