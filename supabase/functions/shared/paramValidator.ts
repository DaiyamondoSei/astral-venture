
/**
 * Parameter validation utilities for edge functions
 */
import { ValidationError, ErrorCode } from "./types.ts";

/**
 * Validator function signature
 */
type ValidatorFn<T> = (value: unknown) => T;

/**
 * Validate a required parameter
 */
export function required<T>(validator: ValidatorFn<T>): ValidatorFn<T> {
  return (value: unknown): T => {
    if (value === undefined || value === null) {
      throw new ValidationError("Required parameter is missing", "required", "missing_parameter");
    }
    return validator(value);
  };
}

/**
 * Validate an optional parameter
 */
export function optional<T>(validator: ValidatorFn<T>, defaultValue?: T): ValidatorFn<T | undefined> {
  return (value: unknown): T | undefined => {
    if (value === undefined || value === null) {
      return defaultValue;
    }
    return validator(value);
  };
}

/**
 * Validate that a value is a string
 */
export function string(options: { minLength?: number; maxLength?: number; pattern?: RegExp } = {}): ValidatorFn<string> {
  return (value: unknown): string => {
    if (typeof value !== "string") {
      throw new ValidationError(
        `Expected string but got ${typeof value}`, 
        "type", 
        ErrorCode.INVALID_PARAMETERS
      );
    }
    
    const { minLength, maxLength, pattern } = options;
    
    if (minLength !== undefined && value.length < minLength) {
      throw new ValidationError(
        `String must be at least ${minLength} characters`, 
        "constraint", 
        ErrorCode.VALIDATION_FAILED
      );
    }
    
    if (maxLength !== undefined && value.length > maxLength) {
      throw new ValidationError(
        `String must be at most ${maxLength} characters`, 
        "constraint", 
        ErrorCode.VALIDATION_FAILED
      );
    }
    
    if (pattern !== undefined && !pattern.test(value)) {
      throw new ValidationError(
        `String must match pattern ${pattern}`, 
        "constraint", 
        ErrorCode.VALIDATION_FAILED
      );
    }
    
    return value;
  };
}

/**
 * Validate that a value is a number
 */
export function number(options: { min?: number; max?: number; integer?: boolean } = {}): ValidatorFn<number> {
  return (value: unknown): number => {
    let num: number;
    if (typeof value === "string") {
      num = Number(value);
      if (isNaN(num)) {
        throw new ValidationError(
          `Cannot convert string to number: ${value}`, 
          "type", 
          ErrorCode.INVALID_PARAMETERS
        );
      }
    } else if (typeof value !== "number") {
      throw new ValidationError(
        `Expected number but got ${typeof value}`, 
        "type", 
        ErrorCode.INVALID_PARAMETERS
      );
    } else {
      num = value;
    }
    
    const { min, max, integer } = options;
    
    if (min !== undefined && num < min) {
      throw new ValidationError(
        `Number must be at least ${min}`, 
        "constraint", 
        ErrorCode.VALIDATION_FAILED
      );
    }
    
    if (max !== undefined && num > max) {
      throw new ValidationError(
        `Number must be at most ${max}`, 
        "constraint", 
        ErrorCode.VALIDATION_FAILED
      );
    }
    
    if (integer === true && !Number.isInteger(num)) {
      throw new ValidationError(
        "Number must be an integer", 
        "constraint", 
        ErrorCode.VALIDATION_FAILED
      );
    }
    
    return num;
  };
}

/**
 * Validate that a value is a boolean
 */
export function boolean(): ValidatorFn<boolean> {
  return (value: unknown): boolean => {
    if (typeof value === "string") {
      if (value.toLowerCase() === "true") return true;
      if (value.toLowerCase() === "false") return false;
      throw new ValidationError(
        `Cannot convert string to boolean: ${value}`, 
        "type", 
        ErrorCode.INVALID_PARAMETERS
      );
    }
    
    if (typeof value !== "boolean") {
      throw new ValidationError(
        `Expected boolean but got ${typeof value}`, 
        "type", 
        ErrorCode.INVALID_PARAMETERS
      );
    }
    
    return value;
  };
}

/**
 * Validate that a value is an array
 */
export function array<T>(itemValidator: ValidatorFn<T>, options: { minLength?: number; maxLength?: number } = {}): ValidatorFn<T[]> {
  return (value: unknown): T[] => {
    if (!Array.isArray(value)) {
      throw new ValidationError(
        `Expected array but got ${typeof value}`, 
        "type", 
        ErrorCode.INVALID_PARAMETERS
      );
    }
    
    const { minLength, maxLength } = options;
    
    if (minLength !== undefined && value.length < minLength) {
      throw new ValidationError(
        `Array must have at least ${minLength} items`, 
        "constraint", 
        ErrorCode.VALIDATION_FAILED
      );
    }
    
    if (maxLength !== undefined && value.length > maxLength) {
      throw new ValidationError(
        `Array must have at most ${maxLength} items`, 
        "constraint", 
        ErrorCode.VALIDATION_FAILED
      );
    }
    
    return value.map((item, index) => {
      try {
        return itemValidator(item);
      } catch (error) {
        if (error instanceof ValidationError) {
          throw new ValidationError(
            `Invalid item at index ${index}: ${error.message}`, 
            "validation", 
            ErrorCode.VALIDATION_FAILED
          );
        }
        throw error;
      }
    });
  };
}

