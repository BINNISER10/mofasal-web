jest.mock('../src/config/database');

import request from 'supertest';
import { createTestApp, generateTestToken } from './helpers';

const app = createTestApp();

const VALID_UUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

describe('Delivery Endpoints', () => {
  describe('POST /delivery', () => {
    it('creates delivery with auth', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .post('/api/v1/delivery')
        .set('Authorization', `Bearer ${token}`)
        .send({
          orderId: VALID_UUID,
          address: 'King Fahd Road, Riyadh',
          city: 'Riyadh',
          provider: 'SHOP_VEHICLE',
        });
      expect(res.status).toBe(201);
    });

    it('rejects without auth', async () => {
      const res = await request(app)
        .post('/api/v1/delivery')
        .send({
          orderId: VALID_UUID,
          address: 'King Fahd Road',
          city: 'Riyadh',
          provider: 'SHOP_VEHICLE',
        });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /delivery/providers', () => {
    it('returns delivery providers', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .get('/api/v1/delivery/providers')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
  });
});
