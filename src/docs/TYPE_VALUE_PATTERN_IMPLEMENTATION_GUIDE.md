# Type-Value Pattern Implementation Guide

## Understanding the Type-Value Pattern

The Type-Value pattern separates TypeScript types from their runtime values, resolving a common source of errors where developers attempt to use types at runtime.

### The Problem

```typescript
// PROBLEMATIC CODE
// This will cause a TypeScript error at runtime
export type DeviceCapability = 'low' | 'medium' | 'high';

// Later, in component code
if (deviceCapability === DeviceCapability.HIGH) { // Error: 'DeviceCapability' only refers to a type, but is being used as a value here
  // ...
}
```

### The Solution: Type-Value Pattern

```typescript
// Type declaration (for compile-time type checking)
export type DeviceCapability = 'low' | 'medium' | 'high';

// Runtime constants (for use in code)
export const DeviceCapabilities = {
  LOW: 'low' as DeviceCapability,
  MEDIUM: 'medium' as DeviceCapability,
  HIGH: 'high' as DeviceCapability
} as const;

// Correct usage
if (deviceCapability === DeviceCapabilities.HIGH) {
  // Works correctly!
}
```

## Implementation Guidelines

### 1. Separate Types and Values

Always maintain separate definitions for types and their corresponding runtime values:

```typescript
// In types file
export type AlertVariant = 'info' | 'warning' | 'error' | 'success';

// In constants file
import { AlertVariant } from './types';

export const AlertVariants = {
  INFO: 'info' as AlertVariant,
  WARNING: 'warning' as AlertVariant,
  ERROR: 'error' as AlertVariant,
  SUCCESS: 'success' as AlertVariant
} as const;
```

### 2. Use Consistent Naming Conventions

Follow these naming conventions for clarity:

- **Types**: PascalCase singular (e.g., `AlertVariant`)
- **Constants**: PascalCase plural (e.g., `AlertVariants`)
- **Values**: SCREAMING_SNAKE_CASE for values (e.g., `AlertVariants.ERROR`)

### 3. Type Assertion for Runtime Safety

Use type assertions to ensure runtime values match the type:

```typescript
export const SizeVariants = {
  SMALL: 'small' as SizeVariant,
  MEDIUM: 'medium' as SizeVariant,
  LARGE: 'large' as SizeVariant
} as const;
```

### 4. Organized File Structure

Organize types and values in a consistent file structure:

```
src/
  types/
    core/
      visual/
        variants.ts       # Type definitions
  constants/
    core/
      visual.ts          # Corresponding constants
```

### 5. Use Type-Value Pattern for Enums

Instead of using TypeScript enums, use the Type-Value pattern:

```typescript
// Instead of enum
// enum Status { Pending, Active, Completed }

// Use Type-Value pattern
export type Status = 'pending' | 'active' | 'completed';

export const Statuses = {
  PENDING: 'pending' as Status,
  ACTIVE: 'active' as Status,
  COMPLETED: 'completed' as Status
} as const;
```

### 6. Create Value Mappers for Additional Properties

For complex values with additional properties, create value mappers:

```typescript
export type Theme = 'light' | 'dark' | 'system';

export const Themes = {
  LIGHT: 'light' as Theme,
  DARK: 'dark' as Theme,
  SYSTEM: 'system' as Theme
} as const;

// Additional properties mapped to the values
export const ThemeProperties: Record<Theme, { bgColor: string; textColor: string }> = {
  light: { bgColor: '#FFFFFF', textColor: '#000000' },
  dark: { bgColor: '#121212', textColor: '#FFFFFF' },
  system: { bgColor: 'var(--system-bg)', textColor: 'var(--system-text)' }
};
```

### 7. Use Guard Functions for Runtime Validation

Add guard functions to validate values at runtime:

```typescript
export function isValidTheme(value: unknown): value is Theme {
  return typeof value === 'string' && 
    Object.values(Themes).includes(value as any);
}

// Usage
function setTheme(theme: unknown) {
  if (isValidTheme(theme)) {
    // theme is type-safe here
    applyTheme(theme);
  } else {
    console.error('Invalid theme:', theme);
  }
}
```

