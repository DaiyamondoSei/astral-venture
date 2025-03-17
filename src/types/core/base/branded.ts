
/**
 * Branded Types
 * 
 * This module provides type-safe identifiers using branded types.
 * A branded type is a primitive type with an added phantom property
 * that makes it distinct from the underlying primitive type at compile time.
 */

/**
 * Creates a branded type using a phantom property
 */
export type Brand<K, T> = K & { readonly __brand: T };

// Basic branded types
/** UUID branded type for type-safe identifiers */
export type UUID = Brand<string, 'UUID'>;

/** Timestamp branded type for type-safe timestamps */
export type Timestamp = Brand<number, 'Timestamp'>;

/** Energy points branded type for type-safe energy values */
export type EnergyPoints = Brand<number, 'EnergyPoints'>;

/** Date string branded type for type-safe date strings */
export type DateString = Brand<string, 'DateString'>;

/**
 * Checks if a value is a valid UUID
 */
export function isUUID(value: unknown): value is UUID {
  if (typeof value !== 'string') return false;
  
  // UUID v4 format regex
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidPattern.test(value);
}

/**
 * Checks if a value is a valid timestamp
 */
export function isTimestamp(value: unknown): value is Timestamp {
  return typeof value === 'number' && !isNaN(value) && isFinite(value) && value > 0;
}

/**
 * Checks if a value is valid energy points
 */
export function isEnergyPoints(value: unknown): value is EnergyPoints {
  return typeof value === 'number' && !isNaN(value) && isFinite(value) && value >= 0;
}

/**
 * Checks if a value is a valid date string
 */
export function isDateString(value: unknown): value is DateString {
  if (typeof value !== 'string') return false;
  
  // ISO date format or YYYY-MM-DD
  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * Creates a UUID from a string (with validation)
 */
export function asUUID(value: string): UUID {
  if (!isUUID(value)) {
    throw new Error(`Invalid UUID: ${value}`);
  }
  return value as UUID;
}

/**
 * Creates a Timestamp from a number (with validation)
 */
export function asTimestamp(value: number): Timestamp {
  if (!isTimestamp(value)) {
    throw new Error(`Invalid Timestamp: ${value}`);
  }
  return value as Timestamp;
}

/**
 * Creates EnergyPoints from a number (with validation)
 */
export function asEnergyPoints(value: number): EnergyPoints {
  if (!isEnergyPoints(value)) {
    throw new Error(`Invalid EnergyPoints: ${value}`);
  }
  return value as EnergyPoints;
}

/**
 * Creates a DateString from a string (with validation)
 */
export function asDateString(value: string): DateString {
  if (!isDateString(value)) {
    throw new Error(`Invalid DateString: ${value}`);
  }
  return value as DateString;
}

/**
 * Creates a UUID safely, returning null on invalid input
 */
export function safeCreateUUID(value: string): UUID | null {
  return isUUID(value) ? value as UUID : null;
}

/**
 * Creates a Timestamp safely, returning null on invalid input
 */
export function safeCreateTimestamp(value: number): Timestamp | null {
  return isTimestamp(value) ? value as Timestamp : null;
}

/**
 * Creates EnergyPoints safely, returning null on invalid input
 */
export function safeCreateEnergyPoints(value: number): EnergyPoints | null {
  return isEnergyPoints(value) ? value as EnergyPoints : null;
}

/**
 * Creates a DateString safely, returning null on invalid input
 */
export function safeCreateDateString(value: string): DateString | null {
  return isDateString(value) ? value as DateString : null;
}
