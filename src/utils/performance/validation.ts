
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
  WebVitalCategory,
  isValidMetricType,
  isValidWebVitalName,
  isValidWebVitalCategory
} from './types';
import { ValidationError } from '../validation/ValidationError';
import { 
  isString, 
  isNumber, 
  isObject,
  validateData,
  createSchemaValidator
} from '../validation/validationUtils';
import { ValidationResult, Validator, ValidationErrorCode } from '../validation/types';

/**
 * Validates a performance metric
 */
export function validatePerformanceMetric(metric: unknown): PerformanceMetric {
  if (!isObject(metric)) {
    throw new ValidationError(
      'Invalid performance metric',
      [{ path: '', message: 'Metric must be an object', code: ValidationErrorCode.TYPE_ERROR }]
    );
  }

  // Required fields
  if (!isString(metric.metric_name)) {
    throw new ValidationError(
      'Invalid metric_name',
      [{ path: 'metric_name', message: 'Metric name is required and must be a string', code: ValidationErrorCode.REQUIRED }]
    );
  }

  if (!isNumber(metric.value)) {
    throw new ValidationError(
      'Invalid metric value',
      [{ path: 'value', message: 'Metric value is required and must be a number', code: ValidationErrorCode.TYPE_ERROR }]
    );
  }

  if (!isString(metric.category)) {
    throw new ValidationError(
      'Invalid metric category',
      [{ path: 'category', message: 'Metric category is required and must be a string', code: ValidationErrorCode.REQUIRED }]
    );
  }

  if (!metric.type || !isString(metric.type) || !isValidMetricType(metric.type)) {
    throw new ValidationError(
      'Invalid metric type',
      [{ path: 'type', message: `Metric type must be one of: ${[
        'render', 'interaction', 'load', 'memory', 'network', 'resource',
        'javascript', 'css', 'animation', 'metric', 'summary', 'performance', 'webVital'
      ].join(', ')}`, code: ValidationErrorCode.FORMAT_ERROR }]
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
      [{ path: 'timestamp', message: 'Timestamp must be a string or number', code: ValidationErrorCode.TYPE_ERROR }]
    );
  }

  // Return the validated metric
  return metric as PerformanceMetric;
}

/**
 * Performance metric validator as a Validator function
 */
export const performanceMetricValidator: Validator<PerformanceMetric> = (metric: unknown): ValidationResult<PerformanceMetric> => {
  try {
    const validatedMetric = validatePerformanceMetric(metric);
    return { valid: true, validatedData: validatedMetric };
  } catch (error) {
    if (error instanceof ValidationError) {
      return { valid: false, errors: error.details };
    }
    return { 
      valid: false, 
      error: { path: '', message: error instanceof Error ? error.message : String(error) } 
    };
  }
};

/**
 * Validates a web vital metric
 */
export function validateWebVital(vital: unknown): WebVitalMetric {
  if (!isObject(vital)) {
    throw new ValidationError(
      'Invalid web vital',
      [{ path: '', message: 'Web vital must be an object', code: ValidationErrorCode.TYPE_ERROR }]
    );
  }

  // Required fields
  if (!isString(vital.name)) {
    throw new ValidationError(
      'Invalid web vital name',
      [{ path: 'name', message: 'Web vital name is required and must be a string', code: ValidationErrorCode.REQUIRED }]
    );
  }

  if (!isNumber(vital.value)) {
    throw new ValidationError(
      'Invalid web vital value',
      [{ path: 'value', message: 'Web vital value is required and must be a number', code: ValidationErrorCode.TYPE_ERROR }]
    );
  }

  if (!vital.category || !isString(vital.category) || !isValidWebVitalCategory(vital.category)) {
    throw new ValidationError(
      'Invalid web vital category',
      [{ path: 'category', message: 'Web vital category must be one of: loading, interaction, visual_stability, responsiveness', code: ValidationErrorCode.FORMAT_ERROR }]
    );
  }

  if (!isNumber(vital.timestamp)) {
    throw new ValidationError(
      'Invalid web vital timestamp',
      [{ path: 'timestamp', message: 'Web vital timestamp is required and must be a number', code: ValidationErrorCode.TYPE_ERROR }]
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
      [{ path: 'rating', message: 'Web vital rating must be one of: good, needs-improvement, poor', code: ValidationErrorCode.FORMAT_ERROR }]
    );
  }

  // Return the validated web vital
  return vital as WebVitalMetric;
}

/**
 * Web vital validator as a Validator function
 */
export const webVitalValidator: Validator<WebVitalMetric> = (vital: unknown): ValidationResult<WebVitalMetric> => {
  try {
    const validatedVital = validateWebVital(vital);
    return { valid: true, validatedData: validatedVital };
  } catch (error) {
    if (error instanceof ValidationError) {
      return { valid: false, errors: error.details };
    }
    return { 
      valid: false, 
      error: { path: '', message: error instanceof Error ? error.message : String(error) } 
    };
  }
};

// Schemas for validation
export const performanceMetricSchema = {
  metric_name: createSchemaValidator<string>(value => 
    typeof value === 'string' 
      ? { valid: true, validatedData: value }
      : { valid: false, error: { path: 'metric_name', message: 'Metric name must be a string', code: ValidationErrorCode.TYPE_ERROR } }
  ),
  value: createSchemaValidator<number>(value => 
    typeof value === 'number' && !isNaN(value)
      ? { valid: true, validatedData: value }
      : { valid: false, error: { path: 'value', message: 'Value must be a number', code: ValidationErrorCode.TYPE_ERROR } }
  ),
  category: createSchemaValidator<string>(value => 
    typeof value === 'string'
      ? { valid: true, validatedData: value }
      : { valid: false, error: { path: 'category', message: 'Category must be a string', code: ValidationErrorCode.TYPE_ERROR } }
  ),
  type: createSchemaValidator<MetricType>(value => 
    typeof value === 'string' && isValidMetricType(value)
      ? { valid: true, validatedData: value }
      : { valid: false, error: { path: 'type', message: 'Invalid metric type', code: ValidationErrorCode.FORMAT_ERROR } }
  )
};

/**
 * Complete validation system for performance metrics
 */
export const performanceMetricValidation = {
  validateMetric: validatePerformanceMetric,
  validateWebVital: validateWebVital,
  isValidMetricType,
  isValidWebVitalName,
  isValidWebVitalCategory,
  performanceMetricValidator,
  webVitalValidator
};

export default performanceMetricValidation;
