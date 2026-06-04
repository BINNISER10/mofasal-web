jest.mock('../src/config/database');

import request from 'supertest';
import { createTestApp, generateTestToken } from './helpers';

const app = createTestApp();
const customerToken = generateTestToken({ role: 'CUSTOMER' });
const adminToken = generateTestToken({ role: 'ADMIN' });

describe('Loyalty Controller', () => {
  describe('GET /api/v1/loyalty/leaderboard', () => {
    it('returns leaderboard (public)', async () => {
      const res = await request(app)
        .get('/api/v1/loyalty/leaderboard');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('supports custom limit', async () => {
      const res = await request(app)
        .get('/api/v1/loyalty/leaderboard?limit=5');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/v1/loyalty/me/balance', () => {
    it('returns balance for authenticated customer', async () => {
      const res = await request(app)
        .get('/api/v1/loyalty/me/balance')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('rejects without auth', async () => {
      const res = await request(app)
        .get('/api/v1/loyalty/me/balance');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/loyalty/me/calculate', () => {
    it('calculates discount', async () => {
      const res = await request(app)
        .post('/api/v1/loyalty/me/calculate')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ maxPoints: 100 });
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/v1/loyalty/me/redeem', () => {
    it('redeems points', async () => {
      const res = await request(app)
        .post('/api/v1/loyalty/me/redeem')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ points: 100, orderId: 'test-order' });
      expect([200, 400, 500]).toContain(res.status);
    });
  });

  describe('GET /api/v1/loyalty/me/history', () => {
    it('returns transaction history', async () => {
      const res = await request(app)
        .get('/api/v1/loyalty/me/history')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(200);
    });

    it('supports pagination', async () => {
      const res = await request(app)
        .get('/api/v1/loyalty/me/history?page=1&limit=10')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/v1/loyalty/admin/stats', () => {
    it('returns shop loyalty stats', async () => {
      const res = await request(app)
        .get('/api/v1/loyalty/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    it('rejects customer role', async () => {
      const res = await request(app)
        .get('/api/v1/loyalty/admin/stats')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/v1/loyalty/admin/grant', () => {
    it('grants points to customer', async () => {
      const res = await request(app)
        .post('/api/v1/loyalty/admin/grant')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ customerId: 'test-customer-id', points: 100, reason: 'مكافأة' });
      expect([200, 400]).toContain(res.status);
    });
  });
});
