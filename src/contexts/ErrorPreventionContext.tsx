
import React, { createContext, useContext, useEffect, useState } from 'react';
import { startGlobalComponentMonitoring, validateAllMonitoredComponents } from '@/utils/componentDoc';
import { renderCostAnalyzer } from '@/utils/error-prevention/RenderCostAnalyzer';
import { performanceMonitor } from '@/utils/performance/performanceMonitor';

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

interface ErrorPreventionContextType {
  isEnabled: boolean;
  enableErrorPrevention: () => void;
  disableErrorPrevention: () => void;
  validateAllComponents: () => ValidationResult;
  getHighImpactComponents: () => any[];
  getSlowComponents: () => any[];
  resetMetrics: () => void;
}

const ErrorPreventionContext = createContext<ErrorPreventionContextType>({
  isEnabled: false,
  enableErrorPrevention: () => {},
  disableErrorPrevention: () => {},
  validateAllComponents: () => ({ valid: true, errors: [] }),
  getHighImpactComponents: () => [],
  getSlowComponents: () => [],
  resetMetrics: () => {}
});

export const useErrorPreventionContext = () => useContext(ErrorPreventionContext);

export const ErrorPreventionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Only enabled in development by default, always disabled in production
  const [isEnabled, setIsEnabled] = useState(process.env.NODE_ENV === 'development');
  
  useEffect(() => {
    if (isEnabled && process.env.NODE_ENV === 'development') {
      console.log('Error prevention system enabled');
      startGlobalComponentMonitoring();
      
      // Enable the analyzers
      renderCostAnalyzer.setEnabled(true);
      
      // Set up interval to check for issues, but less frequently (every 30 seconds)
      const intervalId = setInterval(() => {
        const highImpactComponents = renderCostAnalyzer.getHighImpactComponents();
        
        if (highImpactComponents.length > 0) {
          const criticalComponents = highImpactComponents.filter(
            comp => comp.suggestions.some(s => s.priority === 'critical')
          );
          
          if (criticalComponents.length > 0) {
            console.warn(
              'Critical performance issues detected in components:',
              criticalComponents.map(c => c.component).join(', ')
            );
          }
        }
      }, 30000); // Check every 30 seconds instead of 10
      
      return () => {
        clearInterval(intervalId);
        renderCostAnalyzer.setEnabled(false);
      };
    } else {
      // Make sure analyzers are disabled
      renderCostAnalyzer.setEnabled(false);
    }
  }, [isEnabled]);
  
  // These functions should do nothing in production
  const enableErrorPrevention = () => {
    if (process.env.NODE_ENV === 'development') {
      setIsEnabled(true);
    }
  };
  
  const disableErrorPrevention = () => {
    setIsEnabled(false);
    renderCostAnalyzer.setEnabled(false);
  };
  
  const validateAllComponents = (): ValidationResult => {
    if (process.env.NODE_ENV === 'development') {
      const result = validateAllMonitoredComponents();
      return result ? result : { valid: true, errors: [] };
    }
    return { valid: true, errors: [] };
  };
  
  const getHighImpactComponents = () => {
    return process.env.NODE_ENV === 'development' 
      ? renderCostAnalyzer.getHighImpactComponents()
      : [];
  };
  
  const getSlowComponents = () => {
    return process.env.NODE_ENV === 'development' 
      ? renderCostAnalyzer.getComponentsWithSlowRenders()
      : [];
  };
  
  const resetMetrics = () => {
    if (process.env.NODE_ENV === 'development') {
      renderCostAnalyzer.reset();
      performanceMonitor.clearMetrics();
    }
  };
  
  return (
    <ErrorPreventionContext.Provider
      value={{
        isEnabled,
        enableErrorPrevention,
        disableErrorPrevention,
        validateAllComponents,
        getHighImpactComponents,
        getSlowComponents,
        resetMetrics
      }}
    >
      {children}
    </ErrorPreventionContext.Provider>
  );
};

// Export the context hook with a name distinct from the hook in useErrorPrevention.ts
export { useErrorPreventionContext as useErrorPrevention };
