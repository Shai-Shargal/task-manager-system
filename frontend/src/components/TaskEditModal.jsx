/**
 * TaskEditModal — edit task details (status managed separately).
 */

import { useEffect, useState } from 'react';
import { getEmployees, updateTask } from '../services/api.js';

function toDateInputValue(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function TaskEditModal({ task, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: task.title || '',
    description: task.description || '',
    assignedTo: String(task.assigned_to ?? ''),
    dueDate: toDateInputValue(task.due_date),
  });
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await getEmployees();
        setEmployees(data);
      } catch (err) {
        setError(err.message || 'Failed to load employees.');
      } finally {
        setLoadingEmployees(false);
      }
    };

    loadEmployees();
  }, []);

  useEffect(() => {
    if (task.assigned_to || employees.length === 0) return;
    const match = employees.find(
      (e) => e.employee_full_name === task.employee_full_name
    );
    if (match) {
      setForm((prev) => ({ ...prev, assignedTo: String(match.employee_id) }));
    }
  }, [employees, task.assigned_to, task.employee_full_name]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }

    if (!form.assignedTo) {
      setError('Please select an employee.');
      return;
    }

    if (!form.dueDate) {
      setError('Due date is required.');
      return;
    }

    setSubmitting(true);
    try {
      await updateTask(task.task_id, {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        assignedTo: Number(form.assignedTo),
        dueDate: form.dueDate,
      });
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update task.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-card card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="edit-task-title"
      >
        <div className="modal-header">
          <h3 id="edit-task-title" className="card-title">
            Edit Task
          </h3>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <p className="card-subtitle">
          Status: <span className="status-badge-readonly">{task.status}</span>{' '}
          (change via the table dropdown)
        </p>

        <form className="create-task-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="form-label" htmlFor="edit-title">
              Title
            </label>
            <input
              id="edit-title"
              name="title"
              type="text"
              className="form-input"
              value={form.title}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>

          <div className="form-row">
            <label className="form-label" htmlFor="edit-description">
              Description
            </label>
            <textarea
              id="edit-description"
              name="description"
              className="form-input form-textarea"
              value={form.description}
              onChange={handleChange}
              rows={3}
              disabled={submitting}
            />
          </div>

          <div className="form-row form-row-inline">
            <div className="form-field">
              <label className="form-label" htmlFor="edit-assignedTo">
                Employee
              </label>
              <select
                id="edit-assignedTo"
                name="assignedTo"
                className="form-input"
                value={form.assignedTo}
                onChange={handleChange}
                disabled={submitting || loadingEmployees}
              >
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {emp.employee_full_name} — {emp.department_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="edit-dueDate">
                Due date
              </label>
              <input
                id="edit-dueDate"
                name="dueDate"
                type="date"
                className="form-input"
                value={form.dueDate}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>
          </div>

          {error && <p className="dashboard-alert">{error}</p>}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskEditModal;
