
# Interface Consistency Best Practices

## Problem

Components in our application frequently encounter props interface mismatches, where the component expects properties that aren't defined in its interface, leading to TypeScript errors like:

```typescript
Property 'energyPoints' does not exist on type 'ChakraActivationProps'.
```

## Root Cause

The inconsistency between component implementations and their type definitions usually occurs due to:

1. **Incremental Development**: Adding functionality to components without updating types
2. **Divergent Development**: Multiple developers modifying components without coordination
3. **Incomplete Type Definitions**: Initial type definitions that don't capture all requirements
4. **Copy-Paste Issues**: Reusing interfaces without properly adapting them
5. **Missing Type Checks**: Not using TypeScript's type checking during development

## Solution Patterns

### 1. Single Source of Truth for Props

Always define a component's props interface in the same file as the component, and ensure it's comprehensive:

```typescript
// ComponentName.tsx
export interface ComponentNameProps {
  // All required props with descriptions
  requiredProp: string;
  
  // Optional props with descriptions
  optionalProp?: number;
}

export const ComponentName: React.FC<ComponentNameProps> = ({ 
  requiredProp,
  optionalProp = defaultValue
}) => {
  // Implementation
};
```

### 2. Props Validation and Documentation

Document all props with JSDoc comments to make their purpose clear:

```typescript
export interface ButtonProps {
  /** Primary content for the button */
  children: React.ReactNode;
  
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'danger';
  
  /** Handler for click events */
  onClick?: () => void;
}
```

### 3. Composition over Inheritance

Rather than creating complex prop interfaces that inherit from each other, prefer composition:

```typescript
// Instead of inheritance
interface BaseProps {
  className?: string;
}

interface SpecificProps extends BaseProps {
  specific: string;
}

// Prefer composition
interface ComponentProps {
  className?: string;
  specific?: string;
}
```

### 4. Consistent Naming Conventions

Use consistent naming patterns for props interfaces:

- `ComponentNameProps` for main props interfaces
- `ComponentNameContextValue` for context value interfaces
- `ComponentNameState` for state interfaces

### 5. Interface Evolution Process

When evolving a component's interface:

1. **Update Types First**: Add new properties to the interface before using them
2. **Find All Uses**: Identify all places where the component is used
3. **Update Consumers**: Update all consumers to provide the necessary props
4. **Apply Default Values**: Provide sensible defaults when possible
5. **Type Check**: Verify that there are no type errors

### 6. Type Audit Process

Periodically audit components to ensure their implementations match their interfaces:

1. Run TypeScript type checking against the entire codebase
2. Address any type errors related to props
3. Review components for unused props
4. Look for props used internally but not declared

## Best Practices Checklist

When creating or modifying a component:

- [ ] Is the props interface comprehensive and up-to-date?
- [ ] Are all required props documented?
- [ ] Are sensible defaults provided for optional props?
- [ ] Are types specific and accurate (avoid `any`)?
- [ ] Has type checking been run to verify interface consistency?
- [ ] Is the interface consistent with other similar components?

Following these practices will greatly reduce type errors and improve code maintainability.
