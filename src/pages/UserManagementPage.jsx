// src/pages/UserManagementPage.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { 
    getAllUsers, 
    getAllDepartments, 
    createDepartment,
    deleteUser as apiDeleteUser, // Import the new functions
} from '../services/api';
import Spinner from '../components/common/Spinner';
import AddUserModal from '../components/Admin/AddUserModal';
import ManagePermissionsModal from '../components/Admin/ManagePermissionsModal';
import EditUserModal from '../components/Admin/EditUserModal'; // Import the new Edit Modal
import './UserManagementPage.css'; // Import the stylesheet

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // State for all modals
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [selectedUserForPermissions, setSelectedUserForPermissions] = useState(null);
    const [selectedUserForEdit, setSelectedUserForEdit] = useState(null); // New state for the edit modal
    
    const [newDeptName, setNewDeptName] = useState('');
    const [isSubmittingDept, setIsSubmittingDept] = useState(false);

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

    const handleCreateDepartment = async (e) => {
        e.preventDefault();
        if (!newDeptName.trim()) return;
        setIsSubmittingDept(true);
        try {
            const response = await createDepartment({ name: newDeptName });
            setDepartments(prev => [...prev, response.data]);
            setNewDeptName('');
        } catch (err) {
            alert('Failed to create department.');
        } finally {
            setIsSubmittingDept(false);
        }
    };

    // --- NEW HANDLERS for Edit and Delete ---
    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
            try {
                await apiDeleteUser(userId);
                // Update the UI instantly by filtering out the deleted user
                setUsers(currentUsers => currentUsers.filter(u => u.user_id !== userId));
            } catch (err) {
                alert('Failed to delete user.');
            }
        }
    };

    const handleUserUpdated = (updatedUser) => {
        // Update the user in the list for an instant UI refresh
        setUsers(currentUsers => currentUsers.map(u => 
            u.user_id === updatedUser.user_id ? updatedUser : u
        ));
        setSelectedUserForEdit(null); // Close the edit modal
    };

    return (
        <Layout>
            <div className="user-management-container">
                <div className="admin-header">
                    <h2>Admin Panel</h2>
                </div>

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
                    <ul className="item-list">
                        {departments.map(dept => <li key={dept.department_id}>{dept.name}</li>)}
                    </ul>
                </div>

                <div className="admin-section">
                    <div className="section-header">
                        <h3>Manage Users</h3>
                        <button onClick={() => setIsAddUserModalOpen(true)} className="btn btn-primary">
                            + Add New User
                        </button>
                    </div>
                    {loading && <Spinner />}
                    {error && <p className="error-message">{error}</p>}
                    {!loading && !error && (
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
                                            <button onClick={() => setSelectedUserForEdit(user)} className="action-btn edit-btn">Edit</button>
                                            <button onClick={() => setSelectedUserForPermissions(user)} className="action-btn permissions-btn">Permissions</button>
                                            <button onClick={() => handleDeleteUser(user.user_id)} className="action-btn delete-btn">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modals Section */}
            {isAddUserModalOpen && (
                <AddUserModal 
                    departments={departments}
                    onClose={() => setIsAddUserModalOpen(false)}
                    onUserAdded={(newUser) => setUsers(prev => [newUser, ...prev])}
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
        </Layout>
    );
};

export default UserManagementPage;