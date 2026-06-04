jest.mock('../src/config/database');

import request from 'supertest';
import { createTestApp, generateTestToken } from './helpers';

const app = createTestApp();
const merchantToken = generateTestToken({ role: 'MERCHANT' });
const adminToken = generateTestToken({ role: 'ADMIN' });

describe('Accounting Controller', () => {
  describe('GET /api/v1/accounting/accounts', () => {
    it('returns chart of accounts for merchant', async () => {
      const res = await request(app)
        .get('/api/v1/accounting/accounts')
        .set('Authorization', `Bearer ${merchantToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('rejects unauthenticated requests', async () => {
      const res = await request(app).get('/api/v1/accounting/accounts');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/accounting/accounts/seed', () => {
    it('seeds chart of accounts', async () => {
      const res = await request(app)
        .post('/api/v1/accounting/accounts/seed')
        .set('Authorization', `Bearer ${merchantToken}`);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/accounting/journal', () => {
    it('posts a journal entry', async () => {
      const res = await request(app)
        .post('/api/v1/accounting/journal')
        .set('Authorization', `Bearer ${merchantToken}`)
        .send({
          description: 'Test entry',
          lines: [
            { accountCode: '1000', debit: 1000, credit: 0 },
            { accountCode: '2000', debit: 0, credit: 1000 },
          ],
        });
      expect(res.status).toBe(201);
    });

    it('rejects unbalanced entries', async () => {
      const res = await request(app)
        .post('/api/v1/accounting/journal')
        .set('Authorization', `Bearer ${merchantToken}`)
        .send({
          description: 'Unbalanced entry',
          lines: [
            { accountCode: '1000', debit: 1000, credit: 0 },
          ],
        });
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('GET /api/v1/accounting/journal', () => {
    it('returns journal entries', async () => {
      const res = await request(app)
        .get('/api/v1/accounting/journal')
        .set('Authorization', `Bearer ${merchantToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/v1/accounting/trial-balance', () => {
    it('returns trial balance', async () => {
      const res = await request(app)
        .get('/api/v1/accounting/trial-balance')
        .set('Authorization', `Bearer ${merchantToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
