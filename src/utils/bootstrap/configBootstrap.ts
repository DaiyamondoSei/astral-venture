
/**
 * Configuration Bootstrap Module
 * 
 * Manages application configuration loading, validation, and initialization.
 * Implements a fail-fast pattern to prevent application startup with invalid configuration.
 */

import { toast } from '@/components/ui/use-toast';
import { validateAppConfig, getValidatedConfig } from '@/utils/config/configValidator';
import { ValidationError } from '@/utils/validation/ValidationError';

/**
 * Application configuration state
 */
export interface AppConfigState {
  isValid: boolean;
  isInitialized: boolean;
  errors: string[];
  initializationTime: number | null;
}

/**
 * Configuration initialization result
 */
export interface ConfigInitResult extends AppConfigState {
  timestamp: number;
}

// Application configuration state singleton
const configState: AppConfigState = {
  isValid: false,
  isInitialized: false,
  errors: [],
  initializationTime: null
};

/**
 * Initialize and validate all application configuration
 * This must be called before any service that requires configuration
 * 
 * @param throwOnError Whether to throw an error when validation fails
 * @returns Promise that resolves to config initialization result
 */
export async function initializeConfiguration(throwOnError: boolean = true): Promise<ConfigInitResult> {
  console.log('Initializing application configuration...');
  
  // Avoid multiple initializations
  if (configState.isInitialized) {
    return {
      ...configState,
      timestamp: Date.now()
    };
  }
  
  const startTime = performance.now();
  configState.errors = [];
  
  try {
    // 1. Run validation on all required configuration
    const validationResult = validateAppConfig();
    
    // 2. Set configuration state
    configState.isValid = validationResult.isValid;
    configState.isInitialized = true;
    configState.initializationTime = performance.now() - startTime;
    configState.errors = [...validationResult.missingKeys.map(key => `Missing required config: ${key}`), 
                         ...validationResult.invalidKeys.map(key => `Invalid config value: ${key}`)];
    
    // 3. Log the configuration status
    if (validationResult.isValid) {
      console.log(`Configuration successfully validated in ${configState.initializationTime.toFixed(2)}ms`);
    } else {
      console.error('Configuration validation failed:');
      configState.errors.forEach(err => console.error(`- ${err}`));
      
      // Throw error if requested - this will prevent application startup
      if (throwOnError) {
        throw new ValidationError(
          'Application configuration is invalid. Check console for details.',
          configState.errors.map(error => ({ path: 'config', message: error })),
          'CONFIG_VALIDATION_ERROR',
          500
        );
      }
    }
    
    return {
      ...configState,
      timestamp: Date.now()
    };
  } catch (error) {
    configState.isValid = false;
    configState.isInitialized = true;
    configState.initializationTime = performance.now() - startTime;
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown configuration error';
    if (!configState.errors.includes(errorMessage)) {
      configState.errors.push(errorMessage);
    }
    
    console.error('Configuration initialization failed:', error);
    
    toast({
      title: 'Configuration Error',
      description: 'The application could not initialize properly due to configuration issues.',
      variant: 'destructive',
    });
    
    if (throwOnError && error instanceof Error) {
      throw error;
    }
    
    return {
      ...configState,
      timestamp: Date.now()
    };
  }
}

/**
 * Check if configuration has been initialized and is valid
 * 
 * @throws Error if configuration is not initialized or is invalid
 */
export function ensureValidConfiguration(): void {
  if (!configState.isInitialized) {
    throw new Error(
      'Application configuration has not been initialized. ' +
      'Call initializeConfiguration() before using any services.'
    );
  }
  
  if (!configState.isValid) {
    throw new ValidationError(
      'Invalid configuration. The application cannot proceed.',
      configState.errors.map(error => ({ path: 'config', message: error })),
      'CONFIG_VALIDATION_ERROR',
      500
    );
  }
}

/**
 * Get the current configuration state
 */
export function getConfigurationState(): Readonly<AppConfigState> {
  return { ...configState };
}

/**
 * Reset configuration state (primarily for testing)
 */
export function resetConfigurationState(): void {
  configState.isValid = false;
  configState.isInitialized = false;
  configState.errors = [];
  configState.initializationTime = null;
}

export default {
  initializeConfiguration,
  ensureValidConfiguration,
  getConfigurationState,
  resetConfigurationState
};
