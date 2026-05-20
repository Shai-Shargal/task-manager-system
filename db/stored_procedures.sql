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
            t.assigned_to,
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

/* ============================================================================
   usp_GetOverdueTasks
   Returns open tasks whose due date has passed.
   Overdue definition: due_date < GETDATE() AND status <> 'Done'
============================================================================ */
CREATE OR ALTER PROCEDURE dbo.usp_GetOverdueTasks
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
        WHERE
            t.due_date < GETDATE()
            AND t.status <> N'Done'
        ORDER BY
            t.due_date ASC;
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();

        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO

/* ============================================================================
   usp_UpdateTaskStatus
   Updates a task status with forward-only transition rules.
   Used by: PATCH /tasks/:id/status (Express API)

   Allowed transitions:
     Pending     -> In Progress
     In Progress -> Done

   Disallowed:
     Pending     -> Done
     In Progress -> Pending
     Done        -> any status
============================================================================ */
CREATE OR ALTER PROCEDURE dbo.usp_UpdateTaskStatus
    @TaskID    INT,
    @NewStatus VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CurrentStatus VARCHAR(20);

    BEGIN TRY
        /* Validate requested status value */
        IF @NewStatus NOT IN (N'Pending', N'In Progress', N'Done')
        BEGIN
            RAISERROR(
                N'Invalid status value. Allowed values are: Pending, In Progress, Done.',
                16,
                1
            );
            RETURN;
        END;

        /* Load current status and confirm task exists */
        SELECT @CurrentStatus = t.status
        FROM dbo.tasks AS t
        WHERE t.task_id = @TaskID;

        IF @CurrentStatus IS NULL
        BEGIN
            RAISERROR(N'Task not found. No task exists for the provided TaskID.', 16, 1);
            RETURN;
        END;

        /* No-op when status is unchanged */
        IF @CurrentStatus = @NewStatus
        BEGIN
            SELECT
                N'Task status is already set to the requested value.' AS message,
                @TaskID    AS task_id,
                @NewStatus AS status;
            RETURN;
        END;

        /* Enforce forward-only workflow */
        IF @CurrentStatus = N'Done'
        BEGIN
            RAISERROR(
                N'Invalid status transition. Completed tasks cannot be changed.',
                16,
                1
            );
            RETURN;
        END;

        IF @CurrentStatus = N'Pending' AND @NewStatus <> N'In Progress'
        BEGIN
            RAISERROR(
                N'Invalid status transition. Pending can only move to In Progress.',
                16,
                1
            );
            RETURN;
        END;

        IF @CurrentStatus = N'In Progress' AND @NewStatus <> N'Done'
        BEGIN
            RAISERROR(
                N'Invalid status transition. In Progress can only move to Done.',
                16,
                1
            );
            RETURN;
        END;

        UPDATE dbo.tasks
        SET status = @NewStatus
        WHERE task_id = @TaskID;

        SELECT
            N'Task status updated successfully.' AS message,
            @TaskID    AS task_id,
            @NewStatus AS status;
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();

        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO

/* ============================================================================
   usp_AssignTask
   Reassigns an open task to another employee inside a transaction.
============================================================================ */
CREATE OR ALTER PROCEDURE dbo.usp_AssignTask
    @TaskID     INT,
    @EmployeeID INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TaskStatus VARCHAR(20);

    BEGIN TRY
        /* Validate task exists and is eligible for reassignment */
        SELECT @TaskStatus = t.status
        FROM dbo.tasks AS t
        WHERE t.task_id = @TaskID;

        IF @TaskStatus IS NULL
        BEGIN
            RAISERROR(N'Task not found. No task exists for the provided TaskID.', 16, 1);
            RETURN;
        END;

        IF @TaskStatus = N'Done'
        BEGIN
            RAISERROR(
                N'Cannot reassign a completed task. Only Pending or In Progress tasks can be assigned.',
                16,
                1
            );
            RETURN;
        END;

        /* Validate target employee exists */
        IF NOT EXISTS (
            SELECT 1
            FROM dbo.employees AS e
            WHERE e.employee_id = @EmployeeID
        )
        BEGIN
            RAISERROR(
                N'Employee not found. No employee exists for the provided EmployeeID.',
                16,
                1
            );
            RETURN;
        END;

        BEGIN TRANSACTION;

        UPDATE dbo.tasks
        SET assigned_to = @EmployeeID
        WHERE task_id = @TaskID;

        COMMIT TRANSACTION;

        SELECT
            N'Task assigned successfully.' AS message,
            @TaskID     AS task_id,
            @EmployeeID AS assigned_employee_id;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();

        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO

