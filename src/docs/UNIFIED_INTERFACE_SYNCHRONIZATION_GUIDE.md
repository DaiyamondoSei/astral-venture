
# Unified Interface Synchronization Guide

This document combines our best practices for maintaining type safety and interface synchronization across the application.

## Core Principles

1. **Single Source of Truth**: Define each interface in exactly one location
2. **Complete Interfaces**: Ensure interfaces document all properties a component accepts or requires
3. **Consistent Naming**: Use clear, consistent naming for interfaces
4. **Type-Value Pattern**: Ensure types used at runtime have corresponding constant values
5. **Adapter Pattern**: Use adapters for components that cannot be modified directly

## Type-Value Pattern

The Type-Value Pattern bridges the gap between TypeScript's type system and JavaScript's runtime:

```typescript
// Define the TYPE (for compile-time checking)
export type DeviceCapability = 'low' | 'medium' | 'high';

// Define the VALUE (for runtime use)
export const DeviceCapabilities = {
  LOW: 'low' as DeviceCapability,
  MEDIUM: 'medium' as DeviceCapability,
  HIGH: 'high' as DeviceCapability
} as const;

// CORRECT usage
if (capability === DeviceCapabilities.HIGH) {
  // ...
}

// INCORRECT usage - will cause TypeScript error
if (capability === DeviceCapability.HIGH) {
  // Error: 'DeviceCapability' only refers to a type, but is being used as a value here
}
```

## Interface Synchronization Pattern

When defining interfaces, follow this pattern:

```typescript
// Define a comprehensive interface
export interface ButtonProps {
  // Document all properties
  
  // Required properties
  children: React.ReactNode;
  
  // Optional properties with defaults
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  
  // Event handlers
  onClick?: () => void;
  
  // Additional options
  className?: string;
}

// Implement component using the interface
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  className
}) => {
  // Implementation
};
```

## Adapter Pattern for Protected Components

For components you cannot modify directly, use the Adapter Pattern:

```typescript
// Your domain-specific interface
export interface ChakraVisualizationProps {
  chakras: ChakraData[];
  energyLevel: number;
  theme: VisualTheme;
}

// Adapter component
export const VisualizationAdapter: React.FC<ChakraVisualizationProps> = ({
  chakras,
  energyLevel,
  theme
}) => {
  // Transform your data
  const adaptedProps = {
    system: adaptChakrasToSystem(chakras),
    energyPoints: calculateEnergyPoints(energyLevel),
    variant: theme.variant
  };
  
  // Render the protected component
  return <ProtectedVisualization {...adaptedProps} />;
};
```

## Interface Evolution

When evolving interfaces, maintain backward compatibility:

```typescript
interface APIResponse {
  // New property name
  tokenUsage: number;
  
  /** @deprecated Use tokenUsage instead */
  tokens?: number;
}

// Implementation supports both
return {
  tokenUsage: count,
  tokens: count,  // For backward compatibility
};
```

## Comprehensive Example

Here's a comprehensive example that combines all these patterns:

```typescript
// 1. Define types and constants (Type-Value Pattern)
export type ButtonVariant = 'primary' | 'secondary' | 'outline';

export const ButtonVariants = {
  PRIMARY: 'primary' as ButtonVariant,
  SECONDARY: 'secondary' as ButtonVariant,
  OUTLINE: 'outline' as ButtonVariant
} as const;

// 2. Define comprehensive interface
export interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  
  /** @deprecated Use 'variant' instead */
  type?: string;
}

// 3. Implement component with synchronized interface
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = ButtonVariants.PRIMARY,
  size = 'md',
  onClick,
  className,
  type // Support deprecated property
}) => {
  // Use type for backward compatibility
  const actualVariant = variant || (type as ButtonVariant) || ButtonVariants.PRIMARY;
  
  return (
    <button
      className={`btn btn-${actualVariant} btn-${size} ${className || ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// 4. Create an adapter for protected components
export const LegacyButtonAdapter: React.FC<ButtonProps> = (props) => {
  // Transform modern props to legacy format
  const legacyProps = {
    label: props.children,
    buttonType: props.variant || props.type || 'primary',
    onPress: props.onClick,
    customClass: props.className
  };
  
  return <LegacyButton {...legacyProps} />;
};
```

## Implementation Checklist

When implementing or modifying components and interfaces:

- [ ] Define explicit interfaces for all exported items
- [ ] Use the Type-Value Pattern for all type/value pairs
- [ ] Document all properties with JSDoc comments
- [ ] Mark deprecated properties with `@deprecated` tags
- [ ] Provide sensible defaults for optional properties
- [ ] Use interface composition for complex interfaces
- [ ] Create adapters for protected components
- [ ] Validate that implementations match interfaces

By following these unified patterns, you can create a more maintainable, type-safe codebase with fewer TypeScript errors.
