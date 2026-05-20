/**
 * Integration tests for GET /tasks, POST /tasks, PATCH /tasks/:id/status
 */

const request = require('supertest');
const app = require('../src/app');

const validTaskPayload = {
  title: 'Integration test task',
  description: 'Created by Jest',
  assignedTo: 1,
  dueDate: '2026-12-31',
};

describe('GET /tasks', () => {
  it('should return status 200', async () => {
    const res = await request(app).get('/tasks');

    expect(res.status).toBe(200);
  });

  it('should return an array', async () => {
    const res = await request(app).get('/tasks');

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should return task rows with expected fields when data exists', async () => {
    const res = await request(app).get('/tasks');

    if (res.body.length === 0) {
      return;
    }

    const row = res.body[0];
    expect(row).toHaveProperty('task_id');
    expect(row).toHaveProperty('title');
    expect(row).toHaveProperty('description');
    expect(row).toHaveProperty('status');
    expect(row).toHaveProperty('due_date');
    expect(row).toHaveProperty('employee_full_name');
    expect(row).toHaveProperty('department_name');
  });
});

describe('POST /tasks', () => {
  it('should return 400 when title is missing', async () => {
    const res = await request(app).post('/tasks').send({
      assignedTo: 1,
      dueDate: '2026-12-31',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/title/i);
  });

  it('should return 400 when assignedTo is missing', async () => {
    const res = await request(app).post('/tasks').send({
      title: 'Missing assignee',
      dueDate: '2026-12-31',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/assignedTo/i);
  });

  it('should return 400 when dueDate is missing', async () => {
    const res = await request(app).post('/tasks').send({
      title: 'Missing due date',
      assignedTo: 1,
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/dueDate/i);
  });

  it('should return 500 when employee does not exist', async () => {
    const res = await request(app).post('/tasks').send({
      title: 'Invalid assignee',
      assignedTo: 999999,
      dueDate: '2026-12-31',
    });

    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/employee not found/i);
  });

  it('should return 201 and create a Pending task', async () => {
    const res = await request(app).post('/tasks').send(validTaskPayload);

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/created successfully/i);
    expect(res.body.task_id).toBeDefined();

    const list = await request(app).get('/tasks');
    const created = list.body.find((t) => t.task_id === res.body.task_id);

    expect(created).toBeDefined();
    expect(created.title).toBe(validTaskPayload.title);
    expect(created.description).toBe(validTaskPayload.description);
    expect(created.status).toBe('Pending');
  });
});

describe('PATCH /tasks/:id/status', () => {
  let pendingTaskId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/tasks')
      .send({
        title: `PATCH test task ${Date.now()}`,
        assignedTo: 1,
        dueDate: '2026-12-31',
      });

    if (res.status !== 201) {
      throw new Error(
        `Failed to create test task for PATCH suite: ${res.body.message || res.status}`
      );
    }

    pendingTaskId = res.body.task_id;
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

describe('PUT /tasks/:id', () => {
  it('should return 400 when title is missing', async () => {
    const createRes = await request(app).post('/tasks').send(validTaskPayload);
    const taskId = createRes.body.task_id;

    const res = await request(app).put(`/tasks/${taskId}`).send({
      assignedTo: 1,
      dueDate: '2026-12-31',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/title/i);
  });

  it('should return 404 when task does not exist', async () => {
    const res = await request(app).put('/tasks/999999').send({
      title: 'Ghost task',
      assignedTo: 1,
      dueDate: '2026-12-31',
    });

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/task not found/i);
  });

  it('should return 200 and update task details', async () => {
    const createRes = await request(app).post('/tasks').send({
      title: 'Before edit',
      description: 'Original',
      assignedTo: 1,
      dueDate: '2026-06-01',
    });

    const taskId = createRes.body.task_id;

    const res = await request(app).put(`/tasks/${taskId}`).send({
      title: 'After edit',
      description: 'Updated description',
      assignedTo: 1,
      dueDate: '2026-07-15',
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/updated successfully/i);
    expect(res.body.task_id).toBe(taskId);

    const listRes = await request(app).get('/tasks');
    const updated = listRes.body.find((t) => t.task_id === taskId);

    expect(updated.title).toBe('After edit');
    expect(updated.description).toBe('Updated description');
    expect(updated.status).toBe('Pending');
  });
});

describe('DELETE /tasks/:id', () => {
  it('should return 404 when task does not exist', async () => {
    const res = await request(app).delete('/tasks/999999');

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/task not found/i);
  });

  it('should return 200 and remove the task', async () => {
    const createRes = await request(app).post('/tasks').send({
      title: `Delete test task ${Date.now()}`,
      assignedTo: 1,
      dueDate: '2026-12-31',
    });

    expect(createRes.status).toBe(201);
    const taskId = createRes.body.task_id;

    const deleteRes = await request(app).delete(`/tasks/${taskId}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.message).toMatch(/deleted successfully/i);
    expect(deleteRes.body.task_id).toBe(taskId);

    const listRes = await request(app).get('/tasks');
    const found = listRes.body.find((t) => t.task_id === taskId);
    expect(found).toBeUndefined();
  });
});
