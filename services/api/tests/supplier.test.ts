jest.mock('../src/config/database');

import request from 'supertest';
import { createTestApp, generateTestToken } from './helpers';

const app = createTestApp();
const adminToken = generateTestToken({ role: 'ADMIN', shopId: 'test-shop' });

describe('Supplier Module', () => {
  it('GET /api/v1/suppliers returns 401 without auth', async () => {
    const res = await request(app).get('/api/v1/suppliers');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/suppliers returns 200 with valid token', async () => {
    const res = await request(app)
      .get('/api/v1/suppliers')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/v1/suppliers returns 422 with empty body', async () => {
    const res = await request(app)
      .post('/api/v1/suppliers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect(res.status).toBe(422);
  });

  it('POST /api/v1/suppliers creates supplier with valid name', async () => {
    const res = await request(app)
      .post('/api/v1/suppliers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test Supplier' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/v1/suppliers/:id returns 404 for non-existent', async () => {
    const res = await request(app)
      .get('/api/v1/suppliers/non-existent')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  it('POST /api/v1/suppliers/:id/products returns 422 with empty body', async () => {
    const res = await request(app)
      .post('/api/v1/suppliers/supp-1/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect(res.status).toBe(422);
  });
});
