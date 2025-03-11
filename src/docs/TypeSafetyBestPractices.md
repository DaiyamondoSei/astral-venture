# Type Safety Best Practices

This document outlines best practices for maintaining type safety throughout the application.

## 1. Core Type System

### 1.1 Type Organization

- **Centralize types in dedicated files**: Organize types by domain in dedicated files (e.g., `types.ts`).
- **Use namespaces or prefix conventions**: Group related types using namespaces or naming prefixes.
- **Create consistent naming patterns**: Follow a consistent naming pattern for all types.

```typescript
// Good: Types are organized and grouped
// src/utils/validation/types.ts
export interface ValidationErrorDetail { /* ... */ }
export interface ValidationResult<T = unknown> { /* ... */ }
export type Validator<T = unknown> = /* ... */;

// Bad: Types are scattered across multiple files with inconsistent naming
// src/components/Form.tsx
interface FormError { /* ... */ }

// src/utils/validate.ts
type ValidatorFunction = /* ... */;
```

### 1.2 Type Exports and Imports

- **Export all types explicitly**: Always use named exports for types.
- **Re-export types from index files**: Create barrel exports for easier imports.
- **Import types consistently**: Use consistent import patterns.

```typescript
// Good: Types are explicitly exported and then re-exported in an index
// src/utils/validation/types.ts
export interface ValidationResult<T = unknown> { /* ... */ }

// src/utils/validation/index.ts
export * from './types';
export * from './ValidationError';

// Consuming file
import { ValidationResult } from '@/utils/validation';

// Bad: Inconsistent exports and imports
// Direct import from nested file
import { ValidationResult } from '@/utils/validation/types';
```

### 1.3 Type Guards

- **Create type guards for all complex types**: Implement runtime type checking with type guards.
- **Export type guards alongside types**: Keep type guards with their corresponding types.
- **Use descriptive names for type guards**: Prefix type guards with 'is' for clarity.

```typescript
// Good: Type guard exported with its type
export interface PerformanceMetric { /* ... */ }

export function isPerformanceMetric(obj: unknown): obj is PerformanceMetric {
  return (
    typeof obj === 'object' && 
    obj !== null && 
    'metric_name' in obj && 
    'value' in obj && 
    'type' in obj
  );
}

// Bad: Missing type guard or type guard in a different file
export interface PerformanceMetric { /* ... */ }
// No type guard provided
```

## 2. Type Safety at Boundaries

### 2.1 External Data Validation

- **Validate all external data**: Always validate data from APIs, user input, or localStorage.
- **Use type guards at system boundaries**: Apply type guards where data enters your system.
- **Provide meaningful error messages**: Include detailed information when validation fails.

```typescript
// Good: Validate API response data
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();
  
  if (!isUser(data)) {
    throw new ValidationError('Invalid user data', [
      { path: '', message: 'API returned invalid user format' }
    ]);
  }
  
  return data;
}

// Bad: No validation of external data
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return await response.json(); // Unsafe!
}
```

### 2.2 Form Data Validation

- **Validate form inputs with schemas**: Use validation schemas for form inputs.
- **Transform data to correct types**: Convert string inputs to appropriate types.
- **Provide immediate feedback**: Display validation errors as users type.

```typescript
// Good: Schema-based validation
const userSchema = {
  name: composeValidators(required('name'), hasLength({ min: 2, max: 50 })),
  age: composeValidators(required('age'), isNumber),
  email: composeValidators(required('email'), isEmail)
};

function validateUserForm(formData: unknown): User {
  return validateData(formData, userSchema, { abortEarly: false });
}

// Bad: Manual validation without schemas
function validateUserForm(formData: any): User {
  if (!formData.name) {
    throw new Error('Name is required');
  }
  return formData as User; // Unsafe casting
}
```

## 3. Common Type Patterns

### 3.1 Discriminated Unions

- **Use discriminated unions for state**: Model different states with discriminated unions.
- **Include discriminant property**: Always include a type discriminant property.
- **Perform exhaustive checks**: Use switch statements with exhaustive checks.

```typescript
// Good: Discriminated union for async state
type AsyncState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function renderData<T>(state: AsyncState<T>) {
  switch (state.status) {
    case 'idle':
      return <div>Not started</div>;
    case 'loading':
      return <div>Loading...</div>;
    case 'success':
      return <div>Data: {JSON.stringify(state.data)}</div>;
    case 'error':
      return <div>Error: {state.error.message}</div>;
  }
}

// Bad: Using boolean flags for state
interface DataState<T> {
  isLoading: boolean;
  error?: Error;
  data?: T;
}
```

