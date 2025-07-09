// src/components/Tasks/CreateSubtaskModal.jsx

import React, { useState } from 'react';
import { createSubtask } from '../../services/api';
import './CreateTaskModal.css'; // Reusing the main modal styles
import '../common/forms.css';   // Reusing the shared form styles

// The 'users' prop is no longer needed because assignment is automatic.
const CreateSubtaskModal = ({ parentTask, onClose, onSubtaskCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // The only validation needed now is for the title.
        if (!title.trim()) {
            setError('Please provide a title for the subtask.');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            const subtaskData = {
                title,
                description,
                // Automatically set the assignee to be the same as the parent task's assignee.
                assignee_id: parentTask.assignee_id,
            };
            
            const response = await createSubtask(parentTask.task_id, subtaskData);
            onSubtaskCreated(response.data); // Pass the newly created subtask back to the parent
            onClose(); // Close the modal on success
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create subtask.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Add Subtask to: <span className="parent-task-title">"{parentTask.title}"</span></h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="subtask-title">Subtask Title</label>
                        <input 
                            id="subtask-title"
                            type="text" 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="subtask-desc">Description (Optional)</label>
                        <textarea 
                            id="subtask-desc"
                            value={description} 
                            onChange={e => setDescription(e.target.value)}
                        ></textarea>
                    </div>
                    
                    {/* The "Assign To" dropdown has been completely removed to simplify the process. */}
                    
                    {error && <p className="error-message">{error}</p>}
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn btn-secondary" disabled={submitting}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Adding...' : 'Add Subtask'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSubtaskModal;