// src/pages/UserManagementPage.jsx

import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { 
    getAllUsers, 
    getAllDepartments, 
    createDepartment,
    updateDepartment,
    deleteDepartment as apiDeleteDepartment,
    deleteUser as apiDeleteUser,
    updateUser as apiUpdateUser
} from '../services/api';
import Spinner from '../components/common/Spinner';
import AddUserModal from '../components/Admin/AddUserModal';
import ManagePermissionsModal from '../components/Admin/ManagePermissionsModal';
import EditUserModal from '../components/Admin/EditUserModal';
import EditDepartmentModal from '../components/Admin/EditDepartmentModal';
import './UserManagementPage.css';

const UserManagementPage = () => {
    // Data State
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Modal Control State
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [selectedUserForPermissions, setSelectedUserForPermissions] = useState(null);
    const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
    const [selectedDeptForEdit, setSelectedDeptForEdit] = useState(null);
    
    // Form State
    const [newDeptName, setNewDeptName] = useState('');
    const [isSubmittingDept, setIsSubmittingDept] = useState(false);

    // Initial Data Fetch
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [usersRes, deptsRes] = await Promise.all([
                    getAllUsers(),
                    getAllDepartments()
                ]);
                setUsers(usersRes.data);
                setDepartments(deptsRes.data);
            } catch (err) {
                setError('Failed to fetch initial page data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- DEPARTMENT HANDLER FUNCTIONS ---
    const handleCreateDepartment = async (e) => {
        e.preventDefault();
        if (!newDeptName.trim()) return;
        setIsSubmittingDept(true);
        try {
            const response = await createDepartment({ name: newDeptName });
            setDepartments(prev => [...prev, response.data].sort((a, b) => a.name.localeCompare(b.name)));
            setNewDeptName('');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create department.');
        } finally {
            setIsSubmittingDept(false);
        }
    };

    const handleDeleteDepartment = async (deptId) => {
        if (window.confirm('Are you sure you want to delete this department? Users in this department will become unassigned.')) {
            try {
                await apiDeleteDepartment(deptId);
                setDepartments(currentDepts => currentDepts.filter(d => d.department_id !== deptId));
            } catch (err) {
                alert('Failed to delete department. There might be tasks still associated with it.');
            }
        }
    };

    const handleDepartmentUpdated = (updatedDept) => {
        setDepartments(currentDepts => currentDepts.map(d => 
            d.department_id === updatedDept.department_id ? updatedDept : d
        ));
        setSelectedDeptForEdit(null);
    };

    // --- USER HANDLER FUNCTIONS ---
    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
            try {
                await apiDeleteUser(userId);
                setUsers(currentUsers => currentUsers.filter(u => u.user_id !== userId));
            } catch (err) {
                alert('Failed to delete user.');
            }
        }
    };

    const handleUserUpdated = (updatedUser) => {
        setUsers(currentUsers => currentUsers.map(u => 
            u.user_id === updatedUser.user_id ? updatedUser : u
        ));
        setSelectedUserForEdit(null);
    };

    const handleUserAdded = (newUser) => {
        setUsers(prev => [...prev, newUser].sort((a, b) => a.name.localeCompare(b.name)));
    };

    return (
        <Layout>
            <div className="user-management-container">
                <div className="admin-header">
                    <h2>Admin Panel</h2>
                </div>

                {/* Manage Departments Section */}
                <div className="admin-section">
                    <h3>Manage Departments</h3>
                    <form onSubmit={handleCreateDepartment} className="inline-form">
                        <input
                            type="text"
                            placeholder="New department name..."
                            value={newDeptName}
                            onChange={(e) => setNewDeptName(e.target.value)}
                            required
                        />
                        <button type="submit" className="btn btn-secondary" disabled={isSubmittingDept}>
                            {isSubmittingDept ? 'Adding...' : '+ Create Department'}
                        </button>
                    </form>
                    <div className="item-list-container">
                        {departments.map(dept => (
                            <div key={dept.department_id} className="item-row">
                                <span className="item-name">{dept.name}</span>
                                <div className="item-actions">
                                    <button onClick={() => setSelectedDeptForEdit(dept)} className="action-btn-sm btn-secondary">Edit</button>
                                    <button onClick={() => handleDeleteDepartment(dept.department_id)} className="action-btn-sm btn-danger-outline">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Manage Users Section */}
                <div className="admin-section">
                    <div className="section-header">
                        <h3>Manage Users</h3>
                        <button onClick={() => setIsAddUserModalOpen(true)} className="btn btn-primary">
                            + Add New User
                        </button>
                    </div>
                    {loading ? <Spinner /> : error ? <p className="error-message">{error}</p> : (
                        <div className="table-wrapper">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Job Title</th>
                                        <th className="actions-header">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.user_id}>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>{user.job_title || 'N/A'}</td>
                                            <td className="actions-cell">
                                                <button onClick={() => setSelectedUserForEdit(user)} className="action-btn btn-secondary">Edit</button>
                                                <button onClick={() => setSelectedUserForPermissions(user)} className="action-btn btn-primary">Permissions</button>
                                                <button onClick={() => handleDeleteUser(user.user_id)} className="action-btn btn-danger-outline">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* All Modals */}
            {isAddUserModalOpen && (
                <AddUserModal 
                    departments={departments}
                    onClose={() => setIsAddUserModalOpen(false)}
                    onUserAdded={handleUserAdded}
                />
            )}
            {selectedUserForPermissions && (
                <ManagePermissionsModal
                    user={selectedUserForPermissions}
                    onClose={() => setSelectedUserForPermissions(null)}
                />
            )}
            {selectedUserForEdit && (
                <EditUserModal
                    user={selectedUserForEdit}
                    departments={departments}
                    onClose={() => setSelectedUserForEdit(null)}
                    onUserUpdated={handleUserUpdated}
                />
            )}
            {selectedDeptForEdit && (
                <EditDepartmentModal
                    department={selectedDeptForEdit}
                    onClose={() => setSelectedDeptForEdit(null)}
                    onDepartmentUpdated={handleDepartmentUpdated}
                />
            )}
        </Layout>
    );
};

export default UserManagementPage;