
# Enum Pattern Best Practices

## Problem

TypeScript errors related to enums and type/value confusion are common in our codebase:

```typescript
// ERROR: 'DeviceCapability' only refers to a type, but is being used as a value here.
if (capability === DeviceCapability.HIGH) { ... }
```

## Root Cause Analysis (5 Whys)

1. **Why are we seeing this error?**  
   Because we're trying to use a type (compile-time entity) as a value (runtime entity).

2. **Why are we using types as values?**  
   Because for conceptual entities like enums, we need both type-checking and runtime values.

3. **Why is there confusion between types and values?**  
   Because TypeScript's type system is erased at runtime, but many developers expect type names to have runtime equivalents.

4. **Why do developers expect this behavior?**  
   Because in many strongly-typed languages (like C#, Java), enums exist both at compile-time and runtime.

5. **Why isn't there a standard pattern in our codebase?**  
   Because we haven't established clear guidelines for handling this common pattern.

## Solution: The Enum Pattern

Implement a consistent pattern for concepts that need both types and values:

### 1. Define Both Types and Values

For each conceptual "enum", define:
1. A **type** (for compile-time type checking)
2. A **constant object** (for runtime value usage)

```typescript
// Define the type
export type DeviceCapability = 'low' | 'medium' | 'high';

// Define the runtime values
export const DeviceCapabilities = {
  LOW: 'low' as DeviceCapability,
  MEDIUM: 'medium' as DeviceCapability,
  HIGH: 'high' as DeviceCapability
} as const;
```

### 2. Use Type-Guards for Runtime Checking

```typescript
// Type guard for runtime validation
export function isDeviceCapability(value: string): value is DeviceCapability {
  return Object.values(DeviceCapabilities).includes(value as DeviceCapability);
}

// Usage
function setCapability(capability: string) {
  if (isDeviceCapability(capability)) {
    // TypeScript knows capability is DeviceCapability here
    // Safe to use
  } else {
    // Handle invalid input
  }
}
```

### 3. Create APIs for Type-Safe Values

```typescript
// Function to get all possible values
export function getAllDeviceCapabilities(): DeviceCapability[] {
  return Object.values(DeviceCapabilities);
}

// Function to get a default value
export function getDefaultDeviceCapability(): DeviceCapability {
  return DeviceCapabilities.MEDIUM;
}
```

## Anti-Patterns to Avoid

### 1. Inconsistent Naming

❌ BAD: Confusing singular/plural or inconsistent casing
```typescript
export type deviceCapability = 'low' | 'medium' | 'high';
export const DeviceCapability = { ... }; // Confusing with the type name
```

✅ GOOD: Consistent, clear naming convention
```typescript
export type DeviceCapability = 'low' | 'medium' | 'high';
export const DeviceCapabilities = { ... }; // Clearly distinguished
```

### 2. Missing Type Safety

❌ BAD: Not ensuring runtime values match the type
```typescript
export const DeviceCapabilities = {
  LOW: 'low',    // Missing type assertion
  MEDIUM: 'med', // Doesn't match the type definition ('medium')
};
```

✅ GOOD: Ensuring type safety with assertions
```typescript
export const DeviceCapabilities = {
  LOW: 'low' as DeviceCapability,
  MEDIUM: 'medium' as DeviceCapability,
} as const; // Makes the object deeply readonly
```

### 3. Using TypeScript Enums Inconsistently

Avoid mixing our enum pattern with TypeScript's built-in enums:

❌ BAD: Mixing patterns
```typescript
// File A
export enum Priority { LOW, MEDIUM, HIGH }

// File B
export type Status = 'pending' | 'active' | 'completed';
export const Statuses = { PENDING: 'pending' as Status, ... };
```

✅ GOOD: Consistent pattern application
```typescript
// File A
export type Priority = 'low' | 'medium' | 'high';
export const Priorities = { LOW: 'low' as Priority, ... };

// File B
export type Status = 'pending' | 'active' | 'completed';
export const Statuses = { PENDING: 'pending' as Status, ... };
```

## Best Practices Summary

1. **Always create both** type definitions and runtime constants for enum-like concepts
2. **Use consistent naming**: `TypeName` for the type, `TypeNames` for the values object
3. **Add type assertions** to ensure runtime values match the type definitions
4. **Create type guards** for runtime validation of values
5. **Document with JSDoc** to explain the purpose and usage
6. **Add helper functions** for common operations on the enum
7. **Use `as const`** to make objects deeply readonly
8. **Prefer string literals** for better debugging and serialization

By following these guidelines, we'll eliminate a whole class of common TypeScript errors while maintaining runtime type safety and developer ergonomics.