### 3.2 Branded Types

- **Use branded types for identifiers**: Create distinct types for different ID types.
- **Add validation to type factories**: Validate data when creating branded types.
- **Use consistent branding pattern**: Follow a consistent pattern for branded types.

```typescript
// Good: Branded types for IDs
type Brand<K, T> = K & { __brand: T };

type UserId = Brand<string, 'user-id'>;
type PostId = Brand<string, 'post-id'>;

function createUserId(id: string): UserId {
  if (!/^user_[a-z0-9]{24}$/.test(id)) {
    throw new Error('Invalid user ID format');
  }
  return id as UserId;
}

// This won't compile - type mismatch
function getPostById(id: UserId): Post {
  // Error: Argument of type 'UserId' is not assignable to parameter of type 'PostId'
  return fetchPost(id); // Type error!
}

// Bad: Using string for all IDs
function getPostById(id: string): Post {
  return fetchPost(id); // No type safety between different ID types
}
```

### 3.3 Generic Components

- **Use generics for reusable components**: Make components type-safe with generics.
- **Provide reasonable defaults**: Use default type parameters for better usability.
- **Constrain generic parameters**: Use constraints to ensure required properties.

```typescript
// Good: Generic component with constraints
interface ListProps<T extends { id: string }> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor?: (item: T) => string;
}

function List<T extends { id: string }>({ 
  items, 
  renderItem,
  keyExtractor = (item) => item.id
}: ListProps<T>) {
  return (
    <ul>
      {items.map((item) => (
        <li key={keyExtractor(item)}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
}

// Bad: Non-generic component with any type
interface ListProps {
  items: any[];
  renderItem: (item: any) => React.ReactNode;
}
```

## 4. Type-Safe API Patterns

### 4.1 API Response Types

- **Define explicit types for API responses**: Create types for all API responses.
- **Use discriminated unions for different response types**: Model success/error with unions.
- **Validate responses against schemas**: Validate responses against expected schemas.

```typescript
// Good: Type-safe API response handling
interface SuccessResponse<T> {
  status: 'success';
  data: T;
}

interface ErrorResponse {
  status: 'error';
  error: {
    message: string;
    code: string;
  };
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const result = await response.json() as ApiResponse<T>;
  
  if (result.status === 'error') {
    throw new Error(`API error: ${result.error.message}`);
  }
  
  return result.data;
}

// Bad: Untyped API response handling
async function fetchData(url: string): Promise<any> {
  const response = await fetch(url);
  return await response.json();
}
```

### 4.2 Request Parameters

- **Type request parameters explicitly**: Define types for request parameters.
- **Validate request parameters**: Validate parameters before making requests.
- **Use branded types for sensitive parameters**: Use branded types for sensitive data.

```typescript
// Good: Typed request parameters with validation
interface UserSearchParams {
  query: string;
  limit?: number;
  offset?: number;
}

function validateSearchParams(params: unknown): UserSearchParams {
  const validated = validateData<UserSearchParams>(
    params,
    {
      query: required('query'),
      limit: createTypeGuard(isNumber, 'RANGE_ERROR', 'Limit must be a number'),
      offset: createTypeGuard(isNumber, 'RANGE_ERROR', 'Offset must be a number')
    },
    { allowUnknown: true }
  );
  
  return validated;
}

async function searchUsers(params: UserSearchParams): Promise<User[]> {
  // Safe to use params after validation
  const url = `/api/users?query=${encodeURIComponent(params.query)}`;
  // ...rest of the implementation
}

// Bad: Untyped request parameters
async function searchUsers(params: any): Promise<User[]> {
  const url = `/api/users?query=${params.query}`;
  // ...rest of the implementation
}
```

## 5. Testing Type Safety

### 5.1 Type Testing

- **Write tests for type guards**: Test type guards with various inputs.
- **Test validation functions**: Ensure validation functions handle edge cases.
- **Use TypeScript-aware testing tools**: Leverage tools that understand TypeScript types.

