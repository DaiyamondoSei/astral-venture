
/**
 * Validation Constants
 * 
 * Runtime constants for the validation system following the Type-Value Pattern
 */

import { ValidationErrorCode, ValidationSeverity } from './types';
import { MetricType, WebVitalCategory, WebVitalName } from '../performance/types';

// Validation error codes
export const ValidationErrorCodes = {
  REQUIRED: 'REQUIRED' as ValidationErrorCode,
  TYPE_ERROR: 'TYPE_ERROR' as ValidationErrorCode,
  FORMAT_ERROR: 'FORMAT_ERROR' as ValidationErrorCode,
  VALIDATION_FAILED: 'VALIDATION_FAILED' as ValidationErrorCode,
  UNKNOWN_ERROR: 'UNKNOWN_ERROR' as ValidationErrorCode,
  RANGE_ERROR: 'RANGE_ERROR' as ValidationErrorCode,
  SCHEMA_ERROR: 'SCHEMA_ERROR' as ValidationErrorCode
} as const;

// Validation error severities
export const ErrorSeverities = {
  ERROR: 'error' as ValidationSeverity,
  WARNING: 'warning' as ValidationSeverity,
  INFO: 'info' as ValidationSeverity
} as const;

// Default validation options
export const DEFAULT_VALIDATION_OPTIONS = {
  abortEarly: true,
  strict: false
} as const;

// Metric type constants
export const MetricTypes = {
  RENDER: 'render' as MetricType,
  INTERACTION: 'interaction' as MetricType,
  NETWORK: 'network' as MetricType,
  RESOURCE: 'resource' as MetricType,
  MEMORY: 'memory' as MetricType,
  CUSTOM: 'custom' as MetricType
} as const;

// Web vital category constants
export const WebVitalCategories = {
  LOADING: 'loading' as WebVitalCategory,
  INTERACTION: 'interaction' as WebVitalCategory,
  VISUAL_STABILITY: 'visual_stability' as WebVitalCategory
} as const;

// Web vital name constants
export const WebVitalNames = {
  CLS: 'CLS' as WebVitalName,
  FID: 'FID' as WebVitalName,
  LCP: 'LCP' as WebVitalName,
  FCP: 'FCP' as WebVitalName,
  TTFB: 'TTFB' as WebVitalName,
  INP: 'INP' as WebVitalName
} as const;
