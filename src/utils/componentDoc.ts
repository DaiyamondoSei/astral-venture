
/**
 * Component Documentation System
 * 
 * This utility helps document components and their props for better developer experience
 * and error prevention.
 */

import { ComponentType } from 'react';
import { z } from 'zod';
import { devLogger } from '@/utils/debugUtils';

// Custom error class for prop validation errors
export class PropValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PropValidationError';
  }
}

type PropMetadata = {
  type: string;
  required: boolean;
  description: string;
  defaultValue?: any;
  example?: any;
  validator?: (value: any) => boolean | string;
  schema?: z.ZodType<any>;
  autoFixStrategy?: (invalidValue: any) => any; // New: Strategy for auto-fixing invalid values
};

type ComponentMetadata = {
  name: string;
  description: string;
  props: Record<string, PropMetadata>;
  examples: Array<{
    name: string;
    code: string;
    description: string;
  }>;
  notes?: string[];
  schema?: z.ZodType<any>;
  autoFixStrategies?: Record<string, (props: any) => any>; // New: Component-level auto-fix strategies
};

const componentRegistry = new Map<string, ComponentMetadata>();
const activeValidators = new Map<string, Set<() => void>>(); // Store active validation functions

/**
 * Registers documentation for a component
 */
export function registerComponent(metadata: ComponentMetadata): void {
  componentRegistry.set(metadata.name, metadata);
  
  if (process.env.NODE_ENV === 'development') {
    devLogger.info('ComponentDoc', `Registered documentation for ${metadata.name}`);
  }
}

/**
 * Gets documentation for a component by name
 */
export function getComponentDocs(componentName: string): ComponentMetadata | undefined {
  return componentRegistry.get(componentName);
}

/**
 * Lists all documented components
 */
export function listDocumentedComponents(): string[] {
  return Array.from(componentRegistry.keys());
}

/**
 * Helper to document a React component with TypeScript
 */
export function documented<T>(
  Component: ComponentType<T>, 
  metadata: Omit<ComponentMetadata, 'name'>
): ComponentType<T> {
  const componentName = Component.displayName || Component.name;
  
  registerComponent({
    name: componentName,
    ...metadata
  });
  
  // In development, wrap with validation
  if (process.env.NODE_ENV === 'development') {
    const WrappedComponent = (props: any) => {
      // Validate props at render time in development
      validateProps(componentName, props as Record<string, any>);
      
      // Forward to the actual component
      return Component(props);
    };
    
    WrappedComponent.displayName = `Validated(${componentName})`;
    return WrappedComponent;
  }
  
  // Return the original component unchanged in production
  return Component;
}

/**
 * Set up continuous validation for a component
 * This allows for real-time monitoring of component props
 */
export function monitorComponent(
  componentName: string,
  getProps: () => Record<string, any>,
  options: {
    intervalMs?: number;
    onValidationError?: (error: PropValidationError) => void;
    autoFix?: boolean;
  } = {}
): () => void {
  if (process.env.NODE_ENV !== 'development') {
    return () => {}; // No-op in production
  }
  
  const { 
    intervalMs = 1000, 
    onValidationError, 
    autoFix = false 
  } = options;
  
  // Create validator function
  const validator = () => {
    try {
      const props = getProps();
      validateProps(componentName, props, false); // Don't throw, just validate
    } catch (error) {
      if (error instanceof PropValidationError) {
        if (onValidationError) {
          onValidationError(error);
        }
        
        if (autoFix) {
          attemptAutoFix(componentName, getProps());
        }
      }
    }
  };
  
  // Store validator in registry
  if (!activeValidators.has(componentName)) {
    activeValidators.set(componentName, new Set());
  }
  
  const validatorsForComponent = activeValidators.get(componentName)!;
  validatorsForComponent.add(validator);
  
  // Set up interval for continuous validation
  const intervalId = setInterval(validator, intervalMs);
  
  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    validatorsForComponent.delete(validator);
    if (validatorsForComponent.size === 0) {
      activeValidators.delete(componentName);
    }
  };
}

/**
 * Attempt to auto-fix invalid props based on registered strategies
 */
