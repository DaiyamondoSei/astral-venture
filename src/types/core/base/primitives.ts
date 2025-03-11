
/**
 * Core Primitive Types
 * 
 * This module provides base primitive types used throughout the application.
 * These are the foundation of our type system.
 * 
 * @category Core
 * @version 1.0.0
 */

/**
 * Unique identifier string branded with UUID type
 */
export type UUID = string & { readonly __brand: 'uuid' };

/**
 * Timestamp number branded with Timestamp type
 */
export type Timestamp = number & { readonly __brand: 'timestamp' };

/**
 * Energy points number branded with EnergyPoints type
 */
export type EnergyPoints = number & { readonly __brand: 'energy-points' };

/**
 * Generic JSON value type
 */
export type Json = 
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

/**
 * Record with string keys and unknown values
 */
export type Dictionary<T = unknown> = Record<string, T>;

/**
 * Type for identifying ID strings in the system
 */
export type ID = string;

/**
 * An ISO-8601 formatted date string
 */
export type DateString = string & { readonly __brand: 'date-string' };

/**
 * Non-empty array type
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * Type for functions that don't return a value
 */
export type VoidFunction = () => void;

/**
 * Type for functions that can be called with any arguments
 */
export type AnyFunction = (...args: any[]) => any;

/**
 * Type for objects with any string keys
 */
export type AnyObject = Record<string, any>;

/**
 * Type that requires at least one property from T
 */
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> 
  & {
      [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
    }[Keys];

/**
 * Type that makes nested properties partially optional
 */
export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

/**
 * Type for version strings
 */
export type Version = string & { readonly __brand: 'version' };
