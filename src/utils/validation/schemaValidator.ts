
import { ValidationError } from './ValidationError';

/**
 * Definition for a schema validation rule
 */
export interface SchemaRule {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'date' | 'any';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: unknown[];
  properties?: Record<string, SchemaRule>;
  items?: SchemaRule;
  nullable?: boolean;
  default?: unknown;
  validate?: (value: unknown) => boolean | Promise<boolean>;
  errorMessage?: string;
}

/**
 * Schema definition as a map of property names to rules
 */
export type Schema = Record<string, SchemaRule>;

/**
 * Result of validation
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: ValidationError[];
}

/**
 * Creates a schema validator for a specific schema
 * 
 * @param schema - Schema definition
 * @returns A function that validates data against the schema
 */
export function createSchemaValidator<T>(schema: Schema) {
  return {
    /**
     * Validates data against the schema
     * 
     * @param data - Data to validate
     * @returns Validation result with typed data if successful
     */
    validate: (data: unknown): ValidationResult<T> => {
      try {
        const validatedData = validateSchema<T>(data, schema);
        return {
          success: true,
          data: validatedData
        };
      } catch (error) {
        if (error instanceof ValidationError) {
          return {
            success: false,
            error: error.message,
            errors: [error]
          };
        } else if (error instanceof AggregateValidationError) {
          return {
            success: false,
            error: error.message,
            errors: error.errors
          };
        } else {
          const unknownError = error instanceof Error ? error : new Error(String(error));
          return {
            success: false,
            error: unknownError.message
          };
        }
      }
    }
  };
}

/**
 * Error class for multiple validation errors
 */
class AggregateValidationError extends Error {
  public errors: ValidationError[];
  
  constructor(errors: ValidationError[]) {
    super(`Multiple validation errors: ${errors.map(e => e.message).join('; ')}`);
    this.name = 'AggregateValidationError';
    this.errors = errors;
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, AggregateValidationError.prototype);
  }
}

/**
 * Validates data against a schema
 * 
 * @param data - Data to validate
 * @param schema - Schema definition
 * @returns Validated data with correct type
 * @throws ValidationError if validation fails
 */
