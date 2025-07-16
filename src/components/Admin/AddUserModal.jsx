// src/components/Admin/AddUserModal.jsx

import React, { useState } from 'react';
import { registerUser } from '../../services/api';
import './AddUserModal.css'; // Assuming this uses the shared modal styles

const AddUserModal = ({ departments, onClose, onUserAdded }) => {
    // State for the form fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    // const [password, setPassword] = useState(''); // <-- 1. REMOVED: Password state is no longer needed
    const [jobTitle, setJobTitle] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    
    // State for UI feedback
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            // 2. The userData object no longer includes a password
            const userData = { 
                name, 
                email, 
                job_title: jobTitle, 
                department_id: departmentId ? parseInt(departmentId) : null,
            };
            
            const response = await registerUser(userData);
            onUserAdded(response.data); // Update the user list in the parent component
            onClose(); // Close the modal on success

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add user. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Add New User</h2>
                <p className="modal-subtitle">A temporary password will be generated and sent to the user's email address.</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required disabled={submitting} />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={submitting} />
                    </div>
                    
                    {/* 3. The entire password input form group has been removed from the JSX */}
                    
                    <div className="form-group">
                        <label>Job Title (Optional)</label>
                        <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} disabled={submitting} />
                    </div>
                    <div className="form-group">
                        <label>Department (Optional)</label>
                        <select 
                            value={departmentId} 
                            onChange={e => setDepartmentId(e.target.value)}
                            disabled={submitting}
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
                            {submitting ? 'Adding...' : 'Add User & Send Invite'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUserModal;