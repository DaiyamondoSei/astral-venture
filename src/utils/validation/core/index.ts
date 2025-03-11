
/**
 * Core validation functionality
 */
import { 
  ValidationResult,
  ValidationErrorDetail,
  Validator,
  ValidationContext
} from '../types';

// Validation cache using WeakMap for memory efficiency
const validationCache = new WeakMap<object, ValidationResult>();

/**
 * Create an optimized validator with caching
 */
export function createCachedValidator<T>(
  validator: Validator<T>
): Validator<T> {
  return (value: unknown, context?: ValidationContext): ValidationResult<T> => {
    // Only cache object values
    if (typeof value !== 'object' || value === null) {
      return validator(value, context);
    }

    const cached = validationCache.get(value);
    if (cached) {
      return cached as ValidationResult<T>;
    }

    const result = validator(value, context);
    validationCache.set(value, result);
    return result;
  };
}

/**
 * Create a validator that runs multiple validators in sequence
 */
export function composeValidators<T>(
  validators: Validator[]
): Validator<T> {
  return (value: unknown, context?: ValidationContext): ValidationResult<T> => {
    for (const validator of validators) {
      const result = validator(value, context);
      if (!result.valid) {
        return result;
      }
    }
    return { valid: true, validatedData: value as T };
  };
}

/**
 * Create a type guard validator
 */
export function createTypeGuard<T>(
  guard: (value: unknown) => value is T,
  code: string,
  message: string
): Validator<T> {
  return (value: unknown): ValidationResult<T> => {
    if (guard(value)) {
      return { valid: true, validatedData: value };
    }
    return {
      valid: false,
      error: {
        path: '',
        message,
        code
      }
    };
  };
}

export * from './validators';
export * from './pipeline';
