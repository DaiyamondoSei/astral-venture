
/**
 * Type-Safe Data Validation Utilities
 * 
 * Runtime validation functions with proper TypeScript type guards
 * to ensure type safety across async boundaries.
 */

import { ValidationError } from './ValidationError';

/**
 * Validates that a value is defined (not null or undefined)
 */
export function validateDefined<T>(
  value: T | null | undefined,
  fieldName: string
): T {
  if (value === null || value === undefined) {
    throw ValidationError.requiredError(fieldName);
  }
  return value;
}

/**
 * Validates that a value is a string
 */
export function validateString(
  value: unknown,
  fieldName: string
): string {
  if (typeof value !== 'string') {
    throw ValidationError.typeError(fieldName, 'string');
  }
  return value;
}

/**
 * Validates that a value is a number
 */
export function validateNumber(
  value: unknown,
  fieldName: string
): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw ValidationError.typeError(fieldName, 'number');
  }
  return value;
}

/**
 * Validates that a value is a boolean
 */
export function validateBoolean(
  value: unknown,
  fieldName: string
): boolean {
  if (typeof value !== 'boolean') {
    throw ValidationError.typeError(fieldName, 'boolean');
  }
  return value;
}

/**
 * Validates that a value is an object
 */
export function validateObject<T extends Record<string, unknown>>(
  value: unknown,
  fieldName: string
): T {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw ValidationError.typeError(fieldName, 'object');
  }
  return value as T;
}

/**
 * Validates that a value is an array
 */
export function validateArray<T>(
  value: unknown,
  fieldName: string,
  itemValidator?: (item: unknown, index: number) => T
): T[] {
  if (!Array.isArray(value)) {
    throw ValidationError.typeError(fieldName, 'array');
  }
  
  if (itemValidator) {
    return value.map((item, index) => {
      try {
        return itemValidator(item, index);
      } catch (error) {
        throw ValidationError.typeError(
          `${fieldName}[${index}]`,
          'valid item',
          error instanceof Error ? error.message : String(error)
        );
      }
    });
  }
  
  return value as T[];
}

/**
 * Type guard to check if a value is a non-null object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Validates an ID string
 */
export function validateId(
  value: unknown,
  fieldName: string
): string {
  const id = validateString(value, fieldName);
  if (id.trim() === '') {
    throw ValidationError.formatError(fieldName, 'non-empty string');
  }
  return id;
}

/**
 * Validates a UUID string
 */
export function validateUUID(
  value: unknown,
  fieldName: string
): string {
  const id = validateString(value, fieldName);
  // Simple UUID format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw ValidationError.formatError(fieldName, 'UUID');
  }
  return id;
}
