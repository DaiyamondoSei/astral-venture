/**
 * Component Documentation System
 * 
 * This utility helps document components and their props for better developer experience
 * and error prevention.
 */

import { ComponentType } from 'react';

type PropMetadata = {
  type: string;
  required: boolean;
  description: string;
  defaultValue?: any;
  example?: any;
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
  
  // Return the original component unchanged
  return Component;
}

/**
 * Validates props against component documentation at runtime
 * Only runs in development mode
 */
export function validateProps(
  componentName: string, 
  props: Record<string, any>
): boolean {
  if (process.env.NODE_ENV !== 'development') return true;
  
  const metadata = componentRegistry.get(componentName);
  if (!metadata) {
    console.warn(`No documentation found for component: ${componentName}`);
    return false;
  }
  
  let isValid = true;
  
  // Check for required props
  Object.entries(metadata.props).forEach(([propName, propMeta]) => {
    if (propMeta.required && (props[propName] === undefined || props[propName] === null)) {
      console.error(`Required prop '${propName}' is missing in ${componentName}`);
      isValid = false;
    }
  });
  
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
