jest.mock('../src/config/database');

import request from 'supertest';
import { createTestApp, generateTestToken } from './helpers';

const app = createTestApp();

const VALID_UUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

describe('Validation Tests', () => {
  describe('Auth Validation', () => {
    it('rejects invalid email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          phone: '966501234567',
          email: 'invalid-email',
          password: 'password123',
        });
      expect(res.status).toBe(422);
    });

    it('rejects short password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          phone: '966501234567',
          password: '123',
        });
      expect(res.status).toBe(422);
    });

    it('rejects invalid phone format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          phone: '123',
          password: 'password123',
        });
      expect(res.status).toBe(422);
    });
  });

  describe('Shop Validation', () => {
    it('rejects shop without name', async () => {
      const token = generateTestToken({ role: 'TAILOR_SHOP' });
      const res = await request(app)
        .post('/api/v1/shops')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.status).toBe(422);
    });
  });

  describe('Product Validation', () => {
    it('rejects product without price', async () => {
      const token = generateTestToken({ role: 'MERCHANT' });
      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test Product' });
      expect(res.status).toBe(422);
    });

    it('rejects negative price', async () => {
      const token = generateTestToken({ role: 'MERCHANT' });
      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test', price: -100 });
      expect(res.status).toBe(422);
    });
  });

  describe('Review Validation', () => {
    it('rejects rating below 1', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({ orderId: VALID_UUID, shopRating: 0 });
      expect(res.status).toBe(422);
    });

    it('rejects rating above 5', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({ orderId: VALID_UUID, shopRating: 6 });
      expect(res.status).toBe(422);
    });
  });
});
