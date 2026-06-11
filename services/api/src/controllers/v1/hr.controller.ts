import { Response, NextFunction } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendCreated } from '../../utils/response';
import { HRService } from '../../services/HRService';

export class HRController {
  // Employees
  static async getEmployees(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shopId = req.user!.shopId!;
      const { page, limit } = req.query;
      const result = await HRService.getEmployees(shopId, Number(page) || 1, Number(limit) || 20);
      sendSuccess(res, result);
    } catch (error) { next(error); }
  }

  static async getEmployee(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const employee = await HRService.getEmployee(req.params.id);
      sendSuccess(res, employee);
    } catch (error) { next(error); }
  }

  static async createEmployee(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = { ...req.body, shopId: req.user!.shopId! };
      const employee = await HRService.createEmployee(data);
      sendCreated(res, employee, 'Employee created');
    } catch (error) { next(error); }
  }

  static async updateEmployee(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const employee = await HRService.updateEmployee(req.params.id, req.body);
      sendSuccess(res, employee, 'Employee updated');
    } catch (error) { next(error); }
  }

  static async deleteEmployee(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await HRService.deleteEmployee(req.params.id);
      sendSuccess(res, result);
    } catch (error) { next(error); }
  }

  // Attendance
  static async checkIn(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const attendance = await HRService.checkIn(req.params.employeeId);
      sendCreated(res, attendance, 'Checked in');
    } catch (error) { next(error); }
  }

  static async checkOut(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const attendance = await HRService.checkOut(req.params.employeeId);
      sendSuccess(res, attendance, 'Checked out');
    } catch (error) { next(error); }
  }

  static async getAttendance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shopId = req.user!.shopId!;
      const { date } = req.query;
      const attendance = await HRService.getAttendance(shopId, date as string);
      sendSuccess(res, attendance);
    } catch (error) { next(error); }
  }

  // Leave Requests
  static async createLeaveRequest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const leave = await HRService.createLeaveRequest(req.params.employeeId, req.body);
      sendCreated(res, leave, 'Leave request created');
    } catch (error) { next(error); }
  }

  static async approveLeave(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const leave = await HRService.approveLeave(req.params.id, req.user!.id);
      sendSuccess(res, leave, 'Leave approved');
    } catch (error) { next(error); }
  }

  static async rejectLeave(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const leave = await HRService.rejectLeave(req.params.id, req.user!.id, req.body.notes);
      sendSuccess(res, leave, 'Leave rejected');
    } catch (error) { next(error); }
  }

  static async getLeaveRequests(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shopId = req.user!.shopId!;
      const { status } = req.query;
      const leaves = await HRService.getLeaveRequests(shopId, status as string);
      sendSuccess(res, leaves);
    } catch (error) { next(error); }
  }

  // Payroll
  static async processPayroll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payroll = await HRService.processPayroll(req.params.employeeId, req.body, req.user!.id);
      sendCreated(res, payroll, 'Payroll processed');
    } catch (error) { next(error); }
  }

  static async getPayrolls(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shopId = req.user!.shopId!;
      const { month, year } = req.query;
      const payrolls = await HRService.getPayrolls(shopId, month ? Number(month) : undefined, year ? Number(year) : undefined);
      sendSuccess(res, payrolls);
    } catch (error) { next(error); }
  }

  static async markPayrollPaid(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payroll = await HRService.markPayrollPaid(req.params.id);
      sendSuccess(res, payroll, 'Payroll marked as paid');
    } catch (error) { next(error); }
  }

  // Departments
  static async getDepartments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const shopId = req.user!.shopId!;
      const departments = await HRService.getDepartments(shopId);
      sendSuccess(res, departments);
    } catch (error) { next(error); }
  }

  static async createDepartment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const department = await HRService.createDepartment({ ...req.body, shopId: req.user!.shopId! });
      sendCreated(res, department, 'Department created');
    } catch (error) { next(error); }
  }

  static async updateDepartment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const department = await HRService.updateDepartment(req.params.id, req.body);
      sendSuccess(res, department, 'Department updated');
    } catch (error) { next(error); }
  }

  static async deleteDepartment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await HRService.deleteDepartment(req.params.id);
      sendSuccess(res, result);
    } catch (error) { next(error); }
  }
}
