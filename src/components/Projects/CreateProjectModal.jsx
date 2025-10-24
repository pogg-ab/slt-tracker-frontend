// src/components/Projects/CreateProjectModal.jsx
import React, { useState } from 'react';
import Modal from '../common/Modal'; // Reuse our generic modal
import Spinner from '../common/Spinner';
import './CreateProjectModal.css';
import { createProject } from '../../services/api';

const CreateProjectModal = ({ onClose, onProjectCreated }) => {
    const [name, setName] = useState('');
    const [key, setKey] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Automatically suggest a project key based on the name
    const handleNameChange = (e) => {
        const newName = e.target.value;
        setName(newName);
        // Create a key from the first letters of the words, max 4 chars
        const keySuggestion = newName
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 4);
        setKey(keySuggestion);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !key) {
            setError('Both project name and key are required.');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            const projectData = { name, project_key: key };
            const response = await createProject(projectData);
            onProjectCreated(response.data); // Pass the new project data back to the parent
            onClose(); // Close the modal on success
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create project.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal onClose={onClose}>
            <div className="create-project-form">
                <h2>Create New Project</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Project Name</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={handleNameChange} 
                            placeholder="e.g., Sky Link Internal Ops"
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Project Key</label>
                        <input 
                            type="text" 
                            value={key} 
                            onChange={e => setKey(e.target.value.toUpperCase())} 
                            placeholder="e.g., SLT"
                            maxLength="10"
                            required 
                        />
                         <small>A short, unique identifier for tasks in this project (e.g., SLT-123).</small>
                    </div>
                    
                    {error && <p className="error-message">{error}</p>}

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel" disabled={submitting}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-submit" disabled={submitting}>
                            {submitting ? <Spinner size="sm" /> : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default CreateProjectModal;