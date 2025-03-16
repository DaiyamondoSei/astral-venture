
# Type-Value Pattern Best Practices

## Problem Statement

One of the most frequent sources of TypeScript errors in our codebase is related to a fundamental TypeScript concept: **types exist only at compile time, while values exist at runtime**.

This leads to errors like:

```typescript
// Error: 'DeviceCapability' only refers to a type, but is being used as a value here
if (deviceType === DeviceCapability.HIGH) { ... }
```

## Root Cause Analysis (5 Whys)

1. **Why does this error occur?**
   - Types like `DeviceCapability` are erased at compile time and don't exist at runtime.

2. **Why are we trying to use types as values?**
   - We need both compile-time type checking and runtime constants for the same concept.

3. **Why do we need both?**
   - Types provide compile-time safety, while runtime constants are needed for comparisons and serialization.

4. **Why is this inconsistently implemented?**
   - There was no standardized pattern enforced across the codebase.

5. **Why was there no standardized pattern?**
   - The Type-Value pattern wasn't documented as a core architectural pattern for the project.

## The Type-Value Pattern Solution

The Type-Value pattern is a systematic approach to ensure that every type that needs runtime representation has a corresponding set of constants:

### Implementation

1. **Define the type** (usually as a string literal union):
   ```typescript
   // In types.ts
   export type DeviceCapability = 'low' | 'medium' | 'high';
   ```

2. **Define corresponding constants**:
   ```typescript
   // In constants.ts
   import { DeviceCapability } from './types';
   
   export const DeviceCapabilities = {
     LOW: 'low' as DeviceCapability,
     MEDIUM: 'medium' as DeviceCapability,
     HIGH: 'high' as DeviceCapability
   } as const;
   ```

### Usage

Use types for type annotations and constants for runtime operations:

```typescript
// Type annotation (compile-time)
function configureDevice(capability: DeviceCapability) {
  // Runtime value comparison
  if (capability === DeviceCapabilities.HIGH) {
    enableHighPerformanceMode();
  }
}
```

## Best Practices

### 1. Naming Conventions

- **Types**: Singular noun, PascalCase (`DeviceCapability`)
- **Constants**: Plural noun, PascalCase (`DeviceCapabilities`)
- **Constant values**: UPPER_SNAKE_CASE (`HIGH`, `MEDIUM`, `LOW`)

### 2. File Organization

For clarity and maintainability, separate types and constants:

```
/types/
  /core/
    /performance/
      types.ts           # Type definitions
      constants.ts       # Runtime constants
      index.ts           # Re-exports both
```

### 3. Type Assertions

Always use `as Type` assertions on constants to ensure type safety:

```typescript
export const AudioQuality = {
  LOW: 'low' as AudioQualityLevel,
  // ...
} as const;
```

The `as const` assertion at the end is also critical for preserving literal types.

### 4. Documentation

Document the relationship between types and constants:

```typescript
/**
 * Audio quality levels
 * @see AudioQuality for runtime constants
 */
export type AudioQualityLevel = 'low' | 'medium' | 'high';

/**
 * Runtime constants for audio quality levels
 * @see AudioQualityLevel for the type definition
 */
export const AudioQuality = { ... };
```

### 5. Validation Functions

Add optional runtime validation functions:

```typescript
export function isValidDeviceCapability(value: string): value is DeviceCapability {
  return Object.values(DeviceCapabilities).includes(value as DeviceCapability);
}
```

### 6. Default Values

Establish default values using the constants, not string literals:

```typescript
// Good
const DEFAULT_CAPABILITY = DeviceCapabilities.MEDIUM;

// Avoid
const DEFAULT_CAPABILITY = 'medium' as DeviceCapability;
```

### 7. Enums vs. Type-Value Pattern

While TypeScript enums can serve a similar purpose, the Type-Value pattern offers advantages:

- More explicit control over the runtime representation
- Better integration with string literal types
- More predictable compiled JavaScript
- More flexibility with string-based APIs and serialization

## Implementation Checklist

When implementing the Type-Value pattern:

- [ ] Create a type definition with string literal union
- [ ] Create a constants object with values that match the type
- [ ] Add type assertions to each constant value
- [ ] Add `as const` assertion to the constants object
- [ ] Document the relationship between the type and constants
- [ ] Export both from a central location
- [ ] Use consistent naming (singular type, plural constants)
- [ ] Add validation functions if runtime checking is needed

By following the Type-Value pattern consistently, we can eliminate a whole class of TypeScript errors and create more maintainable and type-safe code.
