import { AIVerificationResult } from '../models/AIVerificationModels';

export class AiVerificationService {
  /**
   * Mock implementation of the AI Verification service.
   * In the future, this will communicate with the backend AI service.
   */
  async verifyImages(
    referencePhotoUri: string,
    officerPhotoUri: string,
    inspectionId: string
  ): Promise<AIVerificationResult> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock response clearly indicating development state
    return {
      id: `ai-res-${Date.now()}`,
      inspectionId,
      referencePhotoId: referencePhotoUri, // using URI as ID for now
      officerPhotoId: officerPhotoUri,
      status: 'UNABLE_TO_COMPARE',
      confidence: 0,
      findings: 'AI service is not connected yet. This is a mock response.',
      processingStatus: 'COMPLETED',
      errorMessage: undefined,
      createdAt: new Date().toISOString(),
    };
  }
}

export const aiVerificationService = new AiVerificationService();
