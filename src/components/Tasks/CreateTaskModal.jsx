import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { getDepartmentUsers, createTask } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './CreateTaskModal.css';
import Spinner from '../common/Spinner';

const CreateTaskModal = ({ onClose, onTaskCreated }) => {
    const { data: users, loading: usersLoading, request: fetchUsers } = useApi(getDepartmentUsers);
    const { user } = useAuth(); // The logged-in manager

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

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
                department_id: user.department_id, // <-- THIS IS THE CORRECTED LINE
            };
            const response = await createTask(taskData);
            onTaskCreated(response.data); // Pass the newly created task back
            onClose(); // Close the modal on success
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
                    {usersLoading ? <Spinner /> : (
                        <>
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
                                    {users && users.map(u => (
                                        <option key={u.user_id} value={u.user_id}>{u.name} ({u.role})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Priority</label>
                                <select value={priority} onChange={e => setPriority(e.target.value)}>
                                    <option>Low</option>
                                    <option>Medium</option>
                                    <option>High</option>
                                    <option>Urgent</option>
                                </select>
                            </div>
                        </>
                    )}
                    {error && <p className="error-message">{error}</p>}
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel" disabled={submitting}>Cancel</button>
                        <button type="submit" className="btn-submit" disabled={submitting || usersLoading}>
                            {submitting ? 'Creating...' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskModal;