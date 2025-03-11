
/**
 * Type branding utilities for type-safe primitives
 */

import { ValidationError } from '../validation/errors';

export function createBrandedType<K, T>(
  value: K,
  validator: (val: K) => boolean,
  brandName: string
): K & { __brand: T } {
  if (!validator(value)) {
    throw new ValidationError(`Invalid ${brandName} value: ${value}`);
  }
  return value as K & { __brand: T };
}

export function createUUID(value: string): UUID {
  return createBrandedType(
    value,
    (v) => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v),
    'UUID'
  );
}

export function createTimestamp(value: number): Timestamp {
  return createBrandedType(
    value,
    (v) => Number.isInteger(v) && v > 0,
    'Timestamp'
  );
}

export function createEnergyPoints(value: number): EnergyPoints {
  return createBrandedType(
    value,
    (v) => Number.isFinite(v) && v >= 0,
    'EnergyPoints'
  );
}
