# Employee Task Manager — Frontend

Vite + React dashboard for employee task summaries and interactive task status updates.

## Stack

- Vite
- React
- Axios

## Project structure

```txt
frontend/
├── index.html
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── components/
│   │   ├── EmployeeTable.jsx
│   │   └── TasksTable.jsx
│   └── services/
│       └── api.js
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (default http://localhost:5173) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |

## Run locally

**Terminal 1 — API (requires Docker MSSQL):**

```bash
cd backend
npm start
```

**Terminal 2 — Frontend:**

```bash
cd frontend
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173).

## API configuration

[src/services/api.js](src/services/api.js) calls the API at `http://localhost:5001` by default (port 5001 avoids macOS AirPlay on 5000).

Override with `VITE_API_BASE_URL` in `frontend/.env` (see `.env.example`). Match `PORT` in `backend/.env` if you change the backend port.

## API data shape

Each employee row: `employee_full_name`, `department_name`, `total_tasks`, `pending_tasks`, `in_progress_tasks`, `done_tasks`, `nearest_upcoming_due_date`.

Each task row (`GET /tasks`): `task_id`, `title`, `status`, `due_date`, `employee_full_name`, `department_name`.

Status updates use `PATCH /tasks/:id/status` with body `{ "status": "Pending" | "In Progress" | "Done" }`. Forward-only transitions: Pending → In Progress → Done. Invalid transitions return `{ message: "Invalid status transition. ..." }` (shown inline in the tasks table).
