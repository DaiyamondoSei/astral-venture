# Component-Hook Integration Best Practices

## Problem

Many TypeScript errors in our codebase stem from mismatches between what hooks provide and what components expect:

```typescript
error TS2339: Property 'applyAutoFix' does not exist on type '{ /* ... */ }'.
error TS2339: Property 'submitQuestion' does not exist on type '{ /* ... */ }'.
```

These errors indicate a synchronization problem in the interface between components and hooks.

## Root Cause Analysis (5 Whys)

1. **Why do component-hook integration errors occur?**  
   Components use properties or methods that aren't included in the hook's return type.

2. **Why are hook return types missing these properties?**  
   Hooks evolve independently of their consuming components, leading to interface drift.

3. **Why does interface drift happen?**  
   There's no formal contract or enforcement mechanism between hooks and components.

4. **Why isn't there a formal contract?**  
   The codebase lacks explicit interface definitions or automated testing of these contracts.

5. **Why isn't interface contract testing prioritized?**  
   Developers may focus on feature implementation over interface stability and maintenance.

## Solution: Interface-Driven Development (IDD)

### 1. Define Explicit Interfaces First

Before implementing hooks or components, define the contract between them:

```typescript
// 1. Define the interface for the hook's return value
export interface AssistantHookResult {
  // Required properties
  question: string;
  setQuestion: (question: string) => void;
  submitQuestion: (question?: string) => Promise<string>;
  // ...other properties
}

// 2. Define component props that depend on the hook
export interface AssistantPanelProps {
  componentName?: string;
  initialQuestion?: string;
}

// 3. Implement the hook with explicit return type
export function useAssistant(): AssistantHookResult {
  // Implementation
  return {
    question,
    setQuestion,
    submitQuestion,
    // ...all required properties
  };
}

// 4. Use hook in component, accessing only defined properties
const AssistantPanel: React.FC<AssistantPanelProps> = (props) => {
  const { submitQuestion, question } = useAssistant();
  // Component implementation
};
```

### 2. Create Adapter Pattern for Legacy Components

When hooks need to evolve but components can't be updated immediately:

```typescript
// 1. Create adapter function to transform hook output
function adaptAssistantHook(hookResult: AssistantHookResultV2): AssistantHookResultV1 {
  return {
    // Map new properties to old interface
    question: hookResult.query,
    setQuestion: hookResult.setQuery,
    // ...other mappings
  };
}

// 2. Use in legacy components
const LegacyComponent = () => {
  const newHookResult = useAssistantV2();
  const compatibility = adaptAssistantHook(newHookResult);
  
  // Now use compatibility as if it was the old hook
}
```

### 3. Implement Hook Evolution Strategy

When evolving hooks:

```typescript
// 1. Add new properties alongside existing ones
return {
  // Original properties
  question,
  setQuestion,
  
  // New properties with new names
  query: question,      // Same data, new name
  setQuery: setQuestion, // Same function, new name
  
  // Mark deprecated properties
  /** @deprecated Use 'submitQuery' instead */
  submitQuestion,
  submitQuery: submitQuestion, // New name for same function
};

// 2. Create a new version when breaking changes are needed
export function useAssistantV2(): AssistantHookResultV2 {
  // New implementation
}
```

### 4. Implement Contract Testing

Create automated tests to verify hook-component contracts:

```typescript
describe('useAssistant contract', () => {
  it('should expose all required properties for AssistantPanel', () => {
    const result = renderHook(() => useAssistant()).result.current;
    
    // Verify required properties exist
    expect(result).toHaveProperty('question');
    expect(result).toHaveProperty('setQuestion');
    expect(result).toHaveProperty('submitQuestion');
    
    // Verify property types
    expect(typeof result.question).toBe('string');
    expect(typeof result.setQuestion).toBe('function');
    expect(typeof result.submitQuestion).toBe('function');
  });
});
```

## Implementation Examples

### Basic Integration Pattern

