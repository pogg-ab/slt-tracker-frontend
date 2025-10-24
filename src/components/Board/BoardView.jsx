// src/components/Board/BoardView.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';
import { useProject } from '../../pages/ProjectPage'; // 1. Import the project context hook
import BoardColumn from './BoardColumn';
import Spinner from '../common/Spinner';
import { useApi } from '../../hooks/useApi';
import { getTasksForProject, getWorkflowForProject, updateTask } from '../../services/api';
import './BoardView.css';
import TaskDetailModal from '../Tasks/TaskDetailModal';

const BoardView = () => {
    const { projectId } = useParams();
    // 2. Get the permission checker function from our context
    const { hasPermission } = useProject();

    const [columns, setColumns] = useState(null);
    const [tasks, setTasks] = useState({});
    const [activeTaskId, setActiveTaskId] = useState(null);

    const { data: fetchedTasks, loading: tasksLoading, request: fetchTasks } = useApi(getTasksForProject);
    const { data: workflow, loading: workflowLoading, request: fetchWorkflow } = useApi(getWorkflowForProject);

    const loadBoardData = useCallback(() => {
        if (projectId && !isNaN(projectId)) {
            fetchTasks(projectId);
            fetchWorkflow(projectId);
        }
    }, [projectId, fetchTasks, fetchWorkflow]);
    
    useEffect(() => {
        loadBoardData();
    }, [loadBoardData]);

    useEffect(() => {
        if (workflow && fetchedTasks) {
            const boardColumns = {};
            workflow.statuses.forEach(status => {
                boardColumns[status.status_id] = { ...status, taskIds: [] };
            });

            const boardTasks = {};
            fetchedTasks.forEach(task => {
                boardTasks[task.task_id] = task;
                if (boardColumns[task.status_id]) {
                    boardColumns[task.status_id].taskIds.push(task.task_id);
                }
            });

            Object.values(boardColumns).forEach(col => {
                col.taskIds.sort((a, b) => boardTasks[a].rank.localeCompare(boardTasks[b].rank));
            });

            setColumns(boardColumns);
            setTasks(boardTasks);
        }
    }, [workflow, fetchedTasks]);

    const onDragEnd = useCallback((result) => {
        // First, check if the user even has permission to change the status
        if (!hasPermission('EDIT_TASK_STATUS')) {
            // If they don't, do nothing. This prevents optimistic updates for unauthorized users.
            return;
        }

        const { destination, source, draggableId } = result;
        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
            return;
        }

        const taskId = draggableId;
        const startColId = source.droppableId;
        const endColId = destination.droppableId;

        const startCol = columns[startColId];
        const endCol = columns[endColId];
        const startTaskIds = Array.from(startCol.taskIds);
        startTaskIds.splice(source.index, 1);
        const endTaskIds = (startColId === endColId) ? startTaskIds : Array.from(endCol.taskIds);
        endTaskIds.splice(destination.index, 0, taskId);

        const newColumns = {
            ...columns,
            [startColId]: { ...startCol, taskIds: startTaskIds },
            [endColId]: { ...endCol, taskIds: endTaskIds }
        };
        setColumns(newColumns);

        if (startColId !== endColId) {
            updateTask(taskId, { status_id: endColId }).catch(err => {
                console.error("Failed to update task status", err);
                // On failure, revert the UI to its original state
                setColumns(columns);
            });
        }
    }, [columns, hasPermission]); // Add hasPermission to the dependency array

    // 3. Create the new click handler that checks permissions first
    const handleCardClick = (taskId) => {
        // As you requested, only open the modal if the user can edit details.
        // If you wanted Viewers to also open it, you could change this to check
        // for a more basic permission like 'ADD_COMMENT' or remove the check entirely.
        if (hasPermission('EDIT_TASK_DETAILS')) {
            setActiveTaskId(taskId);
        } else {
            // Optional: You can provide feedback to the user that the action is disabled.
            console.log("User does not have permission to view/edit task details.");
            // For a better UX, you could show a temporary toast message here.
        }
    };

    if (tasksLoading || workflowLoading || !columns) {
        return <Spinner />;
    }

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="board-view">
                    {workflow.statuses.map(columnData => {
                        const column = columns[columnData.status_id];
                        const columnTasks = column.taskIds.map(taskId => tasks[taskId]);
                        return (
                            <BoardColumn
                                key={column.status_id}
                                column={column}
                                tasks={columnTasks}
                                // 4. Pass the new, permission-aware click handler to the column
                                onCardClick={handleCardClick}
                            />
                        );
                    })}
                </div>
            </DragDropContext>
            
            {activeTaskId && (
                <TaskDetailModal 
                    taskId={activeTaskId} 
                    onClose={() => setActiveTaskId(null)}
                    onUpdate={loadBoardData}
                />
            )}
        </>
    );
};

export default BoardView;