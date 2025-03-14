
# Backward Compatibility Best Practices

## Problem

As our application evolves, we often need to update interfaces and APIs while maintaining compatibility with existing code. Improper handling of interface evolution leads to runtime errors, confusing TypeScript errors, and difficult-to-maintain code.

## Core Principles

1. **Never Break Existing Code**: Maintain backward compatibility for all public interfaces
2. **Prefer Extension Over Replacement**: Add new properties rather than removing old ones
3. **Clear Upgrade Path**: Provide clear migration paths for deprecated features
4. **Gradual Deprecation**: Phase out old patterns over time rather than abrupt removal

## Interface Evolution Patterns

### 1. Property Name Changes

When renaming properties, support both names during a transition period:

```typescript
// BEFORE
interface UserConfig {
  color: string;
}

// AFTER
interface UserConfig {
  theme: string;     // New name
  color?: string;    // Old name maintained for compatibility
}

// Implementation provides both
function getConfig(): UserConfig {
  const theme = 'dark';
  return {
    theme,
    color: theme,    // Maintain backward compatibility
  };
}

// Usage helper function
function getTheme(config: UserConfig): string {
  return config.theme ?? config.color;
}
```

### 2. Interface Restructuring

When restructuring interfaces, maintain compatibility with adapter patterns:

```typescript
// Old interface
interface LegacyAPI {
  getUserData(id: string): Promise<any>;
}

// New interface
interface ModernAPI {
  users: {
    getData(id: string): Promise<any>;
  }
}

// Adapter function to convert new to old
function adaptToLegacy(modern: ModernAPI): LegacyAPI {
  return {
    getUserData: (id: string) => modern.users.getData(id)
  };
}
```

### 3. Strict vs. Loose Types

Use more permissive types for inputs and stricter types for outputs:

```typescript
// Input type is more permissive
type UserInput = {
  name: string;
  email?: string;
  preferences?: unknown;
}

// Output type is more specific
type UserProfile = {
  name: string;
  email: string | null;
  preferences: UserPreferences | null;
}

// Function accepts loose input but returns strict output
function processUser(input: UserInput): UserProfile {
  return {
    name: input.name,
    email: input.email || null,
    preferences: parsePreferences(input.preferences)
  };
}
```

### 4. Feature Detection

Use feature detection to handle different interface versions:

```typescript
// Check if a property exists before using it
function processConfig(config: any) {
  // Modern version
  if ('newProperty' in config) {
    return handleNewConfig(config);
  }
  // Legacy version
  else if ('oldProperty' in config) {
    return handleLegacyConfig(config);
  }
  // Fallback
  else {
    return createDefaultConfig();
  }
}
```

### 5. Migration Helpers

Provide utilities to help migrate from old to new interfaces:

```typescript
// Migration helper
export function migrateFromV1ToV2(oldConfig: LegacyConfig): ModernConfig {
  return {
    newProperty: oldConfig.oldProperty,
    enhancedFeature: {
      enabled: !!oldConfig.simpleFlag,
      options: getDefaultOptions()
    }
  };
}
```

## Deprecation Strategy

1. **Mark as Deprecated**: Use JSDoc comments to indicate deprecation

```typescript
/**
 * @deprecated Use newFunction() instead - this will be removed in v3.0
 */
export function oldFunction() {
  // Implementation (forwards to new function)
  return newFunction();
}
```

2. **Logging Warnings**: Log deprecation warnings in development

```typescript
function oldFunction() {
  if (process.env.NODE_ENV === 'development') {
    console.warn('oldFunction is deprecated, use newFunction instead');
  }
  return newFunction();
}
```

3. **Version-Based Deprecation**: Use version numbers to communicate timeline

```typescript
/**
 * @deprecated Since v2.5.0. Will be removed in v3.0.0. Use newFunction instead.
 */
export function oldFunction() {
  // Implementation
}
```

## Practical Examples

### Hook Evolution

```typescript
// Original hook
function useData() {
  return {
    loading: true,
    data: null,
  };
}

// Evolved hook with backward compatibility
function useData() {
  const isLoading = true;
  const data = null;
  
  return {
    // New properties
    isLoading,
    isError: false,
    
    // Legacy properties
    loading: isLoading,  // Alias for backward compatibility
    data,
  };
}
```

### Component Props Evolution

```typescript
// Original props
interface ButtonProps {
  onClick: () => void;
  color: 'red' | 'blue';
}

// Evolved props
interface ButtonProps {
  // New properties
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  
  // Legacy properties
  onClick?: () => void;  // Now optional
  color?: 'red' | 'blue' | 'green';  // Added new option
}

// Implementation handles both
const Button = (props: ButtonProps) => {
  const handleInteraction = () => {
    // Call both handlers for compatibility
    props.onPress?.();
    props.onClick?.();
  };
  
  // Map old colors to new variants
  const getVariant = () => {
    if (props.variant) return props.variant;
    if (props.color === 'red') return 'danger';
    if (props.color === 'blue') return 'primary';
    return 'secondary';
  };
  
  // Rest of implementation...
};
```

By following these patterns, we can evolve our code while maintaining a smooth experience for consumers of our APIs and interfaces.
