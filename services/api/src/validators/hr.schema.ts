import { z } from 'zod';

export const createEmployeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  position: z.string().min(1, 'Position is required'),
  salary: z.number().positive('Salary must be positive').optional(),
  departmentId: z.string().optional().nullable(),
  userId: z.string().optional().nullable(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export const createLeaveSchema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  type: z.enum(['ANNUAL', 'SICK', 'PERSONAL', 'MATERNITY', 'OTHER']).default('ANNUAL'),
  reason: z.string().optional().nullable(),
});

export const processPayrollSchema = z.object({
  baseSalary: z.number().positive('Base salary is required'),
  overtime: z.number().min(0).optional(),
  bonuses: z.number().min(0).optional(),
  deductions: z.number().min(0).optional(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020),
});

export const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  description: z.string().optional().nullable(),
  managerId: z.string().optional().nullable(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();
