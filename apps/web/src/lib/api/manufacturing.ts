import { apiClient } from './client';

export interface ManufacturingTask {
  id: string;
  orderId: string;
  orderNumber: string;
  stage: string;
  status: string;
  assignedTo?: string;
  estimatedHours?: number;
  actualHours?: number;
  startedAt?: string;
  completedAt?: string;
  customerName?: string;
}

export const manufacturingApi = {
  getTasks: () => apiClient.get<ManufacturingTask[]>('/manufacturing/tasks'),
  updateTask: (id: string, status: string) =>
    apiClient.patch<unknown>(`/manufacturing/tasks/${id}`, { status }),
};