/**
 * Validate that a value is an object
 */
export function object<T extends Record<string, unknown>>(schema: Record<keyof T, ValidatorFn<any>>): ValidatorFn<T> {
  return (value: unknown): T => {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      throw new ValidationError(
        `Expected object but got ${value === null ? "null" : typeof value}`, 
        "type", 
        ErrorCode.INVALID_PARAMETERS
      );
    }
    
    const result: Record<string, any> = {};
    const inputObj = value as Record<string, unknown>;
    
    for (const [key, validator] of Object.entries(schema)) {
      try {
        result[key] = validator(inputObj[key]);
      } catch (error) {
        if (error instanceof ValidationError) {
          throw new ValidationError(
            `Invalid value for field "${key}": ${error.message}`, 
            "validation", 
            ErrorCode.VALIDATION_FAILED
          );
        }
        throw error;
      }
    }
    
    return result as T;
  };
}

/**
 * Validate an enum value
 */
export function enumValue<T extends string | number>(allowedValues: readonly T[]): ValidatorFn<T> {
  return (value: unknown): T => {
    if (typeof value !== "string" && typeof value !== "number") {
      throw new ValidationError(
        `Expected string or number but got ${typeof value}`, 
        "type", 
        ErrorCode.INVALID_PARAMETERS
      );
    }
    
    if (!allowedValues.includes(value as T)) {
      throw new ValidationError(
        `Value must be one of: ${allowedValues.join(", ")}`, 
        "constraint", 
        ErrorCode.VALIDATION_FAILED
      );
    }
    
    return value as T;
  };
}

/**
 * Validate a UUID string
 */
export function uuid(): ValidatorFn<string> {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return (value: unknown): string => {
    if (typeof value !== "string") {
      throw new ValidationError(
        `Expected UUID string but got ${typeof value}`, 
        "type", 
        ErrorCode.INVALID_PARAMETERS
      );
    }
    
    if (!uuidPattern.test(value)) {
      throw new ValidationError(
        "Invalid UUID format", 
        "format", 
        ErrorCode.INVALID_PARAMETERS
      );
    }
    
    return value;
  };
}

/**
 * Validate a date string
 */
export function date(): ValidatorFn<Date> {
  return (value: unknown): Date => {
    if (typeof value !== "string" && !(value instanceof Date) && typeof value !== "number") {
      throw new ValidationError(
        `Expected date string, Date object, or timestamp but got ${typeof value}`, 
        "type", 
        ErrorCode.INVALID_PARAMETERS
      );
    }
    
    const date = new Date(value as string | number | Date);
    
    if (isNaN(date.getTime())) {
      throw new ValidationError(
        "Invalid date format", 
        "format", 
        ErrorCode.INVALID_PARAMETERS
      );
    }
    
    return date;
  };
}

/**
 * Validate an email address
 */
export function email(): ValidatorFn<string> {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return (value: unknown): string => {
    if (typeof value !== "string") {
      throw new ValidationError(
        `Expected email string but got ${typeof value}`, 
        "type", 
        ErrorCode.INVALID_PARAMETERS
      );
    }
    
    if (!emailPattern.test(value)) {
      throw new ValidationError(
        "Invalid email format", 
        "format", 
        ErrorCode.INVALID_PARAMETERS
      );
    }
    
    return value;
  };
}

/**
 * Validate one of multiple possible types
 */
export function oneOf<T>(validators: ValidatorFn<any>[]): ValidatorFn<T> {
  return (value: unknown): T => {
    const errors: string[] = [];
    
    for (const validator of validators) {
      try {
        return validator(value) as T;
      } catch (error) {
        if (error instanceof ValidationError) {
          errors.push(error.message);
        } else {
          errors.push(String(error));
        }
      }
    }
    
    throw new ValidationError(
      `Value didn't match any of the expected types. Errors: ${errors.join(", ")}`,
      "validation",
      ErrorCode.VALIDATION_FAILED
    );
  };
}

/**
 * Validate request parameters
 */
export function validateParams<T extends Record<string, unknown>>(
  params: unknown,
  schema: Record<keyof T, ValidatorFn<any>>
): T {
  return object<T>(schema)(params);
}

export default {
  required,
  optional,
  string,
  number,
  boolean,
  array,
  object,
  enumValue,
  uuid,
  date,
  email,
  oneOf,
  validateParams
};
