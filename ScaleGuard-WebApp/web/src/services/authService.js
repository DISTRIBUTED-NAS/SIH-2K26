import api from './api';

export const authService = {
  // Register BUSINESS_OWNER
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Get current authenticated user
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Test endpoints for RBAC verification
  async testBusinessOwner() {
    const response = await api.get('/business-owner/test');
    return response.data;
  },

  async testAdmin() {
    const response = await api.get('/admin/test');
    return response.data;
  },

  async testOfficer() {
    const response = await api.get('/officer/test');
    return response.data;
  }
};
