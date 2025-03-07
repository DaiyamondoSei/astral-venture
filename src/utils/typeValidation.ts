
import { toast } from '@/components/ui/use-toast';

/**
 * Type validation severity levels
 */
export enum ValidationSeverity {
  WARNING = 'warning',
  ERROR = 'error',
  SILENT = 'silent'
}

/**
 * Options for type validation
 */
export interface TypeValidationOptions {
  severity?: ValidationSeverity;
  showToast?: boolean;
  logToConsole?: boolean;
  allowPartial?: boolean;
  extraValidation?: (data: unknown) => boolean;
}

/**
 * Validates data against a TypeScript interface at runtime
 * 
 * @param data The data to validate
 * @param schemaObject A sample object with the expected shape (used for validation)
 * @param options Validation options
 * @returns Whether the data is valid according to the expected schema
 */
export function validateType<T>(
  data: unknown,
  schemaObject: T,
  options: TypeValidationOptions = {}
): boolean {
  const {
    severity = ValidationSeverity.WARNING,
    showToast = severity === ValidationSeverity.ERROR,
    logToConsole = true,
    allowPartial = false,
    extraValidation
  } = options;

  if (data === null || data === undefined) {
    handleValidationIssue(
      'Data is null or undefined',
      severity,
      showToast,
      logToConsole
    );
    return false;
  }

  if (typeof data !== 'object') {
    handleValidationIssue(
      `Expected object, got ${typeof data}`,
      severity,
      showToast,
      logToConsole
    );
    return false;
  }

  // Check if all required properties exist and have the correct type
  const issues: string[] = [];
  const schemaKeys = Object.keys(schemaObject as object);
  
  for (const key of schemaKeys) {
    const schemaValue = (schemaObject as any)[key];
    const dataValue = (data as any)[key];
    
    // Skip if property is missing but we allow partial matches
    if (dataValue === undefined && allowPartial) {
      continue;
    }
    
    // Check if property exists
    if (dataValue === undefined) {
      issues.push(`Missing required property: ${key}`);
      continue;
    }
    
    // Check type compatibility
    const schemaType = typeof schemaValue;
    const dataType = typeof dataValue;
    
    if (dataType !== schemaType) {
      // Special case for arrays which are technically objects
      if (Array.isArray(schemaValue) && !Array.isArray(dataValue)) {
        issues.push(`Property ${key} should be an array, got ${dataType}`);
      } else if (dataType !== schemaType) {
        issues.push(`Property ${key} has wrong type: expected ${schemaType}, got ${dataType}`);
      }
    }
  }
  
  // Run extra validation if provided
  if (extraValidation && !extraValidation(data)) {
    issues.push('Failed custom validation rules');
  }
  
  // Handle any found issues
  if (issues.length > 0) {
    handleValidationIssue(
      `Type validation failed:\n- ${issues.join('\n- ')}`,
      severity,
      showToast,
      logToConsole
    );
    return false;
  }
  
  return true;
}

/**
 * Handle a validation issue based on severity
 */
function handleValidationIssue(
  message: string,
  severity: ValidationSeverity,
  showToast: boolean,
  logToConsole: boolean
): void {
  // Log to console if enabled
  if (logToConsole) {
    if (severity === ValidationSeverity.ERROR) {
      console.error('Type validation error:', message);
    } else if (severity === ValidationSeverity.WARNING) {
      console.warn('Type validation warning:', message);
    } else {
      console.info('Type validation info:', message);
    }
  }
  
  // Show toast if enabled
  if (showToast) {
    toast({
      title: severity === ValidationSeverity.ERROR 
        ? 'Type Validation Error' 
        : 'Type Validation Warning',
      description: message.length > 100 
        ? `${message.substring(0, 100)}...` 
        : message,
      variant: severity === ValidationSeverity.ERROR ? 'destructive' : 'default'
    });
  }
}

/**
 * Helper function to create a strongly typed validator for a specific interface
 */
export function createValidator<T>(
  schemaObject: T,
  defaultOptions: TypeValidationOptions = {}
) {
  return (data: unknown, options: TypeValidationOptions = {}): data is T => {
    return validateType(data, schemaObject, { ...defaultOptions, ...options });
  };
}
