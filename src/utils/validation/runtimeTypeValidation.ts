
import { handleError, ErrorCategory, ErrorSeverity } from '../errorHandling';
import { ValidationError } from './runtimeValidation';

/**
 * Runtime type checking utilities for validating data at runtime.
 * This helps ensure that data from APIs and other external sources
 * matches the expected TypeScript types.
 */

/**
 * Options for type validation
 */
export interface TypeValidationOptions {
  /** Whether to include more detailed information in error messages */
  verbose?: boolean;
  /** Custom error message prefix */
  errorPrefix?: string;
  /** Whether to throw on validation failure or return null */
  throwOnError?: boolean;
}

/**
 * Result of a type validation
 */
export type TypeValidationResult<T> = {
  /** Whether the validation succeeded */
  valid: boolean;
  /** The validated value (only set if valid) */
  value?: T;
  /** Error message (only set if not valid) */
  error?: string;
};

/**
 * Base validator class that all type validators extend
 */
export abstract class TypeValidator<T> {
  protected options: Required<TypeValidationOptions>;

  constructor(options: TypeValidationOptions = {}) {
    this.options = {
      verbose: options.verbose ?? false,
      errorPrefix: options.errorPrefix ?? 'Type validation error',
      throwOnError: options.throwOnError ?? true,
    };
  }

  /**
   * Validate a value and return a detailed result
   */
  public validate(value: unknown): TypeValidationResult<T> {
    try {
      return this.doValidate(value);
    } catch (error) {
      // Handle unexpected errors during validation
      handleError(error, {
        category: ErrorCategory.VALIDATION,
        severity: ErrorSeverity.WARNING,
        context: 'Runtime Type Validation',
        showToast: false,
      });
      
      return {
        valid: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Validate and return the value, throwing an error on failure
   */
  public validateOrThrow(value: unknown): T {
    const result = this.doValidate(value);
    
    if (!result.valid) {
      throw new ValidationError(result.error || 'Validation failed');
    }
    
    return result.value as T;
  }

  /**
   * Implementation of the specific validation logic
   */
  protected abstract doValidate(value: unknown): TypeValidationResult<T>;
}

/**
 * String validator
 */
export class StringValidator extends TypeValidator<string> {
  private readonly minLength?: number;
  private readonly maxLength?: number;
  private readonly pattern?: RegExp;

  constructor(options: TypeValidationOptions & {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  } = {}) {
    super(options);
    this.minLength = options.minLength;
    this.maxLength = options.maxLength;
    this.pattern = options.pattern;
  }

  protected doValidate(value: unknown): TypeValidationResult<string> {
    if (typeof value !== 'string') {
      return {
        valid: false,
        error: `${this.options.errorPrefix}: Expected string but got ${typeof value}`
      };
    }

    if (this.minLength !== undefined && value.length < this.minLength) {
      return {
        valid: false,
        error: `${this.options.errorPrefix}: String length ${value.length} is less than minimum length ${this.minLength}`
      };
    }

    if (this.maxLength !== undefined && value.length > this.maxLength) {
      return {
        valid: false,
        error: `${this.options.errorPrefix}: String length ${value.length} exceeds maximum length ${this.maxLength}`
      };
    }

    if (this.pattern !== undefined && !this.pattern.test(value)) {
      return {
        valid: false,
        error: `${this.options.errorPrefix}: String does not match required pattern`
      };
    }

    return {
      valid: true,
      value
    };
  }
}

/**
 * Number validator
 */
export class NumberValidator extends TypeValidator<number> {
  private readonly min?: number;
  private readonly max?: number;
  private readonly integer?: boolean;

  constructor(options: TypeValidationOptions & {
    min?: number;
    max?: number;
    integer?: boolean;
  } = {}) {
    super(options);
    this.min = options.min;
    this.max = options.max;
    this.integer = options.integer;
  }

  protected doValidate(value: unknown): TypeValidationResult<number> {
    if (typeof value !== 'number' || isNaN(value)) {
      return {
        valid: false,
        error: `${this.options.errorPrefix}: Expected number but got ${typeof value}`
      };
    }

    if (this.integer === true && !Number.isInteger(value)) {
      return {
        valid: false,
        error: `${this.options.errorPrefix}: Expected integer but got ${value}`
      };
    }

    if (this.min !== undefined && value < this.min) {
      return {
        valid: false,
        error: `${this.options.errorPrefix}: Value ${value} is less than minimum ${this.min}`
      };
    }

    if (this.max !== undefined && value > this.max) {
      return {
        valid: false,
        error: `${this.options.errorPrefix}: Value ${value} exceeds maximum ${this.max}`
      };
    }

    return {
      valid: true,
      value
    };
  }
}

/**
 * Boolean validator
 */
export class BooleanValidator extends TypeValidator<boolean> {
  protected doValidate(value: unknown): TypeValidationResult<boolean> {
    if (typeof value !== 'boolean') {
      return {
        valid: false,
        error: `${this.options.errorPrefix}: Expected boolean but got ${typeof value}`
      };
    }

    return {
      valid: true,
      value
    };
  }
}

/**
 * Array validator
 */
export class ArrayValidator<T> extends TypeValidator<T[]> {
  private readonly itemValidator: TypeValidator<T>;
  private readonly minLength?: number;
  private readonly maxLength?: number;

  constructor(
    itemValidator: TypeValidator<T>,
    options: TypeValidationOptions & {
      minLength?: number;
      maxLength?: number;
    } = {}
  ) {
    super(options);
    this.itemValidator = itemValidator;
    this.minLength = options.minLength;
    this.maxLength = options.maxLength;
  }

  protected doValidate(value: unknown): TypeValidationResult<T[]> {
    if (!Array.isArray(value)) {
      return {
        valid: false,
        error: `${this.options.errorPrefix}: Expected array but got ${typeof value}`
      };
    }

    if (this.minLength !== undefined && value.length < this.minLength) {
      return {
        valid: false,
        error: `${this.options.errorPrefix}: Array length ${value.length} is less than minimum length ${this.minLength}`
      };
    }

    if (this.maxLength !== undefined && value.length > this.maxLength) {
      return {
        valid: false,
        error: `${this.options.errorPrefix}: Array length ${value.length} exceeds maximum length ${this.maxLength}`
      };
    }

    const validatedItems: T[] = [];
    
    for (let i = 0; i < value.length; i++) {
      const itemResult = this.itemValidator.validate(value[i]);
      
      if (!itemResult.valid) {
        return {
          valid: false,
          error: `${this.options.errorPrefix}: Invalid array item at index ${i}: ${itemResult.error}`
        };
      }
      
      validatedItems.push(itemResult.value as T);
    }

    return {
      valid: true,
      value: validatedItems
    };
  }
}

/**
 * Create a string validator
 */
export function string(options?: TypeValidationOptions & {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
}): StringValidator {
  return new StringValidator(options);
}

/**
 * Create a number validator
 */
export function number(options?: TypeValidationOptions & {
  min?: number;
  max?: number;
  integer?: boolean;
}): NumberValidator {
  return new NumberValidator(options);
}

/**
 * Create a boolean validator
 */
export function boolean(options?: TypeValidationOptions): BooleanValidator {
  return new BooleanValidator(options);
}

/**
 * Create an array validator
 */
export function array<T>(
  itemValidator: TypeValidator<T>,
  options?: TypeValidationOptions & {
    minLength?: number;
    maxLength?: number;
  }
): ArrayValidator<T> {
  return new ArrayValidator(itemValidator, options);
}
