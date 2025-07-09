// src/components/Tasks/AttachmentForm.jsx
import React, { useState, useRef } from 'react';
import { uploadAttachment } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './AttachmentForm.css'; // Import the new styles

const AttachmentForm = ({ taskId, onAttachmentAdded }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [isDragActive, setIsDragActive] = useState(false); // For styling the drop zone
    const fileInputRef = useRef(null);

    const { hasPermission } = useAuth();
    if (!hasPermission('ADD_ATTACHMENT')) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file to upload.');
            return;
        }
        setIsUploading(true);
        setError('');
        const formData = new FormData();
        formData.append('attachment', selectedFile);
        try {
            const response = await uploadAttachment(taskId, formData);
            onAttachmentAdded(response.data);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed.');
        } finally {
            setIsUploading(false);
        }
    };

    // Functions to handle drag-and-drop events
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragActive(true);
        } else if (e.type === "dragleave") {
            setIsDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0]);
            setError('');
        }
    };
    
    // Trigger the hidden file input click
    const onButtonClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="attachment-form-container">
            {/* The hidden file input */}
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
            {/* The new Drop Zone UI */}
            <div 
                className={`file-drop-zone ${isDragActive ? "is-active" : ""}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={onButtonClick} // Click anywhere in the zone to open file dialog
            >
                <p>Drag & drop a file here, or <strong>click to select a file</strong></p>
                <small>Max file size: 5MB</small>
            </div>

            {/* Display the selected file and the upload button */}
            {selectedFile && (
                <div className="file-preview">
                    <span>{selectedFile.name}</span>
                    <button onClick={() => setSelectedFile(null)} title="Remove file">×</button>
                </div>
            )}
            
            // In AttachmentForm.jsx
<div className="upload-actions">
    <button className="btn btn-primary" onClick={handleUpload} disabled={!selectedFile || isUploading}>
        {isUploading ? 'Uploading...' : 'Upload Attachment'}
    </button>
</div>

            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default AttachmentForm;