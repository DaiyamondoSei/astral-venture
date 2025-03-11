
/**
 * Type guards for runtime type checking
 */

import { ID, Email, URI, ISO8601Date } from './base';

// Basic type guards
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray<T>(itemGuard?: (item: unknown) => item is T) {
  return (value: unknown): value is T[] => {
    if (!Array.isArray(value)) return false;
    if (!itemGuard) return true;
    return value.every(item => itemGuard(item));
  };
}

// String type guards
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isEmail(value: unknown): value is Email {
  if (!isString(value)) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

export function isURI(value: unknown): value is URI {
  if (!isString(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function isISO8601Date(value: unknown): value is ISO8601Date {
  if (!isString(value)) return false;
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
  return iso8601Regex.test(value);
}

// Number type guards
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

export function isInteger(value: unknown): value is number {
  return isNumber(value) && Number.isInteger(value);
}

export function isPositive(value: unknown): value is number {
  return isNumber(value) && value > 0;
}

