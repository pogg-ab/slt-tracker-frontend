import React, { useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { getDepartmentTimeAllocationReport } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import Spinner from '../common/Spinner';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const TimeAllocation = () => {
    const { user } = useAuth();
    const { data: reportData, loading, error, request: fetchReport } = useApi(getDepartmentTimeAllocationReport);

    useEffect(() => {
        if (user?.department_id) {
            fetchReport(user.department_id);
        }
    }, [user, fetchReport]);

    const chartData = {
        labels: reportData ? reportData.map(item => item.title) : [],
        datasets: [
            {
                label: 'Minutes Spent',
                data: reportData ? reportData.map(item => item.total_minutes_spent) : [],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                ],
                borderColor: '#2c2c2c',
                borderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Time Spent Per Task (in minutes)' },
        },
    };

    if (loading) return <Spinner />;
    if (error) return <p className="error-message">Could not load report.</p>;

    return (
        <div style={{ height: '400px' }}> {/* Set a fixed height for the container */}
            {(reportData && reportData.length > 0) 
                ? <Doughnut data={chartData} options={chartOptions} /> 
                : <p>No time has been logged in this department yet.</p>
            }
        </div>
    );
};

export default TimeAllocation;