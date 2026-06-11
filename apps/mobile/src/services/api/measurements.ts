import apiClient from './client';

// Express: المقاسات متداخلة تحت /users/:id/measurements
export interface SavedMeasurement {
  id: string;
  name: string;
  data: Record<string, any>;
  createdAt?: string;
}

export const measurementsApi = {
  list: async (userId: string): Promise<SavedMeasurement[]> => {
    const response = await apiClient.get(`/users/${userId}/measurements`);
    const data = response.data as any;
    if (Array.isArray(data)) return data as SavedMeasurement[];
    return (data?.measurements as SavedMeasurement[]) || (data?.items as SavedMeasurement[]) || [];
  },

  create: async (userId: string, name: string, data: Record<string, any>): Promise<SavedMeasurement> => {
    const response = await apiClient.post(`/users/${userId}/measurements`, { name, data });
    return response.data as SavedMeasurement;
  },

  update: async (userId: string, measurementId: string, payload: { name?: string; data?: Record<string, any> }): Promise<SavedMeasurement> => {
    const response = await apiClient.put(`/users/${userId}/measurements/${measurementId}`, payload);
    return response.data as SavedMeasurement;
  },

  remove: async (userId: string, measurementId: string): Promise<void> => {
    await apiClient.delete(`/users/${userId}/measurements/${measurementId}`);
  },
};
