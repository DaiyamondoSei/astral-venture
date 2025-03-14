
# Module Import Best Practices

## Problem

Inconsistent or incorrect module imports cause TypeScript errors that are difficult to debug:

```typescript
// ERROR: Module '"@/utils/performance/PerformanceMonitor"' has no exported member 'ComponentMetrics'
import { ComponentMetrics } from '@/utils/performance/PerformanceMonitor';

// ERROR: File name '/path/to/PerformanceMonitor.ts' differs from already included file name '/path/to/performanceMonitor.ts'
```

## Root Cause Analysis (5 Whys)

1. **Why do import errors happen?**  
   Importing modules or types that don't exist or have different capitalization.

2. **Why do we import non-existent exports?**  
   Module interfaces change over time, or path casing differs across operating systems.

3. **Why do module interfaces change without updating imports?**  
   No consistent process for tracking cross-module dependencies.

4. **Why are there inconsistencies in file naming?**  
   Developers using different operating systems (case-sensitive vs. case-insensitive file systems).

5. **Why do file system differences matter?**  
   TypeScript treats differently-cased imports as different files, but some file systems don't.

## Solution Patterns

### 1. Export/Import Consistency

Always match exports with imports exactly:

```typescript
// Module file
export interface ComponentMetrics { /* ... */ }

// Importing file
import { ComponentMetrics } from './path/to/module';
```

### 2. Barrel Files for Complex Modules

Create index.ts files to unify and simplify imports:

```typescript
// src/utils/performance/index.ts
export * from './metrics';
export * from './tracking';
export * from './analysis';

// Importing file
import { ComponentMetrics, trackPerformance } from '@/utils/performance';
```

### 3. Consistent File Naming Convention

Use consistent kebab-case for file names to avoid case-sensitivity issues:

```
performance-monitor.ts   ✅
performanceMonitor.ts    ❌
PerformanceMonitor.ts    ❌
```

### 4. Type-Only Imports

Use type-only imports for better tree-shaking:

```typescript
// Only import types, not values
import type { ComponentMetrics } from './module';

// Import both types and values
import { doSomething } from './module';
import type { SomeType } from './module';
```

### 5. Absolute vs Relative Imports

- Use absolute imports (with `@/` prefix) for imports across different directories
- Use relative imports (`./` or `../`) for imports within the same directory

```typescript
// Different directory (absolute)
import { Button } from '@/components/ui/button';

// Same directory (relative)
import { ButtonProps } from './button-types';
```

### 6. Path Alias Configuration

Configure path aliases in tsconfig.json:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

### 7. Import Validation Tools

Use tools like ESLint with the `import` plugin to catch common import errors:

```json
{
  "rules": {
    "import/no-unresolved": "error",
    "import/named": "error",
    "import/namespace": "error",
    "import/default": "error",
    "import/export": "error"
  }
}
```

## Common Pitfalls to Avoid

### 1. Circular Dependencies

Avoid importing modules that import each other:

```typescript
// file1.ts ❌
import { something } from './file2';

// file2.ts ❌
import { somethingElse } from './file1';
```

### 2. Import * Antipattern

Avoid namespace imports that mask specific dependencies:

```typescript
// Avoid this ❌
import * as Utils from '@/utils';
Utils.formatDate();

// Prefer this ✅
import { formatDate } from '@/utils/date';
formatDate();
```

### 3. Case-Sensitivity Issues

Remember that import paths are case-sensitive, even on Windows:

```typescript
// These are different imports! ❌
import { Button } from '@/components/Button';
import { Button } from '@/components/button';
```

### 4. Missing Re-exports

When creating barrel files, ensure all needed exports are included:

```typescript
// Missing re-exports ❌
export { A, B } from './module';  // C is missing!

// Complete re-exports ✅
export * from './module';
// OR
export { A, B, C } from './module';
```

## Best Practices Checklist

- [ ] Use consistent naming conventions for files
- [ ] Create barrel files for complex modules
- [ ] Use path aliases for cleaner imports
- [ ] Use type-only imports where appropriate
- [ ] Avoid circular dependencies
- [ ] Export all relevant types and values
- [ ] Validate imports with linting tools
- [ ] Be mindful of case-sensitivity
- [ ] Update all imports when refactoring exports

Following these best practices will significantly reduce import-related errors in your TypeScript project.
