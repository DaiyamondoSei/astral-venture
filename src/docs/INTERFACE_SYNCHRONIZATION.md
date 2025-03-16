# Interface Synchronization Best Practices

## Problem

Interfaces between components often drift apart, leading to runtime errors:

```
Property 'energyPoints' does not exist on type 'VisualizationProps'
Property 'submitQuestion' does not exist on type '{ isLoading: boolean; ... }'
```

These errors occur because there's a mismatch between what providers export and what consumers expect.

## Solution: Interface Synchronization Pattern

The Interface Synchronization pattern ensures interfaces stay in sync by:

1. Defining a **single source of truth** for each interface
2. Using **barrel files** (`index.ts`) to centralize exports
3. Implementing the **adapter pattern** for protected components

## Implementation Guidelines

### 1. Single Source of Truth

For each concept, define one authoritative interface:

```typescript
// src/types/visualization.ts
export interface VisualizationProps {
  energyPoints: number;
  activatedChakras: number[];
  onVisualizationRendered?: () => void;
}

// src/components/Visualization.tsx
import { VisualizationProps } from '@/types/visualization';

export const Visualization: React.FC<VisualizationProps> = ({
  energyPoints,
  activatedChakras,
  onVisualizationRendered
}) => {
  // ...
};
```

### 2. Barrel Files (index.ts)

Create index files to centralize exports:

```typescript
// src/utils/performance/index.ts
export * from './constants';
export * from './types';
export * from './metrics';
export * from './monitoring';

// Importing elsewhere
import { 
  PerformanceConfig, 
  trackPerformance 
} from '@/utils/performance';
```

### 3. Adapter Pattern for Protected Components

When you can't modify a component, create an adapter:

```typescript
// src/adapters/visual-system/types.ts
export interface VisualSystemProps {
  // Define all required properties
}

// src/adapters/visual-system/adapter.ts
import { VisualSystemProps } from './types';

// Create a function to adapt to the expected interface
export function createVisualSystemProps(props: Partial<VisualSystemProps>): VisualSystemProps {
  return {
    // Provide defaults and transform as needed
  };
}

// Usage in consuming component
import { createVisualSystemProps } from '@/adapters/visual-system/adapter';

function MyComponent() {
  // Use the adapter to ensure correct props
  const visualProps = createVisualSystemProps({
    // Your partial props
  });
  
  return <VisualSystem {...visualProps} />;
}
```

## Best Practices

### For API Interfaces

1. **Export Types Explicitly**:
   ```typescript
   // Export both the implementation and its type
   export { calculateBalance } from './balanceCalculator';
   export type { BalanceResult } from './balanceCalculator';
   ```

2. **Document Breaking Changes**:
   ```typescript
   /**
   * @deprecated Use `newFunction` instead.
   * Will be removed in v2.0.
   */
   export function oldFunction() { /* ... */ }
   ```

3. **Version Interfaces for Major Changes**:
   ```typescript
   // v1 interface
   export interface ApiResponseV1 { /* ... */ }
   
   // v2 interface with breaking changes
   export interface ApiResponseV2 { /* ... */ }
   ```

### For Hook Interfaces

1. **Define Explicit Return Types**:
   ```typescript
   export interface UseChakraResult {
     chakras: ChakraStatus[];
     activateChakra: (index: number) => void;
     deactivateChakra: (index: number) => void;
   }
   
   export function useChakra(): UseChakraResult {
     // Implementation
   }
   ```

2. **Maintain Backward Compatibility**:
   ```typescript
   // If renaming a property, keep the old name as an alias
   return {
     chakraStates: chakras,  // New name
     chakras,                // Old name for compatibility
     // ... other properties
   };
   ```

### For Component Interfaces

1. **Prefer Composition Over Inheritance**:
   ```typescript
   // Instead of extending component props
   export interface ButtonProps {
     // Base props
   }
   
   export interface IconButtonProps {
     // IconButton specific props
     icon: React.ReactNode;
     // Include button props via composition
     buttonProps?: ButtonProps;
   }
   ```

2. **Use Consistent Property Names**:
   ```typescript
   // Consistent naming across components
   interface Button1Props {
     onClick?: () => void;   // Use same name pattern
     isDisabled?: boolean;   // across all components
   }
   
   interface Button2Props {
     onClick?: () => void;   // Not "handleClick" or "onPress"
     isDisabled?: boolean;   // Not "disabled" or "isDisable"
   }
   ```

## Practical Application

1. **Audit Existing Interfaces**:
   - Identify which components have mismatched interfaces
   - Create single source of truth for each interface
   - Update implementations to match interfaces

2. **Create Adapter Layer**:
   - For components you can't modify, create adapters
   - Document adapter usage for other developers
   - Use type assertions carefully in adapters

3. **Implement Module Index Files**:
   - Create `index.ts` files for each logical module
   - Export all public interfaces from these files
   - Keep internal implementations private

4. **Add CI Validation**:
   - Add type-checking to CI pipeline
   - Create tests to verify interface conformance
   - Block merges that break interface contracts

By consistently applying these patterns, you'll eliminate a large class of interface-related errors and make your codebase more maintainable.
