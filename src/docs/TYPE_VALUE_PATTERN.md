
# Type-Value Pattern

## Problem

TypeScript's type system is powerful for static type checking but doesn't provide runtime information. This leads to a common error pattern where we define types but don't have corresponding runtime values, creating a disconnect between compile-time and runtime behavior.

## Solution: The Type-Value Pattern

The Type-Value Pattern addresses this by ensuring every type has corresponding runtime values that match the type definition exactly. This pattern enforces a strict relationship between what the compiler knows (types) and what exists at runtime (values).

### Pattern Structure

1. **Define types** (usually as string literal unions or enums):
   ```typescript
   // Type definition - only available at compile time
   export type DeviceCapability = 'low' | 'medium' | 'high';
   ```

2. **Create corresponding runtime constants** in a predictable format:
   ```typescript
   // Runtime values - available at execution time
   export const DeviceCapabilities = {
     LOW: 'low' as DeviceCapability,
     MEDIUM: 'medium' as DeviceCapability,
     HIGH: 'high' as DeviceCapability
   };
   ```

3. **Use types for static checking** and constants for runtime references:
   ```typescript
   // In type definitions
   interface Config {
     capability: DeviceCapability;
   }
   
   // In runtime code
   if (config.capability === DeviceCapabilities.LOW) {
     // Safe comparison with runtime constant
   }
   ```

## Benefits

1. **Type Safety**: Compiler ensures that only valid values are used.
2. **Autocomplete Support**: IDE suggests available constants.
3. **Refactoring Safety**: Renaming a value updates all references.
4. **Runtime Validation**: Can validate data against known constants.
5. **Consistent Naming**: Clear convention for types vs. runtime values.

## Implementation Guidelines

1. **Naming Convention**: 
   - Types: PascalCase singular (e.g., `DeviceCapability`)
   - Constants: PascalCase plural (e.g., `DeviceCapabilities`)

2. **Organization**:
   - Keep related types and constants in the same file
   - Export both the type and constants

3. **Type Assertion**:
   - Use `as` typecasting to ensure constant values match the type
   - This creates a compile-time check that constants conform to the type

4. **Usage Priority**:
   - For comparisons and assignments, always use the constants
   - Use types only for type annotations

## Examples

### Performance Metrics

```typescript
// Type definition
export type MetricType = 'render' | 'interaction' | 'load';

// Runtime constants
export const MetricTypes = {
  RENDER: 'render' as MetricType,
  INTERACTION: 'interaction' as MetricType,
  LOAD: 'load' as MetricType
};

// Usage
function trackMetric(type: MetricType, value: number) {
  if (type === MetricTypes.RENDER) {
    // Process render metrics...
  }
}
```

### Component Variants

```typescript
// Type definition
export type ButtonVariant = 'primary' | 'secondary' | 'danger';

// Runtime constants
export const ButtonVariants = {
  PRIMARY: 'primary' as ButtonVariant,
  SECONDARY: 'secondary' as ButtonVariant,
  DANGER: 'danger' as ButtonVariant
};

// Usage in a component
interface ButtonProps {
  variant?: ButtonVariant;
}

function Button({ variant = ButtonVariants.PRIMARY }: ButtonProps) {
  // Use variant...
}
```

## Conclusion

The Type-Value Pattern bridges the gap between TypeScript's static type system and JavaScript's runtime, providing both compile-time safety and runtime expressiveness. By consistently applying this pattern, we reduce errors from type mismatches and create more maintainable code.
