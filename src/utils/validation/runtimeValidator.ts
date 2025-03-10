
import { ValidationError } from './ValidationError';

/**
 * Validates that a value is a string and optionally meets constraints
 */
export function validateString(
  value: unknown, 
  fieldName: string, 
  options: { 
    minLength?: number; 
    maxLength?: number; 
    required?: boolean;
    trim?: boolean;
  } = {}
): string {
  const { 
    minLength, 
    maxLength, 
    required = true, 
    trim = true 
  } = options;

  // Check for null/undefined when required
  if (value == null || value === '') {
    if (required) {
      throw ValidationError.requiredError(fieldName);
    }
    return '';
  }

  // Check type
  if (typeof value !== 'string') {
    throw ValidationError.typeError(value, 'string', fieldName);
  }

  // Apply trimming if requested
  const processedValue = trim ? value.trim() : value;

  // Validate length constraints
  if (minLength !== undefined && processedValue.length < minLength) {
    throw new ValidationError(
      `${fieldName} must be at least ${minLength} characters`,
      {
        field: fieldName,
        rule: 'minLength',
        details: `Minimum length: ${minLength}, Actual length: ${processedValue.length}`,
        code: 'MIN_LENGTH'
      }
    );
  }

  if (maxLength !== undefined && processedValue.length > maxLength) {
    throw new ValidationError(
      `${fieldName} must be at most ${maxLength} characters`,
      {
        field: fieldName,
        rule: 'maxLength',
        details: `Maximum length: ${maxLength}, Actual length: ${processedValue.length}`,
        code: 'MAX_LENGTH'
      }
    );
  }

  return processedValue;
}

/**
 * Validates that a value is a number and optionally meets constraints
 */
export function validateNumber(
  value: unknown, 
  fieldName: string, 
  options: { 
    min?: number; 
    max?: number; 
    integer?: boolean;
    required?: boolean;
  } = {}
): number {
  const { 
    min, 
    max, 
    integer = false, 
    required = true 
  } = options;

  // Check for null/undefined when required
  if (value == null || value === '') {
    if (required) {
      throw ValidationError.requiredError(fieldName);
    }
    return 0; // Default value for optional numbers
  }

  // Convert string numbers
  let processedValue: number;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (isNaN(parsed)) {
      throw ValidationError.typeError(value, 'number', fieldName);
    }
    processedValue = parsed;
  } else if (typeof value === 'number') {
    processedValue = value;
  } else {
    throw ValidationError.typeError(value, 'number', fieldName);
  }

  // Validate integer constraint
  if (integer && !Number.isInteger(processedValue)) {
    throw new ValidationError(
      `${fieldName} must be an integer`,
      {
        field: fieldName,
        rule: 'integer',
        code: 'NOT_INTEGER'
      }
    );
  }

  // Validate range constraints
  if (min !== undefined && processedValue < min) {
    throw ValidationError.rangeError(fieldName, min, undefined, processedValue);
  }

  if (max !== undefined && processedValue > max) {
    throw ValidationError.rangeError(fieldName, undefined, max, processedValue);
  }

  return processedValue;
}

/**
 * Validates that a value is a boolean
 */
export function validateBoolean(
  value: unknown, 
  fieldName: string, 
  options: { required?: boolean } = {}
): boolean {
  const { required = true } = options;

  // Check for null/undefined when required
  if (value == null) {
    if (required) {
      throw ValidationError.requiredError(fieldName);
    }
    return false; // Default value for optional booleans
  }

  // Accept string representations of boolean
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    if (['true', 't', 'yes', 'y', '1'].includes(normalized)) {
      return true;
    }
    if (['false', 'f', 'no', 'n', '0'].includes(normalized)) {
      return false;
    }
  }

  // Check type
  if (typeof value !== 'boolean') {
    throw ValidationError.typeError(value, 'boolean', fieldName);
  }

  return value;
}

/**
 * Validates that a value is an object
 */
export function validateObject<T extends object = Record<string, unknown>>(
  value: unknown, 
  fieldName: string, 
  options: { required?: boolean } = {}
): T {
  const { required = true } = options;

  // Check for null/undefined when required
  if (value == null) {
    if (required) {
      throw ValidationError.requiredError(fieldName);
    }
    return {} as T; // Default value for optional objects
  }

  // Check type
  if (typeof value !== 'object' || Array.isArray(value) || value === null) {
    throw ValidationError.typeError(value, 'object', fieldName);
  }

  return value as T;
}

/**
 * Validates that a value is an array
 */
export function validateArray<T = unknown>(
  value: unknown, 
  fieldName: string, 
  options: { 
    minLength?: number; 
    maxLength?: number; 
    required?: boolean;
    itemValidator?: (item: unknown, index: number) => T;
  } = {}
): T[] {
  const { 
    minLength, 
    maxLength, 
    required = true,
    itemValidator 
  } = options;

  // Check for null/undefined when required
  if (value == null) {
    if (required) {
      throw ValidationError.requiredError(fieldName);
    }
    return []; // Default value for optional arrays
  }

  // Check type
  if (!Array.isArray(value)) {
    throw ValidationError.typeError(value, 'array', fieldName);
  }

  // Validate length constraints
  if (minLength !== undefined && value.length < minLength) {
    throw new ValidationError(
      `${fieldName} must have at least ${minLength} items`,
      {
        field: fieldName,
        rule: 'minItems',
        details: `Minimum items: ${minLength}, Actual items: ${value.length}`,
        code: 'MIN_ITEMS'
      }
    );
  }

  if (maxLength !== undefined && value.length > maxLength) {
    throw new ValidationError(
      `${fieldName} must have at most ${maxLength} items`,
      {
        field: fieldName,
        rule: 'maxItems',
        details: `Maximum items: ${maxLength}, Actual items: ${value.length}`,
        code: 'MAX_ITEMS'
      }
    );
  }

  // Validate individual items if a validator is provided
  if (itemValidator) {
    return value.map((item, index) => {
      try {
        return itemValidator(item, index);
      } catch (error) {
        if (error instanceof ValidationError) {
          // Enhance the error with array index information
          throw new ValidationError(
            `${fieldName}[${index}]: ${error.message}`,
            {
              field: `${fieldName}[${index}]`,
              rule: error.rule,
              details: error.details,
              code: error.code
            }
          );
        }
        throw error;
      }
    });
  }

  return value as T[];
}

