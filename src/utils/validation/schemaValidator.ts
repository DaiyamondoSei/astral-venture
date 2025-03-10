
import { ValidationError } from './ValidationError';

/**
 * Interface for validation results
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validation schema type for object properties
 */
export type ValidationSchema = {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any';
    required?: boolean;
    nullable?: boolean;
    validate?: (value: any) => boolean | string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    schema?: ValidationSchema; // For nested objects
    arrayType?: {
      type: 'string' | 'number' | 'boolean' | 'object' | 'any';
      schema?: ValidationSchema; // For object arrays
    };
  };
};

/**
 * Validate data against a schema
 * 
 * @param data Data to validate
 * @param schema Validation schema
 * @returns Validation result with validity and errors
 */
export function validateSchema(data: unknown, schema: ValidationSchema): ValidationResult {
  const errors: string[] = [];
  
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {
      valid: false,
      errors: ['Data must be an object']
    };
  }
  
  const objectData = data as Record<string, unknown>;
  
  // Validate each field according to the schema
  for (const [key, rules] of Object.entries(schema)) {
    const value = objectData[key];
    
    // Check required fields
    if (rules.required && (value === undefined || value === null)) {
      errors.push(`'${key}' is required`);
      continue;
    }
    
    // Skip if value is not provided and not required
    if (value === undefined) {
      continue;
    }
    
    // Check nullable
    if (value === null) {
      if (rules.nullable) {
        continue;
      } else {
        errors.push(`'${key}' cannot be null`);
        continue;
      }
    }
    
    // Type validation
    if (rules.type !== 'any') {
      if (rules.type === 'string' && typeof value !== 'string') {
        errors.push(`'${key}' must be a string`);
      } else if (rules.type === 'number' && typeof value !== 'number') {
        errors.push(`'${key}' must be a number`);
      } else if (rules.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`'${key}' must be a boolean`);
      } else if (rules.type === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
        errors.push(`'${key}' must be an object`);
      } else if (rules.type === 'array' && !Array.isArray(value)) {
        errors.push(`'${key}' must be an array`);
      }
    }
    
    // String length validation
    if (typeof value === 'string') {
      if (rules.minLength !== undefined && value.length < rules.minLength) {
        errors.push(`'${key}' must be at least ${rules.minLength} characters`);
      }
      if (rules.maxLength !== undefined && value.length > rules.maxLength) {
        errors.push(`'${key}' must be at most ${rules.maxLength} characters`);
      }
    }
    
    // Number range validation
    if (typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`'${key}' must be at least ${rules.min}`);
      }
      if (rules.max !== undefined && value > rules.max) {
        errors.push(`'${key}' must be at most ${rules.max}`);
      }
    }
    
    // Custom validation
    if (rules.validate && value !== null) {
      const validationResult = rules.validate(value);
      if (typeof validationResult === 'string') {
        errors.push(validationResult);
      } else if (!validationResult) {
        errors.push(`'${key}' is invalid`);
      }
    }
    
    // Nested object validation
    if (rules.type === 'object' && rules.schema && typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const nestedResult = validateSchema(value, rules.schema);
      if (!nestedResult.valid) {
        errors.push(...nestedResult.errors.map(err => `${key}.${err}`));
      }
    }
    
    // Array validation
    if (rules.type === 'array' && Array.isArray(value) && rules.arrayType) {
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        
        // Check item type
        if (rules.arrayType.type !== 'any') {
          if (rules.arrayType.type === 'string' && typeof item !== 'string') {
            errors.push(`'${key}[${i}]' must be a string`);
          } else if (rules.arrayType.type === 'number' && typeof item !== 'number') {
            errors.push(`'${key}[${i}]' must be a number`);
          } else if (rules.arrayType.type === 'boolean' && typeof item !== 'boolean') {
            errors.push(`'${key}[${i}]' must be a boolean`);
          } else if (rules.arrayType.type === 'object' && (typeof item !== 'object' || Array.isArray(item))) {
            errors.push(`'${key}[${i}]' must be an object`);
          }
        }
        
        // Nested object validation for array items
        if (rules.arrayType.type === 'object' && rules.arrayType.schema && typeof item === 'object' && item !== null && !Array.isArray(item)) {
          const nestedResult = validateSchema(item, rules.arrayType.schema);
          if (!nestedResult.valid) {
            errors.push(...nestedResult.errors.map(err => `${key}[${i}].${err}`));
          }
        }
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate data against a schema and throw an error if invalid
 * 
 * @param data Data to validate
 * @param schema Validation schema
 * @param dataName Name of the data for error message
 * @throws ValidationError if validation fails
 */
export function validateDataWithSchema(
  data: unknown,
  schema: ValidationSchema,
  dataName: string
): void {
  const result = validateSchema(data, schema);
  
  if (!result.valid) {
    throw new ValidationError(`Invalid ${dataName}: ${result.errors.join(', ')}`, {
      details: { errors: result.errors }
    });
  }
}

export default validateSchema;
