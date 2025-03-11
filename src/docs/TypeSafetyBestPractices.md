
# Type Safety Best Practices

This document outlines best practices for maintaining type safety throughout the application.

## 1. Core Type System Organization

### 1.1 Type Directory Structure

Our type system is organized into a hierarchical structure:

```
src/types/
  ├── core/                 # Technical foundation types
  │   ├── base/             # Base primitive and utility types
  │   ├── validation/       # Validation system types
  │   ├── performance/      # Performance monitoring types
  │   └── security/         # Security and authentication types
  │
  ├── domain/               # Domain-specific types
  │   ├── achievement/      # Achievement system types
  │   ├── chakra/           # Chakra system types
  │   ├── energy/           # Energy system types
  │   └── meditation/       # Meditation system types
  │
  ├── ui/                   # UI component types
  │   ├── components/       # Component props and state
  │   ├── state/            # UI state management
  │   └── theme/            # Theming system
  │
  └── utils/                # Utility types
      ├── functional/       # Functional programming types
      ├── data/             # Data transformation types
      └── async/            # Asynchronous operation types
```

### 1.2 Type Export Strategy

Each type file should provide explicit exports using a consistent pattern:

```typescript
// Direct exports for primary types
export type MyType = { /* ... */ };
export interface MyInterface { /* ... */ }
export enum MyEnum { /* ... */ }

// Named exports for groups of related types
export type { TypeA, TypeB, TypeC } from './related';

// Re-exports from barrel files
export * from './submodule';
```

### 1.3 Barrel Files

Use barrel files (index.ts) to simplify imports:

```typescript
// src/types/core/index.ts
export * from './base/Primitives';
export * from './validation/ValidationTypes';
// etc.

// Import example
import { UUID, ValidationResult } from '@/types/core';
```

## 2. Type Safety Patterns

### 2.1 Branded Types

Use branded types for type-safe identifiers:

```typescript
// Type definition
type Brand<K, T> = K & { __brand: T };
type UserID = Brand<string, 'user-id'>;

// Factory function
function createUserID(id: string): UserID {
  if (!id.match(/^[a-z0-9]{24}$/)) {
    throw new Error('Invalid user ID format');
  }
  return id as UserID;
}

// Usage
const userId = createUserID('valid-id'); // UserID
getUser(userId); // Type safe
getUser('invalid'); // Error: Type 'string' is not assignable to parameter of type 'UserID'
```

### 2.2 Discriminated Unions

Use discriminated unions for state management:

```typescript
// Define state types with discriminator
type RequestState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

// Type-safe handling with exhaustive checking
function handleState<T>(state: RequestState<T>) {
  switch (state.status) {
    case 'idle':
      return <Idle />;
    case 'loading':
      return <Loading />;
    case 'success':
      return <Success data={state.data} />;
    case 'error':
      return <Error error={state.error} />;
    default:
      // TypeScript ensures all cases are handled
      const _exhaustiveCheck: never = state;
      return _exhaustiveCheck;
  }
}
```

### 2.3 Type Guards

Implement type guards for runtime type checking:

```typescript
// Type guard definition
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    typeof (value as any).id === 'string' &&
    typeof (value as any).name === 'string'
  );
}

// Usage
function processUser(data: unknown) {
  if (isUser(data)) {
    // data is now typed as User
    console.log(data.name);
  } else {
    // Handle invalid data
    console.error('Invalid user data');
  }
}
```

## 3. Validation System

### 3.1 Validation Types

Our validation system uses standardized types:

```typescript
// Validation result type
interface ValidationResult<T = unknown> {
  valid: boolean;
  error?: ValidationErrorDetail;
  errors?: ValidationErrorDetail[];
  validatedData?: T;
}

// Validation error detail
interface ValidationErrorDetail {
  path: string;
  message: string;
  code?: string;
  rule?: string;
  value?: unknown;
  type?: string;
  severity?: ValidationSeverity;
}

// Validator function type
type Validator<T = unknown> = (
  value: unknown, 
  context?: ValidationContext
) => ValidationResult<T>;
```

