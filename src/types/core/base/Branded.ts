
/**
 * Branded Types
 * 
 * This module provides utilities for creating branded types, which are nominal types
 * that provide compile-time type safety for values that share the same underlying type
 * but represent different concepts.
 */

/**
 * Base branded type utility
 * Creates a new type that is branded with a unique symbol
 */
export type Brand<K, T> = K & { __brand: T };

/**
 * Common branded types for IDs
 */
export type UserID = Brand<string, 'user-id'>;
export type SessionID = Brand<string, 'session-id'>;
export type EntityID = Brand<string, 'entity-id'>;
export type AchievementID = Brand<string, 'achievement-id'>;
export type ChakraID = Brand<string, 'chakra-id'>;
export type MeditationID = Brand<string, 'meditation-id'>;
export type ReflectionID = Brand<string, 'reflection-id'>;

/**
 * Factory function for creating a validated UserID
 */
export function createUserID(id: string): UserID {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid user ID: must be a non-empty string');
  }
  return id as UserID;
}

/**
 * Factory function for creating a validated SessionID
 */
export function createSessionID(id: string): SessionID {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid session ID: must be a non-empty string');
  }
  return id as SessionID;
}

/**
 * Factory function for creating a validated AchievementID
 */
export function createAchievementID(id: string): AchievementID {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid achievement ID: must be a non-empty string');
  }
  return id as AchievementID;
}

/**
 * Type guard for UserID
 */
export function isUserID(value: unknown): value is UserID {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Type guard for AchievementID
 */
export function isAchievementID(value: unknown): value is AchievementID {
  return typeof value === 'string' && value.length > 0;
}
