
/**
 * DeepPropAnalyzer - A utility for safely accessing deeply nested properties
 * Helps prevent "Cannot read property 'x' of undefined" errors
 */

/**
 * Safely gets a deeply nested property from an object
 * @param obj The object to get the property from
 * @param path The path to the property as a string (e.g., 'user.profile.name')
 * @param defaultValue The default value to return if the property doesn't exist
 * @returns The property value or the default value
 */
export function getDeepProp<T = unknown>(
  obj: unknown,
  path: string,
  defaultValue: T | null = null
): T | null {
  if (obj === null || obj === undefined) {
    return defaultValue;
  }
  
  try {
    // Split the path by dots
    const keys = path.split('.');
    let current: any = obj;
    
    // Traverse the object by each key in the path
    for (const key of keys) {
      if (current === null || current === undefined) {
        return defaultValue;
      }
      
      current = current[key];
    }
    
    // Return the final value or default
    return current !== undefined ? current as T : defaultValue;
  } catch (error) {
    console.warn(`Error getting deep property '${path}':`, error);
    return defaultValue;
  }
}

/**
 * Checks if a deeply nested property exists in an object
 * @param obj The object to check
 * @param path The path to the property as a string (e.g., 'user.profile.name')
 * @returns True if the property exists, false otherwise
 */
export function hasDeepProp(obj: unknown, path: string): boolean {
  if (obj === null || obj === undefined) {
    return false;
  }
  
  try {
    // Split the path by dots
    const keys = path.split('.');
    let current: any = obj;
    
    // Traverse the object by each key in the path
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      
      if (current === null || current === undefined) {
        return false;
      }
      
      // If we're at the last key, check if it exists
      if (i === keys.length - 1) {
        return key in current;
      }
      
      current = current[key];
    }
    
    return false;
  } catch (error) {
    console.warn(`Error checking deep property '${path}':`, error);
    return false;
  }
}

/**
 * Sets a deeply nested property on an object, creating intermediate objects if needed
 * @param obj The object to set the property on
 * @param path The path to the property as a string (e.g., 'user.profile.name')
 * @param value The value to set
 * @returns A new object with the property set
 */
export function setDeepProp<T extends Record<string, any>>(
  obj: T,
  path: string,
  value: unknown
): T {
  if (typeof obj !== 'object' || obj === null) {
    console.warn(`Cannot set property '${path}' on non-object:`, obj);
    return obj;
  }
  
  try {
    // Create a copy of the object to avoid mutations
    const result = { ...obj };
    const keys = path.split('.');
    
    // Start at the root of our copy
    let current: any = result;
    
    // Traverse and create the path as needed
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      
      // Create intermediate objects if they don't exist
      if (!(key in current) || current[key] === null || typeof current[key] !== 'object') {
        current[key] = {};
      }
      
      current = current[key];
    }
    
    // Set the final property
    const lastKey = keys[keys.length - 1];
    current[lastKey] = value;
    
    return result;
  } catch (error) {
    console.warn(`Error setting deep property '${path}':`, error);
    return obj;
  }
}

/**
 * Safely removes a deeply nested property from an object
 * @param obj The object to remove the property from
 * @param path The path to the property as a string (e.g., 'user.profile.name')
 * @returns A new object with the property removed
 */
export function removeDeepProp<T extends Record<string, any>>(
  obj: T,
  path: string
): T {
  if (typeof obj !== 'object' || obj === null) {
    console.warn(`Cannot remove property '${path}' from non-object:`, obj);
    return obj;
  }
  
  try {
    // Create a copy of the object to avoid mutations
    const result = { ...obj };
    const keys = path.split('.');
    
    // Handle single-level property
    if (keys.length === 1) {
      const copy = { ...result };
      delete copy[keys[0]];
      return copy;
    }
    
    // Start at the root of our copy
    let current: any = result;
    
    // Traverse to the parent of the property to remove
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      
      if (!(key in current) || current[key] === null || typeof current[key] !== 'object') {
        // Path doesn't exist, so nothing to remove
        return result;
      }
      
      current = current[key];
    }
    
    // Remove the property
    const lastKey = keys[keys.length - 1];
    if (current && typeof current === 'object' && lastKey in current) {
      const currentCopy = { ...current };
      delete currentCopy[lastKey];
      
      // Update the parent with the new copy
      let parentCopy = result;
      for (let i = 0; i < keys.length - 2; i++) {
        parentCopy = parentCopy[keys[i]];
      }
      
      if (keys.length > 1) {
        parentCopy[keys[keys.length - 2]] = currentCopy;
      }
    }
    
    return result;
  } catch (error) {
    console.warn(`Error removing deep property '${path}':`, error);
    return obj;
  }
}
