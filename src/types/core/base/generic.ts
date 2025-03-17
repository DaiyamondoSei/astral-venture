
/**
 * Generic Utility Types
 * 
 * This module provides utility types for common patterns.
 */

/**
 * Makes specific properties of T optional
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Makes specific properties of T required
 */
export type Required<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: T[P] };

/**
 * Makes specific properties of T nullable
 */
export type Nullable<T, K extends keyof T> = Omit<T, K> & { [P in K]: T[P] | null };

/**
 * Makes all properties of T readonly
 */
export type Immutable<T> = { readonly [K in keyof T]: T[K] };

/**
 * Makes all properties of T mutable (removes readonly)
 */
export type Mutable<T> = { -readonly [K in keyof T]: T[K] };

/**
 * Picks properties of T that match type U
 */
export type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P]
};

/**
 * Omits properties of T that match type U
 */
export type OmitByType<T, U> = {
  [P in keyof T as T[P] extends U ? never : P]: T[P]
};

/**
 * Deep partial - makes all properties of T and its nested objects optional
 */
export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

/**
 * Deep required - makes all properties of T and its nested objects required
 */
export type DeepRequired<T> = T extends object ? {
  [P in keyof T]-?: DeepRequired<T[P]>;
} : T;

/**
 * Recursive partial with arrays
 */
export type RecursivePartial<T> = {
  [P in keyof T]?: 
    T[P] extends (infer U)[] ? RecursivePartial<U>[] :
    T[P] extends object ? RecursivePartial<T[P]> :
    T[P];
};

/**
 * Extract keys of an object whose values are of a specific type
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never
}[keyof T];

/**
 * Function type with parameters P and return type R
 */
export type Func<P extends any[], R> = (...args: P) => R;

/**
 * Represents an async function that returns a Promise of type T
 */
export type AsyncFunc<P extends any[], R> = (...args: P) => Promise<R>;

/**
 * Type for representing a constructor
 */
export type Constructor<T> = new (...args: any[]) => T;

/**
 * Type for union discrimination
 */
export type Discriminate<T, K extends keyof T, V extends T[K]> = 
  T extends { [key in K]: V } ? T : never;

/**
 * Type for value of a Promise
 */
export type PromiseValue<T extends Promise<any>> = T extends Promise<infer U> ? U : never;

/**
 * Type for record with specific keys and values
 */
export type RecordWithKeys<K extends string | number | symbol, V> = {
  [P in K]: V;
};

/**
 * NonEmpty array type ensures that an array has at least one element
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * Represents a tuple of exactly N elements of type T
 */
export type Tuple<T, N extends number> = N extends N ? number extends N ? T[] : _TupleOf<T, N, []> : never;
type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N ? R : _TupleOf<T, N, [T, ...R]>;