function attemptAutoFix(
  componentName: string, 
  props: Record<string, any>
): Record<string, any> | null {
  const metadata = componentRegistry.get(componentName);
  if (!metadata) return null;
  
  const fixedProps = { ...props };
  let wasFixed = false;
  
  // Try component-level fix strategy first
  if (metadata.autoFixStrategies) {
    Object.entries(metadata.autoFixStrategies).forEach(([key, fixStrategy]) => {
      if (props[key] !== undefined) {
        try {
          const fixed = fixStrategy(props[key]);
          fixedProps[key] = fixed;
          wasFixed = true;
          devLogger.info(
            'AutoFix', 
            `Auto-fixed ${componentName}.${key} from ${JSON.stringify(props[key])} to ${JSON.stringify(fixed)}`
          );
        } catch (error) {
          devLogger.warn('AutoFix', `Failed to auto-fix ${componentName}.${key}: ${error}`);
        }
      }
    });
  }
  
  // Try prop-level fix strategies
  Object.entries(metadata.props).forEach(([propName, propMeta]) => {
    if (props[propName] !== undefined && propMeta.autoFixStrategy) {
      try {
        const fixed = propMeta.autoFixStrategy(props[propName]);
        fixedProps[propName] = fixed;
        wasFixed = true;
        devLogger.info(
          'AutoFix', 
          `Auto-fixed ${componentName}.${propName} from ${JSON.stringify(props[propName])} to ${JSON.stringify(fixed)}`
        );
      } catch (error) {
        devLogger.warn('AutoFix', `Failed to auto-fix ${componentName}.${propName}: ${error}`);
      }
    }
  });
  
  return wasFixed ? fixedProps : null;
}

/**
 * Validates props against component documentation at runtime
 * Only runs in development mode
 * @throws {PropValidationError} If validation fails and throwOnError is true
 */
export function validateProps(
  componentName: string, 
  props: Record<string, any>,
  throwOnError: boolean = true
): boolean {
  if (process.env.NODE_ENV !== 'development') return true;
  
  const metadata = componentRegistry.get(componentName);
  if (!metadata) {
    const message = `No documentation found for component: ${componentName}`;
    devLogger.warn('ComponentDoc', message);
    if (throwOnError) {
      throw new PropValidationError(message);
    }
    return false;
  }
  
  let isValid = true;
  const errors: string[] = [];
  
  // Check for required props
  Object.entries(metadata.props).forEach(([propName, propMeta]) => {
    // Check required props
    if (propMeta.required && (props[propName] === undefined || props[propName] === null)) {
      const message = `Required prop '${propName}' is missing in ${componentName}`;
      errors.push(message);
      isValid = false;
    }
    
    // If prop is provided, run custom validator if it exists
    if (props[propName] !== undefined && propMeta.validator) {
      const validationResult = propMeta.validator(props[propName]);
      if (validationResult !== true) {
        const message = typeof validationResult === 'string' 
          ? validationResult 
          : `Prop '${propName}' failed validation in ${componentName}`;
        errors.push(message);
        isValid = false;
      }
    }
    
    // If prop is provided and has Zod schema, validate with it
    if (props[propName] !== undefined && propMeta.schema) {
      const validationResult = propMeta.schema.safeParse(props[propName]);
      if (!validationResult.success) {
        const message = `Prop '${propName}' failed Zod schema validation in ${componentName}`;
        errors.push(message);
        isValid = false;
      }
    }
  });
  
  // Validate whole component with schema if provided
  if (metadata.schema) {
    const validationResult = metadata.schema.safeParse(props);
    if (!validationResult.success) {
      const message = `Component ${componentName} props failed Zod schema validation`;
      errors.push(message);
      isValid = false;
    }
  }
  
  if (!isValid && throwOnError) {
    throw new PropValidationError(errors.join('\n'));
  }
  
  return isValid;
}

/**
 * Generate markdown documentation for all components
 */
