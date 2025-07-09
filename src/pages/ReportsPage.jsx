import React, { useEffect } from 'react';

// Import all necessary components and hooks
import Layout from '../components/Layout/Layout';
import DepartmentWorkload from '../components/Reports/DepartmentWorkload';
import TimeAllocation from '../components/Reports/TimeAllocation';
import KPICard from '../components/Reports/KPICard';
import Spinner from '../components/common/Spinner';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { getDepartmentKpiReport } from '../services/api';
import './ReportsPage.css';

const ReportsPage = () => {
    const { user } = useAuth();
    
    const { 
        data: kpiData, 
        loading: kpiLoading, 
        request: fetchKpis 
    } = useApi(getDepartmentKpiReport);

    // This useEffect hook handles data fetching
    useEffect(() => {
        const loadKpiData = () => {
            if (user?.department_id) {
                fetchKpis(user.department_id);
            }
        };

        // Load data when the component first mounts
        loadKpiData();

        // Add an event listener to re-fetch data whenever the browser tab becomes visible again
        window.addEventListener('visibilitychange', loadKpiData);

        // Cleanup: remove the event listener when the component unmounts
        return () => {
            window.removeEventListener('visibilitychange', loadKpiData);
        };
        
    }, [user, fetchKpis]); // Dependency array

    return (
        <Layout>
            <div className="reports-page">
                <div className="reports-header">
                    <h1>Reports Dashboard</h1>
                    <p>Analytics and insights for your team's performance.</p>
                </div>

                <div className="kpi-grid">
                    {kpiLoading ? <Spinner /> : (
                        <>
                            <KPICard title="Pending Tasks" value={kpiData?.pending_tasks ?? '0'} />
                            <KPICard title="Completed This Week" value={kpiData?.completed_this_week ?? '0'} />
                            <KPICard title="Hours Logged This Week" value={kpiData?.hours_this_week ?? '0.0'} />
                        </>
                    )}
                </div>
                
                <div className="charts-grid">
                    <div className="report-widget">
                        <h3>Tasks Assigned Per User</h3>
                        <DepartmentWorkload />
                    </div>
                    <div className="report-widget">
                        <h3>Time Spent Per Task (in minutes)</h3>
                        <TimeAllocation />
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ReportsPage;