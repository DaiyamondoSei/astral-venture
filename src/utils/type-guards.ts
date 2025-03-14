
/**
 * Utility functions for TypeScript type narrowing
 * These type guards help narrow union types to specific members,
 * providing type safety when working with complex type hierarchies.
 */

/**
 * Type guard for checking if a value is an array
 */
export function isArray<T>(value: T | T[]): value is T[] {
  return Array.isArray(value);
}

/**
 * Type guard for checking if a value is not null or undefined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard for checking if an object has a specific property
 */
export function hasProperty<K extends string, T>(
  obj: unknown, 
  prop: K
): obj is Record<K, T> {
  return typeof obj === 'object' && obj !== null && prop in obj;
}

/**
 * Type guard for chakra pair objects vs tuple representation
 */
export function isChakraPair(
  pair: [number, number] | { primaryChakra: number; secondaryChakra: number; entanglementStrength: number }
): pair is { primaryChakra: number; secondaryChakra: number; entanglementStrength: number } {
  return (
    typeof pair === 'object' && 
    !Array.isArray(pair) && 
    'primaryChakra' in pair &&
    'secondaryChakra' in pair &&
    'entanglementStrength' in pair
  );
}

/**
 * Type guard for discriminated union with a 'type' field
 */
export function hasType<T extends string>(
  obj: unknown, 
  type: T
): obj is { type: T } {
  return typeof obj === 'object' && 
    obj !== null && 
    'type' in obj && 
    (obj as any).type === type;
}

/**
 * Type guard for discriminated union with a 'kind' field
 */
export function hasKind<K extends string>(
  obj: unknown, 
  kind: K
): obj is { kind: K } {
  return typeof obj === 'object' && 
    obj !== null && 
    'kind' in obj && 
    (obj as any).kind === kind;
}

/**
 * Type guard for checking if a value is a specific primitive type
 */
export function isPrimitive<T extends 'string' | 'number' | 'boolean'>(
  value: unknown, 
  type: T
): value is (
  T extends 'string' ? string :
  T extends 'number' ? number :
  T extends 'boolean' ? boolean :
  never
) {
  return typeof value === type;
}

/**
 * Type guard for checking if an object implements a specific interface
 * by verifying required properties exist
 */
export function implementsInterface<T>(
  obj: unknown, 
  requiredProps: (keyof T)[]
): obj is T {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  
  return requiredProps.every(prop => prop in obj);
}
