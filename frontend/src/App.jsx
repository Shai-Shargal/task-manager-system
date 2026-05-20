import { useState } from 'react';
import CreateTaskForm from './components/CreateTaskForm.jsx';
import EmployeeTable from './components/EmployeeTable.jsx';
import TasksTable from './components/TasksTable.jsx';

export default function App() {
  const [taskRefreshKey, setTaskRefreshKey] = useState(0);

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
          <EmployeeTable />
        </section>
        <section className="dashboard-section">
          <h2 className="section-title">Tasks</h2>
          <CreateTaskForm onTaskCreated={() => setTaskRefreshKey((k) => k + 1)} />
          <TasksTable key={taskRefreshKey} />
        </section>
      </main>
    </div>
  );
}
