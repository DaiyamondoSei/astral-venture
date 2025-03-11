
/**
 * Application Bootstrap
 * 
 * Handles application startup including configuration validation
 * and critical service initialization.
 */

import { toast } from '@/components/ui/use-toast';
import { initializeConfiguration } from './configBootstrap';
import { checkSupabaseConnection } from '@/lib/supabaseClient';
import { performanceMonitor } from '@/utils/performance/performanceMonitor';

/**
 * Initialize application
 * Validates configuration and initializes critical services
 * 
 * @returns Promise resolving to true if initialization was successful
 */
export async function initializeApplication(): Promise<boolean> {
  console.log('Initializing application...');
  
  try {
    // Step 1: Initialize and validate configuration
    const configValid = await initializeConfiguration(false);
    if (!configValid) {
      console.error('Application bootstrap failed: Invalid configuration');
      
      toast({
        title: 'Initialization Failed',
        description: 'The application configuration is invalid. Please check the console for details.',
        variant: 'destructive',
      });
      
      return false;
    }
    
    // Step 2: Initialize performance monitoring
    if (performanceMonitor) {
      try {
        performanceMonitor.setEnabled(true);
      } catch (err) {
        console.warn('Failed to initialize performance monitoring:', err);
      }
    }
    
    // Step 3: Validate Supabase connection (if used) - non-blocking
    checkSupabaseConnection().then(connected => {
      if (!connected) {
        console.warn('Unable to connect to Supabase. Some features may not work.');
        
        toast({
          title: 'Connection Warning',
          description: 'Unable to connect to backend services. Some features may not work properly.',
          variant: 'warning',
        });
      } else {
        console.log('Successfully connected to Supabase services');
      }
    }).catch(() => {
      console.warn('Error checking Supabase connection');
    });
    
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
