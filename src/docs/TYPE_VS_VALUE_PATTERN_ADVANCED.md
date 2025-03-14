
# Advanced Type vs Value Pattern in TypeScript

## Problem

One of the most confusing aspects of TypeScript is the distinction between what exists at compile time (types) versus runtime (values). This confusion leads to errors like:

```typescript
// ERROR: 'DeviceCapability' only refers to a type, but is being used as a value here.
if (capability === DeviceCapability.HIGH) { ... }
```

## Understanding the Core Issue

TypeScript has a fundamental separation between:

1. **Type Space**: Types exist only during compilation and are erased in the JavaScript output
2. **Value Space**: Values exist at runtime in the JavaScript execution environment

This creates a **dual-world problem** where we need to maintain parallel structures in both spaces.

## Advanced Type-Value Pattern

### 1. Complete Pattern Structure

```typescript
// Step 1: Define the type (compile-time)
export type DeviceCapability = 'low' | 'medium' | 'high';

// Step 2: Define runtime constants (runtime values)
export const DeviceCapabilities = {
  LOW: 'low' as DeviceCapability,
  MEDIUM: 'medium' as DeviceCapability,
  HIGH: 'high' as DeviceCapability
} as const;

// Step 3: Create a type from the values (compile-time type from runtime values)
export type DeviceCapabilityKey = keyof typeof DeviceCapabilities;

// Step 4: Create a value map for runtime validation and conversion
export const deviceCapabilityValues: Record<DeviceCapabilityKey, DeviceCapability> = {
  LOW: DeviceCapabilities.LOW,
  MEDIUM: DeviceCapabilities.MEDIUM,
  HIGH: DeviceCapabilities.HIGH
};

// Step 5: Create runtime type guards and converters
export function isDeviceCapability(value: unknown): value is DeviceCapability {
  return typeof value === 'string' && 
    Object.values(DeviceCapabilities).includes(value as DeviceCapability);
}

export function parseDeviceCapability(value: unknown): DeviceCapability | null {
  if (isDeviceCapability(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const key = value.toUpperCase() as DeviceCapabilityKey;
    return deviceCapabilityValues[key] || null;
  }
  return null;
}
```

### 2. Using Const Assertions for Literal Types

The `as const` assertion creates more precise types:

```typescript
// Without "as const" - type is { LOW: string, MEDIUM: string, HIGH: string }
export const BasicEnum = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

// With "as const" - type is { LOW: "low", MEDIUM: "medium", HIGH: "high" }
export const PreciseEnum = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const;

// Create type from const-asserted object
export type PreciseEnumValue = typeof PreciseEnum[keyof typeof PreciseEnum];
// Equivalent to: type PreciseEnumValue = "low" | "medium" | "high"
```

### 3. Type Map Pattern

For more complex mappings between types and values:

```typescript
// Define the type
export type ErrorCode = 
  | 'INVALID_INPUT' 
  | 'NETWORK_ERROR' 
  | 'SERVER_ERROR';

// Define the runtime constants
export const ErrorCodes = {
  INVALID_INPUT: 'INVALID_INPUT' as ErrorCode,
  NETWORK_ERROR: 'NETWORK_ERROR' as ErrorCode,
  SERVER_ERROR: 'SERVER_ERROR' as ErrorCode
} as const;

// Define metadata for each error code
export interface ErrorMetadata {
  httpStatus: number;
  userMessage: string;
  logLevel: 'warn' | 'error' | 'fatal';
}

// Create a map of code to metadata
export const errorMetadataMap: Record<ErrorCode, ErrorMetadata> = {
  [ErrorCodes.INVALID_INPUT]: {
    httpStatus: 400,
    userMessage: 'The provided input is invalid',
    logLevel: 'warn'
  },
  [ErrorCodes.NETWORK_ERROR]: {
    httpStatus: 503,
    userMessage: 'Connection error, please try again',
    logLevel: 'error'
  },
  [ErrorCodes.SERVER_ERROR]: {
    httpStatus: 500,
    userMessage: 'An unexpected error occurred',
    logLevel: 'fatal'
  }
};

// Usage
function handleError(code: ErrorCode) {
  const metadata = errorMetadataMap[code];
  return {
    status: metadata.httpStatus,
    message: metadata.userMessage
  };
}
```

### 4. Enum Alternatives for Complex Cases

When you need more structure than simple string literals:

```typescript
// Define the structure
export interface PermissionLevel {
  readonly name: string;
  readonly level: number;
  readonly capabilities: readonly string[];
}

// Define the runtime values
export const PermissionLevels = {
  VIEWER: {
    name: 'viewer',
    level: 10,
    capabilities: ['read'] as const
  } as const,
  
  EDITOR: {
    name: 'editor',
    level: 20,
    capabilities: ['read', 'write'] as const
  } as const,
  
  ADMIN: {
    name: 'admin',
    level: 30,
    capabilities: ['read', 'write', 'delete', 'manage'] as const
  } as const
} as const;

// Create a type from the values
export type PermissionLevelKey = keyof typeof PermissionLevels;
export type Permission = typeof PermissionLevels[PermissionLevelKey];

// Create a relation between string identifiers and permission levels
export const permissionNameMap: Record<string, Permission> = {
  [PermissionLevels.VIEWER.name]: PermissionLevels.VIEWER,
  [PermissionLevels.EDITOR.name]: PermissionLevels.EDITOR,
  [PermissionLevels.ADMIN.name]: PermissionLevels.ADMIN
};

// Type guard function
export function isPermission(value: unknown): value is Permission {
  if (typeof value !== 'object' || value === null) return false;
  
  const obj = value as any;
  if (typeof obj.name !== 'string') return false;
  if (typeof obj.level !== 'number') return false;
  if (!Array.isArray(obj.capabilities)) return false;
  
  return Object.values(PermissionLevels).some(
    perm => perm.name === obj.name && perm.level === obj.level
  );
}

// Parser function
export function parsePermission(value: unknown): Permission | null {
  if (isPermission(value)) return value;
  
  if (typeof value === 'string') {
    return permissionNameMap[value] || null;
  }
  
  return null;
}
```

