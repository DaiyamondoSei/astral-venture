
/**
 * Performance Configuration Validation Schemas
 * 
 * Validation schemas for performance configuration objects.
 */
import { ValidationResult, ValidationError } from '../ValidationResult';
import { DeviceCapability } from '../../performance/core/types';

// Types for validation
export interface PerfConfigValidationSchema {
  deviceCapability?: DeviceCapability;
  samplingRate?: number;
  throttleInterval?: number;
  maxTrackedComponents?: number;
  adaptiveQualityLevels?: number;
  optimizationLevel?: 'auto' | 'low' | 'medium' | 'high';
}

/**
 * Validate deviceCapability field
 */
export function validateDeviceCapability(value: unknown): ValidationResult {
  if (value === undefined) {
    return { valid: true };
  }
  
  if (typeof value !== 'string') {
    return {
      valid: false,
      errors: [{
        code: 'invalid_type',
        message: 'deviceCapability must be a string',
        path: ['deviceCapability']
      }]
    };
  }
  
  const validValues: DeviceCapability[] = ['low', 'medium', 'high'];
  if (!validValues.includes(value as DeviceCapability)) {
    return {
      valid: false,
      errors: [{
        code: 'invalid_enum_value',
        message: `deviceCapability must be one of: ${validValues.join(', ')}`,
        path: ['deviceCapability'],
        expected: validValues
      }]
    };
  }
  
  return { valid: true };
}

/**
 * Validate samplingRate field
 */
export function validateSamplingRate(value: unknown): ValidationResult {
  if (value === undefined) {
    return { valid: true };
  }
  
  if (typeof value !== 'number') {
    return {
      valid: false,
      errors: [{
        code: 'invalid_type',
        message: 'samplingRate must be a number',
        path: ['samplingRate']
      }]
    };
  }
  
  if (value < 0 || value > 1) {
    return {
      valid: false,
      errors: [{
        code: 'invalid_range',
        message: 'samplingRate must be between 0 and 1',
        path: ['samplingRate'],
        minimum: 0,
        maximum: 1
      }]
    };
  }
  
  return { valid: true };
}

/**
 * Validate adaptiveQualityLevels field
 */
export function validateAdaptiveQualityLevels(value: unknown): ValidationResult {
  if (value === undefined) {
    return { valid: true };
  }
  
  if (typeof value !== 'number') {
    return {
      valid: false,
      errors: [{
        code: 'invalid_type',
        message: 'adaptiveQualityLevels must be a number',
        path: ['adaptiveQualityLevels']
      }]
    };
  }
  
  if (value < 1 || value > 5 || !Number.isInteger(value)) {
    return {
      valid: false,
      errors: [{
        code: 'invalid_range',
        message: 'adaptiveQualityLevels must be an integer between 1 and 5',
        path: ['adaptiveQualityLevels'],
        minimum: 1,
        maximum: 5
      }]
    };
  }
  
  return { valid: true };
}

/**
 * Validate optimizationLevel field
 */
export function validateOptimizationLevel(value: unknown): ValidationResult {
  if (value === undefined) {
    return { valid: true };
  }
  
  if (typeof value !== 'string') {
    return {
      valid: false,
      errors: [{
        code: 'invalid_type',
        message: 'optimizationLevel must be a string',
        path: ['optimizationLevel']
      }]
    };
  }
  
  const validValues = ['auto', 'low', 'medium', 'high'];
  if (!validValues.includes(value as string)) {
    return {
      valid: false,
      errors: [{
        code: 'invalid_enum_value',
        message: `optimizationLevel must be one of: ${validValues.join(', ')}`,
        path: ['optimizationLevel'],
        expected: validValues
      }]
    };
  }
  
  return { valid: true };
}

/**
 * Validate complete performance configuration
 */
export function validatePerfConfig(config: unknown): ValidationResult {
  if (typeof config !== 'object' || config === null) {
    return {
      valid: false,
      errors: [{
        code: 'invalid_type',
        message: 'Performance configuration must be an object',
        path: []
      }]
    };
  }
  
  const errors: ValidationError[] = [];
  const typedConfig = config as Record<string, unknown>;
  
  // Validate each field
  const deviceCapabilityResult = validateDeviceCapability(typedConfig.deviceCapability);
  if (!deviceCapabilityResult.valid && deviceCapabilityResult.errors) {
    errors.push(...deviceCapabilityResult.errors);
  }
  
  const samplingRateResult = validateSamplingRate(typedConfig.samplingRate);
  if (!samplingRateResult.valid && samplingRateResult.errors) {
    errors.push(...samplingRateResult.errors);
  }
  
  const adaptiveQualityLevelsResult = validateAdaptiveQualityLevels(typedConfig.adaptiveQualityLevels);
  if (!adaptiveQualityLevelsResult.valid && adaptiveQualityLevelsResult.errors) {
    errors.push(...adaptiveQualityLevelsResult.errors);
  }
  
  const optimizationLevelResult = validateOptimizationLevel(typedConfig.optimizationLevel);
  if (!optimizationLevelResult.valid && optimizationLevelResult.errors) {
    errors.push(...optimizationLevelResult.errors);
  }
  
  // Return validation result
  if (errors.length > 0) {
    return {
      valid: false,
      errors
    };
  }
  
  return { valid: true };
}
