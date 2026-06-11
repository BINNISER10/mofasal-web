import { apiClient } from './client';

export interface Role {
  id: string;
  name: string;
  displayName: string;
  displayNameAr?: string;
  permissions: Record<string, boolean | string[]>;
  userCount: number;
  isSystem: boolean;
  parentId?: string;
  createdAt: string;
}

export interface CreateRoleInput {
  name: string;
  displayName: string;
  displayNameAr?: string;
  permissions: Record<string, boolean | string[]>;
  parentId?: string;
}

export const rolesApi = {
  getRoles: async (): Promise<Role[]> => {
    return apiClient.get<Role[]>('/roles');
  },

  getRole: async (id: string): Promise<Role> => {
    return apiClient.get<Role>(`/roles/${id}`);
  },

  createRole: async (input: CreateRoleInput): Promise<Role> => {
    return apiClient.post<Role>('/roles', input);
  },

  updateRole: async (id: string, input: Partial<CreateRoleInput>): Promise<Role> => {
    return apiClient.put<Role>(`/roles/${id}`, input);
  },

  deleteRole: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/roles/${id}`);
  },
};
