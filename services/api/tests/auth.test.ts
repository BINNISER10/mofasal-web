jest.mock('../src/config/database');

import jwt from 'jsonwebtoken';
import request from 'supertest';
import { config } from '../src/config';
import { createTestApp, generateTestToken } from './helpers';

const app = createTestApp();

function generateRefreshToken(overrides?: Record<string, unknown>): string {
  const role = (overrides?.role as string) || 'ADMIN';
  const ROLE_USER_MAP: Record<string, string> = {
    ADMIN: 'test-admin-id', CUSTOMER: 'test-customer-id',
    TAILOR_SHOP: 'test-tailor-id', MERCHANT: 'test-merchant-id',
  };
  const userId = (overrides?.userId as string) || ROLE_USER_MAP[role] || 'test-user-id';
  return jwt.sign({ userId, role }, config.jwt.refreshSecret, { expiresIn: '7d' });
}

describe('Auth Endpoints', () => {
  describe('POST /auth/register', () => {
    it('registers a new customer successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Ahmed',
          phone: '0509999999',
          password: 'password123',
          role: 'CUSTOMER',
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('validates required fields', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'A' });
      expect(res.status).toBe(422);
    });

    it('validates phone format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Ahmed',
          phone: '123',
          password: 'password123',
        });
      expect(res.status).toBe(422);
    });
  });

  describe('POST /auth/login', () => {
    it('logs in with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ phone: '0501234567', password: 'password123' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('rejects invalid password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ phone: '0501234567', password: 'wrong' });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('logs out with valid token', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });

    it('rejects without token', async () => {
      const res = await request(app).post('/api/v1/auth/logout');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /auth/profile', () => {
    it('returns profile with valid token', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });

    it('rejects without token', async () => {
      const res = await request(app).get('/api/v1/auth/profile');
      expect(res.status).toBe(401);
    });

    it('rejects with invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /auth/profile', () => {
    it('updates profile with valid token', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name' });
      expect(res.status).toBe(200);
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('sends reset code', async () => {
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ phone: '0501234567' });
      expect(res.status).toBe(200);
    });
  });

  describe('POST /auth/refresh-token', () => {
    it('refreshes token', async () => {
      const refreshToken = generateRefreshToken();
      const res = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken });
      expect(res.status).toBe(200);
    });
  });
});
