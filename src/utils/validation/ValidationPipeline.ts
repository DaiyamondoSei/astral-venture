
/**
 * Validation Pipeline
 * 
 * Implements a three-phase validation system:
 * 1. Pre-validation (sanitization)
 * 2. Main validation (type & constraint checking)
 * 3. Post-validation (business rules)
 */

import { ValidationResult, ValidationContext, Validator } from '../../types/core/validation/types';
import { ValidationError } from './ValidationError';

// Helper function to check if a value is an object
const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export class ValidationPipeline<T> {
  private preValidators: Validator[] = [];
  private mainValidator: Validator<T>;
  private postValidators: Validator[] = [];

  constructor(mainValidator: Validator<T>) {
    this.mainValidator = mainValidator;
  }

  addPreValidator(validator: Validator): this {
    this.preValidators.push(validator);
    return this;
  }

  addPostValidator(validator: Validator): this {
    this.postValidators.push(validator);
    return this;
  }

  async validate(data: unknown, context?: ValidationContext): Promise<ValidationResult<T>> {
    try {
      // Phase 1: Pre-validation
      let currentData = data;
      for (const validator of this.preValidators) {
        const result = await validator(currentData, context);
        if (!result.isValid) {
          return result as ValidationResult<T>;
        }
        currentData = result.value ?? result.validatedData;
      }

      // Phase 2: Main validation
      const mainResult = await this.mainValidator(currentData, context);
      if (!mainResult.isValid) {
        return mainResult;
      }
      currentData = mainResult.value ?? mainResult.validatedData;

      // Phase 3: Post-validation
      for (const validator of this.postValidators) {
        const result = await validator(currentData, context);
        if (!result.isValid) {
          return result as ValidationResult<T>;
        }
        currentData = result.value ?? result.validatedData;
      }

      return {
        isValid: true,
        errors: [],
        value: currentData as T,
        validatedData: currentData as T
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          isValid: false,
          errors: error.details
        };
      }
      
      return {
        isValid: false,
        errors: [{
          path: '',
          message: error instanceof Error ? error.message : 'Unknown validation error',
          code: 'UNKNOWN_ERROR',
          severity: 'error'
        }]
      };
    }
  }
}
