
import { ValidationError } from './runtimeValidation';

/**
 * Result of a validation operation
 */
export interface ValidationResult<T> {
  /**
   * Whether the validation was successful
   */
  success: boolean;
  
  /**
   * The validated data (only available if success is true)
   */
  data?: T;
  
  /**
   * Validation errors (only available if success is false)
   */
  errors?: ValidationError[];
}

/**
 * Type for validation schema definition
 */
export type ValidationSchema<T extends Record<string, unknown>> = {
  [K in keyof T]: SchemaValidator<T[K]>;
};

/**
 * Base interface for schema validators
 */
export interface SchemaValidator<T> {
  /**
   * Validates a value against the schema
   * 
   * @param value - The value to validate
   * @param path - The path to the value in the object being validated
   * @returns The validated value
   * @throws ValidationError if validation fails
   */
  validate(value: unknown, path: string): T;
}

/**
 * Validates a string value
 */
export class StringValidator implements SchemaValidator<string> {
  private minLength?: number;
  private maxLength?: number;
  private pattern?: RegExp;
  private allowEmpty: boolean;

  constructor(options: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    allowEmpty?: boolean;
  } = {}) {
    this.minLength = options.minLength;
    this.maxLength = options.maxLength;
    this.pattern = options.pattern;
    this.allowEmpty = options.allowEmpty ?? false;
  }

  validate(value: unknown, path: string): string {
    // Check type
    if (typeof value !== 'string') {
      throw new ValidationError(`${path} must be a string`, {
        code: 'INVALID_TYPE',
        details: { path, expected: 'string', received: typeof value }
      });
    }

    // Check empty
    if (!this.allowEmpty && value.trim() === '') {
      throw new ValidationError(`${path} cannot be empty`, {
        code: 'EMPTY_STRING',
        details: { path }
      });
    }

    // Check min length
    if (this.minLength !== undefined && value.length < this.minLength) {
      throw new ValidationError(`${path} must be at least ${this.minLength} characters`, {
        code: 'MIN_LENGTH',
        details: { path, minLength: this.minLength, actual: value.length }
      });
    }

    // Check max length
    if (this.maxLength !== undefined && value.length > this.maxLength) {
      throw new ValidationError(`${path} cannot exceed ${this.maxLength} characters`, {
        code: 'MAX_LENGTH',
        details: { path, maxLength: this.maxLength, actual: value.length }
      });
    }

    // Check pattern
    if (this.pattern && !this.pattern.test(value)) {
      throw new ValidationError(`${path} has an invalid format`, {
        code: 'INVALID_FORMAT',
        details: { path, pattern: this.pattern.toString() }
      });
    }

    return value;
  }
}

/**
 * Validates a number value
 */
export class NumberValidator implements SchemaValidator<number> {
  private min?: number;
  private max?: number;
  private integer: boolean;

  constructor(options: {
    min?: number;
    max?: number;
    integer?: boolean;
  } = {}) {
    this.min = options.min;
    this.max = options.max;
    this.integer = options.integer ?? false;
  }

  validate(value: unknown, path: string): number {
    // Check type
    if (typeof value !== 'number' || isNaN(value)) {
      throw new ValidationError(`${path} must be a number`, {
        code: 'INVALID_TYPE',
        details: { path, expected: 'number', received: typeof value }
      });
    }

    // Check integer
    if (this.integer && !Number.isInteger(value)) {
      throw new ValidationError(`${path} must be an integer`, {
        code: 'NOT_INTEGER',
        details: { path }
      });
    }

    // Check min
    if (this.min !== undefined && value < this.min) {
      throw new ValidationError(`${path} must be at least ${this.min}`, {
        code: 'MIN_VALUE',
        details: { path, min: this.min, actual: value }
      });
    }

    // Check max
    if (this.max !== undefined && value > this.max) {
      throw new ValidationError(`${path} cannot exceed ${this.max}`, {
        code: 'MAX_VALUE',
        details: { path, max: this.max, actual: value }
      });
    }

    return value;
  }
}

/**
 * Validates a boolean value
 */
export class BooleanValidator implements SchemaValidator<boolean> {
  validate(value: unknown, path: string): boolean {
    if (typeof value !== 'boolean') {
      throw new ValidationError(`${path} must be a boolean`, {
        code: 'INVALID_TYPE',
        details: { path, expected: 'boolean', received: typeof value }
      });
    }
    return value;
  }
}

/**
 * Validates an array of values
 */
export class ArrayValidator<T> implements SchemaValidator<T[]> {
  private itemValidator: SchemaValidator<T>;
  private minItems?: number;
  private maxItems?: number;
  private unique: boolean;

  constructor(
    itemValidator: SchemaValidator<T>,
    options: {
      minItems?: number;
      maxItems?: number;
      unique?: boolean;
    } = {}
  ) {
    this.itemValidator = itemValidator;
    this.minItems = options.minItems;
    this.maxItems = options.maxItems;
    this.unique = options.unique ?? false;
  }

