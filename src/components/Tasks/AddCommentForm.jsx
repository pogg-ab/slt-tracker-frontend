// src/components/Tasks/AddCommentForm.jsx
import React, { useState } from 'react';
import { addComment } from '../../services/api'; // Use the correct service
import './AddCommentForm.css';

const AddCommentForm = ({ taskId, onCommentAdded }) => {
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setSubmitting(true);
        try {
            const response = await addComment(taskId, message);
            onCommentAdded(response.data); // Pass the new comment data back to the parent
            setMessage(''); // Clear the form
        } catch (error) {
            console.error("Failed to add comment", error);
            alert("Failed to post comment.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="add-comment-form">
            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a comment..."
                disabled={submitting}
            />
            <button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save'}
            </button>
        </form>
    );
};

export default AddCommentForm;