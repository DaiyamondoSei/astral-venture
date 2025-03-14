
# Singleton Pattern Best Practices in React Applications

This document outlines best practices for implementing and using the Singleton pattern in React applications, particularly for service clients like database connections, API clients, and other external services.

## What is the Singleton Pattern?

The Singleton pattern ensures that a class has only one instance and provides a global point of access to that instance. In JavaScript/TypeScript, this pattern is particularly useful for:

- Database connections
- API clients
- Configuration managers
- Logging services
- State containers

## Common Issues Without Singleton Pattern

Without proper singleton implementation, applications can encounter:

1. **Multiple instances** of the same service client
2. **Inconsistent state** across different parts of the application
3. **Resource wastage** from duplicate connections
4. **Rate limiting issues** with external APIs
5. **Memory leaks** from unclosed connections

## Implementation Guidelines

### 1. Basic Singleton Pattern

```typescript
// Basic singleton implementation
export class ApiClient {
  private static instance: ApiClient | null = null;
  
  private constructor() {
    // Private constructor to prevent direct construction calls
  }
  
  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    
    return ApiClient.instance;
  }
  
  // Methods for the client...
}

// Usage
const client = ApiClient.getInstance();
```

### 2. Module-Level Singleton (Recommended)

In modern JavaScript/TypeScript, using module-level singletons is often cleaner:

```typescript
// apiClient.ts
let instance: ApiClient | null = null;

export class ApiClient {
  // Constructor can be public as the singleton is enforced by the module
  constructor() {
    // Initialization
  }
  
  // Methods...
}

export function getApiClient(): ApiClient {
  if (!instance) {
    instance = new ApiClient();
    console.log('API client initialized');
  }
  return instance;
}

// Export a convenient default instance
export const apiClient = getApiClient();
export default apiClient;
```

### 3. Lazy Initialization Pattern

For expensive resources, use lazy initialization:

```typescript
// databaseClient.ts
let instance: DatabaseClient | null = null;

export class DatabaseClient {
  private connection: any = null;
  
  private constructor() {
    // Don't connect immediately
  }
  
  async connect() {
    if (!this.connection) {
      this.connection = await createDatabaseConnection();
    }
    return this.connection;
  }
}

export function getDatabaseClient(): DatabaseClient {
  if (!instance) {
    instance = new DatabaseClient();
  }
  return instance;
}
```

## Best Practices for External Service Clients

### 1. Clear Singleton Enforcement

Always make it explicit that a service client is a singleton:

```typescript
// supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Private instance variable
let instance: SupabaseClient | null = null;

// Config
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Get the Supabase client instance - implements Singleton pattern
 */
export function getSupabaseClient(): SupabaseClient {
  if (instance) {
    return instance;
  }
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }
  
  instance = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  });
  
  return instance;
}

// Export an instance for convenience
export const supabase = getSupabaseClient();
export default supabase;
```

### 2. Reset Capability for Testing

Provide a method to reset the singleton for testing purposes:

```typescript
// Only exposed in test environments
export function resetClientForTesting(): void {
  if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
    instance = null;
    console.log('Client reset for testing');
  } else {
    console.warn('Attempted to reset client outside of testing environment');
  }
}
```

### 3. Configuration Validation

Always validate configuration before creating the singleton:

```typescript
export function getClient(): Client {
  if (instance) return instance;
  
  // Validate configuration
  if (!apiKey) {
    throw new Error('API key is required');
  }
  
  if (!baseUrl) {
    console.warn('Base URL not provided, using default');
    baseUrl = 'https://api.default.com';
  }
  
  instance = new Client(apiKey, baseUrl);
  return instance;
}
```

### 4. Logging and Debugging

Add clear logging around singleton initialization:

```typescript
export function getClient(): Client {
  if (instance) {
    console.debug('Returning existing client instance');
    return instance;
  }
  
  console.log('Initializing new client instance');
  instance = new Client();
  return instance;
}
```

## Using Singletons in React Components

### 1. Direct Usage

For simple cases, direct usage is fine:

```tsx
import { supabase } from '@/lib/supabaseClient';

function UserProfile() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }
    
    fetchUser();
  }, []);
  
  // Component code...
}
```

### 2. Through Custom Hooks (Recommended)

For better abstraction, use custom hooks:

```tsx
// useSupabase.ts
import { supabase } from '@/lib/supabaseClient';

export function useSupabase() {
  return supabase;
}

// useAuth.ts
import { useSupabase } from './useSupabase';

export function useAuth() {
  const supabase = useSupabase();
  
  // Authentication methods using the singleton
  const login = async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };
  
  // More methods...
  
  return { login, /* other methods */ };
}

// In components
function LoginForm() {
  const { login } = useAuth();
  
  // Component code using login...
}
```

## Anti-patterns to Avoid

### 1. Creating New Instances in Components

```tsx
// ❌ INCORRECT: Creates a new client for every component instance
function UserData() {
  // This creates a new client on every render!
  const supabase = createClient(url, key);
  
  // Component code...
}
```

### 2. Inconsistent Access Patterns

```tsx
// ❌ INCORRECT: Mixing direct imports and getInstance
// In file1.ts
import { supabase } from '@/lib/supabaseClient';

// In file2.ts
import { getSupabaseClient } from '@/lib/supabaseClient';
const supabase = getSupabaseClient();
```

### 3. Multiple Files Implementing the Same Singleton

```tsx
// ❌ INCORRECT: Multiple files creating the same client
// supabaseClient.ts
export const supabase = createClient(url, key);

// authClient.ts
export const supabase = createClient(url, key); // Duplicate!
```

### 4. Initialization Without Error Handling

```tsx
// ❌ INCORRECT: No error handling for missing config
export function getClient() {
  if (!instance) {
    instance = new Client(apiKey); // Will break if apiKey is undefined
  }
  return instance;
}
```

## Best Practices Summary

1. **Use module-level singletons** for simplicity and clarity
2. **Provide a getter function** to enforce the singleton pattern
3. **Export a default instance** for convenience
4. **Validate configuration** before creating the instance
5. **Add proper logging** for debugging
6. **Provide reset capabilities** for testing
7. **Use custom hooks** to access singletons in React components
8. **Be consistent** with access patterns
9. **Centralize implementation** in a single file per service
10. **Handle errors gracefully** for missing configuration

Following these best practices will ensure that your application uses external services efficiently, maintains consistent state, and avoids common pitfalls associated with service client management.
