
# Module Imports Best Practices

## Problem

Incorrect or inconsistent imports lead to TypeScript errors like:

```
Module '"@/utils/performance/PerformanceMonitor"' has no exported member 'ComponentMetrics'.
Did you mean to use 'import ComponentMetrics from "@/utils/performance/PerformanceMonitor"' instead?
```

or

```
File name '/dev-server/src/utils/performance/PerformanceMonitor.ts' differs from already included file name 
'/dev-server/src/utils/performance/performanceMonitor.ts' only in casing.
```

## Root Cause

Import issues arise from several sources:
1. **File Casing Inconsistency**: Different import paths with the same name but different casing
2. **Missing or Incorrect Exports**: Trying to import members that aren't properly exported
3. **Type vs Value Imports**: Importing types incorrectly or using them as values
4. **Barrel File Misuse**: Inconsistent or incomplete re-exports in barrel files
5. **Path Aliasing Confusion**: Mixing absolute and relative imports

## Solution Patterns

### 1. File Naming and Casing Conventions

Adopt and strictly enforce a consistent file naming convention:

```typescript
// CORRECT: All lowercase with hyphens for multi-word filenames
// performance-monitor.ts, user-profile.tsx

// AVOID: Mixed case or inconsistent styles
// PerformanceMonitor.ts vs performanceMonitor.ts
```

### 2. Proper Type Exports and Imports

Use explicit type exports and imports:

```typescript
// For exporting types
export type ComponentMetrics = {
  // ...
};

// For importing types
import type { ComponentMetrics } from './types';

// OR use the new 'type' modifier
import { type ComponentMetrics } from './types';
```

### 3. Re-Export Pattern for Types

Create dedicated type files with proper re-exports:

```typescript
// types.ts
export type { ComponentMetrics } from './metrics';
export type { PerformanceConfig } from './config';

// Import all types from a single source
import type { ComponentMetrics, PerformanceConfig } from './types';
```

### 4. Export/Import Strategy

Always be explicit about what you're exporting and importing:

```typescript
// AVOID: Default exports for complex objects
export default {
  ComponentMetrics,
  PerformanceConfig
};

// BETTER: Named exports for better discoverability
export { ComponentMetrics };
export { PerformanceConfig };

// BEST: Type annotations for values, type exports for types
export const ComponentMetrics: MetricsType = { /* ... */ };
export type PerformanceConfig = { /* ... */ };
```

### 5. Barrel Files (index.ts)

Use barrel files for clean imports, but be careful with circular dependencies:

```typescript
// types/index.ts
export * from './metrics';
export * from './config';

// Import from the barrel file
import { ComponentMetrics } from '@/types';
```

### 6. Path Alias Consistency

Use consistent path aliases throughout the project:

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}

// CONSISTENT: Always use the same pattern for similar imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// AVOID: Mixing relative and aliased paths
import { Button } from '@/components/ui/button';
import { Input } from '../../components/ui/input';
```

### 7. Type vs Value Imports

Separate type and value imports clearly:

```typescript
// CLEAR: Separate type and value imports
import type { UserProfile } from '@/types';
import { fetchUserProfile } from '@/api';

// ALSO GOOD: Use the `type` modifier
import { type UserProfile } from '@/types';
import { fetchUserProfile } from '@/api';
```

### 8. Module Interface Pattern

Create clear module interfaces:

```typescript
// performanceMonitor.ts
export interface PerformanceMonitor {
  trackComponent(name: string, renderTime: number): void;
  getMetrics(): ComponentMetrics[];
}

// Create and export the singleton instance
export const performanceMonitor: PerformanceMonitor = {
  // Implementation...
};

// Import and use the singleton
import { performanceMonitor } from './performanceMonitor';
performanceMonitor.trackComponent('MyComponent', 1.5);
```

### 9. Default Export Caution

Be careful with default exports:

```typescript
// PROBLEMATIC: Default export with separate types
export type ComponentMetrics = { /* ... */ };
export default class PerformanceMonitor { /* ... */ }

// BETTER: Named exports for everything
export type ComponentMetrics = { /* ... */ };
export class PerformanceMonitor { /* ... */ }
export const performanceMonitor = new PerformanceMonitor();
```

### 10. Troubleshooting Guide

When facing import errors:

1. **Check file existence**: Ensure the file exists at the imported path
2. **Check exports**: Verify the member is actually exported
3. **Check casing**: Verify that the file name casing matches exactly
4. **Check circular dependencies**: Look for circular import chains
5. **Check barrel files**: Ensure barrel files correctly re-export needed members

## Best Practices Checklist

When creating new modules or modifying imports:

- [ ] Use consistent file naming conventions
- [ ] Be explicit about exporting types vs values
- [ ] Use path aliases consistently
- [ ] Avoid default exports for complex objects
- [ ] Properly document exported members
- [ ] Use barrel files for cleaner imports
- [ ] Check for circular dependencies

Following these practices will greatly reduce import-related errors and improve code maintainability.
