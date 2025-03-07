
import React from 'react';

/**
 * Interface for documenting component props
 */
export interface IComponentPropsDocumentation {
  name: string;
  description: string;
  required: boolean;
  type: string;
  defaultValue?: string;
  example?: string;
}

/**
 * Interface for documenting components
 */
export interface IComponentDocumentation {
  name: string;
  description: string;
  props: IComponentPropsDocumentation[];
  examples: IComponentExample[];
  notes?: string[];
}

export interface IComponentExample {
  title: string;
  code: string;
  description?: string;
}

/**
 * Documentation decorator for React components
 * This attaches documentation metadata to a component
 */
export function documentComponent<T>(
  component: React.ComponentType<T>, 
  documentation: IComponentDocumentation
): React.ComponentType<T> {
  const ComponentWithDocumentation = component as any;
  ComponentWithDocumentation.__documentation = documentation;
  return ComponentWithDocumentation;
}

/**
 * Get documentation for a component
 */
export function getComponentDocumentation(
  component: React.ComponentType<any>
): IComponentDocumentation | null {
  return (component as any).__documentation || null;
}

/**
 * Generate prop validation errors based on component documentation
 */
export function validateComponentProps<T>(
  component: React.ComponentType<T>,
  props: T
): string[] {
  const errors: string[] = [];
  const documentation = getComponentDocumentation(component);
  
  if (!documentation) return errors;
  
  for (const propDoc of documentation.props) {
    // Check required props
    if (propDoc.required && 
        (props as any)[propDoc.name] === undefined) {
      errors.push(`Required prop "${propDoc.name}" is missing`);
    }
    
    // Additional validation could be added here based on type, etc.
  }
  
  return errors;
}
