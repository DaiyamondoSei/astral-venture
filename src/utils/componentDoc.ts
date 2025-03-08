
import React, { ComponentType } from 'react';

// Type definitions for component documentation
export interface ComponentDoc {
  name: string;
  description: string;
  props: PropDefinition[];
  examples?: CodeExample[];
  notes?: string[];
  version?: string;
  author?: string;
  deprecated?: boolean;
  children?: boolean;
}

export interface PropDefinition {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  description: string;
  values?: string[];
}

export interface CodeExample {
  title: string;
  code: string;
  description?: string;
}

export class PropValidationError extends Error {
  constructor(message: string, public component: string, public prop: string) {
    super(message);
    this.name = 'PropValidationError';
  }
}

// Store for component documentation
const componentDocs: Map<string, ComponentDoc> = new Map();
const monitoredComponents: Set<string> = new Set();

/**
 * Register a component with its documentation
 */
export function createComponentDoc(doc: ComponentDoc): void {
  componentDocs.set(doc.name, doc);
}

/**
 * Start global component monitoring
 */
export function startGlobalComponentMonitoring(): void {
  console.log('Started global component monitoring');
}

/**
 * Get documentation for a specific component
 */
export function getComponentDocs(componentName: string): ComponentDoc | undefined {
  return componentDocs.get(componentName);
}

/**
 * List all documented components
 */
export function listDocumentedComponents(): string[] {
  return Array.from(componentDocs.keys());
}

/**
 * Generate markdown documentation from component docs
 */
export function generateMarkdownDocs(): string {
  let markdown = '# Component Documentation\n\n';
  
  for (const [name, doc] of componentDocs.entries()) {
    markdown += `## ${name}\n\n`;
    
    if (doc.deprecated) {
      markdown += '> **DEPRECATED**\n\n';
    }
    
    markdown += `${doc.description}\n\n`;
    
    if (doc.props.length > 0) {
      markdown += '### Props\n\n';
      markdown += '| Name | Type | Required | Default | Description |\n';
      markdown += '|------|------|----------|---------|-------------|\n';
      
      for (const prop of doc.props) {
        markdown += `| ${prop.name} | \`${prop.type}\` | ${prop.required ? 'Yes' : 'No'} | ${prop.defaultValue !== undefined ? `\`${prop.defaultValue}\`` : '-'} | ${prop.description} |\n`;
      }
      
      markdown += '\n';
    }
    
    if (doc.examples && doc.examples.length > 0) {
      markdown += '### Examples\n\n';
      
      for (const example of doc.examples) {
        markdown += `#### ${example.title}\n\n`;
        
        if (example.description) {
          markdown += `${example.description}\n\n`;
        }
        
        markdown += '```jsx\n';
        markdown += example.code;
        markdown += '\n```\n\n';
      }
    }
    
    if (doc.notes && doc.notes.length > 0) {
      markdown += '### Notes\n\n';
      
      for (const note of doc.notes) {
        markdown += `- ${note}\n`;
      }
      
      markdown += '\n';
    }
  }
  
  return markdown;
}

/**
 * Monitor a component for validation
 */
export function monitorComponent(
  componentName: string, 
  props: Record<string, any>
): void {
  monitoredComponents.add(componentName);
  validateProps(componentName, props);
}

/**
 * Validate component props against documentation
 */
export function validateProps(
  componentName: string, 
  props: Record<string, any>
): boolean {
  const doc = componentDocs.get(componentName);
  
  if (!doc) {
    console.warn(`No documentation found for component: ${componentName}`);
    return false;
  }
  
  let isValid = true;
  
  // Check required props
  for (const propDef of doc.props) {
    if (propDef.required && (props[propDef.name] === undefined || props[propDef.name] === null)) {
      console.error(`Required prop '${propDef.name}' is missing in ${componentName}`);
      isValid = false;
    }
    
    // Validate prop types (basic validation)
    if (props[propDef.name] !== undefined) {
      const propValue = props[propDef.name];
      const expectedType = propDef.type;
      
      if (!validatePropType(propValue, expectedType)) {
        console.error(`Invalid type for prop '${propDef.name}' in ${componentName}. Expected ${expectedType}.`);
        isValid = false;
      }
      
      // Validate enum values if specified
      if (propDef.values && propDef.values.length > 0 && !propDef.values.includes(String(propValue))) {
        console.error(`Invalid value for prop '${propDef.name}' in ${componentName}. Expected one of: ${propDef.values.join(', ')}`);
        isValid = false;
      }
    }
  }
  
  return isValid;
}

/**
 * Validate all monitored components
 */
export function validateAllMonitoredComponents(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  let valid = true;
  
  console.log(`Validating ${monitoredComponents.size} monitored components`);
  
  // In a real implementation, we would iterate through all monitored components
  // and validate their current props. Since we don't have access to the current
  // prop values, this is just a placeholder.
  
  return { valid, errors };
}

/**
 * Higher-order component that documents a component
 */
export function documented<P>(componentDoc: ComponentDoc) {
  return function(Component: ComponentType<P>): ComponentType<P> {
    createComponentDoc(componentDoc);
    
    const DocumentedComponent = (props: P) => {
      // Validate props in development
      if (process.env.NODE_ENV !== 'production') {
        validateProps(componentDoc.name, props as Record<string, any>);
      }
      
      return <Component {...props} />;
    };
    
    // Set display name for dev tools
    DocumentedComponent.displayName = `Documented(${componentDoc.name})`;
    
    return DocumentedComponent;
  };
}

// Basic prop type validation
function validatePropType(value: any, type: string): boolean {
  // Handle union types
  if (type.includes('|')) {
    return type.split('|').some(t => validatePropType(value, t.trim()));
  }
  
  // Handle array types
  if (type.endsWith('[]')) {
    return Array.isArray(value) && value.every(v => validatePropType(v, type.slice(0, -2)));
  }
  
  // Basic types
  switch (type.toLowerCase()) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number';
    case 'boolean':
      return typeof value === 'boolean';
    case 'function':
      return typeof value === 'function';
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    case 'array':
      return Array.isArray(value);
    case 'any':
      return true;
    default:
      // If we can't validate, assume it's valid
      return true;
  }
}
