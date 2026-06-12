import { apiClient } from './client';

export interface Employee {
  id: string;
  shopId: string;
  name: string;
  nameAr?: string;
  phone?: string;
  email?: string;
  position: string;
  positionAr?: string;
  salary: number;
  isActive: boolean;
  hireDate?: string;
  department?: { id: string; name: string } | null;
  createdAt?: string;
}

export interface EmployeesResponse {
  items: Employee[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateEmployeeInput {
  name: string;
  position: string;
  phone?: string;
  email?: string;
  salary?: number;
  departmentId?: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNameAr?: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
  hoursWorked?: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNameAr?: string;
  type: 'ANNUAL' | 'SICK' | 'EMERGENCY' | 'UNPAID';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNameAr?: string;
  month: number;
  year: number;
  baseSalary: number;
  additions: number;
  deductions: number;
  netSalary: number;
  status: 'PENDING' | 'PAID';
  paidAt?: string;
}

export const hrApi = {
  // Employees
  getEmployees: async (params?: Record<string, string>): Promise<EmployeesResponse> => {
    const data = await apiClient.get<any>('/hr/employees', { params });
    if (Array.isArray(data)) return { items: data, total: data.length, page: 1, limit: data.length };
    return {
      items: data.items || [],
      total: data.total ?? (data.items?.length || 0),
      page: data.page ?? 1,
      limit: data.limit ?? 20,
    };
  },

  getEmployee: async (id: string): Promise<Employee> => {
    return apiClient.get<Employee>(`/hr/employees/${id}`);
  },

  createEmployee: async (input: CreateEmployeeInput): Promise<Employee> => {
    return apiClient.post<Employee>('/hr/employees', input);
  },

  updateEmployee: async (id: string, input: Partial<CreateEmployeeInput> & { isActive?: boolean }): Promise<Employee> => {
    return apiClient.put<Employee>(`/hr/employees/${id}`, input);
  },

  deleteEmployee: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/hr/employees/${id}`);
  },

  // Attendance
  getAttendance: async (params?: { date?: string }): Promise<Attendance[]> => {
    return apiClient.get<Attendance[]>('/hr/attendance', { params });
  },

  checkIn: async (employeeId: string): Promise<Attendance> => {
    return apiClient.post<Attendance>(`/hr/attendance/checkin/${employeeId}`, {});
  },

  checkOut: async (employeeId: string): Promise<Attendance> => {
    return apiClient.post<Attendance>(`/hr/attendance/checkout/${employeeId}`, {});
  },

  // Leave Requests
  getLeaveRequests: async (params?: { status?: string }): Promise<LeaveRequest[]> => {
    return apiClient.get<LeaveRequest[]>('/hr/leaves', { params });
  },

  createLeaveRequest: async (employeeId: string, input: {
    type: string;
    startDate: string;
    endDate: string;
    reason?: string;
  }): Promise<LeaveRequest> => {
    return apiClient.post<LeaveRequest>(`/hr/leaves/${employeeId}`, input);
  },

  approveLeaveRequest: async (id: string): Promise<LeaveRequest> => {
    return apiClient.post<LeaveRequest>(`/hr/leaves/${id}/approve`, {});
  },

  rejectLeaveRequest: async (id: string, notes?: string): Promise<LeaveRequest> => {
    return apiClient.post<LeaveRequest>(`/hr/leaves/${id}/reject`, { notes });
  },

  // Payroll
  getPayroll: async (params?: { month?: number; year?: number }): Promise<PayrollRecord[]> => {
    const queryParams: Record<string, string> = {};
    if (params?.month) queryParams.month = params.month.toString();
    if (params?.year) queryParams.year = params.year.toString();
    return apiClient.get<PayrollRecord[]>('/hr/payrolls', { params: queryParams });
  },

  processPayroll: async (employeeId: string, input: {
    baseSalary: number;
    overtime?: number;
    bonuses?: number;
    deductions?: number;
    month: number;
    year: number;
    notes?: string;
  }): Promise<PayrollRecord> => {
    return apiClient.post<PayrollRecord>(`/hr/payrolls/${employeeId}`, input);
  },

  markAsPaid: async (id: string): Promise<PayrollRecord> => {
    return apiClient.post<PayrollRecord>(`/hr/payrolls/${id}/pay`, {});
  },
};
