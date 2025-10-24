// src/components/Board/TaskCard.jsx
import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import './TaskCard.css';

const TaskCard = ({ task, index, onClick }) => {
    return (
        <Draggable draggableId={String(task.task_id)} index={index}>
            {(provided, snapshot) => (
                <div
                    className={`task-card ${snapshot.isDragging ? 'is-dragging' : ''}`}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => onClick(task.task_id)}
                >
                    <div className="task-header">
                        <p className="task-title">{task.title}</p>
                        <span className="task-id">
                            {task.project_key ? `${task.project_key}-` : ''}{task.task_id}
                        </span>
                    </div>
                    
                    {task.description && (
                        <p className="task-description">{task.description}</p>
                    )}
                    
                    <div className="task-footer">
                        <div className="task-meta">
                            {task.priority && (
                                <span className={`task-priority priority-${task.priority.toLowerCase()}`}>
                                    {task.priority}
                                </span>
                            )}
                            
                            {task.assignee && (
                                <div className="task-assignee">
                                    <div className="assignee-avatar">
                                        {task.assignee.name ? task.assignee.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <span className="assignee-name">
                                        {task.assignee.name || 'Unassigned'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default TaskCard;