// src/components/Tasks/AttachmentList.jsx

import React from 'react';
import { useProject } from '../../pages/ProjectPage';
import './AttachmentList.css';

const AttachmentList = ({ attachments, onAttachmentDeleted }) => {
  const { hasPermission } = useProject();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  return (
    <div className="attachment-list">
      {attachments && attachments.length > 0 ? (
        attachments.map(att => (
          <div key={att.attachment_id} className="attachment-item">
            <a href={`${API_BASE_URL}/${att.file_path}`} target="_blank" rel="noopener noreferrer" className="attachment-link">
              {att.file_name}
            </a>
            {hasPermission('DELETE_ATTACHMENT') && (
              <button
                className="delete-attachment-btn"
                onClick={() => onAttachmentDeleted(att)}
                title="Delete attachment"
              >
                &times;
              </button>
            )}
          </div>
        ))
      ) : (
        <p>No attachments.</p>
      )}
    </div>
  );
};

export default AttachmentList;



