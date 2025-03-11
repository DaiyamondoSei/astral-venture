
/**
 * Performance Metrics Validation
 * 
 * Runtime validation for performance metrics to ensure type safety.
 */

import { 
  PerformanceMetric,
  WebVitalMetric,
  MetricType,
  WebVitalName,
  WebVitalCategory
} from './types';
import { ValidationError } from '../validation/ValidationError';
import { 
  isString, 
  isNumber, 
  isObject 
} from '../validation/validationUtils';

// Validate MetricType
export function isValidMetricType(type: string): type is MetricType {
  return [
    'render', 
    'interaction', 
    'load', 
    'memory', 
    'network', 
    'resource', 
    'javascript', 
    'css', 
    'animation', 
    'metric', 
    'summary', 
    'performance', 
    'webVital'
  ].includes(type);
}

// Validate WebVitalName
export function isValidWebVitalName(name: string): name is WebVitalName {
  return ['CLS', 'FCP', 'LCP', 'TTFB', 'FID', 'INP'].includes(name);
}

// Validate WebVitalCategory
export function isValidWebVitalCategory(category: string): category is WebVitalCategory {
  return [
    'loading', 
    'interaction', 
    'visual_stability', 
    'responsiveness'
  ].includes(category);
}

// Validate Performance Metric
export function validatePerformanceMetric(metric: unknown): PerformanceMetric {
  if (!isObject(metric)) {
    throw new ValidationError(
      'Invalid performance metric',
      [{ path: '', message: 'Metric must be an object', code: 'TYPE_ERROR' }]
    );
  }

  // Required fields
  if (!isString(metric.metric_name)) {
    throw new ValidationError(
      'Invalid metric_name',
      [{ path: 'metric_name', message: 'Metric name is required and must be a string', code: 'FIELD_ERROR' }]
    );
  }

  if (!isNumber(metric.value)) {
    throw new ValidationError(
      'Invalid metric value',
      [{ path: 'value', message: 'Metric value is required and must be a number', code: 'FIELD_ERROR' }]
    );
  }

  if (!isString(metric.category)) {
    throw new ValidationError(
      'Invalid metric category',
      [{ path: 'category', message: 'Metric category is required and must be a string', code: 'FIELD_ERROR' }]
    );
  }

  if (!metric.type || !isString(metric.type) || !isValidMetricType(metric.type)) {
    throw new ValidationError(
      'Invalid metric type',
      [{ path: 'type', message: `Metric type must be one of: ${[
        'render', 'interaction', 'load', 'memory', 'network', 'resource',
        'javascript', 'css', 'animation', 'metric', 'summary', 'performance', 'webVital'
      ].join(', ')}`, code: 'FIELD_ERROR' }]
    );
  }

  // Validate timestamp is a string or number
  if (
    metric.timestamp !== undefined && 
    typeof metric.timestamp !== 'string' && 
    typeof metric.timestamp !== 'number'
  ) {
    throw new ValidationError(
      'Invalid timestamp',
      [{ path: 'timestamp', message: 'Timestamp must be a string or number', code: 'FIELD_ERROR' }]
    );
  }

  // Return the validated metric
  return metric as PerformanceMetric;
}

// Validate Web Vital
export function validateWebVital(vital: unknown): WebVitalMetric {
  if (!isObject(vital)) {
    throw new ValidationError(
      'Invalid web vital',
      [{ path: '', message: 'Web vital must be an object', code: 'TYPE_ERROR' }]
    );
  }

  // Required fields
  if (!isString(vital.name)) {
    throw new ValidationError(
      'Invalid web vital name',
      [{ path: 'name', message: 'Web vital name is required and must be a string', code: 'FIELD_ERROR' }]
    );
  }

  if (!isNumber(vital.value)) {
    throw new ValidationError(
      'Invalid web vital value',
      [{ path: 'value', message: 'Web vital value is required and must be a number', code: 'FIELD_ERROR' }]
    );
  }

  if (!vital.category || !isString(vital.category) || !isValidWebVitalCategory(vital.category)) {
    throw new ValidationError(
      'Invalid web vital category',
      [{ path: 'category', message: 'Web vital category must be one of: loading, interaction, visual_stability, responsiveness', code: 'FIELD_ERROR' }]
    );
  }

  if (!isNumber(vital.timestamp)) {
    throw new ValidationError(
      'Invalid web vital timestamp',
      [{ path: 'timestamp', message: 'Web vital timestamp is required and must be a number', code: 'FIELD_ERROR' }]
    );
  }

  // Validate rating if present
  if (
    vital.rating !== undefined && 
    vital.rating !== 'good' && 
    vital.rating !== 'needs-improvement' && 
    vital.rating !== 'poor'
  ) {
    throw new ValidationError(
      'Invalid web vital rating',
      [{ path: 'rating', message: 'Web vital rating must be one of: good, needs-improvement, poor', code: 'FIELD_ERROR' }]
    );
  }

  // Return the validated web vital
  return vital as WebVitalMetric;
}

// Complete validation system for performance metrics
export const performanceMetricValidation = {
  validateMetric: validatePerformanceMetric,
  validateWebVital: validateWebVital,
  isValidMetricType,
  isValidWebVitalName,
  isValidWebVitalCategory
};

export default performanceMetricValidation;
