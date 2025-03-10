
/**
 * Custom validation error class
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validates that a value is defined (not null or undefined)
 * 
 * @param value - The value to check
 * @param name - Name of the field for error messages
 * @returns The validated value
 * @throws ValidationError if validation fails
 */
export function validateDefined<T>(value: T | null | undefined, name: string): T {
  if (value === undefined || value === null) {
    throw new ValidationError(`${name} is required but was not provided`);
  }
  return value;
}

/**
 * Validates that a value is a string
 * 
 * @param value - The value to check
 * @param name - Name of the field for error messages
 * @returns The validated string
 * @throws ValidationError if validation fails
 */
export function validateString(value: unknown, name: string): string {
  if (typeof value !== 'string') {
    throw new ValidationError(`${name} must be a string`);
  }
  return value;
}

/**
 * Validates that a value is a number
 * 
 * @param value - The value to check
 * @param name - Name of the field for error messages
 * @returns The validated number
 * @throws ValidationError if validation fails
 */
export function validateNumber(value: unknown, name: string): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError(`${name} must be a number`);
  }
  return value;
}

/**
 * Validates that a value is one of the allowed values
 * 
 * @param value - The value to check
 * @param allowedValues - Array of allowed values
 * @param name - Name of the field for error messages
 * @returns The validated value
 * @throws ValidationError if validation fails
 */
export function validateOneOf<T>(value: unknown, allowedValues: T[], name: string): T {
  if (!allowedValues.includes(value as T)) {
    throw new ValidationError(
      `${name} must be one of [${allowedValues.join(', ')}], but got ${String(value)}`
    );
  }
  return value as T;
}

/**
 * Validates that a value is an array
 * 
 * @param value - The value to check
 * @param name - Name of the field for error messages
 * @returns The validated array
 * @throws ValidationError if validation fails
 */
export function validateArray<T>(value: unknown, name: string): T[] {
  if (!Array.isArray(value)) {
    throw new ValidationError(`${name} must be an array`);
  }
  return value as T[];
}

/**
 * Validates that a value is an object
 * 
 * @param value - The value to check
 * @param name - Name of the field for error messages
 * @returns The validated object
 * @throws ValidationError if validation fails
 */
export function validateObject(value: unknown, name: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ValidationError(`${name} must be an object`);
  }
  return value as Record<string, unknown>;
}

/**
 * Creates a composed validator that runs multiple validations
 * 
 * @param validators - Array of validator functions to run
 * @returns A function that runs all validators in sequence
 */
export function composeValidators<T>(
  ...validators: Array<(value: unknown) => unknown>
): (value: unknown) => T {
  return (value: unknown) => {
    return validators.reduce(
      (result, validator) => validator(result),
      value
    ) as T;
  };
}

/**
 * Validates that a value is a boolean
 * 
 * @param value - The value to check
 * @param name - Name of the field for error messages
 * @returns The validated boolean
 * @throws ValidationError if validation fails
 */
export function validateBoolean(value: unknown, name: string): boolean {
  if (typeof value !== 'boolean') {
    throw new ValidationError(`${name} must be a boolean`);
  }
  return value;
}

/**
 * Validates that a value is a date or can be converted to a valid date
 * 
 * @param value - The value to check
 * @param name - Name of the field for error messages
 * @returns The validated Date object
 * @throws ValidationError if validation fails
 */
export function validateDate(value: unknown, name: string): Date {
  let date: Date;
  
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'string' || typeof value === 'number') {
    date = new Date(value);
  } else {
    throw new ValidationError(`${name} must be a Date, string, or number timestamp`);
  }
  
  if (isNaN(date.getTime())) {
    throw new ValidationError(`${name} must be a valid date`);
  }
  
  return date;
}

/**
 * Validates that a string matches a regular expression pattern
 * 
 * @param value - The value to check
 * @param pattern - Regular expression to match against
 * @param name - Name of the field for error messages
 * @returns The validated string
 * @throws ValidationError if validation fails
 */
export function validatePattern(value: unknown, pattern: RegExp, name: string): string {
  const stringValue = validateString(value, name);
  
  if (!pattern.test(stringValue)) {
    throw new ValidationError(`${name} does not match the required pattern`);
  }
  
  return stringValue;
}

/**
 * Validates that a string has a minimum length
 * 
 * @param value - The value to check
 * @param minLength - Minimum required length
 * @param name - Name of the field for error messages
 * @returns The validated string
 * @throws ValidationError if validation fails
 */
export function validateMinLength(value: unknown, minLength: number, name: string): string {
  const stringValue = validateString(value, name);
  
  if (stringValue.length < minLength) {
    throw new ValidationError(`${name} must be at least ${minLength} characters long`);
  }
  
  return stringValue;
}

/**
 * Validates that a string does not exceed a maximum length
 * 
 * @param value - The value to check
 * @param maxLength - Maximum allowed length
 * @param name - Name of the field for error messages
 * @returns The validated string
 * @throws ValidationError if validation fails
 */
