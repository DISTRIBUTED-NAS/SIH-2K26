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
  recognizedRegistrationId?: string;
  referencePhotoId?: string;
  officerPhotoId?: string;
  status: AIVerificationStatus;
  confidence?: number;
  ocrConfidence?: number;
  visualScore?: number;
  featureScore?: number;
  labelScore?: number;
  finalScore?: number;
  decision?: 'VERIFIED' | 'MANUAL_REVIEW' | 'MISMATCH';
  ransacInliers?: number;
  keypointMatches?: number;
  findings?: string;
  processingStatus?: string;
  errorMessage?: string;
  createdAt?: string;
}

export interface RegisteredInstrument {
  id: string;
  registrationId: string;
  userId?: string;
  businessName?: string;
  instrumentName: string;
  instrumentModel?: string;
  capacity?: string;
  registeredImageUri: string;
  createdAt?: string;
}
