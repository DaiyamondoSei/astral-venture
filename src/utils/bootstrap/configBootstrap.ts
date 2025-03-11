
/**
 * Application Bootstrap Configuration
 * 
 * Enforces configuration validation and prevents application startup
 * with invalid configuration, implementing a fail-fast approach.
 */

import { getValidatedConfig, validateConfig } from '@/utils/config/configValidator';
import { ValidationError } from '@/utils/validation/ValidationError';

// Track bootstrap status
let isConfigurationValid = false;
let validationErrors: ValidationError | null = null;

// Required configurations for app to function
const REQUIRED_CONFIGS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

/**
 * Initialize and validate application configuration
 * This should be called early in the application bootstrap process
 */
export function initializeConfiguration(): { isValid: boolean; errors: ValidationError | null } {
  try {
    // Validate all required configurations
    const validationResults = REQUIRED_CONFIGS.map(configKey => {
      try {
        const value = getValidatedConfig(configKey);
        return { key: configKey, isValid: !!value, value };
      } catch (error) {
        return { key: configKey, isValid: false, error };
      }
    });
    
    // Check for any invalid configurations
    const invalidConfigs = validationResults.filter(result => !result.isValid);
    
    if (invalidConfigs.length > 0) {
      // Create detailed validation error
      const details = invalidConfigs.map(config => ({
        path: config.key,
        message: `Missing or invalid configuration: ${config.key}`,
        rule: 'required',
        code: 'CONFIG_ERROR'
      }));
      
      validationErrors = new ValidationError(
        'Application configuration validation failed',
        details,
        'CONFIG_VALIDATION_ERROR',
        500
      );
      
      // Log detailed error for developers
      console.error('[BOOTSTRAP] Configuration validation failed:', validationErrors);
      console.error('Missing configurations:', invalidConfigs.map(c => c.key).join(', '));
      console.error('Please check your environment variables and .env files');
      
      isConfigurationValid = false;
    } else {
      isConfigurationValid = true;
      validationErrors = null;
    }
    
    return { 
      isValid: isConfigurationValid, 
      errors: validationErrors 
    };
  } catch (error) {
    // Handle unexpected errors during validation
    console.error('[BOOTSTRAP] Unexpected error during configuration validation:', error);
    
    validationErrors = error instanceof ValidationError 
      ? error 
      : new ValidationError(
          'Unexpected error during configuration validation',
          [{
            path: 'bootstrap',
            message: error instanceof Error ? error.message : String(error),
            rule: 'validation',
            code: 'UNEXPECTED_ERROR'
          }],
          'BOOTSTRAP_ERROR',
          500
        );
        
    isConfigurationValid = false;
    
    return { 
      isValid: false, 
      errors: validationErrors 
    };
  }
}

/**
 * Ensure valid configuration or throw a detailed error
 * This implements a fail-fast approach to configuration validation
 */
export function ensureValidConfiguration(): void {
  // If we haven't validated configuration yet, do so now
  if (!isConfigurationValid && !validationErrors) {
    const { isValid, errors } = initializeConfiguration();
    
    if (!isValid && errors) {
      throw errors;
    }
  } else if (!isConfigurationValid && validationErrors) {
    // We already know configuration is invalid
    throw validationErrors;
  }
  
  // If we get here, configuration is valid
}

/**
 * Check if a specific configuration key is valid
 */
export function isConfigValid(key: string): boolean {
  try {
    const value = getValidatedConfig(key);
    return !!value;
  } catch (error) {
    return false;
  }
}

/**
 * Get the current validation status
 */
export function getConfigurationStatus(): { isValid: boolean; errors: ValidationError | null } {
  return {
    isValid: isConfigurationValid,
    errors: validationErrors
  };
}

// Auto-initialize configuration on module import
initializeConfiguration();
