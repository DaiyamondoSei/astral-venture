
# Type vs. Value Pattern Documentation

## The Problem

One of the most common errors in TypeScript applications, especially in our codebase, is the confusion between **types** (compile-time constructs) and **values** (runtime entities). This manifests as errors like:

```typescript
// ERROR: 'DeviceCapability' only refers to a type, but is being used as a value here
if (capability === DeviceCapability.HIGH_END) { ... }
```

This error occurs because TypeScript types are erased during compilation and don't exist at runtime.

## 5 Whys Analysis

1. **Why does the error occur?**
   - Because types are being used as if they were values in runtime code.

2. **Why are types being used as values?**
   - Because there's a natural inclination to use types as enums or constants.

3. **Why is there confusion between types and values?**
   - Because TypeScript's type system allows types that mirror the shape of expected runtime values.

4. **Why isn't there a clear distinction in the codebase?**
   - Because we lacked a consistent pattern for managing the type/value duality.

5. **Why wasn't a consistent pattern established?**
   - Because there was no documented best practice or automated validation enforcing the pattern.

## The Solution: Type-Value Pattern

We've established a pattern throughout the codebase to address this issue:

1. **Define a type** for type checking at compile time
2. **Define a constant object** with the same values for runtime usage

### Implementation Example

```typescript
// 1. Define the type (for compile-time type checking)
export type DeviceCapability = 'low-end' | 'mid-range' | 'high-end';

// 2. Define constants (for runtime usage)
export const DeviceCapabilities = {
  LOW_END: 'low-end' as DeviceCapability,
  MID_RANGE: 'mid-range' as DeviceCapability,
  HIGH_END: 'high-end' as DeviceCapability
};

// Usage in type positions (for parameters, return types, etc.)
function configureForDevice(capability: DeviceCapability) {
  // Implementation
}

// Usage in value positions (comparisons, assignments, etc.)
if (deviceCapability === DeviceCapabilities.LOW_END) {
  enableLowEndMode();
}
```

### Benefits

1. **Type Safety**: TypeScript ensures you only use valid values
2. **Runtime Access**: Constants are available at runtime for comparisons
3. **IntelliSense Support**: You get autocompletion for both types and constants
4. **Clear Distinction**: The code clearly shows whether you're using a type or a value

### Naming Conventions

To maintain consistency across the codebase:

- Use **singular nouns** for type names: `DeviceCapability`, `PerformanceMode`
- Use **plural nouns** for constant objects: `DeviceCapabilities`, `PerformanceModes`

### When to Apply This Pattern

Apply this pattern whenever you need a concept to exist as both:

1. A compile-time type (for type checking)
2. A runtime value (for comparison or assignment)

This is commonly needed for:

- Enums or enum-like concepts
- String literal unions that need runtime representation
- Configuration options that need type checking

### Implementation Checklist

When implementing this pattern:

- [ ] Create a type definition using string literal unions
- [ ] Create a constant object with all the values
- [ ] Use descriptive naming (singular for types, plural for constants)
- [ ] Use the type for all type annotations
- [ ] Use the constants for all runtime references

### Common Pitfalls

1. **Inconsistent naming**: Not following the singular/plural convention
2. **Missing values**: Not including all type variants in the constants object
3. **Direct use of string literals**: Using the string value directly instead of the constant

By consistently applying this pattern across our codebase, we can eliminate the "type used as value" errors and create more maintainable code.
