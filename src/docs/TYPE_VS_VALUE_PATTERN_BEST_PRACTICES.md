# Type vs. Value Pattern Best Practices

## Problem

TypeScript errors like these indicate confusion between types and values:

```typescript
error TS2693: 'DeviceCapability' only refers to a type, but is being used as a value here.
error TS2367: This comparison appears to be unintentional because the types have no overlap.
```

These errors occur when code attempts to use TypeScript types as runtime values, or when comparing values against types.

## Root Cause Analysis (5 Whys)

1. **Why do type vs. value errors occur?**  
   Code is attempting to use TypeScript types at runtime, but types are erased during compilation.

2. **Why are types being used as values?**  
   Developers might not clearly distinguish between TypeScript's type system (compile-time) and JavaScript's value system (runtime).

3. **Why is this distinction confusing?**  
   TypeScript's syntax allows similar constructs for both types and values, making it easy to confuse them.

4. **Why doesn't TypeScript prevent this automatically?**  
   TypeScript's type erasure means it can't automatically generate runtime equivalents for all type definitions.

5. **Why isn't a consistent pattern used?**  
   The codebase lacks a standardized approach for maintaining parallel type and value definitions.

## Solution Pattern: Mirror Types with Runtime Constants

Create parallel definitions for types (compile-time) and values (runtime):

```typescript
// ✅ GOOD PATTERN: Type + Runtime Constants

// TypeScript type (compile-time only)
export type DeviceCapability = 'low' | 'medium' | 'high';

// Runtime constants (available at runtime)
export const DeviceCapabilities = {
  LOW: 'low' as DeviceCapability,
  MEDIUM: 'medium' as DeviceCapability,
  HIGH: 'high' as DeviceCapability
} as const;

// Type derived from constants (ensures they stay in sync)
export type DeviceCapabilityType = typeof DeviceCapabilities[keyof typeof DeviceCapabilities];

// Usage
function setCapability(capability: DeviceCapability) {
  // Type checking works here (compile-time)
}

// Comparison with constants (runtime)
if (currentCapability === DeviceCapabilities.HIGH) {
  enableHighPerformanceMode();
}
```

## Implementation Examples

### Enum-like Pattern

```typescript
// 1. Define the type
export type AlertType = 'info' | 'warning' | 'error' | 'success';

// 2. Define runtime constants
export const AlertTypes = {
  INFO: 'info' as AlertType,
  WARNING: 'warning' as AlertType,
  ERROR: 'error' as AlertType,
  SUCCESS: 'success' as AlertType
} as const;

// Usage:
function showAlert(type: AlertType, message: string) {
  // Implementation
}

// Runtime comparison (correct)
if (alertType === AlertTypes.ERROR) {
  logToErrorSystem();
}
```

### For Performance Monitoring Context

```typescript
// Types (compile-time)
export type PerformanceMode = 'quality' | 'balanced' | 'performance';
export type RenderFrequency = 'low' | 'medium' | 'high' | 'excessive';
export type DeviceCapability = 'low' | 'medium' | 'high';

// Runtime constants (available at runtime)
export const PerformanceModes = {
  QUALITY: 'quality' as PerformanceMode,
  BALANCED: 'balanced' as PerformanceMode,
  PERFORMANCE: 'performance' as PerformanceMode
} as const;

export const RenderFrequencies = {
  LOW: 'low' as RenderFrequency,
  MEDIUM: 'medium' as RenderFrequency,
  HIGH: 'high' as RenderFrequency,
  EXCESSIVE: 'excessive' as RenderFrequency
} as const;

export const DeviceCapabilities = {
  LOW: 'low' as DeviceCapability,
  MEDIUM: 'medium' as DeviceCapability,
  HIGH: 'high' as DeviceCapability
} as const;

// Example usage in a component
if (deviceCapability === DeviceCapabilities.LOW) {
  disableAnimations();
}

// For comparisons
switch (renderFrequency) {
  case RenderFrequencies.EXCESSIVE:
    optimizeRendering();
    break;
  case RenderFrequencies.HIGH:
    monitorPerformance();
    break;
  // ...
}
```

## Common Errors & Solutions

### Error: Type used as value

```typescript
// ❌ ERROR: Type used as value
if (deviceCapability === DeviceCapability.HIGH) {
  // Error: 'DeviceCapability' only refers to a type, but is being used as a value here
}

// ✅ SOLUTION: Use the runtime constant
if (deviceCapability === DeviceCapabilities.HIGH) {
  // Works correctly
}
```

### Error: String literal compared to type

```typescript
// ❌ ERROR: Comparing to the type itself
if (issueType === 'pattern' || issueType === 'render') {
  // Error: This comparison appears to be unintentional because the types have no overlap.
}

// ✅ SOLUTION: Define runtime constants
export const IssueTypes = {
  PATTERN: 'pattern',
  SECURITY: 'security',
  RENDER: 'render'
} as const;

// Then use constants for comparisons
if (issueType === IssueTypes.PATTERN || issueType === IssueTypes.RENDER) {
  // Works correctly
}
```

### Error: Type used in switch case

```typescript
// ❌ ERROR: Using type in switch case
switch (performanceMode) {
  case PerformanceMode.QUALITY:
    // Error: 'PerformanceMode' only refers to a type, but is being used as a value here
    break;
}

// ✅ SOLUTION: Use constants in switch
switch (performanceMode) {
  case PerformanceModes.QUALITY:
    // Works correctly
    break;
}
```

## Validation Helpers

Create helper functions to validate values against types:

```typescript
export function isValidDeviceCapability(value: string): value is DeviceCapability {
  return Object.values(DeviceCapabilities).includes(value as any);
}

// Usage
function setDeviceCapability(value: string) {
  if (isValidDeviceCapability(value)) {
    // value is now typed as DeviceCapability
    configureForCapability(value);
  } else {
    throw new Error(`Invalid device capability: ${value}`);
  }
}
```

## Factory Functions

Create factory functions for type-safe object creation:

```typescript
export interface PerformanceConfig {
  mode: PerformanceMode;
  deviceCapability: DeviceCapability;
  // ...other properties
}

export function createPerformanceConfig(
  mode: string, 
  deviceCapability: string
): PerformanceConfig {
  // Validate inputs
  if (!Object.values(PerformanceModes).includes(mode as any)) {
    throw new Error(`Invalid performance mode: ${mode}`);
  }
  
  if (!Object.values(DeviceCapabilities).includes(deviceCapability as any)) {
    throw new Error(`Invalid device capability: ${deviceCapability}`);
  }
  
  return {
    mode: mode as PerformanceMode,
    deviceCapability: deviceCapability as DeviceCapability
  };
}
```

## Best Practices Summary

1. **Mirror types with runtime constants** to enable both type checking and runtime comparisons
2. **Use consistent naming conventions** - plural for constants (e.g., `DeviceCapabilities`), singular for types (e.g., `DeviceCapability`)
3. **Create type guards** to validate values against types
4. **Use factory functions** for creating type-safe objects from possibly invalid inputs
5. **Export both types and constants** from the same module to keep them in sync
6. **Define types from constants** when possible to ensure they stay aligned
7. **Use `as const`** assertion to get precise types from constant objects
8. **Comment relationships** between types and constants to clarify their connection
9. **Prefer union types** (`type Status = 'active' | 'inactive'`) over enums for simpler mirror pattern
10. **Create validation utilities** for runtime type checking

By implementing these patterns, you'll eliminate type/value confusion errors and create a more maintainable codebase with both compile-time type safety and runtime type validation.
