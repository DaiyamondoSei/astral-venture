
/**
 * Core Type Definitions
 * 
 * This module provides fundamental type definitions used across the application.
 * It establishes the foundation for type safety with primitive type aliases,
 * common utility types, and branded types for type-safe identifiers.
 */

// -------------------------------------------------------------------------
// Primitive type aliases for better semantics
// -------------------------------------------------------------------------

/**
 * String type aliases for common formats
 */
export type ID = string;
export type UUID = string;
export type Email = string;
export type URI = string;
export type ISO8601Date = string;
export type JSONString = string;

/**
 * Numeric type aliases
 */
export type Percentage = number; // 0-100
export type Rating = number; // typically 1-5
export type Score = number; // numerical score
export type Timestamp = number; // Unix timestamp

// -------------------------------------------------------------------------
// Common utility types
// -------------------------------------------------------------------------

/**
 * Represents a value that may be null or undefined
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
 * Creates a type requiring exactly one of the properties in K
 */
export type RequireExactlyOne<T, K extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, K>> & 
  { [P in K]-?: Required<Pick<T, P>> & { [Q in Exclude<K, P>]?: never } }[K];

/**
 * Enforces non-empty arrays
 */
export type NonEmptyArray<T> = [T, ...T[]];

// -------------------------------------------------------------------------
// Brand types for compile-time type safety
// -------------------------------------------------------------------------

/**
 * Base branded type utility
 */
export type Brand<K, T> = K & { __brand: T };

/**
 * Common branded types for IDs
 */
export type UserID = Brand<UUID, 'user-id'>;
export type SessionID = Brand<UUID, 'session-id'>;
export type EntityID = Brand<UUID, 'entity-id'>;
export type ComponentID = Brand<string, 'component-id'>;
export type AchievementID = Brand<string, 'achievement-id'>;

/**
 * Factory functions for brand types with validation
 */

/**
 * Creates a validated UserID
 */
export function createUserID(id: string): UserID {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid user ID: must be a non-empty string');
  }
  
  // Add additional validation if needed
  
  return id as UserID;
}

/**
 * Creates a validated SessionID
 */
export function createSessionID(id: string): SessionID {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid session ID: must be a non-empty string');
  }
  
  // Add additional validation if needed
  
  return id as SessionID;
}

/**
 * Creates a validated EntityID
 */
export function createEntityID(id: string): EntityID {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid entity ID: must be a non-empty string');
  }
  
  // Add additional validation if needed
  
  return id as EntityID;
}
