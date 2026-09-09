export type AIVerificationStatus = 
  | 'MATCH'
  | 'POSSIBLE_MATCH'
  | 'POSSIBLE_MISMATCH'
  | 'MISMATCH'
  | 'UNABLE_TO_COMPARE'
  | 'PENDING'
  | 'FAILED';

export interface AIVerificationResult {
  id: string;
  inspectionId: string;
  referencePhotoId?: string;
  officerPhotoId?: string;
  status: AIVerificationStatus;
  confidence?: number;
  findings?: string;
  processingStatus?: string;
  errorMessage?: string;
  createdAt?: string;
}
