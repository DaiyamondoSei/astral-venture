
/**
 * Validation system types
 */

// Validation error severity levels
export type ErrorSeverity = 'error' | 'warning' | 'info';

// Validation error codes
export type ValidationErrorCode = 
  | 'REQUIRED' 
  | 'TYPE_ERROR' 
  | 'FORMAT_ERROR' 
  | 'MIN_LENGTH_ERROR' 
  | 'MAX_LENGTH_ERROR' 
  | 'MIN_VALUE_ERROR' 
  | 'MAX_VALUE_ERROR' 
  | 'PATTERN_ERROR'
  | 'CONSTRAINT_ERROR'
  | 'FIELD_REQUIRED'
  | 'UNKNOWN_ERROR'
  | 'VALIDATION_FAILED'
  | 'SCHEMA_ERROR'
  | 'NOT_INTEGER'
  | 'MIN_ITEMS'
  | 'MAX_ITEMS'
  | 'MIN_DATE'
  | 'MAX_DATE'
  | 'INVALID_ENUM'
  | 'INVALID_FORMAT'
  | 'MISSING_USER_ID'
  | 'MISSING_ACHIEVEMENT_ID'
  | 'FETCH_ACHIEVEMENTS_ERROR'
  | 'FETCH_USER_ACHIEVEMENTS_ERROR'
  | 'UPDATE_ACHIEVEMENT_PROGRESS_ERROR'
  | 'CHECK_ACHIEVEMENT_ERROR'
  | 'AWARD_ACHIEVEMENT_ERROR'
  | 'GET_ACHIEVEMENT_PROGRESS_ERROR';

// Validation field options for constraining values
export interface ValidationFieldOptions {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

// Validation field type options
export type ValidationFieldType = 
  | 'string' 
  | 'number' 
  | 'boolean' 
  | 'object' 
  | 'array' 
  | 'date' 
  | 'email'
  | 'url'
  | 'uuid'
  | 'integer'
  | 'float'
  | 'enum';

// Validation schema field definition
export interface ValidationSchemaField {
  type: ValidationFieldType;
  options?: ValidationFieldOptions;
  items?: ValidationSchemaField; // For array types
  properties?: Record<string, ValidationSchemaField>; // For object types
  enum?: string[] | number[]; // For enum types
}

// Validation schema definition
export type ValidationSchema = Record<string, ValidationSchemaField>;

// Additional validation context interface for enhanced validations
export interface ValidationContext {
  userId?: string;
  path?: string;
  parentValue?: any;
  rootValue?: any;
  isOptional?: boolean;
  metadata?: Record<string, unknown>;
}

// Validator function type
export type Validator<T = any> = (
  value: unknown,
  context?: ValidationContext
) => Promise<ValidationResult<T>> | ValidationResult<T>;

// Validation error detail with required properties
export interface ValidationErrorDetail {
  path: string;
  message: string;
  code: ValidationErrorCode;
  severity: ErrorSeverity;
  metadata?: Record<string, unknown>;
}

// Validation result for generic type T
export interface ValidationResult<T = any> {
  isValid: boolean;
  errors: ValidationErrorDetail[];
  value?: T;
  validatedData?: T; // For backward compatibility
}
