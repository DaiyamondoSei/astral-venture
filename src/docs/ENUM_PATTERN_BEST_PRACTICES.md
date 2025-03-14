
# Enum Pattern Best Practices

## Problem

TypeScript's type system is erased at compile time. When we try to use types as values at runtime, we get errors like:

```
error TS2693: 'DeviceCapability' only refers to a type, but is being used as a value here.
```

This occurs frequently with enums, constants, and type definitions.

## Root Cause (5 Whys Analysis)

1. **Why do we get "X only refers to a type" errors?**  
   Because we're trying to use a TypeScript type (which exists only at compile time) as a value at runtime.

2. **Why are we trying to use types as values?**  
   Because we need both type checking and runtime access to the same constants.

3. **Why don't we use TypeScript enums?**  
   Because TypeScript enums have downsides: they generate unnecessary runtime code and can lead to unexpected behavior.

4. **Why do we have inconsistent patterns for types and values?**  
   Because we didn't have a standardized approach for defining entities that need to exist as both types and values.

5. **Why didn't we standardize this approach?**  
   Because we didn't have clear documentation and examples of the correct pattern to follow.

## Solution Pattern

For any concept that needs to exist as both a type and a value, we should create both:

1. **Type Definition** (for type checking)
2. **Runtime Value Equivalent** (for runtime usage)

## Implementation Pattern

### Pattern 1: Type + Const Object (Recommended)

```typescript
// 1. Define the type
export type DeviceCapability = 'low' | 'medium' | 'high';

// 2. Define runtime constants (values)
export const DeviceCapabilities = {
  LOW: 'low' as DeviceCapability,
  MEDIUM: 'medium' as DeviceCapability,
  HIGH: 'high' as DeviceCapability
};

// Usage
function setCapability(capability: DeviceCapability) {
  // Type-safe parameter
  console.log(`Setting capability to: ${capability}`);
}

// Call with constant
setCapability(DeviceCapabilities.HIGH); // ✓ Type-safe 
```

### Pattern 2: TypeScript enum (Alternative)

```typescript
// Define an enum
export enum AlertType {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error'
}

// Usage
function showAlert(type: AlertType) {
  console.log(`Showing ${type} alert`);
}

showAlert(AlertType.WARNING); // ✓ Type-safe
```

## When to Use Each Pattern

Use **Pattern 1** (Type + Const Object) when:
- You want more control over the exact output
- You want to avoid the quirks of TypeScript enums
- The values are primarily strings or other primitives

Use **Pattern 2** (TypeScript enum) when:
- You need a more traditional enum behavior
- The enum is used extensively throughout the codebase
- You're dealing with numeric values where enum auto-incrementing is helpful

## Best Practices

1. **Be consistent** - Choose one pattern and use it consistently throughout the codebase
2. **Use PascalCase for the object** and UPPER_CASE for its properties
3. **Use camelCase for the type** definition
4. **Keep related types and values in the same file**
5. **Document the pattern** in your codebase for other developers

## Examples in Our Codebase

Good examples to follow in our codebase:

```typescript
// Types + Values for AI models
export type AIModel = 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo';

export const AIModels = {
  GPT_4: 'gpt-4' as AIModel,
  GPT_4_TURBO: 'gpt-4-turbo' as AIModel,
  GPT_3_5_TURBO: 'gpt-3.5-turbo' as AIModel
};

// Usage
function callAI(model: AIModel) {
  // Implementation
}

callAI(AIModels.GPT_4); // Type-safe
```

By following these patterns, we can eliminate a whole class of TypeScript errors in our codebase.
