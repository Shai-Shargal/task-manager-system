import { useState } from 'react';
import CreateTaskForm from './components/CreateTaskForm.jsx';
import EmployeeTable from './components/EmployeeTable.jsx';
import TasksTable from './components/TasksTable.jsx';

export default function App() {
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);
  const refreshDashboard = () => setDashboardRefreshKey((k) => k + 1);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Employee Task Manager</h1>
        <p className="subtitle">
          Employee summaries and interactive task management
        </p>
      </header>
      <main className="dashboard">
        <section className="dashboard-section">
          <h2 className="section-title">Employee Summary</h2>
          <EmployeeTable
            key={dashboardRefreshKey}
            onColorChanged={refreshDashboard}
          />
        </section>
        <section className="dashboard-section">
          <h2 className="section-title">Tasks</h2>
          <CreateTaskForm onTaskCreated={refreshDashboard} />
          <TasksTable
            key={dashboardRefreshKey}
            onTaskChanged={refreshDashboard}
          />
        </section>
      </main>
    </div>
  );
}
