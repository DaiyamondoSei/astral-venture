
/**
 * Utility functions for validating interface implementation
 * 
 * Use these functions to validate that objects properly implement interfaces
 * at runtime, useful for debugging interface synchronization issues.
 */

/**
 * Validates that an object implements an interface by checking 
 * that all required properties exist
 * 
 * @param objectName Name of the object being validated (for error messages)
 * @param obj The object to validate
 * @param requiredProps Array of required property names
 * @returns True if the object has all required properties
 */
export function validateRequiredProps<T extends object>(
  objectName: string,
  obj: unknown,
  requiredProps: (keyof T)[]
): boolean {
  if (!obj || typeof obj !== 'object') {
    console.error(`${objectName}: Not an object`);
    return false;
  }

  const missingProps = requiredProps.filter(prop => !(prop in (obj as object)));
  
  if (missingProps.length > 0) {
    console.error(`${objectName}: Missing required properties: ${missingProps.join(', ')}`);
    return false;
  }
  
  return true;
}

/**
 * Validates that an object fully implements an interface by checking
 * all properties against a shape object that defines the expected types
 * 
 * @param objectName Name of the object being validated
 * @param obj The object to validate
 * @param shape An object defining the expected shape with the same properties
 * @returns True if the object matches the expected shape
 */
export function validateObjectShape<T extends object>(
  objectName: string,
  obj: unknown,
  shape: T
): boolean {
  if (!obj || typeof obj !== 'object') {
    console.error(`${objectName}: Not an object`);
    return false;
  }
  
  const objKeys = Object.keys(obj);
  const shapeKeys = Object.keys(shape);
  
  // Check for missing required properties
  const missingProps = shapeKeys.filter(key => {
    // Optional properties in the shape will be undefined
    const isOptional = shape[key as keyof T] === undefined;
    return !isOptional && !(key in (obj as object));
  });
  
  if (missingProps.length > 0) {
    console.error(`${objectName}: Missing required properties: ${missingProps.join(', ')}`);
    return false;
  }
  
  // Check for type mismatches
  const typeMismatches = objKeys
    .filter(key => key in shape)
    .filter(key => {
      const objValue = (obj as any)[key];
      const shapeValue = shape[key as keyof T];
      
      if (shapeValue === undefined) {
        // Optional property, any value is acceptable
        return false;
      }
      
      // For objects and arrays, just check the type, not the content
      if (typeof shapeValue === 'object') {
        return typeof objValue !== 'object';
      }
      
      // For functions, just check that it's a function
      if (typeof shapeValue === 'function') {
        return typeof objValue !== 'function';
      }
      
      // For primitives, check the type
      return typeof objValue !== typeof shapeValue;
    });
  
  if (typeMismatches.length > 0) {
    console.error(`${objectName}: Property type mismatches: ${typeMismatches.join(', ')}`);
    return false;
  }
  
  return true;
}

/**
 * Validates that an interface implementation is backward compatible
 * with a previous version of the interface
 * 
 * @param objectName Name of the object being validated
 * @param currentImpl The current implementation
 * @param legacyShape A shape object defining the legacy interface
 * @returns True if the current implementation is backward compatible
 */
export function validateBackwardCompatibility<T extends object, U extends object>(
  objectName: string,
  currentImpl: T,
  legacyShape: U
): boolean {
  const legacyKeys = Object.keys(legacyShape);
  
  // Check that all legacy properties exist in the current implementation
  const missingProps = legacyKeys.filter(key => !(key in currentImpl));
  
  if (missingProps.length > 0) {
    console.error(`${objectName}: Not backward compatible. Missing legacy properties: ${missingProps.join(', ')}`);
    return false;
  }
  
  // Check that the types of legacy properties are compatible
  const typeMismatches = legacyKeys
    .filter(key => {
      const currentValue = currentImpl[key as keyof T];
      const legacyValue = legacyShape[key as keyof U];
      
      // For objects and arrays, just check the type, not the content
      if (typeof legacyValue === 'object') {
        return typeof currentValue !== 'object';
      }
      
      // For functions, just check that it's a function
      if (typeof legacyValue === 'function') {
        return typeof currentValue !== 'function';
      }
      
      // For primitives, check the type
      return typeof currentValue !== typeof legacyValue;
    });
  
  if (typeMismatches.length > 0) {
    console.error(`${objectName}: Not backward compatible. Property type mismatches: ${typeMismatches.join(', ')}`);
    return false;
  }
  
  return true;
}

/**
 * Creates a validation wrapper that logs errors but returns the original object
 * Useful for development to detect interface issues without breaking the application
 * 
 * @param objectName Name of the object being validated
 * @param obj The object to validate
 * @param shape An object defining the expected shape
 * @returns The original object, even if validation fails
 */
export function createValidatedObject<T extends object>(
  objectName: string,
  obj: T,
  shape: Partial<T>
): T {
  validateObjectShape(objectName, obj, shape);
  return obj;
}
