
import React, { createContext, useContext, useState } from 'react';
import { performanceMonitor } from '@/utils/performance/performanceMonitor';

interface ErrorPreventionContextType {
  validateComponent: (componentName: string, props: Record<string, any>) => void;
  trackPropChanges: (componentName: string, prevProps: Record<string, any>, nextProps: Record<string, any>) => void;
  recordRender: (componentName: string, renderTime: number) => void;
  getValidationReport: () => ValidationReport;
  
  // Additional properties needed by ValidationDashboard
  isEnabled: boolean;
  enableErrorPrevention: (enabled: boolean) => void;
  errorComponents: Record<string, any>[];
  warnComponents: Record<string, any>[];
  validateAllComponents: () => void;
}

interface ValidationReport {
  components: Record<string, ComponentValidation>;
  totalErrors: number;
  totalWarnings: number;
}

interface ComponentValidation {
  componentName: string;
  propErrors: PropValidationError[];
  propWarnings: PropValidationWarning[];
}

interface PropValidationError {
  propName: string;
  message: string;
  value: any;
}

interface PropValidationWarning {
  propName: string;
  message: string;
  value: any;
}

const ErrorPreventionContext = createContext<ErrorPreventionContextType | undefined>(undefined);

export const ErrorPreventionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [validationReport, setValidationReport] = useState<ValidationReport>({
    components: {},
    totalErrors: 0,
    totalWarnings: 0,
  });
  const [isEnabled, setIsEnabled] = useState(false);
  const [errorComponents, setErrorComponents] = useState<Record<string, any>[]>([]);
  const [warnComponents, setWarnComponents] = useState<Record<string, any>[]>([]);

  const validateComponent = (componentName: string, props: Record<string, any>) => {
    // Component validation logic would go here
    // For now, just logging the validation request
    console.debug(`Validating component ${componentName}`);
  };

  const trackPropChanges = (componentName: string, prevProps: Record<string, any>, nextProps: Record<string, any>) => {
    // Track prop changes between renders
    // For now, just passing through to performance monitor
    performanceMonitor.recordRender(componentName, 0);
  };

  const recordRender = (componentName: string, renderTime: number) => {
    // Record component render time
    performanceMonitor.recordRender(componentName, renderTime);
  };

  const getValidationReport = (): ValidationReport => {
    return validationReport;
  };
  
  const enableErrorPrevention = (enabled: boolean) => {
    setIsEnabled(enabled);
  };
  
  const validateAllComponents = () => {
    // Implementation of validateAllComponents
    console.debug('Validating all components');
  };

  const contextValue: ErrorPreventionContextType = {
    validateComponent,
    trackPropChanges,
    recordRender,
    getValidationReport,
    isEnabled,
    enableErrorPrevention,
    errorComponents,
    warnComponents,
    validateAllComponents
  };

  return (
    <ErrorPreventionContext.Provider value={contextValue}>
      {children}
    </ErrorPreventionContext.Provider>
  );
};

export const useErrorPrevention = () => {
  const context = useContext(ErrorPreventionContext);
  if (!context) {
    throw new Error('useErrorPrevention must be used within an ErrorPreventionProvider');
  }
  return context;
};
