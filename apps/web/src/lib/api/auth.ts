import { apiClient } from './client';
import type { User } from '@/lib/stores/authStore';

interface LoginRequest {
  phone: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  phone: string;
  email?: string;
  password: string;
  role: 'customer' | 'tailor' | 'merchant';
  shopName?: string;
  commercialRegister?: string;
}

interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

interface VerifyPhoneRequest {
  phone: string;
  code: string;
}

interface ForgotPasswordRequest {
  phone: string;
}

interface ResetPasswordRequest {
  phone: string;
  code: string;
  password: string;
}

interface FastApiUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  status: string;
  avatar?: string;
  phoneVerified?: boolean;
  shopId?: string;
  createdAt: string;
}

interface FastApiAuthResult {
  user: FastApiUser;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

function mapUser(u: FastApiUser): User {
  const role = (u.role || 'customer').toLowerCase();
  const roleMap: Record<string, User['role']> = {
    super_admin: 'admin',
    superadmin: 'admin',
    tailor: 'tailor',
    tailor_shop: 'tailor',
    merchant: 'merchant',
    customer: 'customer',
    representative: 'rep',
    rep: 'rep',
  };
  return {
    id: u.id,
    name: u.name,
    phone: u.phone,
    email: u.email || '',
    role: roleMap[role] || 'customer',
    avatar: u.avatar,
    shopId: u.shopId,
    merchantId: roleMap[role] === 'merchant' ? u.shopId : undefined,
    isActive: u.status === 'ACTIVE',
    createdAt: u.createdAt,
  };
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const result = await apiClient.post<FastApiAuthResult>('/auth/login', data);
    return { user: mapUser(result.user), token: result.access_token, refreshToken: result.refresh_token };
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const result = await apiClient.post<FastApiAuthResult>('/auth/register', data);
    return { user: mapUser(result.user), token: result.access_token, refreshToken: result.refresh_token };
  },

  logout: () => apiClient.post<{ message: string }>('/auth/logout'),

  verifyPhone: (data: VerifyPhoneRequest) =>
    apiClient.post<{ message: string }>('/auth/verify-phone', data),

  resendCode: (phone: string) =>
    apiClient.post<{ message: string }>('/auth/resend-code', { phone }),

  forgotPassword: (data: ForgotPasswordRequest) =>
    apiClient.post<{ message: string }>('/auth/forgot-password', data),

  resetPassword: (data: ResetPasswordRequest) =>
    apiClient.post<{ message: string }>('/auth/reset-password', data),

  refreshToken: async (refreshToken: string): Promise<{ token: string; refreshToken: string }> => {
    const result = await apiClient.post<FastApiAuthResult>('/auth/refresh-token', { refresh_token: refreshToken });
    return { token: result.access_token, refreshToken: result.refresh_token };
  },

  getProfile: async (): Promise<User> => {
    const result = await apiClient.get<FastApiUser>('/auth/profile');
    return mapUser(result);
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const result = await apiClient.put<FastApiUser>('/auth/profile', data);
    return mapUser(result);
  },
};
