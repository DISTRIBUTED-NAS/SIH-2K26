import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('scaleguard_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('scaleguard_token'));
  const [loading, setLoading] = useState(true);

  // Restore authentication on startup
  useEffect(() => {
    const restoreAuth = async () => {
      const storedToken = localStorage.getItem('scaleguard_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        localStorage.setItem('scaleguard_user', JSON.stringify(userData));
      } catch (err) {
        console.warn('Session expired or invalid token on initial load:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    restoreAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    const { accessToken, user: authenticatedUser } = response;

    setToken(accessToken);
    setUser(authenticatedUser);

    localStorage.setItem('scaleguard_token', accessToken);
    localStorage.setItem('scaleguard_user', JSON.stringify(authenticatedUser));

    return authenticatedUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('scaleguard_token');
    localStorage.removeItem('scaleguard_user');
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