export function generateDocsMarkdown(): string {
  let markdown = '# Component Documentation\n\n';
  
  componentRegistry.forEach((metadata, name) => {
    markdown += `## ${name}\n\n`;
    markdown += `${metadata.description}\n\n`;
    
    markdown += '### Props\n\n';
    markdown += '| Name | Type | Required | Description | Default |\n';
    markdown += '|------|------|----------|-------------|--------|\n';
    
    Object.entries(metadata.props).forEach(([propName, propMeta]) => {
      const defaultValue = propMeta.defaultValue !== undefined ? 
        `\`${JSON.stringify(propMeta.defaultValue)}\`` : '-';
      
      markdown += `| ${propName} | \`${propMeta.type}\` | ${propMeta.required ? 'Yes' : 'No'} | ${propMeta.description} | ${defaultValue} |\n`;
    });
    
    markdown += '\n### Examples\n\n';
    metadata.examples.forEach(example => {
      markdown += `#### ${example.name}\n\n`;
      markdown += `${example.description}\n\n`;
      markdown += '```tsx\n';
      markdown += example.code;
      markdown += '\n```\n\n';
    });
    
    if (metadata.notes && metadata.notes.length > 0) {
      markdown += '### Notes\n\n';
      metadata.notes.forEach(note => {
        markdown += `- ${note}\n`;
      });
    }
    
    markdown += '\n---\n\n';
  });
  
  return markdown;
}

/**
 * Creates a Zod schema from component metadata for validation
 */
export function createSchemaFromComponentDocs(componentName: string): z.ZodType<any> | null {
  const metadata = componentRegistry.get(componentName);
  if (!metadata) return null;
  
  const schemaShape: Record<string, z.ZodTypeAny> = {};
  
  Object.entries(metadata.props).forEach(([propName, propMeta]) => {
    // If prop has its own schema, use that
    if (propMeta.schema) {
      schemaShape[propName] = propMeta.schema;
      return;
    }
    
    // Otherwise, try to infer schema from type
    let propSchema: z.ZodTypeAny;
    
    switch (propMeta.type.toLowerCase()) {
      case 'string':
        propSchema = z.string();
        break;
      case 'number':
        propSchema = z.number();
        break;
      case 'boolean':
        propSchema = z.boolean();
        break;
      case 'array':
      case 'string[]':
        propSchema = z.array(z.string());
        break;
      case 'number[]':
        propSchema = z.array(z.number());
        break;
      case 'boolean[]':
        propSchema = z.array(z.boolean());
        break;
      case 'object':
        propSchema = z.object({}).passthrough();
        break;
      case 'function':
        propSchema = z.function();
        break;
      default:
        propSchema = z.any();
    }
    
    schemaShape[propName] = propMeta.required ? propSchema : propSchema.optional();
  });
  
  return z.object(schemaShape);
}

/**
 * Run validation for all currently monitored components
 * This can be called manually or automatically by the monitoring system
 */
export function validateAllMonitoredComponents(): { 
  valid: string[]; 
  invalid: { component: string; errors: string[] }[] 
} {
  const results = {
    valid: [] as string[],
    invalid: [] as { component: string; errors: string[] }[]
  };
  
  if (process.env.NODE_ENV !== 'development') {
    return results;
  }
  
  activeValidators.forEach((validators, componentName) => {
    validators.forEach(validator => {
      try {
        validator();
        results.valid.push(componentName);
      } catch (error) {
        if (error instanceof PropValidationError) {
          results.invalid.push({
            component: componentName,
            errors: [error.message]
          });
        } else {
          results.invalid.push({
            component: componentName,
            errors: [(error as Error).message || 'Unknown error']
          });
        }
      }
    });
  });
  
  return results;
}

/**
 * Create a continuous monitoring system that checks all registered components
 * periodically and reports any validation issues
 */
export function startGlobalComponentMonitoring(options: {
  intervalMs?: number;
  onIssueDetected?: (issues: { component: string; errors: string[] }[]) => void;
  autoFix?: boolean;
} = {}): () => void {
  if (process.env.NODE_ENV !== 'development') {
    return () => {}; // No-op in production
  }
  
  const { 
    intervalMs = 5000, 
    onIssueDetected, 
    autoFix = false 
  } = options;
  
  const intervalId = setInterval(() => {
    const result = validateAllMonitoredComponents();
    
    if (result.invalid.length > 0 && onIssueDetected) {
      onIssueDetected(result.invalid);
      
      if (autoFix) {
        // Here we would attempt to auto-fix all invalid components
        // This is more complex and would require a registry of component instances
        // and their current props, which is beyond this simple implementation
        devLogger.info('GlobalMonitoring', 'Auto-fix would attempt to correct validation issues');
      }
    }
  }, intervalMs);
  
  devLogger.info('GlobalMonitoring', `Started global component monitoring every ${intervalMs}ms`);
  
  return () => {
    clearInterval(intervalId);
    devLogger.info('GlobalMonitoring', 'Stopped global component monitoring');
  };
}
