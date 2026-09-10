export class AppError extends Error {
  public code: string;
  public userMessage: string;

  constructor(message: string, code: string, userMessage: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.userMessage = userMessage;
  }
}

export const ErrorCodes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  NOT_FOUND: 'NOT_FOUND',
};
