
# Type-Value Pattern for TypeScript

## The Problem

One of the most common TypeScript errors we encounter is:

```
TS2693: 'DeviceCapability' only refers to a type, but is being used as a value here.
```

This happens when we try to use a TypeScript type as a value in our code. TypeScript types only exist at compile time and are erased at runtime, so they cannot be used as values.

## The Type-Value Pattern Solution

The Type-Value Pattern solves this by maintaining two parallel definitions:

1. A TypeScript **type** for type checking at compile time
2. A JavaScript **value** (object) containing constants that match the type

### Example Pattern

```typescript
// 1. Define the type
export type DeviceCapability = 'low-end' | 'mid-range' | 'high-end';

// 2. Define the corresponding runtime values
export const DeviceCapabilities = {
  LOW_END: 'low-end' as DeviceCapability,
  MID_RANGE: 'mid-range' as DeviceCapability,
  HIGH_END: 'high-end' as DeviceCapability
};
```

### Usage

```typescript
// WRONG - Causes "only refers to a type, but is being used as a value here" error
if (device === DeviceCapability.LOW_END) { ... }

// RIGHT - Use the value object, not the type
if (device === DeviceCapabilities.LOW_END) { ... }

// Type checking still works
function setCapability(capability: DeviceCapability) {
  // TypeScript will ensure only valid values are passed
}

// Pass the constant value
setCapability(DeviceCapabilities.LOW_END);
```

## Best Practices

1. **Keep Type and Value Together**: Define both the type and its companion value object in the same file to maintain consistency.

2. **Consistent Naming**: Use plural for value objects (`DeviceCapabilities`) and singular for types (`DeviceCapability`).

3. **Type Assertion**: Always use the `as` syntax to ensure the constant values conform to the type:
   ```typescript
   LOW_END: 'low-end' as DeviceCapability
   ```

4. **Consider Separate Files**: For large applications, consider separating types and runtime constants:
   ```
   types/core/performance/constants.ts       // Type definitions 
   types/core/performance/runtime-constants.ts  // Runtime values
   ```

5. **Re-Export Both**: When separating files, re-export both from a common entry point for ease of use.

6. **Document the Pattern**: Add comments explaining the pattern to help other developers understand the approach.

## Example Implementation

### constants.ts (Types)
```typescript
export type RenderFrequency = 'low' | 'medium' | 'high' | 'adaptive';

export type DeviceCapability = 'low-end' | 'mid-range' | 'high-end';
```

### runtime-constants.ts (Values)
```typescript
import { RenderFrequency, DeviceCapability } from './constants';

export const RenderFrequencies = {
  LOW: 'low' as RenderFrequency,
  MEDIUM: 'medium' as RenderFrequency,
  HIGH: 'high' as RenderFrequency,
  ADAPTIVE: 'adaptive' as RenderFrequency
};

export const DeviceCapabilities = {
  LOW_END: 'low-end' as DeviceCapability,
  MID_RANGE: 'mid-range' as DeviceCapability,
  HIGH_END: 'high-end' as DeviceCapability
};
```

### Using in components
```typescript
import { DeviceCapability } from '../types/core/performance/constants';
import { DeviceCapabilities } from '../types/core/performance/runtime-constants';

function optimizeForDevice(capability: DeviceCapability) {
  if (capability === DeviceCapabilities.LOW_END) {
    // Optimize for low-end devices
  }
}
```

By following this pattern consistently throughout the codebase, we can avoid the "refers to a type, but is being used as a value" errors while maintaining strong type safety.
