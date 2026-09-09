import { InspectionChecklistItem, MeasurementReading } from './InspectionFormModels';
import { AIVerificationResult } from './AIVerificationModels';

// Officer's explicit final decision outcomes
export type OfficerDecision = 'VERIFIED' | 'REJECTED' | 'NEEDS_FOLLOW_UP';

export interface InspectionDecisionRecord {
  inspectionId: string;
  decision: OfficerDecision;
  decisionRemarks?: string;
  completedAt: string; // ISO timestamp
}

// Strongly typed payload for future backend submission
export interface InspectionSubmissionPayload {
  // Identity
  inspectionId: string;
  applicationId: string;
  // Officer
  officerId: string;
  // Assignment
  scheduledDate: string;
  scheduledTime: string;
  assignedOfficerId?: string;
  // Business / instrument
  businessName?: string;
  instrumentName: string;
  instrumentModel?: string;
  location?: string;
  // Field data
  checklist: InspectionChecklistItem[];
  measurements: MeasurementReading[];
  observations: string;
  remarks: string;
  // Evidence  (URIs only — no binary blobs)
  officerPhotoUri?: string;
  referencePhotoUri?: string;
  // AI (optional)
  aiVerificationResult?: Pick<
    AIVerificationResult,
    'status' | 'confidence' | 'findings' | 'processingStatus'
  >;
  // Decision
  decision: OfficerDecision;
  decisionRemarks?: string;
  completedAt: string;
  // Sync metadata
  localUpdatedAt: string;
  clientId: string; // device-generated stable ID to prevent duplicates on backend
}
