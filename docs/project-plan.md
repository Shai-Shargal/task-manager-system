# Employee Task Manager - Project Plan

## Project Overview

This project is a full-stack Employee Task Management System built as part of the Deloitte Junior Full Stack Developer home assignment.

The system is designed to manage:

* Employees
* Departments
* Tasks assigned to employees

The main focus of the assignment is building a clean and well-structured Microsoft SQL Server database with stored procedures, while also implementing a lightweight Node.js API and a simple React frontend.

---

# Tech Stack

## Database

* Microsoft SQL Server (MSSQL)
* Docker (SQL Server container)

## Backend

* Node.js
* Express.js
* mssql package

## Frontend

* React
* TypeScript

---

# Project Structure

```txt
employee-task-manager/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── db/
│   │   └── app.ts
│   │
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   └── package.json
│
├── db/
│   ├── schema.sql
│   ├── seed.sql
│   └── stored_procedures.sql
│
├── docs/
│   ├── project-plan.md
│   ├── database-design.md
│   └── images/
│       └── erd-diagram.png
│
├── README.md
└── .gitignore
```

---

# System Architecture

```txt
React Frontend
        ↓
Express API
        ↓
Stored Procedures
        ↓
MSSQL Database
```

The frontend communicates with the backend API using HTTP requests.

The backend communicates with MSSQL exclusively through stored procedures, without using inline SQL queries.

---

# Database Design

The database contains three main entities:

## Departments

Stores company departments.

### Fields

* department_id
* department_name

---

## Employees

Stores employee information.

### Fields

* employee_id
* full_name
* email
* department_id
* created_at

### Rules

* Email must be unique
* Every employee belongs to one department

---

## Tasks

Stores employee tasks.

### Fields

* task_id
* title
* description
* assigned_to
* status
* due_date
* created_at

### Rules

* Every task is assigned to one employee

* Allowed statuses:

  * Pending
  * In Progress
  * Done

* Status transitions:

```txt
Pending -> In Progress -> Done
```

---

# Entity Relationships

```txt
Departments 1 ---- * Employees
Employees   1 ---- * Tasks
```

---

# Business Rules

## Employee Rules

* Each employee belongs to exactly one department
* Email addresses must be unique

## Task Rules

* Tasks can only move forward in status
* Tasks cannot move backward in status
* Overdue task definition:

```sql
due_date < GETDATE()
AND status != 'Done'
```

## Rebalancing Rules

* Employees with more than 3 open tasks are considered overloaded
* Open tasks:

  * Pending
  * In Progress
* Tasks should be reassigned to employees in the same department with the fewest open tasks

---

# Stored Procedures Overview

| Procedure                  | Purpose                                                    |
| -------------------------- | ---------------------------------------------------------- |
| usp_GetEmployeeTaskSummary | Returns employee task statistics                           |
| usp_GetAllTasks            | Returns all tasks with employee and department information |
| usp_AssignTask             | Assigns tasks safely using validation and transactions     |
| usp_UpdateTaskStatus       | Enforces valid task status transitions                     |
| usp_GetOverdueTasks        | Returns overdue tasks                                      |
| usp_RebalanceTasks         | Redistributes overloaded employee tasks                    |

---

# API Endpoints

## GET /employees

Returns employee task summaries.

Uses:

```txt
usp_GetEmployeeTaskSummary
```

---

## GET /tasks

Returns all tasks with employee and department details.

Uses:

```txt
usp_GetAllTasks
```

---

## PATCH /tasks/:id/status

Updates task status.

Uses:

```txt
usp_UpdateTaskStatus
```

Request body:

```json
{
  "status": "In Progress"
}
```

---

# Frontend Overview

The frontend contains a single React page displaying:

* Employee name
* Department
* Total tasks
* Task counts by status

The frontend uses:

* useState
* useEffect
* Fetch/Axios API calls

---

# Error Handling Strategy

## Database

* TRY/CATCH blocks
* Transactions where needed
* Meaningful SQL error messages

## Backend

* HTTP status codes:

  * 400
  * 404
  * 500
* Clear API responses

---

# Development Flow

1. Design database schema
2. Create MSSQL tables
3. Insert seed data
4. Build stored procedures
5. Test procedures in MSSQL
6. Build Express API
7. Connect React frontend
8. Final testing and documentation

---

# Additional Notes

* The project prioritizes SQL quality and database design
* All database interactions are performed through stored procedures only
* The frontend is intentionally simple to keep focus on backend and database logic
* Documentation and architecture planning are included to demonstrate development process and system understanding
