# Type Safety Implementation Recommendations

After fixing many TypeScript errors throughout our codebase, here are key recommendations to maintain type safety going forward:

## 1. Types vs. Values Pattern

The most common error we've encountered is confusing types with values. Always follow this pattern:

```typescript
// Define type (for compile-time)
export type DeviceCapability = 'low' | 'medium' | 'high';

// Define constants (for runtime)
export const DeviceCapabilities = {
  LOW: 'low' as DeviceCapability,
  MEDIUM: 'medium' as DeviceCapability,
  HIGH: 'high' as DeviceCapability
} as const;
```

## 2. Component Props Structure

For component props, always:

1. Define a separate interface named `{ComponentName}Props`
2. Document the interface with JSDoc comments
3. Export the interface from the component file
4. Include all props used in the component in the interface

```typescript
/**
 * Visualization component for chakra system
 */
export interface VisualizationProps {
  /** The chakra system data */
  system?: ChakraSystem;
  /** User's energy points */
  energyPoints?: number;
  /** Array of activated chakras */
  activatedChakras?: number[];
  // Other props...
}
```

## 3. Wrapper Components for Protection

When dealing with third-party libraries or complex type structures, create wrapper components that enforce type safety:

```typescript
// MotionStyleWrapper.tsx
import { motion, MotionStyle } from 'framer-motion';

interface SafeMotionProps {
  style: Omit<MotionStyle, 'ringColor'> & {
    ringColor?: string;
  };
  // Other props...
}

export const MotionDiv: React.FC<SafeMotionProps> = ({ style, ...props }) => {
  // Extract non-motion style props
  const { ringColor, ...safeStyle } = style;

  // Handle them separately
  const extraProps = ringColor ? { className: `ring ring-${ringColor}` } : {};

  return <motion.div style={safeStyle} {...extraProps} {...props} />;
};
```

## 4. Type Guards for Runtime Validation

Use type guards to validate data at runtime:

```typescript
export function isEntanglementState(obj: unknown): obj is EntanglementState {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'activePairs' in obj &&
    'entanglementStrength' in obj &&
    'quantumFluctuations' in obj &&
    'stabilityFactor' in obj
  );
}
```

## 5. Type Compatibility Layers

When interfaces change over time, provide compatibility layers for backward compatibility:

```typescript
// Legacy interface
interface LegacyAPI {
  getData: (id: string) => Promise<any>;
}

// New interface
interface ModernAPI {
  fetchData: (params: { id: string }) => Promise<any>;
}

// Compatibility layer
function adaptLegacyToModern(legacy: LegacyAPI): ModernAPI {
  return {
    fetchData: ({ id }) => legacy.getData(id)
  };
}
```

## 6. Backward Compatibility Properties

When updating interfaces, include backward compatibility properties for a transition period:

```typescript
interface AIResponseMeta {
  // New property name
  tokenUsage: number;
  
  // Legacy property name (for backward compatibility)
  tokens?: number;
  
  // Other properties...
}
```

## 7. State Management with Types

For complex state management, use explicit types:

```typescript
type Action = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DATA'; payload: Data }
  | { type: 'SET_ERROR'; payload: Error };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_DATA':
      return { ...state, data: action.payload, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      // Exhaustive check ensures all action types are handled
      const _exhaustiveCheck: never = action;
      return state;
  }
}
```

## 8. Common TypeScript Fixes

Based on our recent fixes, here are common patterns to follow:

1. **Don't use type names as values**:
   ```typescript
   // INCORRECT
   if (capability === DeviceCapability.HIGH) { ... }
   
   // CORRECT
   if (capability === DeviceCapabilities.HIGH) { ... }
   ```

2. **Define optional props consistently**:
   ```typescript
   // Props interface
   interface ButtonProps {
     variant?: 'primary' | 'secondary';
   }
   
   // Component implementation
   const Button: React.FC<ButtonProps> = ({ variant = 'primary' }) => {
     // ...
   };
   ```

3. **Use proper imports**:
   ```typescript
   // Import types
   import type { ChakraType } from '@/types/consciousness';
   
   // Import values
   import { DeviceCapabilities } from '@/types/core/performance/constants';
   ```

4. **Use Record for object mappings**:
   ```typescript
   // Typed object mapping
   const chakraStatus: Record<ChakraType, ChakraStatus> = {
     crown: { activation: 0, balance: 0, blockages: [], dominantEmotions: [] },
     // ...other chakras
   };
   ```

By implementing these recommendations consistently, we can significantly reduce TypeScript errors and improve the robustness of our codebase.
