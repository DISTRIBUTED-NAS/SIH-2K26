import api from './api';

export const APPLICATION_TYPES = [
  { value: 'INITIAL_VERIFICATION', label: 'Initial Verification', description: 'For newly acquired or installed instruments' },
  { value: 'PERIODIC_VERIFICATION', label: 'Periodic Verification', description: 'Mandatory annual or cyclical verification' },
  { value: 'RE_VERIFICATION', label: 'Re-Verification', description: 'Following repair, re-installation, or seal breakage' },
];

export const APPLICATION_STATUSES = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'OFFICER_ASSIGNED', label: 'Officer Assigned' },
  { value: 'INSPECTION_IN_PROGRESS', label: 'Inspection In Progress' },
  { value: 'INSPECTION_COMPLETED', label: 'Inspection Completed' },
];

export const getApplicationTypeLabel = (type) => {
  const match = APPLICATION_TYPES.find((t) => t.value === type);
  return match ? match.label : type;
};

export const getApplicationStatusLabel = (status) => {
  const match = APPLICATION_STATUSES.find((s) => s.value === status);
  return match ? match.label : status;
};

export const verificationApplicationService = {
  // Business Owner APIs
  createApplication: async (applicationData) => {
    const response = await api.post('/verification-applications', applicationData);
    return response.data;
  },

  getMyApplications: async (params = {}) => {
    const response = await api.get('/verification-applications', { params });
    return response.data;
  },

  getMyApplicationById: async (id) => {
    const response = await api.get(`/verification-applications/${id}`);
    return response.data;
  },

  updateDraftApplication: async (id, applicationData) => {
    const response = await api.put(`/verification-applications/${id}`, applicationData);
    return response.data;
  },

  submitApplication: async (id) => {
    const response = await api.patch(`/verification-applications/${id}/submit`);
    return response.data;
  },

  deleteDraftApplication: async (id) => {
    const response = await api.delete(`/verification-applications/${id}`);
    return response.data;
  },

  // Admin APIs
  getAllApplicationsForAdmin: async (params = {}) => {
    const response = await api.get('/admin/verification-applications', { params });
    return response.data;
  },

  getApplicationByIdForAdmin: async (id) => {
    const response = await api.get(`/admin/verification-applications/${id}`);
    return response.data;
  },
};
