
# TypeScript Type vs Value Best Practices

## Problem

One of the most common sources of TypeScript errors in our application is confusing **types** (which exist only at compile time) with **values** (which exist at runtime). This confusion leads to errors like:

```typescript
// ERROR: 'DeviceCapability' only refers to a type, but is being used as a value here.
if (capability === DeviceCapability.HIGH) { ... }
```

## Root Cause

TypeScript's type system is erased at compile time. Types, interfaces, and type aliases don't exist in the JavaScript runtime. When you try to use a type name directly in your code as if it were a value, TypeScript reports this error.

## Solution Pattern

For any concept that needs to exist as both a type and a value, always create both:

1. **Type Definition** (for type checking)
2. **Runtime Value Equivalent** (for runtime usage)

## Example

### ❌ Incorrect Approach (Type Only)

```typescript
// Types.ts
export type DeviceCapability = 'low' | 'medium' | 'high';

// Usage.ts - ERROR
if (capability === DeviceCapability.HIGH) { ... }
```

### ✅ Correct Approach (Type + Value)

```typescript
// Types.ts
// Define the type
export type DeviceCapability = 'low' | 'medium' | 'high';

// Define runtime constants (values)
export const DeviceCapabilities = {
  LOW: 'low' as DeviceCapability,
  MEDIUM: 'medium' as DeviceCapability,
  HIGH: 'high' as DeviceCapability
};

// Usage.ts - CORRECT
if (capability === DeviceCapabilities.HIGH) { ... }
```

## Alternate Pattern: Enums

TypeScript enums can sometimes be used to solve this problem as they create both a type and value:

```typescript
// Types.ts
export enum DeviceCapability {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// Usage.ts - CORRECT
if (capability === DeviceCapability.HIGH) { ... }
```

However, we prefer the first approach because:
- It results in more predictable compiled JavaScript
- It gives more explicit control over the type and value representation
- It avoids some of the pitfalls of TypeScript enums

## Type vs Value Checklist

When creating a new concept in the system, ask yourself:
- Do I need this as a type only? (use `type` or `interface`)
- Do I need this as a value only? (use `const`)
- Do I need both? (use the pattern above)

By consistently following this pattern, we can eliminate a whole class of TypeScript errors in our codebase.
