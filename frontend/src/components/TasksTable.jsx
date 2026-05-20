/**
 * TasksTable — interactive task list with status updates, edit, and delete.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { deleteTask, getTasks, updateTaskStatus } from '../services/api.js';
import { employeeTheme } from '../utils/employeeColor.js';
import EmployeeColorLabel from './EmployeeColorLabel.jsx';
import TaskEditModal from './TaskEditModal.jsx';

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Done'];

/** Allowed dropdown values per workflow: Pending → In Progress → Done */
function getStatusOptionsForTask(currentStatus) {
  switch (currentStatus) {
    case 'Pending':
      return ['Pending', 'In Progress'];
    case 'In Progress':
      return ['In Progress', 'Done'];
    case 'Done':
      return ['Done'];
    default:
      return STATUS_OPTIONS;
  }
}

const STATUS_BADGE_STYLES = {
  Pending: { backgroundColor: '#fef3c7', color: '#92400e' },
  'In Progress': { backgroundColor: '#dbeafe', color: '#1e40af' },
  Done: { backgroundColor: '#d1fae5', color: '#065f46' },
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
};

const thStyle = {
  padding: '8px 12px',
  border: '1px solid #ddd',
  textAlign: 'left',
  backgroundColor: '#f5f5f5',
};

const tdStyle = {
  padding: '8px 12px',
  border: '1px solid #ddd',
  textAlign: 'left',
};

const selectStyle = {
  marginTop: '6px',
  padding: '4px 8px',
  fontSize: '0.875rem',
  borderRadius: '4px',
  border: '1px solid #ccc',
  minWidth: '130px',
};

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
};

function StatusBadge({ status }) {
  const colors = STATUS_BADGE_STYLES[status] || STATUS_BADGE_STYLES.Pending;
  return (
    <span className="status-badge" style={colors}>
      {status}
    </span>
  );
}

function TasksTable({ onTaskChanged }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [rowError, setRowError] = useState({});

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message || 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const employeeLegend = useMemo(() => {
    const byId = new Map();
    tasks.forEach((task) => {
      if (!byId.has(task.assigned_to)) {
        byId.set(task.assigned_to, {
          id: task.assigned_to,
          name: task.employee_full_name,
          color_hex: task.color_hex,
        });
      }
    });
    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [tasks]);

  const handleStatusChange = useCallback(
    async (taskId, newStatus) => {
      const task = tasks.find((t) => t.task_id === taskId);
      if (!task || newStatus === task.status) return;

      setRowError((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });

      setUpdatingId(taskId);
      try {
        const result = await updateTaskStatus(taskId, newStatus);
        setTasks((prev) =>
          prev.map((t) =>
            t.task_id === taskId ? { ...t, status: result.status } : t
          )
        );
        onTaskChanged?.();
      } catch (err) {
        setRowError((prev) => ({
          ...prev,
          [taskId]: err.message || 'Failed to update status.',
        }));
      } finally {
        setUpdatingId(null);
      }
    },
    [tasks, onTaskChanged]
  );

  const handleDelete = useCallback(
    async (taskId, title) => {
      const confirmed = window.confirm(
        `Delete task "${title}"? This cannot be undone.`
      );
      if (!confirmed) return;

      setRowError((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });

      setDeletingId(taskId);
      try {
        await deleteTask(taskId);
        setTasks((prev) => prev.filter((t) => t.task_id !== taskId));
        onTaskChanged?.();
      } catch (err) {
        setRowError((prev) => ({
          ...prev,
          [taskId]: err.message || 'Failed to delete task.',
        }));
      } finally {
        setDeletingId(null);
      }
    },
    [onTaskChanged]
  );

  const handleEditSaved = async () => {
    await fetchTasks();
    onTaskChanged?.();
  };

  if (loading) {
    return <p>Loading tasks...</p>;
  }

  if (error) {
    return <p className="dashboard-alert">{error}</p>;
  }

  return (
    <>
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSaved={handleEditSaved}
        />
      )}

      <section style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {employeeLegend.length > 0 && (
          <div className="employee-legend" aria-label="Employee color legend">
            <span className="employee-legend-title">Employees</span>
            {employeeLegend.map((emp) => (
              <EmployeeColorLabel
                key={emp.id}
                name={emp.name}
                colorHex={emp.color_hex}
              />
            ))}
          </div>
        )}

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Title</th>
              <th style={thStyle}>Description</th>
              <th style={thStyle}>Employee</th>
              <th style={thStyle}>Department</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Due Date</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const isDone = task.status === 'Done';
              const isUpdating = updatingId === task.task_id;
              const isDeleting = deletingId === task.task_id;
              const isBusy = isUpdating || isDeleting;

              const rowTheme = employeeTheme(task.color_hex);

              return (
                <tr
                  key={task.task_id}
                  className="task-row-accent"
                  style={rowTheme.rowAccentStyle}
                >
                  <td style={tdStyle}>{task.title}</td>
                  <td style={tdStyle} className="task-description">
                    {task.description?.trim() ? task.description : '—'}
                  </td>
                  <td style={tdStyle}>
                    <EmployeeColorLabel
                      name={task.employee_full_name}
                      colorHex={task.color_hex}
                    />
                  </td>
                  <td style={tdStyle}>{task.department_name}</td>
                  <td style={tdStyle}>
                    <StatusBadge status={task.status} />
                    <select
                      style={selectStyle}
                      value={task.status}
                      disabled={isDone || isBusy}
                      onChange={(e) =>
                        handleStatusChange(task.task_id, e.target.value)
                      }
                      aria-label={`Status for ${task.title}`}
                    >
                      {getStatusOptionsForTask(task.status).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {rowError[task.task_id] && (
                      <p className="status-error">{rowError[task.task_id]}</p>
                    )}
                  </td>
                  <td style={tdStyle}>{formatDate(task.due_date)}</td>
                  <td style={tdStyle}>
                    <div className="action-buttons">
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        disabled={isBusy}
                        onClick={() => setEditingTask(task)}
                        aria-label={`Edit ${task.title}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-danger btn-sm"
                        disabled={isBusy}
                        onClick={() => handleDelete(task.task_id, task.title)}
                        aria-label={`Delete ${task.title}`}
                      >
                        {isDeleting ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </>
  );
}

export default TasksTable;
