
/**
 * Core primitive type definitions
 * These form the foundation of our type system
 */

// Brand type utility
type Brand<K, T> = K & { readonly __brand: T };

// Core primitive branded types
export type UUID = Brand<string, 'uuid'>;
export type Timestamp = Brand<number, 'timestamp'>;
export type EnergyPoints = Brand<number, 'energy-points'>;
export type ChakraLevel = Brand<number, 'chakra-level'>;

// Common string types
export type ISO8601DateTime = Brand<string, 'iso8601-datetime'>;
export type EmailAddress = Brand<string, 'email-address'>;
export type JSONString = Brand<string, 'json-string'>;

// Numeric constraints
export type Percentage = Brand<number, 'percentage'>;
export type NonNegativeNumber = Brand<number, 'non-negative'>;
export type PositiveNumber = Brand<number, 'positive'>;

// Type utilities
export type Optional<T> = T | null | undefined;
export type ReadonlyRecord<K extends string | number | symbol, T> = Readonly<Record<K, T>>;
export type DeepReadonly<T> = T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;
