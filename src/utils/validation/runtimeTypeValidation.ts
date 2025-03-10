
import { ValidationError } from './runtimeValidation';
import { handleError, ErrorCategory, ErrorSeverity } from '../errorHandling';

/**
 * Type validation options
 */
export interface TypeValidationOptions {
  /** Whether to throw on validation failure */
  throwOnError?: boolean;
  /** Custom validation error message */
  errorMessage?: string;
  /** Whether to include call stack in the error */
  includeStack?: boolean;
}

/**
 * Validate a value is of expected type
 * 
 * @param value - Value to validate
 * @param expectedType - Expected type (string representation)
 * @param name - Name of the parameter for error messages
 * @param options - Validation options
 * @returns The validated value or null if validation fails
 */
export function validateType<T>(
  value: unknown, 
  expectedType: string, 
  name: string,
  options: TypeValidationOptions = {}
): T | null {
  const { throwOnError = true, errorMessage, includeStack = false } = options;
  
  // Determine actual type
  const actualType = Array.isArray(value) 
    ? 'array' 
    : (value === null ? 'null' : typeof value);
  
  // Check if type matches
  const isValid = actualType === expectedType || 
    (expectedType === 'array' && Array.isArray(value)) ||
    // Special case for objects but not arrays or null
    (expectedType === 'object' && actualType === 'object' && !Array.isArray(value) && value !== null);
  
  if (!isValid) {
    const errorMsg = errorMessage ?? 
      `Invalid type for ${name}: expected ${expectedType}, got ${actualType}`;
    
    // Handle based on options
    if (throwOnError) {
      throw new ValidationError(errorMsg);
    } else {
      handleError(new ValidationError(errorMsg), {
        category: ErrorCategory.VALIDATION,
        severity: ErrorSeverity.WARNING,
        context: 'Type Validation',
        showToast: false,
        includeStack
      });
      return null;
    }
  }
  
  return value as T;
}

/**
 * Validate a value against a schema
 * 
 * @param value - Value to validate
 * @param schema - Validation schema object
 * @param name - Name of the object for error messages
 * @param options - Validation options
 * @returns The validated object or null if validation fails
 */
export function validateSchema<T>(
  value: unknown,
  schema: Record<string, { type: string, required?: boolean }>,
  name: string,
  options: TypeValidationOptions = {}
): T | null {
  const { throwOnError = true, includeStack = false } = options;
  
  // Validate object first
  const obj = validateType<Record<string, unknown>>(value, 'object', name, { 
    throwOnError,
    includeStack
  });
  
  if (!obj) return null;
  
  try {
    // Check each field in the schema
    for (const [field, fieldSchema] of Object.entries(schema)) {
      const fieldValue = obj[field];
      const fieldName = `${name}.${field}`;
      
      // Check if required field is missing
      if (fieldSchema.required && (fieldValue === undefined || fieldValue === null)) {
        throw new ValidationError(`Required field ${fieldName} is missing`);
      }
      
      // Skip validation for optional fields that are undefined
      if (fieldValue === undefined) continue;
      
      // Validate field type
      if (fieldValue !== null) {
        validateType(fieldValue, fieldSchema.type, fieldName, { throwOnError: true });
      }
    }
    
    return obj as unknown as T;
  } catch (error) {
    if (throwOnError) {
      throw error;
    } else {
      handleError(error, {
        category: ErrorCategory.VALIDATION,
        severity: ErrorSeverity.WARNING,
        context: 'Schema Validation',
        showToast: false,
        includeStack
      });
      return null;
    }
  }
}

/**
 * Type-guard function that checks if value is not null or undefined
 * 
 * @param value - Value to check
 * @returns True if value is defined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type-guard function that checks if value is a string
 * 
 * @param value - Value to check
 * @returns True if value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type-guard function that checks if value is a number
 * 
 * @param value - Value to check
 * @returns True if value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Type-guard function that checks if value is a boolean
 * 
 * @param value - Value to check
 * @returns True if value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Type-guard function that checks if value is an array
 * 
 * @param value - Value to check
 * @returns True if value is an array
 */
export function isArray<T>(value: unknown): value is Array<T> {
  return Array.isArray(value);
}

/**
 * Type-guard function that checks if value is an object
 * 
 * @param value - Value to check
 * @returns True if value is an object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
