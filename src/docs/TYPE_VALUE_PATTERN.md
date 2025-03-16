
# Type-Value Pattern Best Practices

## Problem

One of the most common TypeScript errors in our application is the confusion between types and values:

```typescript
// ERROR: 'ChakraType' only refers to a type, but is being used as a value here
if (chakra === ChakraType.ROOT) { ... }
```

This happens because TypeScript types are erased during compilation - they don't exist at runtime.

## Solution: The Type-Value Pattern

The Type-Value pattern provides both compile-time type safety and runtime values for the same concepts:

```typescript
// TYPE (used in type annotations)
export type ChakraType = 'root' | 'sacral' | 'solar' | 'heart' | 'throat' | 'third-eye' | 'crown';

// VALUE (used in runtime code)
export const ChakraTypes = {
  ROOT: 'root' as ChakraType,
  SACRAL: 'sacral' as ChakraType,
  SOLAR: 'solar' as ChakraType,
  HEART: 'heart' as ChakraType,
  THROAT: 'throat' as ChakraType,
  THIRD_EYE: 'third-eye' as ChakraType,
  CROWN: 'crown' as ChakraType
};

// Type usage (compile-time)
function activateChakra(chakra: ChakraType) { ... }

// Value usage (runtime)
if (currentChakra === ChakraTypes.ROOT) { ... }
```

## Implementation Guidelines

1. **Naming Conventions**:
   - Use singular for the type (`ChakraType`)
   - Use plural for the values object (`ChakraTypes`)
   - Use uppercase for value constants

2. **File Organization**:
   - Put related types and constants in separate files (`types.ts` and `constants.ts`)
   - Re-export both from an `index.ts` file

3. **Type Assertions**:
   - Always use `as` to assert string literals to their specific type
   - Use `as const` on the constants object to make it deeply readonly

4. **Type Guards for Runtime Validation**:
   ```typescript
   function isChakraType(value: string): value is ChakraType {
     return Object.values(ChakraTypes).includes(value as ChakraType);
   }
   ```

## Benefits

1. **Type Safety**: Enforces correct values at compile time
2. **Runtime Validation**: Allows checking values at runtime
3. **Autocompletion**: IDE provides autocomplete for both types and values
4. **Single Source of Truth**: Types and values stay in sync
5. **Maintainability**: Changes to one place automatically update both

## Examples

### Example 1: Performance Modes

```typescript
// types.ts
export type PerformanceMode = 'battery' | 'balanced' | 'performance' | 'auto' | 'quality';

// constants.ts
export const PerformanceModes = {
  BATTERY: 'battery' as PerformanceMode,
  BALANCED: 'balanced' as PerformanceMode,
  PERFORMANCE: 'performance' as PerformanceMode,
  AUTO: 'auto' as PerformanceMode,
  QUALITY: 'quality' as PerformanceMode
} as const;

// usage.ts
function setPerformanceMode(mode: PerformanceMode) { ... }

// Correct runtime usage
setPerformanceMode(PerformanceModes.BALANCED);
```

### Example 2: Validation Error Codes

```typescript
// types.ts
export type ValidationErrorCode = 
  | 'REQUIRED' 
  | 'TYPE_ERROR' 
  | 'FORMAT_ERROR'
  | 'CONSTRAINT_ERROR';

// constants.ts
export const ValidationErrorCodes = {
  REQUIRED: 'REQUIRED' as ValidationErrorCode,
  TYPE_ERROR: 'TYPE_ERROR' as ValidationErrorCode,
  FORMAT_ERROR: 'FORMAT_ERROR' as ValidationErrorCode,
  CONSTRAINT_ERROR: 'CONSTRAINT_ERROR' as ValidationErrorCode
} as const;

// Usage
function createError(code: ValidationErrorCode, message: string) { ... }

// Correct runtime usage
createError(ValidationErrorCodes.REQUIRED, "Field is required");
```

## Anti-Patterns to Avoid

1. **Using Type as Value**:
   ```typescript
   // WRONG
   if (mode === PerformanceMode.BATTERY) { ... }
   
   // RIGHT
   if (mode === PerformanceModes.BATTERY) { ... }
   ```

2. **Using Enum Instead**:
   ```typescript
   // AVOID TypeScript enums when possible
   enum ChakraType { ROOT, SACRAL, SOLAR }
   
   // Prefer string literal types with constants
   ```

3. **Missing Type Assertion**:
   ```typescript
   // WRONG
   export const ChakraTypes = {
     ROOT: 'root', // Missing type assertion
   };
   
   // RIGHT
   export const ChakraTypes = {
     ROOT: 'root' as ChakraType,
   };
   ```

## When to Apply This Pattern

- Whenever you have a concept that needs both type checking and runtime comparison
- For all string literal unions that will be used as values in the code
- Any time you're tempted to use a TypeScript enum

By consistently applying the Type-Value pattern, you'll eliminate a whole class of common TypeScript errors and improve code maintainability.