```typescript
// Good: Testing type guards
describe('isPerformanceMetric', () => {
  test('returns true for valid metrics', () => {
    const validMetric = {
      metric_name: 'fps',
      value: 60,
      category: 'performance',
      type: 'render',
      timestamp: Date.now()
    };
    
    expect(isPerformanceMetric(validMetric)).toBe(true);
  });
  
  test('returns false for invalid metrics', () => {
    expect(isPerformanceMetric(null)).toBe(false);
    expect(isPerformanceMetric({})).toBe(false);
    expect(isPerformanceMetric({ metric_name: 'test' })).toBe(false);
  });
});

// Bad: No tests for type-related functionality
```

### 5.2 Validation Testing

- **Test validation with both valid and invalid data**: Test all validation paths.
- **Test error messages**: Verify error messages are helpful and accurate.
- **Test edge cases**: Include tests for boundary conditions.

```typescript
// Good: Comprehensive validation testing
describe('validateUserData', () => {
  test('accepts valid user data', () => {
    const validUser = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30
    };
    
    expect(() => validateUserData(validUser)).not.toThrow();
    expect(validateUserData(validUser)).toEqual(validUser);
  });
  
  test('rejects invalid email', () => {
    const invalidUser = {
      name: 'John Doe',
      email: 'not-an-email',
      age: 30
    };
    
    expect(() => validateUserData(invalidUser)).toThrow(ValidationError);
    expect(() => validateUserData(invalidUser)).toThrow(/email/i);
  });
  
  // More tests for other validation rules
});

// Bad: Missing validation tests or only testing happy path
```

## 6. Performance Considerations

### 6.1 Type Guard Efficiency

- **Optimize type guards for performance**: Make type guards efficient.
- **Cache validation results when appropriate**: Avoid redundant validations.
- **Use specialized validation libraries**: Leverage optimized libraries for validation.

```typescript
// Good: Efficient type guard with early returns
function isValidMetric(obj: unknown): obj is Metric {
  if (typeof obj !== 'object' || obj === null) return false;
  if (!('name' in obj) || !('value' in obj)) return false;
  
  const metric = obj as Partial<Metric>;
  return (
    typeof metric.name === 'string' &&
    typeof metric.value === 'number'
  );
}

// Bad: Inefficient type guard
function isValidMetric(obj: unknown): obj is Metric {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'name' in obj &&
    'value' in obj &&
    typeof obj.name === 'string' &&
    typeof obj.value === 'number'
  );
}
```

### 6.2 Validation Caching

- **Cache validation results for frequently used objects**: Avoid redundant validation.
- **Implement memoization for expensive validators**: Cache results of complex validations.
- **Skip validation in performance-critical paths**: Use development-only validation where appropriate.

```typescript
// Good: Cached validation for improved performance
const validationCache = new WeakMap<object, ValidationResult>();

function validateWithCache<T>(data: unknown, validator: Validator<T>): ValidationResult<T> {
  if (typeof data !== 'object' || data === null) {
    return validator(data);
  }
  
  if (validationCache.has(data)) {
    return validationCache.get(data) as ValidationResult<T>;
  }
  
  const result = validator(data);
  validationCache.set(data, result);
  return result;
}

// Bad: Redundant validation without caching
function processItems(items: unknown[]): ProcessedItem[] {
  return items
    .filter(item => isValidItem(item)) // Validates each item
    .map(item => {
      validateItem(item); // Validates again unnecessarily
      return processItem(item);
    });
}
```

## 7. Error Handling

### 7.1 Error Types

- **Create specific error classes**: Define error classes for different error types.
- **Include detailed error information**: Add context to error objects.
- **Use discriminated unions for errors**: Model error types as discriminated unions.

```typescript
// Good: Specialized error types
class ValidationError extends Error {
  constructor(
    message: string,
    public readonly details: ValidationErrorDetail[],
    public readonly code: string = 'VALIDATION_ERROR'
  ) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

class NetworkError extends Error {
  constructor(
    message: string,
    public readonly url: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

// Bad: Generic errors without context
throw new Error('Validation failed');
throw new Error('Network request failed');
```

### 7.2 Error Type Guards

- **Create type guards for error types**: Implement type guards for error identification.
- **Use type narrowing in catch blocks**: Narrow down error types in catch blocks.
- **Handle specific error types**: Respond differently to different error types.

```typescript
// Good: Error type guards and handling
function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

try {
  // Some operation that might throw
} catch (error: unknown) {
  if (isValidationError(error)) {
    // Handle validation error
    displayValidationErrors(error.details);
  } else if (isNetworkError(error)) {
    // Handle network error
    retryRequest(error.url);
  } else {
    // Handle generic error
    reportUnexpectedError(error);
  }
}

// Bad: Generic error handling
try {
  // Some operation that might throw
} catch (error: any) {
  console.error('Operation failed', error);
}
```

