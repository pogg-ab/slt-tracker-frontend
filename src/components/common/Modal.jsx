// src/components/common/Modal.jsx
import React from 'react';
import './Modal.css';

const Modal = ({ children, onClose }) => {
    // This allows the modal to be closed by clicking the background,
    // but not by clicking inside the content area.
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-content">
                <button className="modal-close-btn" onClick={onClose}>
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
};

export default Modal;