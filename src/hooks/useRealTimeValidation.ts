
import { useEffect, useRef, useState } from 'react';
import { monitorComponent, validateProps } from '@/utils/componentDoc';
import { useErrorPrevention } from '@/contexts/ErrorPreventionContext';
import { devLogger } from '@/utils/debugUtils';
import { z } from 'zod';

interface ValidationOptions {
  strict?: boolean;
  showToasts?: boolean;
  autoFix?: boolean;
  interval?: number;
  onValidationError?: (error: Error) => void;
  schema?: z.ZodType<any>;
}

/**
 * Hook for real-time validation of component props
 * This hook will continuously monitor a component's props and report any validation issues
 * 
 * @param componentName Name of the component being validated
 * @param props Current props of the component
 * @param options Validation options
 */
export function useRealTimeValidation(
  componentName: string,
  props: Record<string, any>,
  options: ValidationOptions = {}
): {
  isValid: boolean;
  errors: string[];
  lastValidated: number | null;
  validateNow: () => boolean;
} {
  // Get global settings from context
  const { 
    isStrictMode, 
    isAutoFixEnabled,
    validationInterval,
    isMonitoring: globalMonitoringEnabled
  } = useErrorPrevention();
  
  // Local state
  const [validationState, setValidationState] = useState<{
    isValid: boolean;
    errors: string[];
    lastValidated: number | null;
  }>({
    isValid: true,
    errors: [],
    lastValidated: null
  });
  
  // Skip in production
  if (process.env.NODE_ENV !== 'development') {
    return {
      ...validationState,
      validateNow: () => true
    };
  }
  
  const {
    strict = isStrictMode,
    showToasts = true,
    autoFix = isAutoFixEnabled,
    interval = validationInterval,
    onValidationError,
    schema
  } = options;
  
  const propsRef = useRef(props);
  propsRef.current = props;
  
  // Set up continuous validation
  useEffect(() => {
    if (!globalMonitoringEnabled) return;
    
    const stopMonitoring = monitorComponent(
      componentName,
      () => propsRef.current,
      {
        intervalMs: interval,
        onValidationError: (error) => {
          setValidationState({
            isValid: false,
            errors: [error.message],
            lastValidated: Date.now()
          });
          
          if (onValidationError) {
            onValidationError(error);
          }
        },
        autoFix
      }
    );
    
    devLogger.info('RealTimeValidation', `Started real-time validation for ${componentName}`);
    
    // Initial validation
    validateNow();
    
    return () => {
      stopMonitoring();
      devLogger.info('RealTimeValidation', `Stopped real-time validation for ${componentName}`);
    };
  }, [componentName, globalMonitoringEnabled, interval, strict, autoFix]);
  
  // Validate schema if provided
  useEffect(() => {
    if (!schema || !globalMonitoringEnabled) return;
    
    const validateSchema = () => {
      try {
        const result = schema.safeParse(props);
        if (!result.success) {
          const errors = result.error.format();
          setValidationState(prev => ({
            ...prev,
            isValid: false,
            errors: [...prev.errors, `Schema validation failed: ${JSON.stringify(errors)}`],
            lastValidated: Date.now()
          }));
        }
      } catch (error) {
        devLogger.error('SchemaValidation', `Error validating schema for ${componentName}:`, error);
      }
    };
    
    validateSchema();
    
    const intervalId = setInterval(validateSchema, interval);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [schema, props, componentName, globalMonitoringEnabled, interval]);
  
  // Immediate validation function
  const validateNow = () => {
    try {
      validateProps(componentName, props, false);
      
      // Also validate schema if provided
      let schemaValid = true;
      if (schema) {
        const result = schema.safeParse(props);
        schemaValid = result.success;
      }
      
      setValidationState({
        isValid: schemaValid,
        errors: [],
        lastValidated: Date.now()
      });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
      
      setValidationState({
        isValid: false,
        errors: [errorMessage],
        lastValidated: Date.now()
      });
      
      if (onValidationError && error instanceof Error) {
        onValidationError(error);
      }
      
      return false;
    }
  };
  
  return {
    ...validationState,
    validateNow
  };
}
