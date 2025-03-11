
import { combineValidators, createTypeGuard, required } from '../utils/validation/validationUtils';
import { ValidationError } from '../utils/validation/ValidationError';
import { isValidationResult } from '../utils/validation/types';

describe('Validation System', () => {
  describe('required validator', () => {
    const validator = required('testField');

    test('should pass for defined values', () => {
      expect(validator('test').valid).toBe(true);
      expect(validator(0).valid).toBe(true);
      expect(validator(false).valid).toBe(true);
    });

    test('should fail for undefined or null', () => {
      expect(validator(undefined).valid).toBe(false);
      expect(validator(null).valid).toBe(false);
    });

    test('should provide error details for failures', () => {
      const result = validator(undefined);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.path).toBe('testField');
      expect(result.error?.message).toContain('required');
    });
  });

  describe('type guard validator', () => {
    const isString = (value: unknown): value is string => typeof value === 'string';
    const validator = createTypeGuard(isString, 'TYPE_ERROR', 'Value must be a string');

    test('should pass for correct type', () => {
      expect(validator('test').valid).toBe(true);
      expect(validator('').valid).toBe(true);
    });

    test('should fail for incorrect type', () => {
      expect(validator(123).valid).toBe(false);
      expect(validator(null).valid).toBe(false);
      expect(validator(undefined).valid).toBe(false);
      expect(validator({}).valid).toBe(false);
    });

    test('should provide type error details', () => {
      const result = validator(123);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('TYPE_ERROR');
      expect(result.error?.message).toBe('Value must be a string');
    });
  });

  describe('combineValidators', () => {
    const isString = (value: unknown): value is string => typeof value === 'string';
    const stringValidator = createTypeGuard(isString, 'TYPE_ERROR', 'Value must be a string');
    const minLengthValidator = (value: unknown) => {
      if (typeof value !== 'string' || value.length < 3) {
        return {
          valid: false,
          error: {
            path: '',
            message: 'String must be at least 3 characters',
            code: 'MIN_LENGTH',
            rule: 'minLength'
          }
        };
      }
      return { valid: true, validatedData: value };
    };
    
    const combinedValidator = combineValidators([stringValidator, minLengthValidator]);

    test('should pass when all validators pass', () => {
      expect(combinedValidator('test').valid).toBe(true);
      expect(combinedValidator('hello world').valid).toBe(true);
    });

    test('should fail when any validator fails', () => {
      expect(combinedValidator(123).valid).toBe(false);
      expect(combinedValidator('ab').valid).toBe(false);
    });

    test('should stop at first failing validator', () => {
      const result = combinedValidator('');
      expect(result.valid).toBe(false);
      expect(result.error?.code).toBe('MIN_LENGTH');
    });
  });

  describe('ValidationError', () => {
    test('should create error with details', () => {
      const error = new ValidationError('Validation failed', [
        { path: 'name', message: 'Name is required' },
        { path: 'email', message: 'Email is invalid', code: 'FORMAT' }
      ]);
      
      expect(error.message).toBe('Validation failed');
      expect(error.details).toHaveLength(2);
      expect(error.details[0].path).toBe('name');
      expect(error.details[1].code).toBe('FORMAT');
    });

    test('should handle empty details', () => {
      const error = new ValidationError('Generic validation error');
      expect(error.message).toBe('Generic validation error');
      expect(error.details).toEqual([]);
    });

    test('should normalize field and path', () => {
      const error = new ValidationError('Error', [
        { field: 'username', message: 'Required' },
        { path: 'email', message: 'Invalid' }
      ]);
      
      expect(error.details[0].path).toBe('username');
      expect(error.details[0].field).toBe('username');
      expect(error.details[1].path).toBe('email');
      expect(error.details[1].field).toBe('email');
    });

    test('factory methods should create properly structured errors', () => {
      const requiredError = ValidationError.requiredError('email');
      expect(requiredError.details[0].rule).toBe('required');
      expect(requiredError.details[0].path).toBe('email');
      
      const typeError = ValidationError.typeError('age', 'number');
      expect(typeError.details[0].rule).toBe('type');
      expect(typeError.details[0].type).toBe('number');
    });
  });

  describe('isValidationResult type guard', () => {
    test('should identify ValidationResult objects', () => {
      expect(isValidationResult({ valid: true })).toBe(true);
      expect(isValidationResult({ valid: false, error: { path: 'test', message: 'Error' } })).toBe(true);
    });

    test('should reject non-ValidationResult objects', () => {
      expect(isValidationResult(null)).toBe(false);
      expect(isValidationResult({})).toBe(false);
      expect(isValidationResult({ error: 'test' })).toBe(false);
      expect(isValidationResult({ valid: 'true' })).toBe(false);
    });
  });
});
