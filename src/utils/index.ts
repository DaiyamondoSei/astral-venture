
/**
 * Central utilities export file
 * 
 * This file provides a convenient way to import all utility functions.
 */

// Result pattern exports
export * from './result/Result';
export * from './result/AsyncResult';

// Performance monitoring exports
export { default as perfMetricsService, perfMetricsServiceAsync } from './performance/perfMetricsService';
export * from './performance/types';
export { default as performanceMonitor } from './performance/performanceMonitor';

// Validation utilities
export * from './validation/inputValidator';

// Create a convenience function for type guarding
export function assertNonNull<T>(value: T | null | undefined, message: string = 'Value is null or undefined'): T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
  return value;
}

// Type guard for narrowing types
export function isOfType<T>(value: any, propertyName: keyof T): value is T {
  return value && typeof value === 'object' && propertyName in value;
}

// Safe parsing functions
export function safeParseInt(value: string | null | undefined, fallback: number = 0): number {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

export function safeParseFloat(value: string | null | undefined, fallback: number = 0): number {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  
  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
}

export function safeParseJSON<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;
  
  try {
    return JSON.parse(json) as T;
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return fallback;
  }
}
