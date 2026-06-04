jest.mock('../src/config/database');

import request from 'supertest';
import { createTestApp, generateTestToken } from './helpers';

const app = createTestApp();
const merchantToken = generateTestToken({ role: 'MERCHANT' });
const adminToken = generateTestToken({ role: 'ADMIN' });

describe('Reports Controller', () => {
  describe('GET /api/v1/reports/overview', () => {
    it('returns report overview for merchant', async () => {
      const res = await request(app)
        .get('/api/v1/reports/overview')
        .set('Authorization', `Bearer ${merchantToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('rejects unauthenticated requests', async () => {
      const res = await request(app).get('/api/v1/reports/overview');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/reports/summary', () => {
    it('returns summary for merchant', async () => {
      const res = await request(app)
        .get('/api/v1/reports/summary')
        .set('Authorization', `Bearer ${merchantToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/v1/reports/sales-trend', () => {
    it('returns sales trend', async () => {
      const res = await request(app)
        .get('/api/v1/reports/sales-trend')
        .set('Authorization', `Bearer ${merchantToken}`);
      expect(res.status).toBe(200);
    });

    it('supports day granularity', async () => {
      const res = await request(app)
        .get('/api/v1/reports/sales-trend?granularity=day')
        .set('Authorization', `Bearer ${merchantToken}`);
      expect(res.status).toBe(200);
    });

    it('supports month granularity', async () => {
      const res = await request(app)
        .get('/api/v1/reports/sales-trend?granularity=month')
        .set('Authorization', `Bearer ${merchantToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/v1/reports/top-products', () => {
    it('returns top products', async () => {
      const res = await request(app)
        .get('/api/v1/reports/top-products')
        .set('Authorization', `Bearer ${merchantToken}`);
      expect(res.status).toBe(200);
    });

    it('supports custom limit', async () => {
      const res = await request(app)
        .get('/api/v1/reports/top-products?limit=5')
        .set('Authorization', `Bearer ${merchantToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/v1/reports/payments', () => {
    it('returns payment breakdown', async () => {
      const res = await request(app)
        .get('/api/v1/reports/payments')
        .set('Authorization', `Bearer ${merchantToken}`);
      expect(res.status).toBe(200);
    });
  });
});
