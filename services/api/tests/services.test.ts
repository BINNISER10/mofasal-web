jest.mock('../src/config/database');

import request from 'supertest';
import { createTestApp, generateTestToken } from './helpers';

const app = createTestApp();

describe('Service Request Endpoints', () => {
  describe('POST /services', () => {
    it('creates service request with auth', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .post('/api/v1/services')
        .set('Authorization', `Bearer ${token}`)
        .send({
          shopId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          serviceType: 'TAILORING',
          notes: 'Need suit alteration',
        });
      expect(res.status).toBe(201);
    });

    it('rejects without auth', async () => {
      const res = await request(app)
        .post('/api/v1/services')
        .send({ shopId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', serviceType: 'TAILORING' });
      expect(res.status).toBe(401);
    });

    it('validates service type', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .post('/api/v1/services')
        .set('Authorization', `Bearer ${token}`)
        .send({
          shopId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          serviceType: 'INVALID_TYPE',
        });
      expect(res.status).toBe(422);
    });
  });

  describe('GET /services', () => {
    it('lists service requests with auth', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .get('/api/v1/services')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
  });
});
