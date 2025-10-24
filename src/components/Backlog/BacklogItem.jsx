// src/components/Backlog/BacklogItem.jsx
import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import './BacklogItem.css';

const BacklogItem = ({ task, index, onClick }) => {
    return (
        <Draggable draggableId={String(task.task_id)} index={index}>
            {(provided, snapshot) => (
                <div
                    className={`backlog-item ${snapshot.isDragging ? 'is-dragging' : ''}`}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={onClick}
                >
                    <span className="task-id">{task.project_key}-{task.task_id}</span>
                    <span className="task-title">{task.title}</span>
                    <span className={`task-status status-${task.status.toLowerCase().replace(' ', '-')}`}>
                        {task.status}
                    </span>
                    <span className={`task-priority ${task.priority.toLowerCase()}`}>
                        {task.priority}
                    </span>
                </div>
            )}
        </Draggable>
    );
};

export default BacklogItem;