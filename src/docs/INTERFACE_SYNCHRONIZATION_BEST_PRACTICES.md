
# Interface Synchronization Best Practices

## Problem

Our application frequently encounters interface mismatch errors like:

```typescript
// ERROR: Property 'energyPoints' does not exist on type 'VisualizationProps'
const visualization = <Visualization energyPoints={totalPoints} />;
```

These errors occur because our components use properties that don't exist in their interface definitions, or because implementations don't match their interfaces.

## Root Cause Analysis

1. **Component Evolution**: Components evolve over time without updating their interfaces
2. **Implicit Dependencies**: Components depend on properties that aren't explicitly declared
3. **Copy-Paste Patterns**: Interface definitions get copied without proper adaptation
4. **Multiple Interfaces**: Same component defined by different interfaces in different places
5. **Type/Value Confusion**: Using TypeScript types at runtime (see Type-Value Pattern doc)

## Interface Synchronization Pattern

The Interface Synchronization Pattern ensures component implementations match their interfaces:

```typescript
// 1. Define comprehensive interface
export interface ButtonProps {
  // Required properties
  children: React.ReactNode;
  
  // Optional properties with defaults
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  
  // Event handlers
  onClick?: () => void;
}

// 2. Implement component using the interface
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick
}) => {
  // Component implementation
};
```

## Key Principles

### 1. Single Source of Truth

Each interface should be defined in exactly one location:

```typescript
// src/components/Button/types.ts
export interface ButtonProps {
  // All button properties defined here
}

// src/components/Button/Button.tsx
import { ButtonProps } from './types';

export const Button: React.FC<ButtonProps> = (props) => {
  // Implementation
};
```

### 2. Comprehensive Interfaces

Interfaces should document ALL properties a component accepts:

```typescript
export interface InputProps {
  // Value handling
  value: string;
  onChange: (value: string) => void;
  
  // Appearance
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'filled' | 'flushed';
  
  // States
  isDisabled?: boolean;
  isInvalid?: boolean;
  isRequired?: boolean;
  
  // Accessibility
  ariaLabel?: string;
  ariaDescribedBy?: string;
  
  // Additional props
  className?: string;
  testId?: string;
}
```

### 3. Interface Evolution Strategy

When evolving interfaces:

1. **Add New Properties as Optional**: Never add required properties to existing interfaces
2. **Document with JSDoc**: Add clear documentation for each property
3. **Mark Deprecated Properties**: Use JSDoc to mark deprecated properties

```typescript
interface ButtonProps {
  /** Button label content */
  children: React.ReactNode;
  
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'outline';
  
  /** @deprecated Use 'variant' instead */
  type?: 'default' | 'primary' | 'secondary';
}
```

### 4. Adapter Pattern for Protected Components

For components you can't modify directly, use the Adapter Pattern:

```typescript
// Original third-party component has incompatible interface
interface ThirdPartyChartProps {
  dataset: { x: number; y: number }[];
  height: number;
  width: number;
}

// Our domain-specific interface
export interface TimeSeriesChartProps {
  data: TimeSeriesPoint[];
  title: string;
  showLegend?: boolean;
}

// Adapter component
export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  title,
  showLegend = true
}) => {
  // Transform our interface to the third-party interface
  const adaptedData = data.map(point => ({
    x: point.timestamp,
    y: point.value
  }));
  
  return (
    <div className="chart-container">
      <h3>{title}</h3>
      <ThirdPartyChart
        dataset={adaptedData}
        height={300}
        width={500}
      />
      {showLegend && <ChartLegend data={data} />}
    </div>
  );
};
```

## Implementation Checklist

When implementing or updating components:

### 1. Define Interfaces First

```typescript
// 1. Start with the interface
export interface ChakraVisualizationProps {
  chakras: ChakraData[];
  activationLevel: number;
  showEffects?: boolean;
  onChakraActivation?: (chakraId: string) => void;
}

// 2. Then implement the component
export const ChakraVisualization: React.FC<ChakraVisualizationProps> = ({ 
  chakras,
  activationLevel,
  showEffects = true,
  onChakraActivation
}) => {
  // Implementation
};
```

### 2. Document Props with JSDoc

```typescript
export interface SliderProps {
  /** Current value of the slider */
  value: number;
  
  /** Called when the value changes */
  onChange: (value: number) => void;
  
  /** Minimum allowed value */
  min?: number;
  
  /** Maximum allowed value */
  max?: number;
  
  /** Step increment between values */
  step?: number;
}
```

### 3. Use Default Values Consistently

```typescript
export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1
}) => {
  // Implementation using default values
};
```

### 4. Create Interface-Conforming Utilities

```typescript
// Helper to create default props for complex components
export function createDefaultChakraVisualizationProps(): ChakraVisualizationProps {
  return {
    chakras: [],
    activationLevel: 0,
    showEffects: true
  };
}

// Usage
const props = {
  ...createDefaultChakraVisualizationProps(),
  chakras: userChakras,
  onChakraActivation: handleActivation
};

return <ChakraVisualization {...props} />;
```

## Testing Interfaces

Write tests to verify interface conformance:

```typescript
describe('Button interface', () => {
  it('renders with required props only', () => {
    const { getByText } = render(<Button>Click me</Button>);
    expect(getByText('Click me')).toBeInTheDocument();
  });
  
  it('applies the variant className', () => {
    const { container } = render(<Button variant="secondary">Button</Button>);
    expect(container.firstChild).toHaveClass('btn-secondary');
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    const { getByText } = render(
      <Button onClick={handleClick}>Click me</Button>
    );
    fireEvent.click(getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Common Pitfalls to Avoid

### 1. Inconsistent Props vs. Implementation

```typescript
// BAD: Interface doesn't match implementation
interface BadProps {
  onSubmit: (data: FormData) => void; // Required in interface
}

// But implementation makes it optional with default
const BadComponent = ({ onSubmit = () => {} }) => { ... };
```

### 2. Missing Optional Flags

```typescript
// BAD: Props that have defaults should be marked optional
interface BadProps {
  size: 'sm' | 'md' | 'lg'; // Missing ? but has default
}

// GOOD:
interface GoodProps {
  size?: 'sm' | 'md' | 'lg'; // Correctly marked optional
}

const GoodComponent = ({ size = 'md' }) => { ... };
```

### 3. Using Props Not in Interface

```typescript
// BAD: Using props not defined in interface
interface BadProps {
  name: string;
}

const BadComponent = ({ name, age }) => { // 'age' not in interface
  return <div>{name}, {age}</div>;
};
```

By following these patterns consistently, we can eliminate prop type errors and create a more maintainable, self-documenting codebase.
