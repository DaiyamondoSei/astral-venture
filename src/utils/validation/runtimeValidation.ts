
/**
 * Runtime validation utilities for checking data types
 * Provides type guards for safer data handling
 */

/**
 * Type guard for string values
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard for number values
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard for boolean values
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Type guard for array values
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Type guard for object values
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard for Date values
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Validates and returns a string value or throws an error
 */
export function validateString(value: unknown, fieldName: string): string {
  if (!isString(value)) {
    throw new TypeError(`${fieldName} must be a string, received: ${typeof value}`);
  }
  return value;
}

/**
 * Validates and returns a number value or throws an error
 */
export function validateNumber(value: unknown, fieldName: string): number {
  if (!isNumber(value)) {
    throw new TypeError(`${fieldName} must be a number, received: ${typeof value}`);
  }
  return value;
}

/**
 * Validates and returns a boolean value or throws an error
 */
export function validateBoolean(value: unknown, fieldName: string): boolean {
  if (!isBoolean(value)) {
    throw new TypeError(`${fieldName} must be a boolean, received: ${typeof value}`);
  }
  return value;
}

/**
 * Validates and returns an array value or throws an error
 */
export function validateArray(value: unknown, fieldName: string): unknown[] {
  if (!isArray(value)) {
    throw new TypeError(`${fieldName} must be an array, received: ${typeof value}`);
  }
  return value;
}

/**
 * Validates and returns an object value or throws an error
 */
export function validateObject(value: unknown, fieldName: string): Record<string, unknown> {
  if (!isObject(value)) {
    throw new TypeError(`${fieldName} must be an object, received: ${typeof value}`);
  }
  return value;
}

/**
 * Validates and returns a Date value or throws an error
 */
export function validateDate(value: unknown, fieldName: string): Date {
  if (!isDate(value)) {
    throw new TypeError(`${fieldName} must be a valid Date object`);
  }
  return value;
}

/**
 * Validates and returns a value against a set of allowed values or throws an error
 */
export function validateEnum<T extends string>(
  value: unknown, 
  allowedValues: readonly T[], 
  fieldName: string
): T {
  const strValue = validateString(value, fieldName);
  
  if (!allowedValues.includes(strValue as T)) {
    throw new TypeError(
      `${fieldName} must be one of [${allowedValues.join(', ')}], received: ${strValue}`
    );
  }
  
  return strValue as T;
}

/**
 * Validates that a value is not null or undefined
 */
export function validateRequired(value: unknown, fieldName: string): unknown {
  if (value === null || value === undefined) {
    throw new TypeError(`${fieldName} is required but was not provided`);
  }
  return value;
}

/**
 * Validates a value against a schema or throws an error
 */
export function validateSchema(
  value: unknown, 
  schema: Record<string, (value: unknown) => boolean>, 
  prefix = ''
): Record<string, unknown> {
  const obj = validateObject(value, prefix || 'object');
  const errors: string[] = [];
  
  Object.entries(schema).forEach(([key, validator]) => {
    const fieldName = prefix ? `${prefix}.${key}` : key;
    const fieldValue = obj[key];
    
    try {
      if (!validator(fieldValue)) {
        errors.push(`Field ${fieldName} failed validation`);
      }
    } catch (error) {
      errors.push(`Field ${fieldName}: ${error.message}`);
    }
  });
  
  if (errors.length > 0) {
    throw new TypeError(`Schema validation failed: ${errors.join('; ')}`);
  }
  
  return obj;
}
