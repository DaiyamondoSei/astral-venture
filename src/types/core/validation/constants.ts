
/**
 * Validation Constants
 * 
 * This module provides runtime constants for validation types following the Type-Value pattern.
 */

import { ValidationSeverity, ValidationErrorCode, ValidationFieldType } from './types';

// Validation error severity constants
export const ValidationSeverities = {
  ERROR: 'error' as ValidationSeverity,
  WARNING: 'warning' as ValidationSeverity,
  INFO: 'info' as ValidationSeverity
} as const;

// Validation error code constants
export const ValidationErrorCodes = {
  REQUIRED: 'REQUIRED' as ValidationErrorCode,
  TYPE_ERROR: 'TYPE_ERROR' as ValidationErrorCode,
  FORMAT_ERROR: 'FORMAT_ERROR' as ValidationErrorCode,
  MIN_LENGTH_ERROR: 'MIN_LENGTH_ERROR' as ValidationErrorCode,
  MAX_LENGTH_ERROR: 'MAX_LENGTH_ERROR' as ValidationErrorCode,
  MIN_VALUE_ERROR: 'MIN_VALUE_ERROR' as ValidationErrorCode,
  MAX_VALUE_ERROR: 'MAX_VALUE_ERROR' as ValidationErrorCode,
  PATTERN_ERROR: 'PATTERN_ERROR' as ValidationErrorCode,
  CONSTRAINT_ERROR: 'CONSTRAINT_ERROR' as ValidationErrorCode,
  FIELD_REQUIRED: 'FIELD_REQUIRED' as ValidationErrorCode,
  UNKNOWN_ERROR: 'UNKNOWN_ERROR' as ValidationErrorCode,
  VALIDATION_FAILED: 'VALIDATION_FAILED' as ValidationErrorCode,
  SCHEMA_ERROR: 'SCHEMA_ERROR' as ValidationErrorCode,
  NOT_INTEGER: 'NOT_INTEGER' as ValidationErrorCode,
  MIN_ITEMS: 'MIN_ITEMS' as ValidationErrorCode,
  MAX_ITEMS: 'MAX_ITEMS' as ValidationErrorCode,
  MIN_DATE: 'MIN_DATE' as ValidationErrorCode,
  MAX_DATE: 'MAX_DATE' as ValidationErrorCode,
  INVALID_ENUM: 'INVALID_ENUM' as ValidationErrorCode,
  INVALID_FORMAT: 'INVALID_FORMAT' as ValidationErrorCode
} as const;

// Validation field type constants
export const ValidationFieldTypes = {
  STRING: 'string' as ValidationFieldType,
  NUMBER: 'number' as ValidationFieldType,
  BOOLEAN: 'boolean' as ValidationFieldType,
  OBJECT: 'object' as ValidationFieldType,
  ARRAY: 'array' as ValidationFieldType,
  DATE: 'date' as ValidationFieldType,
  EMAIL: 'email' as ValidationFieldType,
  URL: 'url' as ValidationFieldType,
  UUID: 'uuid' as ValidationFieldType,
  INTEGER: 'integer' as ValidationFieldType,
  FLOAT: 'float' as ValidationFieldType,
  ENUM: 'enum' as ValidationFieldType
} as const;

// Default validation options
export const DEFAULT_VALIDATION_OPTIONS = {
  abortEarly: false,
  strict: false,
  stripUnknown: false
};
