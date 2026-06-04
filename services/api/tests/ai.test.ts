jest.mock('../src/config/database');

import request from 'supertest';
import { createTestApp, generateTestToken } from './helpers';

const app = createTestApp();
const customerToken = generateTestToken({ role: 'CUSTOMER' });

describe('AI Controller', () => {
  describe('POST /api/v1/ai/behavior', () => {
    it('logs user behavior', async () => {
      const res = await request(app)
        .post('/api/v1/ai/behavior')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ actionType: 'VIEW_PRODUCT', actionData: { productId: 'test-123' } });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('rejects missing actionType', async () => {
      const res = await request(app)
        .post('/api/v1/ai/behavior')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ actionData: {} });
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('rejects unauthenticated requests', async () => {
      const res = await request(app)
        .post('/api/v1/ai/behavior')
        .send({ actionType: 'VIEW_PRODUCT' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/ai/recommendations', () => {
    it('returns personalized recommendations', async () => {
      const res = await request(app)
        .get('/api/v1/ai/recommendations')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('supports custom limit', async () => {
      const res = await request(app)
        .get('/api/v1/ai/recommendations?limit=5')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/v1/ai/similar/:productId', () => {
    it('returns similar products', async () => {
      const res = await request(app)
        .get('/api/v1/ai/similar/test-product-id')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/v1/ai/profile', () => {
    it('returns AI profile', async () => {
      const res = await request(app)
        .get('/api/v1/ai/profile')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(200);
    });
  });
});
