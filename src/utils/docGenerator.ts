
/**
 * Utility for generating standardized JSDoc documentation for components,
 * hooks, and utility functions.
 * 
 * This helps maintain consistent documentation patterns across the codebase.
 */

/**
 * Component documentation template
 * 
 * @param componentName Name of the component
 * @param description Brief description of what the component does
 * @param props Description of the component's props
 * @param examples Usage examples
 * @returns Formatted JSDoc string
 */
export function generateComponentDoc(
  componentName: string,
  description: string,
  props?: { [key: string]: string },
  examples?: string[]
): string {
  let doc = `/**
 * ${componentName}
 *
 * ${description}
 *`;

  if (props) {
    doc += '\n *';
    for (const [propName, propDesc] of Object.entries(props)) {
      doc += `\n * @prop {*} ${propName} - ${propDesc}`;
    }
  }

  if (examples && examples.length > 0) {
    doc += '\n *\n * @example';
    examples.forEach(example => {
      doc += `\n * ${example}`;
    });
  }

  doc += '\n */';
  return doc;
}

/**
 * Hook documentation template
 * 
 * @param hookName Name of the hook
 * @param description Brief description of what the hook does
 * @param params Description of the hook's parameters
 * @param returns Description of the hook's return value
 * @param examples Usage examples
 * @returns Formatted JSDoc string
 */
export function generateHookDoc(
  hookName: string,
  description: string,
  params?: { [key: string]: string },
  returns?: string,
  examples?: string[]
): string {
  let doc = `/**
 * ${hookName}
 *
 * ${description}
 *`;

  if (params) {
    doc += '\n *';
    for (const [paramName, paramDesc] of Object.entries(params)) {
      doc += `\n * @param {*} ${paramName} - ${paramDesc}`;
    }
  }

  if (returns) {
    doc += `\n *\n * @returns ${returns}`;
  }

  if (examples && examples.length > 0) {
    doc += '\n *\n * @example';
    examples.forEach(example => {
      doc += `\n * ${example}`;
    });
  }

  doc += '\n */';
  return doc;
}

/**
 * Utility function documentation template
 * 
 * @param functionName Name of the utility function
 * @param description Brief description of what the function does
 * @param params Description of the function's parameters
 * @param returns Description of the function's return value
 * @param examples Usage examples
 * @returns Formatted JSDoc string
 */
export function generateUtilityDoc(
  functionName: string,
  description: string,
  params?: { [key: string]: string },
  returns?: string,
  examples?: string[]
): string {
  return generateHookDoc(functionName, description, params, returns, examples);
}
