
/**
 * Type Utilities
 * 
 * This module provides utility functions for handling common type issues.
 * 
 * @category Utils
 * @version 1.0.0
 */

import { Entity, SafeEntity } from '@/types/core';

/**
 * Safely access a property that might not exist on an object
 * Prevents "Property 'x' does not exist on type 'never'" errors
 */
export function safeGet<T, K extends keyof any>(obj: T, key: K): any {
  if (!obj) return undefined;
  if (typeof obj !== 'object') return undefined;
  
  return (obj as any)[key];
}

/**
 * Safely access an id property that might not exist
 * Prevents "Property 'id' does not exist on type 'never'" errors
 */
export function safeGetId(obj: unknown): string | undefined {
  return safeGet(obj, 'id');
}

/**
 * Get a guaranteed ID from any object, using a fallback if not present
 */
export function getEntityId(obj: unknown, fallback: string = 'unknown-id'): string {
  const id = safeGetId(obj);
  return id !== undefined ? id : fallback;
}

/**
 * Ensure an object has an id property
 * Useful for preventing "Property 'id' does not exist on type 'never'" errors
 */
export function ensureId<T>(obj: T): SafeEntity<T> {
  if (!obj) {
    return { id: 'unknown-id' } as SafeEntity<T>;
  }
  
  if (typeof obj === 'object' && obj !== null && !('id' in obj)) {
    return { ...obj as object, id: 'unknown-id' } as SafeEntity<T>;
  }
  
  return obj as SafeEntity<T>;
}

/**
 * Cast an array of unknown items to entities with IDs
 */
export function ensureEntityArray<T>(items: T[]): SafeEntity<T>[] {
  return items.map(item => ensureId(item));
}

/**
 * Type guard to check if value has a specific property
 */
export function hasProperty<K extends string>(
  obj: unknown, 
  property: K
): obj is { [key in K]: unknown } {
  return typeof obj === 'object' && 
    obj !== null && 
    property in obj;
}

/**
 * Find an entity by ID with proper type safety
 */
export function findEntityById<T extends Entity>(
  entities: T[], 
  id: string
): T | undefined {
  return entities.find(entity => entity.id === id);
}

/**
 * Safe array accessor that prevents "undefined is not an object" errors
 */
export function safeArray<T>(arr: T[] | null | undefined): T[] {
  return arr || [];
}

/**
 * Safe object accessor that prevents "undefined is not an object" errors
 */
export function safeObject<T extends object>(obj: T | null | undefined): Partial<T> {
  return obj || {};
}
