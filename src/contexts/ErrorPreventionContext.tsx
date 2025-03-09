
import React, { createContext, useContext, useState, useEffect } from 'react';
import { performanceMonitor } from '@/utils/performance/performanceMonitor';

// Types for error prevention
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

export interface ErrorPreventionContextType {
  validateComponent: (componentName: string, props: Record<string, any>) => ValidationResult;
  recordRender: (componentName: string, renderTime: number) => void;
  registerValidationRules: (componentName: string, rules: ValidationRule[]) => void;
  trackPropChanges: (componentName: string, prevProps: Record<string, any>, newProps: Record<string, any>) => void;
  getComponentErrors: (componentName: string) => string[];
  getCurrentValidationStatus: () => Record<string, ValidationResult>;
  clearValidationErrors: (componentName: string) => void;
}

export interface ValidationRule {
  prop: string;
  validate: (value: any) => boolean;
  message: string;
}

// Create context with default values
export const ErrorPreventionContext = createContext<ErrorPreventionContextType>({
  validateComponent: () => ({ valid: true, errors: [] }),
  recordRender: () => {},
  registerValidationRules: () => {},
  trackPropChanges: () => {},
  getComponentErrors: () => [],
  getCurrentValidationStatus: () => ({}),
  clearValidationErrors: () => {}
});

// Provider component
export const ErrorPreventionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [validationRules, setValidationRules] = useState<Record<string, ValidationRule[]>>({});
  const [validationStatus, setValidationStatus] = useState<Record<string, ValidationResult>>({});

  // Register validation rules for a component
  const registerValidationRules = (componentName: string, rules: ValidationRule[]) => {
    setValidationRules(prev => ({
      ...prev,
      [componentName]: rules
    }));
  };

  // Validate component props against registered rules
  const validateComponent = (componentName: string, props: Record<string, any>): ValidationResult => {
    const rules = validationRules[componentName] || [];
    const errors: string[] = [];
    
    rules.forEach(rule => {
      if (props.hasOwnProperty(rule.prop) && !rule.validate(props[rule.prop])) {
        errors.push(rule.message);
      }
    });
    
    const result = { valid: errors.length === 0, errors };
    
    // Update validation status
    setValidationStatus(prev => ({
      ...prev,
      [componentName]: result
    }));
    
    return result;
  };

  // Record component render time using performance monitor
  const recordRender = (componentName: string, renderTime: number) => {
    performanceMonitor.recordRender(componentName, renderTime);
  };

  // Track prop changes between renders
  const trackPropChanges = (componentName: string, prevProps: Record<string, any>, newProps: Record<string, any>) => {
    const changes: Record<string, { from: any, to: any }> = {};
    let hasChanges = false;
    
    // Find changed props
    Object.keys(newProps).forEach(key => {
      if (prevProps[key] !== newProps[key]) {
        changes[key] = { from: prevProps[key], to: newProps[key] };
        hasChanges = true;
      }
    });
    
    // Log changes in development mode
    if (hasChanges && process.env.NODE_ENV === 'development') {
      console.debug(`[${componentName}] Props changed:`, changes);
    }
  };

  // Get component validation errors
  const getComponentErrors = (componentName: string): string[] => {
    const status = validationStatus[componentName];
    return status && status.errors ? status.errors : [];
  };

  // Get current validation status for all components
  const getCurrentValidationStatus = (): Record<string, ValidationResult> => {
    return validationStatus;
  };

  // Clear validation errors for a component
  const clearValidationErrors = (componentName: string) => {
    setValidationStatus(prev => {
      const newStatus = { ...prev };
      delete newStatus[componentName];
      return newStatus;
    });
  };

  return (
    <ErrorPreventionContext.Provider
      value={{
        validateComponent,
        recordRender,
        registerValidationRules,
        trackPropChanges,
        getComponentErrors,
        getCurrentValidationStatus,
        clearValidationErrors
      }}
    >
      {children}
    </ErrorPreventionContext.Provider>
  );
};

// Hook to use error prevention context
export const useErrorPrevention = () => useContext(ErrorPreventionContext);
