
# Interface Consistency Best Practices

## The Problem: Interface Drift

One of the most common sources of errors in our application is "interface drift" - where components and hooks don't share consistent interfaces, leading to property name mismatches, missing properties, and type errors.

## 5 Whys Analysis

### Why do we encounter Property 'X' does not exist on type 'Y' errors?

1. **Why do property not found errors occur?**  
   Components reference properties that don't exist on the objects they're using.

2. **Why do components reference non-existent properties?**  
   Interface changes in hooks or services aren't reflected in the components that use them.

3. **Why aren't interface changes coordinated?**  
   No single source of truth for interfaces that both providers and consumers can reference.

4. **Why is there no single source of truth?**  
   Lack of a contract-first development approach where interfaces are defined separately.

5. **Why no contract-first approach?**  
   Missing pattern of creating centralized interface definitions before implementation.

## Best Practices

### 1. Define Interfaces in Dedicated Files

Create dedicated files for interfaces shared between multiple components:

```typescript
// src/types/ai-assistant.ts
export interface AIResponse {
  answer: string;
  type: 'text' | 'code' | 'markdown' | 'error';
  meta: {
    model: string;
    tokenUsage: number;
    processingTime: number;
  };
}

export interface AIQuestion {
  text: string;
  userId: string;
  context?: string;
}
```

### 2. Contract-First Development

Define interfaces before implementing components or hooks:

```typescript
// 1. First, define the hook interface
export interface UseAIAssistantResult {
  question: string;
  setQuestion: (q: string) => void;
  response: AIResponse | null;
  isLoading: boolean;
  error: string | null;
  submitQuestion: () => Promise<void>;
}

// 2. Then implement according to the interface
export function useAIAssistant(): UseAIAssistantResult {
  // Implementation...
}

// 3. Component can now rely on the stable interface
function AIAssistant() {
  const {
    question,
    setQuestion,
    response,
    isLoading,
    error,
    submitQuestion
  } = useAIAssistant();
  
  // Rest of component...
}
```

### 3. Use Interface Extensions for Specialization

Extend base interfaces rather than creating entirely new ones:

```typescript
// Base interface
interface BaseButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

// Extended interfaces
interface PrimaryButtonProps extends BaseButtonProps {
  variant: 'primary';
  size?: 'small' | 'medium' | 'large';
}

interface IconButtonProps extends BaseButtonProps {
  icon: React.ReactNode;
  showText?: boolean;
}
```

### 4. Explicit Return Types for Hooks and Functions

Always specify return types explicitly for hooks and functions:

```typescript
// BAD: Implicit return type
function useUserData(userId: string) {
  // Return object with various properties
}

// GOOD: Explicit return type
function useUserData(userId: string): UserDataResult {
  // Return object with various properties that match UserDataResult
}
```

### 5. Backward Compatibility Strategies

When updating interfaces, use strategies to maintain backward compatibility:

#### Optional New Properties

```typescript
interface UserProfile {
  id: string;
  name: string;
  email: string;
  // New property is optional
  preferences?: UserPreferences;
}
```

#### Support Both Old and New Property Names

```typescript
interface AIResponseMeta {
  model: string;
  tokenUsage?: number; // Original property
  tokens?: number;     // New property name
  processingTime: number;
}

// Usage code checks for both properties
const tokenCount = meta.tokenUsage ?? meta.tokens ?? 0;
```

#### Versioned Interfaces

```typescript
// Original interface
interface APIResponseV1 {
  data: any;
  success: boolean;
}

// New interface with breaking changes
interface APIResponseV2 {
  data: any;
  status: 'success' | 'error' | 'pending';
  meta: ResponseMeta;
}

// Union type for functions that need to handle both
type APIResponse = APIResponseV1 | APIResponseV2;

// Type guard to differentiate
function isV2Response(response: APIResponse): response is APIResponseV2 {
  return 'status' in response && 'meta' in response;
}
```

### 6. Use Centralized Validation

Implement runtime validation against interfaces:

```typescript
import { z } from 'zod';

// Define schema matching the TypeScript interface
const AIResponseSchema = z.object({
  answer: z.string(),
  type: z.enum(['text', 'code', 'markdown', 'error']),
  meta: z.object({
    model: z.string(),
    tokenUsage: z.number().optional(),
    tokens: z.number().optional(),
    processingTime: z.number()
  })
});

// Use for validation
function validateAIResponse(data: unknown): AIResponse {
  return AIResponseSchema.parse(data);
}
```

### 7. Implement Interface Audits

Create automated tests to verify interface compliance:

```typescript
test('useAIAssistant returns correct interface properties', () => {
  const result = renderHook(() => useAIAssistant()).result.current;
  
  // Verify interface shape
  expect(result).toHaveProperty('question');
  expect(result).toHaveProperty('setQuestion');
  expect(result).toHaveProperty('response');
  expect(result).toHaveProperty('isLoading');
  expect(result).toHaveProperty('error');
  expect(result).toHaveProperty('submitQuestion');
  
  // Verify property types
  expect(typeof result.question).toBe('string');
  expect(typeof result.setQuestion).toBe('function');
  expect(typeof result.isLoading).toBe('boolean');
  expect(typeof result.submitQuestion).toBe('function');
});
```

## Implementation Checklist

When creating interfaces for components and hooks:

1. ✅ Define interfaces in dedicated type files
2. ✅ Use contract-first development (define before implementation)
3. ✅ Extend base interfaces for specialization
4. ✅ Specify explicit return types
5. ✅ Use strategies for backward compatibility
6. ✅ Implement runtime validation where critical
7. ✅ Create interface audit tests
8. ✅ Document the interfaces for other developers

## Practical Example: AI Assistant System

```typescript
// In types/ai-assistant.ts
export interface AIQuestion {
  text: string;
  userId: string;
  context?: string;
}

export interface AIResponse {
  answer: string;
  type: 'text' | 'code' | 'markdown' | 'error';
  meta: AIResponseMeta;
}

export interface AIResponseMeta {
  model: string;
  tokenUsage?: number;
  tokens?: number; // Alternative property name
  processingTime: number;
}

export interface UseAIAssistantOptions {
  initialQuestion?: string;
  context?: string;
}

export interface UseAIAssistantResult {
  question: string;
  setQuestion: (question: string) => void;
  response: AIResponse | null;
  isLoading: boolean;
  error: string | null;
  submitQuestion: () => Promise<void>;
}

// In hooks/useAIAssistant.tsx
import { 
  UseAIAssistantOptions, 
  UseAIAssistantResult,
  AIQuestion,
  AIResponse
} from '../types/ai-assistant';

export function useAIAssistant(
  options?: UseAIAssistantOptions
): UseAIAssistantResult {
  // Implementation...
}

// In components/AIAssistant.tsx
import { UseAIAssistantResult } from '../types/ai-assistant';
import { useAIAssistant } from '../hooks/useAIAssistant';

export function AIAssistant() {
  const assistant: UseAIAssistantResult = useAIAssistant();
  
  // Implementation that uses the interface properties
}
```

By following these patterns consistently throughout the codebase, we can eliminate interface inconsistencies and create more robust components.
