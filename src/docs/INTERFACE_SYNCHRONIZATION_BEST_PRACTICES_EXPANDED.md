
# Interface Synchronization Best Practices

## Problem Statement

Our codebase consistently experiences "property does not exist" TypeScript errors, particularly in components that consume hooks, contexts, or services. These errors indicate a synchronization problem between interfaces and their implementations.

## 5 Whys Analysis

1. **Why do we have "property does not exist" errors?**
   - Because components are accessing properties that don't exist in the interfaces of the objects they consume.

2. **Why don't these properties exist in the interfaces?**
   - Because the interfaces weren't updated when new functionality was added to the implementations.

3. **Why weren't interfaces updated with implementations?**
   - Because there's no systematic approach to ensure that interfaces and implementations stay synchronized.

4. **Why is there no systematic approach?**
   - Because we lacked a clear pattern and process for how interfaces should evolve alongside implementations.

5. **Why was no clear pattern established?**
   - Because interface design and maintenance wasn't treated as a critical part of our development process, allowing inconsistencies to emerge over time.

## Core Principles

To address these issues, we've established these core principles for interface design and maintenance:

### 1. Interface-First Development

Design interfaces before implementation, focusing on the needs of consumers rather than implementation details:

```typescript
// First define the interface
export interface UseFeatureResult {
  data: DataType | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// Then implement to satisfy the interface
export function useFeature(): UseFeatureResult {
  // Implementation details...
  return {
    data,
    isLoading,
    error,
    refresh
  };
}
```

### 2. Single Source of Truth

Define and export all interfaces alongside their implementations, making them the single source of truth:

```typescript
// Place in the same file as the implementation
export interface UseAssistantProps {
  componentName?: string;
}

export interface UseAssistantResult {
  // All properties that will be returned
}

export function useAssistant(props: UseAssistantProps): UseAssistantResult {
  // Implementation
}
```

### 3. Comprehensive Interface Design

Include ALL properties that consumers might need, even if they're optional:

```typescript
export interface ButtonProps {
  // Required core properties
  children: React.ReactNode;
  onClick?: () => void;
  
  // Optional variants
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  
  // Optional states
  isLoading?: boolean;
  disabled?: boolean;
  
  // Optional customization
  className?: string;
}
```

### 4. Backward Compatible Evolution

When evolving interfaces, maintain backward compatibility:

```typescript
interface UserProfile {
  id: string;
  name: string;
  // New property added as optional to maintain compatibility
  avatarUrl?: string;
}
```

### 5. Interface Composition

Use composition to build complex interfaces:

```typescript
// Base interfaces
interface BaseProps {
  className?: string;
}

interface InteractiveProps {
  onClick?: () => void;
}

// Composed interface
interface ButtonProps extends BaseProps, InteractiveProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}
```

## Implementation Patterns

### Hook Interface Pattern

For hooks, define both input and output interfaces:

```typescript
// Input props interface
export interface UseDataProps {
  initialData?: DataType;
  fetchOnMount?: boolean;
}

// Output result interface 
export interface UseDataResult {
  data: DataType | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Hook implementation
export function useData(props: UseDataProps = {}): UseDataResult {
  // Implementation
}
```

### Context Interface Pattern

For contexts, define both the value and provider props interfaces:

```typescript
export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => Promise<void>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: User;
}

export const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, initialUser }) => {
  // Implementation
};
```

### Alias Properties Pattern

When renaming properties, keep the old name as an alias for backward compatibility:

```typescript
return {
  loading: isLoading, // Old name as alias
  isLoading,          // New preferred name
  data
};
```

## Interface Synchronization Workflow

Follow this workflow when modifying hooks, contexts, or services:

1. **Identify Consumers**: List all components that use the interface
2. **Document Requirements**: Gather all properties these consumers need
3. **Update Interface**: Add new properties (as optional when appropriate)
4. **Update Implementation**: Ensure it provides all interface properties
5. **Test Consumers**: Verify all consumers work with the updated interface
6. **Document Changes**: Add JSDoc comments for new properties or deprecations

## Implementation Checklist

Before submitting changes:

- [ ] Have you exported all interfaces used by consumers?
- [ ] Are all properties used by consumers included in the interface?
- [ ] Are new properties added as optional for backward compatibility?
- [ ] Do all implementations fully satisfy their interfaces?
- [ ] Have you added JSDoc comments for new or modified properties?

## Common Anti-Patterns to Avoid

1. **Implicit Interfaces**: Not explicitly defining interfaces for exported functions or components
2. **Implementation Leakage**: Exposing implementation details in interfaces
3. **Interface Drift**: Letting implementations diverge from their interfaces
4. **Magic Properties**: Adding undocumented properties consumed by specific components
5. **Type Assertions**: Using "as" to work around interface/implementation mismatches

## Real-world Example: useAssistant Hook

Before:
```typescript
// No explicit interface defined
function useAssistant() {
  // Implementation details
  return {
    isLoading,
    data,
    // Missing properties needed by consumers
  };
}

// Error in component
function AIComponent() {
  const { isLoading, data, isAnalyzing } = useAssistant();
  // Error: Property 'isAnalyzing' does not exist on type...
}
```

After:
```typescript
// Explicit comprehensive interface
export interface UseAssistantResult {
  isLoading: boolean;
  data: any;
  isAnalyzing: boolean;
  suggestions: AssistantSuggestion[];
  // All other properties needed by consumers
}

// Implementation satisfying the interface
export function useAssistant(): UseAssistantResult {
  // Implementation details
  return {
    isLoading,
    data,
    isAnalyzing,
    suggestions,
    // All properties defined in the interface
  };
}

// No errors in component
function AIComponent() {
  const { isLoading, data, isAnalyzing } = useAssistant();
  // All properties exist on the interface
}
```

By consistently applying these patterns and principles, we can significantly reduce "property does not exist" errors and create a more maintainable codebase.
