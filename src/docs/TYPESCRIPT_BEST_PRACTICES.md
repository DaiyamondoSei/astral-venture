
# TypeScript Best Practices

## Common Anti-Patterns and Their Solutions

### 1. The Type vs. Value Pattern

#### Problem
One of the most frequent errors in our codebase is:
```typescript
// ERROR: 'DeviceCapability' only refers to a type, but is being used as a value here
if (capability === DeviceCapability.HIGH_END) { ... }
```

This happens because TypeScript types don't exist at runtime, only at compile time.

#### Solution: The Type-Value Pattern
For any concept that needs both type checking and runtime values:

1. Define a type for compile-time checking
2. Create a matching constant object for runtime use

```typescript
// Define the type for type checking
export type DeviceCapability = 'low-end' | 'mid-range' | 'high-end';

// Define constants for runtime usage
export const DeviceCapabilities = {
  LOW_END: 'low-end' as DeviceCapability,
  MID_RANGE: 'mid-range' as DeviceCapability,
  HIGH_END: 'high-end' as DeviceCapability
};

// Usage in type positions
function configureDevice(capability: DeviceCapability) { ... }

// Usage in value positions
if (capability === DeviceCapabilities.HIGH_END) { ... }
```

#### Naming Convention
- Use singular for the type: `DeviceCapability`
- Use plural for the constants object: `DeviceCapabilities`

### 2. Interface Synchronization

#### Problem
When two components or files define interfaces for the same concept, they can drift apart over time.

#### Solution: Single Source of Truth
1. Define interfaces in a shared location
2. Export and import from that location
3. Consider using barrel exports (index.ts files)

```typescript
// src/types/ai.ts
export interface AIResponse {
  answer: string;
  insights: any[];
  meta: Record<string, any>;
}

// Usage across the codebase
import { AIResponse } from '@/types/ai';
```

When you need to extend an interface for specific use cases, extend the original:

```typescript
import { AIResponse } from '@/types/ai';

// Extend with additional fields
export interface EnhancedAIResponse extends AIResponse {
  additionalField: string;
}
```

### 3. Import Path Consistency

#### Problem
Inconsistent import paths leading to duplicate imports and type mismatches.

#### Solution: Path Aliases and Barrel Exports

1. Use consistent path aliases (e.g., '@/components')
2. Create barrel exports (index.ts) in directories
3. Be aware of case sensitivity issues in imports

```typescript
// BAD - inconsistent paths
import { Button } from '../../../components/ui/Button';
import { Input } from 'src/components/ui/input';

// GOOD - consistent path aliases
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// BEST - barrel exports
import { Button, Input } from '@/components/ui';
```

### 4. Proper Error Handling with Types

#### Problem
Inconsistent error handling leading to type mismatches.

#### Solution: Error Types and Consistent Result Pattern

1. Define error types
2. Use a Result pattern for error handling
3. Be consistent with error fields (error vs errors)

```typescript
// Define error type
export interface ValidationErrorDetail {
  path: string;
  message: string;
  code: ValidationErrorCode;
  severity: ErrorSeverity;
}

// Use consistent Result pattern
export interface ValidationResult<T> {
  valid: boolean;
  value?: T;
  errors?: ValidationErrorDetail[];
}
```

### 5. Avoiding "any" and "unknown"

#### Problem
Overuse of `any` reduces type safety.

#### Solution: Prefer Strong Types or "unknown" with Type Guards

1. Define proper interfaces instead of using `any`
2. If type is truly unknown, use `unknown` (safer than `any`)
3. Use type guards to narrow types

```typescript
// BAD
function processData(data: any): any {
  return data.value;
}

// BETTER
function processData(data: unknown): unknown {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return data.value;
  }
  throw new Error('Invalid data format');
}

// BEST
interface DataObject {
  value: string;
}

function isDataObject(obj: unknown): obj is DataObject {
  return typeof obj === 'object' && obj !== null && 'value' in obj;
}

function processData(data: unknown): string {
  if (isDataObject(data)) {
    return data.value;
  }
  throw new Error('Invalid data format');
}
```

## TypeScript Tools and Techniques

### 1. Use Utility Types

TypeScript provides many utility types to make common transformations easier:

```typescript
// Extract properties
type UserKeys = keyof User;

// Make properties optional
type PartialUser = Partial<User>;

// Make properties required
type RequiredUser = Required<User>;

// Pick certain properties
type UserCredentials = Pick<User, 'username' | 'password'>;

// Omit certain properties
type PublicUser = Omit<User, 'password' | 'email'>;
```

### 2. Function Overloads

Use function overloads for functions that can accept multiple argument types:

```typescript
// Overloads
function formatValue(value: string): string;
function formatValue(value: number): string;
function formatValue(value: boolean): string;

// Implementation
function formatValue(value: string | number | boolean): string {
  if (typeof value === 'string') {
    return value.trim();
  } else if (typeof value === 'number') {
    return value.toFixed(2);
  } else {
    return value ? 'Yes' : 'No';
  }
}
```

### 3. Use Branded Types for Type Safety

Branded types can prevent type confusion between values that have the same base type:

```typescript
// Create branded types
type UserId = string & { readonly __brand: unique symbol };
type ProductId = string & { readonly __brand: unique symbol };

// Create factory functions
function createUserId(id: string): UserId {
  return id as UserId;
}

function createProductId(id: string): ProductId {
  return id as ProductId;
}

// Now these cannot be confused
function getUser(id: UserId) { /* ... */ }
function getProduct(id: ProductId) { /* ... */ }

// This will error:
getUser(createProductId('123')); // Type error!
```

## Conclusion

By following these best practices consistently, we can create a more maintainable and type-safe codebase. Remember to leverage TypeScript's powerful type system and avoid common anti-patterns that reduce type safety.
