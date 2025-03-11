
/**
 * Configuration Validator
 * 
 * Centralized system for validating, accessing, and managing application configuration.
 * Implements validation, type safety, and fallback mechanisms.
 */

import { ValidationError } from '@/utils/validation/ValidationError';

// Interface for configuration validation rules
interface ConfigValidationRule {
  key: string;
  required: boolean;
  validator?: (value: string) => boolean;
  fallback?: string;
  description: string;
}

// Configuration validation result
interface ConfigValidationResult {
  isValid: boolean;
  missingKeys: string[];
  invalidKeys: string[];
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
    description: 'Supabase project URL'
  },
  {
    key: 'VITE_SUPABASE_ANON_KEY',
    required: true,
    validator: (value) => value.length > 20,
    description: 'Supabase anonymous API key'
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
export function validateAppConfig(): boolean {
  const env = getEnvironmentVariables();
  const result: ConfigValidationResult = {
    isValid: true,
    missingKeys: [],
    invalidKeys: []
  };

  // Validate all configuration rules
  for (const rule of configValidationRules) {
    const value = env[rule.key];

    // Check if required configuration is missing
    if (rule.required && (value === undefined || value === '')) {
      result.isValid = false;
      result.missingKeys.push(rule.key);
      console.error(`Missing required configuration: ${rule.key} (${rule.description})`);
      continue;
    }
    
    // If value exists and has a validator, check validity
    if (value !== undefined && rule.validator && !rule.validator(value as string)) {
      result.isValid = false;
      result.invalidKeys.push(rule.key);
      console.error(`Invalid configuration value for ${rule.key}: "${value}" (${rule.description})`);
      continue;
    }
    
    // Store valid configuration in cache
    configCache[rule.key] = value !== undefined ? value : rule.fallback;
  }

  return result.isValid;
}

/**
 * Get a validated configuration value
 * 
 * @param key Configuration key
 * @returns The configuration value, or undefined if not set
 */
export function getValidatedConfig(key: string): string | undefined {
  // If not in cache, try to get from environment
  if (configCache[key] === undefined) {
    const env = getEnvironmentVariables();
    let value = env[key];
    
    // Find the rule for this key
    const rule = configValidationRules.find(r => r.key === key);
    
    // If rule exists and value is undefined/empty, use fallback if available
    if (rule && (value === undefined || value === '')) {
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
 * Clear the configuration cache (primarily for testing)
 */
export function clearConfigCache(): void {
  Object.keys(configCache).forEach(key => {
    delete configCache[key];
  });
}

export default {
  validateAppConfig,
  getValidatedConfig,
  getConfig,
  clearConfigCache
};
