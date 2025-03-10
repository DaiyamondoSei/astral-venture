
import { ValidationError } from './ValidationError';

/**
 * Validate that a value is defined (not null or undefined)
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
 * Validate that a value is a string
 */
export function validateString(
  value: unknown,
  fieldName: string
): string {
  if (value === null || value === undefined) {
    throw ValidationError.requiredError(fieldName);
  }
  
  if (typeof value !== 'string') {
    throw ValidationError.typeError(fieldName, 'string');
  }
  
  return value;
}

/**
 * Validate that a value is a number
 */
export function validateNumber(
  value: unknown,
  fieldName: string
): number {
  if (value === null || value === undefined) {
    throw ValidationError.requiredError(fieldName);
  }
  
  if (typeof value !== 'number' || isNaN(value)) {
    throw ValidationError.typeError(fieldName, 'number');
  }
  
  return value;
}

/**
 * Validate that a value is a boolean
 */
export function validateBoolean(
  value: unknown,
  fieldName: string
): boolean {
  if (value === null || value === undefined) {
    throw ValidationError.requiredError(fieldName);
  }
  
  if (typeof value !== 'boolean') {
    throw ValidationError.typeError(fieldName, 'boolean');
  }
  
  return value;
}

/**
 * Validate that a value is an array
 */
export function validateArray<T>(
  value: unknown,
  fieldName: string,
  itemValidator?: (item: unknown, index: number) => T
): T[] {
  if (value === null || value === undefined) {
    throw ValidationError.requiredError(fieldName);
  }
  
  if (!Array.isArray(value)) {
    throw ValidationError.typeError(fieldName, 'array');
  }
  
  if (itemValidator) {
    return value.map((item, index) => {
      try {
        return itemValidator(item, index);
      } catch (error) {
        if (error instanceof ValidationError) {
          // Enhance error with array index information
          const enhancedField = Array.isArray(error.field) 
            ? error.field.map(f => `${fieldName}[${index}].${f}`)
            : `${fieldName}[${index}]${error.field ? `.${error.field}` : ''}`;
            
          error.field = enhancedField;
        }
        throw error;
      }
    });
  }
  
  return value as T[];
}

/**
 * Validate that a value is an object
 */
export function validateObject<T extends object>(
  value: unknown,
  fieldName: string
): T {
  if (value === null || value === undefined) {
    throw ValidationError.requiredError(fieldName);
  }
  
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw ValidationError.typeError(fieldName, 'object');
  }
  
  return value as T;
}

/**
 * Validate that a value is one of the allowed values
 */
export function validateOneOf<T>(
  value: unknown,
  allowedValues: T[],
  fieldName: string
): T {
  if (value === null || value === undefined) {
    throw ValidationError.requiredError(fieldName);
  }
  
  if (!allowedValues.includes(value as T)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`,
      { field: fieldName, rule: 'oneOf' }
    );
  }
  
  return value as T;
}

/**
 * Validate an email address format
 */
export function validateEmail(
  value: unknown,
  fieldName: string = 'email'
): string {
  const email = validateString(value, fieldName);
  
  // Simple email regex - production code would use a more robust solution
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw ValidationError.formatError(fieldName, 'email');
  }
  
  return email;
}

/**
 * Validate a URL format
 */
export function validateUrl(
  value: unknown,
  fieldName: string = 'url'
): string {
  const url = validateString(value, fieldName);
  
  try {
    new URL(url);
    return url;
  } catch (error) {
    throw ValidationError.formatError(fieldName, 'URL');
  }
}

/**
 * Safely validate a value with a custom validator function
 */
export function validateSafe<T>(
  validator: () => T,
  defaultValue: T
): T {
  try {
    return validator();
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Export the ValidationError class to maintain compatibility
 */
export { ValidationError };
