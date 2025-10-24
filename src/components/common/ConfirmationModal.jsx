// src/components/common/ConfirmationModal.jsx

import React from 'react';
import Modal from './Modal';
import './ConfirmationModal.css';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel"
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Modal onClose={onClose} size="small">
      <div className="confirmation-modal">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="confirmation-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            {cancelText}
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;