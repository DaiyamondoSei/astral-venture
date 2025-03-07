/**
 * Component Documentation System
 * 
 * This utility helps document components and their props for better developer experience
 * and error prevention.
 */

import { ComponentType } from 'react';
import { z } from 'zod';

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
};

const componentRegistry = new Map<string, ComponentMetadata>();

/**
 * Registers documentation for a component
 */
export function registerComponent(metadata: ComponentMetadata): void {
  componentRegistry.set(metadata.name, metadata);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`📚 Registered documentation for ${metadata.name}`);
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
    // @ts-expect-error - We're wrapping the component to add validation
    const WrappedComponent = (props: T) => {
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
    console.warn(message);
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
