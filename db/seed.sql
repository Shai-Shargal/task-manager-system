/*
================================================================================
  Employee Task Manager - Seed Data
  Database: TaskManagerDB

  Purpose:
    Populates departments, employees, and tasks with realistic sample data
    for development, API testing, and stored procedure validation.

  Data highlights:
    - Mix of Pending, In Progress, and Done tasks
    - Overdue tasks (due_date < GETDATE() AND status != 'Done') for usp_GetOverdueTasks
    - Bob Martinez (Engineering) has 5 open tasks (>3) for usp_RebalanceTasks testing

  Execution (Docker MSSQL):
    docker exec -i task-manager-mssql /opt/mssql-tools/bin/sqlcmd \
      -S localhost -U sa -P 'YourStrongPassword123!' -C < db/seed.sql

  Prerequisite:
    Run db/schema.sql first.
================================================================================
*/

USE TaskManagerDB;
GO

SET NOCOUNT ON;
GO

/* ----------------------------------------------------------------------------
   Reset seed data (idempotent re-runs)
   Clears child tables first to respect foreign key order.
---------------------------------------------------------------------------- */
DELETE FROM dbo.tasks;
DELETE FROM dbo.employees;
DELETE FROM dbo.departments;
GO

DBCC CHECKIDENT (N'dbo.tasks', RESEED, 0);
DBCC CHECKIDENT (N'dbo.employees', RESEED, 0);
DBCC CHECKIDENT (N'dbo.departments', RESEED, 0);
GO

/* ============================================================================
   DEPARTMENTS
   Three core business units for the assignment dataset.
============================================================================ */
SET IDENTITY_INSERT dbo.departments ON;
GO

INSERT INTO dbo.departments (department_id, department_name)
VALUES
    (1, N'Engineering'),
    (2, N'Marketing'),
    (3, N'Human Resources');
GO

SET IDENTITY_INSERT dbo.departments OFF;
GO

/* ============================================================================
   EMPLOYEES
   Six employees distributed across departments (3 / 2 / 1).
   Emails are unique and follow a consistent corporate format.
============================================================================ */
SET IDENTITY_INSERT dbo.employees ON;
GO

INSERT INTO dbo.employees (employee_id, full_name, email, department_id, created_at)
VALUES
    (1, N'Alice Chen',      N'alice.chen@deloitte-demo.com',      1, N'2025-11-03 09:15:00'),
    (2, N'Bob Martinez',    N'bob.martinez@deloitte-demo.com',    1, N'2025-11-10 10:30:00'),
    (3, N'Carol Wu',        N'carol.wu@deloitte-demo.com',        1, N'2026-01-06 08:45:00'),
    (4, N'Diana Foster',    N'diana.foster@deloitte-demo.com',    2, N'2025-10-21 11:00:00'),
    (5, N'Ethan Brooks',    N'ethan.brooks@deloitte-demo.com',     2, N'2026-02-17 14:20:00'),
    (6, N'Fiona Nguyen',    N'fiona.nguyen@deloitte-demo.com',     3, N'2025-12-01 09:00:00');
GO

SET IDENTITY_INSERT dbo.employees OFF;
GO

/* ============================================================================
   TASKS
   Thirteen tasks with varied status, due dates, and assignees.

   Testing notes:
   - Overdue: due_date in the past AND status not 'Done' (see tasks 3, 4, 7, 10, 12)
   - Future due dates: tasks 5, 6, 8, 11
   - Bob Martinez (employee_id 2): 5 open tasks (Pending/In Progress) for rebalance SP
   - Done tasks do not count as open or overdue per business rules
============================================================================ */
SET IDENTITY_INSERT dbo.tasks ON;
GO

