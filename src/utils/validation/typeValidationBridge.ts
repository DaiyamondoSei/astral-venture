
import { ValidationError } from './ValidationError';

/**
 * Runtime type validation with detailed error messages
 */
export class TypeValidationBridge {
  static validateType<T>(
    value: unknown,
    expectedType: string,
    fieldName: string
  ): T {
    if (typeof value !== expectedType) {
      throw new ValidationError(
        `Expected ${fieldName} to be ${expectedType}, got ${typeof value}`,
        {
          field: fieldName,
          expectedType,
          rule: 'type-check'
        }
      );
    }
    return value as T;
  }

  static validateObject<T extends object>(
    value: unknown,
    shape: Record<keyof T, string>,
    objectName: string
  ): T {
    if (!value || typeof value !== 'object') {
      throw new ValidationError(
        `Expected ${objectName} to be an object`,
        {
          field: objectName,
          expectedType: 'object',
          rule: 'type-check'
        }
      );
    }

    const validatedObject: Partial<T> = {};
    const errors: string[] = [];

    Object.entries(shape).forEach(([key, expectedType]) => {
      try {
        const fieldValue = (value as any)[key];
        validatedObject[key as keyof T] = TypeValidationBridge.validateType(
          fieldValue,
          expectedType,
          `${objectName}.${key}`
        );
      } catch (error) {
        if (error instanceof ValidationError) {
          errors.push(error.message);
        }
      }
    });

    if (errors.length > 0) {
      throw new ValidationError(
        `Invalid object structure for ${objectName}`,
        {
          field: objectName,
          rule: 'object-validation',
          details: errors.join('; ')
        }
      );
    }

    return validatedObject as T;
  }
}

export const validateType = TypeValidationBridge.validateType;
export const validateObject = TypeValidationBridge.validateObject;
