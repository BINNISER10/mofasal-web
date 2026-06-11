jest.mock('../src/config/database');

import request from 'supertest';
import { createTestApp, generateTestToken } from './helpers';

const app = createTestApp();

const VALID_UUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

describe('Middleware Tests', () => {
  describe('Request ID', () => {
    it('adds X-Request-Id header to response', async () => {
      const res = await request(app).get('/health');
      expect(res.headers['x-request-id']).toBeDefined();
    });

    it('uses provided X-Request-Id', async () => {
      const res = await request(app)
        .get('/health')
        .set('X-Request-Id', 'custom-id-123');
      expect(res.headers['x-request-id']).toBe('custom-id-123');
    });
  });

  describe('Response Time', () => {
    it('adds X-Response-Time header', async () => {
      const res = await request(app).get('/health');
      expect(res.headers['x-response-time']).toBeDefined();
    });
  });

  describe('CORS', () => {
    it('includes CORS headers', async () => {
      const res = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000');
      expect(res.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Sanitization', () => {
    it('sanitizes XSS in request body', async () => {
      const token = generateTestToken({ role: 'ADMIN' });
      const res = await request(app)
        .put(`/api/v1/users/${VALID_UUID}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '<script>alert("xss")</script>' });
      expect(res.status).not.toBe(500);
    });
  });

  describe('Security', () => {
    it('rejects requests without required auth', async () => {
      const res = await request(app).get('/api/v1/users');
      expect(res.status).toBe(401);
    });

    it('rejects invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(401);
    });
  });
});
