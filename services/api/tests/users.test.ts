jest.mock('../src/config/database');

import request from 'supertest';
import { createTestApp, generateTestToken } from './helpers';

const app = createTestApp();

const VALID_UUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

describe('User Endpoints', () => {
  describe('GET /users', () => {
    it('lists users with admin token', async () => {
      const token = generateTestToken({ role: 'ADMIN' });
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });

    it('rejects non-admin', async () => {
      const token = generateTestToken({ role: 'CUSTOMER' });
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });
  });

  describe('GET /users/:id', () => {
    it('returns user by id', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .get(`/api/v1/users/${VALID_UUID}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
  });

  describe('User Addresses', () => {
    it('gets user addresses', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .get(`/api/v1/users/${VALID_UUID}/addresses`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });

    it('creates address', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .post(`/api/v1/users/${VALID_UUID}/addresses`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          label: 'Home',
          street: 'King Fahd Road',
          city: 'Riyadh',
        });
      expect(res.status).toBe(201);
    });
  });

  describe('User Measurements', () => {
    it('gets user measurements', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .get(`/api/v1/users/${VALID_UUID}/measurements`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });

    it('creates measurement', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .post(`/api/v1/users/${VALID_UUID}/measurements`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'My Measurements',
          data: { chest: 100, waist: 80 },
        });
      expect(res.status).toBe(201);
    });
  });
});
