
import { ValidationError } from './ValidationError';

/**
 * Options for validation functions
 */
export interface ValidationOptions {
  /** Custom error message */
  message?: string;
  /** Whether to allow null values */
  allowNull?: boolean;
  /** Whether to allow undefined values */
  allowUndefined?: boolean;
  /** Additional constraints to check */
  constraints?: Record<string, any>;
}

/**
 * Validate that a value is defined (not null or undefined)
 * 
 * @param value The value to validate
 * @param fieldName Name of the field for error reporting
 * @param options Validation options
 * @returns The validated value
 * @throws ValidationError if the value is null or undefined
 */
export function validateDefined<T>(
  value: T | null | undefined, 
  fieldName: string,
  options?: ValidationOptions
): T {
  if (value === null) {
    if (options?.allowNull) return value as unknown as T;
    throw ValidationError.requiredError(fieldName);
  }
  
  if (value === undefined) {
    if (options?.allowUndefined) return value as unknown as T;
    throw ValidationError.requiredError(fieldName);
  }
  
  return value;
}

/**
 * Validate that a value is a string
 * 
 * @param value The value to validate
 * @param fieldName Name of the field for error reporting
 * @param options Validation options
 * @returns The validated string
 * @throws ValidationError if the value is not a string
 */
export function validateString(
  value: unknown, 
  fieldName: string,
  options?: ValidationOptions & {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  }
): string {
  // Handle null/undefined
  if (value === null) {
    if (options?.allowNull) return '' as any;
    throw ValidationError.requiredError(fieldName);
  }
  
  if (value === undefined) {
    if (options?.allowUndefined) return '' as any;
    throw ValidationError.requiredError(fieldName);
  }
  
  // Type check
  if (typeof value !== 'string') {
    throw ValidationError.typeError(value, 'string', fieldName);
  }
  
  // Constraints
  if (options?.minLength !== undefined && value.length < options.minLength) {
    throw ValidationError.constraintError(
      fieldName, 
      'minLength', 
      `Value must be at least ${options.minLength} characters`
    );
  }
  
  if (options?.maxLength !== undefined && value.length > options.maxLength) {
    throw ValidationError.constraintError(
      fieldName, 
      'maxLength', 
      `Value must be at most ${options.maxLength} characters`
    );
  }
  
  if (options?.pattern && !options.pattern.test(value)) {
    throw ValidationError.constraintError(
      fieldName, 
      'pattern', 
      `Value must match pattern ${options.pattern}`
    );
  }
  
  return value;
}

/**
 * Validate that a value is a number
 * 
 * @param value The value to validate
 * @param fieldName Name of the field for error reporting
 * @param options Validation options
 * @returns The validated number
 * @throws ValidationError if the value is not a number
 */
export function validateNumber(
  value: unknown, 
  fieldName: string,
  options?: ValidationOptions & {
    min?: number;
    max?: number;
    integer?: boolean;
  }
): number {
  // Handle null/undefined
  if (value === null) {
    if (options?.allowNull) return 0 as any;
    throw ValidationError.requiredError(fieldName);
  }
  
  if (value === undefined) {
    if (options?.allowUndefined) return 0 as any;
    throw ValidationError.requiredError(fieldName);
  }
  
  // Convert string to number if possible
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (!isNaN(parsed)) {
      value = parsed;
    }
  }
  
  // Type check
  if (typeof value !== 'number' || isNaN(value)) {
    throw ValidationError.typeError(value, 'number', fieldName);
  }
  
  // Constraints
  if (options?.min !== undefined && value < options.min) {
    throw ValidationError.constraintError(
      fieldName, 
      'min', 
      `Value must be at least ${options.min}`
    );
  }
  
  if (options?.max !== undefined && value > options.max) {
    throw ValidationError.constraintError(
      fieldName, 
      'max', 
      `Value must be at most ${options.max}`
    );
  }
  
  if (options?.integer && !Number.isInteger(value)) {
    throw ValidationError.constraintError(
      fieldName, 
      'integer', 
      'Value must be an integer'
    );
  }
  
  return value;
}

/**
 * Validate that a value is a boolean
 * 
 * @param value The value to validate
 * @param fieldName Name of the field for error reporting
 * @param options Validation options
 * @returns The validated boolean
 * @throws ValidationError if the value is not a boolean
 */
