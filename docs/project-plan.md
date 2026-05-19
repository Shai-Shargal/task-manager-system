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

* Tasks can only move forward
