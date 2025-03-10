
/**
 * Performance metrics validation utilities
 * Ensures type safety at system boundaries
 */

import { validateObject, validateString, validateNumber } from './runtimeValidation';
import type { ComponentMetrics, WebVitalMetric, DeviceInfo } from '@/types/performance';

/**
 * Validate component metrics
 * 
 * @param data Unknown data to validate
 * @param fieldName Field name for error messages
 * @returns Validated ComponentMetrics
 */
export function validateComponentMetrics(
  data: unknown,
  fieldName: string = 'componentMetrics'
): ComponentMetrics {
  const metrics = validateObject<ComponentMetrics>(data, fieldName);
  
  // Validate required fields
  validateString(metrics.componentName, `${fieldName}.componentName`);
  validateNumber(metrics.renderCount, `${fieldName}.renderCount`);
  validateNumber(metrics.totalRenderTime, `${fieldName}.totalRenderTime`);
  validateNumber(metrics.averageRenderTime, `${fieldName}.averageRenderTime`);
  validateNumber(metrics.lastRenderTime, `${fieldName}.lastRenderTime`);
  validateNumber(metrics.slowRenderCount, `${fieldName}.slowRenderCount`);
  
  // Optional fields
  if (metrics.firstRenderTime !== undefined) {
    validateNumber(metrics.firstRenderTime, `${fieldName}.firstRenderTime`);
  }
  
  return metrics;
}

/**
 * Validate web vital metric
 * 
 * @param data Unknown data to validate
 * @param fieldName Field name for error messages
 * @returns Validated WebVitalMetric
 */
export function validateWebVitalMetric(
  data: unknown,
  fieldName: string = 'webVitalMetric'
): WebVitalMetric {
  const metric = validateObject<WebVitalMetric>(data, fieldName);
  
  // Validate required fields
  validateString(metric.name, `${fieldName}.name`);
  validateNumber(metric.value, `${fieldName}.value`);
  validateString(metric.category, `${fieldName}.category`);
  validateNumber(metric.timestamp, `${fieldName}.timestamp`);
  
  return metric;
}

/**
 * Validate device info
 * 
 * @param data Unknown data to validate
 * @param fieldName Field name for error messages
 * @returns Validated DeviceInfo
 */
export function validateDeviceInfo(
  data: unknown,
  fieldName: string = 'deviceInfo'
): DeviceInfo {
  const deviceInfo = validateObject<DeviceInfo>(data, fieldName);
  
  // Validate required fields
  validateString(deviceInfo.userAgent, `${fieldName}.userAgent`);
  validateString(deviceInfo.deviceCategory, `${fieldName}.deviceCategory`);
  
  // Optional fields
  if (deviceInfo.deviceMemory !== undefined) {
    validateNumber(deviceInfo.deviceMemory, `${fieldName}.deviceMemory`);
  }
  
  if (deviceInfo.hardwareConcurrency !== undefined) {
    validateNumber(deviceInfo.hardwareConcurrency, `${fieldName}.hardwareConcurrency`);
  }
  
  if (deviceInfo.connectionType !== undefined) {
    validateString(deviceInfo.connectionType, `${fieldName}.connectionType`);
  }
  
  // Validate nested objects
  if (deviceInfo.viewport) {
    validateNumber(deviceInfo.viewport.width, `${fieldName}.viewport.width`);
    validateNumber(deviceInfo.viewport.height, `${fieldName}.viewport.height`);
  }
  
  if (deviceInfo.screenSize) {
    validateNumber(deviceInfo.screenSize.width, `${fieldName}.screenSize.width`);
    validateNumber(deviceInfo.screenSize.height, `${fieldName}.screenSize.height`);
  }
  
  if (deviceInfo.pixelRatio !== undefined) {
    validateNumber(deviceInfo.pixelRatio, `${fieldName}.pixelRatio`);
  }
  
  return deviceInfo;
}

export default {
  validateComponentMetrics,
  validateWebVitalMetric,
  validateDeviceInfo
};
