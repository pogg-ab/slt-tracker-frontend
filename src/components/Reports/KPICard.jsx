// src/components/Reports/KPICard.jsx
import React from 'react';
import './KPICard.css'; // We'll create this

const KPICard = ({ title, value, unit }) => {
    return (
        <div className="kpi-card">
            <div className="kpi-value">{value}</div>
            <div className="kpi-title">{title}</div>
            {unit && <div className="kpi-unit">{unit}</div>}
        </div>
    );
};

export default KPICard;