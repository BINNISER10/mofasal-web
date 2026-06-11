import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import EncryptedStorage from 'react-native-encrypted-storage';
import { authApi, UserProfile } from '../api/auth';
import { clearTokens, setAuthToken, setRefreshToken } from '../api/client';
import apiClient from '../api/client';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, _unused?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: UserProfile) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await EncryptedStorage.getItem('auth_token');
      const storedUser = await EncryptedStorage.getItem('user_data');
      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          // Fetch from API
          const profile = await authApi.getMe();
          setUser(profile);
          await EncryptedStorage.setItem('user_data', JSON.stringify(profile));
        }
      }
    } catch {
      // Token expired or no stored auth — clear everything
      await clearTokens();
      await EncryptedStorage.removeItem('user_data');
    } finally {
      setIsLoading(false);
    }
  };

  // Called after OTP verify — tokens already stored by OTPScreen
  const login = useCallback(async (_phone: string, _unused?: string) => {
    try {
      const profile = await authApi.getMe();
      setUser(profile);
      const tok = await EncryptedStorage.getItem('auth_token');
      setToken(tok);
      await EncryptedStorage.setItem('user_data', JSON.stringify(profile));
    } catch {
      // getMe failed — store minimal user from phone
      const minimal: UserProfile = {
        id: '', name_ar: 'عميل', email: '', phone: _phone,
        role: 'CUSTOMER', is_active: true,
      };
      setUser(minimal);
      const tok = await EncryptedStorage.getItem('auth_token');
      setToken(tok);
    }
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    await clearTokens();
    await EncryptedStorage.removeItem('user_data');
  }, []);

  const updateUser = useCallback((updatedUser: UserProfile) => {
    setUser(updatedUser);
    EncryptedStorage.setItem('user_data', JSON.stringify(updatedUser));
  }, []);

  const refreshUser = useCallback(async () => {
    const profile = await authApi.getMe();
    setUser(profile);
    await EncryptedStorage.setItem('user_data', JSON.stringify(profile));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
