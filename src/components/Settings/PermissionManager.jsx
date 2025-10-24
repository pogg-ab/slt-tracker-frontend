"use client"

import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { getRolesWithPermissions, getAllPermissionTypes, updateRolePermissions } from '../../services/api';
import Spinner from '../common/Spinner';
import './PermissionManager.css'; // The new stylesheet

const PermissionManager = () => {
    const [roles, setRoles] = useState([]);
    const [allPermissions, setAllPermissions] = useState([]);
    const [message, setMessage] = useState('');

    const { data: fetchedRoles, loading: loadingRoles, request: fetchRoles } = useApi(getRolesWithPermissions);
    const { data: fetchedPerms, loading: loadingPerms, request: fetchPerms } = useApi(getAllPermissionTypes);

    useEffect(() => {
        fetchRoles();
        fetchPerms();
    }, [fetchRoles, fetchPerms]);

    useEffect(() => { if (fetchedRoles) setRoles(fetchedRoles) }, [fetchedRoles]);
    useEffect(() => { if (fetchedPerms) setAllPermissions(fetchedPerms) }, [fetchedPerms]);

    const handlePermissionChange = (roleId, permission, isChecked) => {
        setRoles(currentRoles => 
            currentRoles.map(role => {
                if (role.role_id === roleId) {
                    const currentPerms = new Set(role.permissions);
                    if (isChecked) {
                        currentPerms.add(permission);
                    } else {
                        currentPerms.delete(permission);
                    }
                    return { ...role, permissions: Array.from(currentPerms) };
                }
                return role;
            })
        );
    };

    const handleSaveChanges = async (roleId) => {
        const roleToUpdate = roles.find(r => r.role_id === roleId);
        if (!roleToUpdate) return;
        
        try {
            await updateRolePermissions(roleId, roleToUpdate.permissions);
            setMessage(`Permissions for '${roleToUpdate.name}' updated successfully!`);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Failed to save permissions. Please try again.');
        }
    };

    if (loadingRoles || loadingPerms) {
        return <Spinner />;
    }

    return (
        <div className="permission-manager-container">
            <h3 className="settings-section-title">Manage Role Permissions</h3>
            {message && <div className="settings-message settings-success">{message}</div>}
            
            <div className="roles-container">
                {roles.map(role => (
                    <div key={role.role_id} className="role-card">
                        <h4 className="role-card-title">{role.name}</h4>
                        <div className="permissions-grid">
                            {allPermissions.map(permission => (
                                <label key={permission} htmlFor={`${role.role_id}-${permission}`} className="custom-checkbox-label">
                                    <input
                                        type="checkbox"
                                        id={`${role.role_id}-${permission}`}
                                        className="custom-checkbox-input"
                                        checked={role.permissions.includes(permission)}
                                        onChange={(e) => handlePermissionChange(role.role_id, permission, e.target.checked)}
                                    />
                                    <span className="custom-checkbox-box"></span>
                                    <span className="custom-checkbox-text">{permission}</span>
                                </label>
                            ))}
                        </div>
                        <button onClick={() => handleSaveChanges(role.role_id)} className="btn btn-primary">
                            Save Changes for {role.name}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PermissionManager;