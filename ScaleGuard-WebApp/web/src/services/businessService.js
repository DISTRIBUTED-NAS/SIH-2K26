import api from './api';

export const businessService = {
  // Business Owner: Create business profile
  async createBusiness(data) {
    const response = await api.post('/businesses', data);
    return response.data;
  },

  // Business Owner: Get current authenticated user's business profile
  async getMyBusiness() {
    const response = await api.get('/businesses/me');
    return response.data;
  },

  // Business Owner: Update current authenticated user's business profile
  async updateMyBusiness(data) {
    const response = await api.put('/businesses/me', data);
    return response.data;
  },

  // Admin: Get all businesses
  async getAllBusinesses() {
    const response = await api.get('/admin/businesses');
    return response.data;
  },

  // Admin: Get business by ID
  async getBusinessById(id) {
    const response = await api.get(`/admin/businesses/${id}`);
    return response.data;
  }
};
