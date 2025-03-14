
# Union Type Handling Best Practices

## Problem

One of the most common TypeScript errors in our codebase involves accessing properties on union types without proper type narrowing. This leads to errors like:

```typescript
// ERROR: Property 'primaryChakra' does not exist on type '[number, number] | { primaryChakra: number; ... }'
//        Property 'primaryChakra' does not exist on type '[number, number]'.
```

These errors occur because TypeScript only allows access to properties that exist on all possible types in a union.

## Root Cause (5 Whys Analysis)

1. **Why do we get property access errors on union types?**  
   Because TypeScript requires properties to exist on all members of a union type.

2. **Why do we try to access properties directly on union types?**  
   Because we don't consistently use type guards to narrow the union to a specific type.

3. **Why don't we use type guards consistently?**  
   Because there's no established pattern for handling unions in our codebase.

4. **Why is there no established pattern?**  
   Because we haven't documented and enforced best practices for union type handling.

5. **Why haven't we documented these practices?**  
   Because we didn't recognize that this was a recurring pattern that needed standardization.

## Solution Pattern: Type Guards and Discriminated Unions

### 1. Using Type Guards for Type Narrowing

Type guards are functions or expressions that narrow a type within a conditional block:

```typescript
// Type guard function
function isChakraPair(pair: [number, number] | ChakraPair): pair is ChakraPair {
  return typeof pair === 'object' && 'primaryChakra' in pair;
}

// Using the type guard
if (isChakraPair(pair)) {
  // TypeScript now knows pair is ChakraPair
  console.log(pair.primaryChakra); // Safe to access
} else {
  // TypeScript knows pair is [number, number]
  console.log(pair[0], pair[1]); // Safe to access
}
```

### 2. Discriminated Unions

For more complex unions, use a discriminated union pattern with a common property that identifies the type:

```typescript
// Define types with a discriminant property
type Circle = {
  kind: 'circle'; // Discriminant
  radius: number;
};

type Rectangle = {
  kind: 'rectangle'; // Discriminant
  width: number;
  height: number;
};

type Shape = Circle | Rectangle;

// Type-safe usage
function calculateArea(shape: Shape): number {
  switch (shape.kind) { // Switch on discriminant
    case 'circle':
      return Math.PI * shape.radius ** 2; // TypeScript knows it's Circle
    case 'rectangle':
      return shape.width * shape.height; // TypeScript knows it's Rectangle
  }
}
```

### 3. Exhaustiveness Checking

Ensure all union variants are handled with exhaustiveness checking:

```typescript
function getShapeName(shape: Shape): string {
  switch (shape.kind) {
    case 'circle':
      return 'Circle';
    case 'rectangle':
      return 'Rectangle';
    default:
      // This will cause a compile error if new shape kinds are added but not handled
      const exhaustiveCheck: never = shape;
      throw new Error(`Unhandled shape kind: ${exhaustiveCheck}`);
  }
}
```

## Implementation Guidelines

### 1. Prefer Discriminated Unions

When designing union types, always include a discriminant property (like `kind`, `type`, or `variant`):

```typescript
// GOOD: Discriminated union
type Message = 
  | { type: 'text'; content: string; }
  | { type: 'image'; url: string; dimensions: [number, number]; }
  | { type: 'attachment'; fileUrl: string; fileName: string; fileSize: number; };

// BAD: Undiscriminated union
type BadMessage = 
  | { content: string; } 
  | { url: string; dimensions: [number, number]; }
  | { fileUrl: string; fileName: string; fileSize: number; };
```

### 2. Create Type Guard Functions

For existing union types without discriminants, create explicit type guard functions:

```typescript
export function isCoordinatePair(value: CoordinatePair | MetricValue): value is CoordinatePair {
  return Array.isArray(value) && value.length === 2;
}

export function isMetricValue(value: CoordinatePair | MetricValue): value is MetricValue {
  return typeof value === 'object' && 'value' in value && 'unit' in value;
}
```

### 3. Use Type Assertions Sparingly

Prefer type guards over type assertions. Use assertions only when you have external knowledge that TypeScript cannot infer:

```typescript
// GOOD: Type guard
if (isMetricValue(value)) {
  processMetric(value.value, value.unit);
}

// AVOID WHEN POSSIBLE: Type assertion
processMetric((value as MetricValue).value, (value as MetricValue).unit); // Unsafe!
```

### 4. Handle All Cases

Always ensure your code handles all possible variants in a union type:

```typescript
// GOOD: All cases handled
function processValue(value: string | number | boolean): string {
  if (typeof value === 'string') {
    return value.toUpperCase();
  } else if (typeof value === 'number') {
    return value.toFixed(2);
  } else {
    return value ? 'YES' : 'NO';
  }
}

// BAD: Missing case
function processIncomplete(value: string | number | boolean): string {
  if (typeof value === 'string') {
    return value.toUpperCase();
  } else if (typeof value === 'number') {
    return value.toFixed(2);
  }
  // Missing boolean case!
  return '';
}
```

## Common Union Type Patterns

### 1. Option Types (Nullable Values)

```typescript
type Option<T> = T | null | undefined;

function processOption<T>(option: Option<T>, defaultValue: T): T {
  return option ?? defaultValue;
}
```

### 2. Result Types (Success/Error)

```typescript
type Result<T, E = Error> = 
  | { success: true; value: T; }
  | { success: false; error: E; };

function handleResult<T>(result: Result<T>): T | null {
  if (result.success) {
    return result.value;
  } else {
    console.error(result.error);
    return null;
  }
}
```

### 3. Status-Based Types

```typescript
type RequestState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function renderData<T>(state: RequestState<T>): React.ReactNode {
  switch (state.status) {
    case 'idle': 
      return <div>Waiting to start...</div>;
    case 'loading': 
      return <div>Loading...</div>;
    case 'success': 
      return <div>Data: {JSON.stringify(state.data)}</div>;
    case 'error': 
      return <div>Error: {state.error.message}</div>;
  }
}
```

## Testing Type Guards

Write tests for your type guards to ensure they correctly identify types:

```typescript
describe('Type Guards', () => {
  test('isChakraPair identifies objects correctly', () => {
    const objectPair = { primaryChakra: 1, secondaryChakra: 2, entanglementStrength: 50 };
    const tuplePair: [number, number] = [1, 2];
    
    expect(isChakraPair(objectPair)).toBe(true);
    expect(isChakraPair(tuplePair)).toBe(false);
  });
});
```

By following these best practices, we can eliminate union type errors and make our codebase more robust and maintainable.
