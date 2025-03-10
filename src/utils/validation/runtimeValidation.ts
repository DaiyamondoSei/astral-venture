
/**
 * Runtime Validation Utilities
 * 
 * Provides functions for validating data at runtime.
 */

import { ValidationError } from './ValidationError';

/**
 * Validate that a value is a string and meets optional constraints
 */
export function validateString(
  value: unknown, 
  options: { 
    field?: string;
    minLength?: number; 
    maxLength?: number; 
    pattern?: RegExp;
    required?: boolean;
  } = {}
): string {
  const fieldName = options.field || 'value';
  const { minLength, maxLength, pattern, required = true } = options;
  
  // Handle null/undefined for optional fields
  if (value === null || value === undefined) {
    if (required) {
      throw new ValidationError(`${fieldName} is required`, [
        { path: fieldName, message: 'Required value is missing' }
      ]);
    }
    return '';
  }
  
  // Check type
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`, [
      { path: fieldName, message: 'Must be a string', value }
    ]);
  }
  
  // Check min length
  if (minLength !== undefined && value.length < minLength) {
    throw new ValidationError(`${fieldName} must be at least ${minLength} characters`, [
      { path: fieldName, message: `Must be at least ${minLength} characters`, value }
    ]);
  }
  
  // Check max length
  if (maxLength !== undefined && value.length > maxLength) {
    throw new ValidationError(`${fieldName} must be at most ${maxLength} characters`, [
      { path: fieldName, message: `Must be at most ${maxLength} characters`, value }
    ]);
  }
  
  // Check pattern
  if (pattern && !pattern.test(value)) {
    throw new ValidationError(`${fieldName} has an invalid format`, [
      { path: fieldName, message: 'Invalid format', value }
    ]);
  }
  
  return value;
}

/**
 * Validate that a value is a number and meets optional constraints
 */
export function validateNumber(
  value: unknown,
  options: {
    field?: string;
    min?: number;
    max?: number;
    integer?: boolean;
    required?: boolean;
  } = {}
): number {
  const fieldName = options.field || 'value';
  const { min, max, integer, required = true } = options;
  
  // Handle null/undefined for optional fields
  if (value === null || value === undefined) {
    if (required) {
      throw new ValidationError(`${fieldName} is required`, [
        { path: fieldName, message: 'Required value is missing' }
      ]);
    }
    return 0;
  }
  
  // Parse string to number if needed
  let numValue: number;
  if (typeof value === 'string') {
    numValue = Number(value);
    if (isNaN(numValue)) {
      throw new ValidationError(`${fieldName} must be a valid number`, [
        { path: fieldName, message: 'Must be a valid number', value }
      ]);
    }
  } else if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError(`${fieldName} must be a number`, [
      { path: fieldName, message: 'Must be a number', value }
    ]);
  } else {
    numValue = value;
  }
  
  // Check integer constraint
  if (integer && !Number.isInteger(numValue)) {
    throw new ValidationError(`${fieldName} must be an integer`, [
      { path: fieldName, message: 'Must be an integer', value: numValue }
    ]);
  }
  
  // Check min constraint
  if (min !== undefined && numValue < min) {
    throw new ValidationError(`${fieldName} must be at least ${min}`, [
      { path: fieldName, message: `Must be at least ${min}`, value: numValue }
    ]);
  }
  
  // Check max constraint
  if (max !== undefined && numValue > max) {
    throw new ValidationError(`${fieldName} must be at most ${max}`, [
      { path: fieldName, message: `Must be at most ${max}`, value: numValue }
    ]);
  }
  
  return numValue;
}

/**
 * Validate that a value is a boolean
 */
export function validateBoolean(
  value: unknown,
  options: {
    field?: string;
    required?: boolean;
  } = {}
): boolean {
  const fieldName = options.field || 'value';
  const { required = true } = options;
  
  // Handle null/undefined for optional fields
  if (value === null || value === undefined) {
    if (required) {
      throw new ValidationError(`${fieldName} is required`, [
        { path: fieldName, message: 'Required value is missing' }
      ]);
    }
    return false;
  }
  
  // Check if already a boolean
  if (typeof value === 'boolean') {
    return value;
  }
  
  // Try to convert common string values
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase();
    if (lowerValue === 'true') return true;
    if (lowerValue === 'false') return false;
  }
  
  // Try to convert common number values
  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  
  throw new ValidationError(`${fieldName} must be a boolean`, [
    { path: fieldName, message: 'Must be a boolean', value }
  ]);
}

/**
 * Validate that a value is an array and meets optional constraints
 */
export function validateArray<T>(
  value: unknown,
  options: {
    field?: string;
    minLength?: number;
    maxLength?: number;
    itemValidator?: (item: unknown, index: number) => T;
    required?: boolean;
  } = {}
): T[] | any[] {
  const fieldName = options.field || 'value';
  const { minLength, maxLength, itemValidator, required = true } = options;
  
  // Handle null/undefined for optional fields
  if (value === null || value === undefined) {
    if (required) {
      throw new ValidationError(`${fieldName} is required`, [
        { path: fieldName, message: 'Required value is missing' }
      ]);
    }
    return [];
  }
  
  // Check if it's an array
  if (!Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an array`, [
      { path: fieldName, message: 'Must be an array', value }
    ]);
  }
  
  // Check min length
  if (minLength !== undefined && value.length < minLength) {
    throw new ValidationError(`${fieldName} must have at least ${minLength} items`, [
      { path: fieldName, message: `Must have at least ${minLength} items`, value }
    ]);
  }
  
  // Check max length
  if (maxLength !== undefined && value.length > maxLength) {
    throw new ValidationError(`${fieldName} must have at most ${maxLength} items`, [
      { path: fieldName, message: `Must have at most ${maxLength} items`, value }
    ]);
  }
  
  // Validate each item
  if (itemValidator) {
    const validatedItems: T[] = [];
    const errors: { path: string; message: string; value?: any }[] = [];
    
    value.forEach((item, index) => {
      try {
        validatedItems.push(itemValidator(item, index));
      } catch (error) {
        if (error instanceof ValidationError) {
          error.details.forEach(detail => {
            errors.push({
              path: `${fieldName}[${index}].${detail.path}`,
              message: detail.message,
              value: detail.value
            });
          });
        } else {
          errors.push({
            path: `${fieldName}[${index}]`,
            message: error instanceof Error ? error.message : String(error),
            value: item
          });
        }
      }
    });
    
    if (errors.length > 0) {
      throw new ValidationError(`${fieldName} contains invalid items`, errors);
    }
    
    return validatedItems;
  }
  
  return value;
}

