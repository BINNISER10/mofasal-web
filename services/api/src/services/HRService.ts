import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { ApiError } from '../utils/ApiError';

interface EmployeeCreateData {
  shopId: string;
  userId: string;
  name: string;
  departmentId?: string;
  position?: string;
  salary?: number;
  hireDate?: Date;
}

interface LeaveRequestCreateData {
  type: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
}

interface PayrollData {
  baseSalary: number;
  overtime?: number;
  bonuses?: number;
  deductions?: number;
  month: number;
  year: number;
  notes?: string;
}

interface DepartmentCreateData {
  shopId: string;
  name: string;
  nameAr?: string;
  description?: string;
  managerId?: string;
}

interface AttendanceWhereClause {
  employee: { shopId: string };
  date?: object;
  status?: string;
}

interface LeaveRequestWhereClause {
  employee: { shopId: string };
  status?: string;
}

interface PayrollWhereClause {
  employee: { shopId: string };
  month?: number;
  year?: number;
}

export class HRService {
  // ─── Employees ───
  static async getEmployees(shopId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.employee.findMany({ where: { shopId }, skip, take: limit, include: { department: true, user: { select: { id: true, name: true, email: true, avatar: true } } }, orderBy: { createdAt: 'desc' } }),
      prisma.employee.count({ where: { shopId } }),
    ]);
    return { items, total, page, limit };
  }

  static async getEmployee(id: string) {
    const employee = await prisma.employee.findUnique({ where: { id }, include: { department: true, user: { select: { id: true, name: true, email: true, avatar: true } }, attendances: { take: 10, orderBy: { date: 'desc' } }, leaveRequests: { take: 10, orderBy: { createdAt: 'desc' } } } });
    if (!employee) throw ApiError.notFound('Employee not found');
    return employee;
  }

  static async createEmployee(data: Prisma.EmployeeUncheckedCreateInput) {
    return prisma.employee.create({ data, include: { department: true } });
  }

  static async updateEmployee(id: string, data: Partial<EmployeeCreateData>) {
    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound('Employee not found');
    return prisma.employee.update({ where: { id }, data, include: { department: true } });
  }

  static async deleteEmployee(id: string) {
    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing) throw ApiError.notFound('Employee not found');
    await prisma.employee.delete({ where: { id } });
    return { message: 'Employee deleted' };
  }

  // ─── Attendance ───
  static async checkIn(employeeId: string) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const existing = await prisma.attendance.findFirst({ where: { employeeId, date: { gte: today } } });
    if (existing) throw ApiError.badRequest('Already checked in today');
    return prisma.attendance.create({ data: { employeeId, checkIn: new Date(), status: 'PRESENT' } });
  }

  static async checkOut(employeeId: string) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const attendance = await prisma.attendance.findFirst({ where: { employeeId, date: { gte: today }, checkOut: null } });
    if (!attendance) throw ApiError.badRequest('No active check-in found');
    return prisma.attendance.update({ where: { id: attendance.id }, data: { checkOut: new Date() } });
  }

  static async getAttendance(shopId: string, date?: string) {
    const where: AttendanceWhereClause = { employee: { shopId } };
    if (date) { const d = new Date(date); d.setHours(0, 0, 0, 0); where.date = { gte: d }; }
    return prisma.attendance.findMany({ where, include: { employee: { select: { id: true, name: true, position: true } } }, orderBy: { date: 'desc' }, take: 50 });
  }

  // ─── Leave Requests ───
  static async createLeaveRequest(employeeId: string, data: LeaveRequestCreateData) {
    return prisma.leaveRequest.create({ data: { employeeId, ...data } });
  }

  static async approveLeave(id: string, approvedById: string) {
    const leave = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!leave) throw ApiError.notFound('Leave request not found');
    return prisma.leaveRequest.update({ where: { id }, data: { status: 'APPROVED', approvedById } });
  }

  static async rejectLeave(id: string, approvedById: string, notes?: string) {
    const leave = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!leave) throw ApiError.notFound('Leave request not found');
    return prisma.leaveRequest.update({ where: { id }, data: { status: 'REJECTED', approvedById, notes } });
  }

  static async getLeaveRequests(shopId: string, status?: string) {
    const where: LeaveRequestWhereClause = { employee: { shopId } };
    if (status) where.status = status;
    return prisma.leaveRequest.findMany({ where, include: { employee: { select: { id: true, name: true, position: true } } }, orderBy: { createdAt: 'desc' } });
  }

  // ─── Payroll ───
  static async processPayroll(employeeId: string, data: PayrollData, processedById: string) {
    const netSalary = data.baseSalary + (data.overtime || 0) + (data.bonuses || 0) - (data.deductions || 0);
    return prisma.payroll.create({ data: { employeeId, processedById, netSalary, ...data } });
  }

  static async getPayrolls(shopId: string, month?: number, year?: number) {
    const where: PayrollWhereClause = { employee: { shopId } };
    if (month) where.month = month;
    if (year) where.year = year;
    return prisma.payroll.findMany({ where, include: { employee: { select: { id: true, name: true, position: true, salary: true } } }, orderBy: [{ year: 'desc' }, { month: 'desc' }] });
  }

  static async markPayrollPaid(id: string) {
    const payroll = await prisma.payroll.findUnique({ where: { id } });
    if (!payroll) throw ApiError.notFound('Payroll not found');
    return prisma.payroll.update({ where: { id }, data: { status: 'PAID', paidAt: new Date() } });
  }

  // ─── Departments ───
  static async getDepartments(shopId: string) {
    return prisma.department.findMany({ where: { shopId }, include: { _count: { select: { employees: true } }, manager: { select: { id: true, name: true } } } });
  }

  static async createDepartment(data: DepartmentCreateData) {
    return prisma.department.create({ data });
  }

  static async updateDepartment(id: string, data: Partial<DepartmentCreateData>) {
    return prisma.department.update({ where: { id }, data });
  }

  static async deleteDepartment(id: string) {
    const count = await prisma.employee.count({ where: { departmentId: id } });
    if (count > 0) throw ApiError.badRequest('Cannot delete department with employees');
    await prisma.department.delete({ where: { id } });
    return { message: 'Department deleted' };
  }
}
