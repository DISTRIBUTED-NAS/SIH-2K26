import api from './api';

export const MEASUREMENT_TEST_STATUSES = [
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
];

export const getMeasurementTestStatusLabel = (status) => {
  const match = MEASUREMENT_TEST_STATUSES.find((s) => s.value === status);
  return match ? match.label : status || 'Unknown';
};

export const measurementTestService = {
  // Officer: Start measurement test session
  startMeasurementTest: async (inspectionId) => {
    const response = await api.post(`/officer/inspections/${inspectionId}/measurement-tests/start`);
    return response.data;
  },

  // Officer: Get measurement test session for inspection
  getMeasurementTestByInspectionId: async (inspectionId) => {
    const response = await api.get(`/officer/inspections/${inspectionId}/measurement-tests`);
    return response.data;
  },

  // Officer: Add test record
  addTestRecord: async (sessionId, recordData) => {
    const response = await api.post(`/officer/measurement-tests/${sessionId}/records`, recordData);
    return response.data;
  },

  // Officer: Update test record
  updateTestRecord: async (recordId, recordData) => {
    const response = await api.patch(`/officer/measurement-tests/records/${recordId}`, recordData);
    return response.data;
  },

  // Officer: Delete test record
  deleteTestRecord: async (recordId) => {
    const response = await api.delete(`/officer/measurement-tests/records/${recordId}`);
    return response.data;
  },

  // Officer: Update overall remarks
  updateOverallRemarks: async (sessionId, overallRemarks) => {
    const response = await api.patch(`/officer/measurement-tests/${sessionId}/remarks`, { overallRemarks });
    return response.data;
  },

  // Officer: Complete measurement testing
  completeMeasurementTest: async (sessionId) => {
    const response = await api.post(`/officer/measurement-tests/${sessionId}/complete`);
    return response.data;
  },

  // Admin: Get measurement test results (read-only)
  getMeasurementTestForAdmin: async (inspectionId) => {
    const response = await api.get(`/admin/inspections/${inspectionId}/measurement-tests`);
    return response.data;
  },
};

export default measurementTestService;
