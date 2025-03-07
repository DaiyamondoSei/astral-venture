
import React, { ComponentType, memo } from 'react';

// Simple component documentation structure
interface ComponentDocumentation {
  name: string;
  description: string;
  props: PropDocumentation[];
  examples?: ComponentExample[];
}

interface PropDocumentation {
  name: string;
  type: string;
  required: boolean;
  description: string;
  defaultValue?: string;
}

interface ComponentExample {
  title: string;
  code: string;
  description?: string;
}

// Component registry to store documentation
const componentRegistry: Record<string, ComponentDocumentation> = {};

/**
 * Registers documentation for a component
 */
export function registerComponentDocs(docs: ComponentDocumentation): void {
  componentRegistry[docs.name] = docs;
}

/**
 * Retrieves documentation for a component by name
 */
export function getComponentDocs(componentName: string): ComponentDocumentation | undefined {
  return componentRegistry[componentName];
}

/**
 * Retrieves all component documentation
 */
export function getAllComponentDocs(): Record<string, ComponentDocumentation> {
  return { ...componentRegistry };
}

/**
 * HOC that documents a component and adds it to the registry
 */
export function documentComponent<P>(
  Component: ComponentType<P>,
  docs: Omit<ComponentDocumentation, 'name'>
) {
  const componentName = Component.displayName || Component.name || 'UnnamedComponent';
  
  // Register the documentation
  registerComponentDocs({
    name: componentName,
    ...docs
  });
  
  // Set displayName for better debugging
  const DocumentedComponent = memo(Component);
  DocumentedComponent.displayName = `Documented(${componentName})`;
  
  return DocumentedComponent;
}

/**
 * Component to display documentation for a specific component
 */
export const ComponentDocsDisplay: React.FC<{ componentName: string }> = ({ componentName }) => {
  const docs = getComponentDocs(componentName);
  
  if (!docs) {
    return <div>No documentation found for component: {componentName}</div>;
  }
  
  return (
    <div className="component-docs">
      <h2>{docs.name}</h2>
      <p>{docs.description}</p>
      
      <h3>Props</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Required</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {docs.props.map(prop => (
            <tr key={prop.name}>
              <td>{prop.name}</td>
              <td><code>{prop.type}</code></td>
              <td>{prop.required ? 'Yes' : 'No'}</td>
              <td>{prop.defaultValue ? <code>{prop.defaultValue}</code> : '-'}</td>
              <td>{prop.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {docs.examples && docs.examples.length > 0 && (
        <>
          <h3>Examples</h3>
          {docs.examples.map((example, index) => (
            <div key={index} className="component-example">
              <h4>{example.title}</h4>
              {example.description && <p>{example.description}</p>}
              <pre>
                <code>{example.code}</code>
              </pre>
            </div>
          ))}
        </>
      )}
    </div>
  );
};
