
/**
 * Runtime validation utilities for cross-environment data validation
 * Ensures type safety when exchanging data between frontend and backend
 */

import { ValidationError } from './ValidationError';
import type { 
  ComponentMetrics, 
  WebVitalMetric, 
  DeviceInfo
} from '@/types/performance';

/**
 * Validate that a value is defined (not undefined or null)
 */
export function validateDefined<T>(value: T | undefined | null, fieldName: string): T {
  if (value === undefined || value === null) {
    throw new ValidationError(`${fieldName} is required`, { field: fieldName, rule: 'required' });
  }
  return value;
}

/**
 * Validate that a value is a string
 */
export function validateString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new ValidationError(
      `${fieldName} must be a string, got ${typeof value}`,
      { field: fieldName, expectedType: 'string' }
    );
  }
  return value;
}

/**
 * Validate that a value is a number
 */
export function validateNumber(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError(
      `${fieldName} must be a number, got ${typeof value}`,
      { field: fieldName, expectedType: 'number' }
    );
  }
  return value;
}

/**
 * Validate that a value is a boolean
 */
export function validateBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== 'boolean') {
    throw new ValidationError(
      `${fieldName} must be a boolean, got ${typeof value}`,
      { field: fieldName, expectedType: 'boolean' }
    );
  }
  return value;
}

/**
 * Validate that a value is an array
 */
export function validateArray<T>(
  value: unknown, 
  fieldName: string, 
  itemValidator?: (item: unknown, index: number) => T
): T[] {
  if (!Array.isArray(value)) {
    throw new ValidationError(
      `${fieldName} must be an array, got ${typeof value}`,
      { field: fieldName, expectedType: 'array' }
    );
  }
  
  if (itemValidator) {
    return value.map((item, index) => {
      try {
        return itemValidator(item, index);
      } catch (error) {
        if (error instanceof ValidationError) {
          throw new ValidationError(
            `${fieldName}[${index}]: ${error.message}`,
            { 
              field: `${fieldName}[${index}]`,
              expectedType: error.expectedType,
              rule: error.rule,
              details: error.details
            }
          );
        }
        throw error;
      }
    });
  }
  
  return value as T[];
}

/**
 * Validate that a value is an object
 */
export function validateObject<T extends object>(
  value: unknown, 
  fieldName: string
): T {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ValidationError(
      `${fieldName} must be an object, got ${value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value}`,
      { field: fieldName, expectedType: 'object' }
    );
  }
  return value as T;
}

/**
 * Validate that a value matches one of the allowed values
 */
export function validateOneOf<T>(
  value: unknown, 
  allowedValues: readonly T[], 
  fieldName: string
): T {
  if (!allowedValues.includes(value as T)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`,
      { field: fieldName, rule: 'oneOf' }
    );
  }
  return value as T;
}

/**
 * Validate component metrics shape
 */
export function validateComponentMetrics(data: unknown): ComponentMetrics {
  const obj = validateObject<Record<string, unknown>>(data, 'componentMetrics');
  
  return {
    componentName: validateString(obj.componentName, 'componentMetrics.componentName'),
    renderCount: validateNumber(obj.renderCount, 'componentMetrics.renderCount'),
    totalRenderTime: validateNumber(obj.totalRenderTime, 'componentMetrics.totalRenderTime'),
    averageRenderTime: validateNumber(obj.averageRenderTime, 'componentMetrics.averageRenderTime'),
    lastRenderTime: validateNumber(obj.lastRenderTime, 'componentMetrics.lastRenderTime'),
    slowRenderCount: validateNumber(obj.slowRenderCount, 'componentMetrics.slowRenderCount'),
    firstRenderTime: obj.firstRenderTime !== undefined 
      ? validateNumber(obj.firstRenderTime, 'componentMetrics.firstRenderTime') 
      : undefined
  };
}

/**
 * Validate web vital metric shape
 */
export function validateWebVitalMetric(data: unknown): WebVitalMetric {
  const obj = validateObject<Record<string, unknown>>(data, 'webVitalMetric');
  
  return {
    name: validateString(obj.name, 'webVitalMetric.name'),
    value: validateNumber(obj.value, 'webVitalMetric.value'),
    category: validateOneOf(
      obj.category, 
      ['loading', 'interaction', 'visual_stability'] as const,
      'webVitalMetric.category'
    ),
    timestamp: validateNumber(obj.timestamp, 'webVitalMetric.timestamp')
  };
}

/**
 * Validate device info shape
 */
export function validateDeviceInfo(data: unknown): DeviceInfo {
  const obj = validateObject<Record<string, unknown>>(data, 'deviceInfo');
  
  const deviceInfo: DeviceInfo = {
    userAgent: validateString(obj.userAgent, 'deviceInfo.userAgent'),
    deviceCategory: validateOneOf(
      obj.deviceCategory, 
      ['low', 'medium', 'high'] as const,
      'deviceInfo.deviceCategory'
    )
  };
  
  // Optional fields
  if (obj.deviceMemory !== undefined) {
    deviceInfo.deviceMemory = validateNumber(obj.deviceMemory, 'deviceInfo.deviceMemory');
  }
  
  if (obj.hardwareConcurrency !== undefined) {
    deviceInfo.hardwareConcurrency = validateNumber(obj.hardwareConcurrency, 'deviceInfo.hardwareConcurrency');
  }
  
  if (obj.connectionType !== undefined) {
    deviceInfo.connectionType = validateString(obj.connectionType, 'deviceInfo.connectionType');
  }
  
  if (obj.viewport !== undefined) {
    const viewport = validateObject(obj.viewport, 'deviceInfo.viewport');
    deviceInfo.viewport = {
      width: validateNumber(viewport.width, 'deviceInfo.viewport.width'),
      height: validateNumber(viewport.height, 'deviceInfo.viewport.height')
    };
  }
  
  if (obj.screenSize !== undefined) {
    const screenSize = validateObject(obj.screenSize, 'deviceInfo.screenSize');
    deviceInfo.screenSize = {
      width: validateNumber(screenSize.width, 'deviceInfo.screenSize.width'),
      height: validateNumber(screenSize.height, 'deviceInfo.screenSize.height')
    };
  }
  
  if (obj.pixelRatio !== undefined) {
    deviceInfo.pixelRatio = validateNumber(obj.pixelRatio, 'deviceInfo.pixelRatio');
  }
  
  return deviceInfo;
}
