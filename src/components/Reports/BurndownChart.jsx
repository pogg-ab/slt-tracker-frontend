// src/components/Reports/BurndownChart.jsx
import React, { useEffect, useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import { getSprintBurndownChart } from '../../services/api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import Spinner from '../common/Spinner';
import './BurndownChart.css'; // Import CSS

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const BurndownChart = ({ sprintId, sprintName }) => {
    const { data: chartData, loading, error, request: fetchChartData } = useApi(getSprintBurndownChart);

    useEffect(() => {
        if (sprintId) {
            fetchChartData(sprintId);
        }
    }, [sprintId, fetchChartData]);

    const data = useMemo(() => {
        if (!chartData) return { labels: [], datasets: [] };
        
        return {
            labels: chartData.ideal.map(d => d.date),
            datasets: [
                {
                    label: 'Ideal Burndown',
                    data: chartData.ideal.map(d => d.remaining),
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderDash: [5, 5],
                    pointRadius: 0,
                },
                {
                    label: 'Actual Remaining',
                    data: chartData.actual.map(d => d.remaining),
                    borderColor: 'rgb(53, 162, 235)',
                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
                    tension: 0.1,
                },
            ],
        };
    }, [chartData]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { 
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 15,
                }
            },
            title: { 
                display: true, 
                text: sprintName ? `Sprint Burndown - ${sprintName}` : 'Sprint Burndown Chart',
                font: {
                    size: 16,
                    weight: 'bold'
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { 
                    display: true, 
                    text: 'Tasks Remaining',
                    font: {
                        weight: 'bold'
                    }
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Sprint Days',
                    font: {
                        weight: 'bold'
                    }
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    };

    // Calculate some basic stats
    const stats = useMemo(() => {
        if (!chartData || chartData.actual.length === 0) return null;
        
        const actualData = chartData.actual;
        const initialTasks = actualData[0]?.remaining || 0;
        const currentTasks = actualData[actualData.length - 1]?.remaining || 0;
        const completedTasks = initialTasks - currentTasks;
        const completionRate = initialTasks > 0 ? ((completedTasks / initialTasks) * 100).toFixed(1) : 0;
        
        return {
            initialTasks,
            currentTasks,
            completedTasks,
            completionRate
        };
    }, [chartData]);

    if (loading) return (
        <div className="burndown-chart-container">
            <div className="burndown-chart-loading">
                <Spinner />
            </div>
        </div>
    );
    
    if (error) return (
        <div className="burndown-chart-container">
            <div className="burndown-chart-error">
                <p>Could not load chart data: {error}</p>
            </div>
        </div>
    );
    
    if (!chartData || chartData.ideal.length === 0) return (
        <div className="burndown-chart-container">
            <div className="burndown-chart-empty">
                <p>No data available for this sprint.</p>
            </div>
        </div>
    );

    return (
        <div className="burndown-chart-container">
            <div className="burndown-chart-wrapper">
                <Line options={options} data={data} />
            </div>
            
            {/* Custom Legend */}
            <div className="chart-legend">
                <div className="legend-item">
                    <div className="legend-color legend-ideal"></div>
                    <span>Ideal Burndown</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color legend-actual"></div>
                    <span>Actual Progress</span>
                </div>
            </div>
            
            {/* Stats Summary */}
            {stats && (
                <div className="burndown-chart-stats">
                    <div className="stat-item">
                        <span className="stat-value">{stats.initialTasks}</span>
                        <span className="stat-label">Initial Tasks</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{stats.completedTasks}</span>
                        <span className="stat-label">Tasks Completed</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{stats.currentTasks}</span>
                        <span className="stat-label">Tasks Remaining</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{stats.completionRate}%</span>
                        <span className="stat-label">Completion Rate</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BurndownChart;