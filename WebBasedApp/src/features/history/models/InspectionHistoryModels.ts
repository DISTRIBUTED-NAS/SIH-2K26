import { OfficerDecision } from '../../inspections/models/OfficerDecisionModels';

/** A flat summary of a locally completed inspection, used in the History list. */
export interface InspectionHistoryItem {
  id: string;
  applicationId: string;
  businessName?: string;
  instrumentName: string;
  instrumentModel?: string;
  location?: string;
  scheduledDate: string;
  scheduledTime: string;
  decision?: OfficerDecision;
  decisionRemarks?: string;
  completedAt?: string;
  localStatus: string; // e.g. READY_FOR_SUBMISSION
  syncStatus?: string; // e.g. PENDING / SYNCED
}
