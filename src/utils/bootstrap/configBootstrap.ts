
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
let isBootstrapComplete = false;

// Required configurations for app to function
const REQUIRED_CONFIGS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

/**
 * Initialize and validate application configuration
 * This should be called early in the application bootstrap process
 * 
 * @param throwOnError Whether to throw errors (true) or just return status (false)
 * @returns Configuration validation status
 */
export function initializeConfiguration(throwOnError = false): { 
  isValid: boolean; 
  errors: ValidationError | null | string[]
} {
  try {
    // Check if environment has fully loaded
    if (typeof import.meta.env === 'undefined') {
      console.warn('[CONFIG] Environment variables not yet available, deferring validation');
      return {
        isValid: false,
        errors: ['Environment variables not fully loaded yet']
      };
    }
    
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
      const errorDetails = invalidConfigs.map(config => ({
        path: config.key,
        message: `Missing or invalid configuration: ${config.key}`,
        rule: 'required',
        code: 'CONFIG_ERROR'
      }));
      
      const errorMessages = invalidConfigs.map(c => `Missing or invalid configuration: ${c.key}`);
      
      validationErrors = new ValidationError(
        'Application configuration validation failed',
        errorDetails,
        'CONFIG_VALIDATION_ERROR',
        500
      );
      
      // Log detailed error for developers
      console.error('[BOOTSTRAP] Configuration validation failed:', validationErrors);
      console.error('Missing or invalid configurations:', invalidConfigs.map(c => c.key).join(', '));
      console.error('Please check your environment variables and .env files');
      
      isConfigurationValid = false;
      
      if (throwOnError) {
        throw validationErrors;
      }
      
      return { 
        isValid: false, 
        errors: errorMessages
      };
    } else {
      isConfigurationValid = true;
      validationErrors = null;
      isBootstrapComplete = true;
      
      return { 
        isValid: true, 
        errors: null 
      };
    }
  } catch (error) {
    // Handle unexpected errors during validation
    console.error('[BOOTSTRAP] Unexpected error during configuration validation:', error);
    
    const unexpectedError = error instanceof ValidationError 
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
        
    validationErrors = unexpectedError;
    isConfigurationValid = false;
    
    if (throwOnError) {
      throw unexpectedError;
    }
    
    return { 
      isValid: false, 
      errors: [unexpectedError.message]
    };
  }
}

/**
 * Ensure valid configuration or throw a detailed error
 * This implements a fail-fast approach to configuration validation
 * 
 * @param retryIfNotComplete Whether to retry initialization if not yet complete
 */
export function ensureValidConfiguration(retryIfNotComplete = true): void {
  // If we haven't fully validated configuration yet, do so now
  if (retryIfNotComplete && !isBootstrapComplete) {
    const { isValid, errors } = initializeConfiguration(true);
    
    if (!isValid && errors) {
      throw new ValidationError(
        'Configuration validation failed',
        Array.isArray(errors) 
          ? errors.map(msg => ({ path: 'config', message: msg, rule: 'required', code: 'CONFIG_ERROR' }))
          : [{ path: 'config', message: 'Unknown configuration error', rule: 'required', code: 'CONFIG_ERROR' }],
        'CONFIG_VALIDATION_ERROR',
        500
      );
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
export function getConfigurationStatus(): { 
  isValid: boolean; 
  errors: ValidationError | null;
  isComplete: boolean;
} {
  return {
    isValid: isConfigurationValid,
    errors: validationErrors,
    isComplete: isBootstrapComplete
  };
}

/**
 * Reset configuration state (primarily for testing)
 */
export function resetConfigurationState(): void {
  isConfigurationValid = false;
  validationErrors = null;
  isBootstrapComplete = false;
}

// DO NOT auto-initialize configuration on module import
// This has been intentionally removed to prevent initialization before environment variables are loaded