/**
 * Validate that a value is an object with optional schema validation
 */
export function validateObject(
  value: unknown,
  options: {
    field?: string;
    schema?: Record<string, (value: unknown) => any>;
    required?: boolean;
    allowUnknown?: boolean;
  } = {}
): Record<string, any> {
  const fieldName = options.field || 'value';
  const { schema, required = true, allowUnknown = true } = options;
  
  // Handle null/undefined for optional fields
  if (value === null || value === undefined) {
    if (required) {
      throw new ValidationError(`${fieldName} is required`, [
        { path: fieldName, message: 'Required value is missing' }
      ]);
    }
    return {};
  }
  
  // Check if it's an object
  if (typeof value !== 'object' || Array.isArray(value) || value === null) {
    throw new ValidationError(`${fieldName} must be an object`, [
      { path: fieldName, message: 'Must be an object', value }
    ]);
  }
  
  // Return early if no schema validation is needed
  if (!schema) {
    return value as Record<string, any>;
  }
  
  // Validate schema
  const validatedObject: Record<string, any> = {};
  const errors: { path: string; message: string; value?: any }[] = [];
  
  // Check required fields are present
  Object.entries(schema).forEach(([key, validator]) => {
    try {
      const propValue = (value as Record<string, any>)[key];
      validatedObject[key] = validator(propValue);
    } catch (error) {
      if (error instanceof ValidationError) {
        error.details.forEach(detail => {
          errors.push({
            path: `${fieldName}.${key}${detail.path ? `.${detail.path}` : ''}`,
            message: detail.message,
            value: detail.value
          });
        });
      } else {
        errors.push({
          path: `${fieldName}.${key}`,
          message: error instanceof Error ? error.message : String(error),
          value: (value as Record<string, any>)[key]
        });
      }
    }
  });
  
  // Check for unknown fields
  if (!allowUnknown) {
    Object.keys(value as Record<string, any>).forEach(key => {
      if (!schema[key]) {
        errors.push({
          path: `${fieldName}.${key}`,
          message: 'Unknown field',
          value: (value as Record<string, any>)[key]
        });
      }
    });
  }
  
  if (errors.length > 0) {
    throw new ValidationError(`${fieldName} is invalid`, errors);
  }
  
  // Add unknown fields if allowed
  if (allowUnknown) {
    Object.entries(value as Record<string, any>).forEach(([key, val]) => {
      if (!schema[key]) {
        validatedObject[key] = val;
      }
    });
  }
  
  return validatedObject;
}

