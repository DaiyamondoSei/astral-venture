
import { useEffect, useRef, useState } from 'react';
import { getComponentDocs, validateProps, PropValidationError } from '@/utils/componentDoc';
import { z } from 'zod';
import { toast } from '@/components/ui/use-toast';
import { devLogger } from '@/utils/debugUtils';
import { startFlow, trackPoint, endFlow } from '@/utils/dataFlowTracker';

/**
 * Enhanced hook for validating component props at runtime with strict validation
 * 
 * @param componentName Name of the component
 * @param props The component props to validate
 * @param options Additional validation options
 */
export function useComponentValidation(
  componentName: string, 
  props: Record<string, any>,
  options: {
    strict?: boolean; // If true, will throw errors instead of just logging warnings
    showToasts?: boolean; // If true, will show toast notifications for validation issues
    realTime?: boolean; // If true, will continuously validate on prop changes
    autoFix?: boolean; // If true, will attempt to auto-fix simple issues
  } = {}
): { isValid: boolean; errors: string[] } {
  const [validationState, setValidationState] = useState<{ isValid: boolean; errors: string[] }>({
    isValid: true,
    errors: []
  });
  
  // Skip in production for performance
  if (process.env.NODE_ENV !== 'development') {
    return validationState;
  }
  
  const { 
    strict = false, 
    showToasts = true, 
    realTime = true,
    autoFix = false
  } = options;
  
  const propsRef = useRef(props);
  const flowIdRef = useRef(`validation-${componentName}-${Date.now()}`);
  
  useEffect(() => {
    // Start a data flow tracking for this validation process
    if (realTime) {
      startFlow(flowIdRef.current, `Validating ${componentName} props`);
      trackPoint(flowIdRef.current, componentName, "validation-started", { props });
    }
    
    const errors: string[] = [];
    
    try {
      // Check if component is documented
      const componentDocs = getComponentDocs(componentName);
      if (!componentDocs) {
        const message = `Component '${componentName}' is not documented. Consider adding documentation.`;
        errors.push(message);
        devLogger.warn('ComponentValidation', message);
        
        if (showToasts) {
          toast({
            title: "Documentation Missing",
            description: message,
            variant: "destructive"
          });
        }
        
        if (strict) {
          throw new Error(message);
        }
      } else {
        // Validate props
        try {
          validateProps(componentName, props);
        } catch (error) {
          if (error instanceof PropValidationError) {
            const errorMsg = `Validation error in ${componentName}: ${error.message}`;
            errors.push(error.message);
            devLogger.error('ComponentValidation', errorMsg);
            
            if (showToasts) {
              toast({
                title: "Prop Validation Error",
                description: error.message,
                variant: "destructive"
              });
            }
            
            if (autoFix) {
              // Log what would be auto-fixed
              devLogger.info('ComponentValidation', `Auto-fix would attempt to correct: ${error.message}`);
              // In a real implementation, this would attempt to fix the props or provide suggestions
            }
            
            if (strict) {
              throw error;
            }
          } else {
            throw error;
          }
        }
      }
      
      // Store current props for comparison
      propsRef.current = props;
      
      // If we got here with no errors thrown, validation passed
      if (errors.length === 0) {
        setValidationState({ isValid: true, errors: [] });
        if (realTime) {
          trackPoint(flowIdRef.current, componentName, "validation-passed", { props });
        }
      } else {
        setValidationState({ isValid: false, errors });
        if (realTime) {
          trackPoint(flowIdRef.current, componentName, "validation-failed", { errors, props });
        }
      }
    } catch (error) {
      if (strict) {
        // In strict mode, we let the error propagate to the error boundary
        if (realTime) {
          trackPoint(flowIdRef.current, componentName, "validation-error", { error, props });
          endFlow(flowIdRef.current);
        }
        throw error;
      } else {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errors.push(errorMsg);
        devLogger.error(`Error validating ${componentName}:`, error);
        setValidationState({ isValid: false, errors });
        
        if (realTime) {
          trackPoint(flowIdRef.current, componentName, "validation-error-handled", { error, props });
        }
      }
    }
    
    if (realTime) {
      endFlow(flowIdRef.current);
    }
    
    return () => {
      // Clean up
      if (realTime) {
        endFlow(flowIdRef.current);
      }
    };
  }, [componentName, props, strict, showToasts, realTime, autoFix]);
  
  return validationState;
}

