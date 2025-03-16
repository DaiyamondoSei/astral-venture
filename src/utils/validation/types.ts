
/**
 * Validation system types
 */
import { 
  ValidationResult, 
  ValidationErrorDetail, 
  ValidationErrorCode,
  ErrorSeverity
} from '@/types/core/validation/types';
import { ValidationErrorCodes, ErrorSeverities } from '@/types/core/validation/constants';

// Re-export validation types
export type { ValidationResult, ValidationErrorDetail, ValidationErrorCode, ErrorSeverity };
export { ValidationErrorCodes, ErrorSeverities };

// Validator function type
export type Validator<T> = (value: unknown) => ValidationResult<T>;

// Constraint function type
export type Constraint<T> = (value: T) => ValidationResult<T>;

// Result mapper function type
export type ResultMapper<T, R> = (result: ValidationResult<T>) => ValidationResult<R>;

// Path mapper function type
export type PathMapper = (path: string) => string;

// Validation pipeline context
export interface ValidationContext {
  path: string;
  optional?: boolean;
}

// Validation options
export interface ValidationOptions {
  path?: string;
  stopOnFirst?: boolean;
}

// Validation error message getter
export type ErrorMessageGetter = (path: string) => string;

// Validation schema type
export interface ValidationSchema<T> {
  [key: string]: Validator<any> | ValidationSchema<any>;
}
