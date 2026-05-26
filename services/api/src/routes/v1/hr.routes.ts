import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { HRController } from '../../controllers/v1/hr.controller';

const router = Router();

router.get('/employees', authenticate, HRController.getEmployees);
router.get('/employees/:id', authenticate, HRController.getEmployee);
router.post('/employees', authenticate, HRController.createEmployee);
router.put('/employees/:id', authenticate, HRController.updateEmployee);
router.delete('/employees/:id', authenticate, HRController.deleteEmployee);

router.get('/attendance', authenticate, HRController.getAttendance);
router.post('/attendance/checkin/:employeeId', authenticate, HRController.checkIn);
router.post('/attendance/checkout/:employeeId', authenticate, HRController.checkOut);

router.get('/leaves', authenticate, HRController.getLeaveRequests);
router.post('/leaves/:employeeId', authenticate, HRController.createLeaveRequest);
router.post('/leaves/:id/approve', authenticate, HRController.approveLeave);
router.post('/leaves/:id/reject', authenticate, HRController.rejectLeave);

router.get('/payrolls', authenticate, HRController.getPayrolls);
router.post('/payrolls/:employeeId', authenticate, HRController.processPayroll);
router.post('/payrolls/:id/pay', authenticate, HRController.markPayrollPaid);

router.get('/departments', authenticate, HRController.getDepartments);
router.post('/departments', authenticate, HRController.createDepartment);
router.put('/departments/:id', authenticate, HRController.updateDepartment);
router.delete('/departments/:id', authenticate, HRController.deleteDepartment);

export default router;
