
import React, { createContext, useContext, useEffect, useState } from 'react';
import { startGlobalComponentMonitoring, validateAllMonitoredComponents } from '@/utils/componentDoc';
import { renderCostAnalyzer } from '@/utils/error-prevention/RenderCostAnalyzer';
import { performanceMonitor } from '@/utils/performance/performanceMonitor';

interface ErrorPreventionContextType {
  isEnabled: boolean;
  enableErrorPrevention: () => void;
  disableErrorPrevention: () => void;
  validateAllComponents: () => { valid: boolean; errors: string[] };
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

export const useErrorPrevention = () => useContext(ErrorPreventionContext);

export const ErrorPreventionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState(process.env.NODE_ENV === 'development');
  
  useEffect(() => {
    if (isEnabled) {
      console.log('Error prevention system enabled');
      startGlobalComponentMonitoring();
      
      // Set up interval to check for issues
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
      }, 10000); // Check every 10 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [isEnabled]);
  
  const enableErrorPrevention = () => setIsEnabled(true);
  const disableErrorPrevention = () => setIsEnabled(false);
  
  const validateAllComponents = () => {
    return validateAllMonitoredComponents() || { valid: true, errors: [] };
  };
  
  const getHighImpactComponents = () => {
    return renderCostAnalyzer.getHighImpactComponents();
  };
  
  const getSlowComponents = () => {
    return renderCostAnalyzer.getComponentsWithSlowRenders();
  };
  
  const resetMetrics = () => {
    renderCostAnalyzer.reset();
    performanceMonitor.clearMetrics();
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
