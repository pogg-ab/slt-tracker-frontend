import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useParams, Outlet, NavLink, useNavigate, useSearchParams } from 'react-router-dom';

// Core Component Imports
import Spinner from '../components/common/Spinner';

// Context & Hook Imports
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';

// API Service Imports
import { getProjects, getProjectById } from '../services/api';

// Feature Component Imports
import CreateProjectModal from '../components/Projects/CreateProjectModal';
import CreateTaskModal from '../components/Tasks/CreateTaskModal';
import TaskDetailModal from '../components/Tasks/TaskDetailModal';

// CSS Import
import './ProjectPage.css';

// =========================================================================
// 1. PROJECT CONTEXT AND HOOK DEFINITION
// =========================================================================
const ProjectContext = createContext(null);
export const useProject = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
};

// =========================================================================
// 2. THE PROJECT PROVIDER COMPONENT
// =========================================================================
const ProjectProvider = ({ children }) => {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProjectData = useCallback(async () => {
        if (!projectId || isNaN(projectId)) {
            setLoading(false);
            setProject(null);
            return;
        }
        setLoading(true);
        try {
            const response = await getProjectById(projectId);
            setProject(response.data);
            setPermissions(response.data.currentUserPermissions || []);
            setError(null);
        } catch (err) {
            setError('Failed to load project. You may not have the required permissions.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchProjectData();
    }, [fetchProjectData]);

    const hasPermission = useCallback((requiredPermission) => {
        return permissions.includes(requiredPermission);
    }, [permissions]);

    if (loading) {
        return <Spinner />;
    }
    
    if (error && !project) {
        return <div className="error-message" style={{ padding: '20px' }}>{error}</div>;
    }

    const value = { project, permissions, hasPermission, refreshProjectData: fetchProjectData };

    return (
        <ProjectContext.Provider value={value}>
            {children}
        </ProjectContext.Provider>
    );
};

// =========================================================================
// 3. THE MAIN PAGE CONTENT COMPONENT
// =========================================================================
const ProjectPageContent = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const { project, hasPermission, refreshProjectData } = useProject();

    // State for the list of ALL projects (for the dropdown)
    const [projects, setProjects] = useState([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);
    const { request: fetchProjectsApi, error: projectsError } = useApi(getProjects);

    // State for modals
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedTaskId, setSelectedTaskId] = useState(null);

    useEffect(() => {
        const taskIdFromUrl = searchParams.get('taskId');
        if (taskIdFromUrl) {
            setSelectedTaskId(taskIdFromUrl);
        } else {
            setSelectedTaskId(null);
        }
    }, [searchParams]);

    const loadProjects = useCallback(async () => {
        setIsLoadingProjects(true);
        try {
            const projectData = await fetchProjectsApi();
            setProjects(projectData);
        } catch (err) {
            console.error("Failed to load projects", err);
        } finally {
            setIsLoadingProjects(false);
        }
    }, [fetchProjectsApi]);

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    useEffect(() => {
        if (!isLoadingProjects && projects.length > 0 && (!projectId || projectId === 'null')) {
            navigate(`/projects/${projects[0].project_id}/board`, { replace: true });
        }
    }, [isLoadingProjects, projects, projectId, navigate]);

    const handleProjectCreated = (newProject) => {
        loadProjects(); 
        navigate(`/projects/${newProject.project_id}/board`);
    };

    const handleTaskCreated = () => {
        refreshProjectData();
    };
    
    const handleTaskUpdated = () => {
        refreshProjectData();
    };

    const handleProjectChange = (e) => {
        const newProjectId = e.target.value;
        navigate(`/projects/${newProjectId}/board`);
    };

    const handleCloseTaskDetailModal = () => {
        setSelectedTaskId(null);
        setSearchParams({}, { replace: true });
    };

    if (!project) {
        return <Spinner />;
    }

    if (isLoadingProjects) {
        return <Spinner />;
    }

    if (projectsError) {
        return <div className="project-page-container"><h2>Error loading projects list.</h2></div>;
    }

    if (!projects || projects.length === 0) {
        // This is a good place to show a "Create your first project" message
    }
    
    return (
        <>
            <div className="project-page-container">
                <header className="project-header">
                    <div className="project-selector">
                        <select value={projectId} onChange={handleProjectChange}>
                            {projects.map(p => (
                                <option key={p.project_id} value={p.project_id}>
                                    {p.name} ({p.project_key})
                                </option>
                            ))}
                        </select>
                    </div>

                    {hasPermission('EDIT_TASK_DETAILS') && (
                        <button className="create-task-btn-project" onClick={() => setIsTaskModalOpen(true)}>
                            + Create Task
                        </button>
                    )}
                </header>

                <div className="project-content-wrapper">
                    <nav className="project-sidebar">
                        <NavLink to={`/projects/${projectId}/board`}>Board</NavLink>
                        <NavLink to={`/projects/${projectId}/backlog`}>Backlog</NavLink>
                        
                        {hasPermission('VIEW_REPORTS') && (
                            <NavLink to={`/projects/${projectId}/reports`}>Reports</NavLink>
                        )}
                        
                        {hasPermission('EDIT_PROJECT_DETAILS') && (
                             <NavLink to={`/projects/${projectId}/settings`}>Settings</NavLink>
                        )}
                    </nav>

                    <main className="project-main-content">
                        <Outlet context={{ openTaskModal: (taskId) => setSearchParams({ taskId }) }} />
                    </main>
                </div>
            </div>

            {isTaskModalOpen && (
                <CreateTaskModal 
                    onClose={() => setIsTaskModalOpen(false)} 
                    onTaskCreated={handleTaskCreated}
                    members={project.members} 
                />
            )}

            {selectedTaskId && (
                <TaskDetailModal
                    taskId={selectedTaskId}
                    projectMembers={project.members}
                    onClose={handleCloseTaskDetailModal}
                    onUpdate={handleTaskUpdated}
                />
            )}
        </>
    );
};

// =========================================================================
// 4. THE FINAL EXPORTED COMPONENT
// =========================================================================
const ProjectPage = () => {
    return (
        <ProjectProvider>
            <ProjectPageContent />
        </ProjectProvider>
    );
};

export default ProjectPage;