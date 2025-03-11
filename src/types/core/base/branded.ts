
/**
 * Core Branded Types
 * 
 * This module provides utilities for creating and working with branded types.
 * Branded types help ensure type safety by adding a unique brand property.
 * 
 * @category Core
 * @version 1.0.0
 */

/**
 * Create a branded type by adding a readonly __brand property
 * This provides type safety while using primitive types
 */
export type Brand<K, T> = K & { readonly __brand: T };

/**
 * Creates a branded type with validation
 * 
 * @param value The value to brand
 * @param validator A function that validates the value
 * @param brandName The name of the brand for error messages
 * @returns The branded value
 * @throws Error if validation fails
 */
export function createBrandedType<K, T>(
  value: K,
  validator: (value: K) => boolean,
  brandName: string
): Brand<K, T> {
  if (!validator(value)) {
    throw new Error(`Invalid ${brandName}: ${value}`);
  }
  return value as Brand<K, T>;
}

/**
 * Creates a UUID branded type
 */
export function createUUID(id: string): UUID {
  return createBrandedType<string, 'uuid'>(
    id,
    (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value),
    'UUID'
  );
}

/**
 * Creates a Timestamp branded type
 */
export function createTimestamp(timestamp: number): Timestamp {
  return createBrandedType<number, 'timestamp'>(
    timestamp,
    (value) => Number.isFinite(value) && value > 0,
    'Timestamp'
  );
}

/**
 * Creates an EnergyPoints branded type
 */
export function createEnergyPoints(points: number): EnergyPoints {
  return createBrandedType<number, 'energy-points'>(
    points,
    (value) => Number.isFinite(value) && value >= 0,
    'EnergyPoints'
  );
}

/**
 * Creates a DateString branded type
 */
export function createDateString(date: string): DateString {
  return createBrandedType<string, 'date-string'>(
    date,
    (value) => /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?)?$/.test(value),
    'DateString'
  );
}

/**
 * Type predicate for checking if a value is a UUID
 */
export function isUUID(value: unknown): value is UUID {
  if (typeof value !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

/**
 * Type predicate for checking if a value is a Timestamp
 */
export function isTimestamp(value: unknown): value is Timestamp {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

/**
 * Type predicate for checking if a value is EnergyPoints
 */
export function isEnergyPoints(value: unknown): value is EnergyPoints {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

/**
 * Type predicate for checking if a value is a DateString
 */
export function isDateString(value: unknown): value is DateString {
  if (typeof value !== 'string') return false;
  return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?)?$/.test(value);
}