/* ============================================================================
   usp_CreateTask
   Inserts a new task assigned to an employee with status Pending.
   Used by: POST /tasks (Express API)
============================================================================ */
CREATE OR ALTER PROCEDURE dbo.usp_CreateTask
    @Title       VARCHAR(200),
    @Description VARCHAR(MAX) = NULL,
    @AssignedTo  INT,
    @DueDate     DATETIME
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        /* Validate required inputs */
        IF @Title IS NULL OR LTRIM(RTRIM(@Title)) = N''
        BEGIN
            RAISERROR(N'Title is required and cannot be empty.', 16, 1);
            RETURN;
        END;

        IF @DueDate IS NULL
        BEGIN
            RAISERROR(N'Due date is required.', 16, 1);
            RETURN;
        END;

        /* Validate assignee exists */
        IF NOT EXISTS (
            SELECT 1
            FROM dbo.employees AS e
            WHERE e.employee_id = @AssignedTo
        )
        BEGIN
            RAISERROR(
                N'Employee not found. No employee exists for the provided AssignedTo value.',
                16,
                1
            );
            RETURN;
        END;

        INSERT INTO dbo.tasks (
            title,
            description,
            assigned_to,
            status,
            due_date,
            created_at
        )
        VALUES (
            LTRIM(RTRIM(@Title)),
            @Description,
            @AssignedTo,
            N'Pending',
            @DueDate,
            GETDATE()
        );

        SELECT
            N'Task created successfully.' AS message,
            CAST(SCOPE_IDENTITY() AS INT) AS task_id;
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();

        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO

/* ============================================================================
   usp_DeleteTask
   Permanently removes a task by TaskID.
============================================================================ */
CREATE OR ALTER PROCEDURE dbo.usp_DeleteTask
    @TaskID INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        /* Confirm task exists before delete */
        IF NOT EXISTS (
            SELECT 1
            FROM dbo.tasks AS t
            WHERE t.task_id = @TaskID
        )
        BEGIN
            RAISERROR(
                N'Task not found. No task exists for the provided TaskID.',
                16,
                1
            );
            RETURN;
        END;

        DELETE FROM dbo.tasks
        WHERE task_id = @TaskID;

        SELECT
            N'Task deleted successfully.' AS message,
            @TaskID AS task_id;
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();

        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO

/* ============================================================================
   usp_UpdateTaskDetails
   Updates task title, description, assignee, and due date only.
   Status and created_at are not modified (use usp_UpdateTaskStatus for status).
   Used by: PUT /tasks/:id (Express API)
============================================================================ */
CREATE OR ALTER PROCEDURE dbo.usp_UpdateTaskDetails
    @TaskID       INT,
    @Title        VARCHAR(200),
    @Description  VARCHAR(MAX) = NULL,
    @AssignedTo   INT,
    @DueDate      DATETIME
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        IF @Title IS NULL OR LTRIM(RTRIM(@Title)) = N''
        BEGIN
            RAISERROR(N'Title is required and cannot be empty.', 16, 1);
            RETURN;
        END;

        IF @DueDate IS NULL
        BEGIN
            RAISERROR(N'Due date is required.', 16, 1);
            RETURN;
        END;

        IF NOT EXISTS (
            SELECT 1
            FROM dbo.tasks AS t
            WHERE t.task_id = @TaskID
        )
        BEGIN
            RAISERROR(
                N'Task not found. No task exists for the provided TaskID.',
                16,
                1
            );
            RETURN;
        END;

        IF NOT EXISTS (
            SELECT 1
            FROM dbo.employees AS e
            WHERE e.employee_id = @AssignedTo
        )
        BEGIN
            RAISERROR(
                N'Employee not found. No employee exists for the provided AssignedTo value.',
                16,
                1
            );
            RETURN;
        END;

        UPDATE dbo.tasks
        SET
            title       = LTRIM(RTRIM(@Title)),
            description = @Description,
            assigned_to = @AssignedTo,
            due_date    = @DueDate
        WHERE task_id = @TaskID;

        SELECT
            N'Task updated successfully.' AS message,
            @TaskID AS task_id;
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();

        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO
