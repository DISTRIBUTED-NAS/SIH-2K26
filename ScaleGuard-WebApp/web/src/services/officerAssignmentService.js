import api from './api';

export const officerAssignmentService = {
  assignOfficer: async (applicationId, officerId) => {
    const response = await api.post(`/admin/verification-applications/${applicationId}/assign-officer`, { officerId });
    return response.data;
  },

  reassignOfficer: async (applicationId, officerId) => {
    const response = await api.put(`/admin/verification-applications/${applicationId}/assign-officer`, { officerId });
    return response.data;
  },
};
