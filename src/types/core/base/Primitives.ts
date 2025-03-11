
/**
 * Core Primitive Types
 * 
 * This module provides enhanced primitive type definitions for improved type safety and semantic meaning.
 * These types serve as the foundation for more complex type structures throughout the application.
 */

// -------------------------------------------------------------------------
// String type aliases for common formats with semantic meaning
// -------------------------------------------------------------------------

/**
 * Identifier types
 */
export type ID = string;
export type UUID = string;
export type Email = string;
export type URI = string;
export type ISO8601Date = string;
export type JSONString = string;

/**
 * Numeric type aliases with semantic meaning
 */
export type Percentage = number; // 0-100
export type Rating = number; // typically 1-5
export type Score = number; // numerical score
export type Timestamp = number; // Unix timestamp
export type EnergyPoints = number; // Energy points in the system

/**
 * Common result type patterns
 */
export type Optional<T> = T | null | undefined;

/**
 * Represents a successful result or an error
 */
export type Result<T, E = Error> = 
  | { success: true; data: T } 
  | { success: false; error: E };

/**
 * Promise wrapper for Result type
 */
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

/**
 * Represents a loading state with data
 */
export type AsyncData<T, E = Error> = 
  | { status: 'idle' } 
  | { status: 'loading' } 
  | { status: 'success'; data: T }
  | { status: 'error'; error: E };

/**
 * Makes all properties in T nullable
 */
export type Nullable<T> = { [K in keyof T]: T[K] | null };

/**
 * Deeply applies Partial to nested objects
 */
export type DeepPartial<T> = T extends object 
  ? { [P in keyof T]?: DeepPartial<T[P]> } 
  : T;

/**
 * Creates a type requiring at least one of the properties in K
 */
export type RequireAtLeastOne<T, K extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, K>> & 
  { [P in K]-?: Required<Pick<T, P>> & Partial<Pick<T, Exclude<K, P>>> }[K];

/**
 * Enforces non-empty arrays
 */
export type NonEmptyArray<T> = [T, ...T[]];
