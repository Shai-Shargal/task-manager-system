/**
 * TasksTable — interactive task list with status updates.
 */

import { useCallback, useEffect, useState } from 'react';
import { getTasks, updateTaskStatus } from '../services/api.js';

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

function TasksTable() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [rowError, setRowError] = useState({});

  useEffect(() => {
    const fetchTasks = async () => {
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
    };

    fetchTasks();
  }, []);

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
      } catch (err) {
        setRowError((prev) => ({
          ...prev,
          [taskId]: err.message || 'Failed to update status.',
        }));
      } finally {
        setUpdatingId(null);
      }
    },
    [tasks]
  );

  if (loading) {
    return <p>Loading tasks...</p>;
  }

  if (error) {
    return <p className="dashboard-alert">{error}</p>;
  }

  return (
    <section style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Title</th>
            <th style={thStyle}>Description</th>
            <th style={thStyle}>Employee</th>
            <th style={thStyle}>Department</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Due Date</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const isDone = task.status === 'Done';
            const isUpdating = updatingId === task.task_id;

            return (
              <tr key={task.task_id}>
                <td style={tdStyle}>{task.title}</td>
                <td style={tdStyle} className="task-description">
                  {task.description?.trim() ? task.description : '—'}
                </td>
                <td style={tdStyle}>{task.employee_full_name}</td>
                <td style={tdStyle}>{task.department_name}</td>
                <td style={tdStyle}>
                  <StatusBadge status={task.status} />
                  <select
                    style={selectStyle}
                    value={task.status}
                    disabled={isDone || isUpdating}
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

export default TasksTable;
