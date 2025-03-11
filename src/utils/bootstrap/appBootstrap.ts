
/**
 * Application Bootstrap
 * 
 * Handles application startup including configuration validation
 * and critical service initialization.
 */

import { validateAppConfig } from '@/utils/config/configValidator';
import { checkSupabaseConnection } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';

/**
 * Initialize application
 * Validates configuration and initializes critical services
 * 
 * @returns Promise resolving to true if initialization was successful
 */
export async function initializeApplication(): Promise<boolean> {
  console.log('Initializing application...');
  
  try {
    // Step 1: Validate configuration
    const configValid = validateAppConfig();
    if (!configValid) {
      console.error('Application configuration is invalid');
      return false;
    }
    
    // Step 2: Validate Supabase connection (if used)
    const supabaseConnected = await checkSupabaseConnection().catch(() => false);
    if (!supabaseConnected) {
      console.warn('Unable to connect to Supabase. Some features may not work.');
      
      toast({
        title: 'Connection Warning',
        description: 'Unable to connect to backend services. Some features may not work properly.',
        variant: 'warning',
      });
    }
    
    // Registration point for other critical services initialization
    
    console.log('Application initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize application:', error);
    
    toast({
      title: 'Initialization Failed',
      description: 'The application failed to initialize. Please refresh or contact support.',
      variant: 'destructive',
    });
    
    return false;
  }
}

/**
 * Bootstrap function to be called at application startup
 */
export function bootstrapApplication(): void {
  initializeApplication().then(success => {
    if (!success) {
      console.error('Application bootstrap failed');
    }
  });
}

export default bootstrapApplication;
