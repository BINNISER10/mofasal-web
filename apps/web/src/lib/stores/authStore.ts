import { create } from 'zustand';
import { getDemoUserFromToken } from '@/lib/demoAuth';

export type UserRole = 'admin' | 'tailor' | 'merchant' | 'customer' | 'rep';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  shopId?: string;
  merchantId?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
  hydrateFromStorage: () => void;
}

/** بعد mount فقط — يمنع تعارض SSR/hydration */
export function hydrateAuthFromStorage(): void {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('token');
  const user = getDemoUserFromToken(token);
  if (user) {
    useAuthStore.getState().setUser(user);
    useAuthStore.setState({ token });
  } else if (token) {
    useAuthStore.setState({ token, isLoading: true });
  } else {
    useAuthStore.setState({ isLoading: false });
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false, error: null }),
  setToken: (token) => {
    const demoUser = getDemoUserFromToken(token);
    if (demoUser) {
      set({ token, user: demoUser, isAuthenticated: true, isLoading: false });
    } else {
      set({ token });
    }
  },
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  logout: () =>
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    }),
  hasRole: (roles) => {
    const user = get().user;
    if (!user) return false;
    return roles.includes(user.role);
  },
  hydrateFromStorage: () => hydrateAuthFromStorage(),
}));
