
/**
 * Configuration Validator
 * 
 * Centralized system for validating, accessing, and managing application configuration.
 * Implements validation, type safety, and fallback mechanisms.
 */

import { ValidationError } from '@/utils/validation/ValidationError';
import { ValidationSeverity } from '@/types/core';

// Interface for configuration validation rules
interface ConfigValidationRule {
  key: string;
  required: boolean;
  validator?: (value: string) => boolean;
  fallback?: string;
  description: string;
  setupInstructions?: string;
}

// Configuration validation result
interface ConfigValidationResult {
  isValid: boolean;
  missingKeys: string[];
  invalidKeys: string[];
  warnings: string[];
}

// Application configuration
interface AppConfig {
  [key: string]: string | undefined;
}

// Define validation rules for all required configuration
const configValidationRules: ConfigValidationRule[] = [
  {
    key: 'VITE_SUPABASE_URL',
    required: true,
    validator: (value) => value.startsWith('https://') && value.includes('.supabase.co'),
    description: 'Supabase project URL',
    setupInstructions: 'Create a .env file in your project root and add VITE_SUPABASE_URL=https://your-project-id.supabase.co'
  },
  {
    key: 'VITE_SUPABASE_ANON_KEY',
    required: true,
    validator: (value) => value.length > 20,
    description: 'Supabase anonymous API key',
    setupInstructions: 'Add VITE_SUPABASE_ANON_KEY=your-anon-key to your .env file'
  },
  {
    key: 'VITE_API_ENDPOINT',
    required: false,
    fallback: '/api',
    description: 'API endpoint for backend services'
  },
  {
    key: 'VITE_APP_VERSION',
    required: false,
    fallback: '0.1.0',
    description: 'Application version'
  },
  {
    key: 'VITE_ENABLE_ANALYTICS',
    required: false,
    fallback: 'false',
    validator: (value) => value === 'true' || value === 'false',
    description: 'Enable or disable analytics tracking'
  },
  {
    key: 'VITE_LOG_LEVEL',
    required: false,
    fallback: 'warn',
    validator: (value) => ['debug', 'info', 'warn', 'error'].includes(value),
    description: 'Application logging level'
  }
];

// In-memory cache of validated configuration
const configCache: AppConfig = {};

/**
 * Get the environment variables based on the current environment
 */
function getEnvironmentVariables(): AppConfig {
  return import.meta.env;
}

/**
 * Validate all required configuration
 * 
 * @returns Validation result with overall validity and details
 */
export function validateAppConfig(): ConfigValidationResult {
  const env = getEnvironmentVariables();
  const result: ConfigValidationResult = {
    isValid: true,
    missingKeys: [],
    invalidKeys: [],
    warnings: []
  };

  // Validate all configuration rules
  for (const rule of configValidationRules) {
    const value = env[rule.key];

    // Check if required configuration is missing
    if (rule.required && (value === undefined || value === '')) {
      result.isValid = false;
      result.missingKeys.push(rule.key);
      
      // Different logging for dev vs prod
      if (import.meta.env.DEV) {
        console.error(`Missing required configuration: ${rule.key} (${rule.description})`);
        if (rule.setupInstructions) {
          console.info(`Setup instructions: ${rule.setupInstructions}`);
        }
      } else {
        // In production, just log that configuration is missing without details
        console.error(`Application configuration error: Missing required values`);
      }
      continue;
    }
    
    // If value exists and has a validator, check validity
    if (value !== undefined && rule.validator && !rule.validator(value as string)) {
      result.isValid = false;
      result.invalidKeys.push(rule.key);
      
      // Different logging for dev vs prod
      if (import.meta.env.DEV) {
        console.error(`Invalid configuration value for ${rule.key}: "${value}" (${rule.description})`);
      } else {
        console.error(`Application configuration error: Invalid values`);
      }
      continue;
    }
    
    // If not required but value is invalid, add warning and use fallback
    if (!rule.required && value !== undefined && rule.validator && !rule.validator(value as string)) {
      result.warnings.push(`Invalid value for optional configuration: ${rule.key}. Using fallback value.`);
    }
    
    // Store valid configuration in cache
    configCache[rule.key] = value !== undefined ? value : rule.fallback;
  }

  return result;
}

/**
 * Get a validated configuration value with retry logic
 * 
 * @param key Configuration key
 * @param retryCount Number of retry attempts (default: 0)
 * @returns The configuration value, or undefined if not set after retries
 */
export function getValidatedConfig(key: string, retryCount = 0): string | undefined {
  // Maximum number of retries
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 50; // ms
  
  // If not in cache, try to get from environment
  if (configCache[key] === undefined) {
    const env = getEnvironmentVariables();
    let value = env[key];
    
    // If the value is undefined and we haven't reached max retries,
    // it might be because environment variables are still loading
    if (value === undefined && retryCount < MAX_RETRIES) {
      // Retry after a short delay
      return new Promise<string | undefined>((resolve) => {
        setTimeout(() => {
          resolve(getValidatedConfig(key, retryCount + 1));
        }, RETRY_DELAY * (retryCount + 1));
      }) as any; // This is technically incorrect typing but needed for synchronous contexts
    }
    
    // Find the rule for this key
    const rule = configValidationRules.find(r => r.key === key);
    
    // If rule exists and value is undefined/empty, use fallback if available
    if (rule && (value === undefined || value === '')) {
      // If we've retried and still don't have a value, but it's required,
      // log a warning in development mode
      if (retryCount > 0 && rule.required && import.meta.env.DEV) {
        console.warn(`[CONFIG] Required config ${key} not found after ${retryCount} retries`);
      }
      
      value = rule.fallback;
    }
    
    // Store in cache
    configCache[key] = value;
  }
  
  return configCache[key];
}

/**
 * Get a validated configuration value with type casting
 * 
 * @param key Configuration key
 * @param defaultValue Default value if configuration is not set
 * @returns The configuration value cast to the specified type
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
 * Check if a specific environment variable is valid
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
 * Clear the configuration cache (primarily for testing)
 */
export function clearConfigCache(): void {
  Object.keys(configCache).forEach(key => {
    delete configCache[key];
  });
}

/**
 * Gets setup instructions for missing configuration
 */
export function getSetupInstructions(key: string): string | undefined {
  const rule = configValidationRules.find(r => r.key === key);
  return rule?.setupInstructions;
}

export default {
  validateAppConfig,
  getValidatedConfig,
  getConfig,
  isConfigValid,
  clearConfigCache,
  getSetupInstructions
};
