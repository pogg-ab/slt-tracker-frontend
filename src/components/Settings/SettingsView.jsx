"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { useProject } from '../../pages/ProjectPage';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import {
    getProjectMembers,
    getProjectRoles,
    updateProjectMemberRole,
    removeProjectMember,
    addProjectMember,
    getAllUsers,
    updateProjectDetails
} from '../../services/api';

import Spinner from '../common/Spinner';
import PermissionManager from './PermissionManager';
import './SettingsView.css'; // The new stylesheet will be applied here

const SettingsView = () => {
    const { project, hasPermission, refreshProjectData } = useProject();
    const { user } = useAuth();
    const isGlobalAdmin = user && (user.role === 'Admin' || user.role === 'Owner');

    const [details, setDetails] = useState({ name: '', project_key: '', description: '' });
    const [members, setMembers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    const { data: memberData, loading: loadingMembers, request: fetchMembers } = useApi(getProjectMembers);
    const { data: rolesData, loading: loadingRoles, request: fetchRoles } = useApi(getProjectRoles);
    const { data: allUsersData, request: fetchAllUsers } = useApi(getAllUsers);

    useEffect(() => {
        if (project) {
            setDetails({ name: project.name, project_key: project.project_key, description: project.description || '' });
            fetchMembers(project.project_id);
            if (hasPermission('MANAGE_PROJECT_MEMBERS')) {
                fetchRoles();
                fetchAllUsers();
            }
        }
    }, [project, hasPermission, fetchMembers, fetchRoles, fetchAllUsers]);

    useEffect(() => { if (memberData) setMembers(memberData) }, [memberData]);
    useEffect(() => { if (rolesData) setRoles(rolesData) }, [rolesData]);
    useEffect(() => { if (allUsersData) setAllUsers(allUsersData) }, [allUsersData]);

    const usersToAdd = useMemo(() => {
        if (!allUsers || !members) return [];
        const memberIds = new Set(members.map(m => m.user_id));
        return allUsers.filter(u => !memberIds.has(u.user_id));
    }, [allUsers, members]);

    const handleDetailsChange = (e) => setDetails({ ...details, [e.target.name]: e.target.value });

    const handleUpdateDetails = async (e) => {
        e.preventDefault();
        try {
            await updateProjectDetails(project.project_id, details);
            refreshProjectData();
            setMessage({ type: 'success', text: 'Project details updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update details.' });
        }
    };

    const handleRoleChange = async (userId, newRoleId) => {
        try {
            await updateProjectMemberRole(project.project_id, userId, newRoleId);
            fetchMembers(project.project_id);
            setMessage({ type: 'success', text: 'Member role updated.' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update role.' });
        }
    };

    const handleRemoveMember = async (userId) => {
        if (window.confirm('Are you sure you want to remove this member? This will unassign them from all tasks in this project.')) {
            try {
                await removeProjectMember(project.project_id, userId);
                fetchMembers(project.project_id);
                setMessage({ type: 'success', text: 'Member removed successfully.' });
            } catch (err) {
                setMessage({ type: 'error', text: 'Failed to remove member.' });
            }
        }
    };
    
    const handleAddMember = async () => {
        if (!selectedUser) return;
        try {
            await addProjectMember(project.project_id, selectedUser);
            fetchMembers(project.project_id);
            setSelectedUser('');
            setMessage({ type: 'success', text: 'Member added successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to add member.' });
        }
    };

    if (loadingMembers || (hasPermission('MANAGE_PROJECT_MEMBERS') && (loadingRoles || !allUsers))) {
        return <Spinner />;
    }

    return (
        <div className="settings-container">
            <h2 className="settings-header">Project Settings</h2>
            
            {message.text && <div className={`settings-message settings-${message.type}`}>{message.text}</div>}
            
            <div className="settings-section">
                <h3 className="settings-section-title">Manage Members</h3>
                <div className="member-list">
                    {members.map(member => (
                        <div key={member.user_id} className="member-item">
                            <div className="member-info">
                                <span className="member-name">{member.name}</span>
                                <span className="member-email">{member.email}</span>
                            </div>
                            <div className="member-actions">
                                <select
                                    className="settings-select"
                                    value={member.project_role_id}
                                    onChange={(e) => handleRoleChange(member.user_id, parseInt(e.target.value))}
                                    disabled={!hasPermission('MANAGE_PROJECT_MEMBERS')}
                                >
                                    {roles.length > 0 ? (
                                        roles.map(role => <option key={role.role_id} value={role.role_id}>{role.name}</option>)
                                    ) : (
                                        <option value={member.project_role_id}>{member.role_name}</option>
                                    )}
                                </select>
                                {hasPermission('MANAGE_PROJECT_MEMBERS') && (
                                    <button onClick={() => handleRemoveMember(member.user_id)} className="btn btn-danger-outline">Remove</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {hasPermission('MANAGE_PROJECT_MEMBERS') && (
                    <div className="add-member-container">
                        <select className="settings-select" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                            <option value="">-- Select user to add --</option>
                            {usersToAdd.map(user => (
                                <option key={user.user_id} value={user.user_id}>{user.name} ({user.email})</option>
                            ))}
                        </select>
                        <button onClick={handleAddMember} disabled={!selectedUser} className="btn btn-primary">Add Member</button>
                    </div>
                )}
            </div>

            <div className="settings-section">
                <h3 className="settings-section-title">Project Details</h3>
                <form onSubmit={handleUpdateDetails} className="details-form">
                    <div className="form-group">
                        <label htmlFor="name">Project Name</label>
                        <input id="name" type="text" name="name" className="settings-input" value={details.name} onChange={handleDetailsChange} disabled={!hasPermission('EDIT_PROJECT_DETAILS')} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="project_key">Project Key</label>
                        <input id="project_key" type="text" name="project_key" className="settings-input" value={details.project_key} onChange={handleDetailsChange} disabled={!hasPermission('EDIT_PROJECT_DETAILS')} maxLength="10" />
                    </div>
                     <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea id="description" name="description" className="settings-textarea" value={details.description || ''} onChange={handleDetailsChange} disabled={!hasPermission('EDIT_PROJECT_DETAILS')}></textarea>
                    </div>
                    {hasPermission('EDIT_PROJECT_DETAILS') && <button type="submit" className="btn btn-primary">Save Changes</button>}
                </form>
            </div>
            
            {isGlobalAdmin && (
                <div className="settings-section">
                    <PermissionManager />
                </div>
            )}
        </div>
    );
};

export default SettingsView;