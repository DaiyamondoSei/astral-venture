
# Coding Standards

This document outlines the coding standards for our application, with a focus on preventing type safety issues and ensuring consistent, maintainable code.

## Table of Contents

1. [Type Safety](#type-safety)
2. [Component Architecture](#component-architecture)
3. [State Management](#state-management)
4. [API Integration](#api-integration)
5. [Error Handling](#error-handling)
6. [Folder Structure](#folder-structure)
7. [Naming Conventions](#naming-conventions)
8. [Documentation](#documentation)

## Type Safety

### Type Definitions

- **Single Source of Truth**: Define each type in exactly one place
- **Export Types**: Always export types that will be used by multiple components
- **Use Interfaces** for objects that will be extended and **Type Aliases** for unions, intersections, and simple object types
- **Avoid `any`**: Never use `any` unless absolutely necessary; prefer `unknown` with type narrowing
- **Discriminated Unions**: Use for state management, API responses, and other complex types

```typescript
// Good - Discriminated union
type ApiResponse<T> = 
  | { status: 'success'; data: T } 
  | { status: 'error'; error: string };

// Bad - Inconsistent structure
type ApiResponse<T> = {
  status: 'success' | 'error';
  data?: T;
  error?: string;
};
```

### Type Guards

- **Create Reusable Guards**: Define reusable type guards for common patterns
- **Exhaustive Checks**: Use exhaustive checks with discriminated unions

```typescript
// Good - Exhaustive check
function processResponse<T>(response: ApiResponse<T>): T {
  switch (response.status) {
    case 'success':
      return response.data;
    case 'error':
      throw new Error(response.error);
    default:
      const _exhaustiveCheck: never = response;
      throw new Error('Unhandled response type');
  }
}
```

### Generic Constraints

- **Use Constraints**: Prefer generic constraints over casting
- **Document Constraints**: Add comments explaining the constraints

```typescript
// Good - Use constraints
function getIds<T extends { id: string }>(items: T[]): string[] {
  return items.map(item => item.id);
}

// Bad - Casting
function getIds(items: any[]): string[] {
  return items.map(item => (item as any).id);
}
```

## Component Architecture

### Props

- **Props Interface**: Define and export a props interface for every component
- **Default Values**: Use destructuring with default values
- **Required vs Optional**: Mark props as optional only if they have sensible defaults

```typescript
// Good - Props interface with defaults
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  disabled?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  onClick, 
  disabled = false 
}: ButtonProps) {
  // Implementation
}
```

### Component Structure

- **Functional Components**: Use functional components with hooks
- **Small Components**: Keep components focused on a single responsibility
- **Composition**: Use composition over inheritance
- **Memoization**: Use `React.memo`, `useMemo`, and `useCallback` for performance optimization when necessary

```typescript
// Good - Small, focused component
function UserAvatar({ user }: { user: User }) {
  return <img src={user.avatarUrl} alt={user.name} />;
}

function UserProfile({ user }: { user: User }) {
  return (
    <div>
      <UserAvatar user={user} />
      <h2>{user.name}</h2>
      <p>{user.bio}</p>
    </div>
  );
}
```

## State Management

### Local State

- **Typed State**: Define explicit types for useState
- **Reducer Pattern**: Use useReducer for complex state logic
- **State Initialization**: Initialize state with proper types

```typescript
// Good - Typed state
const [users, setUsers] = useState<User[]>([]);

// Better - With initial state
interface UsersState {
  users: User[];
  isLoading: boolean;
  error: string | null;
}

const [state, setState] = useState<UsersState>({
  users: [],
  isLoading: false,
  error: null
});
```

### Global State

- **Context Types**: Define explicit types for context values and providers
- **Default Values**: Provide sensible default values for context
- **Consumer Types**: Use proper typing for context consumers

```typescript
// Good - Typed context
interface AuthContextType {
  user: User | null;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: async () => {},
  isLoading: false,
  error: null
});
```

## API Integration

### Service Pattern

- **Service Modules**: Create service modules for API calls
- **Return Types**: Define explicit return types for service functions
- **Error Handling**: Use consistent error handling across services

```typescript
// Good - Service pattern
export async function getUserProfile(userId: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw new APIError(error.message, error.code);
  if (!data) throw new NotFoundError(`User profile not found: ${userId}`);
  
  return data;
}
```

### Data Fetching

- **Loading States**: Track loading state for all async operations
- **Error States**: Track error state for all async operations
- **Data Validation**: Validate API responses against expected types

```typescript
// Good - Complete async state tracking
function useUserProfile(userId: string) {
  const [state, setState] = useState<{
    data: UserProfile | null;
    isLoading: boolean;
    error: Error | null;
  }>({
    data: null,
    isLoading: false,
    error: null
  });
  
  useEffect(() => {
    let isMounted = true;
    
    async function fetchUserProfile() {
      if (!userId) return;
      
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const data = await getUserProfile(userId);
        if (isMounted) {
          setState({ data, isLoading: false, error: null });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            data: null,
            isLoading: false,
            error: error instanceof Error ? error : new Error(String(error))
          });
        }
      }
    }
    
    fetchUserProfile();
    
    return () => {
      isMounted = false;
    };
  }, [userId]);
  
  return state;
}
```

## Error Handling

### Error Types

- **Custom Error Classes**: Define custom error classes for different error types
- **Error Properties**: Include relevant properties in error objects
- **Error Codes**: Use consistent error codes across the application

```typescript
// Good - Custom error classes
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

export class APIError extends AppError {
  constructor(
    message: string,
    code: string = 'API_ERROR',
    context?: Record<string, unknown>
  ) {
    super(message, code, context);
    this.name = 'APIError';
  }
}
```

### Error Handling Pattern

- **Try/Catch**: Use try/catch blocks for async operations
- **Error Components**: Create dedicated error components
- **Recovery**: Provide recovery mechanisms when possible

```typescript
// Good - Complete error handling
try {
  await submitForm(formData);
  showSuccess('Form submitted successfully');
} catch (error) {
  if (error instanceof ValidationError) {
    setFieldErrors(error.fieldErrors);
  } else if (error instanceof AuthError) {
    showError('Please log in again');
    logout();
  } else {
    showError('An unexpected error occurred. Please try again.');
    logError(error);
  }
}
```

## Folder Structure

### Organization

- **Feature-Based**: Organize code by feature, not by type
- **Related Files**: Keep related files close together
- **Index Files**: Use index files to simplify imports
- **Consistent Depth**: Maintain consistent nesting depth

```
src/
  features/
    auth/
      components/
        LoginForm.tsx
        SignupForm.tsx
      hooks/
        useAuth.tsx
      services/
        authService.ts
      types.ts
      index.ts
  shared/
    components/
    hooks/
    utils/
  types/
    index.ts
  App.tsx
  main.tsx
```

### Imports

- **Absolute Imports**: Use absolute imports for better readability
- **Barrel Files**: Use barrel files to simplify imports
- **Organized Imports**: Group imports by type (external, internal, types)

```typescript
// Good - Organized imports
// External dependencies
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Internal modules
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { validateEmail } from '@/utils/validation';

// Types
import type { User, LoginCredentials } from '@/types';
```

## Naming Conventions

### Files

- **Pascal Case** for components: `UserProfile.tsx`
- **Camel Case** for non-component files: `useAuth.ts`, `validation.ts`
- **Kebab Case** for CSS modules: `user-profile.module.css`
- **Consistent Extensions**: Use `.tsx` for files with JSX, `.ts` for pure TypeScript

### Variables and Functions

- **Camel Case** for variables and functions: `getUserProfile`
- **Pascal Case** for types, interfaces, and classes: `UserProfile`
- **ALL_CAPS** for constants: `MAX_RETRY_COUNT`
- **Boolean Prefixes**: Use `is`, `has`, `should` for booleans: `isLoading`, `hasError`

```typescript
// Good - Consistent naming
const MAX_RETRY_COUNT = 3;
const isLoading = true;
const userProfile = getUserProfile(userId);

interface UserProfileProps {
  userId: string;
}

function UserProfile({ userId }: UserProfileProps) {
  // Implementation
}
```

## Documentation

### Comments

- **JSDoc** for public functions, interfaces, and components
- **Inline Comments** for complex logic
- **TODO Comments** with consistent format: `// TODO: [JIRA-123] Add pagination`
- **Avoid Obvious Comments**: Don't comment obvious code

```typescript
/**
 * Fetches user profile data from the API
 * 
 * @param userId - The ID of the user to fetch
 * @returns A promise that resolves to the user profile
 * @throws {NotFoundError} If the user doesn't exist
 * @throws {APIError} If the API request fails
 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
  // Implementation
}
```

### Documentation Files

- **README.md**: General project documentation
- **API.md**: API documentation
- **ARCHITECTURE.md**: Architecture documentation
- **CONTRIBUTING.md**: Contribution guidelines
- **TypeDocs**: Use TypeDoc for generating API documentation

By following these standards, we can create a more maintainable, readable, and type-safe codebase that is easier to work with and less prone to errors.
