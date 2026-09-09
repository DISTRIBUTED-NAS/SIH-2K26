export type ChecklistStatus = 'NOT_CHECKED' | 'PASS' | 'FAIL';

export interface InspectionChecklistItem {
  id: string;
  label: string;
  status: ChecklistStatus;
}

export interface MeasurementDefinition {
  id: string;
  label: string;
  unit: string;
  required: boolean;
}

export interface MeasurementReading {
  id: string;
  label: string;
  value: number;
  unit: string;
  note?: string;
}

import { AIVerificationResult } from './AIVerificationModels';
import { OfficerDecision } from './OfficerDecisionModels';

export interface InspectionFormData {
  inspectionId: string;
  checklist: InspectionChecklistItem[];
  observations: string;
  remarks: string;
  photoUri?: string;
  referencePhotoUri?: string;
  measurements?: MeasurementReading[];
  aiResult?: AIVerificationResult;
  // Phase 10: Officer decision
  decision?: OfficerDecision;
  decisionRemarks?: string;
  completedAt?: string;
  localSyncStatus?: string;
}

// Helper to get generic checklist items since they are configurable/dynamic in the future
export const getDefaultChecklist = (): InspectionChecklistItem[] => [
  { id: 'CHK-001', label: 'Instrument identity verified', status: 'NOT_CHECKED' },
  { id: 'CHK-002', label: 'Physical condition checked', status: 'NOT_CHECKED' },
  { id: 'CHK-003', label: 'Display/indicator checked', status: 'NOT_CHECKED' },
  { id: 'CHK-004', label: 'Seals/security features checked', status: 'NOT_CHECKED' },
  { id: 'CHK-005', label: 'Required markings/labels checked', status: 'NOT_CHECKED' },
];

// Mock measurement definitions
export const getMockMeasurementDefinitions = (): MeasurementDefinition[] => [
  { id: 'reading-1', label: 'Test Reading 1', unit: 'kg', required: true },
  { id: 'reading-2', label: 'Test Reading 2', unit: 'kg', required: true },
  { id: 'reading-3', label: 'Test Reading 3', unit: 'g', required: false },
];
