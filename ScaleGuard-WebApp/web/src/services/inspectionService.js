import api from './api';

export const INSPECTION_STATUSES = [
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const getInspectionStatusLabel = (status) => {
  const match = INSPECTION_STATUSES.find((s) => s.value === status);
  return match ? match.label : status || 'Unknown';
};

export const inspectionService = {
  // --- Officer Endpoints ---
  scheduleInspection: async (data) => {
    // If passed applicationId separately or in object
    const appId = data.applicationId;
    const body = {
      scheduledAt: data.scheduledAt,
      location: data.location,
      notes: data.notes,
    };
    const response = await api.post(`/officer/verification-applications/${appId}/inspection`, body);
    return response.data;
  },

  createInspection: async (applicationId, data) => {
    const response = await api.post(`/officer/verification-applications/${applicationId}/inspection`, data);
    return response.data;
  },

  getMyInspections: async (params = {}) => {
    const cleanParams = { ...params };
    if (cleanParams.startDate) {
      cleanParams.fromDate = cleanParams.startDate;
      delete cleanParams.startDate;
    }
    if (cleanParams.endDate) {
      cleanParams.toDate = cleanParams.endDate;
      delete cleanParams.endDate;
    }
    const response = await api.get('/officer/inspections', { params: cleanParams });
    return response.data;
  },

  getInspectionById: async (id) => {
    const response = await api.get(`/officer/inspections/${id}`);
    return response.data;
  },

  getMyInspectionDetails: async (id) => {
    const response = await api.get(`/officer/inspections/${id}`);
    return response.data;
  },

  startInspection: async (id) => {
    const response = await api.post(`/officer/inspections/${id}/start`);
    return response.data;
  },

  updateInspectionNotes: async (id, notesOrBody) => {
    const body = typeof notesOrBody === 'string' ? { notes: notesOrBody } : notesOrBody;
    const response = await api.patch(`/officer/inspections/${id}/notes`, body);
    return response.data;
  },

  completeInspection: async (id) => {
    const response = await api.post(`/officer/inspections/${id}/complete`);
    return response.data;
  },

  cancelInspection: async (id, reasonOrBody) => {
    const reasonText = typeof reasonOrBody === 'string'
      ? reasonOrBody
      : (reasonOrBody.reason || reasonOrBody.cancellationReason);
    const body = {
      reason: reasonText,
      cancellationReason: reasonText,
    };
    const response = await api.post(`/officer/inspections/${id}/cancel`, body);
    return response.data;
  },

  // --- Admin Endpoints ---
  getAllInspectionsForAdmin: async (params = {}) => {
    const cleanParams = { ...params };
    if (cleanParams.startDate) {
      cleanParams.fromDate = cleanParams.startDate;
      delete cleanParams.startDate;
    }
    if (cleanParams.endDate) {
      cleanParams.toDate = cleanParams.endDate;
      delete cleanParams.endDate;
    }
    const response = await api.get('/admin/inspections', { params: cleanParams });
    return response.data;
  },

  getAllInspections: async (params = {}) => {
    const cleanParams = { ...params };
    if (cleanParams.startDate) {
      cleanParams.fromDate = cleanParams.startDate;
      delete cleanParams.startDate;
    }
    if (cleanParams.endDate) {
      cleanParams.toDate = cleanParams.endDate;
      delete cleanParams.endDate;
    }
    const response = await api.get('/admin/inspections', { params: cleanParams });
    return response.data;
  },

  getInspectionByIdForAdmin: async (id) => {
    const response = await api.get(`/admin/inspections/${id}`);
    return response.data;
  },

  getAdminInspectionDetails: async (id) => {
    const response = await api.get(`/admin/inspections/${id}`);
    return response.data;
  },
};
