import api from './api';

export const OFFICER_STATUSES = [
  { value: 'ACTIVE', label: 'Active', color: 'emerald' },
  { value: 'INACTIVE', label: 'Inactive', color: 'rose' },
];

export const officerService = {
  // Admin Endpoints
  createOfficer: async (officerData) => {
    const response = await api.post('/admin/officers', officerData);
    return response.data;
  },

  getOfficers: async (params = {}) => {
    const response = await api.get('/admin/officers', { params });
    return response.data;
  },

  getOfficerById: async (id) => {
    const response = await api.get(`/admin/officers/${id}`);
    return response.data;
  },

  updateOfficer: async (id, officerData) => {
    const response = await api.put(`/admin/officers/${id}`, officerData);
    return response.data;
  },

  updateOfficerStatus: async (id, status) => {
    const response = await api.patch(`/admin/officers/${id}/status`, { status });
    return response.data;
  },

  // Officer Portal Endpoints
  getOfficerProfile: async () => {
    const response = await api.get('/officer/profile');
    return response.data;
  },

  getAssignedApplications: async () => {
    const response = await api.get('/officer/verification-applications');
    return response.data;
  },

  getAssignedApplicationDetails: async (id) => {
    const response = await api.get(`/officer/verification-applications/${id}`);
    return response.data;
  },
};
