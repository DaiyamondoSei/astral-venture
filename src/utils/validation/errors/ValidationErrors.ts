
import { BaseValidationError, ValidationErrorOptions } from './BaseValidationError';

/**
 * Specialized error for required field validation failures
 */
export class RequiredFieldError extends BaseValidationError {
  constructor(field: string) {
    super(`${field} is required`, {
      field,
      rule: 'required',
      code: 'REQUIRED_FIELD'
    });
    this.name = 'RequiredFieldError';
    Object.setPrototypeOf(this, RequiredFieldError.prototype);
  }
}

/**
 * Specialized error for type validation failures
 */
export class TypeValidationError extends BaseValidationError {
  constructor(value: unknown, expectedType: string, field: string) {
    super(
      `${field} must be a ${expectedType}, got ${typeof value}`,
      {
        field,
        expectedType,
        rule: 'type',
        details: `Received value: ${JSON.stringify(value)}`,
        code: 'INVALID_TYPE'
      }
    );
    this.name = 'TypeValidationError';
    Object.setPrototypeOf(this, TypeValidationError.prototype);
  }
}

/**
 * Specialized error for range validation failures
 */
export class RangeValidationError extends BaseValidationError {
  constructor(field: string, min?: number, max?: number, actual?: number) {
    let message = `${field} is out of range`;
    let details = '';
    
    if (min !== undefined && max !== undefined) {
      message = `${field} must be between ${min} and ${max}`;
      details = `Allowed range: ${min}-${max}`;
    } else if (min !== undefined) {
      message = `${field} must be at least ${min}`;
      details = `Minimum allowed value: ${min}`;
    } else if (max !== undefined) {
      message = `${field} must be at most ${max}`;
      details = `Maximum allowed value: ${max}`;
    }
    
    if (actual !== undefined) {
      details += `, Actual value: ${actual}`;
    }
    
    super(message, {
      field,
      rule: 'range',
      details,
      code: 'OUT_OF_RANGE'
    });
    this.name = 'RangeValidationError';
    Object.setPrototypeOf(this, RangeValidationError.prototype);
  }
}

/**
 * Specialized error for format validation failures
 */
export class FormatValidationError extends BaseValidationError {
  constructor(field: string, format: string, value: string) {
    super(
      `${field} has invalid format, expected ${format}`,
      {
        field,
        rule: 'format',
        details: `Invalid ${format} format: ${value}`,
        code: `INVALID_${format.toUpperCase()}_FORMAT`
      }
    );
    this.name = 'FormatValidationError';
    Object.setPrototypeOf(this, FormatValidationError.prototype);
  }
}

/**
 * Specialized error for constraint validation failures
 */
export class ConstraintValidationError extends BaseValidationError {
  constructor(field: string, constraint: string, message: string) {
    super(
      message,
      {
        field,
        rule: constraint,
        code: `CONSTRAINT_VIOLATION`
      }
    );
    this.name = 'ConstraintValidationError';
    Object.setPrototypeOf(this, ConstraintValidationError.prototype);
  }
}

/**
 * Specialized error for schema validation failures
 */
export class SchemaValidationError extends BaseValidationError {
  constructor(errors: string[], field: string) {
    super(
      `Schema validation failed for ${field}`,
      {
        field,
        rule: 'schema',
        details: Array.isArray(errors) ? errors.join(', ') : String(errors),
        code: 'SCHEMA_VALIDATION_ERROR'
      }
    );
    this.name = 'SchemaValidationError';
    Object.setPrototypeOf(this, SchemaValidationError.prototype);
  }
}

/**
 * Specialized error for wrapping other errors
 */
export class WrappedValidationError extends BaseValidationError {
  constructor(error: unknown, field: string) {
    const message = error instanceof Error ? error.message : String(error);
    
    super(
      `Error validating ${field}: ${message}`,
      {
        field,
        originalError: error,
        code: 'VALIDATION_ERROR'
      }
    );
    this.name = 'WrappedValidationError';
    Object.setPrototypeOf(this, WrappedValidationError.prototype);
  }
}

/**
 * Specialized error for API validation failures
 */
export class ApiValidationError extends BaseValidationError {
  constructor(error: unknown, field?: string) {
    const fieldName = field || 'api';
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    super(
      `API Error in ${fieldName}: ${errorMessage}`,
      {
        field: fieldName,
        statusCode: error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500,
        originalError: error,
        code: 'API_ERROR'
      }
    );
    this.name = 'ApiValidationError';
    Object.setPrototypeOf(this, ApiValidationError.prototype);
  }
}
