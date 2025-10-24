import React, { useState } from 'react';
import { createSubtask } from '../../services/api'; // We'll add this to api.js next
import './CreateTaskModal.css'; // We can reuse the same CSS

const CreateSubtaskModal = ({ parentTask, users, onClose, onSubtaskCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !assigneeId) {
            setError('Please provide a title and an assignee.');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            const subtaskData = {
                title,
                description,
                assignee_id: parseInt(assigneeId),
            };
            // We call the new API function here
            const response = await createSubtask(parentTask.task_id, subtaskData);
            onSubtaskCreated(response.data);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create subtask.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Add Subtask to: "{parentTask.title}"</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Subtask Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Description (Optional)</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)}></textarea>
                    </div>
                    <div className="form-group">
                        <label>Assign To</label>
                        <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} required>
                            <option value="" disabled>-- Select a user --</option>
                            {users && users.map(u => (
                                <option key={u.user_id} value={u.user_id}>{u.name}</option>
                            ))}
                        </select>
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel" disabled={submitting}>Cancel</button>
                        <button type="submit" className="btn-submit" disabled={submitting}>
                            {submitting ? 'Adding...' : 'Add Subtask'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSubtaskModal;