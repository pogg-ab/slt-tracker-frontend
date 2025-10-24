// src/services/api.js

import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// This interceptor is perfect and remains unchanged. It's the core of your frontend auth.
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- Auth Service (Unchanged) ---
export const loginUser = (credentials) => apiClient.post('/users/login', credentials);
export const updateUserProfile = (profileData) => apiClient.put('/users/profile', profileData);
export const changePassword = (passwordData) => apiClient.put('/users/change-password', passwordData);

// =========================================================================
// NEW & UPDATED SERVICES FOR JIRA-LIKE FUNCTIONALITY
// =========================================================================

// --- Project Service (UPDATED for Settings Page) ---
export const getProjects = () => apiClient.get('/projects');
export const getProjectById = (projectId) => apiClient.get(`/projects/${projectId}`); // NEW
export const createProject = (projectData) => apiClient.post('/projects', projectData);
export const updateProjectDetails = (projectId, projectData) => apiClient.put(`/projects/${projectId}`, projectData); // NEW

// --- Member Management Service (NEW for Settings Page) ---
export const getProjectMembers = (projectId) => apiClient.get(`/projects/${projectId}/members`);
export const addProjectMember = (projectId, userId) => apiClient.post(`/projects/${projectId}/members`, { userId });
export const removeProjectMember = (projectId, userId) => apiClient.delete(`/projects/${projectId}/members/${userId}`);

// --- Task Service (HEAVILY UPDATED) ---
// OLD `getTasks` is replaced by this project-specific function
export const getTasksForProject = (projectId, filterParams = {}) => {
    return apiClient.get(`/tasks/project/${projectId}`, { params: filterParams });
};
export const getTaskById = (taskId) => apiClient.get(`/tasks/${taskId}`);
export const createTask = (taskData) => apiClient.post('/tasks', taskData);
// `updateTaskStatus` is replaced by a more generic and powerful `updateTask`
export const updateTask = (taskId, updateData) => apiClient.put(`/tasks/${taskId}`, updateData);
export const reorderTasks = (reorderData) => apiClient.put('/tasks/reorder', reorderData);

// --- Sprint Service (NEW) ---
export const getSprintsForProject = (projectId) => apiClient.get(`/sprints/project/${projectId}`);
export const createSprint = (sprintData) => apiClient.post('/sprints', sprintData);
export const addTaskToSprint = (sprintId, taskId) => apiClient.put(`/sprints/${sprintId}/addTask`, { task_id: taskId });
export const startSprint = (sprintId, dates) => apiClient.put(`/sprints/${sprintId}/start`, dates);
export const completeSprint = (sprintId, moveData) => apiClient.put(`/sprint/${sprintId}/complete`, moveData);
export const deleteSprint = (sprintId) => apiClient.delete(`/sprints/${sprintId}`);

// --- Epic Service (NEW) ---
export const getEpicsForProject = (projectId) => apiClient.get(`/epics/project/${projectId}`);
export const createEpic = (epicData) => apiClient.post('/epics', epicData);
export const addTaskToEpic = (epicId, taskId) => apiClient.put(`/epics/${epicId}/addTask`, { task_id: taskId });

// --- Label Service (NEW) ---
export const addLabelsToTask = (taskId, projectId, labels) => {
    return apiClient.post(`/labels/task/${taskId}`, { labels, project_id: projectId });
};
export const removeLabelFromTask = (taskId, labelId) => apiClient.delete(`/labels/task/${taskId}/${labelId}`);

// --- Comment & Attachment Service (Unchanged but listed for completeness) ---
export const addComment = (taskId, message) => apiClient.post(`/tasks/${taskId}/comments`, { message });
export const createSubtask = (parentTaskId, subtaskData) => apiClient.post(`/tasks/${parentTaskId}/subtasks`, subtaskData);
export const uploadAttachment = (taskId, formData) => {
    return apiClient.post(`/tasks/${taskId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

// --- Reports Service (UPDATED with Burndown Chart) ---
export const getSprintBurndownChart = (sprintId) => apiClient.get(`/reports/sprint/${sprintId}/burndown`);
// Keep any of your old report functions if they are still relevant
export const getDepartmentWorkloadReport = (deptId) => apiClient.get(`/reports/department/${deptId}`);
export const getDepartmentTimeAllocationReport = (deptId) => apiClient.get(`/reports/department-time/${deptId}`);
export const getDepartmentKpiReport = (deptId) => apiClient.get(`/reports/department-kpi/${deptId}`);

// --- User & Workflow Service ---
export const getDepartmentUsers = () => apiClient.get('/users/department');
export const getAllUsers = () => apiClient.get('/users'); // This is needed for the "Add Member" dropdown
export const getWorkflowForProject = (projectId) => apiClient.get(`/workflows/project/${projectId}`);

// --- NEW Project Role & Permission Service ---
export const getProjectRoles = () => apiClient.get('/projects/roles');
export const updateProjectMemberRole = (projectId, userId, projectRoleId) => 
    apiClient.put(`/projects/${projectId}/members/${userId}`, { projectRoleId });

export const getAllPermissionTypes = () => apiClient.get('/projects/permissions/all-types');
export const getRolesWithPermissions = () => apiClient.get('/projects/roles/permissions');
export const updateRolePermissions = (roleId, permissions) => 
    apiClient.put(`/projects/roles/${roleId}/permissions`, { permissions });

// === THIS IS THE CORRECTED SECTION ===
// Changed 'api' to 'apiClient' and removed '/api' prefix from URLs

export const deleteComment = (taskId, commentId) => apiClient.delete(`/tasks/${taskId}/comments/${commentId}`);

export const deleteAttachment = (taskId, attachmentId) => apiClient.delete(`/tasks/${taskId}/attachments/${attachmentId}`);

export const deleteTask = (taskId) => apiClient.delete(`/tasks/${taskId}`);
export const createUser = (userData) => apiClient.post('/users', userData);


export const createDepartment = (deptData) => apiClient.post('/departments', deptData);
export const getDepartments = () => apiClient.get('/departments');