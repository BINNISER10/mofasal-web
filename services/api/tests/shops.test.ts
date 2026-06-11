jest.mock('../src/config/database');

import request from 'supertest';
import { createTestApp, generateTestToken } from './helpers';

const app = createTestApp();

describe('Shop Endpoints', () => {
  describe('GET /shops', () => {
    it('lists shops without auth', async () => {
      const res = await request(app).get('/api/v1/shops');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('filters by city', async () => {
      const res = await request(app).get('/api/v1/shops?city=Riyadh');
      expect(res.status).toBe(200);
    });

    it('paginates results', async () => {
      const res = await request(app).get('/api/v1/shops?page=1&limit=10');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /shops/search', () => {
    it('searches shops by query', async () => {
      const res = await request(app).get('/api/v1/shops/search?q=tailor');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /shops/featured', () => {
    it('returns featured shops', async () => {
      const res = await request(app).get('/api/v1/shops/featured');
      expect(res.status).toBe(200);
    });
  });

  describe('POST /shops', () => {
    it('creates shop with valid token', async () => {
      const token = generateTestToken({ role: 'TAILOR_SHOP' });
      const res = await request(app)
        .post('/api/v1/shops')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test Shop', nameAr: 'متجر تجريبي' });
      expect(res.status).toBe(201);
    });

    it('rejects without auth', async () => {
      const res = await request(app)
        .post('/api/v1/shops')
        .send({ name: 'Test Shop' });
      expect(res.status).toBe(401);
    });

    it('rejects customer role', async () => {
      const token = generateTestToken({ role: 'CUSTOMER' });
      const res = await request(app)
        .post('/api/v1/shops')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test Shop' });
      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /shops/:id/verify', () => {
    it('verifies shop with admin token', async () => {
      const token = generateTestToken({ role: 'ADMIN' });
      const res = await request(app)
        .patch('/api/v1/shops/test-shop-id/verify')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });

    it('rejects non-admin', async () => {
      const token = generateTestToken({ role: 'TAILOR_SHOP' });
      const res = await request(app)
        .patch('/api/v1/shops/test-shop-id/verify')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });
  });
});
