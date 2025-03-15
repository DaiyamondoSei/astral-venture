# Type-Value Pattern in Performance-Critical Code

## Problem

Performance monitoring code is particularly susceptible to TypeScript's type vs. value distinction problems because:

1. Performance monitoring often uses enums or enum-like structures to categorize metrics
2. These categorizations need to exist both at compile-time (for type safety) and runtime (for actual measurements)
3. Performance code tends to be deeply interconnected across the application

When these patterns are implemented inconsistently, we see errors like:

```typescript
error TS2693: 'RenderFrequency' only refers to a type, but is being used as a value here.
```

## 5 Whys Analysis

1. **Why are errors occurring?**
   - Types are being referenced as if they were runtime values.

2. **Why are types being used as runtime values?**
   - Performance code needs to categorize metrics both for type safety and runtime logic.

3. **Why do we need both type safety and runtime representations?**
   - To ensure measurements are correctly categorized while providing runtime validation and behavior.

4. **Why isn't this consistently implemented?**
   - The Type-Value pattern was partially implemented but not completely applied to all modules.

5. **Why wasn't it fully applied?**
   - Performance monitoring code evolved incrementally, with additions made without ensuring pattern consistency.

## The Solution: Consistent Type-Value Pattern

The solution to this problem is to consistently apply the Type-Value pattern across all performance monitoring code:

1. **Define types** for compile-time checking
2. **Define corresponding constants** with the same values for runtime usage
3. **Use consistent naming conventions** to clearly distinguish between types and values
4. **Document the relationship** between types and their runtime equivalents

### Core Implementation

```typescript
// 1. Define the type (for compile-time type checking)
export type RenderFrequency = 'low' | 'medium' | 'high' | 'excessive';

// 2. Define runtime constants (for runtime usage)
export const RenderFrequencies = {
  LOW: 'low' as RenderFrequency,
  MEDIUM: 'medium' as RenderFrequency,
  HIGH: 'high' as RenderFrequency,
  EXCESSIVE: 'excessive' as RenderFrequency
} as const;

// 3. Usage in a function signature (type position)
function analyzeRenderFrequency(component: string): RenderFrequency {
  // Implementation...
}

// 4. Usage in runtime comparisons (value position)
if (frequency === RenderFrequencies.HIGH) {
  logPerformanceWarning(component);
}
```

## Benefits in Performance Monitoring

Consistent use of the Type-Value pattern brings specific benefits to performance monitoring:

1. **Type Safety**: Ensures that only valid metric categories are used
2. **Runtime Validation**: Allows validation of metrics coming from external sources
3. **Performance Filtering**: Enables efficient filtering of metrics by category
4. **Consistent Serialization**: Ensures metrics are serialized consistently for storage and reporting
5. **Visualization Grouping**: Provides consistent grouping options for metric visualization

## Implementation Guidelines

When implementing performance monitoring code, follow these steps:

1. **Define types in a dedicated types.ts file**:
   ```typescript
   export type MetricType = 'render' | 'interaction' | 'load' | /* other types */;
   ```

2. **Define runtime values in a corresponding constants.ts file**:
   ```typescript
   import { MetricType } from './types';
   
   export const MetricTypes = {
     RENDER: 'render' as MetricType,
     INTERACTION: 'interaction' as MetricType,
     LOAD: 'load' as MetricType,
     // Other values...
   } as const;
   ```

3. **Use types for function signatures and type annotations**:
   ```typescript
   function trackMetric(type: MetricType, value: number): void {
     // Implementation
   }
   ```

4. **Use runtime values for comparisons and assignments**:
   ```typescript
   if (metric.type === MetricTypes.RENDER) {
     // Handle render metrics
   }
   ```

5. **Export both the type and runtime values**:
   ```typescript
   // From types.ts
   export type MetricType = /* ... */;
   
   // From constants.ts
   export const MetricTypes = /* ... */;
   ```

## Performance Considerations

The Type-Value pattern has negligible runtime performance impact:

1. The string literals used as values have the same runtime representation regardless of how they're declared
2. Type annotations are erased at compile time, so they add no runtime overhead
3. The constant objects (like `MetricTypes`) are typically inlined by modern JavaScript engines

## Testing and Validation

To ensure consistency between types and runtime values:

1. **Write validation tests** that ensure all type variants have corresponding runtime values
2. **Use type assertions** to verify that runtime values conform to their expected types
3. **Document the type-value relationships** clearly in code comments

By consistently applying this pattern across all performance monitoring code, we eliminate a whole class of TypeScript errors while maintaining type safety and runtime flexibility.
