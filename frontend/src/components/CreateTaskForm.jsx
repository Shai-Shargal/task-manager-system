/**
 * CreateTaskForm — create new tasks (status Pending) via POST /tasks.
 */

import { useEffect, useState } from 'react';
import { createTask, getEmployees } from '../services/api.js';

const initialForm = {
  title: '',
  description: '',
  assignedTo: '',
  dueDate: '',
};

function CreateTaskForm({ onTaskCreated }) {
  const [form, setForm] = useState(initialForm);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoadingEmployees(true);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

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
      const result = await createTask({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        assignedTo: Number(form.assignedTo),
        dueDate: form.dueDate,
      });

      setSuccess(result.message || 'Task created successfully.');
      setForm(initialForm);
      onTaskCreated?.();
    } catch (err) {
      setError(err.message || 'Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card create-task-card">
      <h3 className="card-title">Create Task</h3>
      <p className="card-subtitle">New tasks are created with status Pending.</p>

      <form className="create-task-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label className="form-label" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className="form-input"
            value={form.title}
            onChange={handleChange}
            placeholder="Task title"
            disabled={submitting}
          />
        </div>

        <div className="form-row">
          <label className="form-label" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className="form-input form-textarea"
            value={form.description}
            onChange={handleChange}
            placeholder="Optional details"
            rows={3}
            disabled={submitting}
          />
        </div>

        <div className="form-row form-row-inline">
          <div className="form-field">
            <label className="form-label" htmlFor="assignedTo">
              Employee
            </label>
            <select
              id="assignedTo"
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
            <label className="form-label" htmlFor="dueDate">
              Due date
            </label>
            <input
              id="dueDate"
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
        {success && <p className="form-success">{success}</p>}

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create Task'}
        </button>
      </form>
    </div>
  );
}

export default CreateTaskForm;
