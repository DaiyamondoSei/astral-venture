
# Type vs Value Pattern Best Practices

## Problem

One of the most common sources of TypeScript errors is confusion between **types** (which exist only at compile time) and **values** (which exist at runtime). This leads to errors like:

```typescript
// ERROR: 'DeviceCapability' only refers to a type, but is being used as a value here.
if (capability === DeviceCapability.HIGH) { ... }
```

## Root Cause

TypeScript's type system is erased at compile time. Types, interfaces, and type aliases don't exist in the JavaScript runtime. When you try to use a type name directly in your code as if it were a value, TypeScript reports an error.

## Solution Pattern

For any concept that needs to exist as both a type and a value, always create both:

1. **Type Definition** (for type checking at compile time)
2. **Runtime Constants** (for runtime usage)

## Implementation

### Step 1: Define the Type

Define your type using TypeScript's type system:

```typescript
// Define type (for compile-time checking)
export type DeviceCapability = 'low' | 'medium' | 'high';
```

### Step 2: Create Runtime Constants

Create runtime constants that use the type:

```typescript
// Define constants (for runtime usage)
export const DeviceCapabilities = {
  LOW: 'low' as DeviceCapability,
  MEDIUM: 'medium' as DeviceCapability,
  HIGH: 'high' as DeviceCapability
};
```

### Step 3: Use Consistently

Use types for type annotations and constants for runtime operations:

```typescript
// Type usage (in type positions)
function setDeviceCapability(capability: DeviceCapability) {
  // Implementation
}

// Value usage (in value positions)
if (userDeviceCapability === DeviceCapabilities.HIGH) {
  enableHighPerformanceFeatures();
}
```

## File Organization

Group related types and values together:

```typescript
// types.ts - Type definitions
export type DeviceCapability = 'low' | 'medium' | 'high';
export type PerformanceMode = 'quality' | 'balanced' | 'performance';

// constants.ts - Runtime constants
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
```

## Backward Compatibility

When updating interfaces, maintain backward compatibility:

```typescript
// Original interface
interface AIResponseMeta {
  model: string;
  tokens: number;
  processingTime: number;
}

// Updated interface with backward compatibility
interface AIResponseMeta {
  model: string;
  tokenUsage?: number;  // New property name
  tokens?: number;      // Old property name (for backward compatibility)
  processingTime: number;
}

// Usage with backward compatibility
function getTokenUsage(meta: AIResponseMeta): number {
  return meta.tokenUsage ?? meta.tokens ?? 0;
}
```

## Common Pitfalls to Avoid

1. **Don't use type names in runtime expressions**:
   ```typescript
   // WRONG
   if (mode === PerformanceMode.HIGH) { ... }
   
   // CORRECT
   if (mode === PerformanceModes.HIGH) { ... }
   ```

2. **Don't confuse enum types with string union types**:
   ```typescript
   // Enum (creates both type and values)
   enum Direction { Up, Down, Left, Right }
   
   // String union (creates only type)
   type Direction = 'up' | 'down' | 'left' | 'right';
   ```

3. **Don't mix naming conventions for types and values**:
   ```typescript
   // CONFUSING (similar names)
   type UserRole = 'admin' | 'user' | 'guest';
   const UserRole = { ADMIN: 'admin', USER: 'user', GUEST: 'guest' };
   
   // BETTER (clearly distinguished names)
   type UserRole = 'admin' | 'user' | 'guest';
   const UserRoles = { ADMIN: 'admin', USER: 'user', GUEST: 'guest' };
   ```

## Type Checking

Use TypeScript's type system to enforce correct usage:

```typescript
// Runtime function that enforces type safety
function isValidDeviceCapability(value: unknown): value is DeviceCapability {
  return typeof value === 'string' && 
    ['low', 'medium', 'high'].includes(value);
}

function processCapability(capability: unknown) {
  if (isValidDeviceCapability(capability)) {
    // TypeScript knows capability is DeviceCapability here
    const level = capability; // Type is DeviceCapability
  }
}
```

By following these best practices, you'll avoid a whole class of TypeScript errors related to type/value confusion.
