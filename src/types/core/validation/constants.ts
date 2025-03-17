
/**
 * Validation system constants
 * Following the Type-Value Pattern for type safety
 */
import { ValidationErrorCode, ErrorSeverity } from './types';

// Runtime values for ErrorSeverity 
export const ErrorSeverities = {
  ERROR: 'error' as ErrorSeverity,
  WARNING: 'warning' as ErrorSeverity,
  INFO: 'info' as ErrorSeverity
} as const;

// Runtime values for ValidationErrorCode
export const ValidationErrorCodes = {
  REQUIRED: 'REQUIRED' as ValidationErrorCode,
  TYPE_ERROR: 'TYPE_ERROR' as ValidationErrorCode,
  FORMAT_ERROR: 'FORMAT_ERROR' as ValidationErrorCode,
  MIN_LENGTH_ERROR: 'MIN_LENGTH_ERROR' as ValidationErrorCode,
  MAX_LENGTH_ERROR: 'MAX_LENGTH_ERROR' as ValidationErrorCode,
  MIN_VALUE_ERROR: 'MIN_VALUE_ERROR' as ValidationErrorCode, 
  MAX_VALUE_ERROR: 'MAX_VALUE_ERROR' as ValidationErrorCode,
  PATTERN_ERROR: 'PATTERN_ERROR' as ValidationErrorCode,
  CONSTRAINT_ERROR: 'CONSTRAINT_ERROR' as ValidationErrorCode,
  FIELD_REQUIRED: 'FIELD_REQUIRED' as ValidationErrorCode,
  UNKNOWN_ERROR: 'UNKNOWN_ERROR' as ValidationErrorCode,
  VALIDATION_FAILED: 'VALIDATION_FAILED' as ValidationErrorCode,
  SCHEMA_ERROR: 'SCHEMA_ERROR' as ValidationErrorCode,
  NOT_INTEGER: 'NOT_INTEGER' as ValidationErrorCode,
  MIN_ITEMS: 'MIN_ITEMS' as ValidationErrorCode,
  MAX_ITEMS: 'MAX_ITEMS' as ValidationErrorCode,
  MIN_DATE: 'MIN_DATE' as ValidationErrorCode,
  MAX_DATE: 'MAX_DATE' as ValidationErrorCode,
  INVALID_ENUM: 'INVALID_ENUM' as ValidationErrorCode,
  INVALID_FORMAT: 'INVALID_FORMAT' as ValidationErrorCode,
  MISSING_USER_ID: 'MISSING_USER_ID' as ValidationErrorCode,
  MISSING_ACHIEVEMENT_ID: 'MISSING_ACHIEVEMENT_ID' as ValidationErrorCode,
  FETCH_ACHIEVEMENTS_ERROR: 'FETCH_ACHIEVEMENTS_ERROR' as ValidationErrorCode,
  FETCH_USER_ACHIEVEMENTS_ERROR: 'FETCH_USER_ACHIEVEMENTS_ERROR' as ValidationErrorCode,
  UPDATE_ACHIEVEMENT_PROGRESS_ERROR: 'UPDATE_ACHIEVEMENT_PROGRESS_ERROR' as ValidationErrorCode,
  CHECK_ACHIEVEMENT_ERROR: 'CHECK_ACHIEVEMENT_ERROR' as ValidationErrorCode,
  AWARD_ACHIEVEMENT_ERROR: 'AWARD_ACHIEVEMENT_ERROR' as ValidationErrorCode,
  GET_ACHIEVEMENT_PROGRESS_ERROR: 'GET_ACHIEVEMENT_PROGRESS_ERROR' as ValidationErrorCode
} as const;

// Create a config type for performance configuration
export interface PerfConfig {
  // Core settings
  samplingRate: number;
  throttleInterval: number;
  maxTrackedComponents: number;
  
  // Feature flags
  enabled: boolean;
  enableValidation: boolean;
  enableRenderTracking: boolean;
  enablePropTracking: boolean;
  enableDebugLogging: boolean;
  
  // Performance optimization features
  intelligentProfiling: boolean;
  inactiveTabThrottling: boolean;
  batchUpdates: boolean;
  
  // Resource settings
  resourceOptimizationLevel: 'none' | 'conservative' | 'aggressive';
  
  // Data persistence
  metricsPersistence: boolean;
}

// Performance level options
export const PerfOptimizationLevels = {
  NONE: 'none',
  CONSERVATIVE: 'conservative',
  AGGRESSIVE: 'aggressive'
} as const;

// Default performance configurations for different device types
export const DEFAULT_PERF_CONFIGS: Record<'low' | 'medium' | 'high', PerfConfig> = {
  low: {
    samplingRate: 0.1,
    throttleInterval: 1000,
    maxTrackedComponents: 20,
    enabled: true,
    enableValidation: false,
    enableRenderTracking: true,
    enablePropTracking: false,
    enableDebugLogging: false,
    intelligentProfiling: false,
    inactiveTabThrottling: true,
    batchUpdates: true,
    resourceOptimizationLevel: 'aggressive',
    metricsPersistence: false
  },
  medium: {
    samplingRate: 0.3,
    throttleInterval: 500,
    maxTrackedComponents: 50,
    enabled: true,
    enableValidation: true,
    enableRenderTracking: true,
    enablePropTracking: true,
    enableDebugLogging: false,
    intelligentProfiling: true,
    inactiveTabThrottling: true,
    batchUpdates: true,
    resourceOptimizationLevel: 'conservative',
    metricsPersistence: true
  },
  high: {
    samplingRate: 0.5,
    throttleInterval: 200,
    maxTrackedComponents: 100,
    enabled: true,
    enableValidation: true,
    enableRenderTracking: true,
    enablePropTracking: true,
    enableDebugLogging: true,
    intelligentProfiling: true,
    inactiveTabThrottling: false,
    batchUpdates: false,
    resourceOptimizationLevel: 'none',
    metricsPersistence: true
  }
};
