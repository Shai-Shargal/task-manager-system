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
});
