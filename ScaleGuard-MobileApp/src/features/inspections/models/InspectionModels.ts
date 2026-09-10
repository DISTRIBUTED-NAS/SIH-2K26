export type InspectionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FLAGGED' | 'REJECTED';

export interface InspectionSummary {
  id: string;
  applicationId: string;
  businessName?: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm string depending on backend
  instrumentName: string;
  instrumentModel?: string;
  location: string;
  status: InspectionStatus;
  assignedOfficerId?: string;
  notes?: string;
}

export interface DashboardSummary {
  assigned: number;
  pending: number;
  inProgress: number;
  completed: number;
}
