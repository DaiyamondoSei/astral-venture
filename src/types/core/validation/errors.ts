
/**
 * Validation error types and utilities
 */

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly field?: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export interface ValidationErrorDetail {
  message: string;
  code?: string;
  field?: string;
  value?: unknown;
  details?: unknown;
}

export enum ValidationErrorCode {
  INVALID_TYPE = 'INVALID_TYPE',
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  OUT_OF_RANGE = 'OUT_OF_RANGE',
  CUSTOM_VALIDATION = 'CUSTOM_VALIDATION'
}
