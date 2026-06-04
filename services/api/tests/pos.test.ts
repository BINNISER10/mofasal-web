jest.mock('../src/config/database');

import request from 'supertest';
import { createTestApp, generateTestToken } from './helpers';

const app = createTestApp();
const adminToken = generateTestToken({ role: 'ADMIN', shopId: 'test-shop' });
const cashierToken = generateTestToken({ role: 'CASHIER', shopId: 'test-shop' });
const userToken = generateTestToken({ role: 'CUSTOMER', userId: 'customer-user-id', shopId: undefined });

describe('POS Module', () => {
  describe('POS Sessions', () => {
    it('POST /api/v1/pos/sessions returns 422 with empty body', async () => {
      const res = await request(app)
        .post('/api/v1/pos/sessions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      expect(res.status).toBe(422);
    });

    it('POST /api/v1/pos/sessions returns 403 for CUSTOMER', async () => {
      const res = await request(app)
        .post('/api/v1/pos/sessions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ cashierId: 'cashier-1', openingBalance: 1000 });
      expect(res.status).toBe(403);
    });

    it('GET /api/v1/pos/sessions returns 200 for admin', async () => {
      const res = await request(app)
        .get('/api/v1/pos/sessions')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/v1/pos/sessions/:id returns 404 for non-existent', async () => {
      const res = await request(app)
        .get('/api/v1/pos/sessions/non-existent')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe('POS Orders', () => {
    it('POST /api/v1/pos/sessions/:sessionId/orders returns 422 with empty body', async () => {
      const res = await request(app)
        .post('/api/v1/pos/sessions/session-1/orders')
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({});
      expect(res.status).toBe(422);
    });

    it('GET /api/v1/pos/sessions/:sessionId/orders returns 200', async () => {
      const res = await request(app)
        .get('/api/v1/pos/sessions/session-1/orders')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });
});
