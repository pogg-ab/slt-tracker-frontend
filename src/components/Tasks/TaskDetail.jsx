// src/components/Tasks/TaskDetail.jsx

import React, { useState } from 'react';
import { updateTaskStatus } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AddCommentForm from './AddCommentForm';
import CreateSubtaskModal from './CreateSubtaskModal';
import AttachmentForm from './AttachmentForm';
import AttachmentList from './AttachmentList';
import LogTimeForm from './LogTimeForm';
import './TaskDetail.css';

const TaskDetail = ({ task: initialTask, users = [] }) => {
    const [task, setTask] = useState(initialTask);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);
    
    // Get the logged-in user's details for permission checks
    const { user, hasPermission } = useAuth();

    const handleSubtaskToggle = async (subtaskId, currentStatus) => {
        const newStatus = currentStatus === 'Completed' ? 'In Progress' : 'Completed';
        
        try {
            // Optimistically update UI first
            const updatedSubtasks = task.subtasks.map(st => 
                st.task_id === subtaskId ? { ...st, status: newStatus } : st
            );
            const completedCount = updatedSubtasks.filter(st => st.status === 'Completed').length;
            const newProgress = Math.round((completedCount / updatedSubtasks.length) * 100);

            setTask(prevTask => ({
                ...prevTask,
                subtasks: updatedSubtasks,
                progress: newProgress,
            }));

            // Then make the API call
            await updateTaskStatus(subtaskId, newStatus);
        } catch (error) {
            alert('Failed to update subtask status.');
            console.error(error);
        }
    };

    const findUserNameById = (userId) => {
        if (!users || users.length === 0 || !userId) return `ID: ${userId || 'unassigned'}`;
        const user = users.find(u => u.user_id === userId);
        return user ? user.name : `Unknown User (ID: ${userId})`;
    };

    if (!task) {
        return <p>Loading task details...</p>;
    }
    
    const statusOptions = ['Pending', 'In Progress', 'Completed', 'Overdue'];
    const isParentTaskWithSubtasks = task.subtasks && task.subtasks.length > 0;

    return (
        <div className="task-detail-container">
            {/* --- HEADER --- */}
            <div className="task-detail-header">
                <h1>{task.title}</h1>
                <select 
                    className={`status-select status-bg-${task.status.toLowerCase().replace(' ', '-')}`}
                    value={task.status}
                    onChange={async (e) => {
                        const newStatus = e.target.value;
                        setIsUpdatingStatus(true);
                        try {
                            const response = await updateTaskStatus(task.task_id, newStatus);
                            const newProgress = newStatus === 'Completed' ? 100 : task.progress;
                            setTask(prevTask => ({ ...prevTask, ...response.data, progress: newProgress }));
                        } catch (error) {
                            console.error("Failed to update status", error);
                        } finally {
                            setIsUpdatingStatus(false);
                        }
                    }}
                    disabled={isUpdatingStatus || isParentTaskWithSubtasks}
                    title={isParentTaskWithSubtasks ? "Status is determined by subtask completion" : "Change task status"}
                >
                    {statusOptions.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
            </div>

            {/* --- PROGRESS BAR --- */}
            {(task.progress !== null && typeof task.progress !== 'undefined') && (
                <div className="progress-section">
                    <div className="progress-bar-background">
                        <div 
                            className="progress-bar-foreground" 
                            style={{ width: `${task.progress}%` }}
                        ></div>
                    </div>
                    <span className="progress-text">{task.progress}% Complete</span>
                </div>
            )}
            
            <p className="task-description">{task.description || "No description provided."}</p>
            
            {/* --- DETAILS GRID --- */}
            <div className="details-grid">
                <div><strong>Priority:</strong> {task.priority}</div>
                <div><strong>Due Date:</strong> {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</div>
                <div><strong>Assignee:</strong> {findUserNameById(task.assignee_id)}</div>
                <div><strong>Assigner:</strong> {findUserNameById(task.assigner_id)}</div>
            </div>

            {/* --- SUBTASKS SECTION --- */}
            <div className="task-section">
                <div className="task-section-header">
                    <h3>Sub-tasks</h3>
                    {hasPermission('CREATE_SUBTASK') && (
                        <button className="btn btn-secondary" onClick={() => setIsSubtaskModalOpen(true)}>
                            + Add Subtask
                        </button>
                    )}
                </div>
                {task.subtasks?.length > 0 ? (
                    <ul className="subtask-list">
                        {task.subtasks.map(st => (
                            <li key={st.task_id} className="subtask-item">
                                <input 
                                    type="checkbox" 
                                    id={`subtask-${st.task_id}`}
                                    checked={st.status === 'Completed'}
                                    onChange={() => handleSubtaskToggle(st.task_id, st.status)}
                                    disabled={st.assignee_id !== user.user_id}
                                    title={st.assignee_id !== user.user_id ? "Only the assignee can update this" : "Mark as complete"}
                                />
                                <label htmlFor={`subtask-${st.task_id}`} className={st.status === 'Completed' ? 'completed' : ''}>
                                    {st.title}
                                </label>
                            </li>
                        ))}
                    </ul>
                ) : (<p>No sub-tasks.</p>)}
            </div>

            {/* --- TIME LOGGING SECTION --- */}
            <div className="task-section">
                <h3>Time Logged</h3>
                {task.time_entries && task.time_entries.length > 0 ? (
                    <ul className="time-entries-list">
                        {task.time_entries.map(entry => (
                            <li key={entry.entry_id}>
                                {entry.duration_minutes} minutes by <strong>{entry.user_name}</strong> on {new Date(entry.entry_date).toLocaleDateString()}
                                {entry.notes && <p className="entry-notes"><em>Notes: {entry.notes}</em></p>}
                            </li>
                        ))}
                    </ul>
                ) : <p>No time has been logged for this task yet.</p>}
                <LogTimeForm 
                    taskId={task.task_id}
                    onTimeLogged={(newTimeEntry) => setTask(prevTask => ({ ...prevTask, time_entries: [newTimeEntry, ...prevTask.time_entries] }))}
                />
            </div>

            {/* --- COMMENTS SECTION --- */}
            <div className="task-section">
                <h3>Comments</h3>
                <div className="comments-list">
                    {task.comments?.length > 0 ? (
                        <ul>{task.comments.map(c => <li key={c.comment_id}><strong>{c.user_name}:</strong> {c.message}</li>)}</ul>
                    ) : (<p>No comments yet.</p>)}
                </div>
                <AddCommentForm 
                    taskId={task.task_id} 
                    onCommentAdded={(newComment) => setTask(prevTask => ({...prevTask, comments: [...(prevTask.comments || []), newComment]}))} 
                />
            </div>

            {/* --- ATTACHMENTS SECTION --- */}
            <div className="task-section">
                <h3>Attachments</h3>
                <AttachmentList attachments={task.attachments} />
                <AttachmentForm
                    taskId={task.task_id}
                    onAttachmentAdded={(newAttachment) => {setTask(prevTask => ({ ...prevTask, attachments: [...(prevTask.attachments || []), newAttachment] }))}}
                />
            </div>

            {/* --- MODAL RENDERING LOGIC --- */}
            {isSubtaskModalOpen && (
                <CreateSubtaskModal 
                    parentTask={task}
                    // The 'users' prop is correctly removed here
                    onClose={() => setIsSubtaskModalOpen(false)}
                    onSubtaskCreated={(newSubtask) => {
                        const updatedSubtasks = [...(task.subtasks || []), newSubtask];
                        const completedCount = updatedSubtasks.filter(st => st.status === 'Completed').length;
                        const newProgress = Math.round((completedCount / updatedSubtasks.length) * 100);

                        setTask(prevTask => ({ 
                            ...prevTask, 
                            subtasks: updatedSubtasks,
                            progress: newProgress
                        }));
                        setIsSubtaskModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default TaskDetail;