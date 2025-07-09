// src/components/Tasks/AttachmentList.jsx
import React from 'react';
import './AttachmentList.css'; // Import the new styles

// A simple file icon component
const FileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="file-icon">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
        <polyline points="13 2 13 9 20 9"></polyline>
    </svg>
);

const AttachmentList = ({ attachments }) => {
    const backendUrl = 'http://localhost:3000';

    if (!attachments || attachments.length === 0) {
        return <p>No attachments.</p>;
    }

    return (
        <ul className="attachment-list">
            {attachments.map(att => (
                <li key={att.attachment_id} className="attachment-item">
                    <FileIcon />
                    <a 
                        href={`${backendUrl}/${att.file_path.replace(/\\/g, '/')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                        {att.file_name}
                    </a>
                </li>
            ))}
        </ul>
    );
};

export default AttachmentList;