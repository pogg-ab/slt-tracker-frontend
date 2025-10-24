// src/components/Tasks/TaskDetail.jsx
import React, { useState } from 'react';
import { updateTaskStatus } from '../../services/api';
import AddCommentForm from './AddCommentForm';
import CreateSubtaskModal from './CreateSubtaskModal';
import AttachmentForm from './AttachmentForm';
import AttachmentList from './AttachmentList';
import './TaskDetail.css';

const TaskDetail = ({ task: initialTask, users = [] }) => {
    const [task, setTask] = useState(initialTask);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);

    const findUserNameById = (userId) => {
        if (!users || users.length === 0) return `ID: ${userId}`;
        const user = users.find(u => u.user_id === userId);
        return user ? user.name : `Unknown User (ID: ${userId})`;
    };

    if (!task) {
        return <div className="task-detail-loading">Loading task details...</div>;
    }

    const statusOptions = ['Pending', 'In Progress', 'Completed', 'Overdue'];

    return (
        <div className="task-detail-container">
            {/* HEADER SECTION */}
            <div className="task-header">
                <div className="task-title-section">
                    <span className="task-key">{task.project_key}-{task.task_number}</span>
                    <h1 className="task-title">{task.title}</h1>
                </div>
                <div className="task-status-section">
                    <label>Status</label>
                    <select 
                        className={`status-select status-${task.status.toLowerCase().replace(' ', '-')}`}
                        value={task.status}
                        onChange={async (e) => {
                            const newStatus = e.target.value;
                            setIsUpdatingStatus(true);
                            try {
                                const response = await updateTaskStatus(task.task_id, newStatus);
                                setTask(response.data);
                            } catch (error) {
                                console.error("Failed to update status", error);
                                alert("Failed to update status. Please try again.");
                            } finally {
                                setIsUpdatingStatus(false);
                            }
                        }}
                        disabled={isUpdatingStatus}
                    >
                        {statusOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="task-content-grid">
                {/* LEFT COLUMN - Details & Description */}
                <div className="task-main-content">
                    {/* DESCRIPTION */}
                    <section className="task-section">
                        <h3>Description</h3>
                        <div className="description-content">
                            {task.description || (
                                <p className="no-description">No description provided.</p>
                            )}
                        </div>
                    </section>

                    {/* SUBTASKS */}
                    <section className="task-section">
                        <div className="section-header">
                            <h3>Sub-tasks</h3>
                            <button 
                                className="btn-primary"
                                onClick={() => setIsSubtaskModalOpen(true)}
                            >
                                + Add Subtask
                            </button>
                        </div>
                        {task.subtasks?.length > 0 ? (
                            <ul className="subtask-list">
                                {task.subtasks.map(st => (
                                    <li key={st.task_id} className="subtask-item">
                                        <span className="subtask-title">{st.title}</span>
                                        <span className="subtask-assignee">
                                            {findUserNameById(st.assignee_id)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="empty-state">No sub-tasks created yet.</p>
                        )}
                    </section>

                    {/* COMMENTS */}
                    <section className="task-section">
                        <h3>Comments</h3>
                        <div className="comments-section">
                            {task.comments?.length > 0 ? (
                                <div className="comments-list">
                                    {task.comments.map(comment => (
                                        <div key={comment.comment_id} className="comment-item">
                                            <div className="comment-header">
                                                <strong>{comment.user_name}</strong>
                                                <span className="comment-time">
                                                    {new Date(comment.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="comment-text">{comment.message}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="empty-state">No comments yet.</p>
                            )}
                            <AddCommentForm 
                                taskId={task.task_id} 
                                onCommentAdded={(newComment) => setTask(prevTask => ({
                                    ...prevTask, 
                                    comments: [...prevTask.comments, newComment]
                                }))} 
                            />
                        </div>
                    </section>
                </div>

                {/* RIGHT SIDEBAR - Metadata & Actions */}
                <div className="task-sidebar">
                    {/* TASK METADATA */}
                    <section className="sidebar-section">
                        <h4>Task Details</h4>
                        <div className="metadata-grid">
                            <div className="metadata-item">
                                <label>Priority</label>
                                <span className={`priority-badge priority-${task.priority?.toLowerCase()}`}>
                                    {task.priority}
                                </span>
                            </div>
                            <div className="metadata-item">
                                <label>Assignee</label>
                                <span>{findUserNameById(task.assignee_id)}</span>
                            </div>
                            <div className="metadata-item">
                                <label>Assigner</label>
                                <span>{findUserNameById(task.assigner_id)}</span>
                            </div>
                            <div className="metadata-item">
                                <label>Due Date</label>
                                <span className={task.due_date && new Date(task.due_date) < new Date() ? 'overdue' : ''}>
                                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Not set'}
                                </span>
                            </div>
                            <div className="metadata-item">
                                <label>Created</label>
                                <span>{task.created_at ? new Date(task.created_at).toLocaleDateString() : 'N/A'}</span>
                            </div>
                        </div>
                    </section>

                    {/* ATTACHMENTS */}
                    <section className="sidebar-section">
                        <div className="section-header">
                            <h4>Attachments</h4>
                        </div>
                        <AttachmentList attachments={task.attachments} />
                        <AttachmentForm
                            taskId={task.task_id}
                            onAttachmentAdded={(newAttachment) => {
                                setTask(prevTask => ({
                                    ...prevTask,
                                    attachments: [...prevTask.attachments, newAttachment]
                                }));
                            }}
                        />
                    </section>
                </div>
            </div>

            {/* MODALS */}
            {isSubtaskModalOpen && (
                <CreateSubtaskModal 
                    parentTask={task}
                    users={users}
                    onClose={() => setIsSubtaskModalOpen(false)}
                    onSubtaskCreated={(newSubtask) => {
                        setTask(prevTask => ({
                            ...prevTask, 
                            subtasks: [...prevTask.subtasks, newSubtask]
                        }));
                        setIsSubtaskModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default TaskDetail;