export function validateBoolean(
  value: unknown, 
  fieldName: string,
  options?: ValidationOptions
): boolean {
  // Handle null/undefined
  if (value === null) {
    if (options?.allowNull) return false as any;
    throw ValidationError.requiredError(fieldName);
  }
  
  if (value === undefined) {
    if (options?.allowUndefined) return false as any;
    throw ValidationError.requiredError(fieldName);
  }
  
  // Convert string "true"/"false" to boolean
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  
  // Convert number 0/1 to boolean
  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  
  // Type check
  if (typeof value !== 'boolean') {
    throw ValidationError.typeError(value, 'boolean', fieldName);
  }
  
  return value;
}

/**
 * Validate that a value is an array
 * 
 * @param value The value to validate
 * @param fieldName Name of the field for error reporting
 * @param options Validation options
 * @returns The validated array
 * @throws ValidationError if the value is not an array
 */
export function validateArray<T>(
  value: unknown, 
  fieldName: string,
  options?: ValidationOptions & {
    minLength?: number;
    maxLength?: number;
    itemValidator?: (item: unknown, index: number) => T;
  }
): T[] {
  // Handle null/undefined
  if (value === null) {
    if (options?.allowNull) return [] as any;
    throw ValidationError.requiredError(fieldName);
  }
  
  if (value === undefined) {
    if (options?.allowUndefined) return [] as any;
    throw ValidationError.requiredError(fieldName);
  }
  
  // Type check
  if (!Array.isArray(value)) {
    throw ValidationError.typeError(value, 'array', fieldName);
  }
  
  // Constraints
  if (options?.minLength !== undefined && value.length < options.minLength) {
    throw ValidationError.constraintError(
      fieldName, 
      'minLength', 
      `Array must contain at least ${options.minLength} items`
    );
  }
  
  if (options?.maxLength !== undefined && value.length > options.maxLength) {
    throw ValidationError.constraintError(
      fieldName, 
      'maxLength', 
      `Array must contain at most ${options.maxLength} items`
    );
  }
  
  // Validate items if itemValidator is provided
  if (options?.itemValidator) {
    return value.map((item, index) => {
      try {
        return options.itemValidator!(item, index);
      } catch (error) {
        if (error instanceof ValidationError) {
          throw new ValidationError(
            `Invalid item at index ${index} in ${fieldName}: ${error.message}`,
            {
              field: `${fieldName}[${index}]`,
              rule: error.rule,
              details: error.details,
              originalError: error
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
 * Validate that a value is an object
 * 
 * @param value The value to validate
 * @param fieldName Name of the field for error reporting
 * @param options Validation options
 * @returns The validated object
 * @throws ValidationError if the value is not an object
 */
export function validateObject<T extends object>(
  value: unknown, 
  fieldName: string,
  options?: ValidationOptions & {
    schema?: Record<string, (value: unknown, fieldName: string) => any>;
    allowExtraProperties?: boolean;
  }
): T {
  // Handle null/undefined
  if (value === null) {
    if (options?.allowNull) return {} as any;
    throw ValidationError.requiredError(fieldName);
  }
  
  if (value === undefined) {
    if (options?.allowUndefined) return {} as any;
    throw ValidationError.requiredError(fieldName);
  }
  
  // Type check
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw ValidationError.typeError(
      value, 
      'object', 
      fieldName
    );
  }
  
  // Validate schema if provided
  if (options?.schema) {
    const validated: Record<string, any> = {};
    const errors: Record<string, string> = {};
    
    // Validate each field in the schema
    for (const [key, validator] of Object.entries(options.schema)) {
      try {
        validated[key] = validator((value as any)[key], `${fieldName}.${key}`);
      } catch (error) {
        if (error instanceof ValidationError) {
          errors[key] = error.message;
        } else {
          errors[key] = String(error);
        }
      }
    }
    
    // Check for extra properties
    if (!options.allowExtraProperties) {
      for (const key of Object.keys(value as Record<string, any>)) {
        if (!(key in options.schema)) {
          errors[key] = `Unexpected property: ${key}`;
        }
      }
    }
    
    // If there are validation errors, throw a schema error
    if (Object.keys(errors).length > 0) {
      throw ValidationError.schemaError(fieldName, errors);
    }
    
    return validated as T;
  }
  
  return value as T;
}

/**
 * Validate that a value is a date
 * 
 * @param value The value to validate
 * @param fieldName Name of the field for error reporting
 * @param options Validation options
 * @returns The validated date
 * @throws ValidationError if the value is not a valid date
 */
export function validateDate(
  value: unknown, 
  fieldName: string,
  options?: ValidationOptions & {
    min?: Date;
    max?: Date;
  }
): Date {
  // Handle null/undefined
  if (value === null) {
    if (options?.allowNull) return new Date() as any;
    throw ValidationError.requiredError(fieldName);
  }
  
  if (value === undefined) {
    if (options?.allowUndefined) return new Date() as any;
    throw ValidationError.requiredError(fieldName);
  }
  
  // Convert string to date if possible
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      value = parsed;
    }
  }
  
  // Convert number (timestamp) to date if possible
  if (typeof value === 'number') {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      value = parsed;
    }
  }
  
  // Type check
  if (!(value instanceof Date) || isNaN(value.getTime())) {
    throw ValidationError.typeError(value, 'Date', fieldName);
  }
  
  // Constraints
  if (options?.min && value < options.min) {
    throw ValidationError.constraintError(
      fieldName, 
      'minDate', 
      `Date must be on or after ${options.min.toISOString()}`
    );
  }
  
  if (options?.max && value > options.max) {
    throw ValidationError.constraintError(
      fieldName, 
      'maxDate', 
      `Date must be on or before ${options.max.toISOString()}`
    );
  }
  
  return value;
}

/**
 * Validate that a value matches a specific type from a list of valid values
 * 
 * @param value The value to validate
 * @param validValues Array of valid values
 * @param fieldName Name of the field for error reporting
 * @param options Validation options
 * @returns The validated value
 * @throws ValidationError if the value is not in the list of valid values
 */
export function validateEnum<T extends string | number>(
  value: unknown,
  validValues: readonly T[],
  fieldName: string,
  options?: ValidationOptions
): T {
  // Handle null/undefined
  if (value === null) {
    if (options?.allowNull) return validValues[0] as any;
    throw ValidationError.requiredError(fieldName);
  }
  
  if (value === undefined) {
    if (options?.allowUndefined) return validValues[0] as any;
    throw ValidationError.requiredError(fieldName);
  }
  
  // Check if value is in the list of valid values
  if (!validValues.includes(value as T)) {
    throw ValidationError.constraintError(
      fieldName,
      'enum',
      `Value must be one of: ${validValues.join(', ')}`
    );
  }
  
  return value as T;
}

/**
 * Validate that a value matches one of the specified types
 * 
 * @param value Value to validate
 * @param validators Array of validator functions to try
 * @param fieldName Field name for error reporting
 * @param options Validation options
 * @returns The validated value
 * @throws ValidationError if the value doesn't match any of the specified types
 */
export function validateOneOf<T>(
  value: unknown,
  validators: Array<(v: unknown, f: string, o?: ValidationOptions) => unknown>,
  fieldName: string,
  options?: ValidationOptions
): T {
  if (value === null) {
    if (options?.allowNull) return null as any;
  }
  
  if (value === undefined) {
    if (options?.allowUndefined) return undefined as any;
  }
  
  const errors: ValidationError[] = [];

  for (const validator of validators) {
    try {
      return validator(value, fieldName, { ...options, allowNull: false, allowUndefined: false }) as T;
    } catch (error) {
      if (error instanceof ValidationError) {
        errors.push(error);
      } else {
        throw error;
      }
    }
  }

  throw new ValidationError(
    `${fieldName} failed to validate against any of the allowed types`, 
    {
      field: fieldName,
      details: errors.map(e => e.message).join('; '),
      metadata: { errors }
    }
  );
}

/**
 * Creates a schema validator function from an object of field validators
 * 
 * @param schema Object mapping field names to validator functions
 * @param options Validation options
 * @returns A function that validates objects against the schema
 */
export function createSchemaValidator<T extends object>(
  schema: Record<string, (value: unknown, fieldName: string) => any>,
  options?: Omit<ValidationOptions, 'allowNull' | 'allowUndefined'> & {
    allowExtraProperties?: boolean;
    allowNull?: boolean;
    allowUndefined?: boolean;
  }
): (value: unknown, fieldName: string) => T {
  return (value: unknown, fieldName: string): T => {
    return validateObject<T>(value, fieldName, {
      ...options,
      schema
    });
  };
}

export default {
  validateDefined,
  validateString,
  validateNumber,
  validateBoolean,
  validateArray,
  validateObject,
  validateDate,
  validateEnum,
  validateOneOf,
  createSchemaValidator,
  isValidationError
};
