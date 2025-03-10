
import { toast } from 'sonner';
import type { DatabaseError, PostgrestError } from '@supabase/supabase-js';

export type ValidationErrorType = 'auth' | 'data' | 'network' | 'validation' | 'unknown';

export interface ValidationErrorMetadata {
  code?: string;
  details?: string;
  field?: string;
  suggestion?: string;
}

export class ValidationError extends Error {
  type: ValidationErrorType;
  metadata: ValidationErrorMetadata;

  constructor(message: string, type: ValidationErrorType, metadata: ValidationErrorMetadata = {}) {
    super(message);
    this.name = 'ValidationError';
    this.type = type;
    this.metadata = metadata;
  }
}

export function handleDatabaseError(error: DatabaseError | PostgrestError): ValidationError {
  const type = error.code?.startsWith('22') ? 'validation' : 'data';
  return new ValidationError(error.message, type, {
    code: error.code,
    details: error.details,
  });
}

export function handleNetworkError(error: Error): ValidationError {
  return new ValidationError(
    'Network request failed',
    'network',
    { details: error.message }
  );
}

export function showErrorToast(error: Error | ValidationError | unknown) {
  if (error instanceof ValidationError) {
    toast.error(error.message, {
      description: error.metadata.details,
    });
  } else {
    toast.error('An unexpected error occurred', {
      description: error instanceof Error ? error.message : 'Please try again',
    });
  }
}
