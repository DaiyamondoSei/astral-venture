# Component Interface Best Practices

## Problem

Our codebase has inconsistent component interfaces, leading to TypeScript errors like:

```
error TS2339: Property 'energyPoints' does not exist on type 'VisualizationProps'.
error TS2322: Type '{ pulsating: boolean; }' is not assignable to type 'IntrinsicAttributes & InitialOrbProps'.
```

These errors indicate that our component props interfaces are not being properly defined, exported, or used.

## Root Cause (5 Whys Analysis)

1. **Why do we have mismatched prop interfaces?**  
   Because components are using props that aren't defined in their interface.

2. **Why are props not defined in the interface?**  
   Because we're not consistently defining and exporting interfaces for all components.

3. **Why are we inconsistently defining interfaces?**  
   Because we don't have a standardized pattern for component interfaces.

4. **Why don't we have a standardized pattern?**  
   Because we haven't established clear guidelines for component development.

5. **Why haven't we established these guidelines?**  
   Because we didn't prioritize documentation and standardization early in development.

## Solution Patterns

### 1. Define and Export Props Interfaces

Always define and export a props interface for every component, even simple ones.

```typescript
// ✓ GOOD
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ children, onClick, variant = 'primary' }) => {
  // Implementation
};
```

### 2. Use Consistent Naming Conventions

- Name the interface `[ComponentName]Props`
- Export the interface from the same file as the component
- For related components, consider a separate `types.ts` file

```typescript
// Card/index.tsx
export interface CardProps {
  title: string;
  // other props
}

// Card/CardHeader.tsx
export interface CardHeaderProps {
  title: string;
  // other props
}

// OR for related components:
// Card/types.ts
export interface CardProps { /* ... */ }
export interface CardHeaderProps { /* ... */ }
export interface CardFooterProps { /* ... */ }
```

### 3. Document Props with JSDoc

Add JSDoc comments to document your props interfaces:

```typescript
/**
 * Button component for user interactions
 */
export interface ButtonProps {
  /** The content of the button */
  children: React.ReactNode;
  
  /** Function called when button is clicked */
  onClick?: () => void;
  
  /** The visual style variant of the button */
  variant?: 'primary' | 'secondary';
  
  /** Whether the button is disabled */
  disabled?: boolean;
}
```

### 4. Use Type Organization Patterns

For complex component systems, organize types in a dedicated structure:

```
src/
  components/
    Button/
      index.tsx
      types.ts
      Button.test.tsx
  types/
    ui/                  # UI-specific types
      components/
        button.ts        # Shared button-related types
        card.ts          # Shared card-related types
    domain/              # Domain-specific types
      user.ts
      product.ts
```

### 5. Use Default Props Consistently

Be consistent with how you handle default props:

```typescript
// Using destructuring with defaults (Recommended for function components)
export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary',
  disabled = false,
  children,
  onClick 
}) => {
  // Implementation
};

// OR using defaultProps (Compatible with class components)
Button.defaultProps = {
  variant: 'primary',
  disabled: false
};
```

## Common Mistakes to Avoid

### 1. Inconsistent Props vs. Component Implementation

❌ BAD: Defining props that aren't used in the component
```typescript
interface BadProps {
  name: string; // Never used in the component
}
```

### 2. Missing Required Props in Interface

❌ BAD: Using props in the component that aren't in the interface
```typescript
interface IncompleteProps {
  title: string;
  // Missing: onSubmit prop
}

const Form = ({ title, onSubmit }: IncompleteProps) => { /* ... */ };
```

### 3. Not Exporting Interfaces

❌ BAD: Keeping interfaces private when they should be public
```typescript
// Not exported, can't be imported elsewhere
interface PrivateButtonProps {
  // ...
}
```

### 4. Inconsistent Default Values

❌ BAD: Having different defaults in the interface vs. component
```typescript
interface BadDefaultsProps {
  variant?: 'primary' | 'secondary'; // Implies undefined is possible
}

// But component assumes 'primary' default - inconsistent with interface
const BadDefaults = ({ variant = 'primary' }: BadDefaultsProps) => { /* ... */ };
```

## Best Practices Summary

1. **Define and export** props interfaces for all components
2. **Use consistent naming** conventions for interfaces
3. **Document props** with JSDoc comments
4. **Organize types** in a logical structure
5. **Handle default values** consistently
6. **Test props typing** to ensure type safety
7. **Maintain backward compatibility** when changing interfaces
8. **Consider composition** for complex component hierarchies
9. **Use shared types** for consistent interfaces across components
10. **Review interfaces** regularly to ensure they match component implementation

By following these best practices, we can maintain consistent, well-documented, and type-safe component interfaces throughout our application.
