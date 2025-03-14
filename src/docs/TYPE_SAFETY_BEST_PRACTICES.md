
# Type Safety Best Practices

This document outlines key best practices for maintaining type safety throughout the application to prevent the types of issues we've encountered.

## 1. Single Source of Truth for Types

### Issue
Multiple type definitions for the same concept (e.g., AIQuestion, AIResponse) caused inconsistencies and made it difficult to ensure type compatibility.

### Best Practices
- Define each entity type in a single location and import it where needed
- Use barrel files (index.ts) to re-export types from a central location
- Never duplicate type definitions across files
- For database entities, use generated types from the database schema

Example:
```typescript
// BAD: Duplicated types
// file1.ts
interface User { id: string; name: string; }

// file2.ts
interface User { id: string; name: string; email: string; } // Inconsistent!

// GOOD: Single source of truth
// types/user.ts
export interface User { id: string; name: string; email: string; }

// Use imports everywhere
import { User } from '@/types/user';
```

## 2. Separate Types from Runtime Values

### Issue
Using type names directly as values in runtime code causes TypeScript errors because types are erased during compilation.

### Best Practices
- Define types for compile-time checking
- Create corresponding constant objects with the same values for runtime use
- Use "as const" assertions to preserve literal types
- Use descriptive naming to distinguish between types and values

Example:
```typescript
// Define the type (for compile-time type checking)
export type DeviceCapability = 'low' | 'medium' | 'high';

// Define constants (for runtime use)
export const DeviceCapabilities = {
  LOW: 'low' as DeviceCapability,
  MEDIUM: 'medium' as DeviceCapability,
  HIGH: 'high' as DeviceCapability
} as const;

// INCORRECT usage
if (deviceCapability === DeviceCapability.HIGH) // Error!

// CORRECT usage
if (deviceCapability === DeviceCapabilities.HIGH) // Works!
```

## 3. Consistent Component Props

### Issue
Component props were inconsistently defined, leading to type errors and mismatched props between components.

### Best Practices
- Define props interfaces for all components
- Use consistent naming conventions (e.g., `ComponentNameProps`)
- Export props types for reuse
- Use destructuring with default values
- Document props with JSDoc comments

Example:
```typescript
// Define and export props interface
export interface ButtonProps {
  /** Primary button text */
  children: React.ReactNode;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Click handler */
  onClick?: () => void;
  /** Is button disabled */
  disabled?: boolean;
}

// Use destructuring with default values
export function Button({ 
  children, 
  variant = 'primary', 
  onClick, 
  disabled = false 
}: ButtonProps) {
  // Component implementation
}
```

## 4. Backward Compatibility for Evolving Types

### Issue
Type changes broke existing code when property names or types were modified.

### Best Practices
- Add new properties as optional
- Maintain older property names alongside new ones for a transition period
- Use union types to accept multiple formats
- Document deprecated properties and planned removal dates

Example:
```typescript
// Before
interface Config {
  timeout: number;
}

// After - with backward compatibility
interface Config {
  // New property name
  timeoutMs: number;
  
  // Old property name (marked for deprecation)
  /** @deprecated Use timeoutMs instead */
  timeout?: number;
}

// Implementation with backward compatibility
function processConfig(config: Config) {
  // Support both old and new property names
  const timeout = config.timeoutMs ?? config.timeout ?? 1000;
  // ...
}
```

## 5. Use Type Guards

### Issue
Many type errors occurred because of improper narrowing of types, especially with optional or union types.

### Best Practices
- Use type guards to narrow types safely
- Create reusable type guard functions
- Document type guard behavior
- Use exhaustive checks with discriminated unions

Example:
```typescript
// Type guard for ApiResponse
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is SuccessResponse<T> {
  return response.status === 'success' && 'data' in response;
}

// Usage
if (isSuccessResponse(response)) {
  // TypeScript knows response.data exists here
  processData(response.data);
} else {
  // TypeScript knows response.error exists here
  handleError(response.error);
}
```

## 6. Import Best Practices

### Issue
Mismatched file paths and case sensitivity issues caused import errors.

### Best Practices
- Use consistent file naming (e.g., kebab-case or camelCase)
- Create barrel files (index.ts) to simplify imports
- Use path aliases for cleaner imports
- Use consistent relative vs. absolute imports

Example:
```typescript
// BAD: Inconsistent file naming
// MyComponent.ts vs myOtherComponent.ts

// GOOD: Consistent file naming (e.g., kebab-case)
// my-component.ts and my-other-component.ts

// GOOD: Using barrel files and path aliases
import { Button, Card, TextField } from '@/components/ui';
import { useAuth } from '@/hooks';
```

## 7. State Management Type Safety

### Issue
State updates were often not properly typed, leading to inconsistent state structures.

### Best Practices
- Define explicit state interfaces for all components with non-trivial state
- Use properly typed state update functions
- Consider immer or similar libraries for complex state updates
- Use reducer pattern for complex state logic

Example:
```typescript
// Define state interface
interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

// Define typed actions
type ChatAction = 
  | { type: 'ADD_MESSAGE'; message: Message }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_ERROR'; error: string | null };

// Type-safe reducer
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.message] };
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    default:
      // Exhaustiveness check
      const _exhaustiveCheck: never = action;
      return state;
  }
}
```

## 8. Never Use Type Names as Values

One of the most common TypeScript errors occurs when using type names as values:

```typescript
// Type definition
type Status = 'pending' | 'success' | 'error';

// INCORRECT: Using type as namespace for values
if (status === Status.pending) { // Error: 'Status' only refers to a type, but is being used as a value here
  // ...
}

// CORRECT: Define a separate constants object
const StatusValues = {
  PENDING: 'pending' as Status,
  SUCCESS: 'success' as Status,
  ERROR: 'error' as Status
};

if (status === StatusValues.PENDING) { // Works correctly
  // ...
}
```

## 9. Update Type Definitions When Changing Code

When modifying functionality, always update the corresponding type definitions:

- When adding new properties to components, update the Props interface
- When changing function parameters, update the function signature
- When adding new state variables, update state type definitions
- When creating new events or callbacks, define their types

## 10. Implement Continuous Type Checking

- Include type checking in the CI/CD pipeline
- Use strict TypeScript configuration
- Add pre-commit hooks for type checking
- Regularly audit and update dependencies for type compatibility

## Conclusion

By following these best practices, we can significantly reduce type-related errors in our application. Remember that type safety is not just about avoiding errors—it's about creating a more maintainable, self-documenting codebase that's easier to understand and modify.

Regular audits of the codebase for adherence to these practices will help maintain type safety as the application grows and evolves.
