jest.mock('../src/config/database');

import request from 'supertest';
import { createTestApp, generateTestToken } from './helpers';

const app = createTestApp();
const adminToken = generateTestToken({ role: 'ADMIN', shopId: 'test-shop' });

describe('Procurement Module', () => {
  it('GET /api/v1/procurement returns 401 without auth', async () => {
    const res = await request(app).get('/api/v1/procurement');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/procurement returns 200 with valid token', async () => {
    const res = await request(app)
      .get('/api/v1/procurement')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/v1/procurement returns 422 with empty body', async () => {
    const res = await request(app)
      .post('/api/v1/procurement')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect(res.status).toBe(422);
  });

  it('GET /api/v1/procurement/:id returns 404 for non-existent', async () => {
    const res = await request(app)
      .get('/api/v1/procurement/non-existent')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});
