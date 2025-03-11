
/**
 * Core Type System
 * 
 * This file defines the foundational types used throughout the application.
 * It establishes type aliases, branded types, and common type patterns
 * to ensure type safety and consistency.
 */

// Primitive type aliases for better semantics
export type ID = string;
export type ISO8601Date = string;
export type UUID = string;
export type Email = string;
export type URI = string;

// Common type patterns
export type Optional<T> = T | null | undefined;
export type Nullable<T> = T | null;
export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

// Branded types for type safety
export type Brand<K, T> = K & { __brand: T };
export type UserID = Brand<string, 'user-id'>;
export type SessionID = Brand<string, 'session-id'>;

// Record with required and optional fields
export type RequiredKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? never : K }[keyof T];
export type OptionalKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? K : never }[keyof T];

// Ensure all properties of a type are required
export type Required<T> = { [P in keyof T]-?: T[P] };

// Make specific properties of a type required
export type RequiredProps<T, K extends keyof T> = T & { [P in K]-?: T[P] };

// Make specific properties of a type optional
export type OptionalProps<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Ensure a type has at least one property from a set
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
    Pick<T, Exclude<keyof T, Keys>> 
    & {
        [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
    }[Keys];

// Make all properties except specific ones optional
export type PartialExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>;

// Deep partial type (recursively makes all properties optional)
export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

// Record with string keys and values of a specific type
export type Dictionary<T> = Record<string, T>;

// Function types
export type VoidFunction = () => void;
export type AsyncVoidFunction = () => Promise<void>;
export type Predicate<T> = (value: T) => boolean;
export type AsyncPredicate<T> = (value: T) => Promise<boolean>;
export type Transform<T, R> = (value: T) => R;
export type AsyncTransform<T, R> = (value: T) => Promise<R>;

// Utility types for API responses
export type ApiResponse<T> = {
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
};

// Type for a constructor function
export type Constructor<T> = new (...args: any[]) => T;

// Union of primitive types
export type Primitive = string | number | boolean | bigint | symbol | undefined | null;

// Type for a record with any values
export type AnyRecord = Record<string, any>;

/**
 * Creates a branded type from a string
 * @param value The string value to brand
 * @returns The branded string
 */
export function brandString<K extends string>(value: string, _brand: K): Brand<string, K> {
  return value as Brand<string, K>;
}
