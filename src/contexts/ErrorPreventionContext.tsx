
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { performanceMonitor } from '@/utils/performance/performanceMonitor';

// Context type definition
export interface ErrorPreventionContextType {
  isErrorPreventionEnabled: boolean;
  enableErrorPrevention: (enable: boolean) => void;
  validateComponent: (componentName: string, props: any) => ComponentValidationResult[];
  trackPropChanges: (componentName: string, prevProps: any, newProps: any) => PropChangeResult[];
  recordRender: (componentName: string, renderTime: number) => void;
}

// Validation result structure
export interface ComponentValidationResult {
  componentName: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
  timestamp: number;
}

// Prop change analysis
export interface PropChangeResult {
  componentName: string;
  propName: string;
  oldValue: any;
  newValue: any;
  changeDetected: boolean;
}

// Create context with default values
const ErrorPreventionContext = createContext<ErrorPreventionContextType>({
  isErrorPreventionEnabled: true,
  enableErrorPrevention: () => {},
  validateComponent: () => [],
  trackPropChanges: () => [],
  recordRender: () => {}
});

// Provider component
export const ErrorPreventionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState(true);
  
  // Enable or disable error prevention
  const enableErrorPrevention = (enable: boolean) => {
    setIsEnabled(enable);
  };
  
  // Validate component props
  const validateComponent = (componentName: string, props: any): ComponentValidationResult[] => {
    if (!isEnabled) return [];
    
    const validationErrors: string[] = [];
    const validationWarnings: string[] = [];
    
    // Validate required props
    if (!props) {
      validationErrors.push('Component props are undefined');
      return [{
        componentName,
        valid: false,
        errors: validationErrors,
        warnings: validationWarnings,
        timestamp: Date.now()
      }];
    }
    
    // Check if this is a function component with a display name
    if (typeof componentName !== 'string' || componentName.length === 0) {
      validationWarnings.push('Component name is missing');
    }
    
    // Basic prop validation - could be extended with specific validation rules
    Object.entries(props).forEach(([propName, propValue]) => {
      // Check for undefined values that aren't explicitly set as undefined
      if (propValue === undefined && props.hasOwnProperty(propName)) {
        validationWarnings.push(`Prop "${propName}" is undefined`);
      }
    });
    
    return [{
      componentName,
      valid: validationErrors.length === 0,
      errors: validationErrors,
      warnings: validationWarnings,
      timestamp: Date.now()
    }];
  };
  
  // Track prop changes between renders
  const trackPropChanges = (
    componentName: string, 
    prevProps: any, 
    newProps: any
  ): PropChangeResult[] => {
    if (!isEnabled || !prevProps || !newProps) return [];
    
    const results: PropChangeResult[] = [];
    
    // Compare all props from previous render
    Object.keys(prevProps).forEach(propName => {
      results.push({
        componentName,
        propName,
        oldValue: prevProps[propName],
        newValue: newProps[propName],
        changeDetected: prevProps[propName] !== newProps[propName]
      });
    });
    
    // Check for new props
    Object.keys(newProps).forEach(propName => {
      if (!prevProps.hasOwnProperty(propName)) {
        results.push({
          componentName,
          propName,
          oldValue: undefined,
          newValue: newProps[propName],
          changeDetected: true
        });
      }
    });
    
    return results;
  };
  
  // Record component render time
  const recordRender = (componentName: string, renderTime: number) => {
    if (!isEnabled) return;
    
    // Use performance monitor to record render
    performanceMonitor.reportRender(componentName, renderTime);
  };
  
  return (
    <ErrorPreventionContext.Provider value={{
      isErrorPreventionEnabled: isEnabled,
      enableErrorPrevention,
      validateComponent,
      trackPropChanges,
      recordRender
    }}>
      {children}
    </ErrorPreventionContext.Provider>
  );
};

// Hook for using the context
export const useErrorPrevention = () => useContext(ErrorPreventionContext);
