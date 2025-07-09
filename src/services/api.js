import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'https://api.tracker.skylinkict.com/api',
    headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// --- Auth Service ---
export const loginUser = (credentials) => apiClient.post('/users/login', credentials);
export const changePassword = (passwordData) => apiClient.put('/users/change-password', passwordData);

// --- User, Profile, & Admin Service ---
export const getMyProfile = () => apiClient.get('/users/profile');
export const updateUserProfile = (profileData) => apiClient.put('/users/profile', profileData);
export const registerUser = (userData) => apiClient.post('/users/register', userData);
export const getAllUsers = () => apiClient.get('/users');
export const getDepartmentUsers = () => apiClient.get('/users/department');
export const getUserWithPermissions = (userId) => apiClient.get(`/users/${userId}/with-permissions`);
export const getAllPermissions = () => apiClient.get('/users/permissions-list');
export const getUserPermissions = (userId) => apiClient.get(`/users/${userId}/permissions`);
export const updateUserPermissions = (userId, permissionIds) => apiClient.put(`/users/${userId}/permissions`, { permissionIds });
export const getRelatedTasksForUser = (userId) => apiClient.get(`/users/${userId}/related-tasks`);
export const registerDevice = (tokenData) => apiClient.post('/users/register-device', tokenData);

// --- Department Service ---
export const getAllDepartments = () => apiClient.get('/departments');
export const createDepartment = (deptData) => apiClient.post('/departments', deptData);
export const getDepartmentUsersWithStats = (deptId) => apiClient.get(`/departments/${deptId}/users`);


// --- Task & Subtask Service ---
export const getTasks = (filterParams = {}) => apiClient.get('/tasks', { params: filterParams });
export const getTaskById = (taskId) => apiClient.get(`/tasks/${taskId}`);
export const createTask = (taskData) => apiClient.post('/tasks', taskData);
export const updateTaskStatus = (taskId, status) => apiClient.put(`/tasks/${taskId}`, { status });
export const createSubtask = (parentTaskId, subtaskData) => apiClient.post(`/tasks/${parentTaskId}/subtasks`, subtaskData);

// --- Comment & Attachment Service ---
export const addComment = (taskId, message) => apiClient.post(`/tasks/${taskId}/comments`, { message });

// === THIS IS THE CORRECTED FUNCTION ===
export const uploadAttachment = (taskId, formData) => {
    // We must override the default 'Content-Type' for file uploads.
    // By setting it to 'multipart/form-data', we let the browser handle setting the
    // correct headers with boundaries for the file data.
    return apiClient.post(`/tasks/${taskId}/attachments`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

// --- Report Service ---
export const getDepartmentWorkloadReport = (deptId, filters = {}) => apiClient.get(`/reports/department/${deptId}`, { params: filters });
export const getDepartmentTimeAllocationReport = (deptId, filters = {}) => apiClient.get(`/reports/department-time/${deptId}`, { params: filters });
export const getDepartmentKpiReport = (deptId) => apiClient.get(`/reports/department-kpi/${deptId}`);

// --- Time Entry Service ---
export const logTimeForTask = (taskId, timeData) => {
    return apiClient.post(`/tasks/${taskId}/time-entries`, timeData);
};
export const deleteTask = (taskId) => apiClient.delete(`/tasks/${taskId}`);

export const updateUser = (userId, userData) => apiClient.put(`/users/${userId}`, userData);
export const deleteUser = (userId) => apiClient.delete(`/users/${userId}`);