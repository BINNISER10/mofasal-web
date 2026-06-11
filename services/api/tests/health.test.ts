jest.mock('../src/config/database');

import request from 'supertest';
import { createTestApp } from './helpers';

const app = createTestApp();

describe('Health Check', () => {
  it('returns 200 with success message', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('MUFASAL API is running');
  });

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/v1/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('includes timestamp', async () => {
    const res = await request(app).get('/health');
    expect(res.body.timestamp).toBeDefined();
  });
});