export function validateMaxLength(value: unknown, maxLength: number, name: string): string {
  const stringValue = validateString(value, name);
  
  if (stringValue.length > maxLength) {
    throw new ValidationError(`${name} cannot exceed ${maxLength} characters`);
  }
  
  return stringValue;
}

/**
 * Validates that a number is greater than or equal to a minimum value
 * 
 * @param value - The value to check
 * @param min - Minimum allowed value
 * @param name - Name of the field for error messages
 * @returns The validated number
 * @throws ValidationError if validation fails
 */
export function validateMin(value: unknown, min: number, name: string): number {
  const numberValue = validateNumber(value, name);
  
  if (numberValue < min) {
    throw new ValidationError(`${name} must be at least ${min}`);
  }
  
  return numberValue;
}

/**
 * Validates that a number is less than or equal to a maximum value
 * 
 * @param value - The value to check
 * @param max - Maximum allowed value
 * @param name - Name of the field for error messages
 * @returns The validated number
 * @throws ValidationError if validation fails
 */
export function validateMax(value: unknown, max: number, name: string): number {
  const numberValue = validateNumber(value, name);
  
  if (numberValue > max) {
    throw new ValidationError(`${name} must not exceed ${max}`);
  }
  
  return numberValue;
}

/**
 * Validates that a value is an email address
 * 
 * @param value - The value to check
 * @param name - Name of the field for error messages
 * @returns The validated email string
 * @throws ValidationError if validation fails
 */
export function validateEmail(value: unknown, name: string): string {
  const email = validateString(value, name);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    throw new ValidationError(`${name} must be a valid email address`);
  }
  
  return email;
}

/**
 * Validates that a value is a URL
 * 
 * @param value - The value to check
 * @param name - Name of the field for error messages
 * @returns The validated URL string
 * @throws ValidationError if validation fails
 */
export function validateUrl(value: unknown, name: string): string {
  const url = validateString(value, name);
  
  try {
    new URL(url);
    return url;
  } catch {
    throw new ValidationError(`${name} must be a valid URL`);
  }
}

/**
 * Validates an object against a schema of validators
 * 
 * @param value - The object to validate
 * @param schema - Record of property validators
 * @param name - Name of the object for error messages
 * @returns The validated object with proper types
 * @throws ValidationError if validation fails
 */
export function validateSchema<T extends Record<string, unknown>>(
  value: unknown, 
  schema: Record<keyof T, (value: unknown, name: string) => unknown>,
  name: string
): T {
  const object = validateObject(value, name);
  const result: Record<string, unknown> = {};
  
  for (const [key, validator] of Object.entries(schema)) {
    const propName = `${name}.${key}`;
    const propValue = object[key];
    
    try {
      result[key] = validator(propValue, propName);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(`Error validating ${propName}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  return result as T;
}

/**
 * Makes a validator optional, allowing null or undefined values
 * 
 * @param validator - The validator function to make optional
 * @returns A new validator that allows null/undefined
 */
export function optional<T>(
  validator: (value: unknown, name: string) => T
): (value: unknown, name: string) => T | null | undefined {
  return (value: unknown, name: string): T | null | undefined => {
    if (value === null || value === undefined) {
      return value;
    }
    return validator(value, name);
  };
}

/**
 * Transforms a value after validation
 * 
 * @param validator - The validator function to run first
 * @param transform - Function to transform the validated value
 * @returns A new validator that transforms the value after validation
 */
export function transform<T, R>(
  validator: (value: unknown, name: string) => T,
  transform: (value: T) => R
): (value: unknown, name: string) => R {
  return (value: unknown, name: string): R => {
    const validated = validator(value, name);
    return transform(validated);
  };
}

/**
 * Creates a validator for arrays where each item is validated
 * 
 * @param itemValidator - Validator to apply to each array item
 * @returns A validator for arrays with typed items
 */
export function array<T>(
  itemValidator: (value: unknown, name: string) => T
): (value: unknown, name: string) => T[] {
  return (value: unknown, name: string): T[] => {
    const arr = validateArray(value, name);
    return arr.map((item, index) => {
      try {
        return itemValidator(item, `${name}[${index}]`);
      } catch (error) {
        if (error instanceof ValidationError) {
          throw error;
        }
        throw new ValidationError(`Error validating ${name}[${index}]: ${error instanceof Error ? error.message : String(error)}`);
      }
    });
  };
}

/**
 * Validates a record/dictionary with string keys and validated values
 * 
 * @param valueValidator - Validator to apply to each value
 * @returns A validator for records with typed values
 */
export function record<T>(
  valueValidator: (value: unknown, name: string) => T
): (value: unknown, name: string) => Record<string, T> {
  return (value: unknown, name: string): Record<string, T> => {
    const obj = validateObject(value, name);
    const result: Record<string, T> = {};
    
    for (const [key, val] of Object.entries(obj)) {
      const propName = `${name}.${key}`;
      try {
        result[key] = valueValidator(val, propName);
      } catch (error) {
        if (error instanceof ValidationError) {
          throw error;
        }
        throw new ValidationError(`Error validating ${propName}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    return result;
  };
}
