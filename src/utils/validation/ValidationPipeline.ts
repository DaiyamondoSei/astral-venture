
/**
 * Validation Pipeline
 * 
 * Implements a three-phase validation system:
 * 1. Pre-validation (sanitization)
 * 2. Main validation (type & constraint checking)
 * 3. Post-validation (business rules)
 */

import { ValidationResult, ValidationContext, Validator } from '../../types/validation/types';
import { isObject } from '../types/core/guards';
import { ValidationError } from './ValidationError';

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
      for (const validator of this.preValidators) {
        const result = await validator(data, context);
        if (!result.valid) {
          return result;
        }
        data = result.validatedData;
      }

      // Phase 2: Main validation
      const mainResult = await this.mainValidator(data, context);
      if (!mainResult.valid) {
        return mainResult;
      }
      data = mainResult.validatedData;

      // Phase 3: Post-validation
      for (const validator of this.postValidators) {
        const result = await validator(data, context);
        if (!result.valid) {
          return result;
        }
        data = result.validatedData;
      }

      return {
        valid: true,
        validatedData: data as T
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          valid: false,
          errors: error.details
        };
      }
      
      return {
        valid: false,
        error: {
          path: '',
          message: error instanceof Error ? error.message : 'Unknown validation error'
        }
      };
    }
  }
}

