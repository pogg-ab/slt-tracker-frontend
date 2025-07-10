// src/components/Admin/ManagePermissionsModal.jsx
import React, { useState, useEffect } from 'react';
import { getAllPermissions, getUserPermissions, updateUserPermissions } from '../../services/api';
import Spinner from '../common/Spinner';
import './ManagePermissionsModal.css';

// === 1. DEFINE THE PERMISSION PRESETS ===
// This maps a job title/role to the permissions it should have.
const permissionPresets = {
    'Staff': ['UPDATE_OWN_TASK_STATUS', 'LOG_TIME_OWN', 'ADD_COMMENT', 'ADD_ATTACHMENT'],
    'Senior Developer': ['CREATE_SUBTASK', 'EDIT_ANY_TASK', 'UPDATE_OWN_TASK_STATUS', 'LOG_TIME_OWN', 'ADD_COMMENT', 'ADD_ATTACHMENT', 'VIEW_ALL_USERS_FOR_ASSIGNMENT'],
    'Project Manager': ['CREATE_TASK', 'CREATE_SUBTASK', 'EDIT_ANY_TASK', 'DELETE_ANY_TASK', 'UPDATE_OWN_TASK_STATUS', 'LOG_TIME_OWN', 'APPROVE_TIME', 'ADD_COMMENT', 'ADD_ATTACHMENT', 'VIEW_REPORTS', 'VIEW_ALL_USERS_FOR_ASSIGNMENT'],
    'CEO': ['VIEW_COMPANY_OVERVIEW', 'VIEW_REPORTS', 'VIEW_ANY_TASK', 'VIEW_ALL_USERS_FOR_ASSIGNMENT'],
    // Note: The main 'Admin' role is managed separately and has all permissions.
};


const ManagePermissionsModal = ({ user, onClose }) => {
    const [allPermissions, setAllPermissions] = useState([]);
    const [userPermissionIds, setUserPermissionIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [allPermsRes, userPermsRes] = await Promise.all([
                    getAllPermissions(),
                    getUserPermissions(user.user_id)
                ]);
                
                setAllPermissions(allPermsRes.data);
                // The backend sends an array of IDs, which is what we need for the Set
                setUserPermissionIds(new Set(userPermsRes.data)); 
            } catch (err) {
                setError('Failed to load permissions data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user.user_id]);

    const handleCheckboxChange = (permissionId) => {
        setUserPermissionIds(prevIds => {
            const newIds = new Set(prevIds);
            if (newIds.has(permissionId)) {
                newIds.delete(permissionId);
            } else {
                newIds.add(permissionId);
            }
            return newIds;
        });
    };
    
    // === 2. NEW HANDLER FOR PRESET BUTTONS ===
    const handlePresetClick = (presetName) => {
        const presetPermissionNames = permissionPresets[presetName];
        if (!presetPermissionNames) return;

        // Convert the array of permission names into a Set of permission IDs
        const presetPermissionIds = new Set();
        allPermissions.forEach(perm => {
            if (presetPermissionNames.includes(perm.name)) {
                presetPermissionIds.add(perm.permission_id);
            }
        });

        setUserPermissionIds(presetPermissionIds);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError('');
        try {
            // The Set already contains the IDs, so we just convert it to an array
            const permissionIdsToSave = Array.from(userPermissionIds);
            await updateUserPermissions(user.user_id, permissionIdsToSave);
            onClose(); 
        } catch (err) {
            setError('Failed to save permissions.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content permissions-modal" onClick={(e) => e.stopPropagation()}>
                <h2>Manage Permissions for {user.name}</h2>
                <p className="user-subtitle">{user.job_title || 'No job title set'}</p>
                
                {/* === 3. NEW PRESET BUTTONS UI === */}
                <div className="permission-presets">
                    <span>Quick Sets:</span>
                    {Object.keys(permissionPresets).map(presetName => (
                        <button 
                            key={presetName}
                            onClick={() => handlePresetClick(presetName)}
                            className="btn-preset"
                        >
                            Set as {presetName}
                        </button>
                    ))}
                </div>

                {loading && <Spinner />}
                {error && <p className="error-message">{error}</p>}
                {!loading && !error && (
                    <div className="permissions-grid">
                        {allPermissions.map(perm => (
                            <div key={perm.permission_id} className="permission-item">
                                <input
                                    type="checkbox"
                                    id={`perm-${perm.permission_id}`}
                                    // The 'checked' prop now correctly uses the Set of IDs
                                    checked={userPermissionIds.has(perm.permission_id)}
                                    onChange={() => handleCheckboxChange(perm.permission_id)}
                                />
                                <label htmlFor={`perm-${perm.permission_id}`}>{perm.description}</label>
                            </div>
                        ))}
                    </div>
                )}
                <div className="modal-actions">
                    <button onClick={onClose} className="btn btn-secondary" disabled={isSaving}>Cancel</button>
                    <button onClick={handleSave} className="btn btn-primary" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManagePermissionsModal;