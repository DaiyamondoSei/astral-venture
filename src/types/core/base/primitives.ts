
/**
 * Core Primitive Types
 * 
 * This module provides foundational primitive types for use across the application.
 */

/**
 * Basic entity interface that all database entities should implement
 */
export interface Entity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Type guard to check if an object has an id property
 */
export function hasId(obj: unknown): obj is { id: string } {
  return typeof obj === 'object' && obj !== null && 'id' in obj && typeof (obj as any).id === 'string';
}

/**
 * Ensures that an entity has a valid ID, throws if not
 */
export function ensureEntityId<T extends { id?: string }>(entity: T): asserts entity is T & { id: string } {
  if (!entity.id || typeof entity.id !== 'string' || entity.id.trim() === '') {
    throw new Error('Entity missing valid ID');
  }
}

/**
 * Represents a point in 2D space
 */
export interface Point2D {
  x: number;
  y: number;
}

/**
 * Represents a point in 3D space
 */
export interface Point3D extends Point2D {
  z: number;
}

/**
 * Represents a size in 2D
 */
export interface Size2D {
  width: number;
  height: number;
}

/**
 * Represents a rectangle in 2D space
 */
export interface Rect extends Point2D, Size2D {}

/**
 * Represents a color in RGB format
 */
export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/**
 * Represents a color in RGBA format
 */
export interface RGBAColor extends RGBColor {
  a: number;
}

/**
 * Represents an HSL color
 */
export interface HSLColor {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

/**
 * Represents an HSLA color
 */
export interface HSLAColor extends HSLColor {
  a: number; // 0-1
}

/**
 * Represents a time duration in milliseconds
 */
export type Duration = number;

/**
 * Represents a percentage (0-100)
 */
export type Percentage = number;

/**
 * Represents a normalized value (0-1)
 */
export type Normalized = number;

/**
 * Utility type to make all properties of T optional and nullable
 */
export type Nullable<T> = { [K in keyof T]: T[K] | null };

/**
 * Utility type to make selected properties of T required
 */
export type RequiredProperties<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Utility type to extract the keys of T whose values are of type U
 */
export type KeysOfType<T, U> = { [K in keyof T]: T[K] extends U ? K : never }[keyof T];

/**
 * Represents a data record with metadata
 */
export interface DataRecord {
  id: string;
  created_at: string;
  updated_at?: string;
  metadata?: Record<string, unknown>;
}
