
# Type vs. Value Pattern Best Practices

## Problem

A common source of TypeScript errors is confusion between types (which exist only at compile time) and values (which exist at runtime). This leads to errors like:

```typescript
// ERROR: 'DeviceCapability' only refers to a type, but is being used as a value here.
if (capability === DeviceCapability.HIGH_END) { ... }
```

## Root Cause

TypeScript's type system is erased during compilation - types don't exist at runtime. When you try to use a type name as if it were a value (like an enum or object), TypeScript reports this error.

## Solution Pattern: Mirror Types with Runtime Constants

Create parallel definitions for each concept:
1. A **TypeScript type** for compile-time type checking
2. A **constant object** with the same values for runtime usage

### Implementation Example

```typescript
// 1. Define the type (for compile-time checking)
export type DeviceCapability = 'low-end' | 'mid-range' | 'high-end';

// 2. Define constants (for runtime usage)
export const DeviceCapabilities = {
  LOW_END: 'low-end' as DeviceCapability,
  MID_RANGE: 'mid-range' as DeviceCapability,
  HIGH_END: 'high-end' as DeviceCapability
} as const;

// Usage in type positions (for parameters, return types, etc.)
function configureForDevice(capability: DeviceCapability) {
  // Implementation
}

// Usage in value positions (comparisons, assignments, etc.)
if (userDevice === DeviceCapabilities.LOW_END) {
  enableLowEndMode();
}
```

### Benefits

1. **Type Safety**: The type system ensures you only use valid values
2. **Runtime Access**: Constants are available at runtime for comparison
3. **IntelliSense Support**: You get autocomplete for both the type and constants
4. **Clear Intent**: Clearly distinguishes between type usage and value usage

### Naming Conventions

To avoid confusion:
- Use singular nouns for type names: `DeviceCapability`, `PerformanceMode`
- Use plural nouns for constant objects: `DeviceCapabilities`, `PerformanceModes`

### Best Practices

1. **Keep Types and Constants in Sync**: Always update both if values change
2. **Use Type Assertion**: Use `as Type` to ensure constants match the type
3. **Use `as const`**: Add `as const` to the constants object for exact types
4. **Group Related Types**: Keep related types and constants in the same file
5. **Consider Type Guards**: Create type guard functions for runtime validation:

```typescript
function isValidDeviceCapability(value: unknown): value is DeviceCapability {
  return typeof value === 'string' && 
    Object.values(DeviceCapabilities).includes(value as DeviceCapability);
}
```

By consistently applying this pattern, you'll eliminate "type used as value" errors and create a more maintainable codebase.
