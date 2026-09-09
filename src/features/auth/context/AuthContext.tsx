import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, LoginCredentials } from '../models/AuthModels';
import { authService } from '../services/authService';
import { LocalStorage } from '../../../core/storage/localStorage';
import { STORAGE_KEYS } from '../../../core/constants';
import { apiClient } from '../../../core/network/apiClient';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Configure Axios interceptor for tokens and global 401 handling
  useEffect(() => {
    const requestInterceptor = apiClient.interceptors.request.use((config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
      apiClient.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      
      // Role enforcement
      if (response.user.role !== 'LMO_OFFICER') {
        throw new Error('Your account is not authorized for the LMO Officer application.');
      }

      setToken(response.accessToken);
      setUser(response.user);
      
      await LocalStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.accessToken);
      await LocalStorage.setObject(STORAGE_KEYS.AUTH_USER, response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      setToken(null);
      setUser(null);
      await LocalStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await LocalStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    } finally {
      setIsLoading(false);
    }
  };

  const restoreSession = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const storedToken = await LocalStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!storedToken) {
        return false;
      }

      // Re-validate token via service
      const restoredUser = await authService.restoreSession(storedToken);
      
      if (restoredUser.role !== 'LMO_OFFICER') {
        await logout();
        return false;
      }

      setToken(storedToken);
      setUser(restoredUser);
      // Ensure local storage is updated in case user object changed
      await LocalStorage.setObject(STORAGE_KEYS.AUTH_USER, restoredUser);
      return true;
    } catch (error) {
      console.warn('Session restoration failed:', error);
      await logout(); // Clear invalid state
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        restoreSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
