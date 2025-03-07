
import { useEffect, useRef } from 'react';
import { getComponentDocs, validateProps, PropValidationError } from '@/utils/componentDoc';
import { z } from 'zod';
import { toast } from '@/components/ui/use-toast';

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
  } = {}
): void {
  // Skip in production for performance
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  
  const { strict = false, showToasts = true } = options;
  const propsRef = useRef(props);
  
  useEffect(() => {
    try {
      // Check if component is documented
      const componentDocs = getComponentDocs(componentName);
      if (!componentDocs) {
        const message = `Component '${componentName}' is not documented. Consider adding documentation.`;
        console.warn(message);
        
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
        
        return;
      }
      
      // Validate props
      try {
        validateProps(componentName, props);
      } catch (error) {
        if (error instanceof PropValidationError) {
          console.error(`Validation error in ${componentName}:`, error.message);
          
          if (showToasts) {
            toast({
              title: "Prop Validation Error",
              description: error.message,
              variant: "destructive"
            });
          }
          
          if (strict) {
            throw error;
          }
        } else {
          throw error;
        }
      }
      
      // Store current props for comparison
      propsRef.current = props;
    } catch (error) {
      if (strict) {
        // In strict mode, we let the error propagate to the error boundary
        throw error;
      } else {
        console.error(`Error validating ${componentName}:`, error);
      }
    }
  }, [componentName, props, strict, showToasts]);
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
  } = {}
): void {
  const { strict = false, showToasts = true } = options;
  
  // First use the regular component validation
  useComponentValidation(componentName, props as Record<string, any>, options);
  
  // Then do additional Zod schema validation if provided
  useEffect(() => {
    if (!schema || process.env.NODE_ENV !== 'development') return;
    
    try {
      const validationResult = schema.safeParse(props);
      
      if (!validationResult.success) {
        const errors = validationResult.error.format();
        const errorMessage = `Zod validation failed for ${componentName}: ${JSON.stringify(errors)}`;
        
        console.error(errorMessage);
        
        if (showToasts) {
          toast({
            title: "Schema Validation Error",
            description: `${componentName} props failed validation`,
            variant: "destructive"
          });
        }
        
        if (strict) {
          throw new Error(errorMessage);
        }
      }
    } catch (error) {
      if (strict) {
        throw error;
      } else {
        console.error(`Error in Zod validation for ${componentName}:`, error);
      }
    }
  }, [componentName, props, schema, strict, showToasts]);
}
