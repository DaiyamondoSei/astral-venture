# Type-Value Pattern Best Practices

## Problem

TypeScript errors related to using types as values are common in our codebase:

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

## The Type-Value Pattern

To solve this problem, we've implemented the Type-Value Pattern throughout our codebase. This pattern:

1. Separates the **type definition** (for compile-time checking) from the **runtime values**
2. Creates a consistent naming convention to make the relationship clear
3. Uses type assertions to ensure the runtime values match the type definition

### Implementation Recipe

#### 1. Define the Type

First, define a type for compile-time checking:

```typescript
// Define the type (usually a union of string literals)
export type DeviceCapability = 'low' | 'medium' | 'high';
```

#### 2. Define the Runtime Values

Create a constant object with runtime values that match the type:

```typescript
// Define the runtime values
export const DeviceCapabilities = {
  LOW: 'low' as DeviceCapability,
  MEDIUM: 'medium' as DeviceCapability,
  HIGH: 'high' as DeviceCapability
} as const;
```

#### 3. Use Them Correctly

In your code, use the type for type annotations and the constant object for runtime values:

```typescript
// Type annotation uses the type
function setCapability(capability: DeviceCapability) {
  // Runtime value uses the constant object
  if (capability === DeviceCapabilities.HIGH) {
    enableHighPerformanceMode();
  }
}
```

### Advanced Patterns

#### Type Guards for Runtime Validation

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

#### Helper Functions

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

## Best Practices

### 1. Consistent Naming

Use a consistent naming convention to make the relationship between types and values clear:

✅ GOOD: Clear, consistent naming
```typescript
// Singular for the type
export type DeviceCapability = 'low' | 'medium' | 'high';

// Plural for the values object
export const DeviceCapabilities = { ... };
```

❌ BAD: Confusing, inconsistent naming
```typescript
export type deviceCapability = 'low' | 'medium' | 'high';
export const DeviceCapability = { ... }; // Confusing!
```

### 2. Type Safety

Ensure runtime values match the type definition:

✅ GOOD: Type-safe values
```typescript
export const DeviceCapabilities = {
  LOW: 'low' as DeviceCapability,
  MEDIUM: 'medium' as DeviceCapability,
} as const; // Makes the object deeply readonly
```

❌ BAD: Values don't match the type
```typescript
export const DeviceCapabilities = {
  LOW: 'low',    // Missing type assertion
  MEDIUM: 'med', // Doesn't match type definition ('medium')
};
```

### 3. File Organization

Group related types and values together:

✅ GOOD: Types and values together
```typescript
// file: types/performance/constants.ts
export type DeviceCapability = 'low' | 'medium' | 'high';
export type PerformanceMode = 'battery' | 'balanced' | 'performance';

// file: types/performance/runtime-constants.ts
import { DeviceCapability, PerformanceMode } from './constants';
export const DeviceCapabilities = { ... };
export const PerformanceModes = { ... };
```

❌ BAD: Types and values scattered
```typescript
// file: types.ts
export type DeviceCapability = 'low' | 'medium' | 'high';

// file: utils.ts
export const DeviceCapabilities = { ... };
```

### 4. Consistency Across the Codebase

Use the pattern consistently throughout the codebase:

✅ GOOD: Consistent pattern usage
```typescript
// File A
export type Priority = 'low' | 'medium' | 'high';
export const Priorities = { LOW: 'low' as Priority, ... };

// File B
export type Status = 'pending' | 'active' | 'completed';
export const Statuses = { PENDING: 'pending' as Status, ... };
```

❌ BAD: Mixed patterns
```typescript
// File A
export enum Priority { LOW, MEDIUM, HIGH }

// File B
export type Status = 'pending' | 'active' | 'completed';
export const Statuses = { PENDING: 'pending' as Status, ... };
```

## Real Examples from Our Codebase

### MetricType Example

```typescript
// types.ts
export type MetricType = 
  | 'render' 
  | 'interaction'
  | 'load'
  | 'memory'
  | 'network';

// constants.ts
import { MetricType } from './types';
export const MetricTypes = {
  RENDER: 'render' as MetricType,
  INTERACTION: 'interaction' as MetricType,
  LOAD: 'load' as MetricType,
  MEMORY: 'memory' as MetricType,
  NETWORK: 'network' as MetricType
} as const;

// usage.ts
import { MetricType } from './types';
import { MetricTypes } from './constants';

function trackMetric(type: MetricType, value: number) {
  if (type === MetricTypes.RENDER) {
    // Handle render metrics
  }
}
```

### GlassmorphicVariant Example

```typescript
// constants.ts
export type GlassmorphicVariant = 
  | 'default'
  | 'quantum'
  | 'ethereal' 
  | 'elevated';

// runtime-constants.ts
import { GlassmorphicVariant } from './constants';
export const GlassmorphicVariants = {
  DEFAULT: 'default' as GlassmorphicVariant,
  QUANTUM: 'quantum' as GlassmorphicVariant,
  ETHEREAL: 'ethereal' as GlassmorphicVariant,
  ELEVATED: 'elevated' as GlassmorphicVariant
} as const;

// GlassCard.tsx
import { GlassmorphicVariant } from './constants';
import { GlassmorphicVariants } from './runtime-constants';

interface GlassCardProps {
  variant?: GlassmorphicVariant;
  // Other props...
}

const GlassCard = ({ variant = GlassmorphicVariants.DEFAULT }: GlassCardProps) => {
  // Component implementation...
};
```

## Conclusion

By following the Type-Value Pattern consistently, we've eliminated a whole class of common TypeScript errors from our codebase while maintaining type safety and developer ergonomics. This pattern provides:

1. **Type safety** - Compile-time checking for valid values
2. **Runtime availability** - Values available at runtime for comparison
3. **Developer ergonomics** - Clear, autocomplete-friendly API
4. **Consistency** - Predictable pattern throughout the codebase

Remember: Types are for compile-time, constants are for runtime. Keep them synchronized using the Type-Value Pattern.
