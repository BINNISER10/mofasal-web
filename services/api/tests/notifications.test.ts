jest.mock('../src/config/database');

import request from 'supertest';
import { createTestApp, generateTestToken } from './helpers';

const app = createTestApp();

describe('Notification Endpoints', () => {
  describe('GET /notifications', () => {
    it('returns notifications with auth', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });

    it('rejects without auth', async () => {
      const res = await request(app).get('/api/v1/notifications');
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /notifications/:id/read', () => {
    it('marks notification as read', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .patch('/api/v1/notifications/test-notification/read')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
  });

  describe('PATCH /notifications/read-all', () => {
    it('marks all notifications as read', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .patch('/api/v1/notifications/read-all')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /notifications/:id', () => {
    it('deletes notification', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .delete('/api/v1/notifications/test-notification')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
  });
});
