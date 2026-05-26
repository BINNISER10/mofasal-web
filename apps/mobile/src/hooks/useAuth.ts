import { useCallback } from 'react';
import { useAuthContext } from '../services/auth/AuthContext';

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  } = useAuthContext();

  const handleLogin = useCallback(
    async (phone: string, password: string) => {
      await login(phone, password);
    },
    [login],
  );

  const handleRegister = useCallback(
    async (data: {
      fullName: string;
      phone: string;
      password: string;
      role: 'customer' | 'tailor_shop' | 'fabric_merchant';
    }) => {
      await register(data);
    },
    [register],
  );

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateUser,
  };
};

export default useAuth;