/**
 * Validate that a value is one of a set of allowed values
 */
export function validateOneOf<T>(
  value: unknown,
  allowedValues: T[],
  options: {
    field?: string;
    required?: boolean;
  } = {}
): T {
  const fieldName = options.field || 'value';
  const { required = true } = options;
  
  // Handle null/undefined for optional fields
  if (value === null || value === undefined) {
    if (required) {
      throw new ValidationError(`${fieldName} is required`, [
        { path: fieldName, message: 'Required value is missing' }
      ]);
    }
    return allowedValues[0];
  }
  
  // Check if value is one of allowed values
  if (!allowedValues.includes(value as T)) {
    const allowedList = allowedValues.map(v => 
      typeof v === 'string' ? `"${v}"` : String(v)
    ).join(', ');
    
    throw new ValidationError(`${fieldName} must be one of: ${allowedList}`, [
      { 
        path: fieldName, 
        message: `Must be one of: ${allowedList}`, 
        value 
      }
    ]);
  }
  
  return value as T;
}

/**
 * Validate an email address format
 */
export function validateEmail(
  value: unknown,
  options: {
    field?: string;
    required?: boolean;
  } = {}
): string {
  const fieldName = options.field || 'email';
  const { required = true } = options;
  
  // Use string validator first
  const strValue = validateString(value, { 
    field: fieldName, 
    required,
    minLength: 5,
    maxLength: 255
  });
  
  // Skip validation for empty optional fields
  if (!required && !strValue) {
    return strValue;
  }
  
  // Email regex pattern
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailPattern.test(strValue)) {
    throw new ValidationError(`${fieldName} must be a valid email address`, [
      { path: fieldName, message: 'Must be a valid email address', value: strValue }
    ]);
  }
  
  return strValue;
}

/**
 * Validate a URL format
 */
export function validateUrl(
  value: unknown,
  options: {
    field?: string;
    required?: boolean;
    protocols?: string[];
  } = {}
): string {
  const fieldName = options.field || 'url';
  const { required = true, protocols = ['http', 'https'] } = options;
  
  // Use string validator first
  const strValue = validateString(value, { 
    field: fieldName, 
    required,
    minLength: 1,
    maxLength: 2048
  });
  
  // Skip validation for empty optional fields
  if (!required && !strValue) {
    return strValue;
  }
  
  try {
    const url = new URL(strValue);
    
    // Check protocol if specified
    if (protocols.length > 0 && !protocols.includes(url.protocol.replace(':', ''))) {
      const protocolList = protocols.map(p => `"${p}"`).join(', ');
      throw new ValidationError(`${fieldName} must use one of these protocols: ${protocolList}`, [
        { 
          path: fieldName, 
          message: `Must use one of these protocols: ${protocolList}`, 
          value: strValue 
        }
      ]);
    }
    
    return strValue;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    
    throw new ValidationError(`${fieldName} must be a valid URL`, [
      { path: fieldName, message: 'Must be a valid URL', value: strValue }
    ]);
  }
}