## Advanced Applications

### 1. Runtime Configuration with Type Safety

```typescript
// Configuration schema
export type AppConfig = {
  mode: 'development' | 'production' | 'test';
  features: {
    analytics: boolean;
    darkMode: boolean;
  }
  limits: {
    requestsPerMinute: number;
    maxUploadSizeMB: number;
  }
};

// Runtime defaults with type assertion
export const defaultConfig = {
  mode: 'development',
  features: {
    analytics: false,
    darkMode: true
  },
  limits: {
    requestsPerMinute: 60,
    maxUploadSizeMB: 10
  }
} as AppConfig;

// Type guard
export function isValidConfig(config: unknown): config is AppConfig {
  if (typeof config !== 'object' || config === null) return false;
  
  const c = config as any;
  
  // Check mode
  if (!['development', 'production', 'test'].includes(c.mode)) return false;
  
  // Check features
  if (typeof c.features !== 'object' || c.features === null) return false;
  if (typeof c.features.analytics !== 'boolean') return false;
  if (typeof c.features.darkMode !== 'boolean') return false;
  
  // Check limits
  if (typeof c.limits !== 'object' || c.limits === null) return false;
  if (typeof c.limits.requestsPerMinute !== 'number') return false;
  if (typeof c.limits.maxUploadSizeMB !== 'number') return false;
  
  return true;
}

// Usage with runtime-loaded config
const loadConfig = async (): Promise<AppConfig> => {
  try {
    const response = await fetch('/config.json');
    const data = await response.json();
    
    if (isValidConfig(data)) {
      return data;
    } else {
      console.warn('Invalid config format, using defaults');
      return defaultConfig;
    }
  } catch (err) {
    console.error('Error loading config:', err);
    return defaultConfig;
  }
};
```

### 2. Creating Type-Safe Event Systems

```typescript
// Define event types
export type EventType = 
  | 'user:login'
  | 'user:logout'
  | 'item:create'
  | 'item:update'
  | 'item:delete';

// Define event payloads
export interface EventPayloadMap {
  'user:login': { userId: string; timestamp: number };
  'user:logout': { userId: string; timestamp: number; sessionDuration: number };
  'item:create': { itemId: string; name: string; createdBy: string };
  'item:update': { itemId: string; changes: Record<string, unknown> };
  'item:delete': { itemId: string; deletedBy: string };
}

// Event handler type with proper payload typing
export type EventHandler<T extends EventType> = 
  (payload: EventPayloadMap[T]) => void;

// Event manager implementation
export class TypedEventManager {
  private handlers = new Map<
    EventType, 
    Set<EventHandler<EventType>>
  >();
  
  // Type-safe event subscription
  public on<T extends EventType>(
    eventType: T, 
    handler: EventHandler<T>
  ): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    
    // We know this cast is safe because of our type constraints
    this.handlers.get(eventType)!.add(handler as EventHandler<EventType>);
  }
  
  // Type-safe event emission
  public emit<T extends EventType>(
    eventType: T, 
    payload: EventPayloadMap[T]
  ): void {
    const handlers = this.handlers.get(eventType);
    if (!handlers) return;
    
    handlers.forEach(handler => {
      // We know this cast is safe because of our type system
      (handler as EventHandler<T>)(payload);
    });
  }
  
  // Unsubscribe
  public off<T extends EventType>(
    eventType: T, 
    handler: EventHandler<T>
  ): void {
    const handlers = this.handlers.get(eventType);
    if (!handlers) return;
    
    handlers.delete(handler as EventHandler<EventType>);
  }
}

// Usage
const events = new TypedEventManager();

// TypeScript knows the correct payload type
events.on('user:login', (payload) => {
  // payload is typed as { userId: string; timestamp: number }
  console.log(`User ${payload.userId} logged in`);
});

// This would be a type error:
// events.emit('user:login', { wrongProperty: 'value' });

// This is valid:
events.emit('user:login', { 
  userId: 'user123', 
  timestamp: Date.now() 
});
```

## Best Practices Summary

1. **Clear Separation**: Maintain clear separation between types and values
2. **Naming Conventions**: Use plural nouns for value containers and singular for types
3. **Type Guards**: Always implement type guards for runtime validation
4. **Derive Types from Values**: Use `typeof` and `keyof` to derive types from values
5. **Const Assertions**: Use `as const` for precise literal types
6. **Single Source of Truth**: Keep related types and values together
7. **Type-Safe Parsers**: Create parser functions for converting unknown values to typed values
8. **Comprehensive Documentation**: Document the type-value relationship

By following these advanced patterns, you can create robust, type-safe systems that handle both compile-time and runtime type constraints effectively.
