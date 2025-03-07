
import React from 'react';

/**
 * Interface for component documentation metadata
 */
export interface ComponentDocumentation {
  displayName: string;
  description: string;
  props: Record<string, PropDocumentation>;
  examples?: ComponentExample[];
  category?: string;
  seeAlso?: string[];
}

/**
 * Interface for property documentation
 */
export interface PropDocumentation {
  type: string;
  description: string;
  required?: boolean;
  defaultValue?: string;
}

/**
 * Interface for component usage examples
 */
export interface ComponentExample {
  title: string;
  description?: string;
  code: string;
  preview?: React.ReactNode;
}

// Map to store component documentation
const componentDocs = new Map<string, ComponentDocumentation>();

/**
 * Adds documentation to a component
 * 
 * @param Component The component to document
 * @param documentation The documentation details
 * @returns The original component with documentation metadata
 */
export function documentComponent<T extends React.ComponentType<any>>(
  Component: T,
  documentation: ComponentDocumentation
): T {
  const DocComponent = Component as any;
  
  // Add documentation to the component
  DocComponent.displayName = documentation.displayName;
  DocComponent.__docs = documentation;
  
  // Store in global map for documentation tools
  componentDocs.set(documentation.displayName, documentation);
  
  return DocComponent as T;
}

/**
 * Gets documentation for a component
 * 
 * @param componentName The name of the component to get documentation for
 * @returns The component documentation or undefined if not found
 */
export function getComponentDocumentation(componentName: string): ComponentDocumentation | undefined {
  return componentDocs.get(componentName);
}

/**
 * Gets all documented components
 * 
 * @returns Array of all component documentation
 */
export function getAllDocumentedComponents(): ComponentDocumentation[] {
  return Array.from(componentDocs.values());
}

/**
 * Gets components by category
 * 
 * @param category The category to filter by
 * @returns Array of component documentation for the specified category
 */
export function getComponentsByCategory(category: string): ComponentDocumentation[] {
  return Array.from(componentDocs.values()).filter(doc => doc.category === category);
}
