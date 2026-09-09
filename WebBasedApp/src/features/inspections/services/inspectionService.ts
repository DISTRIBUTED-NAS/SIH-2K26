import { InspectionSummary, DashboardSummary } from '../models/InspectionModels';
import { IS_DEVELOPMENT } from '../../../core/config';
import { apiClient } from '../../../core/network/apiClient';
import { AppError, ErrorCodes } from '../../../core/errors/AppError';

// Mock data configuration
const USE_MOCK_DATA = IS_DEVELOPMENT;

const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

const MOCK_INSPECTIONS: InspectionSummary[] = [
  // TODAY
  {
    id: 'INSP-2023-001',
    applicationId: 'SC-1024',
    businessName: 'Ravi Traders',
    scheduledDate: today,
    scheduledTime: '09:30 AM',
    instrumentName: 'Digital Weighing Scale',
    instrumentModel: 'CAS ER Plus',
    location: 'Guntur, Main Market',
    status: 'COMPLETED',
    assignedOfficerId: 'OFFICER001',
    notes: 'Standard annual verification.',
  },
  {
    id: 'INSP-2023-002',
    applicationId: 'SC-1025',
    businessName: 'Sri Balaji Industries',
    scheduledDate: today,
    scheduledTime: '11:00 AM',
    instrumentName: 'Platform Scale',
    instrumentModel: 'Essae DS-852',
    location: 'Guntur, Industrial Area',
    status: 'IN_PROGRESS',
    assignedOfficerId: 'OFFICER001',
  },
  {
    id: 'INSP-2023-003',
    applicationId: 'SC-1026',
    businessName: 'Tenali Mart',
    scheduledDate: today,
    scheduledTime: '01:30 PM',
    instrumentName: 'Electronic Scale',
    location: 'Tenali, Station Road',
    status: 'PENDING',
    assignedOfficerId: 'OFFICER001',
  },
  {
    id: 'INSP-2023-004',
    applicationId: 'SC-1027',
    businessName: 'Highway Fuel Station',
    scheduledDate: today,
    scheduledTime: '03:00 PM',
    instrumentName: 'Fuel Dispenser',
    instrumentModel: 'Gilbarco Veeder-Root',
    location: 'Tenali, Highway',
    status: 'PENDING',
    assignedOfficerId: 'OFFICER001',
    notes: 'Requires dual-nozzle checking.',
  },
  // UPCOMING
  {
    id: 'INSP-2023-005',
    applicationId: 'SC-1028',
    businessName: 'Metro Supermarket',
    scheduledDate: tomorrow,
    scheduledTime: '10:00 AM',
    instrumentName: 'Counter Scale',
    location: 'Vijayawada',
    status: 'PENDING',
    assignedOfficerId: 'OFFICER001',
  },
  // PAST
  {
    id: 'INSP-2023-000',
    applicationId: 'SC-1023',
    businessName: 'Old Town Jewelers',
    scheduledDate: yesterday,
    scheduledTime: '11:00 AM',
    instrumentName: 'Precision Balance',
    location: 'Guntur, Jeweler Street',
    status: 'REJECTED',
    assignedOfficerId: 'OFFICER001',
    notes: 'Calibration seal broken.',
  },
];

export const inspectionService = {
  getTodaySummary: async (): Promise<DashboardSummary> => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const todays = MOCK_INSPECTIONS.filter((i) => i.scheduledDate === today);
          resolve({
            assigned: todays.length,
            pending: todays.filter(i => i.status === 'PENDING').length,
            inProgress: todays.filter(i => i.status === 'IN_PROGRESS').length,
            completed: todays.filter(i => i.status === 'COMPLETED').length,
          });
        }, 800);
      });
    }

    try {
      const response = await apiClient.get<DashboardSummary>('/officer/dashboard');
      return response.data;
    } catch (error) {
      throw new AppError('Failed to fetch summary', ErrorCodes.NETWORK_ERROR, 'Unable to load dashboard summary.');
    }
  },

  getTodayInspections: async (): Promise<InspectionSummary[]> => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(MOCK_INSPECTIONS.filter((i) => i.scheduledDate === today));
        }, 1200);
      });
    }

    try {
      const response = await apiClient.get<InspectionSummary[]>('/officer/inspections/today');
      return response.data;
    } catch (error) {
      throw new AppError('Failed to fetch inspections', ErrorCodes.NETWORK_ERROR, 'Unable to load today\'s inspections.');
    }
  },

  getAssignedInspections: async (filter: 'TODAY' | 'UPCOMING' | 'PAST'): Promise<InspectionSummary[]> => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          let filtered = MOCK_INSPECTIONS;
          if (filter === 'TODAY') {
            filtered = MOCK_INSPECTIONS.filter(i => i.scheduledDate === today);
          } else if (filter === 'UPCOMING') {
            filtered = MOCK_INSPECTIONS.filter(i => i.scheduledDate > today);
          } else if (filter === 'PAST') {
            filtered = MOCK_INSPECTIONS.filter(i => i.scheduledDate < today);
          }
          resolve(filtered);
        }, 1000);
      });
    }

    try {
      const response = await apiClient.get<InspectionSummary[]>(`/officer/inspections?filter=${filter}`);
      return response.data;
    } catch (error) {
      throw new AppError('Failed to fetch inspections', ErrorCodes.NETWORK_ERROR, 'Unable to load assigned inspections.');
    }
  },

  getInspectionById: async (id: string): Promise<InspectionSummary> => {
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const inspection = MOCK_INSPECTIONS.find((i) => i.id === id);
          if (inspection) {
            resolve(inspection);
          } else {
            reject(new AppError('Not Found', ErrorCodes.NOT_FOUND, 'Inspection not found.'));
          }
        }, 800);
      });
    }

    try {
      const response = await apiClient.get<InspectionSummary>(`/officer/inspections/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new AppError('Not Found', ErrorCodes.NOT_FOUND, 'Inspection not found.');
      }
      throw new AppError('Failed to fetch inspection details', ErrorCodes.NETWORK_ERROR, 'Unable to load details.');
    }
  }
};
