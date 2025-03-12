
/**
 * Application Bootstrap Configuration
 * 
 * Enforces configuration validation and prevents application startup
 * with invalid configuration, implementing a fail-fast approach.
 */

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

// Configuration setup instructions
const SETUP_INSTRUCTIONS: Record<string, string> = {
  'VITE_SUPABASE_URL': 'Create a .env file in your project root and add VITE_SUPABASE_URL=https://your-project-id.supabase.co',
  'VITE_SUPABASE_ANON_KEY': 'Add VITE_SUPABASE_ANON_KEY=your-anon-key to your .env file'
};

/**
 * Gets a validated config value with retry mechanism
 * @param key Config key to retrieve
 * @param defaultValue Optional default value
 * @returns The config value or default value
 */
export function getValidatedConfig(key: string, defaultValue?: string): string | undefined {
  const value = import.meta.env[key];
  
  if (value === undefined || value === '') {
    if (REQUIRED_CONFIGS.includes(key)) {
      if (import.meta.env.DEV) {
        const instructions = getSetupInstructions(key);
        console.warn(`Missing required config: ${key}`);
        if (instructions) {
          console.info(`[SETUP] ${instructions}`);
        }
      }
    }
    return defaultValue;
  }
  
  return value;
}

/**
 * Gets typed configuration with fallback
 */
export function getConfig<T>(key: string, defaultValue: T): T {
  const value = getValidatedConfig(key);
  
  if (value === undefined) {
    return defaultValue;
  }
  
  // Type casting based on default value type
  const valueType = typeof defaultValue;
  
  try {
    if (valueType === 'boolean') {
      return (value.toLowerCase() === 'true') as unknown as T;
    }
    
    if (valueType === 'number') {
      return Number(value) as unknown as T;
    }
    
    if (valueType === 'object' && defaultValue !== null) {
      return JSON.parse(value) as T;
    }
    
    return value as unknown as T;
  } catch (error) {
    console.warn(`Error casting configuration value for ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Initialize and validate application configuration
 * This should be called early in the application bootstrap process
 * 
 * @param throwOnError Whether to throw errors (true) or just return status (false)
 * @returns Promise resolving to configuration validation status
 */
export async function initializeConfiguration(throwOnError = false): Promise<{ 
  isValid: boolean; 
  errors: ValidationError | null | string[]
}> {
  // If we have an initialization in progress, return that promise
  if (initializationPromise) {
    return initializationPromise;
  }
  
  // Create initialization promise
  initializationPromise = new Promise((resolve) => {
    try {
      // Validate required environment variables
      const missingVars: string[] = [];
      const validVars: string[] = [];
      
      // Check if all required configs are present
      for (const key of REQUIRED_CONFIGS) {
        const value = getValidatedConfig(key);
        if (value === undefined) {
          missingVars.push(key);
        } else {
          validVars.push(key);
        }
      }
      
      const isValid = missingVars.length === 0;
      
      if (!isValid) {
        // Create detailed validation error
        const errorDetails = missingVars.map(key => ({
          path: key,
          message: `Missing required configuration: ${key}`,
          rule: 'required',
          code: 'CONFIG_ERROR',
          severity: ValidationSeverity.ERROR
        }));
        
        // Log detailed messages in development
        if (import.meta.env.DEV) {
          console.error('[BOOTSTRAP] Configuration validation failed. Missing configuration:');
          missingVars.forEach(key => {
            console.error(`- ${key}`);
            const instructions = getSetupInstructions(key);
            if (instructions) {
              console.info(`  ${instructions}`);
            }
          });
        } else {
          // In production, log a less detailed error
          console.error('[BOOTSTRAP] Application configuration validation failed');
        }
        
        validationErrors = new ValidationError(
          'Application configuration validation failed',
          errorDetails,
          'CONFIG_VALIDATION_ERROR',
          500
        );
        
        isConfigurationValid = false;
        
        if (throwOnError) {
          throw validationErrors;
        }
        
        resolve({ 
          isValid: false, 
          errors: missingVars
        });
      } else {
        // All required configs are present
        isConfigurationValid = true;
        validationErrors = null;
        isBootstrapComplete = true;
        
        // Log success in development
        if (import.meta.env.DEV) {
          console.info('[BOOTSTRAP] Configuration validation successful');
          console.info(`Validated configurations: ${validVars.join(', ')}`);
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
  
  return initializationPromise;
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
 * Check if a specific configuration key is valid
 */
export function isConfigValid(key: string): boolean {
  const value = getValidatedConfig(key);
  return value !== undefined;
}

/**
 * Gets setup instructions for missing configuration
 */
export function getSetupInstructions(key: string): string | undefined {
  return SETUP_INSTRUCTIONS[key];
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
