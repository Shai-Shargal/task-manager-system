/**
 * In-memory API for Vercel demo mode (no backend).
 */

import { DEPARTMENTS, INITIAL_EMPLOYEES } from '../mock/employees.js';
import { INITIAL_TASKS } from '../mock/tasks.js';

const DELAY_MS = 120;

let employees = INITIAL_EMPLOYEES.map((e) => ({ ...e }));
let tasks = INITIAL_TASKS.map((t) => ({ ...t }));
let nextTaskId = Math.max(...tasks.map((t) => t.task_id), 0) + 1;

function delay() {
  return new Promise((resolve) => setTimeout(resolve, DELAY_MS));
}

function getEmployee(employeeId) {
  return employees.find((e) => e.employee_id === employeeId);
}

function departmentName(departmentId) {
  return DEPARTMENTS[departmentId] ?? 'Unknown';
}

/** Mirrors usp_GetEmployeeTaskSummary */
function buildEmployeeSummaries() {
  const now = Date.now();

  return employees
    .map((e) => {
      const empTasks = tasks.filter((t) => t.assigned_to === e.employee_id);
      const pending = empTasks.filter((t) => t.status === 'Pending').length;
      const inProgress = empTasks.filter((t) => t.status === 'In Progress').length;
      const done = empTasks.filter((t) => t.status === 'Done').length;

      const upcoming = empTasks
        .filter((t) => t.status !== 'Done' && new Date(t.due_date).getTime() >= now)
        .map((t) => new Date(t.due_date))
        .sort((a, b) => a - b);

      return {
        employee_id: e.employee_id,
        employee_full_name: e.full_name,
        color_hex: e.color_hex,
        department_name: departmentName(e.department_id),
        total_tasks: empTasks.length,
        pending_tasks: pending,
        in_progress_tasks: inProgress,
        done_tasks: done,
        nearest_upcoming_due_date:
          upcoming.length > 0 ? upcoming[0].toISOString() : null,
      };
    })
    .sort((a, b) => a.employee_full_name.localeCompare(b.employee_full_name));
}

/** Mirrors usp_GetAllTasks join shape */
function buildTaskRows() {
  return [...tasks]
    .map((t) => {
      const emp = getEmployee(t.assigned_to);
      return {
        task_id: t.task_id,
        title: t.title,
        description: t.description,
        status: t.status,
        due_date: t.due_date,
        created_at: t.created_at,
        assigned_to: t.assigned_to,
        employee_full_name: emp?.full_name ?? 'Unknown',
        color_hex: emp?.color_hex ?? null,
        department_name: emp ? departmentName(emp.department_id) : 'Unknown',
      };
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function assertValidStatusTransition(currentStatus, newStatus) {
  if (currentStatus === newStatus) {
    return {
      message: 'Task status is already set to the requested value.',
      noop: true,
    };
  }
  if (currentStatus === 'Done') {
    throw new Error('Invalid status transition. Completed tasks cannot be changed.');
  }
  if (currentStatus === 'Pending' && newStatus !== 'In Progress') {
    throw new Error('Invalid status transition. Pending can only move to In Progress.');
  }
  if (currentStatus === 'In Progress' && newStatus !== 'Done') {
    throw new Error('Invalid status transition. In Progress can only move to Done.');
  }
  if (!['Pending', 'In Progress', 'Done'].includes(newStatus)) {
    throw new Error(
      'Invalid status value. Allowed values are: Pending, In Progress, Done.'
    );
  }
  return null;
}

export async function getEmployees() {
  await delay();
  return buildEmployeeSummaries();
}

export async function getTasks() {
  await delay();
  return buildTaskRows();
}

export async function createTask(taskData) {
  await delay();

  const title = taskData?.title?.trim();
  if (!title) {
    throw new Error('Title is required and cannot be empty.');
  }
  if (!taskData?.dueDate) {
    throw new Error('Due date is required.');
  }
  if (!getEmployee(taskData.assignedTo)) {
    throw new Error(
      'Employee not found. No employee exists for the provided AssignedTo value.'
    );
  }

  const task = {
    task_id: nextTaskId++,
    title,
    description: taskData.description?.trim() || null,
    assigned_to: taskData.assignedTo,
    status: 'Pending',
    due_date: new Date(`${taskData.dueDate}T17:00:00`).toISOString(),
    created_at: new Date().toISOString(),
  };
  tasks.push(task);

  return {
    message: 'Task created successfully.',
    task_id: task.task_id,
  };
}

export async function updateTask(taskId, taskData) {
  await delay();

  const task = tasks.find((t) => t.task_id === taskId);
  if (!task) {
    throw new Error('Task not found. No task exists for the provided TaskID.');
  }

  const title = taskData?.title?.trim();
  if (!title) {
    throw new Error('Title is required and cannot be empty.');
  }
  if (!taskData?.dueDate) {
    throw new Error('Due date is required.');
  }
  if (!getEmployee(taskData.assignedTo)) {
    throw new Error(
      'Employee not found. No employee exists for the provided AssignedTo value.'
    );
  }

  task.title = title;
  task.description = taskData.description?.trim() || null;
  task.assigned_to = taskData.assignedTo;
  task.due_date = new Date(`${taskData.dueDate}T17:00:00`).toISOString();

  return {
    message: 'Task updated successfully.',
    task_id: taskId,
  };
}

export async function deleteTask(taskId) {
  await delay();

  const index = tasks.findIndex((t) => t.task_id === taskId);
  if (index === -1) {
    throw new Error('Task not found. No task exists for the provided TaskID.');
  }

  tasks.splice(index, 1);

  return {
    message: 'Task deleted successfully.',
    task_id: taskId,
  };
}

export async function updateTaskStatus(taskId, status) {
  await delay();

  const task = tasks.find((t) => t.task_id === taskId);
  if (!task) {
    throw new Error('Task not found. No task exists for the provided TaskID.');
  }

  const transition = assertValidStatusTransition(task.status, status);
  if (transition?.noop) {
    return {
      message: transition.message,
      task_id: taskId,
      status,
    };
  }

  task.status = status;

  return {
    message: 'Task status updated successfully.',
    task_id: taskId,
    status,
  };
}

export async function updateEmployeeColor(employeeId, colorHex) {
  await delay();

  const hex = colorHex?.trim();
  if (!hex) {
    throw new Error('Color hex value is required.');
  }

  const emp = getEmployee(employeeId);
  if (!emp) {
    throw new Error(
      'Employee not found. No employee exists for the provided EmployeeID.'
    );
  }

  emp.color_hex = hex;

  return {
    message: 'Employee color updated successfully.',
    employee_id: employeeId,
    color_hex: hex,
  };
}
