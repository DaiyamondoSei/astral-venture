
/**
 * Configuration Validation
 * 
 * Provides validation utilities for configuration objects.
 */
import { Result, success, failure } from '../result/Result';
import { PerfConfig, DEFAULT_PERF_CONFIG } from '@/hooks/usePerfConfig';

/**
 * Validation error with details
 */
export interface ValidationError {
  message: string;
  path: string;
  value?: any;
}

/**
 * Validation result type
 */
export type ValidationResult = Result<true, ValidationError[]>;

/**
 * Validates a performance configuration object
 */
export function validatePerfConfig(config: Partial<PerfConfig>): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Helper to add validation errors
  const addError = (path: string, message: string, value?: any) => {
    errors.push({ path, message, value });
  };
  
  // Validate deviceCapability
  if (config.deviceCapability !== undefined) {
    if (!['low', 'medium', 'high'].includes(config.deviceCapability)) {
      addError('deviceCapability', 
        'Device capability must be one of: low, medium, high', 
        config.deviceCapability);
    }
  }
  
  // Validate boolean fields
  const booleanFields = [
    'useManualCapability', 'disableAnimations', 'disableEffects',
    'enablePerformanceTracking', 'enableRenderTracking', 'enableValidation',
    'enablePropTracking', 'enableDebugLogging', 'intelligentProfiling',
    'inactiveTabThrottling', 'batchUpdates', 'enableAdaptiveRendering',
    'enableProgressiveEnhancement', 'metricsPersistence'
  ];
  
  booleanFields.forEach(field => {
    if (config[field as keyof PerfConfig] !== undefined) {
      const value = config[field as keyof PerfConfig];
      if (typeof value !== 'boolean') {
        addError(field, `${field} must be a boolean`, value);
      }
    }
  });
  
  // Validate number fields
  if (config.samplingRate !== undefined) {
    if (typeof config.samplingRate !== 'number' || 
        config.samplingRate < 0 || 
        config.samplingRate > 1) {
      addError('samplingRate', 
        'Sampling rate must be a number between 0 and 1', 
        config.samplingRate);
    }
  }
  
  if (config.throttleInterval !== undefined) {
    if (typeof config.throttleInterval !== 'number' || 
        config.throttleInterval < 0) {
      addError('throttleInterval', 
        'Throttle interval must be a positive number', 
        config.throttleInterval);
    }
  }
  
  if (config.maxTrackedComponents !== undefined) {
    if (typeof config.maxTrackedComponents !== 'number' || 
        config.maxTrackedComponents < 1 ||
        !Number.isInteger(config.maxTrackedComponents)) {
      addError('maxTrackedComponents', 
        'Max tracked components must be a positive integer', 
        config.maxTrackedComponents);
    }
  }
  
  if (config.adaptiveQualityLevels !== undefined) {
    if (typeof config.adaptiveQualityLevels !== 'number' || 
        config.adaptiveQualityLevels < 1 ||
        config.adaptiveQualityLevels > 5 ||
        !Number.isInteger(config.adaptiveQualityLevels)) {
      addError('adaptiveQualityLevels', 
        'Adaptive quality levels must be an integer between 1 and 5', 
        config.adaptiveQualityLevels);
    }
  }
  
  // Validate enum fields
  if (config.resourceOptimizationLevel !== undefined) {
    if (!['none', 'conservative', 'aggressive'].includes(config.resourceOptimizationLevel)) {
      addError('resourceOptimizationLevel', 
        'Resource optimization level must be one of: none, conservative, aggressive', 
        config.resourceOptimizationLevel);
    }
  }
  
  // Return validation result
  return errors.length === 0 
    ? success(true) 
    : failure(errors);
}

/**
 * Ensures that a configuration has all required properties with valid values
 */
export function ensureValidConfig<T>(config: Partial<T>, defaultConfig: T): T {
  return { ...defaultConfig, ...config };
}

/**
 * Applies validated changes to a configuration
 */
export function applyValidatedChanges(
  currentConfig: PerfConfig,
  changes: Partial<PerfConfig>
): Result<PerfConfig, ValidationError[]> {
  const validationResult = validatePerfConfig(changes);
  
  if (validationResult.type === 'failure') {
    return validationResult;
  }
  
  return success({
    ...currentConfig,
    ...changes
  });
}

export default {
  validatePerfConfig,
  ensureValidConfig,
  applyValidatedChanges
};
