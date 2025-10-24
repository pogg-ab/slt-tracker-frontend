// src/pages/Admin/UserManagementPage.jsx

import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { getDepartments, createDepartment, createUser } from '../../services/api';
import Spinner from '../../components/common/Spinner';
// Add this import at the top of your UserManagementPage.jsx
import './UserManagementPage.css';


const UserManagementPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        department_id: '',
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [departments, setDepartments] = useState([]);

    // State for the new department creation UI
    const [showAddDept, setShowAddDept] = useState(false);
    const [newDepartmentName, setNewDepartmentName] = useState('');

    // API Hooks
    const { loading: loadingDepts, request: fetchDepartments } = useApi(getDepartments);
    const { loading: creatingDept, request: submitCreateDept } = useApi(createDepartment);
    const { loading: creatingUser, request: submitCreateUser } = useApi(createUser);

    useEffect(() => {
        fetchDepartments()
            .then(data => setDepartments(data || []))
            .catch(err => console.error("Failed to fetch departments", err));
    }, [fetchDepartments]);

    const handleCreateDepartment = async () => {
        if (!newDepartmentName.trim()) {
            alert('Please enter a department name.');
            return;
        }
        try {
            const newDept = await submitCreateDept({ name: newDepartmentName });
            // Add new department to our local state and select it automatically
            setDepartments(prev => [...prev, newDept]);
            setFormData(prev => ({ ...prev, department_id: newDept.department_id }));
            // Reset and hide the input
            setNewDepartmentName('');
            setShowAddDept(false);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create department.');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!formData.department_id) {
            setMessage({ type: 'error', text: 'Please select or create a department.' });
            return;
        }

        try {
            await submitCreateUser(formData);
            setMessage({ type: 'success', text: `User "${formData.name}" created successfully! A welcome email has been sent.` });
            setFormData({ name: '', email: '', department_id: '' }); // Reset form
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create user.' });
        }
    };

    if (loadingDepts) {
        return <Spinner />;
    }

    return (
        <div className="user-management-container">
            <h1>User Management</h1>
            <div className="create-user-form-card">
                <h2>Create New User</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="department_id">Department</label>
                        <div className="department-controls">
                            <select id="department_id" name="department_id" value={formData.department_id} onChange={handleChange} required>
                                <option value="">-- Select a Department --</option>
                                {departments.map(dept => (
                                    <option key={dept.department_id} value={dept.department_id}>{dept.name}</option>
                                ))}
                            </select>
                            <button type="button" className="btn-secondary" onClick={() => setShowAddDept(!showAddDept)}>
                                {showAddDept ? 'Cancel' : '+ New'}
                            </button>
                        </div>
                        {showAddDept && (
                            <div className="add-department-inline">
                                <input
                                    type="text"
                                    placeholder="New department name"
                                    value={newDepartmentName}
                                    onChange={(e) => setNewDepartmentName(e.target.value)}
                                />
                                <button type="button" className="btn-primary" onClick={handleCreateDepartment} disabled={creatingDept}>
                                    {creatingDept ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {/* Global Role dropdown has been REMOVED */}

                    <button type="submit" className="btn btn-primary full-width" disabled={creatingUser}>
                        {creatingUser ? 'Creating...' : 'Create User & Send Invite'}
                    </button>
                </form>
                {message.text && <p className={`message ${message.type}`}>{message.text}</p>}
            </div>
        </div>
    );
};

export default UserManagementPage;