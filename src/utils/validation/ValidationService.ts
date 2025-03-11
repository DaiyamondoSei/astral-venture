
/**
 * ValidationService
 * 
 * A centralized service for handling validation errors with consistent
 * error handling and type-safe validation functions.
 */

import { ValidationError, ValidationErrorDetail, isValidationError } from './ValidationError';
import { Result, success, failure } from '../result/Result';

/**
 * Generic validator function type
 */
export type Validator<T> = (value: unknown) => Result<T, ValidationErrorDetail[]>;

/**
 * Options for field validation
 */
export interface FieldValidationOptions {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  validator?: (value: any) => Result<any, ValidationErrorDetail>;
  transform?: (value: any) => any;
}

/**
 * Base class for validation operations
 */
export class ValidationService {
  /**
   * Validate a string field
   */
  static validateString(
    fieldName: string,
    value: unknown,
    options: FieldValidationOptions = {}
  ): Result<string, ValidationErrorDetail[]> {
    const errors: ValidationErrorDetail[] = [];
    
    // Handle optional fields
    if (value === undefined || value === null || value === '') {
      if (options.required) {
        errors.push({
          path: fieldName,
          message: `${fieldName} is required`,
          rule: 'required',
          code: 'FIELD_REQUIRED'
        });
        return failure(errors);
      }
      return success('');
    }
    
    // Type checking
    if (typeof value !== 'string') {
      errors.push({
        path: fieldName,
        message: `${fieldName} must be a string`,
        value,
        type: 'string',
        rule: 'type',
        code: 'TYPE_ERROR'
      });
      return failure(errors);
    }
    
    // Length validation
    if (options.minLength !== undefined && value.length < options.minLength) {
      errors.push({
        path: fieldName,
        message: `${fieldName} must be at least ${options.minLength} characters`,
        value,
        rule: 'minLength',
        code: 'MIN_LENGTH_ERROR'
      });
    }
    
    if (options.maxLength !== undefined && value.length > options.maxLength) {
      errors.push({
        path: fieldName,
        message: `${fieldName} must be at most ${options.maxLength} characters`,
        value,
        rule: 'maxLength',
        code: 'MAX_LENGTH_ERROR'
      });
    }
    
    // Pattern validation
    if (options.pattern && !options.pattern.test(value)) {
      errors.push({
        path: fieldName,
        message: `${fieldName} has invalid format`,
        value,
        rule: 'pattern',
        code: 'PATTERN_ERROR'
      });
    }
    
    // Custom validator
    if (options.validator) {
      const result = options.validator(value);
      if (result.type === 'failure') {
        errors.push(...result.error);
      }
    }
    
    if (errors.length > 0) {
      return failure(errors);
    }
    
    // Apply transformation if provided
    const transformedValue = options.transform ? options.transform(value) : value;
    return success(transformedValue);
  }
  
  /**
   * Validate a number field
   */
  static validateNumber(
    fieldName: string,
    value: unknown,
    options: FieldValidationOptions = {}
  ): Result<number, ValidationErrorDetail[]> {
    const errors: ValidationErrorDetail[] = [];
    
    // Handle optional fields
    if (value === undefined || value === null || value === '') {
      if (options.required) {
        errors.push({
          path: fieldName,
          message: `${fieldName} is required`,
          rule: 'required',
          code: 'FIELD_REQUIRED'
        });
        return failure(errors);
      }
      return success(0);
    }
    
    // Type coercion for strings
    let numValue: number;
    if (typeof value === 'string') {
      numValue = Number(value);
      if (isNaN(numValue)) {
        errors.push({
          path: fieldName,
          message: `${fieldName} must be a valid number`,
          value,
          type: 'number',
          rule: 'type',
          code: 'TYPE_ERROR'
        });
        return failure(errors);
      }
    } else if (typeof value !== 'number' || isNaN(value)) {
      errors.push({
        path: fieldName,
        message: `${fieldName} must be a number`,
        value,
        type: 'number',
        rule: 'type',
        code: 'TYPE_ERROR'
      });
      return failure(errors);
    } else {
      numValue = value;
    }
    
    // Range validation
    if (options.min !== undefined && numValue < options.min) {
      errors.push({
        path: fieldName,
        message: `${fieldName} must be at least ${options.min}`,
        value: numValue,
        rule: 'min',
        code: 'MIN_VALUE_ERROR'
      });
    }
    
    if (options.max !== undefined && numValue > options.max) {
      errors.push({
        path: fieldName,
        message: `${fieldName} must be at most ${options.max}`,
        value: numValue,
        rule: 'max',
        code: 'MAX_VALUE_ERROR'
      });
    }
    
    // Custom validator
    if (options.validator) {
      const result = options.validator(numValue);
      if (result.type === 'failure') {
        errors.push(...result.error);
      }
    }
    
    if (errors.length > 0) {
      return failure(errors);
    }
    
    // Apply transformation if provided
    const transformedValue = options.transform ? options.transform(numValue) : numValue;
    return success(transformedValue);
  }
  
