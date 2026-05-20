/**
 * EmployeeTable — displays employee task summaries from the API.
 */

import { useEffect, useState } from 'react';
import { getEmployees } from '../services/api.js';

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

function EmployeeTable() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(false);
        const data = await getEmployees();
        setEmployees(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  if (loading) {
    return <p>Loading employees...</p>;
  }

  if (error) {
    return <p>Failed to load employee data.</p>;
  }

  return (
    <section style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Employee Name</th>
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
            <tr key={employee?.employee_id}>
              <td style={tdStyle}>{employee?.employee_full_name}</td>
              <td style={tdStyle}>{employee?.department_name}</td>
              <td style={tdStyle}>{employee?.total_tasks}</td>
              <td style={tdStyle}>{employee?.pending_tasks}</td>
              <td style={tdStyle}>{employee?.in_progress_tasks}</td>
              <td style={tdStyle}>{employee?.done_tasks}</td>
              <td style={tdStyle}>
                {formatDate(employee?.nearest_upcoming_due_date)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default EmployeeTable;
