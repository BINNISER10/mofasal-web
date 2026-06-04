jest.mock('../src/config/database');

import request from 'supertest';
import { createTestApp, generateTestToken } from './helpers';

const app = createTestApp();

const VALID_UUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

describe('Review Endpoints', () => {
  describe('POST /reviews', () => {
    it('creates review with auth', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({
          orderId: VALID_UUID,
          shopRating: 5,
          tailorRating: 4,
          shopReview: 'Excellent service!',
        });
      expect(res.status).toBe(201);
    });

    it('rejects without auth', async () => {
      const res = await request(app)
        .post('/api/v1/reviews')
        .send({ orderId: VALID_UUID, shopRating: 5 });
      expect(res.status).toBe(401);
    });

    it('validates rating range', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({
          orderId: VALID_UUID,
          shopRating: 6,
        });
      expect(res.status).toBe(422);
    });
  });

  describe('GET /reviews/shop/:shopId', () => {
    it('gets shop reviews', async () => {
      const res = await request(app)
        .get(`/api/v1/reviews/shop/${VALID_UUID}`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /reviews/my/reviews', () => {
    it('gets user reviews with auth', async () => {
      const token = generateTestToken();
      const res = await request(app)
        .get('/api/v1/reviews/my/reviews')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
  });
});
