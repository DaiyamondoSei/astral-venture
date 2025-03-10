
/**
 * Custom validation error type
 */
export class ValidationError extends Error {
  code?: string;
  path?: string;
  details?: Record<string, unknown>;

  constructor(message: string, code?: string, path?: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    this.path = path;
    this.details = details;
  }
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}