/**
 * Validates an email address
 */
export function validateEmail(
  value: unknown, 
  fieldName: string, 
  options: { required?: boolean } = {}
): string {
  const { required = true } = options;

  // Use validateString first to handle common validations
  const email = validateString(value, fieldName, { required });
  
  // Skip validation for optional empty values
  if (!required && email === '') {
    return email;
  }

  // Regex for basic email validation
  // This is a simplified version, consider using a more comprehensive regex for production
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    throw ValidationError.formatError(fieldName, 'email', String(value));
  }

  return email;
}

/**
 * Validates a URL
 */
export function validateUrl(
  value: unknown, 
  fieldName: string, 
  options: { 
    required?: boolean;
    protocols?: string[];
  } = {}
): string {
  const { 
    required = true,
    protocols = ['http', 'https']
  } = options;

  // Use validateString first to handle common validations
  const url = validateString(value, fieldName, { required });
  
  // Skip validation for optional empty values
  if (!required && url === '') {
    return url;
  }

  try {
    const parsed = new URL(url);
    
    // Check protocol if specified
    if (protocols.length > 0 && !protocols.includes(parsed.protocol.replace(':', ''))) {
      throw ValidationError.formatError(
        fieldName, 
        `URL with protocol ${protocols.join(' or ')}`, 
        String(value)
      );
    }
    
    return url;
  } catch (error) {
    throw ValidationError.formatError(fieldName, 'URL', String(value));
  }
}

/**
 * Validates a date
 */
export function validateDate(
  value: unknown, 
  fieldName: string, 
  options: { 
    required?: boolean;
    min?: Date;
    max?: Date;
  } = {}
): Date {
  const { 
    required = true,
    min,
    max
  } = options;

  // Check for null/undefined when required
  if (value == null || value === '') {
    if (required) {
      throw ValidationError.requiredError(fieldName);
    }
    return new Date(); // Default to current date for optional dates
  }

  // Convert to Date object
  let date: Date;
  
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'string' || typeof value === 'number') {
    date = new Date(value);
    
    // Check if the date is invalid
    if (isNaN(date.getTime())) {
      throw ValidationError.formatError(fieldName, 'date', String(value));
    }
  } else {
    throw ValidationError.typeError(value, 'date', fieldName);
  }

  // Validate min/max constraints
  if (min instanceof Date && date < min) {
    throw new ValidationError(
      `${fieldName} must be after ${min.toISOString()}`,
      {
        field: fieldName,
        rule: 'minDate',
        details: `Minimum date: ${min.toISOString()}, Actual date: ${date.toISOString()}`,
        code: 'MIN_DATE'
      }
    );
  }

  if (max instanceof Date && date > max) {
    throw new ValidationError(
      `${fieldName} must be before ${max.toISOString()}`,
      {
        field: fieldName,
        rule: 'maxDate',
        details: `Maximum date: ${max.toISOString()}, Actual date: ${date.toISOString()}`,
        code: 'MAX_DATE'
      }
    );
  }

  return date;
}

/**
 * Validates that a value is one of the allowed enum values
 */
export function validateEnum<T extends string | number>(
  value: unknown, 
  fieldName: string, 
  options: { 
    values: readonly T[];
    required?: boolean;
  }
): T {
  const { values, required = true } = options;

  // Check for null/undefined when required
  if (value == null || value === '') {
    if (required) {
      throw ValidationError.requiredError(fieldName);
    }
    return values[0]; // Default to first value for optional enums
  }

  // Check that the value is one of the allowed values
  if (!values.includes(value as T)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${values.join(', ')}`,
      {
        field: fieldName,
        rule: 'enum',
        details: `Allowed values: ${values.join(', ')}, Received: ${String(value)}`,
        code: 'INVALID_ENUM'
      }
    );
  }

  return value as T;
}

/**
 * Validates that a string matches a regular expression
 */
export function validateRegex(
  value: unknown, 
  fieldName: string, 
  options: { 
    pattern: RegExp;
    message?: string;
    required?: boolean;
  }
): string {
  const { pattern, message, required = true } = options;

  // Use validateString first to handle common validations
  const str = validateString(value, fieldName, { required });
  
  // Skip validation for optional empty values
  if (!required && str === '') {
    return str;
  }

  if (!pattern.test(str)) {
    throw new ValidationError(
      message || `${fieldName} has an invalid format`,
      {
        field: fieldName,
        rule: 'pattern',
        details: `Expected pattern: ${pattern}, Received: ${str}`,
        code: 'INVALID_FORMAT'
      }
    );
  }

  return str;
}
