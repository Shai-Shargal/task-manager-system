/*
================================================================================
  Employee Task Manager - Stored Procedures
  Database: TaskManagerDB
  Engine:   Microsoft SQL Server (MSSQL)

  Execution (Docker MSSQL):
    docker exec -i task-manager-mssql /opt/mssql-tools/bin/sqlcmd \
      -S localhost -U sa -P 'YourStrongPassword123!' -C < db/stored_procedures.sql

  Prerequisite:
    Run db/schema.sql and db/seed.sql first.
================================================================================
*/

USE TaskManagerDB;
GO

/* ============================================================================
   usp_GetAllTasks
   Returns every task with assignee and department context.
   Used by: GET /tasks (Express API)
============================================================================ */
CREATE OR ALTER PROCEDURE dbo.usp_GetAllTasks
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        SELECT
            t.task_id,
            t.title,
            t.description,
            t.status,
            t.due_date,
            t.created_at,
            e.full_name     AS employee_full_name,
            d.department_name
        FROM dbo.tasks AS t
        INNER JOIN dbo.employees AS e
            ON e.employee_id = t.assigned_to
        INNER JOIN dbo.departments AS d
            ON d.department_id = e.department_id
        ORDER BY t.created_at DESC;
    END TRY
    BEGIN CATCH
        /* Re-throw with original severity/state for consistent API error handling */
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();

        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO

/* ============================================================================
   usp_GetEmployeeTaskSummary
   Returns each employee with task counts by status and nearest open due date.
   Used by: GET /employees (Express API / React dashboard)
============================================================================ */
CREATE OR ALTER PROCEDURE dbo.usp_GetEmployeeTaskSummary
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        SELECT
            e.employee_id,
            e.full_name AS employee_full_name,
            d.department_name,
            COUNT(t.task_id) AS total_tasks,
            SUM(CASE WHEN t.status = N'Pending' THEN 1 ELSE 0 END) AS pending_tasks,
            SUM(CASE WHEN t.status = N'In Progress' THEN 1 ELSE 0 END) AS in_progress_tasks,
            SUM(CASE WHEN t.status = N'Done' THEN 1 ELSE 0 END) AS done_tasks,
            MIN(
                CASE
                    WHEN t.status <> N'Done'
                     AND t.due_date >= GETDATE()
                    THEN t.due_date
                END
            ) AS nearest_upcoming_due_date
        FROM dbo.employees AS e
        INNER JOIN dbo.departments AS d
            ON d.department_id = e.department_id
        LEFT JOIN dbo.tasks AS t
            ON t.assigned_to = e.employee_id
        GROUP BY
            e.employee_id,
            e.full_name,
            d.department_name
        ORDER BY
            e.full_name;
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();

        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO
