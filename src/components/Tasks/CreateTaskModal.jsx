// src/components/Tasks/CreateTaskModal.jsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { createTask } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './CreateTaskModal.css';

// --- THE COMPONENT NOW RECEIVES THE `members` PROP ---
const CreateTaskModal = ({ onClose, onTaskCreated, members }) => {
    const { projectId } = useParams();
    const { user } = useAuth();

    // The state remains the same
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // --- REMOVED `useApi` and `useEffect` ---
    // This component no longer fetches its own data. This is the fix.

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!assigneeId) {
            setError('Please select a user to assign the task to.');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            const taskData = {
                title,
                description,
                assignee_id: parseInt(assigneeId),
                priority,
                project_id: parseInt(projectId),
                department_id: user.department_id,
            };
            
            const response = await createTask(taskData);
            onTaskCreated(response.data);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create task.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Create New Task</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title</label>
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
                            {/* --- THIS IS THE FIX --- */}
                            {/* We now map over the `members` prop passed down from ProjectPage */}
                            {/* We use `?.` for safety in case the members array is not ready yet */}
                            {members?.map(member => (
                                <option key={member.user_id} value={member.user_id}>{member.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Priority</label>
                        <select value={priority} onChange={e => setPriority(e.target.value)}>
                             {/* Your database expects these specific values */}
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Highest">Highest</option>
                        </select>
                    </div>
                    
                    {error && <p className="error-message">{error}</p>}
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel" disabled={submitting}>Cancel</button>
                        <button type="submit" className="btn-submit" disabled={submitting}>
                            {submitting ? 'Creating...' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskModal;