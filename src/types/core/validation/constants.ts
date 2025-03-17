
/**
 * Validation Constants
 * 
 * This module provides runtime constants for validation types.
 * These are paired with the types in types.ts following the Type-Value pattern.
 */

// Validation error severity levels
export const ErrorSeverities = {
  ERROR: 'error' as const,
  WARNING: 'warning' as const,
  INFO: 'info' as const
};

// Validation error codes
export const ValidationErrorCodes = {
  REQUIRED: 'REQUIRED' as const,
  TYPE_ERROR: 'TYPE_ERROR' as const,
  FORMAT_ERROR: 'FORMAT_ERROR' as const,
  MIN_LENGTH_ERROR: 'MIN_LENGTH_ERROR' as const,
  MAX_LENGTH_ERROR: 'MAX_LENGTH_ERROR' as const,
  MIN_VALUE_ERROR: 'MIN_VALUE_ERROR' as const,
  MAX_VALUE_ERROR: 'MAX_VALUE_ERROR' as const,
  PATTERN_ERROR: 'PATTERN_ERROR' as const,
  CONSTRAINT_ERROR: 'CONSTRAINT_ERROR' as const,
  FIELD_REQUIRED: 'FIELD_REQUIRED' as const,
  UNKNOWN_ERROR: 'UNKNOWN_ERROR' as const,
  VALIDATION_FAILED: 'VALIDATION_FAILED' as const,
  SCHEMA_ERROR: 'SCHEMA_ERROR' as const,
  NOT_INTEGER: 'NOT_INTEGER' as const,
  MIN_ITEMS: 'MIN_ITEMS' as const,
  MAX_ITEMS: 'MAX_ITEMS' as const,
  MIN_DATE: 'MIN_DATE' as const,
  MAX_DATE: 'MAX_DATE' as const,
  INVALID_ENUM: 'INVALID_ENUM' as const,
  INVALID_FORMAT: 'INVALID_FORMAT' as const,
  MISSING_USER_ID: 'MISSING_USER_ID' as const,
  MISSING_ACHIEVEMENT_ID: 'MISSING_ACHIEVEMENT_ID' as const,
  FETCH_ACHIEVEMENTS_ERROR: 'FETCH_ACHIEVEMENTS_ERROR' as const,
  FETCH_USER_ACHIEVEMENTS_ERROR: 'FETCH_USER_ACHIEVEMENTS_ERROR' as const,
  UPDATE_ACHIEVEMENT_PROGRESS_ERROR: 'UPDATE_ACHIEVEMENT_PROGRESS_ERROR' as const,
  CHECK_ACHIEVEMENT_ERROR: 'CHECK_ACHIEVEMENT_ERROR' as const,
  AWARD_ACHIEVEMENT_ERROR: 'AWARD_ACHIEVEMENT_ERROR' as const,
  GET_ACHIEVEMENT_PROGRESS_ERROR: 'GET_ACHIEVEMENT_PROGRESS_ERROR' as const
};

// Validation field type options
export const ValidationFieldTypes = {
  STRING: 'string' as const,
  NUMBER: 'number' as const,
  BOOLEAN: 'boolean' as const,
  OBJECT: 'object' as const,
  ARRAY: 'array' as const,
  DATE: 'date' as const,
  EMAIL: 'email' as const,
  URL: 'url' as const,
  UUID: 'uuid' as const,
  INTEGER: 'integer' as const,
  FLOAT: 'float' as const,
  ENUM: 'enum' as const
};

// Default validation options
export const DEFAULT_VALIDATION_OPTIONS = {
  abortEarly: false,
  strict: false,
  stripUnknown: false
};
