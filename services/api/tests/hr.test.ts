jest.mock('../src/config/database');

import request from 'supertest';
import { createTestApp, generateTestToken } from './helpers';

const app = createTestApp();
const adminToken = generateTestToken({ role: 'ADMIN', shopId: 'test-shop' });
const userToken = generateTestToken({ role: 'CUSTOMER', userId: 'customer-user-id', shopId: undefined });

describe('HR Module', () => {
  describe('Employees', () => {
    it('GET /api/v1/hr/employees returns 401 without auth', async () => {
      const res = await request(app).get('/api/v1/hr/employees');
      expect(res.status).toBe(401);
    });

    it('GET /api/v1/hr/employees returns 200 with valid token', async () => {
      const res = await request(app)
        .get('/api/v1/hr/employees')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('POST /api/v1/hr/employees returns 422 with empty body', async () => {
      const res = await request(app)
        .post('/api/v1/hr/employees')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      expect(res.status).toBe(422);
    });

    it('POST /api/v1/hr/employees returns 403 for non-admin', async () => {
      const res = await request(app)
        .post('/api/v1/hr/employees')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Test', position: 'Tailor' });
      expect(res.status).toBe(403);
    });

    it('GET /api/v1/hr/employees/:id returns 404 for non-existent', async () => {
      const res = await request(app)
        .get('/api/v1/hr/employees/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe('Departments', () => {
    it('GET /api/v1/hr/departments returns 200', async () => {
      const res = await request(app)
        .get('/api/v1/hr/departments')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('POST /api/v1/hr/departments returns 422 with empty body', async () => {
      const res = await request(app)
        .post('/api/v1/hr/departments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      expect(res.status).toBe(422);
    });
  });

  describe('Attendance', () => {
    it('POST /api/v1/hr/attendance/checkin/:employeeId returns 401 without auth', async () => {
      const res = await request(app).post('/api/v1/hr/attendance/checkin/emp-1');
      expect(res.status).toBe(401);
    });
  });

  describe('Leave Requests', () => {
    it('POST /api/v1/hr/leaves/:employeeId returns 422 with empty body', async () => {
      const res = await request(app)
        .post('/api/v1/hr/leaves/emp-1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      expect(res.status).toBe(422);
    });
  });

  describe('Payroll', () => {
    it('POST /api/v1/hr/payrolls/:employeeId returns 422 with empty body', async () => {
      const res = await request(app)
        .post('/api/v1/hr/payrolls/emp-1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      expect(res.status).toBe(422);
    });
  });
});
