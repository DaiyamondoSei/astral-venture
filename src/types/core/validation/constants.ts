
/**
 * Validation system constants
 * 
 * This module provides runtime constants that correspond to the types in types.ts,
 * following the Type-Value Pattern for TypeScript.
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

// Default performance configurations for different device types
export const DEFAULT_PERF_CONFIGS = {
  low: {
    samplingRate: 0.1,
    throttleInterval: 1000,
    maxTrackedComponents: 20,
    useManualCapability: false,
    deviceCapability: 'low',
    disableAnimations: true,
    disableEffects: true,
    disableBlur: true, 
    disableShadows: true,
    enablePerformanceTracking: true,
    enableRenderTracking: true,
    enableValidation: false,
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
    useManualCapability: false,
    deviceCapability: 'medium',
    disableAnimations: false,
    disableEffects: false,
    disableBlur: true, 
    disableShadows: true,
    enablePerformanceTracking: true,
    enableRenderTracking: true,
    enableValidation: true,
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
    useManualCapability: false,
    deviceCapability: 'high',
    disableAnimations: false,
    disableEffects: false,
    disableBlur: false, 
    disableShadows: false,
    enablePerformanceTracking: true,
    enableRenderTracking: true,
    enableValidation: true,
    enablePropTracking: true,
    enableDebugLogging: true,
    intelligentProfiling: true,
    inactiveTabThrottling: false,
    batchUpdates: false,
    resourceOptimizationLevel: 'none',
    metricsPersistence: true
  }
};
