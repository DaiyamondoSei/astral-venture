
# Type-Value Pattern Implementation Guide

## Summary

The Type-Value Pattern ensures a consistent relationship between TypeScript types (for compile-time validation) and runtime values (for execution time). This pattern is critical to prevent the common error of using types as values.

## Implementation Steps

Follow these steps to implement the Type-Value Pattern consistently:

### 1. Define the Type

Create a type definition using a string literal union:

```typescript
// Define the type for compile-time validation
export type DeviceCapability = 'low' | 'medium' | 'high';
```

### 2. Create Corresponding Constants

Create a constants object with values that match the type:

```typescript
// Define runtime constants that match the type
export const DeviceCapabilities = {
  LOW: 'low' as DeviceCapability,
  MEDIUM: 'medium' as DeviceCapability,
  HIGH: 'high' as DeviceCapability
} as const;
```

The `as const` assertion ensures the object is deeply read-only.

### 3. Use Type Assertions

Always use type assertions to ensure the values match the type:

```typescript
// Use type assertions to ensure values match the type
LOW: 'low' as DeviceCapability
```

### 4. Access the Constants

When accessing the values at runtime, use the constants:

```typescript
// CORRECT: Using constants for runtime comparisons
if (device.capability === DeviceCapabilities.HIGH) {
  enableHighPerformanceMode();
}

// INCORRECT: This would cause a TypeScript error
if (device.capability === DeviceCapability.HIGH) { // ERROR!
  enableHighPerformanceMode();
}
```

### 5. Apply Consistent Naming Conventions

- Types: Singular noun, PascalCase (e.g., `DeviceCapability`)
- Constants: Plural noun, PascalCase (e.g., `DeviceCapabilities`)
- Values: UPPER_SNAKE_CASE (e.g., `HIGH`, `MEDIUM`, `LOW`)

## Complete Example

```typescript
// types.ts
export type DeviceCapability = 'low' | 'medium' | 'high';

export const DeviceCapabilities = {
  LOW: 'low' as DeviceCapability,
  MEDIUM: 'medium' as DeviceCapability,
  HIGH: 'high' as DeviceCapability
} as const;

// Function that uses the type for parameters
export function configureDevice(capability: DeviceCapability): void {
  // Function implementation
}

// usage.ts
import { DeviceCapability, DeviceCapabilities, configureDevice } from './types';

// Use the type for type annotations
const myDeviceCapability: DeviceCapability = DeviceCapabilities.MEDIUM;

// Use the constants for runtime operations
if (myDeviceCapability === DeviceCapabilities.HIGH) {
  console.log('High capability device detected');
}

// Pass the constant to functions
configureDevice(DeviceCapabilities.MEDIUM);
```

## Best Practices

1. **Co-locate Types and Constants**: Keep related types and constants in the same file
2. **Export Both**: Always export both the type and the constants
3. **Use Explicit Naming**: Use clear names that distinguish types from values
4. **Type Guard Functions**: Create type guard functions for runtime type checking:

```typescript
export function isDeviceCapability(value: string): value is DeviceCapability {
  return Object.values(DeviceCapabilities).includes(value as DeviceCapability);
}
```

5. **Default Values**: Use constants for default values, not string literals:

```typescript
// Good
const defaultCapability = DeviceCapabilities.MEDIUM;

// Avoid
const defaultCapability = 'medium' as DeviceCapability;
```

## Using with TypeScript's Pick and Omit

The pattern works well with TypeScript's utility types:

```typescript
type LowOrMediumCapability = Pick<typeof DeviceCapabilities, 'LOW' | 'MEDIUM'>;
```

## Testing

Create tests to verify that constants match their types:

```typescript
// Verify that all constants match the expected type
Object.values(DeviceCapabilities).forEach(value => {
  expect(isDeviceCapability(value)).toBe(true);
});
```

By following this pattern consistently, you'll eliminate a common source of TypeScript errors and create more maintainable, type-safe code.
