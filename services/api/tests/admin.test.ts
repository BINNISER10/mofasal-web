jest.mock('../src/config/database');

import request from 'supertest';
import { createTestApp, generateTestToken } from './helpers';

const app = createTestApp();
const adminToken = generateTestToken({ role: 'ADMIN' });

describe('Admin Controller', () => {
  describe('GET /api/v1/admin/dashboard', () => {
    it('returns dashboard stats for admin', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('rejects unauthenticated requests', async () => {
      const res = await request(app).get('/api/v1/admin/dashboard');
      expect(res.status).toBe(401);
    });

    it('rejects non-admin users', async () => {
      const customerToken = generateTestToken({ role: 'CUSTOMER' });
      const res = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/v1/admin/users', () => {
    it('returns paginated users list', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('supports status filter', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users?status=ACTIVE')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    it('supports search', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users?search=ahmed')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('PUT /api/v1/admin/users/:id/status', () => {
    it('updates user status', async () => {
      const res = await request(app)
        .put('/api/v1/admin/users/test-user-id/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'SUSPENDED' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/admin/config', () => {
    it('returns all configs', async () => {
      const res = await request(app)
        .get('/api/v1/admin/config')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/v1/admin/modules', () => {
    it('returns all modules', async () => {
      const res = await request(app)
        .get('/api/v1/admin/modules')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/v1/admin/reports/orders', () => {
    it('returns order reports', async () => {
      const res = await request(app)
        .get('/api/v1/admin/reports/orders')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/v1/admin/reports/revenue', () => {
    it('returns revenue reports', async () => {
      const res = await request(app)
        .get('/api/v1/admin/reports/revenue')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/v1/admin/audit-logs', () => {
    it('returns paginated audit logs', async () => {
      const res = await request(app)
        .get('/api/v1/admin/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });
});
