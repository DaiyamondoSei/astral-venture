
# Type-Value Pattern Implementation Guide

## Overview

The Type-Value Pattern is a systematic approach to handling the distinction between TypeScript types (which exist at compile time) and JavaScript values (which exist at runtime). This pattern is crucial for ensuring type safety while providing runtime access to type information.

## Problem Solved

In TypeScript, types are erased during compilation. This leads to errors when you try to use types as values at runtime:

```typescript
// ERROR: 'DeviceCapability' only refers to a type, but is being used as a value here
if (device.capability === DeviceCapability.HIGH) { ... }
```

## Solution: The Type-Value Pattern

The Type-Value Pattern solves this by creating both a type definition (for compile-time type checking) and a corresponding constant object (for runtime usage):

```typescript
// Type definition for compile-time checking
export type DeviceCapability = 'low' | 'medium' | 'high';

// Constants for runtime usage
export const DeviceCapabilities = {
  LOW: 'low' as DeviceCapability,
  MEDIUM: 'medium' as DeviceCapability,
  HIGH: 'high' as DeviceCapability
} as const;
```

## Implementation Guidelines

1. **Define the Type**: Create a type definition, typically using literal types

2. **Define Constants**: Create constants with the same values, using type assertions

3. **Use Consistent Naming**:
   - Types: Singular form, PascalCase (e.g., `DeviceCapability`)
   - Constants: Plural form, PascalCase (e.g., `DeviceCapabilities`)
   - Values: UPPER_SNAKE_CASE (e.g., `HIGH`, `MEDIUM`, `LOW`)

4. **Add `as const`**: Always use `as const` on the constants object to ensure literal types

5. **Export Both**: Always export both the type and the constants

## Validation Context Example

Our validation system implements this pattern:

```typescript
// Type definition
export type ErrorSeverity = 'error' | 'warning' | 'info';

// Runtime constants
export const ErrorSeverities = {
  ERROR: 'error' as ErrorSeverity,
  WARNING: 'warning' as ErrorSeverity,
  INFO: 'info' as ErrorSeverity
} as const;
```

## Usage in Code

When using the pattern:

1. **For Type Annotations**: Use the type
   ```typescript
   function validateInput(severity: ErrorSeverity): void { ... }
   ```

2. **For Runtime Values**: Use the constants
   ```typescript
   if (validationResult.severity === ErrorSeverities.ERROR) { ... }
   ```

## Benefits

1. **Type Safety**: TypeScript ensures you only use valid values
2. **Runtime Access**: Constants are available for runtime comparison
3. **IntelliSense Support**: Editor provides autocomplete for both types and values
4. **Refactoring Support**: Renaming becomes safer with compiler checks

## Recommended Pattern for New Types

For any new type that needs runtime representation:

```typescript
// src/types/domain/example.ts
export type ExampleStatus = 'active' | 'pending' | 'completed';

export const ExampleStatuses = {
  ACTIVE: 'active' as ExampleStatus,
  PENDING: 'pending' as ExampleStatus,
  COMPLETED: 'completed' as ExampleStatus
} as const;
```

By following this pattern consistently throughout our codebase, we eliminate a whole class of TypeScript errors and create more maintainable, type-safe code.
