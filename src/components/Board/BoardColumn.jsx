// src/components/Board/BoardColumn.jsx
import React from 'react';
import { Droppable } from '@hello-pangea/dnd'; // Use the new library
import TaskCard from './TaskCard';
import './BoardColumn.css';

const BoardColumn = ({ column, tasks, onCardClick }) => { // Added onCardClick prop
    return (
        <div className="board-column">
            <h3 className="column-title">{column.name}</h3>
            <Droppable droppableId={String(column.status_id)}>
                {(provided, snapshot) => (
                    <div
                        className={`task-list ${snapshot.isDraggingOver ? 'is-dragging-over' : ''}`}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                    >
                        {tasks.map((task, index) => (
                            <TaskCard
                                key={task.task_id}
                                task={task}
                                index={index}
                                onClick={onCardClick} // Pass the click handler down
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
};

export default BoardColumn;