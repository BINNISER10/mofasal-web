import apiClient, { setAuthToken, setRefreshToken } from './client';
import { ENDPOINTS } from './config';

// ─── Request Schemas (Express contract) ───────────────────────────────────────

export interface LoginRequest {
  email?: string;
  phone?: string;
  password: string;
}

export interface RegisterRequest {
  name_ar: string;
  email?: string;
  phone: string;
  password: string;
  role: 'CUSTOMER' | 'TAILOR' | 'TAILOR_SHOP' | 'MERCHANT';
}

// ─── Normalized Response Schemas (consumed by screens) ─────────────────────────

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

// ─── Express raw shapes ────────────────────────────────────────────────────────

interface ExpressUser {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
  avatar?: string;
}

interface ExpressAuthData {
  user: ExpressUser;
  // Express generateTokens يُرجع snake_case
  access_token: string;
  refresh_token: string;
  expires_in?: string | number;
}

// تحويل مستخدم Express إلى UserProfile الذي تتوقعه الشاشات
function mapUser(u: ExpressUser): UserProfile {
  return {
    id: u.id,
    name_ar: u.name || '',
    email: u.email || '',
    phone: u.phone || '',
    role: u.role || 'CUSTOMER',
    is_active: u.status ? u.status === 'ACTIVE' : true,
    avatar_url: u.avatar,
  };
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    // client.ts يفكّ غلاف {success,data} تلقائياً
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, data);
    const d = response.data as ExpressAuthData;
    await setAuthToken(d.access_token);
    await setRefreshToken(d.refresh_token);
    return {
      access_token: d.access_token,
      refresh_token: d.refresh_token,
      user_id: d.user?.id,
      role: d.user?.role || 'CUSTOMER',
    };
  },

  register: async (data: RegisterRequest): Promise<TokenResponse> => {
    // Express يتوقّع الحقل name (لا name_ar)
    const payload = {
      name: data.name_ar,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: data.role,
    };
    const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, payload);
    const d = response.data as ExpressAuthData;
    await setAuthToken(d.access_token);
    await setRefreshToken(d.refresh_token);
    return {
      access_token: d.access_token,
      refresh_token: d.refresh_token,
      user_id: d.user?.id,
      role: d.user?.role || 'CUSTOMER',
    };
  },

  getMe: async (): Promise<UserProfile> => {
    const response = await apiClient.get(ENDPOINTS.AUTH.ME);
    // قد تُرجع الاستجابة المستخدم مباشرة أو ضمن { user }
    const raw = response.data as any;
    const user: ExpressUser = raw?.user ?? raw;
    return mapUser(user);
  },

  // تسجيل دخول بالهاتف (مؤقتاً عبر كلمة مرور؛ OTP الكامل في المرحلة 2)
  loginWithPhone: async (phone: string, password = 'otp_placeholder'): Promise<TokenResponse> => {
    return authApi.login({ phone, password });
  },
};
