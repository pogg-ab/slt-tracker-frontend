// src/pages/ceo/DepartmentsPage.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import { useApi } from '../../hooks/useApi';
import { getAllDepartments } from '../../services/api';
import Spinner from '../../components/common/Spinner';
import './CeoPages.css'; // We'll create a shared CSS file

const DepartmentsPage = () => {
    const { data: departments, loading, error, request: fetchDepartments } = useApi(getAllDepartments);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    return (
        <Layout>
            <div className="ceo-page-container">
                <div className="ceo-header">
                    <h1>Company Departments</h1>
                    <p>Select a department to view its members and activity.</p>
                </div>
                {loading && <Spinner />}
                {error && <p className="error-message">{error}</p>}
                <div className="ceo-list">
                    {departments && departments.map(dept => (
                        <Link to={`/ceo/department/${dept.department_id}`} key={dept.department_id} className="ceo-list-item">
                            <span className="item-title">{dept.name}</span>
                            <span className="item-arrow">→</span>
                        </Link>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default DepartmentsPage;