import apiClient, { setAuthToken, setRefreshToken } from './client';
import { ENDPOINTS } from './config';

// ─── FastAPI Request Schemas ──────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name_ar: string;
  email: string;
  phone: string;
  password: string;
  role: 'CUSTOMER' | 'SHOP_OWNER' | 'TAILOR' | 'ADMIN';
}

// ─── FastAPI Response Schemas ─────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  user_id: string;
  role: string;
}

export interface UserProfile {
  id: string;
  name_ar: string;
  email: string;
  phone: string;
  role: string;
  is_active: boolean;
  avatar_url?: string;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, data);
    const token = response.data as TokenResponse;
    await setAuthToken(token.access_token);
    await setRefreshToken(token.refresh_token);
    return token;
  },

  register: async (data: RegisterRequest): Promise<TokenResponse> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, data);
    const token = response.data as TokenResponse;
    await setAuthToken(token.access_token);
    await setRefreshToken(token.refresh_token);
    return token;
  },

  getMe: async (): Promise<UserProfile> => {
    const response = await apiClient.get(ENDPOINTS.AUTH.ME);
    return response.data as UserProfile;
  },

  // Phone-based OTP login: phone → email mapping (for future SMS integration)
  loginWithPhone: async (phone: string): Promise<TokenResponse> => {
    // Converts +966XXXXXXXXX → email format for API compatibility
    const email = `${phone.replace('+', '')}@mofasal.app`;
    return authApi.login({ email, password: 'otp_placeholder' });
  },
};
