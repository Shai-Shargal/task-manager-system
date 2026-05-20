import EmployeeTable from './components/EmployeeTable.jsx';

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Employee Task Manager</h1>
        <p className="subtitle">
          Employee task summaries by department and status
        </p>
      </header>
      <main>
        <EmployeeTable />
      </main>
    </div>
  );
}