## 8. Documentation

### 8.1 Type Documentation

- **Document complex types with JSDoc**: Add JSDoc comments to complex types.
- **Include examples in documentation**: Provide examples of type usage.
- **Document type constraints and invariants**: Document constraints that types must satisfy.

```typescript
// Good: Well-documented types
/**
 * Represents a validation error detail.
 * Contains information about a specific validation failure.
 *
 * @example
 * const errorDetail: ValidationErrorDetail = {
 *   path: 'user.email',
 *   message: 'Email is invalid',
 *   code: 'FORMAT_ERROR',
 *   rule: 'email'
 * };
 */
export interface ValidationErrorDetail {
  /** Path to the field with the error (e.g., 'user.email') */
  path: string;
  
  /** User-friendly error message */
  message: string;
  
  /** Error code for programmatic handling */
  code?: string;
  
  /** Validation rule that failed */
  rule?: string;
  
  /** Value that failed validation */
  value?: unknown;
}

// Bad: Undocumented types
export interface ValidationErrorDetail {
  path: string;
  message: string;
  code?: string;
  rule?: string;
  value?: unknown;
}
```

### 8.2 Type Usage Documentation

- **Document type constraints**: Document expected properties and behavior.
- **Provide usage examples**: Show examples of proper type usage.
- **Document type errors**: List common type errors and how to fix them.

```typescript
// Good: Documented type usage
/**
 * Validates user data against the user schema.
 *
 * @param userData - The user data to validate
 * @returns The validated user data
 * @throws {ValidationError} If validation fails
 *
 * @example
 * // Valid user data
 * const userData = {
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   age: 30
 * };
 * 
 * try {
 *   const validatedUser = validateUserData(userData);
 *   // Use validated user data
 * } catch (error) {
 *   if (isValidationError(error)) {
 *     // Handle validation error
 *   }
 * }
 */
function validateUserData(userData: unknown): User {
  // Implementation
}

// Bad: Undocumented function
function validateUserData(userData: unknown): User {
  // Implementation
}
```

## 9. Versioning and Migration

### 9.1 Type Versioning

- **Version types for breaking changes**: Create new versions for significant changes.
- **Provide migration utilities**: Create utilities to migrate between versions.
- **Document type evolution**: Document changes between versions.

```typescript
// Good: Versioned types with migration utilities
// Version 1
export interface UserV1 {
  id: string;
  name: string;
  email: string;
}

// Version 2
export interface UserV2 {
  id: string;
  displayName: string; // Changed from 'name'
  email: string;
  createdAt: string; // New field
}

// Migration utility
export function migrateUserV1ToV2(user: UserV1): UserV2 {
  return {
    id: user.id,
    displayName: user.name, // Map name to displayName
    email: user.email,
    createdAt: new Date().toISOString() // Add default for new field
  };
}

// Bad: Breaking type changes without versioning
// Before
export interface User {
  id: string;
  name: string;
  email: string;
}

// After - breaking change with no migration path
export interface User {
  id: string;
  displayName: string; // Changed from 'name'
  email: string;
  createdAt: string; // New required field
}
```

### 9.2 Backwards Compatibility

- **Maintain backwards compatibility**: Ensure changes don't break existing code.
- **Use optional properties for additions**: Make new properties optional.
- **Deprecate old types gradually**: Mark old types as deprecated before removal.

```typescript
// Good: Backwards-compatible type evolution
// Original interface
export interface Connection {
  source: string;
  target: string;
  // ... other properties
}

// Updated interface with backwards compatibility
export interface Connection {
  /** @deprecated Use 'from' instead */
  source?: string;
  /** @deprecated Use 'to' instead */
  target?: string;
  
  // New properties
  from?: string;
  to?: string;
  
  // ... other properties
}

// Migration helper
export function normalizeConnection(conn: Connection): Connection {
  return {
    ...conn,
    from: conn.from || conn.source,
    to: conn.to || conn.target
  };
}

// Bad: Breaking change with no backwards compatibility
export interface Connection {
  // Removed properties without warning
  // source: string; 
  // target: string;
  
  // New required properties
  from: string;
  to: string;
}
```

By following these best practices, we can maintain type safety throughout our application and prevent many common issues.