### 8. Export Value Arrays When Needed

For iterating over all values, export arrays:

```typescript
export const ALL_THEMES = Object.values(Themes) as Theme[];

// Usage
function renderThemeOptions() {
  return ALL_THEMES.map(theme => (
    <option key={theme} value={theme}>
      {theme.charAt(0).toUpperCase() + theme.slice(1)}
    </option>
  ));
}
```

## Examples by Category

### UI Component Variants

```typescript
// types/ui/components/button.ts
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

// constants/ui/components.ts
import { ButtonVariant } from '@/types/ui/components/button';

export const ButtonVariants = {
  PRIMARY: 'primary' as ButtonVariant,
  SECONDARY: 'secondary' as ButtonVariant,
  OUTLINE: 'outline' as ButtonVariant,
  GHOST: 'ghost' as ButtonVariant
} as const;
```

### Performance Settings

```typescript
// types/core/performance/constants.ts
export type PerformanceMode = 'battery' | 'balanced' | 'performance' | 'auto';

// constants/core/performance.ts
import { PerformanceMode } from '@/types/core/performance/constants';

export const PerformanceModes = {
  BATTERY: 'battery' as PerformanceMode,
  BALANCED: 'balanced' as PerformanceMode,
  PERFORMANCE: 'performance' as PerformanceMode,
  AUTO: 'auto' as PerformanceMode
} as const;
```

### Visual System Components

```typescript
// types/core/visual/variants.ts
export type GlassmorphicVariant = 'default' | 'quantum' | 'ethereal' | 'elevated' | 'cosmic';

// constants/core/visual.ts
import { GlassmorphicVariant } from '@/types/core/visual/variants';

export const GlassmorphicVariants = {
  DEFAULT: 'default' as GlassmorphicVariant,
  QUANTUM: 'quantum' as GlassmorphicVariant,
  ETHEREAL: 'ethereal' as GlassmorphicVariant,
  ELEVATED: 'elevated' as GlassmorphicVariant,
  COSMIC: 'cosmic' as GlassmorphicVariant
} as const;
```

## Converting Existing Code

Follow these steps to convert existing code to use the Type-Value pattern:

1. Identify type definitions used as values (look for TypeScript errors)
2. Create corresponding constant objects with the same values
3. Update all references to use the constants instead of type names
4. Add runtime validation if needed
5. Add JSDoc comments to explain the pattern

## Integration with Components

### In Component Props

```typescript
import { ButtonVariant, ButtonVariants } from '@/constants/ui/components';

interface ButtonProps {
  variant?: ButtonVariant;
  // other props
}

const Button: React.FC<ButtonProps> = ({ 
  variant = ButtonVariants.PRIMARY, 
  // other props
}) => {
  // Now you can safely use the variant value
  const className = `btn btn-${variant}`;
  
  return <button className={className}>...</button>;
};
```

### In Utility Functions

```typescript
import { PerformanceMode, PerformanceModes } from '@/constants/core/performance';

function optimizeForMode(mode: PerformanceMode) {
  switch (mode) {
    case PerformanceModes.BATTERY:
      return { particleCount: 100, frameRate: 30 };
    case PerformanceModes.BALANCED:
      return { particleCount: 500, frameRate: 45 };
    case PerformanceModes.PERFORMANCE:
      return { particleCount: 1000, frameRate: 60 };
    case PerformanceModes.AUTO:
      // Detect based on device
      return detectBestSettings();
    default:
      // Exhaustiveness check
      const _exhaustiveCheck: never = mode;
      return { particleCount: 500, frameRate: 45 };
  }
}
```

## Conclusion

The Type-Value pattern improves code reliability by clearly separating compile-time types from runtime values. By consistently applying this pattern, we eliminate a common source of errors and create a more maintainable codebase.

Remember these key principles:
1. Never use type names as values
2. Always create corresponding constant objects for runtime use
3. Follow consistent naming conventions
4. Use type assertions for type safety
5. Add validation functions for runtime checking

For any questions about implementing this pattern, consult the FAQ section or reach out to the architecture team.
