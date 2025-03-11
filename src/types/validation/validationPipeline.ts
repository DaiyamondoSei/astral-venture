
/**
 * Validation Pipeline System
 * 
 * This module implements a multi-phase validation pipeline with:
 * 1. Pre-validation - Data normalization and preparation
 * 2. Main validation - Schema and type validation  
 * 3. Post-validation - Business rule validation
 */
import { ValidationResult, ValidationErrorDetail, ValidationContext } from './types';

/**
 * Interface for a complete validation pipeline with multiple phases
 */
export interface ValidationPipeline<T = unknown> {
  /**
   * Phase 1: Pre-validation for data sanitization & normalization
   * This phase prepares data for main validation by sanitizing inputs
   */
  preValidate(data: unknown, context?: ValidationContext): ValidationResult;
  
  /**
   * Phase 2: Main validation for type & constraint checking
   * This is the primary validation phase for type checking and constraints
   */
  validate(data: unknown, context?: ValidationContext): ValidationResult<T>;
  
  /**
   * Phase 3: Post-validation for business rule validation
   * This phase applies business rules and cross-field validations
   */
  postValidate(data: T, context?: ValidationContext): ValidationResult<T>;
  
  /**
   * Combined validation that runs all three phases in sequence
   */
  validateAll(data: unknown, context?: ValidationContext): ValidationResult<T>;
}

/**
 * Options for configuring validation pipeline behavior
 */
export interface ValidationPipelineOptions {
  /**
   * Whether to abort validation on first error
   */
  abortEarly?: boolean;
  
  /**
   * Whether to strip unknown properties from objects
   */
  stripUnknown?: boolean;
  
  /**
   * Whether to allow unknown properties in objects
   */
  allowUnknown?: boolean;
  
  /**
   * Root path to prefix all error paths
   */
  rootPath?: string;
  
  /**
   * Whether to sanitize data before validation
   */
  sanitize?: boolean;
  
  /**
   * Whether to transform data during validation
   */
  transform?: boolean;
  
  /**
   * Custom error messages to use instead of defaults
   */
  customMessages?: Record<string, string>;
  
  /**
   * Additional context data for validation rules
   */
  context?: Record<string, unknown>;
}

/**
 * Create validation result with error details
 */
export function createValidationError(
  message: string,
  path: string,
  details?: Partial<ValidationErrorDetail>
): ValidationResult {
  const errorDetail: ValidationErrorDetail = {
    path,
    message,
    ...details
  };

  return {
    valid: false,
    error: errorDetail,
    errors: [errorDetail]
  };
}

/**
 * Create successful validation result with validated data
 */
export function createValidationSuccess<T>(data: T): ValidationResult<T> {
  return {
    valid: true,
    validatedData: data
  };
}

/**
 * Combine multiple validation results
 */
export function combineValidationResults(results: ValidationResult[]): ValidationResult {
  const allValid = results.every(result => result.valid);
  
  if (allValid) {
    return { valid: true };
  }
  
  const errors: ValidationErrorDetail[] = [];
  
  for (const result of results) {
    if (!result.valid) {
      if (result.error) {
        errors.push(result.error);
      }
      if (result.errors) {
        errors.push(...result.errors);
      }
    }
  }
  
  return {
    valid: false,
    errors
  };
}

/**
 * Basic validation pipeline implementation
 */
export class BasicValidationPipeline<T> implements ValidationPipeline<T> {
  constructor(private options: ValidationPipelineOptions = {}) {}
  
  preValidate(data: unknown, context?: ValidationContext): ValidationResult {
    // Default implementation - no pre-validation
    return { valid: true };
  }
  
  validate(data: unknown, context?: ValidationContext): ValidationResult<T> {
    // Default implementation - no validation
    return { valid: true, validatedData: data as T };
  }
  
  postValidate(data: T, context?: ValidationContext): ValidationResult<T> {
    // Default implementation - no post-validation
    return { valid: true, validatedData: data };
  }
  
  validateAll(data: unknown, context?: ValidationContext): ValidationResult<T> {
    // Run all three phases in sequence
    const preResult = this.preValidate(data, context);
    if (!preResult.valid && this.options.abortEarly) {
      return preResult as ValidationResult<T>;
    }
    
    const mainResult = this.validate(data, context);
    if (!mainResult.valid && this.options.abortEarly) {
      return mainResult;
    }
    
    if (!mainResult.valid || !mainResult.validatedData) {
      return mainResult;
    }
    
    return this.postValidate(mainResult.validatedData, context);
  }
}
