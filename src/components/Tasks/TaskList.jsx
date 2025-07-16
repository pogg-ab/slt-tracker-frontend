"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { getTasks, deleteTask as apiDeleteTask } from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import Spinner from "../common/Spinner"
import "./TaskList.css"

const TaskList = ({ refreshKey }) => {
  // Using standard useState for direct control over the task list
  const [tasks, setTasks] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()
  const { user, hasPermission } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")

  // useCallback stabilizes the fetchTasks function reference
  const fetchTasks = useCallback(async (params) => {
    try {
      setLoading(true)
      const response = await getTasks(params)
      setTasks(response.data)
    } catch (err) {
      setError("Failed to load tasks.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  // This effect handles fetching and debouncing the search
  useEffect(() => {
    const params = {}
    if (searchTerm.trim() !== "") {
      params.search = searchTerm
    }

    const delayDebounceFn = setTimeout(() => {
      fetchTasks(params)
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [fetchTasks, searchTerm, refreshKey])

  const handleDeleteTask = async (taskIdToDelete, event) => {
    event.stopPropagation()
    if (window.confirm("Are you sure you want to permanently delete this task?")) {
      try {
        await apiDeleteTask(taskIdToDelete)
        setTasks((currentTasks) => currentTasks.filter((task) => task.task_id !== taskIdToDelete))
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setTasks((currentTasks) => currentTasks.filter((task) => task.task_id !== taskIdToDelete))
        } else {
          alert("Failed to delete the task.")
        }
      }
    }
  }

  // === FINAL 3-SECTION LOGIC ===
  // 1. Tasks assigned TO the logged-in user
  const myAssignedTasks = tasks?.filter((task) => task.assignee_id === user.user_id) || []

  // 2. Tasks assigned BY the logged-in user to SOMEONE ELSE
  const myCreatedTasks =
    tasks?.filter((task) => task.assigner_id === user.user_id && task.assignee_id !== user.user_id) || []

  // 3. All other tasks in the department (visible only if user has VIEW_ANY_TASK permission)
  const otherDepartmentTasks = hasPermission("VIEW_ANY_TASK")
    ? tasks?.filter((task) => task.assignee_id !== user.user_id && task.assigner_id !== user.user_id) || []
    : []

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
        )
      case "in progress":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12l2 2 4-4" />
          </svg>
        )
      case "completed":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22,4 12,14.01 9,11.01" />
          </svg>
        )
      case "overdue":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        )
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
          </svg>
        )
    }
  }

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "priority-high"
      case "medium":
        return "priority-medium"
      case "low":
        return "priority-low"
      default:
        return "priority-medium"
    }
  }

  if (loading) {
    return (
      <div className="task-list-loading">
        <Spinner />
        <p>Loading your tasks...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="task-list-error">
        <div className="error-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <p className="error-message">{error}</p>
      </div>
    )
  }

  const renderTaskItem = (task, context) => (
    <div key={task.task_id} className="task-card" onClick={() => navigate(`/tasks/${task.task_id}`)}>
      <div className="task-card-header">
        <div className="task-priority-indicator">
          <div className={`priority-dot ${getPriorityColor(task.priority)}`}></div>
        </div>
        <div className="task-actions">
          {hasPermission("DELETE_ANY_TASK") && (
            <button className="task-delete-btn" title="Delete Task" onClick={(e) => handleDeleteTask(task.task_id, e)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3,6 5,6 21,6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="task-card-content">
        <h3 className="task-title">{task.title}</h3>
        <p className="task-description">{task.description || "No description provided"}</p>

        <div className="task-meta">
          <div className="task-assignee">
            <div className="assignee-avatar">
              {context === "my-tasks"
                ? task.assigner_name?.charAt(0)?.toUpperCase() || "?"
                : task.assignee_name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="assignee-info">
              <span className="assignee-label">{context === "my-tasks" ? "Assigned by" : "Assigned to"}</span>
              <span className="assignee-name">{context === "my-tasks" ? task.assigner_name : task.assignee_name}</span>
            </div>
          </div>

          {task.due_date && (
            <div className="task-due-date">
              <svg className="due-date-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{new Date(task.due_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      <div className="task-card-footer">
        <div className={`task-status status-${task.status.toLowerCase().replace(" ", "-")}`}>
          <div className="status-icon">{getStatusIcon(task.status)}</div>
          <span className="status-text">{task.status}</span>
        </div>

        {task.priority && (
          <div className={`task-priority ${getPriorityColor(task.priority)}`}>
            <svg className="priority-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
            </svg>
            <span>{task.priority}</span>
          </div>
        )}
      </div>
    </div>
  )

  const renderTaskSection = (title, tasks, context, icon, emptyMessage) => (
    <div className="task-section">
      <div className="section-header">
        <div className="section-title">
          <div className="section-icon">{icon}</div>
          <div className="section-info">
            <h2>{title}</h2>
            <span className="task-count">{tasks.length} tasks</span>
          </div>
        </div>
        {context === "my-tasks" && (
          <div className="section-search">
            <div className="search-container">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search all tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        )}
      </div>

      {tasks.length > 0 ? (
        <div className="task-grid">{tasks.map((task) => renderTaskItem(task, context))}</div>
      ) : (
        <div className="empty-tasks-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4" />
              <path d="M9 11V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
            </svg>
          </div>
          <h3>No tasks found</h3>
          <p>{emptyMessage}</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="task-list-container">
      {/* Section 1: My Tasks */}
      {renderTaskSection(
        "My Tasks",
        myAssignedTasks,
        "my-tasks",
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>,
        "You have no tasks assigned to you. Great job staying on top of everything!",
      )}

      {/* Section 2: Tasks I've Assigned */}
      {myCreatedTasks.length > 0 &&
        renderTaskSection(
          "Tasks I've Assigned",
          myCreatedTasks,
          "created-by-me",
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>,
          "You haven't assigned any tasks to others yet.",
        )}

      {/* Section 3: All Other Department Tasks */}
      {otherDepartmentTasks.length > 0 &&
        renderTaskSection(
          "All Department Tasks",
          otherDepartmentTasks,
          "other",
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>,
          "No other department tasks to display.",
        )}
    </div>
  )
}

export default TaskList
