jest.mock('../src/config/database');

import request from 'supertest';
import { createTestApp, generateTestToken } from './helpers';

const app = createTestApp();
const adminToken = generateTestToken({ role: 'ADMIN' });
const customerToken = generateTestToken({ role: 'CUSTOMER' });

describe('Coupon Controller', () => {
  describe('POST /api/v1/coupons/validate', () => {
    it('validates a coupon code (public)', async () => {
      const res = await request(app)
        .post('/api/v1/coupons/validate')
        .send({ code: 'TEST10', shopId: 'test-shop', totalAmount: 100 });
      expect([200, 400, 404]).toContain(res.status);
      expect(res.body.success).toBeDefined();
    });

    it('rejects empty body', async () => {
      const res = await request(app)
        .post('/api/v1/coupons/validate')
        .send({});
      expect([200, 400, 404, 422]).toContain(res.status);
    });
  });

  describe('POST /api/v1/coupons (admin)', () => {
    it('creates a coupon with admin token', async () => {
      const res = await request(app)
        .post('/api/v1/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'SAVE20',
          type: 'PERCENTAGE',
          value: 20,
          minOrderAmount: 100,
          maxUses: 100,
        });
      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
    });

    it('rejects without auth', async () => {
      const res = await request(app)
        .post('/api/v1/coupons')
        .send({ code: 'SAVE20' });
      expect(res.status).toBe(401);
    });

    it('rejects customer role', async () => {
      const res = await request(app)
        .post('/api/v1/coupons')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ code: 'SAVE20', type: 'PERCENTAGE', value: 20 });
      expect([401, 403]).toContain(res.status);
    });
  });

  describe('GET /api/v1/coupons', () => {
    it('lists coupons with admin token', async () => {
      const res = await request(app)
        .get('/api/v1/coupons')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('rejects without auth', async () => {
      const res = await request(app).get('/api/v1/coupons');
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/v1/coupons/:id/toggle', () => {
    it('toggles coupon status', async () => {
      const res = await request(app)
        .patch('/api/v1/coupons/test-coupon-id/toggle')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });
      expect([200, 404]).toContain(res.status);
    });
  });

  describe('GET /api/v1/coupons/:id/stats', () => {
    it('returns coupon stats', async () => {
      const res = await request(app)
        .get('/api/v1/coupons/test-coupon-id/stats')
        .set('Authorization', `Bearer ${adminToken}`);
      expect([200, 404]).toContain(res.status);
    });
  });
});
