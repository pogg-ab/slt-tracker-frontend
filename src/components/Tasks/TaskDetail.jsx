"use client"

import { useState } from "react"
import { updateTaskStatus } from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import AddCommentForm from "./AddCommentForm"
import CreateSubtaskModal from "./CreateSubtaskModal"
import AttachmentForm from "./AttachmentForm"
import AttachmentList from "./AttachmentList"
import LogTimeForm from "./LogTimeForm"
import "./TaskDetail.css"

const TaskDetail = ({ task: initialTask, users = [] }) => {
  const [task, setTask] = useState(initialTask)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false)

  // Get the logged-in user's details for permission checks
  const { user, hasPermission } = useAuth()

  const handleSubtaskToggle = async (subtaskId, currentStatus) => {
    const newStatus = currentStatus === "Completed" ? "In Progress" : "Completed"

    try {
      // Optimistically update UI first
      const updatedSubtasks = task.subtasks.map((st) => (st.task_id === subtaskId ? { ...st, status: newStatus } : st))
      const completedCount = updatedSubtasks.filter((st) => st.status === "Completed").length
      const newProgress = Math.round((completedCount / updatedSubtasks.length) * 100)
      setTask((prevTask) => ({
        ...prevTask,
        subtasks: updatedSubtasks,
        progress: newProgress,
      }))
      // Then make the API call
      await updateTaskStatus(subtaskId, newStatus)
    } catch (error) {
      alert("Failed to update subtask status.")
      console.error(error)
    }
  }

  const findUserNameById = (userId) => {
    if (!users || users.length === 0 || !userId) return `ID: ${userId || "unassigned"}`
    const user = users.find((u) => u.user_id === userId)
    return user ? user.name : `Unknown User (ID: ${userId})`
  }

  if (!task) {
    return (
      <div className="task-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading task details...</p>
      </div>
    )
  }

  const statusOptions = ["Pending", "In Progress", "Completed", "Overdue"]
  const isParentTaskWithSubtasks = task.subtasks && task.subtasks.length > 0

  // Get priority icon
  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        )
      case "medium":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18" />
          </svg>
        )
      case "low":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
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
            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
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

  return (
    <div className="task-detail-container">
      {/* --- HEADER --- */}
      <div className="task-detail-header">
        <div className="task-header-content">
          <h1>{task.title}</h1>
          <div className="task-header-meta">
            <div className={`task-priority priority-${task.priority?.toLowerCase() || "medium"}`}>
              <div className="priority-icon">{getPriorityIcon(task.priority)}</div>
              <span>{task.priority || "Medium"} Priority</span>
            </div>
            {/* <div className="task-id">Task #{task.task_id}</div> */}
          </div>
        </div>
        <div className="task-status-wrapper">
          <div className="status-label">Status</div>
          <div className="status-select-container">
            <div className={`status-icon status-${task.status.toLowerCase().replace(" ", "-")}`}>
              {getStatusIcon(task.status)}
            </div>
            <select
              className={`status-select status-${task.status.toLowerCase().replace(" ", "-")}`}
              value={task.status}
              onChange={async (e) => {
                const newStatus = e.target.value
                setIsUpdatingStatus(true)
                try {
                  const response = await updateTaskStatus(task.task_id, newStatus)
                  const newProgress = newStatus === "Completed" ? 100 : task.progress
                  setTask((prevTask) => ({ ...prevTask, ...response.data, progress: newProgress }))
                } catch (error) {
                  console.error("Failed to update status", error)
                } finally {
                  setIsUpdatingStatus(false)
                }
              }}
              disabled={isUpdatingStatus || isParentTaskWithSubtasks}
              title={isParentTaskWithSubtasks ? "Status is determined by subtask completion" : "Change task status"}
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {isUpdatingStatus && <div className="status-loading-indicator"></div>}
          </div>
        </div>
      </div>

      {/* --- PROGRESS BAR --- */}
      {task.progress !== null && typeof task.progress !== "undefined" && (
        <div className="progress-section">
          <div className="progress-info">
            <div className="progress-label">Task Progress</div>
            <div className="progress-percentage">{task.progress}%</div>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-background">
              <div
                className="progress-bar-foreground"
                style={{ width: `${task.progress}%` }}
                data-progress={task.progress}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* --- TASK DESCRIPTION --- */}
      <div className="task-description-section">
        <h2 className="section-title">Description</h2>
        <div className="task-description">
          {task.description ? (
            <p>{task.description}</p>
          ) : (
            <p className="no-description">No description provided for this task.</p>
          )}
        </div>
      </div>

      {/* --- DETAILS GRID --- */}
      <div className="details-section">
        <h2 className="section-title">Task Details</h2>
        <div className="details-grid">
          <div className="detail-card">
            <div className="detail-icon priority-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="detail-content">
              <div className="detail-label">Priority</div>
              <div className="detail-value">{task.priority || "Not set"}</div>
            </div>
          </div>

          <div className="detail-card">
            <div className="detail-icon date-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="detail-content">
              <div className="detail-label">Due Date</div>
              <div className="detail-value">
                {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}
              </div>
            </div>
          </div>

          <div className="detail-card">
            <div className="detail-icon assignee-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="detail-content">
              <div className="detail-label">Assignee</div>
              <div className="detail-value">{findUserNameById(task.assignee_id)}</div>
            </div>
          </div>

          <div className="detail-card">
            <div className="detail-icon assigner-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            </div>
            <div className="detail-content">
              <div className="detail-label">Assigned By</div>
              <div className="detail-value">{findUserNameById(task.assigner_id)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* --- SUBTASKS SECTION --- */}
      <div className="task-section subtasks-section">
        <div className="section-header">
          <h2 className="section-title">Subtasks</h2>
          {hasPermission("CREATE_SUBTASK") && (
            <button className="btn-add-subtask" onClick={() => setIsSubtaskModalOpen(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Subtask
            </button>
          )}
        </div>

        {task.subtasks?.length > 0 ? (
          <ul className="subtask-list">
            {task.subtasks.map((st) => (
              <li key={st.task_id} className="subtask-item">
                <div className="subtask-checkbox-wrapper">
                  <input
                    type="checkbox"
                    id={`subtask-${st.task_id}`}
                    checked={st.status === "Completed"}
                    onChange={() => handleSubtaskToggle(st.task_id, st.status)}
                    disabled={st.assignee_id !== user.user_id}
                    title={st.assignee_id !== user.user_id ? "Only the assignee can update this" : "Mark as complete"}
                  />
                  <label
                    htmlFor={`subtask-${st.task_id}`}
                    className={`custom-checkbox ${st.status === "Completed" ? "completed" : ""}`}
                  >
                    <svg className="checkbox-icon" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </label>
                </div>
                <div className="subtask-content">
                  <label htmlFor={`subtask-${st.task_id}`} className={st.status === "Completed" ? "completed" : ""}>
                    {st.title}
                  </label>
                  <div className="subtask-meta">
                    <span className="subtask-assignee">Assigned to: {findUserNameById(st.assignee_id)}</span>
                    {st.due_date && (
                      <span className="subtask-due-date">Due: {new Date(st.due_date).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className={`subtask-status status-${st.status.toLowerCase().replace(" ", "-")}`}>{st.status}</div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4" />
                <path d="M9 11V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
            <p>No subtasks have been created for this task yet.</p>
            {hasPermission("CREATE_SUBTASK") && (
              <button className="btn-secondary" onClick={() => setIsSubtaskModalOpen(true)}>
                Create First Subtask
              </button>
            )}
          </div>
        )}
      </div>

      {/* --- TIME LOGGING SECTION --- */}
      <div className="task-section time-section">
        <h2 className="section-title">Time Tracking</h2>
        <div className="time-content">
          <div className="time-entries">
            <h3 className="subsection-title">Time Logged</h3>
            {task.time_entries && task.time_entries.length > 0 ? (
              <ul className="time-entries-list">
                {task.time_entries.map((entry) => (
                  <li key={entry.entry_id} className="time-entry-item">
                    <div className="time-entry-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12,6 12,12 16,14" />
                      </svg>
                    </div>
                    <div className="time-entry-content">
                      <div className="time-entry-header">
                        <span className="time-duration">{entry.duration_minutes} minutes</span>
                        <span className="time-user">by {entry.user_name}</span>
                        <span className="time-date">on {new Date(entry.entry_date).toLocaleDateString()}</span>
                      </div>
                      {entry.notes && <p className="time-entry-notes">{entry.notes}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-entries">No time has been logged for this task yet.</p>
            )}
          </div>

          <div className="log-time-form-container">
            <h3 className="subsection-title">Log Time</h3>
            <LogTimeForm
              taskId={task.task_id}
              onTimeLogged={(newTimeEntry) =>
                setTask((prevTask) => ({
                  ...prevTask,
                  time_entries: [newTimeEntry, ...(prevTask.time_entries || [])],
                }))
              }
            />
          </div>
        </div>
      </div>

      {/* --- COMMENTS SECTION --- */}
      <div className="task-section comments-section">
        <h2 className="section-title">Comments</h2>
        <div className="comments-container">
          <div className="comments-list">
            {task.comments?.length > 0 ? (
              <ul>
                {task.comments.map((c) => (
                  <li key={c.comment_id} className="comment-item">
                    <div className="comment-avatar">{c.user_name.charAt(0).toUpperCase()}</div>
                    <div className="comment-content">
                      <div className="comment-header">
                        <span className="comment-author">{c.user_name}</span>
                        <span className="comment-date">
                          {c.created_at ? new Date(c.created_at).toLocaleString() : ""}
                        </span>
                      </div>
                      <div className="comment-message">{c.message}</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-comments">
                <div className="empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <p>No comments yet. Be the first to add a comment!</p>
              </div>
            )}
          </div>

          <div className="add-comment-container">
            <AddCommentForm
              taskId={task.task_id}
              onCommentAdded={(newComment) =>
                setTask((prevTask) => ({
                  ...prevTask,
                  comments: [...(prevTask.comments || []), newComment],
                }))
              }
            />
          </div>
        </div>
      </div>

      {/* --- ATTACHMENTS SECTION --- */}
      <div className="task-section attachments-section">
        <h2 className="section-title">Attachments</h2>
        <div className="attachments-container">
          <AttachmentList attachments={task.attachments} />
          <div className="attachment-form-container">
            <AttachmentForm
              taskId={task.task_id}
              onAttachmentAdded={(newAttachment) => {
                setTask((prevTask) => ({
                  ...prevTask,
                  attachments: [...(prevTask.attachments || []), newAttachment],
                }))
              }}
            />
          </div>
        </div>
      </div>

      {/* --- MODAL RENDERING LOGIC --- */}
      {isSubtaskModalOpen && (
        <CreateSubtaskModal
          parentTask={task}
          onClose={() => setIsSubtaskModalOpen(false)}
          onSubtaskCreated={(newSubtask) => {
            const updatedSubtasks = [...(task.subtasks || []), newSubtask]
            const completedCount = updatedSubtasks.filter((st) => st.status === "Completed").length
            const newProgress = Math.round((completedCount / updatedSubtasks.length) * 100)
            setTask((prevTask) => ({
              ...prevTask,
              subtasks: updatedSubtasks,
              progress: newProgress,
            }))
            setIsSubtaskModalOpen(false)
          }}
        />
      )}
    </div>
  )
}

export default TaskDetail
