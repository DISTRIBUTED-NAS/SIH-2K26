import { InspectionFormData } from '../../features/inspections/models/InspectionFormModels';
import { AIVerificationResult } from '../../features/inspections/models/AIVerificationModels';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  AppShell: undefined;
  InspectionDetails: { inspectionId: string };
  InspectionChecklist: { inspectionId: string };
  InspectionMeasurements: { inspectionId: string };
  InspectionReview: { inspectionId: string; aiVerificationResult?: AIVerificationResult };
  Camera: { inspectionId?: string; onPhotoCaptured?: (uri: string) => void };
  AIVerification: { photoUri: string; inspectionId?: string };
  RegisterInstrument: undefined;
  LMOAssistant: undefined;
};

export type AppTabParamList = {
  Dashboard: undefined;
  Inspections: undefined;
  RegisterInstrument: undefined;
  LMOAssistant: undefined;
  History: undefined;
  Profile: undefined;
};
