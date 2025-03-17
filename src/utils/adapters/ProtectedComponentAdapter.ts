
/**
 * Protected Component Adapter
 * 
 * This utility helps manage interactions with protected components that
 * we can't directly modify. It implements the Adapter Pattern described in 
 * our architecture documentation.
 */

/**
 * Register a component as protected
 */
export function registerProtectedComponent(componentPath: string): void {
  if (!protectedComponents.includes(componentPath)) {
    protectedComponents.push(componentPath);
    console.log(`Registered protected component: ${componentPath}`);
  }
}

/**
 * Check if a component is protected
 */
export function isProtectedComponent(componentPath: string): boolean {
  return protectedComponents.includes(componentPath);
}

/**
 * Get the list of all protected components
 */
export function getProtectedComponents(): string[] {
  return [...protectedComponents];
}

/**
 * Create a type-safe adapter for a protected component.
 * 
 * This is a helper function to ensure properties are correctly passed to a 
 * protected component by following the Adapter Pattern.
 * 
 * @example
 * // For a protected component with props { value: string, onChange: (value: string) => void }
 * const createInputAdapter = createProtectedAdapter<{ value: string, onChange: (value: string) => void }>();
 * 
 * // Use the adapter with your domain model
 * const inputAdapter = createInputAdapter({
 *   initialValue: "Hello world",
 *   onValueChange: (newValue) => console.log(newValue),
 * }, {
 *   mapToProps: ({ initialValue, onValueChange }) => ({
 *     value: initialValue,
 *     onChange: onValueChange,
 *   })
 * });
 * 
 * // Pass the adapter's props to the protected component
 * <ProtectedInput {...inputAdapter.props} />
 */
export function createProtectedAdapter<TProtectedProps>() {
  return function adapter<TDomainProps>(
    domainProps: TDomainProps,
    options: {
      mapToProps: (domainProps: TDomainProps) => TProtectedProps;
    }
  ) {
    const props = options.mapToProps(domainProps);
    
    return {
      props,
      domainProps
    };
  };
}

// Store protected component paths
const protectedComponents: string[] = [
  'src/contexts/PerformanceContext.tsx',
  'src/contexts/AdaptivePerformanceContext.tsx',
  'src/shared/contexts/PerformanceContext.tsx'
];
