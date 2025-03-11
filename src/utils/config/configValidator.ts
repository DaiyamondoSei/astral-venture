
/**
 * Configuration Validation Utility
 * 
 * Provides robust validation for application configuration parameters
 * and environment variables to prevent runtime errors.
 */

import { toast } from '@/components/ui/use-toast';

// Configuration validation result type
export interface ConfigValidationResult {
  isValid: boolean;
  missingVars: string[];
  invalidVars: Array<{name: string; issue: string}>;
}

// Configuration requirement definition
export interface ConfigRequirement {
  name: string;
  required: boolean;
  validator?: (value: string) => boolean | string;
  fallback?: string;
  description?: string;
}

/**
 * Validates configuration variables against defined requirements
 * 
 * @param requirements List of configuration requirements
 * @param env Environment object (defaults to import.meta.env)
 * @returns Validation result with detailed information
 */
export function validateConfig(
  requirements: ConfigRequirement[],
  env: Record<string, string> = import.meta.env
): ConfigValidationResult {
  const result: ConfigValidationResult = {
    isValid: true,
    missingVars: [],
    invalidVars: []
  };

  for (const req of requirements) {
    const value = env[req.name];
    
    // Check if required variable is missing
    if (req.required && (!value || value.trim() === '')) {
      result.isValid = false;
      result.missingVars.push(req.name);
      continue;
    }
    
    // Skip validation if value is empty and not required
    if (!value && !req.required) {
      continue;
    }
    
    // Validate using custom validator if provided
    if (value && req.validator) {
      const validationResult = req.validator(value);
      
      if (validationResult !== true) {
        result.isValid = false;
        result.invalidVars.push({
          name: req.name,
          issue: typeof validationResult === 'string' 
            ? validationResult 
            : 'Failed validation check'
        });
      }
    }
  }
  
  return result;
}

/**
 * Simplified validation for common configuration objects
 * Throws an error if any required configuration is missing
 * 
 * @param config Configuration object to validate
 * @returns true if valid, throws error otherwise
 */
export function validateRequiredConfig(config: Record<string, unknown>): boolean {
  const missingKeys = Object.entries(config)
    .filter(([_, value]) => value === undefined || value === null || value === '')
    .map(([key]) => key);
    
  if (missingKeys.length > 0) {
    throw new Error(`Missing required configuration: ${missingKeys.join(', ')}`);
  }
  
  return true;
}

/**
 * Get a configuration value with fallback
 * 
 * @param name Configuration variable name
 * @param fallback Optional fallback value
 * @param env Environment object (defaults to import.meta.env)
 * @returns The configuration value or fallback
 */
export function getConfigValue(
  name: string,
  fallback: string = '',
  env: Record<string, string> = import.meta.env
): string {
  return env[name] || fallback;
}

/**
 * Common validators for configuration values
 */
export const ConfigValidators = {
  /**
   * Validates a URL string
   */
  isValidUrl: (value: string): boolean | string => {
    try {
      new URL(value);
      return true;
    } catch (e) {
      return 'Invalid URL format';
    }
  },
  
  /**
   * Validates a port number
   */
  isValidPort: (value: string): boolean | string => {
    const port = parseInt(value, 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      return 'Invalid port number (must be between 1-65535)';
    }
    return true;
  },
  
  /**
   * Validates an API key format (simple format check)
   */
  isApiKeyFormat: (value: string): boolean | string => {
    // This is a simple check - adjust based on your API key format
    if (value.length < 10) {
      return 'API key too short (less than 10 characters)';
    }
    return true;
  },
  
  /**
   * Validates that a string is not empty
   */
  isNotEmpty: (value: string): boolean | string => {
    return value.trim() !== '' ? true : 'Value cannot be empty';
  }
};

/**
 * Application configuration requirements
 * Define all required and optional configuration parameters here
 */
export const appConfigRequirements: ConfigRequirement[] = [
  {
    name: 'VITE_SUPABASE_URL',
    required: true,
    validator: ConfigValidators.isValidUrl,
    description: 'Supabase project URL'
  },
  {
    name: 'VITE_SUPABASE_ANON_KEY',
    required: true,
    validator: ConfigValidators.isNotEmpty,
    description: 'Supabase anonymous key for client-side operations'
  }
];

/**
 * Validates the application configuration at startup
 * and shows appropriate warnings for missing or invalid configuration
 * 
 * @returns Whether the validation was successful
 */
export function validateAppConfig(): boolean {
  const result = validateConfig(appConfigRequirements);
  
  if (!result.isValid) {
    // Log detailed information for developers
    console.error('Application configuration validation failed:', result);
    
    // Show a toast notification with important missing vars
    if (result.missingVars.length > 0) {
      toast({
        title: 'Configuration Error',
        description: `Missing required configuration: ${result.missingVars.join(', ')}`,
        variant: 'destructive',
      });
    }
    
    // Show issues with invalid variables
    if (result.invalidVars.length > 0) {
      result.invalidVars.forEach(invalid => {
        console.error(`Invalid configuration for ${invalid.name}: ${invalid.issue}`);
      });
      
      toast({
        title: 'Configuration Error',
        description: 'Some configuration values are invalid. Check the console for details.',
        variant: 'destructive',
      });
    }
  }
  
  return result.isValid;
}

/**
 * Gets a validated configuration value, logging warning if missing
 * 
 * @param name Configuration variable name
 * @param fallback Optional fallback value
 * @returns The configuration value or fallback
 */
export function getValidatedConfig(name: string, fallback: string = ''): string {
  const value = import.meta.env[name];
  
  if (!value && !fallback) {
    console.warn(`Missing configuration for ${name} (no fallback provided)`);
  }
  
  return value || fallback;
}
