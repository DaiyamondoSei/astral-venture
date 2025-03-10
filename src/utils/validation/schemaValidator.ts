
import { ValidationError } from './runtimeValidation';

/**
 * Result of schema validation
 */
export interface ValidationResult<T> {
  /** Whether the validation was successful */
  isValid: boolean;
  /** The validated data (if validation was successful) */
  data?: T;
  /** Validation errors (if validation failed) */
  errors?: ValidationError[];
}

/**
 * Interface for schema validator
 */
export interface SchemaValidator<T> {
  /** Validate data against schema */
  validate: (data: unknown) => ValidationResult<T>;
  /** Parse data and throw if invalid */
  parse: (data: unknown) => T;
  /** Check if data matches schema without returning the data */
  check: (data: unknown) => boolean;
}

/**
 * Create a schema validator for type validation
 * 
 * @param schema - Schema to validate against
 * @param options - Validation options
 * @returns Schema validator
 */
export function createSchemaValidator<T>(
  validationFn: (data: unknown) => T,
  schemaName: string
): SchemaValidator<T> {
  return {
    validate: (data: unknown): ValidationResult<T> => {
      try {
        const validData = validationFn(data);
        return {
          isValid: true,
          data: validData
        };
      } catch (error) {
        let validationErrors: ValidationError[] = [];
        
        if (error instanceof ValidationError) {
          validationErrors = [error];
        } else if (error instanceof Error) {
          validationErrors = [
            new ValidationError(error.message, {
              code: 'VALIDATION_ERROR',
              details: { schema: schemaName }
            })
          ];
        } else {
          validationErrors = [
            new ValidationError('Unknown validation error', {
              code: 'VALIDATION_ERROR',
              details: { schema: schemaName }
            })
          ];
        }
        
        return {
          isValid: false,
          errors: validationErrors
        };
      }
    },
    
    parse: (data: unknown): T => {
      try {
        return validationFn(data);
      } catch (error) {
        if (error instanceof ValidationError) {
          throw error;
        }
        
        if (error instanceof Error) {
          throw new ValidationError(error.message, {
            code: 'VALIDATION_ERROR',
            details: { schema: schemaName }
          });
        }
        
        throw new ValidationError('Unknown validation error', {
          code: 'VALIDATION_ERROR',
          details: { schema: schemaName }
        });
      }
    },
    
    check: (data: unknown): boolean => {
      try {
        validationFn(data);
        return true;
      } catch (error) {
        return false;
      }
    }
  };
}

/**
 * Create an API validator for specific endpoints
 * 
 * @param endpointValidators - Object mapping endpoint paths to their validators
 * @returns API validator
 */
export function createApiValidator<
  T extends Record<string, SchemaValidator<unknown>>
>(endpointValidators: T): T & {
  validateRequest: (endpoint: keyof T, data: unknown) => ValidationResult<unknown>;
  validateResponse: (endpoint: keyof T, data: unknown) => ValidationResult<unknown>;
} {
  return {
    ...endpointValidators,
    validateRequest: (endpoint: keyof T, data: unknown): ValidationResult<unknown> => {
      const validator = endpointValidators[endpoint];
      if (!validator) {
        return {
          isValid: false,
          errors: [new ValidationError(`No validator found for endpoint: ${String(endpoint)}`, {
            code: 'MISSING_VALIDATOR',
            details: { endpoint: String(endpoint) }
          })]
        };
      }
      
      return validator.validate(data);
    },
    validateResponse: (endpoint: keyof T, data: unknown): ValidationResult<unknown> => {
      const validator = endpointValidators[endpoint];
      if (!validator) {
        return {
          isValid: false,
          errors: [new ValidationError(`No validator found for endpoint: ${String(endpoint)}`, {
            code: 'MISSING_VALIDATOR',
            details: { endpoint: String(endpoint) }
          })]
        };
      }
      
      return validator.validate(data);
    }
  };
}

export default createSchemaValidator;
