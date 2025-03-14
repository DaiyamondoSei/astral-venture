
# TypeScript Type vs Value Best Practices

## The Problem: Type vs Value Confusion

One of the most common sources of errors in TypeScript applications is the confusion between types (which exist only at compile time) and values (which exist at runtime). This document outlines best practices to avoid these issues.

## 5 Whys Analysis

### Why do we get "X only refers to a type, but is being used as a value here" errors?

1. **Why do type/value errors occur?**  
   TypeScript types only exist at compile time and are erased at runtime, but developers try to use them as values.

2. **Why do developers try to use types as values?**  
   Lack of clear distinction between types and runtime values, especially for enums and constants.

3. **Why is the distinction unclear?**  
   The same identifiers are often used for both types and values without proper patterns.

4. **Why aren't proper patterns used?**  
   No established convention for creating parallel type and value definitions.

5. **Why no established conventions?**  
   Insufficient documentation and enforcement of type/value separation patterns in the codebase.

## Best Practices

### 1. Create Runtime Equivalents for Types

For any type that needs to be used at runtime, create a parallel constant:

```typescript
// Type (compile-time only)
export type DeviceCapability = 'low' | 'medium' | 'high';

// Runtime constant (available at runtime)
export const DeviceCapabilities = {
  LOW: 'low' as DeviceCapability,
  MEDIUM: 'medium' as DeviceCapability,
  HIGH: 'high' as DeviceCapability
};

// Usage
// Type usage (compile-time)
const capability: DeviceCapability = 'high';

// Value usage (runtime)
if (currentCapability === DeviceCapabilities.HIGH) {
  enableHighPerformanceMode();
}
```

### 2. Use Const Assertions with Literal Types

Use `as const` to create type-safe constants:

```typescript
export const ALERT_TYPES = {
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  INFO: 'info'
} as const;

// Derive the type from the constant
export type AlertType = typeof ALERT_TYPES[keyof typeof ALERT_TYPES];

// Usage
function showAlert(type: AlertType, message: string) {
  // Implementation
}

// Correct usage
showAlert(ALERT_TYPES.SUCCESS, 'Operation completed');

// TypeScript error - 'invalid' is not an AlertType
showAlert('invalid', 'This will fail type checking');
```

### 3. Handling Enums

While TypeScript enums do exist at runtime, consider using the union type + const pattern instead:

```typescript
// Not recommended: traditional enum
enum Direction {
  Up,
  Down,
  Left,
  Right
}

// Recommended: union type + const
export const Directions = {
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right'
} as const;

export type Direction = typeof Directions[keyof typeof Directions];
```

### 4. Factory Functions for Type Safety

Create factory functions that enforce type safety at runtime:

```typescript
type UserId = string & { __brand: 'UserId' };

// Factory that validates at runtime
function createUserId(id: string): UserId {
  if (!/^user_[a-z0-9]{24}$/.test(id)) {
    throw new Error('Invalid user ID format');
  }
  return id as UserId;
}

// Usage
const validId = createUserId('user_abc123'); // ✓ Works
const invalidId = createUserId('invalid'); // ✗ Runtime error
```

### 5. Type Guards for Runtime Type Checking

Use type guards to validate types at runtime:

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

// Type guard
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'email' in value &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.email === 'string'
  );
}

// Usage
function processUser(data: unknown) {
  if (isUser(data)) {
    // TypeScript knows data is a User here
    console.log(data.name);
  }
}
```

### 6. Consistent Naming Conventions

Use clear naming conventions to distinguish types from values:

```typescript
// Types are PascalCase
export type UserRole = 'admin' | 'editor' | 'viewer';

// Constants are UPPER_CASE
export const USER_ROLES = {
  ADMIN: 'admin' as UserRole,
  EDITOR: 'editor' as UserRole,
  VIEWER: 'viewer' as UserRole
};

// Enum-like objects can use PascalCase with plural naming
export const HttpMethods = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE'
} as const;

export type HttpMethod = typeof HttpMethods[keyof typeof HttpMethods];
```

## Implementation Checklist

When creating types that will be used as values:

1. ✅ Define the type (using type or interface)
2. ✅ Create a parallel constant object with the same values
3. ✅ Use `as const` for literal types
4. ✅ Cast values to the type for extra safety
5. ✅ Follow consistent naming conventions
6. ✅ Create helper factory functions for complex types
7. ✅ Document the pattern for other developers

## Practical Example: Device Capability System

```typescript
// In types.ts
export type DeviceCapability = 'low' | 'medium' | 'high';
export type PerformanceMode = 'quality' | 'balanced' | 'performance';

// In constants.ts
import { DeviceCapability, PerformanceMode } from './types';

export const DeviceCapabilities = {
  LOW: 'low' as DeviceCapability,
  MEDIUM: 'medium' as DeviceCapability,
  HIGH: 'high' as DeviceCapability
};

export const PerformanceModes = {
  QUALITY: 'quality' as PerformanceMode,
  BALANCED: 'balanced' as PerformanceMode,
  PERFORMANCE: 'performance' as PerformanceMode
};

// Usage in component.tsx
import { DeviceCapability } from './types';
import { DeviceCapabilities } from './constants';

function optimizeForDevice(capability: DeviceCapability) {
  if (capability === DeviceCapabilities.LOW) {
    // Low-end device optimizations
  } else if (capability === DeviceCapabilities.MEDIUM) {
    // Medium-range device optimizations
  } else if (capability === DeviceCapabilities.HIGH) {
    // High-end device optimizations
  }
}
```

By following these patterns consistently throughout the codebase, we can eliminate type/value confusion errors and create more robust applications.
