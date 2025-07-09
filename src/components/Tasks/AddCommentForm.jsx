// src/components/Tasks/AddCommentForm.jsx

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addComment } from '../../services/api';
import './AddCommentForm.css';
import '../common/forms.css'; // Import shared form styles

const AddCommentForm = ({ taskId, onCommentAdded }) => {
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const { user, hasPermission } = useAuth();

    if (!hasPermission('ADD_COMMENT')) {
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) {
            setError('Comment cannot be empty.');
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            const response = await addComment(taskId, message);
            const newCommentWithUser = { ...response.data, user_name: user.name };
            onCommentAdded(newCommentWithUser);
            setMessage('');
        } catch (err) {
            setError('Failed to post comment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="add-comment-container">
            {/* The heading is now styled by its parent container CSS */}
            <h3>Add a Comment</h3>
            
            <form onSubmit={handleSubmit} className="add-comment-form">
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your comment here... (@mention coming soon!)"
                        rows="3"
                        required
                        disabled={isSubmitting}
                    />
                </div>
                
                <div className="comment-form-actions">
                    {/* Display error message on the left */}
                    {error && <p className="error-message">{error}</p>}
                    
                    {/* Display button on the right, pushed by auto margin */}
                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={isSubmitting} 
                        style={{ marginLeft: 'auto' }}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Comment'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddCommentForm;