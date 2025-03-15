
# Interface Synchronization Pattern

## Problem Statement

A significant source of TypeScript errors in our application stems from interfaces and their implementations getting out of sync over time. This manifests as errors like:

```typescript
// Error: Property 'enablePerformanceTracking' does not exist on type 'PerfConfig'
config.enablePerformanceTracking = true;
```

## Root Cause Analysis (5 Whys)

1. **Why do interfaces get out of sync?**
   - Interfaces and implementations are modified independently without updating both.

2. **Why are they modified independently?**
   - They exist in separate files, often in different directories.

3. **Why are they in separate files/directories?**
   - We follow a structure that separates type definitions from implementations.

4. **Why don't developers update both when making changes?**
   - There's no automated check to ensure interfaces and implementations stay synchronized.

5. **Why is there no automated check?**
   - We haven't established interface synchronization as a core architectural pattern with proper tooling.

## The Interface Synchronization Pattern

The Interface Synchronization Pattern ensures that interfaces and their implementations remain compatible throughout the development lifecycle.

### Implementation Approaches

#### 1. Single Source of Truth

Define interfaces in a central location and import them where needed:

```typescript
// In types/performance.ts (single source of truth)
export interface PerformanceConfig {
  enableTracking: boolean;
  samplingRate: number;
}

// In contexts/PerformanceContext.tsx
import { PerformanceConfig } from '@/types/performance';

// Implementation must match the interface
const defaultConfig: PerformanceConfig = {
  enableTracking: true,
  samplingRate: 0.1
};
```

#### 2. Interface Extension

Extend base interfaces when specialized implementations are needed:

```typescript
// Base interface
export interface BasePerformanceConfig {
  enableTracking: boolean;
}

// Extended for specific use case
export interface DetailedPerformanceConfig extends BasePerformanceConfig {
  samplingRate: number;
  reportingEndpoint: string;
}
```

#### 3. Runtime Validation

Add validation functions to verify implementations match interfaces:

```typescript
function validateConfig(config: unknown): config is PerformanceConfig {
  if (!config || typeof config !== 'object') return false;
  
  const typedConfig = config as Partial<PerformanceConfig>;
  return (
    typeof typedConfig.enableTracking === 'boolean' &&
    typeof typedConfig.samplingRate === 'number'
  );
}
```

### 4. Adapter Pattern for External Interfaces

When interfaces can't be directly modified (e.g., external libs or protected components), create adapter layers:

```typescript
// Original external interface we can't modify
interface ExternalConfig {
  tracking_enabled: boolean;
  sampling_rate: number;
}

// Our internal interface
interface InternalConfig {
  enableTracking: boolean;
  samplingRate: number;
}

// Adapter function
function adaptExternalConfig(external: ExternalConfig): InternalConfig {
  return {
    enableTracking: external.tracking_enabled,
    samplingRate: external.sampling_rate
  };
}
```

## Best Practices

### 1. Interface Naming Conventions

- **Base interfaces**: Use descriptive names without prefixes
- **Extended interfaces**: Use adjectives to describe specialization
- **Implementation types**: Use the same name with a suffix (e.g., `Props` vs `PropsImpl`)

### 2. Documentation

Document interface relationships and extension patterns:

```typescript
/**
 * Base performance configuration interface
 * @see DetailedPerformanceConfig for extended version
 * @see RuntimePerformanceConfig for runtime implementation
 */
export interface PerformanceConfig {
  // ...
}
```

### 3. Validation

Add runtime validation, especially for data from external sources:

```typescript
export function isValidPerformanceConfig(
  config: unknown
): config is PerformanceConfig {
  // Implementation
}
```

### 4. Default Implementations

Provide default implementations of interfaces:

```typescript
export const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  enableTracking: true,
  samplingRate: 0.1
};
```

### 5. Interface Versioning

When interfaces must change dramatically, consider versioning:

```typescript
// Original interface (kept for backward compatibility)
export interface PerformanceConfigV1 {
  enableTracking: boolean;
}

// New interface with additional properties
export interface PerformanceConfigV2 extends PerformanceConfigV1 {
  samplingRate: number;
  metricsBuffer: number;
}
```

### 6. Conversion Utilities

Provide utilities to convert between different interface versions or representations:

```typescript
export function upgradeConfigToV2(v1: PerformanceConfigV1): PerformanceConfigV2 {
  return {
    ...v1,
    samplingRate: 0.1,
    metricsBuffer: 1000
  };
}
```

## Implementation Checklist

When implementing the Interface Synchronization pattern:

- [ ] Define base interfaces in a central location
- [ ] Use extension for specialized interfaces
- [ ] Document relationships between interfaces
- [ ] Provide default implementations
- [ ] Add runtime validation where needed
- [ ] Create adapters for external interfaces
- [ ] Add conversion utilities between interface versions
- [ ] Consider interface versioning for major changes

By following these practices, we can reduce type errors and ensure that interfaces and implementations remain synchronized throughout the application's lifecycle.