INSERT INTO dbo.tasks (task_id, title, description, assigned_to, status, due_date, created_at)
VALUES
    (
        1,
        N'Refactor authentication middleware',
        N'Consolidate JWT validation and session refresh logic into a shared middleware module to reduce duplication across Express routes.',
        1,
        N'Done',
        N'2026-04-28 17:00:00',
        N'2026-04-01 10:00:00'
    ),
    (
        2,
        N'Write API integration tests for employee endpoints',
        N'Add automated coverage for GET /employees and error paths using the mssql driver and mocked stored procedure responses.',
        1,
        N'In Progress',
        N'2026-05-30 17:00:00',
        N'2026-05-08 09:30:00'
    ),
    (
        3,
        N'Migrate legacy reports to Power BI',
        N'Port three departmental Excel reports into a shared Power BI workspace with row-level security aligned to department membership.',
        2,
        N'Pending',
        N'2026-05-05 17:00:00',
        N'2026-04-15 11:00:00'
    ),
    (
        4,
        N'Resolve production login timeout incidents',
        N'Investigate intermittent 30-second timeouts on the SSO callback; capture APM traces and propose connection pool tuning.',
        2,
        N'In Progress',
        N'2026-05-10 12:00:00',
        N'2026-05-01 08:00:00'
    ),
    (
        5,
        N'Implement task dashboard caching layer',
        N'Design a Redis cache for employee task summary aggregates with a five-minute TTL and invalidation on task status updates.',
        2,
        N'Pending',
        N'2026-06-20 17:00:00',
        N'2026-05-12 14:00:00'
    ),
    (
        6,
        N'Review pull requests for payments microservice',
        N'Complete code review for the v2 settlement API changes, focusing on idempotency keys and transaction boundary handling.',
        2,
        N'In Progress',
        N'2026-06-05 17:00:00',
        N'2026-05-14 16:30:00'
    ),
    (
        7,
        N'Update dependency security scan pipeline',
        N'Integrate npm audit and Snyk gates into CI so critical vulnerabilities block merges to the main branch.',
        2,
        N'Pending',
        N'2026-05-08 17:00:00',
        N'2026-04-20 10:15:00'
    ),
    (
        8,
        N'Document CI/CD rollback procedure',
        N'Publish a runbook for blue-green rollback including database migration reversal steps and communication templates.',
        3,
        N'Pending',
        N'2026-06-12 17:00:00',
        N'2026-05-10 13:00:00'
    ),
    (
        9,
        N'Finalize container base image hardening checklist',
        N'Apply CIS Docker benchmarks to the MSSQL and Node images used in local development and document exceptions.',
        3,
        N'Done',
        N'2026-04-15 17:00:00',
        N'2026-03-22 09:00:00'
    ),
    (
        10,
        N'Launch Q2 employer brand social campaign',
        N'Coordinate LinkedIn and Instagram content calendar, creative assets, and UTM tracking for recruitment landing pages.',
        4,
        N'In Progress',
        N'2026-05-12 17:00:00',
        N'2026-04-25 10:00:00'
    ),
    (
        11,
        N'Prepare brand guidelines presentation for leadership',
        N'Draft a 20-slide deck covering typography, tone of voice, and logo usage for the annual town hall.',
        4,
        N'Pending',
        N'2026-06-18 17:00:00',
        N'2026-05-15 11:30:00'
    ),
    (
        12,
        N'Schedule annual compliance training sessions',
        N'Book facilitator-led sessions for all departments and send calendar invites with pre-read materials.',
        6,
        N'Pending',
        N'2026-05-01 17:00:00',
        N'2026-04-10 08:30:00'
    ),
    (
        13,
        N'Compile monthly marketing KPI dashboard',
        N'Aggregate campaign impressions, click-through rates, and cost-per-lead metrics into a single executive summary spreadsheet.',
        5,
        N'Done',
        N'2026-04-30 17:00:00',
        N'2026-04-01 09:00:00'
    );
GO

SET IDENTITY_INSERT dbo.tasks OFF;
GO

/* ----------------------------------------------------------------------------
   Seed summary (optional verification query)
---------------------------------------------------------------------------- */
SELECT
    d.department_name,
    COUNT(DISTINCT e.employee_id) AS employee_count
FROM dbo.departments AS d
LEFT JOIN dbo.employees AS e ON e.department_id = d.department_id
GROUP BY d.department_name
ORDER BY d.department_name;
GO

SELECT
    e.full_name,
    SUM(CASE WHEN t.status IN (N'Pending', N'In Progress') THEN 1 ELSE 0 END) AS open_tasks,
    SUM(CASE WHEN t.status = N'Done' THEN 1 ELSE 0 END) AS done_tasks,
    SUM(CASE WHEN t.due_date < GETDATE() AND t.status <> N'Done' THEN 1 ELSE 0 END) AS overdue_tasks
FROM dbo.employees AS e
LEFT JOIN dbo.tasks AS t ON t.assigned_to = e.employee_id
GROUP BY e.full_name
ORDER BY open_tasks DESC;
GO
