
# TypeScript Type-Value Pattern

## Problem Definition

One of the most common TypeScript errors in our application is attempting to use a TypeScript type as if it were a JavaScript value. This leads to errors like:

```typescript
// ERROR: 'DeviceCapability' only refers to a type, but is being used as a value here.
if (capability === DeviceCapability.HIGH) { ... }
```

This happens because TypeScript types don't exist at runtime - they're erased during compilation to JavaScript. When we try to reference a type name directly as if it were an object with properties, TypeScript correctly reports this as an error.

## The Type-Value Pattern Solution

The Type-Value Pattern involves creating two parallel structures:

1. **Type Definition**: A TypeScript type used for type checking (compile-time)
2. **Runtime Value**: A JavaScript object with the same structure (runtime)

### Implementation Example

```typescript
// 1. Define the TYPE (for compile-time type checking)
export type DeviceCapability = 'low-end' | 'mid-range' | 'high-end';

// 2. Define the VALUE (for runtime usage)
export const DeviceCapabilities = {
  LOW: 'low-end' as DeviceCapability,
  MEDIUM: 'mid-range' as DeviceCapability,
  HIGH: 'high-end' as DeviceCapability
};

// 3. Usage in code
// Correct: Using the VALUE at runtime
if (capability === DeviceCapabilities.HIGH) { ... }

// Correct: Using the TYPE for type annotations
function setCapability(newCapability: DeviceCapability) { ... }
```

## Benefits of This Pattern

1. **Type Safety**: You get full type checking for values
2. **Runtime Access**: Values are available at runtime
3. **IntelliSense Support**: IDE shows available options
4. **Consistent Naming**: Clear distinction between types and values
5. **Centralized Definition**: Single source of truth for related types and values

## Naming Conventions

To maintain consistency across the codebase:

1. Types use singular nouns: `DeviceCapability`, `PerformanceMode`
2. Values use plural nouns: `DeviceCapabilities`, `PerformanceModes`
3. Type values use UPPER_CASE: `DeviceCapabilities.HIGH`, `PerformanceModes.BALANCED`
4. Always export both the type and values object

## Common Locations for Type-Value Pairs

- `src/types/core/*/constants.ts`: Type definitions
- `src/types/core/*/runtime-constants.ts`: Value definitions

## When To Apply This Pattern

Apply this pattern whenever you need to:

1. Define a set of constants that will be referenced in multiple places
2. Create enumerated values with specific string representations
3. Define configuration options that need type checking
4. Create any value that needs to be both type-checked and referenced at runtime

## Alternatives

In some cases, TypeScript enums can be used instead:

```typescript
export enum DeviceCapability {
  LOW = 'low-end',
  MEDIUM = 'mid-range',
  HIGH = 'high-end'
}
```

However, we prefer the Type-Value Pattern because:
- It produces more predictable JavaScript output
- It allows more flexible string literal values
- It's consistent with our other type definitions
- It avoids some of the quirks of TypeScript enums

## Implementation Checklist

When adding new constants to the system:

- [ ] Define the type in the appropriate constants.ts file
- [ ] Create the corresponding values in the runtime-constants.ts file
- [ ] Export both the type and values
- [ ] Reference the type for type annotations
- [ ] Reference the values for runtime comparisons
- [ ] Use consistent naming following the conventions above

By consistently applying this pattern, we can eliminate an entire class of TypeScript errors while maintaining clear, maintainable code.
