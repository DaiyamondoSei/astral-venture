
import { combineValidators, createTypeGuard, required } from '../utils/validation/validationUtils';

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
  });

  describe('type guard validator', () => {
    const isString = (value: unknown): value is string => typeof value === 'string';
    const validator = createTypeGuard(isString, 'TYPE_ERROR', 'Value must be a string');

    test('should pass for correct type', () => {
      expect(validator('test').valid).toBe(true);
    });

    test('should fail for incorrect type', () => {
      expect(validator(123).valid).toBe(false);
    });
  });

  describe('combined validators', () => {
    const isString = (value: unknown): value is string => typeof value === 'string';
    const stringValidator = createTypeGuard(isString, 'TYPE_ERROR', 'Value must be a string');
    const requiredValidator = required('testField');
    const combined = combineValidators([requiredValidator, stringValidator]);

    test('should pass when all validators pass', () => {
      expect(combined('test').valid).toBe(true);
    });

    test('should fail when any validator fails', () => {
      expect(combined(undefined).valid).toBe(false);
      expect(combined(123).valid).toBe(false);
    });
  });
});
