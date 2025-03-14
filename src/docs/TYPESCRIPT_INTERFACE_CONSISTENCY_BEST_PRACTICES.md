# TypeScript Interface Consistency Best Practices

## Problem

Interface inconsistencies between components and hooks cause TypeScript errors like:

```typescript
error TS2339: Property 'applyAutoFix' does not exist on type '{ isLoading: boolean; tokens: number; ... }'.
error TS2339: Property 'submitQuestion' does not exist on type '{ isLoading: boolean; ... }'.
```

These errors indicate that components expect properties that aren't available in the hook return type.

## Root Cause Analysis (5 Whys)

1. **Why do interface inconsistencies occur?**  
   Components require properties that aren't being exposed by the hooks they consume.

2. **Why are hooks missing expected properties?**  
   Hooks were refactored or updated without synchronizing all dependent components.

3. **Why aren't hook interfaces and components synchronized?**  
   No strict contract enforcement exists between hooks and their consumers.

4. **Why isn't contract enforcement in place?**  
   The codebase lacks explicit interface definitions or a centralized approach to interface management.

5. **Why isn't interface management prioritized?**  
   Interface design and maintenance may not be recognized as a critical aspect of the architecture, or there's insufficient testing of interface contracts.

## Solution Patterns

### 1. Explicit Interface Definitions

Define explicit interfaces for hook returns and use them consistently:

```typescript
// Define the interface
export interface AssistantHookResult {
  // Core functionality
  question: string;
  setQuestion: (question: string) => void;
  response: string;
  submitQuestion: (questionText?: string) => Promise<string>;
  
  // Loading states
  isLoading: boolean;
  isAnalyzing: boolean;
  isFixing: boolean;
  
  // Feature-specific properties
  suggestions: AssistantSuggestion[];
  applyFix: (suggestion: AssistantSuggestion) => Promise<boolean>;
  applyAutoFix: (suggestion: AssistantSuggestion) => Promise<boolean>;
  // ... other properties
}

// Use the interface in the hook
export function useAssistant(props: UseAssistantProps = {}): AssistantHookResult {
  // Implementation
  return {
    question,
    setQuestion,
    response,
    submitQuestion,
    // ... ensure ALL properties defined in interface are returned
  };
}

// Type checking in components
const { submitQuestion, applyAutoFix }: AssistantHookResult = useAssistant();
```

### 2. Hook Evolution Pattern

When evolving a hook's interface:

1. **Add, don't replace** - Add new properties alongside existing ones for backward compatibility
2. **Use aliases** - Provide property aliases to support both old and new naming conventions
3. **Deprecate with comments** - Mark deprecated properties with JSDoc comments
4. **Version hooks** - For major changes, consider versioning hooks (e.g., `useAssistantV2`)

```typescript
return {
  // Original property
  loading: isLoading, 
  // New property (preferred name)
  isLoading, 
  // Deprecated property - will eventually be removed
  /** @deprecated Use 'data' instead */
  response: data,
  // Current property
  data
};
```

### 3. Interface-First Development

Design interfaces before implementation:

1. Define the hook's interface based on consumer needs
2. Create mock implementations for testing
3. Implement the hook to satisfy the interface
4. Verify all consumers work with the implementation

### 4. Contract Testing

Create tests that verify interface contracts:

```typescript
describe('useAssistant interface contract', () => {
  it('should expose all required properties', () => {
    const result = renderHook(() => useAssistant()).result.current;
    
    // Assert every expected property exists
    expect(result).toHaveProperty('submitQuestion');
    expect(result).toHaveProperty('applyAutoFix');
    expect(typeof result.submitQuestion).toBe('function');
    expect(typeof result.applyAutoFix).toBe('function');
  });
});
```

### 5. Breaking Change Management

When breaking changes are necessary:

1. Communicate changes clearly in commit messages and documentation
2. Use TypeScript's strict mode to catch interface violations early
3. Provide migration guides for updating components
4. Consider codemods to automate updates across the codebase

## Common Pitfalls

### 1. Implicit Return Types

❌ **Bad**: Relying on inferred return types
```typescript
// Return type is inferred and can silently change
function useAssistant() {
  // ...
  return { /* properties might change */ };
}
```

✅ **Good**: Explicit return type
```typescript
function useAssistant(): AssistantHookResult {
  // TypeScript will error if return doesn't match interface
  return { /* must match AssistantHookResult */ };
}
```

### 2. Inconsistent Property Naming

❌ **Bad**: Mixing naming conventions
```typescript
return {
  isLoading: true,  // "is" prefix
  loading: false,   // no prefix
  dataFetched: true // past tense
};
```

✅ **Good**: Consistent naming
```typescript
return {
  isLoading: true,
  isReady: false,
  isDataFetched: true
};
```

### 3. Silent Interface Extensions

❌ **Bad**: Adding properties without updating interfaces
```typescript
// The interface doesn't include the new property
interface AssistantResult {
  data: any;
}

// The implementation adds a property not in the interface
function useAssistant(): AssistantResult {
  return {
    data: {},
    newFeature: () => {} // Not in interface!
  };
}
```

✅ **Good**: Update interfaces when adding properties
```typescript
interface AssistantResult {
  data: any;
  newFeature: () => void;
}
```

## Best Practices Summary

1. **Define explicit interfaces** for hook returns
2. **Use consistent naming conventions** across hooks
3. **Version hooks** when making breaking changes
4. **Test interface contracts** to catch regressions
5. **Document interface evolution** with JSDoc and change logs
6. **Maintain backward compatibility** when possible
7. **Use TypeScript's strict mode** to catch interface violations
8. **Centralize interface definitions** for related functionality
9. **Audit interfaces periodically** to identify and refactor inconsistencies
10. **Create migration guides** for breaking changes

By following these best practices, you'll reduce interface-related errors and improve the maintainability of your codebase.
