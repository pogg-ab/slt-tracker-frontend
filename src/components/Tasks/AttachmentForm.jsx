// src/components/Tasks/AttachmentForm.jsx

import React, { useState, useRef } from 'react';
import { uploadAttachment } from '../../services/api';

const AttachmentForm = ({ taskId, onAttachmentAdded }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null); // Ref for the file input

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setError(''); // Clear previous errors
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file to upload.');
            return;
        }

        setIsUploading(true);
        setError('');

        // Create the FormData object
        const formData = new FormData();
        // The key 'attachment' must match the backend multer field name
        formData.append('attachment', selectedFile);

        try {
            const response = await uploadAttachment(taskId, formData);
            onAttachmentAdded(response.data); // Update the parent component's state
            
            // Clear the selection
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = ""; // Reset the file input field
            }

        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Upload failed. The file may be of an unsupported type.';
            setError(errorMessage);
            console.error("Upload AxiosError:", err);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="attachment-form">
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange} 
            />
            <button onClick={handleUpload} disabled={!selectedFile || isUploading}>
                {isUploading ? 'Uploading...' : 'Upload File'}
            </button>
            {/* Show user what file they've selected */}
            {selectedFile && !isUploading && <p style={{marginTop: '8px', fontSize: '0.9em'}}>Selected: {selectedFile.name}</p>}
            {error && <p className="error-message" style={{color: '#ff4d4d', marginTop: '8px'}}>{error}</p>}
        </div>
    );
};

export default AttachmentForm;