
import React, { createContext, useContext, useState, useCallback } from 'react';
import { performanceMonitor } from '@/utils/performance/performanceMonitor';

export interface ErrorPreventionOptions {
  trackRenders?: boolean;
  validateProps?: boolean;
  trackPropChanges?: boolean;
  throttleInterval?: number;
}

export interface ComponentValidationResult {
  valid: boolean;
  issues: string[];
  componentName: string;
}

export interface ErrorPreventionContextType {
  isEnabled: boolean;
  enableErrorPrevention: (enable: boolean) => void;
  useErrorPrevention: (componentName: string, options?: ErrorPreventionOptions) => void;
  validateComponent: (componentName: string, props: any) => ComponentValidationResult;
  validateAllComponents: () => ComponentValidationResult[];
  trackRender: (componentName: string, renderTime: number) => void;
  registerComponent: (componentName: string, validationRules: any) => void;
  reportError: (error: Error, componentName: string) => void;
  errors: Error[];
  validationResults: ComponentValidationResult[];
}

const ErrorPreventionContext = createContext<ErrorPreventionContextType | undefined>(undefined);

export const ErrorPreventionProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [errors, setErrors] = useState<Error[]>([]);
  const [validationResults, setValidationResults] = useState<ComponentValidationResult[]>([]);
  const [components, setComponents] = useState<Map<string, any>>(new Map());
  
  const enableErrorPrevention = useCallback((enable: boolean) => {
    setIsEnabled(enable);
  }, []);
  
  const useErrorPrevention = useCallback((componentName: string, options?: ErrorPreventionOptions) => {
    if (!isEnabled) return;
    
    // Log component usage
    if (options?.trackRenders) {
      performanceMonitor.startTracking(componentName);
    }
  }, [isEnabled]);
  
  const validateComponent = useCallback((componentName: string, props: any): ComponentValidationResult => {
    if (!isEnabled) {
      return { valid: true, issues: [], componentName };
    }
    
    const validationRules = components.get(componentName);
    const issues: string[] = [];
    
    if (validationRules) {
      // Apply validation rules
      validationRules.requiredProps?.forEach((prop: string) => {
        if (props[prop] === undefined) {
          issues.push(`Missing required prop: ${prop}`);
        }
      });
      
      validationRules.propTypes?.forEach((rule: {prop: string, type: string}) => {
        if (props[rule.prop] !== undefined && typeof props[rule.prop] !== rule.type) {
          issues.push(`Prop ${rule.prop} should be of type ${rule.type}`);
        }
      });
    }
    
    const result = {
      valid: issues.length === 0,
      issues,
      componentName
    };
    
    setValidationResults(prev => {
      const index = prev.findIndex(r => r.componentName === componentName);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = result;
        return updated;
      }
      return [...prev, result];
    });
    
    return result;
  }, [isEnabled, components]);
  
  const validateAllComponents = useCallback((): ComponentValidationResult[] => {
    if (!isEnabled) {
      return [];
    }
    
    const results: ComponentValidationResult[] = [];
    
    components.forEach((validationRules, componentName) => {
      // Simplified validation - in reality we would need actual props
      const issues: string[] = [];
      
      validationRules.requiredProps?.forEach((prop: string) => {
        issues.push(`Please check required prop: ${prop}`);
      });
      
      results.push({
        valid: issues.length === 0,
        issues,
        componentName
      });
    });
    
    setValidationResults(results);
    return results;
  }, [isEnabled, components]);
  
  const trackRender = useCallback((componentName: string, renderTime: number) => {
    if (!isEnabled) return;
    
    performanceMonitor.reportRender(componentName, renderTime);
  }, [isEnabled]);
  
  const registerComponent = useCallback((componentName: string, validationRules: any) => {
    setComponents(prev => {
      const updated = new Map(prev);
      updated.set(componentName, validationRules);
      return updated;
    });
  }, []);
  
  const reportError = useCallback((error: Error, componentName: string) => {
    setErrors(prev => [...prev, error]);
    
    console.error(`Error in ${componentName}:`, error);
  }, []);
  
  const value = {
    isEnabled,
    enableErrorPrevention,
    useErrorPrevention,
    validateComponent,
    validateAllComponents,
    trackRender,
    registerComponent,
    reportError,
    errors,
    validationResults
  };
  
  return (
    <ErrorPreventionContext.Provider value={value}>
      {children}
    </ErrorPreventionContext.Provider>
  );
};

export const useErrorPrevention = () => {
  const context = useContext(ErrorPreventionContext);
  
  if (context === undefined) {
    throw new Error('useErrorPrevention must be used within an ErrorPreventionProvider');
  }
  
  return context;
};
