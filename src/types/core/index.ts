
/**
 * Core Type System
 * 
 * This barrel file exports all core type definitions and guards
 * to provide a unified import interface for the type system.
 */

// Export all types from base
export * from './base';

// Export all guards
export * from './guards';

// Re-export commonly used validation types
export { ValidationResult, ValidationErrorDetail } from '../validation/types';

// Type utility functions for creating more complex types
export function createTypedRecord<K extends string, V>(
  keys: readonly K[],
  valueCreator: (key: K) => V
): Record<K, V> {
  return keys.reduce((acc, key) => {
    acc[key] = valueCreator(key);
    return acc;
  }, {} as Record<K, V>);
}
