// src/pages/ceo/DepartmentDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import { getDepartmentUsersWithStats } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import Spinner from '../../components/common/Spinner';
import './CeoPages.css';

const DepartmentDetailPage = () => {
    const { deptId } = useParams(); // Get department ID from URL
    const { data: users, loading, error, request: fetchUsers } = useApi(getDepartmentUsersWithStats);

    useEffect(() => {
        if (deptId) {
            fetchUsers(deptId);
        }
    }, [deptId, fetchUsers]);

    return (
        <Layout>
            <div className="ceo-page-container">
                <div className="ceo-header">
                    {/* We could fetch department name here, or just show the ID */}
                    <h1>Department Roster</h1>
                    <Link to="/ceo/departments" className="back-link">← Back to All Departments</Link>
                </div>
                {loading && <Spinner />}
                {error && <p className="error-message">{error}</p>}
                <div className="ceo-list">
                    {users && users.map(user => (
                        <Link to={`/ceo/user/${user.user_id}`} key={user.user_id} className="ceo-list-item user-item">
                            <div className="item-main-info">
                                <span className="item-title">{user.name}</span>
                                <span className="item-subtitle">{user.job_title}</span>
                            </div>
                            <div className="item-stats">
                                <span>{user.tasks_assigned_to} tasks assigned</span>
                                <span>{user.tasks_created_by} tasks created</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default DepartmentDetailPage;