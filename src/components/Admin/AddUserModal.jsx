import React, { useState } from 'react';
// --- CORRECT: Import the specific function we need ---
import { registerUser } from '../../services/api';
import './AddUserModal.css';

const AddUserModal = ({ departments, onClose, onUserAdded }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const userData = { 
                name, 
                email, 
                password, 
                job_title: jobTitle, 
                department_id: departmentId ? parseInt(departmentId) : null,
            };
            // CORRECT: Call the imported function directly
            const response = await registerUser(userData);
            onUserAdded(response.data);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add user.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Add New User</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
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
                        <button type="button" onClick={onClose} className="btn-cancel" disabled={submitting}>Cancel</button>
                        <button type="submit" className="btn-submit" disabled={submitting}>
                            {submitting ? 'Adding...' : 'Add User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUserModal;