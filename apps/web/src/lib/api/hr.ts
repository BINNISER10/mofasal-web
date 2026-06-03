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

export const hrApi = {
  getEmployees: async (params?: Record<string, string>): Promise<EmployeesResponse> => {
    const data = await apiClient.get<any>('/hr/employees', { params });
    // الاستجابة قد تكون {items,total,...} أو مصفوفة
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
};