  validate(value: unknown, path: string): T[] {
    // Check type
    if (!Array.isArray(value)) {
      throw new ValidationError(`${path} must be an array`, {
        code: 'INVALID_TYPE',
        details: { path, expected: 'array', received: typeof value }
      });
    }

    // Check min items
    if (this.minItems !== undefined && value.length < this.minItems) {
      throw new ValidationError(`${path} must contain at least ${this.minItems} items`, {
        code: 'MIN_ITEMS',
        details: { path, minItems: this.minItems, actual: value.length }
      });
    }

    // Check max items
    if (this.maxItems !== undefined && value.length > this.maxItems) {
      throw new ValidationError(`${path} cannot contain more than ${this.maxItems} items`, {
        code: 'MAX_ITEMS',
        details: { path, maxItems: this.maxItems, actual: value.length }
      });
    }

    // Validate each item
    const validatedItems: T[] = [];
    for (let i = 0; i < value.length; i++) {
      try {
        validatedItems.push(this.itemValidator.validate(value[i], `${path}[${i}]`));
      } catch (error) {
        if (error instanceof ValidationError) {
          throw error;
        }
        throw new ValidationError(`Invalid item at ${path}[${i}]`, {
          code: 'INVALID_ITEM',
          details: { path: `${path}[${i}]`, error }
        });
      }
    }

    // Check uniqueness
    if (this.unique) {
      const seen = new Set();
      for (let i = 0; i < validatedItems.length; i++) {
        const item = JSON.stringify(validatedItems[i]);
        if (seen.has(item)) {
          throw new ValidationError(`${path} must contain unique items`, {
            code: 'DUPLICATE_ITEMS',
            details: { path, duplicateIndex: i }
          });
        }
        seen.add(item);
      }
    }

    return validatedItems;
  }
}

/**
 * Validates an object against a schema
 */
export class ObjectValidator<T extends Record<string, unknown>> implements SchemaValidator<T> {
  private schema: ValidationSchema<T>;
  private additionalProperties: boolean;
  private requiredProperties: (keyof T)[];

  constructor(
    schema: ValidationSchema<T>,
    options: {
      additionalProperties?: boolean;
      required?: (keyof T)[];
    } = {}
  ) {
    this.schema = schema;
    this.additionalProperties = options.additionalProperties ?? false;
    this.requiredProperties = options.required ?? Object.keys(schema) as (keyof T)[];
  }

  validate(value: unknown, path: string): T {
    // Check type
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new ValidationError(`${path} must be an object`, {
        code: 'INVALID_TYPE',
        details: { path, expected: 'object', received: typeof value }
      });
    }

    const obj = value as Record<string, unknown>;
    const result = {} as T;

    // Check required properties
    for (const prop of this.requiredProperties) {
      if (!(prop in obj)) {
        throw new ValidationError(`${path} is missing required property: ${String(prop)}`, {
          code: 'MISSING_PROPERTY',
          details: { path, property: String(prop) }
        });
      }
    }

    // Check for additional properties
    if (!this.additionalProperties) {
      const extraProps = Object.keys(obj).filter(key => !(key in this.schema));
      if (extraProps.length > 0) {
        throw new ValidationError(`${path} contains additional properties: ${extraProps.join(', ')}`, {
          code: 'ADDITIONAL_PROPERTIES',
          details: { path, additionalProperties: extraProps }
        });
      }
    }

    // Validate each property against its schema
    for (const [key, validator] of Object.entries(this.schema)) {
      if (key in obj) {
        try {
          // @ts-ignore - Dynamic property assignment
          result[key] = validator.validate(obj[key], path ? `${path}.${key}` : key);
        } catch (error) {
          if (error instanceof ValidationError) {
            throw error;
          }
          throw new ValidationError(`Invalid property at ${path}.${key}`, {
            code: 'INVALID_PROPERTY',
            details: { path: `${path}.${key}`, error }
          });
        }
      }
    }

    return result;
  }
}

/**
 * Creates a schema validator for a specific type
 * 
 * @param schema - The validation schema
 * @returns A function that validates objects against the schema
 */
export function createValidator<T extends Record<string, unknown>>(
  schema: ValidationSchema<T>
): (value: unknown) => ValidationResult<T> {
  const validator = new ObjectValidator(schema);
  
  return (value: unknown): ValidationResult<T> => {
    try {
      const data = validator.validate(value, '');
      return { success: true, data };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, errors: [error] };
      }
      return { 
        success: false, 
        errors: [new ValidationError('Validation failed', {
          code: 'VALIDATION_ERROR',
          details: { error }
        })] 
      };
    }
  };
}

/**
 * Creates an API-specific validator that throws errors
 * with HTTP status codes
 * 
 * @param schema - The validation schema
 * @returns A function that validates and returns the validated data
 */
export function createApiValidator<T extends Record<string, unknown>>(
  schema: ValidationSchema<T>
): (value: unknown) => T {
  const validator = new ObjectValidator(schema);
  
  return (value: unknown): T => {
    try {
      return validator.validate(value, '');
    } catch (error) {
      if (error instanceof ValidationError) {
        // Ensure the error has a status code for API responses
        if (!error.statusCode) {
          error.statusCode = 400;
        }
        throw error;
      }
      
      throw new ValidationError('Validation failed', {
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        details: { error }
      });
    }
  };
}

/**
 * Validates an object against a schema
 * 
 * @param value - The value to validate
 * @param schema - The validation schema
 * @returns The validated object
 */
export function validateSchema<T extends Record<string, unknown>>(
  value: unknown,
  schema: ValidationSchema<T>
): T {
  const validator = new ObjectValidator(schema);
  return validator.validate(value, '');
}
