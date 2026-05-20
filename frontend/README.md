# Employee Task Manager — Frontend

Vite + React application for viewing employee task summaries.

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
│   │   └── EmployeeTable.jsx
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

[src/services/api.js](src/services/api.js) uses `baseURL: http://localhost:5000`.

If port 5000 is blocked on macOS (AirPlay Receiver), set `PORT=5001` in `backend/.env` and update `baseURL` to `http://localhost:5001`.

## API data shape

Each employee row: `employee_full_name`, `department_name`, `total_tasks`, `pending_tasks`, `in_progress_tasks`, `done_tasks`, `nearest_upcoming_due_date`.
