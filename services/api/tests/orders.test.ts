jest.mock('../src/config/database');

import request from 'supertest';
import { createTestApp, generateTestToken } from './helpers';

const app = createTestApp();

describe('Order Endpoints', () => {
  describe('GET /orders', () => {
    it('lists orders with auth', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .get('/api/v1/orders')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });

    it('rejects without auth', async () => {
      const res = await request(app).get('/api/v1/orders');
      expect(res.status).toBe(401);
    });

    it('filters by status', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .get('/api/v1/orders?status=PENDING')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /orders/:id', () => {
    it('returns 404 for non-existent order', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .get('/api/v1/orders/non-existent-id')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });
});