```typescript
// 1. Interface definition
interface UseCounterResult {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

// 2. Hook implementation
function useCounter(initialValue = 0): UseCounterResult {
  const [count, setCount] = useState(initialValue);
  
  return {
    count,
    increment: () => setCount(prev => prev + 1),
    decrement: () => setCount(prev => prev - 1),
    reset: () => setCount(initialValue)
  };
}

// 3. Component implementation
const Counter: React.FC = () => {
  const { count, increment, decrement, reset } = useCounter(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Reset</button>
    </div>
  );
};
```

### For AI Assistant Integration

```typescript
// 1. Define core interfaces
interface AssistantSuggestion {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  type: string;
  status: string;
  // ...other properties
}

interface UseAssistantResult {
  // State
  question: string;
  response: string;
  suggestions: AssistantSuggestion[];
  isLoading: boolean;
  isAnalyzing: boolean;
  isFixing: boolean;
  
  // Actions
  setQuestion: (question: string) => void;
  submitQuestion: (questionText?: string) => Promise<string>;
  analyzeComponent: (componentName: string) => Promise<AssistantSuggestion[]>;
  applyFix: (suggestion: AssistantSuggestion) => Promise<boolean>;
  applyAutoFix: (suggestion: AssistantSuggestion) => Promise<boolean>;
  // ...other methods
}

// 2. Create consistent props based on the hook interface
interface AISuggestionListProps {
  componentId?: string;
  limit?: number;
}

interface AIAssistantPanelProps {
  componentName?: string;
}

// 3. Implement hook with consistent return type
function useAssistant(props: UseAssistantProps = {}): UseAssistantResult {
  // Implementation
  return {
    question,
    response,
    suggestions,
    isLoading,
    isAnalyzing,
    isFixing,
    setQuestion,
    submitQuestion,
    analyzeComponent,
    applyFix,
    applyAutoFix
    // ...ensure all interface properties are returned
  };
}
```

## Common Pitfalls

### 1. Undefined Property Access

```typescript
// ❌ BAD: Accessing potentially undefined properties
const { something } = useAssistant();
something(); // Error if 'something' doesn't exist

// ✅ GOOD: Safe access with optional chaining
const result = useAssistant();
result.something?.(); // Safe - no error if missing
```

### 2. Inconsistent Naming

```typescript
// ❌ BAD: Inconsistent naming between hook and component
function useData() {
  return { items: [] };
}

// Component expects 'data' but hook returns 'items'
const { data } = useData(); // Error: data is undefined

// ✅ GOOD: Consistent naming
function useData() {
  return { data: [] };
}

// Or use aliasing when consuming
const { items: data } = useData();
```

### 3. Function Signature Mismatch

```typescript
// ❌ BAD: Function signature mismatch
interface HookResult {
  handleSubmit: (data: FormData) => void;
}

// Component passes different arguments
const { handleSubmit } = useHook();
handleSubmit("string"); // Error: expected FormData, got string

// ✅ GOOD: Explicit typing and consistent signatures
interface HookResult {
  handleSubmit: (data: FormData) => void;
}

// Use type assertion to ensure proper usage
const handleFormSubmit = (data: any) => {
  const formData = new FormData(data);
  handleSubmit(formData);
};
```

## Best Practices Summary

1. **Define interfaces first** before implementing hooks or components
2. **Make hook return types explicit** to catch interface mismatches early
3. **Use TypeScript's strict mode** to enforce interface compatibility
4. **Create adapter functions** for backwards compatibility
5. **Implement contract tests** to verify hook-component integration
6. **Use consistent naming conventions** across hooks and components
7. **Document interface changes** with comments and change logs
8. **Consider feature flags** for introducing breaking changes gradually
9. **Review interface changes** with team members before implementation
10. **Create migration guides** for significant interface changes

By following these practices, you can eliminate most interface mismatch errors and create a more maintainable relationship between your hooks and components.
