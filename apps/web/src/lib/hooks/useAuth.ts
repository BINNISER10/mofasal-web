'use client';
import { useAuthStore, UserRole, User, hydrateAuthFromStorage } from '@/lib/stores/authStore';
import { authApi } from '@/lib/api/auth';
import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getDemoUserFromToken } from '@/lib/demoAuth';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const hasRole = useAuthStore((s) => s.hasRole);
  const router = useRouter();
  const checked = useRef(false);

  const login = useCallback(async (phone: string, password: string) => {
    const store = useAuthStore.getState();
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
  }, []);

  const register = useCallback(
    async (data: {
      name: string;
      phone: string;
      email?: string;
      password: string;
      role: 'customer' | 'tailor' | 'merchant';
    }) => {
      const store = useAuthStore.getState();
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
    []
  );

  const logout = useCallback(() => {
    authApi.logout().catch(() => {});
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    useAuthStore.getState().logout();
    router.push('/login');
  }, [router]);

  const checkAuth = useCallback(async () => {
    hydrateAuthFromStorage();
    const token = localStorage.getItem('token');
    const store = useAuthStore.getState();

    if (!token) {
      store.setLoading(false);
      return;
    }

    const demoUser = getDemoUserFromToken(token);
    if (demoUser) {
      store.setUser(demoUser);
      store.setToken(token);
      return;
    }

    store.setLoading(true);
    try {
      const profile = await authApi.getProfile();
      store.setUser(profile);
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      store.logout();
    } finally {
      store.setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    hasRole,
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
