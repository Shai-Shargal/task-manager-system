/**
 * Integration tests for GET /employees
 */

const request = require('supertest');
const app = require('../src/app');

describe('GET /employees', () => {
  it('should return status 200', async () => {
    const res = await request(app).get('/employees');

    expect(res.status).toBe(200);
  });

  it('should return an array', async () => {
    const res = await request(app).get('/employees');

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should return summary rows with expected fields when data exists', async () => {
    const res = await request(app).get('/employees');

    if (res.body.length === 0) {
      return;
    }

    const row = res.body[0];
    expect(row).toHaveProperty('employee_id');
    expect(row).toHaveProperty('employee_full_name');
    expect(row).toHaveProperty('department_name');
    expect(row).toHaveProperty('total_tasks');
    expect(row).toHaveProperty('pending_tasks');
    expect(row).toHaveProperty('in_progress_tasks');
    expect(row).toHaveProperty('done_tasks');
  });
});
