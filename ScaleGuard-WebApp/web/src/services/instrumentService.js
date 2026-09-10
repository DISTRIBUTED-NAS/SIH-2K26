import api from './api';

export const INSTRUMENT_TYPES = [
  { value: 'DIGITAL_WEIGHING_SCALE', label: 'Digital Weighing Scale' },
  { value: 'MECHANICAL_WEIGHING_SCALE', label: 'Mechanical Weighing Scale' },
  { value: 'PLATFORM_SCALE', label: 'Platform Scale' },
  { value: 'ELECTRONIC_BALANCE', label: 'Electronic Balance' },
  { value: 'SPRING_BALANCE', label: 'Spring Balance' },
  { value: 'COUNTER_SCALE', label: 'Counter Scale' },
  { value: 'PRECISION_BALANCE', label: 'Precision Balance' },
  { value: 'OTHER', label: 'Other' },
];

export const CAPACITY_UNITS = [
  { value: 'MG', label: 'mg' },
  { value: 'G', label: 'g' },
  { value: 'KG', label: 'kg' },
  { value: 'TON', label: 'ton' },
];

export const ACCURACY_UNITS = [
  { value: 'MG', label: 'mg' },
  { value: 'G', label: 'g' },
  { value: 'KG', label: 'kg' },
];

export const getInstrumentTypeLabel = (type) => {
  const match = INSTRUMENT_TYPES.find((t) => t.value === type);
  return match ? match.label : type;
};

export const getCapacityUnitLabel = (unit) => {
  const match = CAPACITY_UNITS.find((u) => u.value === unit);
  return match ? match.label : unit;
};

export const getAccuracyUnitLabel = (unit) => {
  const match = ACCURACY_UNITS.find((u) => u.value === unit);
  return match ? match.label : unit;
};

export const instrumentService = {
  // Business Owner APIs
  createInstrument: async (instrumentData) => {
    const response = await api.post('/instruments', instrumentData);
    return response.data;
  },

  getMyInstruments: async (params = {}) => {
    const response = await api.get('/instruments', { params });
    return response.data;
  },

  getMyInstrumentById: async (id) => {
    const response = await api.get(`/instruments/${id}`);
    return response.data;
  },

  updateMyInstrument: async (id, instrumentData) => {
    const response = await api.put(`/instruments/${id}`, instrumentData);
    return response.data;
  },

  updateMyInstrumentStatus: async (id, status) => {
    const response = await api.patch(`/instruments/${id}/status`, { status });
    return response.data;
  },

  // Admin APIs
  getAllInstrumentsForAdmin: async (params = {}) => {
    const response = await api.get('/admin/instruments', { params });
    return response.data;
  },

  getInstrumentByIdForAdmin: async (id) => {
    const response = await api.get(`/admin/instruments/${id}`);
    return response.data;
  },
};
