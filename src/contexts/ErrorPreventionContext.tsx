
import React, { createContext, useContext, useState } from 'react';
import { performanceMonitor } from '@/utils/performance/performanceMonitor';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ErrorPreventionContextType {
  isEnabled: boolean;
  enableErrorPrevention: (enable: boolean) => void;
  trackRender: (componentName: string, renderTime: number, info?: any) => void;
  recordRender: (componentName: string, renderTime: number, info?: any) => void;
  trackPropChanges: (componentName: string, prevProps: any, nextProps: any) => boolean;
  validateComponent: (componentName: string, props: any) => ValidationResult;
  validateProps: (props: any, validationRules: any) => ValidationResult;
  errorComponents: string[];
  warnComponents: string[];
}

// Create the context with default values
const ErrorPreventionContext = createContext<ErrorPreventionContextType>({
  isEnabled: true,
  enableErrorPrevention: () => {},
  trackRender: () => {},
  recordRender: () => {},
  trackPropChanges: () => true,
  validateComponent: () => ({ valid: true, errors: [], warnings: [] }),
  validateProps: () => ({ valid: true, errors: [], warnings: [] }),
  errorComponents: [],
  warnComponents: []
});

// Provider component
export const ErrorPreventionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [errorComponents, setErrorComponents] = useState<string[]>([]);
  const [warnComponents, setWarnComponents] = useState<string[]>([]);
  
  const enableErrorPrevention = (enable: boolean) => {
    setIsEnabled(enable);
  };
  
  // Track component render
  const trackRender = (componentName: string, renderTime: number, info?: any) => {
    if (!isEnabled) return;
    
    performanceMonitor.reportRender(componentName, renderTime, info);
    
    // Log slow renders
    if (renderTime > 50) {
      console.warn(`Slow render: ${componentName} took ${renderTime}ms to render`);
      
      if (!warnComponents.includes(componentName)) {
        setWarnComponents(prev => [...prev, componentName]);
      }
    }
  };
  
  // Alias for trackRender to maintain compatibility
  const recordRender = trackRender;
  
  // Track prop changes and prevent unnecessary renders
  const trackPropChanges = (componentName: string, prevProps: any, nextProps: any): boolean => {
    if (!isEnabled) return true;
    
    const changedProps: string[] = [];
    const allProps = new Set([...Object.keys(prevProps), ...Object.keys(nextProps)]);
    
    for (const prop of allProps) {
      if (prevProps[prop] !== nextProps[prop]) {
        changedProps.push(prop);
      }
    }
    
    // Only log if props actually changed
    if (changedProps.length > 0) {
      console.debug(`${componentName} re-rendering due to changes in props:`, changedProps);
    }
    
    return changedProps.length > 0;
  };
  
  // Validate component props against rules
  const validateComponent = (componentName: string, props: any): ValidationResult => {
    if (!isEnabled) return { valid: true, errors: [], warnings: [] };
    
    // This is a placeholder. In a real implementation, we would validate
    // against component-specific rules.
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (errors.length > 0 && !errorComponents.includes(componentName)) {
      setErrorComponents(prev => [...prev, componentName]);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  };
  
  // Validate props against validation rules
  const validateProps = (props: any, validationRules: any): ValidationResult => {
    if (!isEnabled) return { valid: true, errors: [], warnings: [] };
    
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Iterate through rules and validate
    for (const [prop, rule] of Object.entries(validationRules)) {
      if (typeof rule === 'function') {
        const result = rule(props[prop], props);
        if (result !== true) {
          errors.push(typeof result === 'string' ? result : `Invalid value for prop '${prop}'`);
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  };
  
  const contextValue: ErrorPreventionContextType = {
    isEnabled,
    enableErrorPrevention,
    trackRender,
    recordRender,
    trackPropChanges,
    validateComponent,
    validateProps,
    errorComponents,
    warnComponents
  };
  
  return (
    <ErrorPreventionContext.Provider value={contextValue}>
      {children}
    </ErrorPreventionContext.Provider>
  );
};

// Custom hook for accessing the context
export const useErrorPrevention = () => {
  const context = useContext(ErrorPreventionContext);
  if (!context) {
    throw new Error('useErrorPrevention must be used within an ErrorPreventionProvider');
  }
  return context;
};
