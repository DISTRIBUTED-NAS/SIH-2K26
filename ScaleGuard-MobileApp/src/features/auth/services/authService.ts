import { apiClient } from '../../../core/network/apiClient';
import { AuthUser, AuthResponse, LoginCredentials } from '../models/AuthModels';
import { AppError, ErrorCodes } from '../../../core/errors/AppError';
import { IS_DEVELOPMENT } from '../../../core/config';

// Mock mode toggle
const USE_MOCK_AUTH = IS_DEVELOPMENT; // Default to true in dev for Phase 2

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    if (USE_MOCK_AUTH) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (
            (credentials.email === 'officer@scaleguard.com' || credentials.email === 'officer@lmo.gov.in') &&
            (credentials.password === 'password' || credentials.password === 'Password@123')
          ) {
            resolve({
              accessToken: 'mock_jwt_token_12345',
              user: {
                id: 'OFFICER001',
                fullName: 'Jane Doe',
                email: credentials.email,
                role: 'LMO_OFFICER',
              },
            });
          } else if (credentials.email === 'admin@scaleguard.com' || credentials.email === 'admin@lmo.gov.in') {
            resolve({
              accessToken: 'mock_jwt_token_admin',
              user: {
                id: 'ADMIN001',
                fullName: 'System Admin',
                email: 'admin@scaleguard.com',
                role: 'ADMIN',
              },
            });
          } else {
            reject(new AppError('Invalid email or password.', ErrorCodes.UNAUTHORIZED, 'Invalid email or password.'));
          }
        }, 1500); // Simulate network latency
      });
    }

    try {
      // Future Real API call
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      // Basic translation of Axios error to AppError
      if (error.response?.status === 401) {
        throw new AppError('Unauthorized', ErrorCodes.UNAUTHORIZED, 'Invalid email or password.');
      }
      throw new AppError('Network Error', ErrorCodes.NETWORK_ERROR, 'Unable to connect to the server. Please check your internet connection.');
    }
  },

  restoreSession: async (token: string): Promise<AuthUser> => {
    if (USE_MOCK_AUTH) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (token === 'mock_jwt_token_12345') {
            resolve({
              id: 'OFFICER001',
              fullName: 'Jane Doe',
              email: 'officer@scaleguard.com',
              role: 'LMO_OFFICER',
            });
          } else {
            reject(new AppError('Invalid token', ErrorCodes.UNAUTHORIZED, 'Session expired.'));
          }
        }, 500);
      });
    }

    try {
      // Future Real API call to validate token and get user
      // Token is automatically injected by apiClient interceptor if setup correctly
      const response = await apiClient.get<AuthUser>('/auth/me');
      return response.data;
    } catch (error) {
      throw new AppError('Session Invalid', ErrorCodes.UNAUTHORIZED, 'Your session has expired. Please log in again.');
    }
  }
};
