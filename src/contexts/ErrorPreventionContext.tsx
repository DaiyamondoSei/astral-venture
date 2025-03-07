
import React, { createContext, useContext, useEffect, useState } from 'react';
import { startGlobalComponentMonitoring, validateAllMonitoredComponents } from '@/utils/componentDoc';
import { toast } from '@/components/ui/use-toast';
import { devLogger } from '@/utils/debugUtils';
import { captureException } from '@/utils/errorHandling';

interface ErrorPreventionContextType {
  enableStrictMode: () => void;
  disableStrictMode: () => void;
  enableAutoFix: () => void;
  disableAutoFix: () => void;
  runValidation: () => { valid: string[]; invalid: { component: string; errors: string[] }[] };
  isMonitoring: boolean;
  isStrictMode: boolean;
  isAutoFixEnabled: boolean;
  validationInterval: number;
  setValidationInterval: (interval: number) => void;
  pauseMonitoring: () => void;
  resumeMonitoring: () => void;
  lastValidationResult: {
    timestamp: number;
    valid: string[];
    invalid: { component: string; errors: string[] }[];
  } | null;
}

const ErrorPreventionContext = createContext<ErrorPreventionContextType | undefined>(undefined);

interface ErrorPreventionProviderProps {
  children: React.ReactNode;
  initialStrictMode?: boolean;
  initialAutoFix?: boolean;
  initialInterval?: number;
  showToasts?: boolean;
}

export const ErrorPreventionProvider: React.FC<ErrorPreventionProviderProps> = ({
  children,
  initialStrictMode = false,
  initialAutoFix = false,
  initialInterval = 5000,
  showToasts = true
}) => {
  const [isStrictMode, setIsStrictMode] = useState(initialStrictMode);
  const [isAutoFixEnabled, setIsAutoFixEnabled] = useState(initialAutoFix);
  const [validationInterval, setValidationInterval] = useState(initialInterval);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [lastValidationResult, setLastValidationResult] = useState<{
    timestamp: number;
    valid: string[];
    invalid: { component: string; errors: string[] }[];
  } | null>(null);
  
  // Skip in production
  if (process.env.NODE_ENV !== 'development') {
    const noopContext: ErrorPreventionContextType = {
      enableStrictMode: () => {},
      disableStrictMode: () => {},
      enableAutoFix: () => {},
      disableAutoFix: () => {},
      runValidation: () => ({ valid: [], invalid: [] }),
      isMonitoring: false,
      isStrictMode: false,
      isAutoFixEnabled: false,
      validationInterval: 0,
      setValidationInterval: () => {},
      pauseMonitoring: () => {},
      resumeMonitoring: () => {},
      lastValidationResult: null
    };
    
    return (
      <ErrorPreventionContext.Provider value={noopContext}>
        {children}
      </ErrorPreventionContext.Provider>
    );
  }
  
  // Initialize global monitoring
  useEffect(() => {
    if (!isMonitoring) return;
    
    const stopMonitoring = startGlobalComponentMonitoring({
      intervalMs: validationInterval,
      onIssueDetected: (issues) => {
        const now = Date.now();
        
        setLastValidationResult({
          timestamp: now,
          valid: [],
          invalid: issues
        });
        
        if (showToasts) {
          // Only show toast for the first few issues to avoid flooding
          const issueCount = issues.length;
          const firstIssue = issues[0];
          
          toast({
            title: `${issueCount} component${issueCount > 1 ? 's' : ''} failed validation`,
            description: firstIssue ? 
              `${firstIssue.component}: ${firstIssue.errors[0]}${issueCount > 1 ? ' (and more...)' : ''}` : 
              'Check console for details',
            variant: "destructive"
          });
        }
        
        // Log all issues to console
        devLogger.group('Component Validation Issues');
        issues.forEach(issue => {
          devLogger.warn(
            'Validation', 
            `Component ${issue.component} has ${issue.errors.length} error(s):`
          );
          issue.errors.forEach(err => devLogger.warn('Validation', `  - ${err}`));
        });
        devLogger.groupEnd();
        
        // In strict mode, these would be treated as actual errors
        if (isStrictMode) {
          captureException(
            new Error(`${issues.length} components failed validation`),
            'ComponentValidation'
          );
        }
      },
      autoFix: isAutoFixEnabled
    });
    
    return () => {
      stopMonitoring();
    };
  }, [isMonitoring, validationInterval, showToasts, isStrictMode, isAutoFixEnabled]);
  
  const runValidation = () => {
    const result = validateAllMonitoredComponents();
    
    setLastValidationResult({
      timestamp: Date.now(),
      valid: result.valid,
      invalid: result.invalid
    });
    
    return result;
  };
  
  const contextValue: ErrorPreventionContextType = {
    enableStrictMode: () => setIsStrictMode(true),
    disableStrictMode: () => setIsStrictMode(false),
    enableAutoFix: () => setIsAutoFixEnabled(true),
    disableAutoFix: () => setIsAutoFixEnabled(false),
    runValidation,
    isMonitoring,
    isStrictMode,
    isAutoFixEnabled,
    validationInterval,
    setValidationInterval,
    pauseMonitoring: () => setIsMonitoring(false),
    resumeMonitoring: () => setIsMonitoring(true),
    lastValidationResult
  };
  
  return (
    <ErrorPreventionContext.Provider value={contextValue}>
      {children}
    </ErrorPreventionContext.Provider>
  );
};

