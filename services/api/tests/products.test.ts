jest.mock('../src/config/database');

import request from 'supertest';
import { createTestApp, generateTestToken } from './helpers';

const app = createTestApp();

describe('Product Endpoints', () => {
  describe('GET /products', () => {
    it('lists products', async () => {
      const res = await request(app).get('/api/v1/products');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('paginates products', async () => {
      const res = await request(app).get('/api/v1/products?page=1&limit=5');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /products/search', () => {
    it('searches products', async () => {
      const res = await request(app).get('/api/v1/products/search?q=wool');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /products/category', () => {
    it('filters by category', async () => {
      const res = await request(app).get('/api/v1/products/category?category=fabric');
      expect(res.status).toBe(200);
    });
  });

  describe('POST /products', () => {
    it('creates product with merchant token', async () => {
      const token = generateTestToken({ role: 'MERCHANT' });
      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Fabric',
          nameAr: 'قماش تجريبي',
          price: 100,
          stockQuantity: 50,
        });
      expect(res.status).toBe(201);
    });

    it('rejects without auth', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .send({ name: 'Test', price: 100 });
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /products/:id', () => {
    it('deletes product with merchant token', async () => {
      const token = generateTestToken({ role: 'MERCHANT' });
      const res = await request(app)
        .delete('/api/v1/products/test-product')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
  });
});
