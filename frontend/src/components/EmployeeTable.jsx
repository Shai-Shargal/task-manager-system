/**
 * EmployeeTable — employee summaries with customizable color themes.
 */

import { useCallback, useEffect, useState } from 'react';
import { getEmployees, updateEmployeeColor } from '../services/index.js';
import { normalizeColor } from '../utils/employeeColor.js';
import EmployeeColorLabel from './EmployeeColorLabel.jsx';

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

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
};

function EmployeeTable({ onColorChanged }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingColorId, setSavingColorId] = useState(null);
  const [colorError, setColorError] = useState(null);
  const [draftColors, setDraftColors] = useState({});

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEmployees();
      setEmployees(data);
    } catch (err) {
      setError(err.message || 'Failed to load employee data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const getDisplayColor = (employee) =>
    draftColors[employee.employee_id] ?? employee.color_hex;

  const hasPendingColor = (employee) => {
    const draft = draftColors[employee.employee_id];
    if (draft === undefined) return false;
    return normalizeColor(draft) !== normalizeColor(employee.color_hex);
  };

  const handleDraftColorChange = (employeeId, newColor) => {
    setColorError(null);
    setDraftColors((prev) => ({ ...prev, [employeeId]: newColor }));
  };

  const handleCancelColor = (employeeId) => {
    setColorError(null);
    setDraftColors((prev) => {
      const next = { ...prev };
      delete next[employeeId];
      return next;
    });
  };

  const handleConfirmColor = async (employee) => {
    const employeeId = employee.employee_id;
    const newColor = normalizeColor(
      draftColors[employeeId] ?? employee.color_hex
    );

    if (normalizeColor(employee.color_hex) === newColor) {
      handleCancelColor(employeeId);
      return;
    }

    setColorError(null);
    setSavingColorId(employeeId);

    try {
      await updateEmployeeColor(employeeId, newColor);
      setEmployees((prev) =>
        prev.map((e) =>
          e.employee_id === employeeId ? { ...e, color_hex: newColor } : e
        )
      );
      handleCancelColor(employeeId);
      onColorChanged?.();
    } catch (err) {
      setColorError(err.message || 'Failed to update color.');
    } finally {
      setSavingColorId(null);
    }
  };

  if (loading) {
    return <p>Loading employees...</p>;
  }

  if (error) {
    return <p className="dashboard-alert">{error}</p>;
  }

  return (
    <section style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {colorError && <p className="dashboard-alert">{colorError}</p>}

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Employee</th>
            <th style={thStyle}>Color</th>
            <th style={thStyle}>Department</th>
            <th style={thStyle}>Total Tasks</th>
            <th style={thStyle}>Pending</th>
            <th style={thStyle}>In Progress</th>
            <th style={thStyle}>Done</th>
            <th style={thStyle}>Nearest Due Date</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.employee_id}>
              <td style={tdStyle}>
                <EmployeeColorLabel
                  name={employee.employee_full_name}
                  colorHex={getDisplayColor(employee)}
                />
              </td>
              <td style={tdStyle}>
                <div className="color-picker-row">
                  <label className="color-picker-label">
                    <input
                      type="color"
                      className="color-picker-input"
                      value={normalizeColor(getDisplayColor(employee))}
                      disabled={savingColorId === employee.employee_id}
                      onChange={(e) =>
                        handleDraftColorChange(
                          employee.employee_id,
                          e.target.value
                        )
                      }
                      aria-label={`Pick color for ${employee.employee_full_name}`}
                    />
                    <span className="color-picker-value">
                      {normalizeColor(getDisplayColor(employee))}
                    </span>
                  </label>
                  {hasPendingColor(employee) && (
                    <div className="color-picker-actions">
                      <button
                        type="button"
                        className="btn-primary btn-sm"
                        disabled={savingColorId === employee.employee_id}
                        onClick={() => handleConfirmColor(employee)}
                      >
                        {savingColorId === employee.employee_id
                          ? 'Saving…'
                          : 'Confirm'}
                      </button>
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        disabled={savingColorId === employee.employee_id}
                        onClick={() => handleCancelColor(employee.employee_id)}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </td>
              <td style={tdStyle}>{employee.department_name}</td>
              <td style={tdStyle}>{employee.total_tasks}</td>
              <td style={tdStyle}>{employee.pending_tasks}</td>
              <td style={tdStyle}>{employee.in_progress_tasks}</td>
              <td style={tdStyle}>{employee.done_tasks}</td>
              <td style={tdStyle}>
                {formatDate(employee.nearest_upcoming_due_date)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default EmployeeTable;
