
/**
 * Application Bootstrap Configuration
 * 
 * Enforces configuration validation and prevents application startup
 * with invalid configuration, implementing a fail-fast approach.
 */

import { getValidatedConfig, validateAppConfig, getSetupInstructions } from '@/utils/config/configValidator';
import { ValidationError } from '@/utils/validation/ValidationError';
import { ValidationSeverity } from '@/types/core';

// Track bootstrap status
let isConfigurationValid = false;
let validationErrors: ValidationError | null = null;
let isBootstrapComplete = false;
let initializationPromise: Promise<{ isValid: boolean; errors: ValidationError | null | string[] }> | null = null;

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
  // If we have an initialization in progress, return that promise
  if (initializationPromise) {
    return initializationPromise as any;
  }
  
  // Create initialization promise
  initializationPromise = new Promise((resolve) => {
    try {
      // Run initial validation
      const validationResults = validateAppConfig();
      
      if (!validationResults.isValid) {
        // Create detailed validation error
        const errorDetails = [];
        
        // Add missing keys to error details
        for (const key of validationResults.missingKeys) {
          errorDetails.push({
            path: key,
            message: `Missing required configuration: ${key}`,
            rule: 'required',
            code: 'CONFIG_ERROR',
            severity: ValidationSeverity.ERROR
          });
          
          // Log setup instructions in development
          if (import.meta.env.DEV) {
            const instructions = getSetupInstructions(key);
            if (instructions) {
              console.info(`[SETUP] ${instructions}`);
            }
          }
        }
        
        // Add invalid keys to error details
        for (const key of validationResults.invalidKeys) {
          errorDetails.push({
            path: key,
            message: `Invalid configuration value for: ${key}`,
            rule: 'format',
            code: 'CONFIG_ERROR',
            severity: ValidationSeverity.ERROR
          });
        }
        
        validationErrors = new ValidationError(
          'Application configuration validation failed',
          errorDetails,
          'CONFIG_VALIDATION_ERROR',
          500
        );
        
        // Log detailed error for developers
        if (import.meta.env.DEV) {
          console.error('[BOOTSTRAP] Configuration validation failed:', validationErrors);
          console.error('Missing or invalid configurations:', 
            [...validationResults.missingKeys, ...validationResults.invalidKeys].join(', '));
          console.error('Please check your environment variables and .env files');
        } else {
          // In production, log a less detailed error
          console.error('[BOOTSTRAP] Application configuration validation failed');
        }
        
        isConfigurationValid = false;
        
        if (throwOnError) {
          throw validationErrors;
        }
        
        resolve({ 
          isValid: false, 
          errors: errorDetails.map(detail => detail.message)
        });
      } else {
        isConfigurationValid = true;
        validationErrors = null;
        isBootstrapComplete = true;
        
        // Log success in development
        if (import.meta.env.DEV) {
          console.info('[BOOTSTRAP] Configuration validation successful');
        }
        
        resolve({ 
          isValid: true, 
          errors: null 
        });
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
              code: 'BOOTSTRAP_ERROR',
              severity: ValidationSeverity.ERROR
            }],
            'BOOTSTRAP_ERROR',
            500
          );
          
      validationErrors = unexpectedError;
      isConfigurationValid = false;
      
      if (throwOnError) {
        throw unexpectedError;
      }
      
      resolve({ 
        isValid: false, 
        errors: [unexpectedError.message]
      });
    }
  });
  
  return initializationPromise as any;
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
          ? errors.map(msg => ({ 
              path: 'config', 
              message: msg, 
              rule: 'required', 
              code: 'CONFIG_ERROR',
              severity: ValidationSeverity.ERROR
            }))
          : [{ 
              path: 'config', 
              message: 'Unknown configuration error', 
              rule: 'required', 
              code: 'CONFIG_ERROR',
              severity: ValidationSeverity.ERROR
            }],
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
  initializationPromise = null;
}

// DO NOT auto-initialize configuration on module import
// This has been intentionally removed to prevent initialization before environment variables are loaded
