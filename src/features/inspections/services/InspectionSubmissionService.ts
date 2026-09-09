import { InspectionSubmissionPayload } from '../models/OfficerDecisionModels';

export type SubmissionResult =
  | { success: false; reason: 'BACKEND_NOT_CONFIGURED' }
  | { success: false; reason: 'OFFLINE' }
  | { success: false; reason: 'ERROR'; message: string }
  | { success: true; submissionId: string };

/**
 * InspectionSubmissionService — abstraction layer for future backend submission.
 *
 * The mock implementation does NOT pretend the inspection reached a server.
 * When the real backend is available, replace the method body here without
 * touching any UI or navigation code.
 */
class InspectionSubmissionService {
  /**
   * Attempt to submit a completed inspection payload to the backend.
   *
   * Current behaviour: returns BACKEND_NOT_CONFIGURED because no backend
   * endpoint has been implemented yet. The caller should treat this as
   * "saved locally, pending synchronisation".
   */
  async submitInspection(
    _payload: InspectionSubmissionPayload,
    isOffline: boolean
  ): Promise<SubmissionResult> {
    if (isOffline) {
      return { success: false, reason: 'OFFLINE' };
    }

    // Backend endpoint not yet implemented.
    // Do NOT return success:true — that would be dishonest.
    return { success: false, reason: 'BACKEND_NOT_CONFIGURED' };
  }
}

export const inspectionSubmissionService = new InspectionSubmissionService();
