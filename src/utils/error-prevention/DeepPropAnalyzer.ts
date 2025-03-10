
import { ErrorCategory, ErrorSeverity, handleError } from '../errorHandling';

/**
 * Error thrown when a deep property is invalid or missing
 */
export class DeepPropertyError extends Error {
  constructor(
    message: string,
    public readonly path: string[],
    public readonly expectedType?: string
  ) {
    super(message);
    this.name = 'DeepPropertyError';
  }
}

/**
 * Utility for safely accessing deeply nested properties in objects
 * with runtime type checking to prevent errors
 */
export class DeepPropAnalyzer {
  /**
   * Safely get a value from a deeply nested object
   * 
   * @param obj - The object to analyze
   * @param path - Array representing the path to the property
   * @param defaultValue - Value to return if property not found
   * @returns The property value or default value
   */
  public static get<T>(obj: unknown, path: string[], defaultValue?: T): T | undefined {
    try {
      let current: any = obj;
      
      for (const key of path) {
        // Check if current is null or undefined
        if (current == null) {
          return defaultValue;
        }
        
        // Check if current is an object
        if (typeof current !== 'object') {
          return defaultValue;
        }
        
        // Move to next level
        current = current[key];
      }
      
      // Return final value or default
      return (current === undefined) ? defaultValue : current;
    } catch (error) {
      handleError(error, {
        category: ErrorCategory.DATA_PROCESSING,
        severity: ErrorSeverity.WARNING,
        context: 'DeepPropAnalyzer',
        customMessage: `Failed to access property at path: ${path.join('.')}`,
        showToast: false
      });
      
      return defaultValue;
    }
  }
  
  /**
   * Check if a property exists in a deeply nested object
   * 
   * @param obj - The object to analyze
   * @param path - Array representing the path to the property
   * @returns True if the property exists
   */
  public static exists(obj: unknown, path: string[]): boolean {
    try {
      let current: any = obj;
      
      for (let i = 0; i < path.length; i++) {
        const key = path[i];
        
        // Check if current is null or undefined
        if (current == null) {
          return false;
        }
        
        // Check if current is an object
        if (typeof current !== 'object') {
          return false;
        }
        
        // If we're at the last key, check if it exists
        if (i === path.length - 1) {
          return key in current;
        }
        
        // Move to next level
        current = current[key];
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Validate that a property has the expected type
   * 
   * @param obj - The object to analyze
   * @param path - Array representing the path to the property
   * @param expectedType - Expected type of the property
   * @param isOptional - Whether the property is optional
   * @returns True if property has expected type
   */
  public static validateType(
    obj: unknown, 
    path: string[], 
    expectedType: string,
    isOptional = false
  ): boolean {
    try {
      const value = this.get(obj, path);
      
      // Handle optional properties
      if (value === undefined) {
        return isOptional;
      }
      
      // Check type
      switch (expectedType) {
        case 'string':
          return typeof value === 'string';
        case 'number':
          return typeof value === 'number';
        case 'boolean':
          return typeof value === 'boolean';
        case 'object':
          return typeof value === 'object' && value !== null && !Array.isArray(value);
        case 'array':
          return Array.isArray(value);
        case 'function':
          return typeof value === 'function';
        case 'null':
          return value === null;
        case 'date':
          return value instanceof Date;
        default:
          return true; // Can't validate unknown types
      }
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Assert that a property exists and has the expected type
   * 
   * @param obj - The object to analyze
   * @param path - Array representing the path to the property
   * @param expectedType - Expected type of the property
   * @param isOptional - Whether the property is optional
   * @throws DeepPropertyError if validation fails
   */
  public static assertType(
    obj: unknown,
    path: string[],
    expectedType: string,
    isOptional = false
  ): void {
    const exists = this.exists(obj, path);
    
    if (!exists && !isOptional) {
      throw new DeepPropertyError(
        `Required property at path '${path.join('.')}' is missing`,
        path
      );
    }
    
    if (exists && !this.validateType(obj, path, expectedType, isOptional)) {
      const value = this.get(obj, path);
      throw new DeepPropertyError(
        `Property at path '${path.join('.')}' has incorrect type. Expected '${expectedType}' but got '${typeof value}'`,
        path,
        expectedType
      );
    }
  }
}

export default DeepPropAnalyzer;
