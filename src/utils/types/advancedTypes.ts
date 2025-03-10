
/**
 * Advanced TypeScript Type Utilities
 * 
 * A collection of reusable type utilities for ensuring type safety
 * and reducing technical debt throughout the application.
 */

/**
 * Creates a branded type - a primitive with a specific identifier
 * to prevent mixing of semantically different values of the same primitive type
 */
export type Brand<K, T> = K & { __brand: T };

/**
 * Common branded types used throughout the application
 */
export type UserId = Brand<string, 'userId'>;
export type EmailAddress = Brand<string, 'emailAddress'>;
export type SessionId = Brand<string, 'sessionId'>;
export type JWT = Brand<string, 'jwt'>;
export type Timestamp = Brand<number, 'timestamp'>;
export type PositiveNumber = Brand<number, 'positiveNumber'>;
export type NonEmptyString = Brand<string, 'nonEmptyString'>;

/**
 * Utility type for deep partial objects (nested properties are also optional)
 */
export type DeepPartial<T> = T extends object 
  ? { [P in keyof T]?: DeepPartial<T[P]> } 
  : T;

/**
 * Utility type for deep readonly objects (nested properties are also readonly)
 */
export type DeepReadonly<T> = T extends object 
  ? { readonly [P in keyof T]: DeepReadonly<T[P]> } 
  : T;

/**
 * Utility type to make specific properties of an object required
 */
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Utility type for non-empty arrays
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * Utility type to require at least one property from a set
 */
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, Keys>> 
  & {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
  }[Keys];

/**
 * Utility type to require exactly one property from a set
 */
export type RequireOnlyOne<T, Keys extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, Keys>> 
  & {
    [K in Keys]-?: Required<Pick<T, K>> 
      & Partial<Record<Exclude<Keys, K>, undefined>>
  }[Keys];

/**
 * Utility type for discriminated unions
 */
export type Discriminate<T, K extends PropertyKey, V extends T[K & keyof T]> = 
  T extends { [key in K & keyof T]: V } ? T : never;

/**
 * Utility type for exact object shape (no additional properties)
 */
export type Exact<T, Shape> = T extends Shape 
  ? Exclude<keyof T, keyof Shape> extends never 
    ? T 
    : never 
  : never;

/**
 * Utility type for dictionary objects
 */
export type Dictionary<T> = Record<string, T>;

/**
 * Utility type for function params
 */
export type Parameters<T extends (...args: any) => any> = 
  T extends (...args: infer P) => any ? P : never;

/**
 * Utility type for function return type
 */
export type ReturnType<T extends (...args: any) => any> = 
  T extends (...args: any) => infer R ? R : any;

/**
 * Utility type for making specific keys optional
 */
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Utility type for making all properties nullable
 */
export type Nullable<T> = { [P in keyof T]: T[P] | null };

/**
 * Type guard for non-null assertion
 */
export function isNonNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard for non-empty array
 */
export function isNonEmptyArray<T>(arr: T[]): arr is NonEmptyArray<T> {
  return Array.isArray(arr) && arr.length > 0;
}

/**
 * Type guard for branded types
 */
export function assertBrand<K, T>(
  value: K, 
  validator: (val: K) => boolean, 
  errorMessage: string
): Brand<K, T> {
  if (!validator(value)) {
    throw new Error(errorMessage);
  }
  return value as Brand<K, T>;
}

/**
 * Creates an email address branded type with validation
 */
export function createEmailAddress(email: string): EmailAddress {
  return assertBrand<string, 'emailAddress'>(
    email,
    (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    'Invalid email address format'
  );
}

/**
 * Creates a positive number branded type with validation
 */
export function createPositiveNumber(num: number): PositiveNumber {
  return assertBrand<number, 'positiveNumber'>(
    num,
    (val) => val > 0 && Number.isFinite(val),
    'Value must be a positive number'
  );
}

/**
 * Creates a non-empty string branded type with validation
 */
export function createNonEmptyString(str: string): NonEmptyString {
  return assertBrand<string, 'nonEmptyString'>(
    str,
    (val) => val.trim().length > 0,
    'String cannot be empty'
  );
}
