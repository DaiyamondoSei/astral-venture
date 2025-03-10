
import { ValidationError } from './ValidationError';

/**
 * Utility for validating function parameters in a consistent way
 */
export class ParamValidator {
  /**
   * Validate that a parameter is not null or undefined
   */
  static required<T>(
    value: T | null | undefined,
    paramName: string,
    functionName?: string
  ): T {
    if (value === undefined || value === null) {
      const context = functionName ? ` in ${functionName}` : '';
      throw new ValidationError(`Parameter '${paramName}'${context} is required`, {
        field: paramName,
        rule: 'required'
      });
    }
    return value;
  }

  /**
   * Validate that a string parameter is not empty
   */
  static nonEmptyString(
    value: string | null | undefined, 
    paramName: string,
    functionName?: string
  ): string {
    const str = this.required(value, paramName, functionName);
    
    if (typeof str !== 'string') {
      const context = functionName ? ` in ${functionName}` : '';
      throw new ValidationError(`Parameter '${paramName}'${context} must be a string`, {
        field: paramName,
        expectedType: 'string',
        rule: 'type'
      });
    }
    
    if (str.trim() === '') {
      const context = functionName ? ` in ${functionName}` : '';
      throw new ValidationError(`Parameter '${paramName}'${context} cannot be empty`, {
        field: paramName,
        rule: 'non-empty'
      });
    }
    
    return str;
  }

  /**
   * Validate that a number parameter is within a range
   */
  static numberInRange(
    value: number | null | undefined,
    paramName: string,
    min: number,
    max: number,
    functionName?: string
  ): number {
    const num = this.required(value, paramName, functionName);
    
    if (typeof num !== 'number' || isNaN(num)) {
      const context = functionName ? ` in ${functionName}` : '';
      throw new ValidationError(`Parameter '${paramName}'${context} must be a number`, {
        field: paramName,
        expectedType: 'number',
        rule: 'type'
      });
    }
    
    if (num < min || num > max) {
      const context = functionName ? ` in ${functionName}` : '';
      throw new ValidationError(
        `Parameter '${paramName}'${context} must be between ${min} and ${max}`,
        {
          field: paramName,
          rule: 'range',
          details: `Value ${num} is outside range ${min}-${max}`
        }
      );
    }
    
    return num;
  }

  /**
   * Validate that a parameter is of a specific type
   */
  static ofType<T>(
    value: unknown,
    paramName: string,
    typeName: string,
    validator: (val: unknown) => boolean,
    functionName?: string
  ): T {
    if (!validator(value)) {
      const context = functionName ? ` in ${functionName}` : '';
      throw new ValidationError(`Parameter '${paramName}'${context} must be of type ${typeName}`, {
        field: paramName,
        expectedType: typeName,
        rule: 'type'
      });
    }
    
    return value as T;
  }

  /**
   * Validate that a parameter is an array of specific type
   */
  static array<T>(
    value: unknown[] | null | undefined,
    paramName: string,
    itemValidator?: (item: unknown, index: number) => T,
    functionName?: string
  ): T[] {
    const arr = this.required(value, paramName, functionName);
    
    if (!Array.isArray(arr)) {
      const context = functionName ? ` in ${functionName}` : '';
      throw new ValidationError(`Parameter '${paramName}'${context} must be an array`, {
        field: paramName,
        expectedType: 'array',
        rule: 'type'
      });
    }
    
    if (itemValidator) {
      try {
        return arr.map((item, index) => {
          try {
            return itemValidator(item, index);
          } catch (error) {
            const context = functionName ? ` in ${functionName}` : '';
            if (error instanceof ValidationError) {
              throw new ValidationError(
                `Item at index ${index} of '${paramName}'${context} is invalid: ${error.message}`,
                {
                  ...error,
                  field: `${paramName}[${index}]`
                }
              );
            }
            throw error;
          }
        });
      } catch (error) {
        throw error;
      }
    }
    
    return arr as T[];
  }
}

export default ParamValidator;
