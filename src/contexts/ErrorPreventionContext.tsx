import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface ErrorLogEntry {
  componentName: string;
  message: string;
  timestamp: Date;
}

// Define a type for the component registry
type ComponentRegistry = {
  [componentName: string]: {
    component: React.ComponentType<any>;
    propTypes?: React.ValidationMap<any>;
  };
};

interface ErrorPreventionContextType {
  validateComponent: (componentName: string, props: any) => ValidationResult;
  enableErrorPrevention: (enable: boolean) => void;
  errorLogs: ErrorLogEntry[];
  clearErrorLogs: () => void;
  isEnabled: boolean; // Added for compatibility
  disableErrorPrevention: (disable: boolean) => void; // Added for compatibility
  validateAllComponents: () => ValidationResult[]; // Added for compatibility
}

export const ErrorPreventionContext = React.createContext<ErrorPreventionContextType>({
  validateComponent: () => ({ isValid: true, errors: [] }),
  enableErrorPrevention: () => {},
  errorLogs: [],
  clearErrorLogs: () => {},
  isEnabled: true, // Added for compatibility
  disableErrorPrevention: () => {}, // Added for compatibility
  validateAllComponents: () => [] // Added for compatibility
});

export const useErrorPrevention = () => useContext(ErrorPreventionContext);

export const ErrorPreventionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [enabled, setEnabled] = useState(true);
  const [errorLogs, setErrorLogs] = useState<ErrorLogEntry[]>([]);
  const componentRegistry = useRef<ComponentRegistry>({});

  // Function to register a component with its propTypes
  const registerComponent = useCallback(
    (componentName: string, component: React.ComponentType<any>, propTypes?: React.ValidationMap<any>) => {
      componentRegistry.current[componentName] = { component, propTypes };
    },
    []
  );

  // useEffect to automatically register all components in the app
  useEffect(() => {
    // Get all components in the app
    const allComponents = document.querySelectorAll('[data-component-name]');

    // Register each component with its propTypes
    allComponents.forEach((component) => {
      const componentName = component.getAttribute('data-component-name');
      if (componentName) {
        // @ts-ignore:next-line
        registerComponent(componentName, component, component.propTypes);
      }
    });
  }, [registerComponent]);

  // Function to validate a component's props
  const validateComponent = useCallback(
    (componentName: string, props: any): ValidationResult => {
      if (!enabled) {
        return { isValid: true, errors: [] };
      }

      const componentData = componentRegistry.current[componentName];
      if (!componentData || !componentData.propTypes) {
        return { isValid: true, errors: [] };
      }

      const propTypes = componentData.propTypes;
      const errors: string[] = [];

      for (const propName in propTypes) {
        if (propTypes.hasOwnProperty(propName)) {
          const validator = propTypes[propName];
          if (validator) {
            try {
              // @ts-ignore:next-line
              validator(props, propName, componentName, 'prop', propName);
            } catch (error: any) {
              errors.push(error.message);
              setErrorLogs((prevLogs) => [
                ...prevLogs,
                {
                  componentName,
                  message: error.message,
                  timestamp: new Date(),
                },
              ]);
            }
          }
        }
      }

      return { isValid: errors.length === 0, errors };
    },
    [enabled, registerComponent]
  );

  // Function to enable error prevention
  const enableErrorPrevention = useCallback((enable: boolean) => {
    setEnabled(enable);
  }, []);

  // Function to clear error logs
  const clearErrorLogs = useCallback(() => {
    setErrorLogs([]);
  }, []);
  
  // Create the context value
  const contextValue: ErrorPreventionContextType = {
    validateComponent,
    enableErrorPrevention,
    errorLogs,
    clearErrorLogs,
    // Added for compatibility with older code
    isEnabled: enabled,
    disableErrorPrevention: (disable: boolean) => enableErrorPrevention(!disable),
    validateAllComponents: () => {
      // This is a simple implementation to maintain compatibility
      return Object.keys(componentRegistry.current).map(componentName => 
        validateComponent(componentName, {})
      );
    }
  };

  return (
    <ErrorPreventionContext.Provider value={contextValue}>
      {children}
    </ErrorPreventionContext.Provider>
  );
};
