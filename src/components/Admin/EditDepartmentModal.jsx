// src/components/Admin/EditDepartmentModal.jsx (Simplified)

import React, { useState } from 'react';
import { updateDepartment } from '../../services/api';

const EditDepartmentModal = ({ department, onClose, onDepartmentUpdated }) => {
    // State now only tracks the name
    const [name, setName] = useState(department.name);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            // We only send the 'name' in the request body
            const response = await updateDepartment(department.department_id, { name });
            onDepartmentUpdated(response.data);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update department.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Edit Department Name</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Department Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    
                    {/* The description form group has been completely removed */}

                    {error && <p className="error-message">{error}</p>}
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditDepartmentModal;