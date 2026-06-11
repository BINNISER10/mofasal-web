'use client';
import { useAuthStore, UserRole, User } from '@/lib/stores/authStore';
import { authApi } from '@/lib/api/auth';
import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const store = useAuthStore();
  const router = useRouter();

  const login = useCallback(
    async (phone: string, password: string) => {
      store.setLoading(true);
      store.setError(null);
      try {
        const response = await authApi.login({ phone, password });
        store.setUser(response.user);
        store.setToken(response.token);
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
        return response;
      } catch (err: any) {
        store.setError(err.message);
        throw err;
      } finally {
        store.setLoading(false);
      }
    },
    [store]
  );

  const register = useCallback(
    async (data: {
      name: string;
      phone: string;
      email?: string;
      password: string;
      role: 'customer' | 'tailor' | 'merchant';
    }) => {
      store.setLoading(true);
      store.setError(null);
      try {
        const response = await authApi.register(data);
        store.setUser(response.user);
        store.setToken(response.token);
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
        return response;
      } catch (err: any) {
        store.setError(err.message);
        throw err;
      } finally {
        store.setLoading(false);
      }
    },
    [store]
  );

  const logout = useCallback(() => {
    authApi.logout().catch(() => {});
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    store.logout();
    router.push('/login');
  }, [store, router]);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      store.setToken(token);
      try {
        const user = await authApi.getProfile();
        store.setUser(user);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        store.logout();
      }
    }
  }, [store]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    login,
    register,
    logout,
    hasRole: store.hasRole,
  };
}

export function useRequireAuth(roles?: UserRole[]) {
  const { isAuthenticated, user, isLoading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
    if (!isLoading && roles && user && !hasRole(roles)) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, user, roles, hasRole, router]);

  return { isAuthenticated, user, isLoading };
}
