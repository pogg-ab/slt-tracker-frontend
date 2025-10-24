// src/components/Reports/ReportsView.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { getSprintsForProject } from '../../services/api';
import BurndownChart from './BurndownChart';
import Spinner from '../common/Spinner';
import './ReportsView.css';

const ReportsView = () => {
    const { projectId } = useParams();
    const [selectedSprintId, setSelectedSprintId] = useState('');
    const { data: sprints, loading, request: fetchSprints } = useApi(getSprintsForProject);

    useEffect(() => {
        if (projectId) {
            fetchSprints(projectId);
        }
    }, [projectId, fetchSprints]);

    // Automatically select the first "Active" sprint if one exists
    useEffect(() => {
        if (sprints) {
            const activeSprint = sprints.find(s => s.status === 'Active');
            if (activeSprint) {
                setSelectedSprintId(activeSprint.sprint_id);
            } else if (sprints.length > 0) {
                setSelectedSprintId(sprints[0].sprint_id);
            }
        }
    }, [sprints]);
    
    if (loading) return <Spinner />;

    return (
        <div className="reports-view">
            <h2>Project Reports</h2>
            
            <div className="report-widget">
                <div className="widget-header">
                    <h3>Sprint Burndown</h3>
                    <select 
                        value={selectedSprintId} 
                        onChange={(e) => setSelectedSprintId(e.target.value)}
                    >
                        <option value="" disabled>-- Select a Sprint --</option>
                        {sprints && sprints.map(sprint => (
                            <option key={sprint.sprint_id} value={sprint.sprint_id}>
                                {sprint.name} ({sprint.status})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="widget-content">
                    {selectedSprintId ? (
                        <BurndownChart sprintId={selectedSprintId} />
                    ) : (
                        <p>Please select a sprint to view the burndown chart.</p>
                    )}
                </div>
            </div>
            
            {/* Future: Add more report widgets here */}
        </div>
    );
};

export default ReportsView;