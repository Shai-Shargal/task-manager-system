/*
================================================================================
  Employee Task Manager - Database Schema
  Database: TaskManagerDB
  Engine:   Microsoft SQL Server (MSSQL)

  Purpose:
    Defines the core relational schema for departments, employees, and tasks.

  Idempotency:
    Safe to re-run. Creates the database and objects only when they do not exist.
    Does not drop or alter existing data.

  Execution (Docker MSSQL on localhost:1433):
    sqlcmd -S localhost,1433 -U sa -P 'YourStrongPassword123!' -i db/schema.sql

  Note:
    Status forward-only transitions (Pending -> In Progress -> Done) are enforced
    in stored procedures (usp_UpdateTaskStatus), not in this DDL script.
================================================================================
*/

/* ----------------------------------------------------------------------------
   Create database (idempotent)
---------------------------------------------------------------------------- */
IF NOT EXISTS (SELECT 1 FROM sys.databases WHERE name = N'TaskManagerDB')
BEGIN
    CREATE DATABASE TaskManagerDB;
END
GO

USE TaskManagerDB;
GO

/* ----------------------------------------------------------------------------
   Table: departments
   Parent entity for organizational structure.
---------------------------------------------------------------------------- */
IF NOT EXISTS (
    SELECT 1
    FROM sys.tables
    WHERE name = N'departments'
      AND schema_id = SCHEMA_ID(N'dbo')
)
BEGIN
    CREATE TABLE dbo.departments (
        department_id   INT           NOT NULL IDENTITY(1, 1),
        department_name VARCHAR(100)  NOT NULL,

        CONSTRAINT PK_departments PRIMARY KEY (department_id)
    );
END
GO

/* ----------------------------------------------------------------------------
   Table: employees
   Each employee belongs to exactly one department (enforced via FK).
   Email must be unique across all employees.
---------------------------------------------------------------------------- */
IF NOT EXISTS (
    SELECT 1
    FROM sys.tables
    WHERE name = N'employees'
      AND schema_id = SCHEMA_ID(N'dbo')
)
BEGIN
    CREATE TABLE dbo.employees (
        employee_id   INT            NOT NULL IDENTITY(1, 1),
        full_name     VARCHAR(100)   NOT NULL,
        email         VARCHAR(255)   NOT NULL,
        department_id INT            NOT NULL,
        color_hex     VARCHAR(20)    NOT NULL CONSTRAINT DF_employees_color_hex DEFAULT (N'#3B82F6'),
        created_at    DATETIME       NOT NULL CONSTRAINT DF_employees_created_at DEFAULT (GETDATE()),

        CONSTRAINT PK_employees PRIMARY KEY (employee_id),
        CONSTRAINT UQ_employees_email UNIQUE (email),
        CONSTRAINT FK_employees_department_id
            FOREIGN KEY (department_id)
            REFERENCES dbo.departments (department_id)
    );
END
GO

/* ----------------------------------------------------------------------------
   Migration: color_hex on employees (existing databases)
---------------------------------------------------------------------------- */
IF COL_LENGTH(N'dbo.employees', N'color_hex') IS NULL
BEGIN
    ALTER TABLE dbo.employees
    ADD color_hex VARCHAR(20) NOT NULL
        CONSTRAINT DF_employees_color_hex DEFAULT (N'#3B82F6');
END
GO

/* ----------------------------------------------------------------------------
   Table: tasks
   Each task is assigned to one employee (assigned_to -> employees.employee_id).
   Status is restricted to three allowed values via CHECK constraint.
   Forward-only status transitions are enforced in usp_UpdateTaskStatus.
   description uses VARCHAR(MAX) instead of deprecated TEXT type.
---------------------------------------------------------------------------- */
IF NOT EXISTS (
    SELECT 1
    FROM sys.tables
    WHERE name = N'tasks'
      AND schema_id = SCHEMA_ID(N'dbo')
)
BEGIN
    CREATE TABLE dbo.tasks (
        task_id     INT            NOT NULL IDENTITY(1, 1),
        title       VARCHAR(200)   NOT NULL,
        description VARCHAR(MAX)   NULL,
        assigned_to INT            NOT NULL,
        status      VARCHAR(20)    NOT NULL,
        due_date    DATETIME       NOT NULL,
        created_at  DATETIME       NOT NULL CONSTRAINT DF_tasks_created_at DEFAULT (GETDATE()),

        CONSTRAINT PK_tasks PRIMARY KEY (task_id),
        CONSTRAINT FK_tasks_assigned_to
            FOREIGN KEY (assigned_to)
            REFERENCES dbo.employees (employee_id),
        CONSTRAINT CK_tasks_status
            CHECK (status IN (N'Pending', N'In Progress', N'Done'))
    );
END
GO

/* ----------------------------------------------------------------------------
   Indexes (idempotent)
   Support joins and filters used by upcoming stored procedures.
---------------------------------------------------------------------------- */
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_employees_department_id'
      AND object_id = OBJECT_ID(N'dbo.employees')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_employees_department_id
        ON dbo.employees (department_id);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_tasks_assigned_to'
      AND object_id = OBJECT_ID(N'dbo.tasks')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_tasks_assigned_to
        ON dbo.tasks (assigned_to);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_tasks_status_due_date'
      AND object_id = OBJECT_ID(N'dbo.tasks')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_tasks_status_due_date
        ON dbo.tasks (status, due_date);
END
GO

/*
================================================================================
  Optional dev reset (commented out)
  Uncomment to drop all tables and re-run this script for a clean rebuild.
  Drop order respects foreign key dependencies (child tables first).

  IF OBJECT_ID(N'dbo.tasks', N'U') IS NOT NULL
      DROP TABLE dbo.tasks;
  GO

  IF OBJECT_ID(N'dbo.employees', N'U') IS NOT NULL
      DROP TABLE dbo.employees;
  GO

  IF OBJECT_ID(N'dbo.departments', N'U') IS NOT NULL
      DROP TABLE dbo.departments;
  GO
================================================================================
*/
