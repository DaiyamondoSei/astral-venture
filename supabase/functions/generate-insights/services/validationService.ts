
/**
 * Validate reflections data
 */
export function validateReflectionsData(reflections: any[]): {
  isValid: boolean;
  errorMessage?: string;
} {
  if (!Array.isArray(reflections)) {
    return {
      isValid: false,
      errorMessage: "Reflections must be an array"
    };
  }
  
  if (reflections.length === 0) {
    return {
      isValid: false,
      errorMessage: "Reflections array cannot be empty"
    };
  }
  
  // Check if reflections have the required fields
  const invalidReflections = reflections.filter(r => !r.content);
  if (invalidReflections.length > 0) {
    return {
      isValid: false,
      errorMessage: "All reflections must have content"
    };
  }
  
  return { isValid: true };
}

/**
 * Validate user ID
 */
export function validateUserId(
  requestUserId: string,
  authenticatedUserId: string
): {
  isValid: boolean;
  errorMessage?: string;
} {
  if (!requestUserId) {
    return {
      isValid: false,
      errorMessage: "Missing user ID"
    };
  }
  
  if (requestUserId !== authenticatedUserId) {
    return {
      isValid: false,
      errorMessage: "You can only generate insights for your own reflections"
    };
  }
  
  return { isValid: true };
}
