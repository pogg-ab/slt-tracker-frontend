// src/pages/ReportsPage.jsx
import React, { useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import DepartmentWorkload from '../components/Reports/DepartmentWorkload';
import TimeAllocation from '../components/Reports/TimeAllocation';
import KPICard from '../components/Reports/KPICard'; // <-- IMPORT KPI Card
import Spinner from '../components/common/Spinner'; // <-- IMPORT Spinner
import { useAuth } from '../context/AuthContext'; // <-- IMPORT useAuth
import { useApi } from '../hooks/useApi'; // <-- IMPORT useApi
import { getDepartmentKpiReport } from '../services/api'; // <-- IMPORT api function
import './ReportsPage.css';

const ReportsPage = () => {
    const { user } = useAuth();
    const { data: kpiData, loading: kpiLoading, request: fetchKpis } = useApi(getDepartmentKpiReport);

    useEffect(() => {
        if (user?.department_id) {
            fetchKpis(user.department_id);
        }
    }, [user, fetchKpis]);

    return (
        <Layout>
            <div className="reports-page">
                <div className="reports-header">
                    <h1>Reports Dashboard</h1>
                    <p>Analytics and insights for your team's performance.</p>
                </div>

                {/* KPI Section */}
                <div className="kpi-grid">
                    {kpiLoading ? <Spinner /> : (
                        <>
                            <KPICard title="Pending Tasks" value={kpiData?.pending_tasks ?? '0'} />
                            <KPICard title="Hours Logged This Week" value={kpiData?.hours_this_week ?? '0.0'} />
                            {/* Add more KPI cards here later */}
                            <div className="kpi-card-placeholder"></div>
                            <div className="kpi-card-placeholder"></div>
                        </>
                    )}
                </div>
                
                {/* Charts Section */}
                <div className="reports-grid">
                    <div className="report-widget">
                        <DepartmentWorkload />
                    </div>
                    <div className="report-widget">
                        <TimeAllocation />
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ReportsPage;