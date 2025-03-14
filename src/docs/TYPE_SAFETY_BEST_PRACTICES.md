
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

## 2. Singleton Services

### Issue
Multiple instances of service clients (e.g., Supabase) created throughout the application, causing warnings and potential race conditions.

### Best Practices
- Implement the singleton pattern for all service clients
- Create a single initialization file for each external service
- Export the instance, not the creation function
- Add runtime checks to prevent multiple initializations

Example:
```typescript
// BAD: Multiple instances
// file1.ts
export const supabase1 = createClient(url, key);

// file2.ts
export const supabase2 = createClient(url, key); // Duplicate!

// GOOD: Singleton pattern
// lib/supabaseClient.ts
let instance = null;

function getClient() {
  if (instance) return instance;
  instance = createClient(url, key);
  return instance;
}

export const supabase = getClient();
export default supabase;
```

## 3. Database Type Sync

### Issue
Database tables and their TypeScript type definitions were out of sync, causing errors when accessing tables or columns that weren't in the type definitions.

### Best Practices
- Use a tool to generate TypeScript types from the database schema (e.g., Supabase CLI)
- Run type generation as part of the CI/CD pipeline
- Never manually edit generated types
- Include type generation in the migration process

Example:
```bash
# Add this to your build process
supabase gen types typescript --project-id your-project-id > src/types/database.ts
```

## 4. Consistent Error Handling

### Issue
Inconsistent error typing and handling led to unexpected behavior and type errors.

### Best Practices
- Define a single AppError class with proper typing
- Use error factories for domain-specific errors
- Always include proper type information in catch blocks
- Use discriminated unions for error states

Example:
```typescript
// Define a base error type
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Use factories for specific errors
export function createValidationError(message: string, field: string) {
  return new AppError(message, 'VALIDATION_ERROR', { field });
}

// Type-safe error handling
try {
  // ...
} catch (error) {
  if (error instanceof AppError) {
    // Type-safe error handling
    console.error(`${error.code}: ${error.message}`);
  } else {
    // Unknown error handling
    console.error('Unknown error:', error);
  }
}
```

## 5. Consistent Component Props

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

## 6. Use Type Guards

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

## 7. AI Service Type Safety

### Issue
AI components had inconsistent type definitions, making it difficult to ensure type-safe transitions between components.

### Best Practices
- Define a clear type hierarchy for AI-related entities
- Use discriminated unions for different response types
- Keep metadata separate from core data
- Define clear boundaries between presentation and data layers

Example:
```typescript
// Clear type definitions for AI
export interface AIQuestion {
  text: string;
  userId: string;
  context?: string;
}

export type AIResponseType = 'text' | 'code' | 'error';

export interface AIResponse {
  type: AIResponseType;
  content: string;
  meta: {
    model: string;
    tokenUsage: number;
    processingTime: number;
  };
}

// Function with clear type signatures
export async function askAI(
  question: AIQuestion
): Promise<AIResponse> {
  // Implementation
}
```

## 8. State Management Type Safety

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

## 9. Database Queries Type Safety

### Issue
Database queries often failed due to incorrect table or column names in the TypeScript code that weren't caught at compile time.

### Best Practices
- Use typed query builders (e.g., Prisma, TypeORM, or Supabase with type generation)
- Never use string literals for table or column names
- Use constants for table names if typed query builders aren't available
- Add runtime validation for query results

Example:
```typescript
// BAD: Untyped queries
const { data } = await supabase
  .from('user_profiles') // Typo wouldn't be caught!
  .select('*');

// GOOD: Using typed client
const { data } = await supabase
  .from('user_profiles')
  .select<{ id: string; name: string }>('id, name');

// Best: Using generated types
import { Database } from '@/types/database';
const supabase = createClient<Database>(url, key);

const { data } = await supabase
  .from('user_profiles') // Type-checked!
  .select('*');
```

## 10. Implement Continuous Type Checking

### Issue
Type errors were often discovered late in the development process.

### Best Practices
- Include type checking in the CI/CD pipeline
- Use strict TypeScript configuration
- Add pre-commit hooks for type checking
- Regularly audit and update dependencies for type compatibility

Example GitHub Action:
```yaml
name: Type Check

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Use Node.js
      uses: actions/setup-node@v1
      with:
        node-version: '16.x'
    - run: npm ci
    - run: npm run type-check
```

## Conclusion

By following these best practices, we can significantly reduce type-related errors in our application. Remember that type safety is not just about avoiding errors—it's about creating a more maintainable, self-documenting codebase that's easier to understand and modify.

Regular audits of the codebase for adherence to these practices will help maintain type safety as the application grows and evolves.
