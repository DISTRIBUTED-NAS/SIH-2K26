import { InspectionFormData } from '../../features/inspections/models/InspectionFormModels';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  AppShell: undefined;
  InspectionDetails: { inspectionId: string };
  InspectionChecklist: { inspectionId: string };
  InspectionMeasurements: { inspectionId: string };
  InspectionReview: { inspectionId: string };
  Camera: { inspectionId: string };
  AIVerification: { photoUri: string };
};

export type AppTabParamList = {
  Dashboard: undefined;
  Inspections: undefined;
  History: undefined;
  Profile: undefined;
};
