export interface Officer {
  id: string;
  name: string;
  badgeNumber: string;
  region: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Instrument {
  id: string;
  type: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  capacity?: string;
}

export interface Inspection {
  inspectionId: string;
  applicationId: string;
  officerId: string;
  instrumentId: string;
  scheduledDate: string;
  scheduledTime: string;
  location: Location;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  businessName: string;
}

export interface InspectionPhoto {
  id: string;
  inspectionId: string;
  uri: string;
  timestamp: string;
  type: 'INSTRUMENT' | 'WEIGHTS' | 'READING' | 'OTHER';
}

export interface AIResult {
  isVerified: boolean;
  confidence: number;
  remarks: string;
  extractedText?: string;
}

export interface InspectionResult {
  inspectionId: string;
  decision: 'APPROVED' | 'REJECTED' | 'RE_INSPECTION_REQUIRED';
  remarks: string;
  completedAt: string;
}
