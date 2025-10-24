// src/components/Tasks/TaskDetailModal.jsx

import React, { useState, useEffect } from 'react';
import { useProject } from '../../pages/ProjectPage'; // <-- We will use this hook
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';
import { useApi } from '../../hooks/useApi';
import { getTaskById, updateTask, getWorkflowForProject, deleteComment, deleteAttachment, deleteTask } from '../../services/api';
import ConfirmationModal from '../common/ConfirmationModal';
import AddCommentForm from './AddCommentForm';
import CreateSubtaskModal from './CreateSubtaskModal';
import AttachmentForm from './AttachmentForm';
import AttachmentList from './AttachmentList';
import './TaskDetailModal.css';
import './AttachmentList.css';

// --- REMOVED `projectMembers` from props ---
const TaskDetailModal = ({ taskId, onClose, onUpdate }) => {
    // --- THIS IS THE FIX (PART 1) ---
    // Get the entire project object directly from the context.
    // This object contains the `members` array we need.
    const { project, hasPermission } = useProject();

    // State Management
    const [task, setTask] = useState(null);
    const [workflowStatuses, setWorkflowStatuses] = useState([]);
    const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);
    const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({ isOpen: false });

    // API Calls
    const { data: fetchedTask, loading, error, request: fetchTask } = useApi(getTaskById);
    const { data: workflow, request: fetchWorkflow } = useApi(getWorkflowForProject);

    useEffect(() => {
        if (taskId) { fetchTask(taskId); }
    }, [taskId, fetchTask]);

    useEffect(() => {
        if (fetchedTask) {
            setTask(fetchedTask);
            if (fetchedTask.project_id) { fetchWorkflow(fetchedTask.project_id); }
        }
    }, [fetchedTask, fetchWorkflow]);
    
    useEffect(() => {
        if(workflow) { setWorkflowStatuses(workflow.statuses); }
    }, [workflow]);

    // Event Handlers (Generic)
    const handleUpdate = async (field, value) => {
        if (!task) return;
        const originalTask = { ...task };
        const updatedTask = { ...task, [field]: value };
        setTask(updatedTask);
        try {
            await updateTask(task.task_id, { [field]: value });
            onUpdate();
        } catch (err) {
            console.error(`Failed to update ${field}`, err);
            setTask(originalTask);
            alert(`Error updating ${field}. Please try again.`);
        }
    };

    const handleCommentAdded = (newComment) => {
        setTask(prev => ({ ...prev, comments: [...(prev.comments || []), newComment] }));
        onUpdate();
    };

    const handleSubtaskCreated = (newSubtask) => {
        // --- THIS IS THE FIX (PART 2) ---
        // Use the reliable 'project.members' from the context.
        const assignee = project.members.find(m => m.user_id === newSubtask.assignee_id);
        const newSubtaskWithAssignee = { ...newSubtask, assignee_name: assignee ? assignee.name : 'Unknown' };
        setTask(prev => ({ ...prev, subtasks: [...(prev.subtasks || []), newSubtaskWithAssignee] }));
        setIsSubtaskModalOpen(false);
        onUpdate();
    };
    
    const handleAttachmentAdded = (newAttachment) => {
        setTask(prev => ({ ...prev, attachments: [...(prev.attachments || []), newAttachment] }));
        onUpdate();
    };

    // Deletion Handlers
    const handleDeleteCommentClick = (comment) => {
        setModalConfig({
            isOpen: true,
            title: "Delete Comment",
            message: "Are you sure you want to permanently delete this comment?",
            onConfirm: () => handleConfirmDeleteComment(comment.comment_id),
        });
    };

    const handleConfirmDeleteComment = async (commentId) => {
        try {
            await deleteComment(taskId, commentId);
            setTask(prev => ({ ...prev, comments: prev.comments.filter(c => c.comment_id !== commentId) }));
            onUpdate();
        } catch (err) {
            console.error("Failed to delete comment:", err);
            alert("Error: Could not delete the comment.");
        } finally {
            setModalConfig({ isOpen: false });
        }
    };
    
    const handleDeleteAttachmentClick = (attachment) => {
        setModalConfig({
            isOpen: true,
            title: "Delete Attachment",
            message: `Are you sure you want to permanently delete "${attachment.file_name}"?`,
            onConfirm: () => handleConfirmDeleteAttachment(attachment.attachment_id),
        });
    };

    const handleConfirmDeleteAttachment = async (attachmentId) => {
        try {
            await deleteAttachment(taskId, attachmentId);
            setTask(prev => ({ ...prev, attachments: prev.attachments.filter(a => a.attachment_id !== attachmentId) }));
            onUpdate();
        } catch (err) {
            console.error("Failed to delete attachment:", err);
            alert("Error: Could not delete the attachment.");
        } finally {
            setModalConfig({ isOpen: false });
        }
    };

    const handleDeleteTaskClick = () => {
        setIsActionsMenuOpen(false);
        setModalConfig({
            isOpen: true,
            title: "Delete Task",
            message: "This action is irreversible. It will permanently delete this task and all its sub-tasks, comments, and attachments. Are you sure?",
            confirmText: "Yes, Delete This Task",
            onConfirm: handleConfirmDeleteTask,
        });
    };

    const handleConfirmDeleteTask = async () => {
        try {
            await deleteTask(taskId);
            onClose();
            onUpdate();
        } catch (err) {
            console.error("Failed to delete task:", err);
            alert("Error: Could not delete the task.");
        } finally {
            setModalConfig({ isOpen: false });
        }
    };

    const renderContent = () => {
        if (loading || !task) return <Spinner />;
        if (error) return <p className="error-message">Error: {error}</p>;

        return (
            <>
                <div className="task-detail-container">
                    <div className="task-detail-header">
                        <span className="task-type">{task.type}</span>
                        <h1>{task.title}</h1>
                        <span className="task-id-header">{task.project_key}-{task.task_id}</span>
                        
                        <button className="actions-menu-button" onClick={() => setIsActionsMenuOpen(prev => !prev)}>...</button>
                        {isActionsMenuOpen && (
                            <div className="actions-dropdown">
                                {hasPermission('DELETE_TASK') && (
                                    <button className="delete-action" onClick={handleDeleteTaskClick}>Delete Task</button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="task-detail-body">
                        <div className="task-detail-main">
                            <section className="task-section">
                                <h3>Description</h3>
                                <p className="task-description">{task.description || "No description provided."}</p>
                            </section>
                            
                            <section className="task-section">
                                <h3>Attachments</h3>
                                <AttachmentList 
                                    attachments={task.attachments} 
                                    onAttachmentDeleted={handleDeleteAttachmentClick} 
                                />
                                {hasPermission('ADD_ATTACHMENT') && (
                                    <AttachmentForm taskId={task.task_id} onAttachmentAdded={handleAttachmentAdded} />
                                )}
                            </section>

                            <section className="task-section">
                                <h3>Sub-tasks</h3>
                                {task.subtasks?.length > 0 ? (
                                    <ul className="subtask-list">
                                        {task.subtasks.map(st => <li key={st.task_id}>{st.title} <span>({st.assignee_name || 'Unassigned'})</span></li>)}
                                    </ul>
                                ) : <p>No sub-tasks.</p>}
                                {hasPermission('CREATE_SUBTASK') && (
                                    <button className="btn-secondary" onClick={() => setIsSubtaskModalOpen(true)}>+ Add Sub-task</button>
                                )}
                            </section>

                            <section className="task-section">
                                <h3>Comments</h3>
                                <ul className="comments-list">
                                    {task.comments && task.comments.map(comment => (
                                        <li key={comment.comment_id} className="comment-item">
                                            <div className="comment-header">
                                                <strong>{comment.user_name}</strong>
                                                {hasPermission('DELETE_COMMENT') && (
                                                    <button className="delete-comment-btn" onClick={() => handleDeleteCommentClick(comment)} title="Delete comment">&times;</button>
                                                )}
                                            </div>
                                            <p>{comment.message}</p>
                                        </li>
                                    ))}
                                </ul>
                                <AddCommentForm
                                    taskId={task.task_id}
                                    onCommentAdded={handleCommentAdded}
                                    disabled={!hasPermission('ADD_COMMENT')}
                                />
                            </section>
                        </div>

                        <div className="task-detail-sidebar">
                           <div className="sidebar-section"><h4>Status</h4><select value={task.status_id} onChange={(e) => handleUpdate('status_id', parseInt(e.target.value))} disabled={!hasPermission('EDIT_TASK_STATUS')}>{workflowStatuses.map(s => <option key={s.status_id} value={s.status_id}>{s.name}</option>)}</select></div>
                           <div className="sidebar-section">
                                <h4>Assignee</h4>
                                {/* --- THIS IS THE FIX (PART 3) --- */}
                                {/* Use project.members from the context to populate the dropdown */}
                                <select value={task.assignee_id || ''} onChange={(e) => handleUpdate('assignee_id', parseInt(e.target.value) || null)} disabled={!hasPermission('EDIT_TASK_ASSIGNEE')}>
                                    <option value="">Unassigned</option>
                                    {project?.members && project.members.map(member => (
                                        <option key={member.user_id} value={member.user_id}>{member.name}</option>
                                    ))}
                                </select>
                            </div>
                           <div className="sidebar-section"><h4>Priority</h4><select value={task.priority} onChange={(e) => handleUpdate('priority', e.target.value)} disabled={!hasPermission('EDIT_TASK_DETAILS')}><option value="Highest">Highest</option><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option><option value="Lowest">Lowest</option></select></div>
                           <div className="sidebar-section"><h4>Labels</h4><div className="labels-container">{task.labels && task.labels.map(label => (<span key={label.label_id} className="task-label">{label.name}</span>))}{(!task.labels || task.labels.length === 0) && <p>None</p>}</div></div>
                        </div>
                    </div>
                </div>

                {isSubtaskModalOpen && (
                    // --- THIS IS THE FIX (PART 4) ---
                    // Pass project.members from context to the subtask modal
                    <CreateSubtaskModal parentTask={task} users={project.members} onClose={() => setIsSubtaskModalOpen(false)} onSubtaskCreated={handleSubtaskCreated}/>
                )}
                
                <ConfirmationModal
                    isOpen={modalConfig.isOpen}
                    onClose={() => setModalConfig({ isOpen: false })}
                    onConfirm={modalConfig.onConfirm}
                    title={modalConfig.title}
                    message={modalConfig.message}
                    confirmText={modalConfig.confirmText || "Delete"}
                />
            </>
        );
    };

    return (
        <Modal onClose={onClose} size="large">
            {renderContent()}
        </Modal>
    );
};

export default TaskDetailModal;