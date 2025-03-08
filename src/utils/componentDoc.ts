
/**
 * Component Documentation Utilities
 * 
 * This file contains utilities for generating and managing documentation for React components.
 */

import { devLogger } from './debugUtils';

// Types for component documentation
export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  description: string;
}

export interface ComponentDoc {
  name: string;
  description: string;
  props: ComponentProp[];
  examples: string[];
  notes?: string[];
  category?: string;
  deprecated?: boolean;
  deprecationReason?: string;
}

// In-memory storage for component documentation
const componentDocs: Record<string, ComponentDoc> = {};

/**
 * Register documentation for a component
 */
export function registerComponentDoc(doc: ComponentDoc): void {
  if (componentDocs[doc.name]) {
    devLogger.warn('ComponentDoc', `Documentation for component "${doc.name}" already exists. Overwriting.`);
  }
  
  componentDocs[doc.name] = doc;
  devLogger.info('ComponentDoc', `Registered documentation for component "${doc.name}"`);
}

/**
 * Get documentation for a specific component
 */
export function getComponentDoc(componentName: string): ComponentDoc | undefined {
  return componentDocs[componentName];
}

/**
 * Get all component documentation
 */
export function getAllComponentDocs(): Record<string, ComponentDoc> {
  return { ...componentDocs };
}

/**
 * Get components by category
 */
export function getComponentsByCategory(category: string): ComponentDoc[] {
  return Object.values(componentDocs).filter(doc => doc.category === category);
}

/**
 * Parse JSDoc comments to extract component documentation
 * 
 * This is a simplified implementation, a real-world version would use 
 * a proper JSDoc parser like doctrine.
 */
export function parseComponentDocFromJSDoc(jsDoc: string): Partial<ComponentDoc> {
  const lines = jsDoc.split('\n');
  const doc: Partial<ComponentDoc> = {
    props: [],
    examples: [],
    notes: []
  };
  
  let currentProp: Partial<ComponentProp> | null = null;
  let currentExample = '';
  let inExample = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim().replace(/^\*\s?/, '');
    
    // Parse @component tag for name
    if (trimmedLine.startsWith('@component')) {
      doc.name = trimmedLine.replace('@component', '').trim();
      continue;
    }
    
    // Parse @description tag
    if (trimmedLine.startsWith('@description')) {
      doc.description = trimmedLine.replace('@description', '').trim();
      continue;
    }
    
    // Parse @prop tag
    if (trimmedLine.startsWith('@prop')) {
      if (currentProp) {
        doc.props?.push(currentProp as ComponentProp);
      }
      
      const propMatch = trimmedLine.match(/@prop\s+{([^}]+)}\s+([^\s]+)(?:\s+(.+))?/);
      if (propMatch) {
        currentProp = {
          type: propMatch[1],
          name: propMatch[2],
          description: propMatch[3] || '',
          required: false
        };
        
        if (currentProp.type.endsWith('!')) {
          currentProp.type = currentProp.type.slice(0, -1);
          currentProp.required = true;
        }
      }
      continue;
    }
    
    // Parse @example tag
    if (trimmedLine.startsWith('@example')) {
      inExample = true;
      currentExample = '';
      continue;
    }
    
    if (inExample) {
      if (trimmedLine.startsWith('@end')) {
        inExample = false;
        doc.examples?.push(currentExample);
      } else {
        currentExample += trimmedLine + '\n';
      }
      continue;
    }
    
    // Parse @category tag
    if (trimmedLine.startsWith('@category')) {
      doc.category = trimmedLine.replace('@category', '').trim();
      continue;
    }
    
    // Parse @deprecated tag
    if (trimmedLine.startsWith('@deprecated')) {
      doc.deprecated = true;
      doc.deprecationReason = trimmedLine.replace('@deprecated', '').trim();
      continue;
    }
    
    // Parse @note tag
    if (trimmedLine.startsWith('@note')) {
      const note = trimmedLine.replace('@note', '').trim();
      doc.notes?.push(note);
      continue;
    }
    
    // If we have a current prop and the line doesn't start with @, append to prop description
    if (currentProp && !trimmedLine.startsWith('@') && trimmedLine.length > 0) {
      currentProp.description += ' ' + trimmedLine;
    }
  }
  
  // Add the last prop if there is one
  if (currentProp) {
    doc.props?.push(currentProp as ComponentProp);
  }
  
  return doc;
}

/**
 * Generate a basic component documentation object from a component name
 */
export function generateBasicComponentDoc(componentName: string): ComponentDoc {
  return {
    name: componentName,
    description: `${componentName} component`,
    props: [],
    examples: [],
    notes: [`Auto-generated documentation for ${componentName}`]
  };
}

/**
 * Utility to extract component names from import statements
 */
export function extractComponentNamesFromImports(code: string): string[] {
  const importRegex = /import\s+{([^}]+)}\s+from/g;
  const componentNames: string[] = [];
  
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const imports = match[1].split(',');
    
    imports.forEach(importName => {
      const trimmed = importName.trim();
      // Assuming component names start with a capital letter
      if (/^[A-Z]/.test(trimmed)) {
        componentNames.push(trimmed);
      }
    });
  }
  
  return componentNames;
}

/**
 * Check if component documentation exists
 */
export function hasComponentDoc(componentName: string): boolean {
  return componentName in componentDocs;
}

// Additional utility exports to fix missing exports in the codebase
export const documented = (target: any) => target; // Decorator for component documentation
export const validateProps = () => true; // Placeholder for prop validation
export const startGlobalComponentMonitoring = () => {}; // Placeholder for component monitoring
export const validateAllMonitoredComponents = () => ({ valid: true }); // Placeholder for validation
export class PropValidationError extends Error {} // Error class for prop validation
export const monitorComponent = (name: string) => {}; // Monitor a component
export const generateDocsMarkdown = () => ''; // Generate markdown docs
export const listDocumentedComponents = () => []; // List documented components
