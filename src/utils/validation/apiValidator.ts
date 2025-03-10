
import { ValidationError } from './ValidationError';

/**
 * Interface for API validation results
 */
export interface ApiValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Validate API request or response data
 */
export function validateApiData<T>(
  data: unknown,
  validators: Record<string, (value: unknown) => boolean>,
  options: {
    strictExtraFields?: boolean;
    requiredFields?: string[];
  } = {}
): ApiValidationResult<T> {
  const { strictExtraFields = false, requiredFields = [] } = options;
  const errors: Array<{ field: string; message: string }> = [];
  
  // Check if data is an object
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {
      isValid: false,
      errors: [{ field: '$root', message: 'Data must be an object' }]
    };
  }
  
  const inputData = data as Record<string, unknown>;
  
  // Check for required fields
  for (const field of requiredFields) {
    if (inputData[field] === undefined) {
      errors.push({
        field,
        message: `${field} is required`
      });
    }
  }
  
  // Validate all fields
  for (const [field, validator] of Object.entries(validators)) {
    const value = inputData[field];
    
    // Skip validation for undefined fields that aren't required
    if (value === undefined) {
      if (requiredFields.includes(field)) {
        errors.push({
          field,
          message: `${field} is required`
        });
      }
      continue;
    }
    
    // Validate the field
    try {
      const isValid = validator(value);
      if (!isValid) {
        errors.push({
          field,
          message: `Invalid value for ${field}`
        });
      }
    } catch (error) {
      errors.push({
        field,
        message: error instanceof Error ? error.message : `Invalid value for ${field}`
      });
    }
  }
  
  // Check for extra fields if in strict mode
  if (strictExtraFields) {
    const validFields = new Set([...Object.keys(validators)]);
    
    for (const field of Object.keys(inputData)) {
      if (!validFields.has(field)) {
        errors.push({
          field,
          message: `Unexpected field: ${field}`
        });
      }
    }
  }
  
  // Return validation result
  if (errors.length > 0) {
    return {
      isValid: false,
      errors
    };
  }
  
  return {
    isValid: true,
    data: inputData as unknown as T
  };
}

/**
 * Validate that required fields are present in an object
 */
export function validateRequiredParameters(
  data: Record<string, unknown>,
  requiredParams: string[]
): { isValid: boolean; missingParams: string[] } {
  const missingParams = requiredParams.filter(param => {
    return data[param] === undefined || data[param] === null;
  });
  
  return {
    isValid: missingParams.length === 0,
    missingParams
  };
}

/**
 * API validation utility
 */
export const apiValidator = {
  string(value: unknown): boolean {
    if (typeof value !== 'string') {
      throw new ValidationError(`Expected string, got ${typeof value}`, 'value', value);
    }
    return true;
  },
  
  number(value: unknown): boolean {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new ValidationError(`Expected number, got ${typeof value}`, 'value', value);
    }
    return true;
  },
  
  boolean(value: unknown): boolean {
    if (typeof value !== 'boolean') {
      throw new ValidationError(`Expected boolean, got ${typeof value}`, 'value', value);
    }
    return true;
  },
  
  object(value: unknown): boolean {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new ValidationError(`Expected object, got ${Array.isArray(value) ? 'array' : typeof value}`, 'value', value);
    }
    return true;
  },
  
  array(value: unknown): boolean {
    if (!Array.isArray(value)) {
      throw new ValidationError(`Expected array, got ${typeof value}`, 'value', value);
    }
    return true;
  },
  
  email(value: unknown): boolean {
    if (typeof value !== 'string') {
      throw new ValidationError(`Expected string for email, got ${typeof value}`, 'email', value);
    }
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) {
      throw new ValidationError('Invalid email format', 'email', value);
    }
    
    return true;
  },
  
  uuid(value: unknown): boolean {
    if (typeof value !== 'string') {
      throw new ValidationError(`Expected string for UUID, got ${typeof value}`, 'uuid', value);
    }
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new ValidationError('Invalid UUID format', 'uuid', value);
    }
    
    return true;
  },
  
  date(value: unknown): boolean {
    if (value instanceof Date) return true;
    
    if (typeof value !== 'string') {
      throw new ValidationError(`Expected string or Date for date, got ${typeof value}`, 'date', value);
    }
    
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new ValidationError('Invalid date format', 'date', value);
    }
    
    return true;
  },
  
  // Create validators for specific formats
  oneOf<T extends readonly unknown[]>(allowedValues: T) {
    return (value: unknown): boolean => {
      if (!allowedValues.includes(value as T[number])) {
        throw new ValidationError(
          `Value must be one of: ${allowedValues.join(', ')}`,
          'value',
          value,
          `oneOf:${allowedValues.join(',')}`
        );
      }
      return true;
    };
  }
};

export default apiValidator;
