import request from 'supertest';
import app from '../src/app.js';
import { TASK_STATUSES } from '../src/utils/constants.js';

describe('Task Status Transition Flow', () => {
  let authToken;
  let taskId;

  beforeAll(async () => {
    // Login to get auth token
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'manager@example.com',
        password: 'Manager@123456',
      });

    authToken = loginRes.body.data.accessToken;
  });

  describe('POST /api/v1/tasks', () => {
    it('should create a new task with TODO status', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task for Status Transition',
          description: 'Testing status transitions',
          priority: 'HIGH',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.status).toBe(TASK_STATUSES.TODO);
      taskId = res.body.data.id;
    });
  });

  describe('PUT /api/v1/tasks/:taskId - Status Transitions', () => {
    it('should transition from TODO to IN_PROGRESS', async () => {
      const res = await request(app)
        .put(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: TASK_STATUSES.IN_PROGRESS,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe(TASK_STATUSES.IN_PROGRESS);
    });

    it('should transition from IN_PROGRESS to IN_REVIEW', async () => {
      const res = await request(app)
        .put(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: TASK_STATUSES.IN_REVIEW,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe(TASK_STATUSES.IN_REVIEW);
    });

    it('should transition from IN_REVIEW to DONE', async () => {
      const res = await request(app)
        .put(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: TASK_STATUSES.DONE,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe(TASK_STATUSES.DONE);
    });

    it('should not allow transition from DONE to any state', async () => {
      const res = await request(app)
        .put(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: TASK_STATUSES.TODO,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Cannot transition');
    });

    it('should allow transition to BLOCKED from any active state', async () => {
      // Create another task for this test
      const createRes = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task for BLOCKED',
          description: 'Testing BLOCKED transition',
          priority: 'MEDIUM',
        });

      const newTaskId = createRes.body.data.id;

      // Transition to BLOCKED
      const res = await request(app)
        .put(`/api/v1/tasks/${newTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: TASK_STATUSES.BLOCKED,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe(TASK_STATUSES.BLOCKED);
    });
  });

  describe('GET /api/v1/tasks - Listing with Filters', () => {
    it('should list tasks with pagination', async () => {
      const res = await request(app)
        .get('/api/v1/tasks?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.pagination).toHaveProperty('page');
      expect(res.body.pagination).toHaveProperty('limit');
      expect(res.body.pagination).toHaveProperty('total');
    });

    it('should filter tasks by status', async () => {
      const res = await request(app)
        .get(`/api/v1/tasks?status=${TASK_STATUSES.TODO}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toBeDefined();
      res.body.data.forEach(task => {
        expect(task.status).toBe(TASK_STATUSES.TODO);
      });
    });
  });

  describe('DELETE /api/v1/tasks/:taskId', () => {
    it('should delete a task', async () => {
      // Create a task first
      const createRes = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Task to Delete',
          description: 'This task will be deleted',
          priority: 'LOW',
        });

      const deleteTaskId = createRes.body.data.id;

      // Delete it
      const res = await request(app)
        .delete(`/api/v1/tasks/${deleteTaskId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
    });
  });
});
