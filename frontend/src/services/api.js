/**
 * API service — axios client for the Employee Task Manager backend.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',
});

/**
 * Fetches employee task summaries from the API.
 * @returns {Promise<Array>} Employee summary rows from GET /employees
 */
export async function getEmployees() {
  try {
    const response = await api.get('/employees');
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || 'Failed to fetch employees';
    console.error('getEmployees error:', message);
    throw new Error(message);
  }
}
