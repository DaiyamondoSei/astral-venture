# Framer Motion Components Best Practices

## Problem

When using Framer Motion components, TypeScript errors can occur when passing invalid properties to the `style` prop. Common issues include:

```typescript
// ERROR: Object literal may only specify known properties, and 'ringColor' does not exist in type 'MotionStyle'.
<motion.div
  style={{ backgroundColor: 'blue', ringColor: 'red' }}
/>
```

## Root Cause

The `MotionStyle` type in Framer Motion strictly defines allowed CSS properties and doesn't include custom properties like `ringColor` that might be part of utility class libraries like Tailwind CSS.

## Solution Patterns

### 1. Separate Motion Styles from Utility Classes

Instead of mixing custom utility properties with motion styles, use className for utility classes:

```typescript
// CORRECT: Use className for utility classes
<motion.div
  className="ring ring-red-500"
  style={{ backgroundColor: 'blue' }}
/>
```

### 2. Use Dynamic Classnames with `cn` Utility

Use conditional class utilities like `cn` (classnames) for dynamic styling:

```typescript
<motion.div
  className={cn(
    "base-styles",
    isActive ? "ring-2 ring-offset-2 ring-blue-500" : "opacity-60"
  )}
  style={{ backgroundColor: 'blue' }}
/>
```

### 3. Create Valid MotionStyle Objects

Ensure motion style objects only contain valid CSS properties:

```typescript
// Valid motion style preparation
const motionStyle: MotionStyle = {
  backgroundColor: chakraColor,
  boxShadow: isActive ? `0 0 10px 2px ${glowColor}` : 'none',
  opacity: isActive ? 1 : 0.7
};

<motion.div style={motionStyle} />
```

### 4. Use Type Assertions Carefully

If you need to mix in non-standard properties, use type assertions (only when necessary):

```typescript
// Use type assertions when necessary
const style = {
  backgroundColor: 'blue',
  customProp: 'value' // Custom property for internal use
} as any;

<motion.div style={style} />
```

### 5. Create Wrapper Components

For frequently used patterns, create wrapper components:

```typescript
// MotionCard.tsx
interface MotionCardProps {
  isGlowing?: boolean;
  glowColor?: string;
  children: React.ReactNode;
  // Other props...
}

const MotionCard: React.FC<MotionCardProps> = ({ 
  isGlowing, 
  glowColor = 'rgba(59, 130, 246, 0.5)', 
  children,
  ...props
}) => {
  // Prepare valid motion style
  const motionStyle: MotionStyle = {
    boxShadow: isGlowing ? `0 0 10px 2px ${glowColor}` : 'none',
  };
  
  return (
    <motion.div
      style={motionStyle}
      className={cn(
        "p-4 rounded-lg",
        isGlowing ? "ring-1 ring-blue-500" : ""
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
```

## Handling Special Effects

### Glow Effects

For glow effects, use `boxShadow` instead of custom ring properties:

```typescript
// INCORRECT
<motion.div
  style={{ ringColor: 'blue', ringSize: 2 }}
/>

// CORRECT
<motion.div
  style={{ boxShadow: '0 0 10px 2px rgba(59, 130, 246, 0.5)' }}
/>
```

### Custom Ring Effects

For ring effects, use Tailwind classes instead of style properties:

```typescript
// INCORRECT
<motion.div
  style={{ ringColor: color, ringWidth: '2px' }}
/>

// CORRECT
<motion.div
  className={`ring-2 ring-${color} ring-offset-2`}
/>
```

## TypeScript Tips

### Type-check style objects:

```typescript
import { MotionStyle } from 'framer-motion';

// Explicitly type the style object
const prepareMotionStyle = (color: string, isActive: boolean): MotionStyle => {
  return {
    backgroundColor: color,
    opacity: isActive ? 1 : 0.6,
    filter: isActive ? 'brightness(1.1)' : 'none'
  };
};

// Usage
<motion.div style={prepareMotionStyle('blue', true)} />
```

### Extract non-motion properties:

```typescript
interface ExtendedStyleProps {
  ringColor?: string;
  backgroundColor?: string;
  opacity?: number;
}

const prepareStyles = (props: ExtendedStyleProps) => {
  const { ringColor, ...motionStyleProps } = props;
  
  // Create class string for non-motion properties
  const className = ringColor ? `ring ring-${ringColor}` : '';
  
  // Return both the valid motion style and classes
  return {
    motionStyle: motionStyleProps,
    className
  };
};

// Usage
const { motionStyle, className } = prepareStyles({ 
  ringColor: 'blue-500', 
  backgroundColor: 'white',
  opacity: 0.9
});

<motion.div
  style={motionStyle}
  className={className}
/>
```

By following these best practices, you can avoid type errors while still achieving the desired visual effects with Framer Motion components.
