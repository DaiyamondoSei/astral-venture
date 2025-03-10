
import { ValidationError } from './ValidationError';

/**
 * Result of schema validation
 */
export interface ValidationResult<T> {
  /**
   * Whether the validation succeeded
   */
  isValid: boolean;
  
  /**
   * The validated data (only present if validation succeeded)
   */
  data?: T;
  
  /**
   * The error that occurred (only present if validation failed)
   */
  error?: ValidationError;
  
  /**
   * Additional validation issues
   */
  issues?: ValidationIssue[];
}

/**
 * Represents a specific validation issue
 */
export interface ValidationIssue {
  code: string;
  path: string[];
  message: string;
}

/**
 * A schema validator for runtime type checking
 */
export interface SchemaValidator<T> {
  /**
   * Validate data against the schema
   * @param data The data to validate
   * @returns A validation result object
   */
  validate(data: unknown): ValidationResult<T>;
  
  /**
   * Parse data against the schema, throws on validation failure
   * @param data The data to parse
   * @returns The validated data
   * @throws ValidationError if validation fails
   */
  parse(data: unknown): T;
  
  /**
   * Check if data matches the schema
   * @param data The data to check
   * @returns Whether the data is valid
   */
  check(data: unknown): boolean;
}

/**
 * Create a basic schema validator for an object type
 * @param schema Object describing the expected shape of the data
 * @returns A schema validator
 */
export function createObjectSchema<T extends Record<string, any>>(
  schema: Record<keyof T, (value: unknown) => boolean>
): SchemaValidator<T> {
  return {
    validate(data: unknown): ValidationResult<T> {
      // Check if data is an object
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return {
          isValid: false,
          error: ValidationError.invalidType('schema', data, 'object')
        };
      }
      
      const inputData = data as Record<string, unknown>;
      const issues: ValidationIssue[] = [];
      
      // Check each property in the schema
      for (const [key, validator] of Object.entries(schema)) {
        const value = inputData[key];
        
        // Skip undefined optional properties
        if (value === undefined) continue;
        
        // Validate the property
        if (!validator(value)) {
          issues.push({
            code: 'invalid_property',
            path: [key],
            message: `Invalid value for property '${key}'`
          });
        }
      }
      
      if (issues.length > 0) {
        return {
          isValid: false,
          error: ValidationError.schemaValidation(
            'object',
            data,
            `${issues.length} validation issues found`
          ),
          issues
        };
      }
      
      return {
        isValid: true,
        data: inputData as unknown as T
      };
    },
    
    parse(data: unknown): T {
      const result = this.validate(data);
      
      if (!result.isValid || !result.data) {
        throw result.error || new ValidationError('Schema validation failed');
      }
      
      return result.data;
    },
    
    check(data: unknown): boolean {
      return this.validate(data).isValid;
    }
  };
}

/**
 * Validate that the object matches the schema
 * @param data The data to validate
 * @param schema The schema to validate against
 * @returns The validated data
 * @throws ValidationError if validation fails
 */
export function validateSchema<T>(data: unknown, schema: SchemaValidator<T>): T {
  return schema.parse(data);
}

export default validateSchema;
