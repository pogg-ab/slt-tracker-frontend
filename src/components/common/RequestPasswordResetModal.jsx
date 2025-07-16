// src/components/common/RequestPasswordResetModal.jsx
import React, { useState } from 'react';
import { requestPasswordReset } from '../../services/api'; // We'll add this to api.js
import Spinner from './Spinner';
import '../Tasks/CreateTaskModal.css'; // Reuse the existing modal styles

const RequestPasswordResetModal = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccessMessage('');

        try {
            const response = await requestPasswordReset({ email });
            setSuccessMessage(response.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Reset Your Password</h2>
                
                {successMessage ? (
                    <p className="success-message" style={{color: 'green'}}>{successMessage}</p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <p>Enter the email address associated with your account, and we'll send you a link to reset your password.</p>
                        <div className="form-group">
                            <label htmlFor="reset-email">Email Address</label>
                            <input
                                id="reset-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        {error && <p className="error-message">{error}</p>}
                        <div className="modal-actions">
                            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                {isSubmitting ? <Spinner small={true} /> : 'Send Reset Link'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default RequestPasswordResetModal;