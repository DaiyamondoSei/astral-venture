
# Motion Components Best Practices

## Problem

When working with motion components from libraries like Framer Motion, TypeScript errors often occur due to mismatched prop types:

```typescript
// ERROR: Type '{ ringColor: string; }' is not assignable to type 'MotionStyle'
const style = { ringColor: "blue" }; // Invalid property for MotionStyle
```

## Root Cause Analysis (5 Whys)

1. **Why do MotionStyle type errors occur?**  
   Passing invalid properties to motion components that aren't part of their type definition.

2. **Why do we pass invalid properties?**  
   Confusion between DOM element styles, CSS-in-JS props, and motion-specific properties.

3. **Why is there confusion?**  
   Motion libraries add their own types on top of standard CSS properties.

4. **Why is this hard to catch?**  
   The properties often look correct visually and may work in some contexts (e.g., with CSS-in-JS).

5. **Why don't developers check the type definitions?**  
   The type definitions are complex, combining DOM attributes, style props, and motion-specific props.

## Solution Patterns

### 1. Use TypeScript to Guide Property Selection

Let TypeScript help by explicitly typing your style objects:

```typescript
import { MotionStyle } from 'framer-motion';

// Type assertion guides valid properties
const style: MotionStyle = {
  opacity: 0.8,
  scale: 1.2,
  backgroundColor: "#ff0000"
};
```

### 2. Separate Motion Props from Style Props

Keep motion-specific props separate from standard styles:

```typescript
// Motion props
const motionProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5 }
};

// Style props
const styleProps = {
  backgroundColor: "#f0f0f0",
  borderRadius: "8px",
  padding: "16px"
};

// Usage
<motion.div {...motionProps} style={styleProps} />
```

### 3. Use Custom Wrapper Components

Create wrapper components to handle prop transformations:

```typescript
import { motion, MotionStyle } from 'framer-motion';

interface StyledMotionDivProps {
  ringColor?: string;  // Custom prop not supported by MotionStyle
  style?: Omit<MotionStyle, 'ringColor'>;
  [key: string]: any;  // Allow other props to pass through
}

export const StyledMotionDiv = ({ 
  ringColor, 
  style = {}, 
  className = '',
  ...props 
}: StyledMotionDivProps) => {
  // Transform custom props to valid props
  const ringClass = ringColor ? `ring ring-${ringColor}` : '';
  
  return (
    <motion.div 
      style={style}
      className={`${className} ${ringClass}`}
      {...props} 
    />
  );
};
```

### 4. Leverage Tailwind Classes Instead of Inline Styles

Use className for styling, especially with Tailwind CSS:

```typescript
<motion.div
  className="bg-blue-500 p-4 rounded shadow hover:bg-blue-600"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
/>
```

### 5. Consistent Variants Pattern

Use variants for complex animations:

```typescript
const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

<motion.div
  variants={variants}
  initial="hidden"
  animate="visible"
  transition={{ duration: 0.5 }}
/>
```

## Common Motion Style Properties

Here's a reference of commonly used properties in MotionStyle:

```typescript
// Layout & Positioning
x: number | string
y: number | string
z: number | string
rotate: number
rotateX: number
rotateY: number
rotateZ: number
scale: number
scaleX: number
scaleY: number
scaleZ: number
skew: number
skewX: number
skewY: number
originX: number | string
originY: number | string
originZ: number | string
perspective: number

// Display & Visibility
opacity: number

// Transitions
transition: {
  type: "tween" | "spring" | "inertia" | "just"
  duration: number
  delay: number
  ease: string | number[]
  // ...and many more transition properties
}

// Standard CSS properties
backgroundColor: string
borderRadius: string | number
// ...any valid CSS property
```

## Anti-Patterns to Avoid

### 1. Mixing UI Library and Motion Props

❌ **Bad**:
```typescript
// Mixing Chakra UI and Framer Motion props directly
<motion.div chakraProps={...} animate={{...}} />
```

✅ **Good**:
```typescript
// Use a specialized component for integration
<ChakraMotionBox animate={{...}} chakraProps={...} />
```

### 2. Overloading Style Objects

❌ **Bad**:
```typescript
// Mixing standard styles, custom props and motion values in one object
const style = {
  color: "red",
  ringColor: "blue", // Not a valid style or motion prop
  x: 20,
  transition: { type: "spring" }
};
```

✅ **Good**:
```typescript
// Separate concerns
const style = { color: "red" };
const motionProps = { x: 20, transition: { type: "spring" } };
const customClass = "ring ring-blue";
```

### 3. Ignoring TypeScript Errors

❌ **Bad**:
```typescript
// @ts-ignore - Hiding the error without fixing it
// @ts-ignore
const style: MotionStyle = { ringColor: "blue" };
```

✅ **Good**:
```typescript
// Fix the root cause with supported properties
const style: MotionStyle = {}; // Empty but valid
const className = "ring ring-blue";
```

## Best Practices Summary

1. Explicitly type your style objects with `MotionStyle`
2. Separate motion props from style props
3. Create wrapper components for custom styling needs
4. Use Tailwind classes for styling when possible
5. Use variants for complex animations
6. Keep props organized by their purpose
7. Fix type errors rather than ignoring them
8. Be aware of the specific motion library's API
9. Review the library documentation for changes
10. Use code autocompletion to discover valid properties

By following these best practices, you'll avoid common MotionStyle type errors and create more maintainable animation code.
