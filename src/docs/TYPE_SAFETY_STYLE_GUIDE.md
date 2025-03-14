# TypeScript and React Style Guide

This style guide provides best practices for writing TypeScript and React code in our application, with a focus on type safety.

## Table of Contents

1. [TypeScript Basics](#typescript-basics)
2. [Component Structure](#component-structure)
3. [Type Definitions](#type-definitions)
4. [State Management](#state-management)
5. [Hooks Pattern](#hooks-pattern)
6. [Error Handling](#error-handling)
7. [Database Interactions](#database-interactions)
8. [Performance Considerations](#performance-considerations)

## TypeScript Basics

### Use Explicit Types

Always declare explicit return types for functions, especially for React components and hooks.

```typescript
// GOOD
function add(a: number, b: number): number {
  return a + b;
}

// BAD
function add(a, b) {
  return a + b;
}
```

### Avoid `any`

Using `any` defeats the purpose of TypeScript. Use `unknown` instead when the type is truly unknown, then narrow it down.

```typescript
// GOOD
function processData(data: unknown): string {
  if (typeof data === 'string') {
    return data.toLowerCase();
  }
  return String(data);
}

// BAD
function processData(data: any): string {
  return data.toLowerCase(); // Potential runtime error
}
```

### Use Type Assertions Sparingly

Only use type assertions (`as`) when you're certain about the type and TypeScript can't infer it.

```typescript
// GOOD - Only when necessary
const userInput = event.target.value as string;

// BAD - Unnecessary assertion
const count = (someValue as any) as number;
```

## Component Structure

### Interface Props

Always define component props using interfaces, not types.

```typescript
// GOOD
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

// BAD
type ButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};
```

### Default Props

Use destructuring with default values for optional props.

```typescript
// GOOD
const Button = ({ label, onClick, disabled = false }: ButtonProps) => {
  // Implementation
};

// BAD
const Button = (props: ButtonProps) => {
  const disabled = props.disabled || false;
  // Implementation
};
```

### Children Prop Type

Be explicit about the `children` prop.

```typescript
// GOOD
interface CardProps {
  title: string;
  children: React.ReactNode;
}

// BAD
interface CardProps {
  title: string;
  children: any; // Not type-safe
}
```

## Type Definitions

### Organized Exports

Group related types in a single file and export them together.

```typescript
// GOOD
// types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface UserProfile extends User {
  bio: string;
  avatarUrl: string;
}

// BAD
// Scattered across multiple files
// user.ts
export interface User {
  id: string;
  name: string;
  email: string;
}

// profile.ts
export interface UserProfile {
  userId: string; // Inconsistent with User.id
  name: string;
  bio: string;
  avatarUrl: string;
}
```

### Discriminated Unions

Use discriminated unions for state management and API responses.

```typescript
// GOOD
type RequestState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

// Usage
function renderData<T>(state: RequestState<T>) {
  switch (state.status) {
    case 'idle': return <Idle />;
    case 'loading': return <Loading />;
    case 'success': return <Success data={state.data} />;
    case 'error': return <Error error={state.error} />;
  }
}

// BAD
interface RequestState<T> {
  status: 'idle' | 'loading' | 'success' | 'error';
  data?: T;
  error?: Error;
}

// Usage - potential bugs
function renderData<T>(state: RequestState<T>) {
  if (state.status === 'success' && state.data) { // Data might be undefined
    return <Success data={state.data} />;
  }
  // Other cases...
}
```

### Avoid Overlapping Interfaces

Don't use interfaces that have overlapping properties with different meanings.

```typescript
// GOOD
interface Product {
  id: string;
  name: string;
  price: number;
}

interface User {
  userId: string; // Different name from Product.id
  displayName: string; // Different name from Product.name
  email: string;
}

// BAD
interface Product {
  id: string; // Same name as User.id but different meaning
  name: string; // Same name as User.name but different meaning
  price: number;
}

interface User {
  id: string;
  name: string;
  email: string;
}
```

## State Management

### Typed State

Always use explicit types for useState.

```typescript
// GOOD
const [users, setUsers] = useState<User[]>([]);

// BAD
const [users, setUsers] = useState([]); // Type is any[]
```

### State Updates

Use type-safe state update functions.

```typescript
// GOOD
setUsers((prevUsers) => [...prevUsers, newUser]);

// BAD
setUsers([...users, newUser]); // May use stale state
```

### Complex State Objects

Use useReducer for complex state.

```typescript
// GOOD
type UserAction = 
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: User[] }
  | { type: 'FETCH_ERROR'; error: Error };

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { loading: false, users: action.payload, error: null };
    case 'FETCH_ERROR':
      return { loading: false, users: [], error: action.error };
  }
}

// BAD
const [loading, setLoading] = useState(false);
const [users, setUsers] = useState<User[]>([]);
const [error, setError] = useState<Error | null>(null);

// Function that may get into inconsistent state
const fetchUsers = async () => {
  setLoading(true);
  try {
    const data = await api.getUsers();
    setUsers(data);
    setError(null);
  } catch (e) {
    setError(e as Error);
    setUsers([]);
  } finally {
    setLoading(false);
  }
};
```

## Hooks Pattern

### Reusable Hooks

Create focused, reusable hooks with explicit return types.

```typescript
// GOOD
interface UseUserResult {
  user: User | null;
  loading: boolean;
  error: Error | null;
  fetchUser: (id: string) => Promise<void>;
}

function useUser(initialUserId?: string): UseUserResult {
  // Implementation
  return { user, loading, error, fetchUser };
}

// BAD
function useUser() {
  // Implementation returning different things without type
  return { user, loading, error, fetchUser };
}
```

### Composable Hooks

Compose complex hooks from simpler ones.

```typescript
// GOOD
function useUserProfile(userId: string) {
  const userResult = useUser(userId);
  const profileResult = useProfile(userId);
  
  return {
    ...userResult,
    ...profileResult,
    isComplete: !!userResult.user && !!profileResult.profile
  };
}

// BAD
function useUserProfile(userId: string) {
  // Duplicate code from useUser and useProfile
  // ...
}
```

### Type Guard Hooks

Create hooks that implement type guards.

```typescript
// GOOD
function useAuthenticatedUser(): User & { isAuthenticated: true } {
  const { user } = useAuth();
  
  if (!user) {
    throw new Error('User is not authenticated');
  }
  
  return { ...user, isAuthenticated: true as const };
}

// Usage 
const user = useAuthenticatedUser();
// TypeScript knows user is never null here
```

## Error Handling

### Typed Error Handling

Use discriminated unions or inheritance for error types.

```typescript
// GOOD
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

class ValidationError extends AppError {
  constructor(
    message: string,
    public fields: string[]
  ) {
    super(message, 'VALIDATION_ERROR', { fields });
    this.name = 'ValidationError';
  }
}

// Usage
try {
  // Some operation
} catch (error) {
  if (error instanceof ValidationError) {
    // Type-safe access to error.fields
  } else if (error instanceof AppError) {
    // Type-safe access to error.code and error.context
  } else {
    // Handle generic errors
  }
}

// BAD
try {
  // Some operation
} catch (error: any) {
  if (error.code === 'VALIDATION_ERROR') {
    // No type safety for error.fields
  }
}
```

### Avoid Try/Catch Blocks in Components

Move error handling logic to hooks or services.

```typescript
// GOOD
function useApiCall<T>(apiCallback: () => Promise<T>) {
  const [state, setState] = useState<RequestState<T>>({ status: 'idle' });
  
  const execute = async () => {
    setState({ status: 'loading' });
    try {
      const data = await apiCallback();
      setState({ status: 'success', data });
    } catch (error) {
      setState({ status: 'error', error: error as Error });
    }
  };
  
  return [state, execute] as const;
}

// In component
const [userState, fetchUser] = useApiCall(() => api.getUser(userId));

// Render based on state
if (userState.status === 'loading') {
  return <Loading />;
}

// BAD
function UserComponent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await api.getUser(userId);
        setUser(data);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [userId]);
  
  // Complex rendering logic based on multiple state variables
}
```

## Database Interactions

### Type-Safe Database Operations

Use type-safe wrappers for database operations.

```typescript
// GOOD
import { selectFrom } from '@/utils/database/DatabaseUtils';
import { User } from '@/types/database';

async function getUser(id: string): Promise<User | null> {
  const { data, error } = await selectFrom('users')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
}

// BAD
import { supabase } from '@/lib/supabaseClient';

async function getUser(id: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
}
```

### Database Schema Validation

Validate database responses against expected schema.

```typescript
// GOOD
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  created_at: z.string().datetime(),
});

type User = z.infer<typeof UserSchema>;

async function getUser(id: string): Promise<User | null> {
  const { data, error } = await selectFrom('users')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  if (!data) return null;
  
  // Validate data matches schema
  return UserSchema.parse(data);
}

// BAD
async function getUser(id: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data; // No validation against expected schema
}
```

## Performance Considerations

### Memoization with Proper Types

Use memoization hooks with correct types.

```typescript
// GOOD
const memoizedValue = useMemo<ComplexCalculation>(() => {
  return performExpensiveCalculation(a, b);
}, [a, b]);

// BAD
const memoizedValue = useMemo(() => {
  return performExpensiveCalculation(a, b);
}, [a, b]); // Type might be inferred incorrectly
```

### Typed Event Handlers

Use typed event handlers for DOM events.

```typescript
// GOOD
const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const value = event.target.value;
  // value is typed as string
};

// BAD
const handleChange = (event) => {
  const value = event.target.value;
  // event and value are typed as any
};
```

### Optimized Rendering

Use type information to optimize rendering.

```typescript
// GOOD
interface Props {
  user: User;
  onUserUpdate: (user: User) => void;
}

// Use React.memo with explicit PropsWithChildren
const UserCard = React.memo<Props>(({ user, onUserUpdate }) => {
  // Implementation
});

// BAD
const UserCard = ({ user, onUserUpdate }) => {
  // Implementation with no memoization or type safety
};
```

## Conclusion

Following these guidelines will help maintain a type-safe codebase, reduce bugs, and improve developer experience. Remember, the goal of TypeScript is to catch errors at compile time rather than runtime, but it's only effective if used properly.