  /**
   * Validate a boolean field
   */
  static validateBoolean(
    fieldName: string,
    value: unknown,
    options: FieldValidationOptions = {}
  ): Result<boolean, ValidationErrorDetail[]> {
    const errors: ValidationErrorDetail[] = [];
    
    // Handle optional fields
    if (value === undefined || value === null) {
      if (options.required) {
        errors.push({
          path: fieldName,
          message: `${fieldName} is required`,
          rule: 'required',
          code: 'FIELD_REQUIRED'
        });
        return failure(errors);
      }
      return success(false);
    }
    
    // Type coercion for strings
    let boolValue: boolean;
    if (typeof value === 'string') {
      if (value.toLowerCase() === 'true') {
        boolValue = true;
      } else if (value.toLowerCase() === 'false') {
        boolValue = false;
      } else {
        errors.push({
          path: fieldName,
          message: `${fieldName} must be a boolean`,
          value,
          type: 'boolean',
          rule: 'type',
          code: 'TYPE_ERROR'
        });
        return failure(errors);
      }
    } else if (typeof value !== 'boolean') {
      errors.push({
        path: fieldName,
        message: `${fieldName} must be a boolean`,
        value,
        type: 'boolean',
        rule: 'type',
        code: 'TYPE_ERROR'
      });
      return failure(errors);
    } else {
      boolValue = value;
    }
    
    // Custom validator
    if (options.validator) {
      const result = options.validator(boolValue);
      if (result.type === 'failure') {
        errors.push(...result.error);
      }
    }
    
    if (errors.length > 0) {
      return failure(errors);
    }
    
    // Apply transformation if provided
    const transformedValue = options.transform ? options.transform(boolValue) : boolValue;
    return success(transformedValue);
  }
  
  /**
   * Validate an object field
   */
  static validateObject<T>(
    fieldName: string,
    value: unknown,
    schema: Record<string, Validator<any>>,
    options: FieldValidationOptions = {}
  ): Result<T, ValidationErrorDetail[]> {
    const errors: ValidationErrorDetail[] = [];
    
    // Handle optional fields
    if (value === undefined || value === null) {
      if (options.required) {
        errors.push({
          path: fieldName,
          message: `${fieldName} is required`,
          rule: 'required',
          code: 'FIELD_REQUIRED'
        });
        return failure(errors);
      }
      return success({} as T);
    }
    
    // Type checking
    if (typeof value !== 'object' || Array.isArray(value)) {
      errors.push({
        path: fieldName,
        message: `${fieldName} must be an object`,
        value,
        type: 'object',
        rule: 'type',
        code: 'TYPE_ERROR'
      });
      return failure(errors);
    }
    
    // Validate each field in the schema
    const result: Record<string, any> = {};
    for (const [key, validator] of Object.entries(schema)) {
      const fieldValue = (value as Record<string, any>)[key];
      const fieldResult = validator(fieldValue);
      
      if (fieldResult.type === 'success') {
        result[key] = fieldResult.value;
      } else {
        // Prefix the field paths with the parent field name
        errors.push(...fieldResult.error.map(err => ({
          ...err,
          path: `${fieldName}.${err.path}`
        })));
      }
    }
    
    // Custom validator
    if (options.validator && errors.length === 0) {
      const customResult = options.validator(result);
      if (customResult.type === 'failure') {
        errors.push(...customResult.error);
      }
    }
    
    if (errors.length > 0) {
      return failure(errors);
    }
    
    // Apply transformation if provided
    const transformedValue = options.transform ? options.transform(result) : result;
    return success(transformedValue as T);
  }
  
  /**
   * Validate an array field
   */
  static validateArray<T>(
    fieldName: string,
    value: unknown,
    itemValidator: Validator<T>,
    options: FieldValidationOptions = {}
  ): Result<T[], ValidationErrorDetail[]> {
    const errors: ValidationErrorDetail[] = [];
    
    // Handle optional fields
    if (value === undefined || value === null) {
      if (options.required) {
        errors.push({
          path: fieldName,
          message: `${fieldName} is required`,
          rule: 'required',
          code: 'FIELD_REQUIRED'
        });
        return failure(errors);
      }
      return success([]);
    }
    
    // Type checking
    if (!Array.isArray(value)) {
      errors.push({
        path: fieldName,
        message: `${fieldName} must be an array`,
        value,
        type: 'array',
        rule: 'type',
        code: 'TYPE_ERROR'
      });
      return failure(errors);
    }
    
    // Length validation
    if (options.minLength !== undefined && value.length < options.minLength) {
      errors.push({
        path: fieldName,
        message: `${fieldName} must have at least ${options.minLength} items`,
        value,
        rule: 'minLength',
        code: 'MIN_LENGTH_ERROR'
      });
    }
    
    if (options.maxLength !== undefined && value.length > options.maxLength) {
      errors.push({
        path: fieldName,
        message: `${fieldName} must have at most ${options.maxLength} items`,
        value,
        rule: 'maxLength',
        code: 'MAX_LENGTH_ERROR'
      });
    }
    
    // Validate each item in the array
    const result: T[] = [];
    for (let i = 0; i < value.length; i++) {
      const itemResult = itemValidator(value[i]);
      
      if (itemResult.type === 'success') {
        result.push(itemResult.value);
      } else {
        // Prefix the field paths with the array index
        errors.push(...itemResult.error.map(err => ({
          ...err,
          path: `${fieldName}[${i}].${err.path}`
        })));
      }
    }
    
    // Custom validator
    if (options.validator && errors.length === 0) {
      const customResult = options.validator(result);
      if (customResult.type === 'failure') {
        errors.push(...customResult.error);
      }
    }
    
    if (errors.length > 0) {
      return failure(errors);
    }
    
    // Apply transformation if provided
    const transformedValue = options.transform ? options.transform(result) : result;
    return success(transformedValue);
  }
  
  /**
   * Create a validation error from a string
   */
  static createError(message: string, field: string): ValidationError {
    return new ValidationError(message, [
      {
        path: field,
        message,
        field
      }
    ]);
  }
  
  /**
   * Convert validation errors to a form-friendly format
   */
  static formatForForm(error: unknown): Record<string, string> {
    if (isValidationError(error)) {
      return error.getUIDetails();
    }
    
    return {};
  }
}

export default ValidationService;
