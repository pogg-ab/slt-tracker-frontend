import React, { useState, useEffect } from 'react';
// --- CORRECTED: Import the specific functions we need ---
import { getAllPermissions, getUserPermissions, updateUserPermissions } from '../../services/api';
import Spinner from '../common/Spinner';
import './ManagePermissionsModal.css';

const ManagePermissionsModal = ({ user, onClose }) => {
    const [allPermissions, setAllPermissions] = useState([]);
    const [userPermissionIds, setUserPermissionIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Call the imported functions directly
                const [allPermsRes, userPermsRes] = await Promise.all([
                    getAllPermissions(),
                    getUserPermissions(user.user_id)
                ]);
                
                setAllPermissions(allPermsRes.data);
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

    const handleSave = async () => {
        setIsSaving(true);
        setError('');
        try {
            const permissionIds = Array.from(userPermissionIds);
            // Call the imported function directly
            await updateUserPermissions(user.user_id, permissionIds);
            onClose(); 
        } catch (err) {
            setError('Failed to save permissions.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Manage Permissions for {user.name}</h2>
                {loading && <Spinner />}
                {error && <p className="error-message">{error}</p>}
                {!loading && !error && (
                    <div className="permissions-grid">
                        {allPermissions.map(perm => (
                            <div key={perm.permission_id} className="permission-item">
                                <input
                                    type="checkbox"
                                    id={`perm-${perm.permission_id}`}
                                    checked={userPermissionIds.has(perm.permission_id)}
                                    onChange={() => handleCheckboxChange(perm.permission_id)}
                                />
                                <label htmlFor={`perm-${perm.permission_id}`}>{perm.description}</label>
                            </div>
                        ))}
                    </div>
                )}
                <div className="modal-actions">
                    <button onClick={onClose} className="btn-cancel" disabled={isSaving}>Cancel</button>
                    <button onClick={handleSave} className="btn-submit" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManagePermissionsModal;