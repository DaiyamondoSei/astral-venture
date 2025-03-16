
# Adapter Pattern for Protected Components

## Problem

In our codebase, we encounter "property does not exist" TypeScript errors when working with components that we cannot modify directly. These errors occur because:

1. Some components are "protected" - we can't modify their source code
2. The component expects properties that aren't in our current data model
3. Our data model uses different property names than the component expects

## Solution: The Adapter Pattern

The Adapter Pattern creates a compatibility layer between our data model and protected components:

```
[Your Data Model] → [Adapter Component] → [Protected Component]
```

This pattern allows us to:
1. Maintain our preferred data structure
2. Use protected components without modification
3. Create clean, type-safe interfaces

## Implementation

### 1. Create an Adapter Interface

First, define an interface for your adapter component that aligns with your data model:

```typescript
// Your domain-specific interface
export interface ChakraVisualizationProps {
  chakras: ChakraData[];
  energyLevel: number;
  theme: VisualTheme;
}
```

### 2. Create the Adapter Component

Create a component that receives your domain-specific props and adapts them to the protected component's props:

```typescript
import React from 'react';
import ProtectedVisualization from './ProtectedVisualization';
import { ChakraVisualizationProps } from './types';
import { adaptChakrasToSystem, calculateEnergyPoints } from './adapters';

export const ChakraVisualizationAdapter: React.FC<ChakraVisualizationProps> = ({
  chakras,
  energyLevel,
  theme
}) => {
  // Transform your data to match what the protected component expects
  const adaptedProps = {
    system: adaptChakrasToSystem(chakras),
    energyPoints: calculateEnergyPoints(energyLevel),
    variant: theme.variant
  };
  
  // Render the protected component with adapted props
  return <ProtectedVisualization {...adaptedProps} />;
};
```

### 3. Create Adapter Utilities

Create utility functions to transform data between your model and the protected component's model:

```typescript
// adapters.ts
export function adaptChakrasToSystem(chakras: ChakraData[]): System {
  // Transform chakra data to system format
  return {
    nodes: chakras.map(chakra => ({
      id: chakra.id,
      type: 'chakra',
      level: chakra.activationLevel,
      // Map other properties...
    })),
    connections: [] // Generate connections if needed
  };
}

export function calculateEnergyPoints(energyLevel: number): number {
  // Convert your energy level to the format expected by the protected component
  return Math.round(energyLevel * 100);
}
```

### 4. Use the Adapter in Your Application

Use your adapter component instead of the protected component directly:

```typescript
// Your application code
const MyChakraVisualizer: React.FC = () => {
  const chakras = useChakraSystem();
  const energyLevel = useEnergyLevel();
  const theme = useVisualTheme();
  
  return (
    <ChakraVisualizationAdapter
      chakras={chakras}
      energyLevel={energyLevel}
      theme={theme}
    />
  );
};
```

## Benefits

1. **Type Safety**: Both your model and the protected component's model have their own interfaces
2. **Separation of Concerns**: Your application works with a domain-specific model
3. **Maintainability**: Changes to either side only require updates to the adapter
4. **Reusability**: The same adapter can be used throughout your application
5. **Future-Proofing**: If the protected component changes, you only need to update the adapter

## Real-world Example: Visualization Component

For a concrete example, let's look at adapting to a visualization component:

```typescript
// Your domain model
interface ChakraData {
  id: string;
  name: string;
  activationLevel: number;
  color: string;
}

// Protected component's expected props
interface VisualizationProps {
  system: {
    nodes: Array<{id: string, type: string, level: number}>;
    connections: Array<{source: string, target: string}>;
  };
  energyPoints: number;
  variant: string;
}

// Adapter component
export const VisualizationAdapter: React.FC<{
  chakras: ChakraData[];
  energyLevel: number;
  theme: {variant: string};
}> = ({chakras, energyLevel, theme}) => {
  const adaptedProps: VisualizationProps = {
    system: {
      nodes: chakras.map(c => ({
        id: c.id,
        type: 'chakra',
        level: c.activationLevel
      })),
      connections: []
    },
    energyPoints: Math.round(energyLevel * 100),
    variant: theme.variant
  };
  
  return <Visualization {...adaptedProps} />;
};
```

## Implementation Checklist

- [ ] Identify protected components you need to interact with
- [ ] Document the props interface of the protected component
- [ ] Create an adapter interface that matches your domain model
- [ ] Implement the adapter component with transformation logic
- [ ] Create utility functions for complex transformations
- [ ] Test the adapter to ensure it works as expected
- [ ] Replace direct usage of protected components with adapters

By using the Adapter Pattern, you can eliminate TypeScript errors and create a more maintainable codebase when working with components you can't modify directly.
