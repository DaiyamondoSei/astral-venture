
# Database & Type Safety Best Practices

## Overview

This document provides best practices for maintaining a strong type-safe relationship between our Supabase database and TypeScript codebase. Following these practices will reduce runtime errors and improve code maintainability.

## Database Schema Management

### 1. Single Source of Truth for Database Types

- **Use the central type definition file**: Always import table types from `src/types/database.ts`
- **Never create duplicate table type definitions**: If you need a table type, import it rather than redefining it
- **Keep the database.ts file in sync with schema changes**: Update the type definitions when the database schema changes

### 2. Type-Safe Database Operations

- **Use the DatabaseUtils for database operations**: This provides type checking for your queries
- **Don't use raw supabase client directly**: This bypasses type checking for table names and columns
- **Type casting should be a last resort**: If you must type cast, document why with a comment

```typescript
// GOOD: Type-safe database access
import { selectFrom } from '@/utils/database/DatabaseUtils';
import { Challenge } from '@/types/database';

const getChallenges = async () => {
  const { data } = await selectFrom('challenges')
    .eq('category', 'meditation')
    .order('level');
  return data as Challenge[];
};

// BAD: Unsafe database access
import { supabase } from '@/lib/supabaseClient';

const getChallenges = async () => {
  const { data } = await supabase
    .from('challanges') // Typo not caught by TypeScript
    .select('*')
    .eq('category', 'meditation');
  return data;
};
```

### 3. Schema Synchronization Workflow

1. **Make database changes in Supabase**: Use the Supabase dashboard or migrations
2. **Generate updated TypeScript types**: Use the Supabase CLI or API
3. **Update the database.ts file**: Copy the generated types to our central type definition file
4. **Run type checking**: Ensure your changes don't break existing code
5. **Fix type errors**: Update code to match the new schema

## Component Prop Types

### 1. Component Prop Type Patterns

- **Explicitly define prop interfaces**: Every component should have a prop interface
- **Use descriptive property names**: Make prop names clear and consistent
- **Add JSDoc comments**: Document complex props or behavior

```typescript
// GOOD: Clear, documented props
/**
 * Button component with configurable variants
 */
interface ButtonProps {
  /** The button's label text */
  children: React.ReactNode;
  /** The visual style variant */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Called when the button is clicked */
  onClick?: () => void;
  /** Disables the button when true */
  disabled?: boolean;
}

// BAD: Vague, undocumented props
interface Props {
  c: React.ReactNode;
  v?: string;
  o?: () => void;
  d?: boolean;
}
```

### 2. Prop Validation Strategies

- **Use TypeScript to validate props at compile time**: Take advantage of TypeScript's static checking
- **Consider runtime validation for complex props**: Use Zod or similar for runtime validation of critical props
- **Use default values for optional props**: Always provide sensible defaults

```typescript
// GOOD: Default values and validation
const Button = ({
  children,
  variant = 'primary',
  onClick,
  disabled = false
}: ButtonProps) => {
  // Implementation
};

// BAD: Missing defaults, no validation
const Button = (props: Props) => {
  const { c, v, o, d } = props;
  // Implementation
};
```

## Import/Export Best Practices

### 1. Named Exports vs Default Exports

- **Prefer named exports**: They are more explicit and support better tooling
- **Use consistent export patterns**: Stick to either named or default exports within a module
- **Use re-exports for public API**: Create index files to expose a clean public API

```typescript
// GOOD: Named exports
export interface User { /* ... */ }
export function createUser() { /* ... */ }

// GOOD: Re-exports in index.ts
export * from './user';
export * from './profile';

// BAD: Mixing export styles
export interface User { /* ... */ }
export default function createUser() { /* ... */ }
```

### 2. Import Organization

- **Group imports by source**: Standard library, third-party, local
- **Sort imports alphabetically**: Makes it easier to find imports and avoid duplicates
- **Use absolute imports for application code**: Use relative imports only for files in the same directory

```typescript
// GOOD: Organized imports
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Challenge } from '@/types/database';
import { formatDate } from '@/utils/formatters';

import { ChallengeItem } from './ChallengeItem';

// BAD: Disorganized imports
import { Button } from '@/components/ui/button';
import { ChallengeItem } from './ChallengeItem';
import { useState, useEffect } from 'react';
import { formatDate } from '@/utils/formatters';
import { useToast } from '@/components/ui/use-toast';
import { Challenge } from '@/types/database';
```

## Type vs Value Confusion

### 1. TypeScript Types vs Runtime Values

- **Remember types don't exist at runtime**: Types are compile-time only
- **Mirror types with runtime constants**: Create runtime constants for enum-like types
- **Use typeof operator for type references**: When you need a type from a value

```typescript
// GOOD: Type and value separation
// DeviceCapability.ts

// Type (compile-time only)
export type DeviceCapability = 'high-performance' | 'standard-performance' | 'low-performance';

// Runtime constants (available at runtime)
export const DeviceCapabilities = {
  HIGH: 'high-performance' as DeviceCapability,
  STANDARD: 'standard-performance' as DeviceCapability,
  LOW: 'low-performance' as DeviceCapability
};

// Usage
import { DeviceCapability, DeviceCapabilities } from './DeviceCapability';

// Type usage (compile-time)
const capability: DeviceCapability = 'high-performance';

// Value usage (runtime)
if (deviceCapability === DeviceCapabilities.HIGH) {
  enableHighPerformanceMode();
}

// BAD: Using type as value
if (deviceCapability === DeviceCapability.HIGH) { // Error: DeviceCapability is a type, not a value
  enableHighPerformanceMode();
}
```

### 2. Factory Functions for Type Safety

- **Use factory functions**: Create functions that ensure type safety between compile time and runtime
- **Add validation in factory functions**: Validate inputs to ensure they match expected types
- **Return typed values**: Use type assertions to tell TypeScript about the runtime type

```typescript
// GOOD: Factory function with validation
function createDeviceCapability(value: string): DeviceCapability {
  const validValues = ['high-performance', 'standard-performance', 'low-performance'];
  if (!validValues.includes(value)) {
    throw new Error(`Invalid device capability: ${value}`);
  }
  return value as DeviceCapability;
}

// Usage
const capability = createDeviceCapability('high-performance'); // Type-safe
```

## Conclusion

Following these best practices will help maintain type safety throughout the application, reducing runtime errors and improving code quality. Remember that TypeScript is a tool to help catch errors at compile time, but it's still important to use runtime validation where appropriate.
