
import React, { ComponentType } from 'react';
import { devLogger } from './debugUtils';

/**
 * Type definitions for component documentation
 */
export interface ComponentDocumentation {
  name: string;
  description?: string;
  props?: PropDocumentation[];
  examples?: ComponentExample[];
  dependencies?: string[];
  hooks?: string[];
  notes?: string[];
  complexity?: number;
}

export interface PropDocumentation {
  name: string;
  type: string;
  required?: boolean;
  default?: any;
  description?: string;
}

export interface ComponentExample {
  title: string;
  code: string;
  description?: string;
}

/**
 * Create component documentation for a React component
 */
export function createComponentDoc<T>(
  Component: ComponentType<T>,
  documentation: Omit<ComponentDocumentation, 'name'>
): ComponentDocumentation {
  const componentName = Component.displayName || 
    (Component as any).name || 
    'UnnamedComponent';
  
  return {
    name: componentName,
    ...documentation
  };
}

/**
 * Generate component documentation from props interface
 */
export function extractPropsFromInterface<T>(
  propsInterface: T
): PropDocumentation[] {
  try {
    // This is a simplified implementation
    // In a real-world scenario, you would use TypeScript compiler API
    // to extract prop information from the interface
    
    return Object.entries(propsInterface as any).map(([name, type]) => ({
      name,
      type: typeof type === 'object' ? 'object' : typeof type,
      required: true
    }));
  } catch (error) {
    devLogger.error('ComponentDoc', 'Failed to extract props', error);
    return [];
  }
}

/**
 * Generate markdown documentation from component documentation
 */
export function generateMarkdownDocs(
  docs: ComponentDocumentation
): string {
  let markdown = `# ${docs.name}\n\n`;
  
  if (docs.description) {
    markdown += `${docs.description}\n\n`;
  }
  
  if (docs.complexity) {
    markdown += `**Complexity:** ${docs.complexity}/10\n\n`;
  }
  
  if (docs.props && docs.props.length > 0) {
    markdown += '## Props\n\n';
    markdown += '| Name | Type | Required | Default | Description |\n';
    markdown += '|------|------|----------|---------|-------------|\n';
    
    docs.props.forEach(prop => {
      markdown += `| ${prop.name} | ${prop.type} | ${prop.required ? 'Yes' : 'No'} | ${
        prop.default !== undefined ? `\`${prop.default}\`` : ''
      } | ${prop.description || ''} |\n`;
    });
    
    markdown += '\n';
  }
  
  if (docs.hooks && docs.hooks.length > 0) {
    markdown += '## Hooks\n\n';
    docs.hooks.forEach(hook => {
      markdown += `- ${hook}\n`;
    });
    markdown += '\n';
  }
  
  if (docs.dependencies && docs.dependencies.length > 0) {
    markdown += '## Dependencies\n\n';
    docs.dependencies.forEach(dep => {
      markdown += `- ${dep}\n`;
    });
    markdown += '\n';
  }
  
  if (docs.examples && docs.examples.length > 0) {
    markdown += '## Examples\n\n';
    
    docs.examples.forEach(example => {
      markdown += `### ${example.title}\n\n`;
      
      if (example.description) {
        markdown += `${example.description}\n\n`;
      }
      
      markdown += '```jsx\n';
      markdown += example.code;
      markdown += '\n```\n\n';
    });
  }
  
  if (docs.notes && docs.notes.length > 0) {
    markdown += '## Notes\n\n';
    docs.notes.forEach(note => {
      markdown += `- ${note}\n`;
    });
  }
  
  return markdown;
}

/**
 * Attach documentation to a component for access at runtime
 */
export function attachDocumentation<T>(
  Component: ComponentType<T>,
  documentation: Omit<ComponentDocumentation, 'name'>
): ComponentType<T> {
  const doc = createComponentDoc(Component, documentation);
  // Using type assertion to safely add the docs property
  const ComponentWithDocs = Component as ComponentType<T> & { docs: ComponentDocumentation };
  ComponentWithDocs.docs = doc;
  return ComponentWithDocs;
}
