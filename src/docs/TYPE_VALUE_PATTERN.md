
# Type-Value Pattern

## Problem

In TypeScript, we often encounter the error:

```typescript
// ERROR: 'ErrorCategory' only refers to a type, but is being used as a value here.
if (error.category === ErrorCategory.VALIDATION) { ... }
```

This happens because TypeScript types exist only at compile-time, yet we try to use them at runtime.

## Solution: The Type-Value Pattern

The Type-Value Pattern solves this by separating types (compile-time) from values (runtime):

```typescript
// TYPE definition (for compile-time checking)
export type ErrorCategory = 'validation' | 'network' | 'api' | 'unknown';

// VALUE definition (for runtime usage)
export const ErrorCategories = {
  VALIDATION: 'validation' as ErrorCategory,
  NETWORK: 'network' as ErrorCategory,
  API: 'api' as ErrorCategory,
  UNKNOWN: 'unknown' as ErrorCategory
} as const;

// CORRECT usage
if (error.category === ErrorCategories.VALIDATION) {
  // This works correctly
}
```

## Benefits of This Pattern

1. **Type Safety**: The compiler ensures we only use valid values from the type.
2. **Runtime Access**: We can use the constants at runtime in JavaScript.
3. **IntelliSense Support**: IDEs provide autocompletion for both types and values.
4. **Refactoring Support**: Renaming is safer since the compiler tracks both usages.
5. **Single Source of Truth**: Types and values stay synchronized.

## Implementation Guidelines

### 1. Basic Implementation

```typescript
// File: types.ts
export type Status = 'pending' | 'active' | 'completed' | 'failed';

// File: constants.ts
import { Status } from './types';

export const Statuses = {
  PENDING: 'pending' as Status,
  ACTIVE: 'active' as Status,
  COMPLETED: 'completed' as Status,
  FAILED: 'failed' as Status
} as const;
```

### 2. Recommended File Structure

For smaller systems:
```
src/types/core/domain/
  ├── types.ts       # Type definitions
  └── constants.ts   # Runtime constants
```

For larger systems:
```
src/types/core/domain/
  ├── types/
  │   ├── status.ts
  │   └── user.ts
  └── constants/
      ├── status.ts
      └── user.ts
```

### 3. Export Pattern

Use barrel exports to simplify imports:

```typescript
// File: types/index.ts
export * from './types';
export * from './constants';

// Usage elsewhere
import { Status, Statuses } from '@/types';

function checkStatus(status: Status) {
  if (status === Statuses.COMPLETED) {
    // ...
  }
}
```

### 4. Type Guards

Add type guards for runtime validation:

```typescript
export function isValidStatus(value: string): value is Status {
  return Object.values(Statuses).includes(value as Status);
}

// Usage
function processStatus(status: string) {
  if (isValidStatus(status)) {
    // TypeScript knows 'status' is of type 'Status' here
  } else {
    // Handle invalid status
  }
}
```

## Common Pitfalls

### 1. Using TypeScript Enums

TypeScript enums mix types and values, causing confusion:

```typescript
// NOT RECOMMENDED
enum Status {
  PENDING = 'pending',
  ACTIVE = 'active'
}
```

### 2. Inconsistent Naming

Keep naming consistent:

```typescript
// GOOD
type ErrorCategory = '...';
const ErrorCategories = { ... };

// BAD - inconsistent plurality
type ErrorCategory = '...';
const ErrorCategory = { ... };
```

### 3. Missing 'as const'

Without `as const`, TypeScript assumes broader types:

```typescript
// Without 'as const', TypeScript sees this as { PENDING: string, ... }
export const Statuses = { PENDING: 'pending' as Status, ... }

// WITH 'as const', TypeScript sees specific literals
export const Statuses = { PENDING: 'pending' as Status, ... } as const;
```

## Real-World Example

```typescript
// types.ts
export type NotificationType = 'info' | 'warning' | 'error' | 'success';

// constants.ts
import { NotificationType } from './types';

export const NotificationTypes = {
  INFO: 'info' as NotificationType,
  WARNING: 'warning' as NotificationType,
  ERROR: 'error' as NotificationType,
  SUCCESS: 'success' as NotificationType
} as const;

// Component usage
function Notification({ type = NotificationTypes.INFO, message }: NotificationProps) {
  // Type-safe usage at runtime
  const icon = type === NotificationTypes.ERROR ? <AlertIcon /> : <InfoIcon />;
  
  return (
    <div className={`notification notification-${type}`}>
      {icon}
      <p>{message}</p>
    </div>
  );
}
```

By consistently applying this pattern, you'll eliminate a whole class of TypeScript errors while maintaining runtime type safety.
