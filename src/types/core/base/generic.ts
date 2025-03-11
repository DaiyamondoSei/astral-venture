
/**
 * Core Generic Types
 * 
 * This module provides generic type utilities used throughout the application.
 * 
 * @category Core
 * @version 1.0.0
 */

/**
 * Makes specified properties in T required
 */
export type RequiredProps<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Makes specified properties in T optional
 */
export type OptionalProps<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Makes all properties in T nullable
 */
export type Nullable<T> = { [P in keyof T]: T[P] | null };

/**
 * Makes all properties in T non-nullable
 */
export type NonNullable<T> = { [P in keyof T]: NonNullable<T[P]> };

/**
 * Creates a type with only the specified keys from T
 */
export type PickExact<T, K extends keyof T> = { [P in K]: T[P] };

/**
 * Creates a type where all properties are readonly
 */
export type Immutable<T> = { readonly [P in keyof T]: Immutable<T[P]> };

/**
 * Creates a mutable version of a readonly type
 */
export type Mutable<T> = { -readonly [P in keyof T]: T[P] };

/**
 * Creates a type with mapped properties
 */
export type Mapped<T, U> = { [P in keyof T]: U };

/**
 * Creates a record type with keys from union type K
 */
export type RecordOf<K extends string | number | symbol, T> = { [P in K]: T };

/**
 * Excludes null and undefined from type T
 */
export type Defined<T> = Exclude<T, null | undefined>;

/**
 * Creates a type that requires at least one of the properties in T
 */
export type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];

/**
 * Creates a type from T where properties match the predicate
 */
export type FilterProps<T, P> = Pick<T, { [K in keyof T]: T[K] extends P ? K : never }[keyof T]>;

/**
 * Creates a type with properties from T excluding those that match the predicate
 */
export type ExcludeProps<T, P> = Pick<T, { [K in keyof T]: T[K] extends P ? never : K }[keyof T]>;

/**
 * Creates a type with properties from T where keys are in K
 */
export type SubType<T, K extends keyof T> = { [P in K]: T[P] };

/**
 * Creates a type with all properties of T made optional and possibly undefined
 */
export type Sparse<T> = { [P in keyof T]?: T[P] | undefined };

/**
 * Creates a type with properties from T and U, using U's properties where they overlap
 */
export type Overwrite<T, U> = Omit<T, keyof U> & U;

/**
 * Creates a type that unwraps a Promise type
 */
export type Awaited<T> = T extends Promise<infer R> ? R : T;

/**
 * Creates a type with only the methods from T
 */
export type Methods<T> = { [P in keyof T as T[P] extends Function ? P : never]: T[P] };

/**
 * Creates a type with only the non-method properties from T
 */
export type Properties<T> = { [P in keyof T as T[P] extends Function ? never : P]: T[P] };

/**
 * Creates a type that is either T or a Promise of T
 */
export type MaybePromise<T> = T | Promise<T>;

/**
 * Creates a type that is either T or an array of T
 */
export type SingleOrArray<T> = T | T[];

/**
 * Extracts the type of an array element
 */
export type ArrayElement<T extends readonly unknown[]> = T extends readonly (infer E)[] ? E : never;
