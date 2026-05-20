/**
 * API facade — real backend (api.js) or in-browser demo (mockApi.js).
 * Set VITE_DEMO_MODE=true for Vercel / frontend-only deployment.
 */

import * as realApi from './api.js';
import * as mockApi from './mockApi.js';

export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

const api = isDemoMode ? mockApi : realApi;

export const getEmployees = api.getEmployees;
export const getTasks = api.getTasks;
export const createTask = api.createTask;
export const updateTask = api.updateTask;
export const deleteTask = api.deleteTask;
export const updateTaskStatus = api.updateTaskStatus;
export const updateEmployeeColor = api.updateEmployeeColor;
