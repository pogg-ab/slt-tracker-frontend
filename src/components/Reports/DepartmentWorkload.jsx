// src/components/Reports/DepartmentWorkload.jsx
import React, { useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { getDepartmentWorkloadReport } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Spinner from '../common/Spinner';

// Register the necessary components for Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DepartmentWorkload = () => {
    const { user } = useAuth();
    const { data: reportData, loading, error, request: fetchReport } = useApi(getDepartmentWorkloadReport);

    useEffect(() => {
        if (user?.department_id) {
            fetchReport(user.department_id);
        }
    }, [user, fetchReport]);

    // Prepare data for the chart
    const chartData = {
        labels: reportData ? reportData.map(item => item.name) : [],
        datasets: [
            {
                label: 'Number of Assigned Tasks',
                data: reportData ? reportData.map(item => item.assigned_tasks) : [],
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Tasks Assigned Per User' },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1, // Ensure y-axis shows whole numbers for task counts
                }
            }
        }
    };

    if (loading) return <Spinner />;
    if (error) return <p className="error-message">Could not load report.</p>;

    return (
        <div>
            {reportData ? <Bar options={chartOptions} data={chartData} /> : <p>No data available.</p>}
        </div>
    );
};

export default DepartmentWorkload;