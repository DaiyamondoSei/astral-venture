
import React from 'react';

/**
 * Component documentation interface
 */
export interface ComponentDoc {
  /** Component name */
  name: string;
  /** Component description */
  description: string;
  /** Usage examples */
  examples?: string[];
  /** Props documentation */
  props?: Record<string, PropDoc>;
  /** Related components */
  seeAlso?: string[];
  /** Version information */
  version?: string;
  /** Component author */
  author?: string;
}

/**
 * Prop documentation interface
 */
export interface PropDoc {
  /** Prop type */
  type: string;
  /** Whether the prop is required */
  required?: boolean;
  /** Default value */
  default?: any;
  /** Prop description */
  description: string;
}

/**
 * Component documentation registry
 */
const componentDocsRegistry: Record<string, ComponentDoc> = {};

/**
 * Registers component documentation
 * 
 * @param componentDoc Component documentation
 */
export function registerComponentDoc(componentDoc: ComponentDoc): void {
  componentDocsRegistry[componentDoc.name] = componentDoc;
}

/**
 * Gets component documentation
 * 
 * @param componentName Component name
 * @returns Component documentation or undefined
 */
export function getComponentDoc(componentName: string): ComponentDoc | undefined {
  return componentDocsRegistry[componentName];
}

/**
 * Gets all registered component documentation
 * 
 * @returns All component documentation
 */
export function getAllComponentDocs(): Record<string, ComponentDoc> {
  return { ...componentDocsRegistry };
}

/**
 * Higher-order component that adds documentation
 * 
 * @param Component The component to document
 * @param componentDoc Component documentation
 * @returns The documented component
 */
export function withDocumentation<P>(
  Component: React.ComponentType<P>,
  componentDoc: ComponentDoc
): React.ComponentType<P> {
  // Register the component documentation
  registerComponentDoc(componentDoc);
  
  // Set the displayName for the component
  const DocumentedComponent = React.memo(Component);
  DocumentedComponent.displayName = componentDoc.name;
  
  return DocumentedComponent;
}

/**
 * Component documentation viewer
 */
export const ComponentDocViewer: React.FC<{ componentName: string }> = ({ componentName }) => {
  const doc = getComponentDoc(componentName);
  
  if (!doc) {
    return <div>No documentation found for component: {componentName}</div>;
  }
  
  return (
    <div className="component-doc p-4 border rounded-md">
      <h2 className="text-xl font-bold">{doc.name}</h2>
      <p className="mt-2">{doc.description}</p>
      
      {doc.version && <div className="text-sm mt-2">Version: {doc.version}</div>}
      {doc.author && <div className="text-sm">Author: {doc.author}</div>}
      
      {doc.examples && doc.examples.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Examples:</h3>
          {doc.examples.map((example, index) => (
            <pre key={index} className="mt-2 p-3 bg-gray-100 rounded text-sm overflow-auto">
              {example}
            </pre>
          ))}
        </div>
      )}
      
      {doc.props && Object.keys(doc.props).length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Props:</h3>
          <div className="mt-2">
            {Object.entries(doc.props).map(([propName, propDoc]) => (
              <div key={propName} className="mt-3">
                <div className="flex items-center">
                  <span className="font-mono text-sm">{propName}</span>
                  <span className="mx-2 text-gray-500">:</span>
                  <span className="font-mono text-sm text-blue-600">{propDoc.type}</span>
                  {propDoc.required && <span className="ml-2 text-red-500 text-xs">Required</span>}
                </div>
                <div className="mt-1 text-sm">{propDoc.description}</div>
                {propDoc.default !== undefined && (
                  <div className="mt-1 text-sm">
                    Default: <code className="bg-gray-100 px-1 rounded">{JSON.stringify(propDoc.default)}</code>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {doc.seeAlso && doc.seeAlso.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">See Also:</h3>
          <ul className="mt-1 list-disc list-inside">
            {doc.seeAlso.map((relatedComponent) => (
              <li key={relatedComponent} className="text-blue-500 cursor-pointer hover:underline">
                {relatedComponent}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