/**
 * Hook to access the error prevention system
 */
export const useErrorPrevention = (): ErrorPreventionContextType => {
  const context = useContext(ErrorPreventionContext);
  
  if (context === undefined) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'useErrorPrevention hook was called outside of ErrorPreventionProvider. ' +
        'Wrap your app with ErrorPreventionProvider to enable real-time validation.'
      );
    }
    
    // Return a no-op implementation for safety
    return {
      enableStrictMode: () => {},
      disableStrictMode: () => {},
      enableAutoFix: () => {},
      disableAutoFix: () => {},
      runValidation: () => ({ valid: [], invalid: [] }),
      isMonitoring: false,
      isStrictMode: false,
      isAutoFixEnabled: false,
      validationInterval: 0,
      setValidationInterval: () => {},
      pauseMonitoring: () => {},
      resumeMonitoring: () => {},
      lastValidationResult: null
    };
  }
  
  return context;
};

/**
 * Component that displays current validation status in a development overlay
 */
export const ValidationStatusIndicator: React.FC = () => {
  const {
    isMonitoring,
    isStrictMode,
    isAutoFixEnabled,
    lastValidationResult,
    runValidation,
    pauseMonitoring,
    resumeMonitoring
  } = useErrorPrevention();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  const invalid = lastValidationResult?.invalid.length || 0;
  const valid = lastValidationResult?.valid.length || 0;
  const total = invalid + valid;
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg shadow-lg z-50 text-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold">Validation Status</span>
        <button
          onClick={isMonitoring ? pauseMonitoring : resumeMonitoring}
          className={`px-2 py-1 rounded ${isMonitoring ? 'bg-green-600' : 'bg-red-600'}`}
        >
          {isMonitoring ? 'Active' : 'Paused'}
        </button>
      </div>
      
      <div className="space-y-1 mb-2">
        <div className="flex justify-between">
          <span>Components:</span>
          <span>
            {valid}/{total} valid
            {invalid > 0 && <span className="text-red-400 ml-1">({invalid} invalid)</span>}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Mode:</span>
          <span className={isStrictMode ? 'text-red-400' : 'text-green-400'}>
            {isStrictMode ? 'Strict' : 'Relaxed'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Auto-fix:</span>
          <span className={isAutoFixEnabled ? 'text-green-400' : 'text-gray-400'}>
            {isAutoFixEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>
      
      <button
        onClick={() => runValidation()}
        className="w-full bg-blue-600 hover:bg-blue-700 py-1 rounded text-center"
      >
        Run Validation Now
      </button>
    </div>
  );
};