export function validateSchema<T>(data: unknown, schema: Schema): T {
  if (data === undefined || data === null) {
    throw new ValidationError('Data is required but was null or undefined');
  }
  
  if (typeof data !== 'object' || Array.isArray(data)) {
    throw new ValidationError(`Data must be an object, but got ${typeof data}`);
  }
  
  const inputData = data as Record<string, unknown>;
  const outputData: Record<string, unknown> = {};
  const errors: ValidationError[] = [];
  
  // Check each field in the schema
  for (const [field, rule] of Object.entries(schema)) {
    try {
      const value = inputData[field];
      
      // Handle required check
      if (rule.required && (value === undefined || value === null)) {
        throw new ValidationError(`Field ${field} is required`, {
          rule: 'required',
          expectedType: rule.type
        });
      }
      
      // Skip validation for undefined values if not required
      if (value === undefined) {
        if (rule.default !== undefined) {
          outputData[field] = rule.default;
        }
        continue;
      }
      
      // Handle nullable check
      if (value === null) {
        if (rule.nullable) {
          outputData[field] = null;
          continue;
        } else {
          throw new ValidationError(`Field ${field} cannot be null`, {
            rule: 'nullable',
            expectedType: rule.type
          });
        }
      }
      
      // Type validation
      switch (rule.type) {
        case 'string':
          if (typeof value !== 'string') {
            throw new ValidationError(`Field ${field} must be a string, but got ${typeof value}`, {
              expectedType: 'string'
            });
          }
          
          // String-specific validations
          if (rule.minLength !== undefined && value.length < rule.minLength) {
            throw new ValidationError(
              `Field ${field} must be at least ${rule.minLength} characters long, but got ${value.length}`,
              {
                rule: 'minLength',
                details: { minLength: rule.minLength, actualLength: value.length }
              }
            );
          }
          
          if (rule.maxLength !== undefined && value.length > rule.maxLength) {
            throw new ValidationError(
              `Field ${field} must be at most ${rule.maxLength} characters long, but got ${value.length}`,
              {
                rule: 'maxLength',
                details: { maxLength: rule.maxLength, actualLength: value.length }
              }
            );
          }
          
          if (rule.pattern && !rule.pattern.test(value)) {
            throw new ValidationError(
              `Field ${field} must match pattern ${rule.pattern}, but got "${value}"`,
              {
                rule: 'pattern',
                details: { pattern: rule.pattern.toString() }
              }
            );
          }
          
          if (rule.enum && !rule.enum.includes(value)) {
            throw new ValidationError(
              `Field ${field} must be one of [${rule.enum.join(', ')}], but got "${value}"`,
              {
                rule: 'enum',
                details: { allowedValues: rule.enum }
              }
            );
          }
          
          outputData[field] = value;
          break;
          
        case 'number':
          if (typeof value !== 'number' || isNaN(value)) {
            throw new ValidationError(`Field ${field} must be a number, but got ${typeof value}`, {
              expectedType: 'number'
            });
          }
          
          // Number-specific validations
          if (rule.min !== undefined && value < rule.min) {
            throw new ValidationError(
              `Field ${field} must be at least ${rule.min}, but got ${value}`,
              {
                rule: 'min',
                details: { min: rule.min, actual: value }
              }
            );
          }
          
          if (rule.max !== undefined && value > rule.max) {
            throw new ValidationError(
              `Field ${field} must be at most ${rule.max}, but got ${value}`,
              {
                rule: 'max',
                details: { max: rule.max, actual: value }
              }
            );
          }
          
          if (rule.enum && !rule.enum.includes(value)) {
            throw new ValidationError(
              `Field ${field} must be one of [${rule.enum.join(', ')}], but got ${value}`,
              {
                rule: 'enum',
                details: { allowedValues: rule.enum }
              }
            );
          }
          
          outputData[field] = value;
          break;
          
        case 'boolean':
          if (typeof value !== 'boolean') {
            throw new ValidationError(`Field ${field} must be a boolean, but got ${typeof value}`, {
              expectedType: 'boolean'
            });
          }
          
          outputData[field] = value;
          break;
          
        case 'object':
          if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            throw new ValidationError(
              `Field ${field} must be an object, but got ${value === null ? 'null' : typeof value}`,
              {
                expectedType: 'object'
              }
            );
          }
          
          // Object-specific validations
          if (rule.properties) {
            outputData[field] = validateSchema(value, rule.properties);
          } else {
            outputData[field] = value;
          }
          break;
          
        case 'array':
          if (!Array.isArray(value)) {
            throw new ValidationError(`Field ${field} must be an array, but got ${typeof value}`, {
              expectedType: 'array'
            });
          }
          
          // Array-specific validations
          if (rule.minLength !== undefined && value.length < rule.minLength) {
            throw new ValidationError(
              `Field ${field} must have at least ${rule.minLength} items, but got ${value.length}`,
              {
                rule: 'minLength',
                details: { minLength: rule.minLength, actualLength: value.length }
              }
            );
          }
          
          if (rule.maxLength !== undefined && value.length > rule.maxLength) {
            throw new ValidationError(
              `Field ${field} must have at most ${rule.maxLength} items, but got ${value.length}`,
              {
                rule: 'maxLength',
                details: { maxLength: rule.maxLength, actualLength: value.length }
              }
            );
          }
          
          // Validate array items if item schema is provided
          if (rule.items) {
            const validatedItems: unknown[] = [];
            const itemErrors: ValidationError[] = [];
            
            for (let i = 0; i < value.length; i++) {
              try {
                const item = value[i];
                
                switch (rule.items.type) {
                  case 'object':
                    if (rule.items.properties) {
                      validatedItems.push(validateSchema(item, rule.items.properties));
                    } else {
                      validatedItems.push(item);
                    }
                    break;
                    
                  case 'string':
                  case 'number':
                  case 'boolean':
                  case 'array':
                    // Simple type check for primitive types
                    if (typeof item !== rule.items.type) {
                      throw new ValidationError(
                        `Array item at index ${i} must be a ${rule.items.type}, but got ${typeof item}`,
                        {
                          expectedType: rule.items.type
                        }
                      );
                    }
                    validatedItems.push(item);
                    break;
                    
                  case 'any':
                    validatedItems.push(item);
                    break;
                    
                  case 'date':
                    if (!(item instanceof Date) && (typeof item !== 'string' || isNaN(new Date(item as string).getTime()))) {
                      throw new ValidationError(
                        `Array item at index ${i} must be a valid date, but got ${typeof item}`,
                        {
                          expectedType: 'date'
                        }
                      );
                    }
                    validatedItems.push(item instanceof Date ? item : new Date(item as string));
                    break;
                }
              } catch (error) {
                if (error instanceof ValidationError) {
                  itemErrors.push(error);
                } else {
                  itemErrors.push(new ValidationError(`Error validating item at index ${i}: ${String(error)}`));
                }
              }
            }
            
            if (itemErrors.length > 0) {
              throw new AggregateValidationError(itemErrors);
            }
            
            outputData[field] = validatedItems;
          } else {
            outputData[field] = value;
          }
          break;
          
        case 'date':
          if (value instanceof Date) {
            if (isNaN(value.getTime())) {
              throw new ValidationError(`Field ${field} must be a valid date, but is invalid`, {
                expectedType: 'date'
              });
            }
            outputData[field] = value;
          } else if (typeof value === 'string') {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
              throw new ValidationError(`Field ${field} must be a valid date string, but got "${value}"`, {
                expectedType: 'date'
              });
            }
            outputData[field] = date;
          } else {
            throw new ValidationError(`Field ${field} must be a Date or date string, but got ${typeof value}`, {
              expectedType: 'date'
            });
          }
          break;
          
        case 'any':
          outputData[field] = value;
          break;
          
        default:
          throw new ValidationError(`Unknown type "${rule.type}" for field ${field}`);
      }
      
      // Run custom validator if provided
      if (rule.validate && !rule.validate(outputData[field])) {
        throw new ValidationError(
          rule.errorMessage || `Field ${field} failed custom validation`,
          {
            rule: 'custom'
          }
        );
      }
    } catch (error) {
      if (error instanceof ValidationError || error instanceof AggregateValidationError) {
        errors.push(...(error instanceof AggregateValidationError ? error.errors : [error]));
      } else {
        errors.push(new ValidationError(`Unexpected error validating field ${field}: ${String(error)}`));
      }
    }
  }
  
  // Check for extra fields not in schema
  for (const field of Object.keys(inputData)) {
    if (!schema[field]) {
      // We don't throw for extra fields, but we don't include them in the output
      // outputData[field] = inputData[field];
    }
  }
  
  if (errors.length > 0) {
    throw new AggregateValidationError(errors);
  }
  
  return outputData as unknown as T;
}

export default {
  createSchemaValidator,
  validateSchema
};
