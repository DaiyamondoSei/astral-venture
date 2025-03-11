
/**
 * Entity Utilities
 * 
 * This module provides utility functions for handling entity objects
 * with standardized ID handling.
 * 
 * @category Utils
 * @version 1.0.0
 */

import { Entity, SafeEntity } from '@/types/core';

/**
 * Create a unique ID for an entity
 */
export function createEntityId(): string {
  return `entity-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Normalize an entity to ensure it has an ID
 */
export function normalizeEntity<T>(entity: T): SafeEntity<T> {
  if (!entity) {
    return { id: createEntityId() } as SafeEntity<T>;
  }
  
  if (typeof entity === 'object' && entity !== null) {
    if (!('id' in entity)) {
      return {
        ...entity as object,
        id: createEntityId()
      } as SafeEntity<T>;
    }
    
    // If id exists but is null/undefined, replace it
    const entityWithId = entity as { id?: string | null } & object;
    if (entityWithId.id === null || entityWithId.id === undefined) {
      return {
        ...entityWithId,
        id: createEntityId()
      } as SafeEntity<T>;
    }
  }
  
  return entity as SafeEntity<T>;
}

/**
 * Normalize an array of entities to ensure they all have IDs
 */
export function normalizeEntities<T>(entities: T[]): SafeEntity<T>[] {
  return entities.map(normalizeEntity);
}

/**
 * Find an entity in an array by ID, with type safety
 */
export function findById<T extends Entity>(entities: T[], id: string): T | undefined {
  return entities.find(entity => entity.id === id);
}

/**
 * Create a map of entities by ID
 */
export function mapEntitiesById<T extends Entity>(entities: T[]): Record<string, T> {
  return entities.reduce((acc, entity) => {
    acc[entity.id] = entity;
    return acc;
  }, {} as Record<string, T>);
}

/**
 * Update an entity in an array by ID
 */
export function updateEntityById<T extends Entity>(
  entities: T[],
  id: string,
  updater: (entity: T) => T
): T[] {
  return entities.map(entity => 
    entity.id === id ? updater(entity) : entity
  );
}

/**
 * Remove an entity from an array by ID
 */
export function removeEntityById<T extends Entity>(
  entities: T[],
  id: string
): T[] {
  return entities.filter(entity => entity.id !== id);
}

/**
 * Group entities by a property value
 */
export function groupEntitiesBy<T extends Entity, K extends keyof T>(
  entities: T[],
  key: K
): Record<string, T[]> {
  return entities.reduce((groups, entity) => {
    const value = String(entity[key]);
    groups[value] = groups[value] || [];
    groups[value].push(entity);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Sort entities by a property
 */
export function sortEntitiesBy<T extends Entity, K extends keyof T>(
  entities: T[],
  key: K,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...entities].sort((a, b) => {
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}
