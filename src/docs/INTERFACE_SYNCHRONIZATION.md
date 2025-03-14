
# Interface Synchronization Best Practices

## Problem

One of the most common sources of TypeScript errors is the lack of synchronization between interfaces and their implementations, especially in hooks and components. This manifests as errors like:

```typescript
// Error: Property 'X' does not exist on type 'HookResult'
const { existingProp, missingProp } = useHook();
```

## 5 Whys Analysis

1. **Why do we have "property does not exist" errors?**  
   Because components are trying to access properties that don't exist in the objects they receive.

2. **Why are properties missing?**  
   Because interfaces don't include all properties that consumers need.

3. **Why are the interfaces incomplete?**  
   Because interfaces weren't updated when component requirements changed.

4. **Why weren't interfaces updated?**  
   Because there's no systematic approach to maintain interface consistency.

5. **Why is there no systematic approach?**  
   Because we lacked clear patterns and practices for interface evolution.

## Solution Pattern: Single Source of Truth for Interfaces

### Key Principles

1. **Define Explicit Interfaces**: Always create explicit interfaces for hook results and component props.

2. **Export Interfaces**: Export interfaces so consumers can import them:

   ```typescript
   // useFeature.tsx
   export interface UseFeatureResult {
     data: DataType;
     isLoading: boolean;
     error: string;
     refresh: () => Promise<void>;
   }
   
   export function useFeature(): UseFeatureResult {
     // Implementation
   }
   ```

3. **Use Interface-First Development**:
   - Design interfaces based on consumer needs first
   - Implement to satisfy the interface
   - Verify consumers work with implementation

4. **Include All Potential Properties**: Define all properties consumers might need:

   ```typescript
   export interface ButtonProps {
     // Core properties
     children: React.ReactNode;
     onClick?: () => void;
     
     // Visual variants
     variant?: 'primary' | 'secondary' | 'outline';
     size?: 'sm' | 'md' | 'lg';
     
     // States
     isLoading?: boolean;
     disabled?: boolean;
     
     // Advanced options
     fullWidth?: boolean;
     className?: string;
   }
   ```

5. **Maintain Backward Compatibility**:
   - Add new properties as optional
   - Keep old property names alongside new ones
   - Mark deprecated properties with JSDoc comments

   ```typescript
   interface ApiResponse {
     // New property name
     tokenUsage: number;
     
     /** @deprecated Use tokenUsage instead */
     tokens?: number;
   }
   
   // Implementation supports both
   return {
     tokenUsage: count,
     tokens: count,  // For backward compatibility
   };
   ```

### Implementation Checklist

When updating interfaces:

- [ ] Have you updated all relevant interfaces to include new properties?
- [ ] Are new properties properly documented with JSDoc comments?
- [ ] Have you maintained backward compatibility for existing consumers?
- [ ] Have you checked all components that consume this interface?
- [ ] Have you created proper TypeScript types for complex data structures?

### Interface Evolution Workflow

Follow this workflow when evolving interfaces:

1. **Identify Consumers**: List all components using the interface
2. **Document Requirements**: Gather all properties consumers need
3. **Update Interface**: Add new properties (as optional if appropriate)
4. **Update Implementation**: Ensure it provides all interface properties
5. **Test Consumers**: Verify all consumers work with updated interface
6. **Document Changes**: Add JSDoc comments, especially for deprecations
7. **Plan Migrations**: Create a plan to remove deprecated properties in future

By following these practices, you'll eliminate "property does not exist" errors and create a more maintainable, self-documenting codebase.
