
/**
 * Generic Type Utilities
 * 
 * This module provides generic type utilities for common patterns
 * used throughout the application.
 */

/**
 * Makes specific properties of T required
 */
export type RequiredProps<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Extracts the type of an array element
 */
export type ArrayElement<T extends readonly unknown[]> = T extends readonly (infer E)[] ? E : never;

/**
 * Creates a type with a subset of properties from T
 */
export type PickProps<T, K extends keyof T> = Pick<T, K>;

/**
 * Creates a type with all properties from T except those in K
 */
export type OmitProps<T, K extends keyof T> = Omit<T, K>;

/**
 * Creates a record type with keys from K and values of type T
 */
export type RecordMap<K extends string | number | symbol, T> = Record<K, T>;

/**
 * Creates a type that makes all properties in T required and non-nullable
 */
export type Concrete<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};

/**
 * Function type that returns a Promise of type T
 */
export type AsyncFunction<T, Args extends any[] = any[]> = (...args: Args) => Promise<T>;

/**
 * Mutable version of a readonly type
 */
export type Mutable<T> = { -readonly [P in keyof T]: T[P] };

/**
 * Type safe object keys
 */
export type TypedKeys<T> = keyof T;

/**
 * Type safe object values
 */
export type TypedValues<T> = T[keyof T];
