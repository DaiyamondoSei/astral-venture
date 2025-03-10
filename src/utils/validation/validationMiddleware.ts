
/**
 * Validation middleware for consistent API request/response validation
 */
import { ValidationError } from './ValidationError';
import * as validators from './runtimeValidation';
import { handleError, ErrorCategory, ErrorSeverity } from '../errorHandling';

/**
 * Configuration for validation middleware
 */
export interface ValidationConfig {
  /** Enable performance tracking for validations */
  trackPerformance?: boolean;
  /** Enable logging for validation failures */
  logValidationErrors?: boolean;
  /** Show toast notifications for validation errors */
  showValidationToasts?: boolean;
}

/**
 * Global validation configuration
 */
const globalConfig: ValidationConfig = {
  trackPerformance: true,
  logValidationErrors: true,
  showValidationToasts: true
};

/**
 * Set global validation configuration
 */
export function setValidationConfig(config: Partial<ValidationConfig>): void {
  Object.assign(globalConfig, config);
}

/**
 * Get the current validation configuration
 */
export function getValidationConfig(): ValidationConfig {
  return { ...globalConfig };
}

/**
 * Type for a validation middleware function
 */
export type ValidationMiddleware<T, R> = (input: T) => R;

/**
 * Create a validator function that implements the validation middleware pattern
 * 
 * @param validator Function that validates input
 * @param errorHandler Optional custom error handler
 * @param config Validation configuration
 * @returns Middleware function that validates input
 */
export function createValidator<T, R>(
  validator: (input: T) => R,
  errorHandler?: (error: unknown) => void,
  config?: Partial<ValidationConfig>
): ValidationMiddleware<T, R> {
  const mergedConfig = { ...globalConfig, ...config };
  
  return (input: T): R => {
    try {
      // Track validation performance if enabled
      if (mergedConfig.trackPerformance) {
        const startTime = performance.now();
        const result = validator(input);
        const duration = performance.now() - startTime;
        
        // Log slow validations
        if (duration > 5) {
          console.debug(`[Validation] Validation took ${duration.toFixed(2)}ms`);
        }
        
        return result;
      } else {
        return validator(input);
      }
    } catch (error) {
      // Use custom error handler if provided
      if (errorHandler) {
        errorHandler(error);
      }
      
      // Use global error handling
      handleError(error, {
        context: 'Data validation',
        category: ErrorCategory.VALIDATION,
        severity: ErrorSeverity.WARNING,
        showToast: mergedConfig.showValidationToasts,
        isValidation: true,
        includeValidationDetails: true,
        rethrow: true
      });
      
      // This will never execute due to rethrow, but TypeScript requires a return
      throw error;
    }
  };
}

/**
 * Create a typed validation function for a specific shape of data
 * 
 * @param name Name of the data being validated (for error messages)
 * @param validator Validation function
 * @returns Middleware function that validates and returns typed data
 */
export function createTypedValidator<T>(
  name: string,
  validator: (input: unknown) => T
): ValidationMiddleware<unknown, T> {
  return createValidator(
    (input: unknown): T => {
      try {
        return validator(input);
      } catch (error) {
        if (error instanceof ValidationError) {
          throw error;
        }
        throw ValidationError.fromError(
          `Failed to validate ${name}`, 
          error,
          name
        );
      }
    }
  );
}

// Export validators to be used with the middleware
export { validators };

export default {
  createValidator,
  createTypedValidator,
  setValidationConfig,
  getValidationConfig,
  ...validators
};
