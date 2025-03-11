
/**
 * Core type definitions
 */

// Primitive type aliases
export type ID = string;
export type ISO8601Date = string;
export type UUID = string;
export type Email = string;
export type URI = string;

// Common type patterns
export type Optional<T> = T | null | undefined;
export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

// Brand types for type safety
export type Brand<K, T> = K & { __brand: T };
export type UserID = Brand<string, 'user-id'>;
export type SessionID = Brand<string, 'session-id'>;

// Common interfaces
export interface BaseEntity {
  id: string;
  createdAt: ISO8601Date;
  updatedAt: ISO8601Date;
}

export interface Timestamped {
  createdAt: ISO8601Date;
  updatedAt: ISO8601Date;
}

