
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { EdgeFunctionResponse, EdgeFunctionErrorCode } from '@/types/edge-functions';

/**
 * Generic client for calling Supabase Edge Functions
 */
export async function callEdgeFunction<T = any, P = any>(
  functionName: string,
  payload?: P,
  options?: {
    handleError?: boolean;
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    successMessage?: string;
  }
): Promise<EdgeFunctionResponse<T>> {
  const {
    handleError = true,
    showSuccessToast = false,
    showErrorToast = true,
    successMessage,
  } = options || {};

  try {
    const { data, error } = await supabase.functions.invoke<EdgeFunctionResponse<T>>(
      functionName,
      {
        body: payload,
      }
    );

    if (error) {
      console.error(`Error calling edge function ${functionName}:`, error);
      
      if (showErrorToast) {
        toast({
          title: 'Error',
          description: error.message || `Failed to call ${functionName}`,
          variant: 'destructive',
        });
      }
      
      return {
        success: false,
        error: {
          code: EdgeFunctionErrorCode.EDGE_FUNCTION_ERROR,
          message: error.message,
          details: error,
        },
        timestamp: new Date().toISOString(),
      };
    }

    // Handle non-standard response format
    if (data && !('success' in data)) {
      // Convert to standard format
      const standardizedResponse: EdgeFunctionResponse<T> = {
        success: true,
        data: data as T,
        timestamp: new Date().toISOString(),
      };
      
      if (showSuccessToast && successMessage) {
        toast({
          title: 'Success',
          description: successMessage,
        });
      }
      
      return standardizedResponse;
    }

    // Handle properly formatted response
    if (data.success && showSuccessToast && successMessage) {
      toast({
        title: 'Success',
        description: successMessage,
      });
    } else if (!data.success && showErrorToast) {
      toast({
        title: 'Error',
        description: data.error?.message || `Error in ${functionName}`,
        variant: 'destructive',
      });
    }

    return data;
  } catch (error) {
    console.error(`Exception calling edge function ${functionName}:`, error);
    
    if (handleError && showErrorToast) {
      toast({
        title: 'Error',
        description: error.message || `Failed to call ${functionName}`,
        variant: 'destructive',
      });
    }
    
    return {
      success: false,
      error: {
        code: EdgeFunctionErrorCode.UNHANDLED_ERROR,
        message: error.message || 'An unexpected error occurred',
        details: error,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
