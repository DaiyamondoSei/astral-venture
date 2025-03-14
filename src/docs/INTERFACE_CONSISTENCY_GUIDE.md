
# Interface Consistency Guide

## The Problem

Our codebase has suffered from interface inconsistency issues, particularly in interconnected components like the AI Assistant system. These issues manifest as TypeScript errors where components expect properties that aren't properly defined in their consuming hooks or parent components.

## 5 Whys Analysis

1. **Why do we have property-not-exist errors?**  
   Because components try to access properties that don't exist in the objects they receive.

2. **Why are these properties missing?**  
   Because the interfaces don't include all necessary properties needed by consumers.

3. **Why are interfaces incomplete?**  
   Because as components evolved, their interfaces weren't updated in sync.

4. **Why weren't interfaces kept in sync?**  
   Because we lacked a consistent pattern and process for maintaining interface consistency.

5. **Why is there no consistent process?**  
   Because we didn't establish clear ownership of interfaces and didn't implement a systematic approach to interface evolution.

## Best Practices for Interface Consistency

### 1. Single Source of Truth for Interfaces

Define all interface types in a centralized location, usually alongside the primary implementation:

```typescript
// useAssistant.tsx - defines the hook and its interface
export interface UseAssistantResult {
  isLoading: boolean;
  data: any;
  // ... all properties used by any consumer
}

// Components use the exported interface
import { UseAssistantResult } from './useAssistant';
```

### 2. Interface-First Development

Design interfaces before implementation:

1. Define the hook's interface based on consumer needs
2. Create the implementation to satisfy the interface
3. Verify all consumers work with the implementation

### 3. Comprehensive Interface Definition

When defining interfaces, include ALL properties that might be needed by consumers:

```typescript
export interface ComponentProps {
  // Required core properties
  id: string;
  
  // Optional enhancement properties
  onHover?: () => void;
  onFocus?: () => void;
  
  // Feature-specific properties
  analytics?: {
    trackClick?: boolean;
    eventName?: string;
  }
}
```

### 4. Interface Evolution Strategy

When evolving interfaces, follow these steps:

1. **Add New Properties as Optional**  
   New properties should be optional at first:
   ```typescript
   interface UserProfile {
     name: string;
     // New property added as optional
     preferences?: UserPreferences;
   }
   ```

2. **Support Legacy Properties**  
   Maintain backward compatibility with aliases:
   ```typescript
   interface AIResponse {
     tokenUsage: number;      // New property name
     tokens?: number;         // Old property name (kept for compatibility)
   }
   
   // In implementation
   return {
     tokenUsage: count,
     tokens: count,  // Support both old and new property names
   }
   ```

3. **Deprecation Strategy**  
   Signal deprecated properties with JSDoc comments:
   ```typescript
   interface ComponentProps {
     /**
      * @deprecated Use `onAction` instead
      */
     onClick?: () => void;
     
     /**
      * Replacement for onClick with more functionality
      */
     onAction?: (event: ActionEvent) => void;
   }
   ```

### 5. Contract Testing

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

### 6. Interface Synchronization Checklist

Before submitting code changes:

- [ ] Have you updated all relevant interfaces to include new properties?
- [ ] Are new properties properly documented with JSDoc comments?
- [ ] Have you maintained backward compatibility for existing consumers?
- [ ] Have you checked all components that consume this interface?
- [ ] Have you added appropriate type guards for complex interfaces?

## Implementation Example

Before:
```typescript
// Hook with incomplete interface
function useAssistant() {
  // Implementation...
  return {
    isLoading,
    data,
    // Missing properties that components need
  };
}

// Component expecting missing properties
function AIComponent() {
  const { isLoading, data, missingProperty } = useAssistant();
  // TypeScript error: Property 'missingProperty' does not exist...
}
```

After:
```typescript
// Comprehensive interface definition
export interface UseAssistantResult {
  isLoading: boolean;
  data: any;
  missingProperty: string;
  // All properties clearly defined
}

// Hook implementation matching interface
function useAssistant(): UseAssistantResult {
  // Implementation...
  return {
    isLoading,
    data,
    missingProperty: 'value',
  };
}

// Component using the properly defined interface
function AIComponent() {
  const { isLoading, data, missingProperty } = useAssistant();
  // No TypeScript errors
}
```

By following these practices, we can eliminate interface synchronization issues, improve code maintainability, and reduce runtime errors caused by missing properties.
