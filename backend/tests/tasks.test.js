/**
 * Integration tests for GET /tasks and PATCH /tasks/:id/status
 */

const request = require('supertest');
const app = require('../src/app');

describe('GET /tasks', () => {
  it('should return status 200', async () => {
    const res = await request(app).get('/tasks');

    expect(res.status).toBe(200);
  });

  it('should return an array', async () => {
    const res = await request(app).get('/tasks');

    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('PATCH /tasks/:id/status', () => {
  let pendingTaskId;

  beforeAll(async () => {
    const res = await request(app).get('/tasks');
    const pendingTask = res.body.find((task) => task.status === 'Pending');

    if (!pendingTask) {
      throw new Error('No Pending task found in database. Run db/seed.sql.');
    }

    pendingTaskId = pendingTask.task_id;
  });

  it('should return error status and message on invalid transition', async () => {
    const res = await request(app)
      .patch(`/tasks/${pendingTaskId}/status`)
      .send({ status: 'Done' });

    expect(res.status).toBe(500);
    expect(res.body.message).toBeDefined();
    expect(res.body.message).toMatch(/Invalid status transition/i);
  });

  it('should return status 200 on valid transition', async () => {
    const res = await request(app)
      .patch(`/tasks/${pendingTaskId}/status`)
      .send({ status: 'In Progress' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBeDefined();
    expect(res.body.task_id).toBe(pendingTaskId);
    expect(res.body.status).toBe('In Progress');
  });
});
