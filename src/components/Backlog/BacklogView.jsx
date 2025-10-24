// src/components/Backlog/BacklogView.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { useProject } from '../../pages/ProjectPage'; // 1. Import the hook
import BacklogItem from './BacklogItem';
import Spinner from '../common/Spinner';
import { useApi } from '../../hooks/useApi';
import { 
    getTasksForProject, 
    reorderTasks, 
    createSprint, 
    getSprintsForProject, 
    startSprint,
    addTaskToSprint,
    deleteSprint
} from '../../services/api';
import './BacklogView.css';

// This component displays a single sprint and its tasks.
const SprintSection = ({ sprint, tasks, onStart, onDelete, canManageSprints }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className={`sprint-section status-${sprint.status.toLowerCase()}`}>
            <div className="sprint-header">
                <h4>{sprint.name}</h4>
                <div className="sprint-header-right">
                    {sprint.start_date && sprint.end_date && (
                        <span className="sprint-dates">
                            {formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}
                        </span>
                    )}

                    {/* Conditionally render the 'Start Sprint' button */}
                    {sprint.status === 'Future' && canManageSprints && (
                        <button onClick={() => onStart(sprint.sprint_id)} className="start-sprint-btn">
                            Start Sprint
                        </button>
                    )}
                    {sprint.status === 'Active' && <span className="sprint-status-badge active">Active</span>}
                    
                    {/* Conditionally render the 'Delete Sprint' button */}
                    {sprint.status === 'Future' && canManageSprints && (
                         <button onClick={() => onDelete(sprint.sprint_id)} className="delete-sprint-btn" title="Delete Sprint">
                             &times;
                         </button>
                    )}
                </div>
            </div>
            
            {/* Disable the drop zone if the user cannot manage sprints */}
            <Droppable droppableId={`sprint-${sprint.sprint_id}`} isDropDisabled={!canManageSprints}>
                {(provided, snapshot) => (
                    <div 
                        className={`sprint-task-area ${snapshot.isDraggingOver ? 'is-dragging-over' : ''}`}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                    >
                        {tasks.length > 0 ? (
                            tasks.map((task, index) => (
                                <BacklogItem key={task.task_id} task={task} index={index} />
                            ))
                        ) : (
                            <p className="sprint-droppable-placeholder">
                                {canManageSprints ? "Drag tasks from the backlog here." : "This sprint is being planned."}
                            </p>
                        )}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
};


const BacklogView = () => {
    const { projectId } = useParams();
    // 2. Get the permission checker function from the context
    const { hasPermission } = useProject();

    const [tasks, setTasks] = useState({});
    const [sprints, setSprints] = useState([]);

    const { data: fetchedTasks, loading: tasksLoading, error: tasksError, request: fetchTasks } = useApi(getTasksForProject);
    const { data: fetchedSprints, loading: sprintsLoading, error: sprintsError, request: fetchSprints } = useApi(getSprintsForProject);
    const { request: callStartSprint } = useApi(startSprint);
    const { request: callAddTaskToSprint } = useApi(addTaskToSprint);
    const { request: callDeleteSprint } = useApi(deleteSprint);
    const { request: callCreateSprint, loading: isSubmittingSprint } = useApi(createSprint);

    const [isCreatingSprint, setIsCreatingSprint] = useState(false);
    const [sprintFormData, setSprintFormData] = useState({ name: '', goal: '', start_date: '', end_date: '' });
    
    // 3. Check for the specific permission once and store it in a variable for clean use
    const canManageSprints = hasPermission('MANAGE_SPRINTS');

    const loadData = useCallback(() => {
        if (projectId) {
            fetchTasks(projectId);
            fetchSprints(projectId);
        }
    }, [projectId, fetchTasks, fetchSprints]);
    
    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        if (fetchedTasks) {
            const taskMap = fetchedTasks.reduce((acc, task) => { acc[task.task_id] = task; return acc; }, {});
            setTasks(taskMap);
        }
        if (fetchedSprints) {
            setSprints(fetchedSprints);
        }
    }, [fetchedTasks, fetchedSprints]);

    const handleSprintFormChange = (e) => {
        const { name, value } = e.target;
        setSprintFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateSprint = async (e) => {
        e.preventDefault();
        if (!sprintFormData.name.trim()) return;
        try {
            await callCreateSprint({ ...sprintFormData, project_id: projectId });
            setIsCreatingSprint(false);
            setSprintFormData({ name: '', goal: '', start_date: '', end_date: '' });
            loadData();
        } catch (err) {
            console.error(err);
            alert('Failed to create sprint.');
        }
    };

    const handleStartSprint = async (sprintId) => {
        if (window.confirm("Are you sure you want to start this sprint?")) {
            try {
                await callStartSprint(sprintId);
                loadData();
            } catch (err) {
                alert(err.response?.data?.message || "Failed to start sprint.");
            }
        }
    };

    const handleDeleteSprint = async (sprintId) => {
        if (window.confirm("Are you sure you want to permanently delete this sprint? Any tasks within it will be moved back to the backlog.")) {
            try {
                await callDeleteSprint(sprintId);
                loadData();
            } catch (err) {
                alert(err.response?.data?.message || "Failed to delete sprint.");
            }
        }
    };
    
    const onDragEnd = useCallback(async (result) => {
        const { destination, source, draggableId: taskId } = result;

        if (!destination) {
            return;
        }

        if (destination.droppableId.startsWith('sprint-') && source.droppableId === 'backlog') {
            const sprintId = destination.droppableId.split('-')[1];
            setTasks(prevTasks => ({
                ...prevTasks,
                [taskId]: { ...prevTasks[taskId], sprint_id: parseInt(sprintId) }
            }));
            try {
                await callAddTaskToSprint(sprintId, taskId);
            } catch (err) {
                alert("Failed to add task to sprint.");
                loadData();
            }
            return;
        }

        if (destination.droppableId === 'backlog' && source.droppableId === 'backlog') {
            if (destination.index === source.index) return;
            const currentBacklogTasks = Object.values(tasks).filter(task => !task.sprint_id).sort((a, b) => a.rank.localeCompare(b.rank));
            const [reorderedItem] = currentBacklogTasks.splice(source.index, 1);
            currentBacklogTasks.splice(destination.index, 0, reorderedItem);
            const newTaskMap = { ...tasks };
            currentBacklogTasks.forEach(task => { newTaskMap[task.task_id] = task; });
            setTasks(newTaskMap);
            const orderedTaskIds = currentBacklogTasks.map(t => t.task_id);
            reorderTasks({ orderedTaskIds }).catch(err => {
                console.error("Failed to reorder tasks", err);
                alert("Could not reorder tasks. Please try again.");
                loadData();
            });
        }
    }, [tasks, callAddTaskToSprint, loadData]);

    if (tasksLoading || sprintsLoading) {
        return <Spinner />;
    }
    if (tasksError || sprintsError) {
        return <p className="error-message">Error loading data.</p>;
    }

    const allTasks = Object.values(tasks);
    const backlogTasks = allTasks.filter(task => !task.sprint_id).sort((a, b) => a.rank.localeCompare(b.rank));
    
    return (
        <div className="backlog-view">
            <div className="backlog-actions">
                <h2>Project Planning</h2>
                
                {/* 4. The "Create Sprint" button is now wrapped in a permission check */}
                {canManageSprints && (
                    <button className="create-sprint-btn" onClick={() => setIsCreatingSprint(true)}>
                        + Create Sprint
                    </button>
                )}
            </div>

            {/* The form will now only be shown if the create button was clicked AND the user has permission */}
            {isCreatingSprint && canManageSprints && (
                <form onSubmit={handleCreateSprint} className="create-sprint-form advanced">
                    <input name="name" type="text" value={sprintFormData.name} onChange={handleSprintFormChange} placeholder="Sprint Name (e.g., Sprint 1)" required autoFocus />
                    <textarea name="goal" value={sprintFormData.goal} onChange={handleSprintFormChange} placeholder="Sprint Goal (Optional)"></textarea>
                    <div className="date-inputs">
                        <label>Start Date:</label>
                        <input name="start_date" type="date" value={sprintFormData.start_date} onChange={handleSprintFormChange} />
                        <label>End Date:</label>
                        <input name="end_date" type="date" value={sprintFormData.end_date} onChange={handleSprintFormChange} />
                    </div>
                    <div className="form-actions">
                        <button type="submit" disabled={isSubmittingSprint}>{isSubmittingSprint ? 'Creating...' : 'Create'}</button>
                        <button type="button" onClick={() => setIsCreatingSprint(false)} disabled={isSubmittingSprint}>Cancel</button>
                    </div>
                </form>
            )}

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="sprints-container">
                    {sprints.map(sprint => {
                        const sprintTasks = allTasks.filter(task => task.sprint_id === sprint.sprint_id).sort((a, b) => a.rank.localeCompare(b.rank));
                        return (
                            <SprintSection 
                                key={sprint.sprint_id} 
                                sprint={sprint} 
                                tasks={sprintTasks} 
                                onStart={handleStartSprint} 
                                onDelete={handleDeleteSprint} 
                                canManageSprints={canManageSprints} 
                            />
                        );
                    })}
                </div>
                <h3 className="backlog-title">Backlog</h3>
                <div className="backlog-header">
                    <span>ID</span>
                    <span>Title</span>
                    <span>Status</span>
                    <span>Priority</span>
                </div>
                
                <Droppable droppableId="backlog">
                    {(provided) => (
                        <div className="backlog-list" ref={provided.innerRef} {...provided.droppableProps}>
                            {backlogTasks.map((task, index) => (
                                <BacklogItem key={task.task_id} task={task} index={index} />
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

export default BacklogView;