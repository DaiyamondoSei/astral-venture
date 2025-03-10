
import { ValidationError } from './errorBridge';

type Validator<T> = (value: unknown) => value is T;

export function validatePayload<T>(
  data: unknown, 
  validator: Validator<T>,
  errorContext: string
): T {
  if (!validator(data)) {
    throw new ValidationError(
      `Invalid ${errorContext} payload`, 
      'validation',
      { 
        details: 'The provided data does not match the expected format',
        field: errorContext
      }
    );
  }
  return data;
}

export function isPerformancePayload(data: unknown): data is import('../shared/performance').PerformancePayload {
  if (!data || typeof data !== 'object') return false;
  
  const payload = data as Partial<import('../shared/performance').PerformancePayload>;
  
  return Boolean(
    payload.sessionId &&
    payload.userId &&
    payload.deviceInfo &&
    Array.isArray(payload.metrics) &&
    Array.isArray(payload.webVitals) &&
    typeof payload.timestamp === 'number'
  );
}

export function isDeviceInfo(data: unknown): data is import('../shared/performance').DeviceInfo {
  if (!data || typeof data !== 'object') return false;
  
  const info = data as Partial<import('../shared/performance').DeviceInfo>;
  
  return Boolean(
    info.userAgent &&
    info.deviceCategory &&
    ['low', 'medium', 'high'].includes(info.deviceCategory)
  );
}
