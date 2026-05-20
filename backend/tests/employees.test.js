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
    expect(row).toHaveProperty('color_hex');
  });
});

describe('PATCH /employees/:id/color', () => {
  it('should return 400 for invalid colorHex', async () => {
    const res = await request(app)
      .patch('/employees/1/color')
      .send({ colorHex: 'not-a-color' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/colorHex/i);
  });

  it('should return 404 when employee does not exist', async () => {
    const res = await request(app)
      .patch('/employees/999999/color')
      .send({ colorHex: '#3B82F6' });

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/employee not found/i);
  });

  it('should return 200 and persist new color', async () => {
    const res = await request(app)
      .patch('/employees/1/color')
      .send({ colorHex: '#A855F7' });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/updated successfully/i);
    expect(res.body.employee_id).toBe(1);
    expect(res.body.color_hex).toBe('#A855F7');

    const list = await request(app).get('/employees');
    const alice = list.body.find((e) => e.employee_id === 1);
    expect(alice.color_hex).toBe('#A855F7');

    await request(app)
      .patch('/employees/1/color')
      .send({ colorHex: '#3B82F6' });
  });
});
