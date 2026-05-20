/**
 * Integration tests for GET /health
 */

const request = require('supertest');
const app = require('../src/app');

describe('GET /health', () => {
  it('should return status 200', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