/**
 * Enhanced version of useComponentValidation for components that take
 * a specific interface as props. This helps ensure type safety at runtime.
 * 
 * @param componentName Name of the component
 * @param props The component props to validate
 * @param schema Optional Zod schema for additional validation
 * @param options Additional validation options
 */
export function useTypedComponentValidation<T extends Record<string, any>>(
  componentName: string,
  props: T,
  schema?: z.ZodType<T>,
  options: {
    strict?: boolean;
    showToasts?: boolean;
    realTime?: boolean;
    autoFix?: boolean;
  } = {}
): { isValid: boolean; errors: string[] } {
  const { 
    strict = false, 
    showToasts = true,
    realTime = true,
    autoFix = false
  } = options;
  
  const [validationState, setValidationState] = useState<{ isValid: boolean; errors: string[] }>({
    isValid: true,
    errors: []
  });
  
  // Skip in production for performance
  if (process.env.NODE_ENV !== 'development') {
    return validationState;
  }
  
  // First use the regular component validation
  const basicValidation = useComponentValidation(componentName, props as Record<string, any>, options);
  
  // Then do additional Zod schema validation if provided
  useEffect(() => {
    if (!schema) return;
    
    const errors = [...basicValidation.errors];
    
    try {
      const validationResult = schema.safeParse(props);
      
      if (!validationResult.success) {
        const zodErrors = validationResult.error.format();
        const errorMessage = `Zod validation failed for ${componentName}: ${JSON.stringify(zodErrors)}`;
        
        errors.push(errorMessage);
        devLogger.error('ZodValidation', errorMessage);
        
        if (showToasts) {
          toast({
            title: "Schema Validation Error",
            description: `${componentName} props failed validation`,
            variant: "destructive"
          });
        }
        
        if (autoFix) {
          // Log what would be auto-fixed
          devLogger.info('ZodValidation', `Auto-fix would attempt to correct Zod validation issues`);
          // In a real implementation, this would attempt to fix the props based on the schema
        }
        
        if (strict) {
          throw new Error(errorMessage);
        }
      }
    } catch (error) {
      if (strict) {
        throw error;
      } else {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errors.push(errorMsg);
        devLogger.error(`Error in Zod validation for ${componentName}:`, error);
      }
    } finally {
      setValidationState({ 
        isValid: errors.length === 0, 
        errors 
      });
    }
  }, [componentName, props, schema, strict, showToasts, basicValidation.errors, autoFix]);
  
  return validationState;
}

/**
 * Hook that provides continuous monitoring of data flow and prop types
 * throughout a component tree. This is a more comprehensive validation
 * solution that can provide real-time feedback.
 * 
 * @param options Configuration options for the monitor
 */
export function useRealTimeMonitor(options: {
  componentName: string;
  enableDataFlowTracking?: boolean;
  enablePropValidation?: boolean;
  enablePerformanceTracking?: boolean;
  onIssueDetected?: (issue: { type: string; message: string; severity: 'info' | 'warning' | 'error' }) => void;
}): { stop: () => void; isMonitoring: boolean } {
  const { 
    componentName,
    enableDataFlowTracking = true,
    enablePropValidation = true,
    enablePerformanceTracking = true,
    onIssueDetected
  } = options;
  
  const [isMonitoring, setIsMonitoring] = useState(true);
  
  // Skip in production for performance
  if (process.env.NODE_ENV !== 'development') {
    return { stop: () => {}, isMonitoring: false };
  }
  
  useEffect(() => {
    devLogger.info('RealTimeMonitor', `Started monitoring ${componentName}`);
    
    if (enableDataFlowTracking) {
      startFlow(`monitor-${componentName}`, `Real-time monitoring of ${componentName}`);
    }
    
    return () => {
      if (enableDataFlowTracking) {
        endFlow(`monitor-${componentName}`);
      }
      devLogger.info('RealTimeMonitor', `Stopped monitoring ${componentName}`);
    };
  }, [componentName, enableDataFlowTracking]);
  
  const stop = () => {
    setIsMonitoring(false);
    if (enableDataFlowTracking) {
      endFlow(`monitor-${componentName}`);
    }
    devLogger.info('RealTimeMonitor', `Manually stopped monitoring ${componentName}`);
  };
  
  return { stop, isMonitoring };
}