### 3.2 Multi-Phase Validation

Implement validation in phases:

```typescript
// Pre-validation: sanitize and normalize
function preValidate(data: unknown): unknown {
  if (typeof data === 'string') {
    return data.trim();
  }
  return data;
}

// Main validation: check types and constraints
function validate<T>(data: unknown, schema: ValidationSchema<T>): ValidationResult<T> {
  // Implementation
}

// Post-validation: business rules
function postValidate<T>(data: T): ValidationResult<T> {
  // Implementation
}

// Compose validation pipeline
function validateData<T>(data: unknown, schema: ValidationSchema<T>): ValidationResult<T> {
  const preprocessed = preValidate(data);
  const result = validate(preprocessed, schema);
  
  if (!result.valid || !result.validatedData) {
    return result;
  }
  
  return postValidate(result.validatedData);
}
```

## 4. Performance Optimizations

### 4.1 Type Caching

Cache validation results for performance:

```typescript
const validationCache = new WeakMap<object, ValidationResult>();

function validateWithCache<T>(
  data: unknown, 
  validator: Validator<T>
): ValidationResult<T> {
  // Skip caching for primitives
  if (typeof data !== 'object' || data === null) {
    return validator(data);
  }
  
  const cached = validationCache.get(data);
  if (cached) {
    return cached as ValidationResult<T>;
  }
  
  const result = validator(data);
  validationCache.set(data, result);
  return result;
}
```

### 4.2 Optimized Type Guards

Create efficient type guards:

```typescript
// Less efficient
function isUser(value: unknown): value is User {
  // All checks in one expression
  return typeof value === 'object' && 
    value !== null && 
    'id' in value && 
    'name' in value && 
    typeof value.id === 'string' && 
    typeof value.name === 'string';
}

// More efficient
function isUser(value: unknown): value is User {
  // Fast failure checks first
  if (typeof value !== 'object' || value === null) return false;
  if (!('id' in value) || !('name' in value)) return false;
  
  // Now safe to cast for remaining checks
  const user = value as Partial<User>;
  return typeof user.id === 'string' && typeof user.name === 'string';
}
```

## 5. Documentation

### 5.1 JSDoc Comments

Document types with JSDoc:

```typescript
/**
 * Represents a user in the system
 * 
 * @example
 * const user: User = {
 *   id: createUserID('user_123'),
 *   name: 'Jane Doe',
 *   email: 'jane@example.com'
 * };
 */
interface User {
  /** Unique identifier for the user */
  id: UserID;
  
  /** User's display name */
  name: string;
  
  /** User's email address */
  email: string;
  
  /** User's preference settings */
  preferences?: UserPreferences;
}
```

### 5.2 Type Examples

Include examples in documentation:

```typescript
/**
 * Validates user data against the schema
 * 
 * @param userData - The user data to validate
 * @returns ValidationResult with the validated user or error details
 * 
 * @example
 * // Valid user
 * const result = validateUser({
 *   name: 'John Doe',
 *   email: 'john@example.com'
 * });
 * 
 * if (result.valid && result.validatedData) {
 *   const user = result.validatedData;
 *   // Use validated user data
 * }
 */
function validateUser(userData: unknown): ValidationResult<User> {
  // Implementation
}
```

## 6. Best Practices Summary

1. **Organize types hierarchically** in a structured directory system
2. **Use barrel files** for simplified imports
3. **Implement branded types** for compile-time type safety
4. **Create discriminated unions** for state management
5. **Write efficient type guards** for runtime validation
6. **Document types thoroughly** with JSDoc and examples
7. **Optimize validation** with caching and fast-path checks
8. **Create centralized type exports** to avoid duplication
9. **Implement multi-phase validation** for complex data
10. **Use exhaustive checks** to ensure all cases are handled

By following these practices, we maintain type safety throughout the application while optimizing for performance and developer experience.
