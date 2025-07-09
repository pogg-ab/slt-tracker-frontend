import React, { useState, useEffect } from 'react';
import { updateUser } from '../../services/api';
import '../Tasks/CreateTaskModal.css'; // Reuse modal styles
import '../common/forms.css';      // Reuse form styles

const EditUserModal = ({ user, departments, onClose, onUserUpdated }) => {
    // Pre-fill the form with the user's current data
    const [name, setName] = useState(user.name);
    const [jobTitle, setJobTitle] = useState(user.job_title || '');
    const [departmentId, setDepartmentId] = useState(user.department_id || '');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const userData = {
                name,
                job_title: jobTitle,
                department_id: departmentId ? parseInt(departmentId, 10) : null,
            };
            const response = await updateUser(user.user_id, userData);
            onUserUpdated(response.data); // Send updated user data back to the parent page
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update user.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Edit User: {user.name}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Email (cannot be changed)</label>
                        <input type="email" value={user.email} disabled />
                    </div>
                    <div className="form-group">
                        <label>Job Title</label>
                        <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Department</label>
                        <select 
                            value={departmentId} 
                            onChange={e => setDepartmentId(e.target.value)}
                        >
                            <option value="">-- No Department --</option>
                            {departments.map(dept => (
                                <option key={dept.department_id} value={dept.department_id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn btn-secondary" disabled={submitting}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserModal;