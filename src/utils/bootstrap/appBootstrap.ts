
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
import { ValidationError } from '@/utils/validation/ValidationError';

/**
 * Application initialization states
 */
export enum InitializationState {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  SUCCESS = 'success',
  FAILED = 'failed'
}

/**
 * Application initialization result 
 */
export interface InitializationResult {
  success: boolean;
  state: InitializationState;
  error?: Error;
  warnings: string[];
  timestamp: number;
  initializationTimeMs?: number;
}

// Store the initialization state
let initializationState: InitializationState = InitializationState.PENDING;
let initializationResult: InitializationResult | null = null;

/**
 * Initialize application
 * Validates configuration and initializes critical services
 * 
 * @returns Promise resolving to initialization result
 */
export async function initializeApplication(): Promise<InitializationResult> {
  // Prevent multiple initializations
  if (initializationState === InitializationState.IN_PROGRESS) {
    console.warn('Application initialization already in progress');
    return {
      success: false,
      state: InitializationState.IN_PROGRESS,
      warnings: ['Initialization already in progress'],
      timestamp: Date.now()
    };
  }
  
  // Return cached result if already initialized
  if (initializationState === InitializationState.SUCCESS || 
      initializationState === InitializationState.FAILED) {
    return initializationResult!;
  }
  
  console.log('Initializing application...');
  initializationState = InitializationState.IN_PROGRESS;
  
  const startTime = performance.now();
  const warnings: string[] = [];
  
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
      
      initializationState = InitializationState.FAILED;
      initializationResult = {
        success: false,
        state: InitializationState.FAILED,
        error: new ValidationError(
          'Application configuration is invalid',
          [{ path: 'config', message: 'Configuration validation failed' }],
          'CONFIG_VALIDATION_ERROR',
          500
        ),
        warnings,
        timestamp: Date.now(),
        initializationTimeMs: performance.now() - startTime
      };
      
      return initializationResult;
    }
    
    // Step 2: Initialize performance monitoring
    if (performanceMonitor) {
      try {
        performanceMonitor.setEnabled(true);
        performanceMonitor.startMonitoring();
      } catch (err) {
        console.warn('Failed to initialize performance monitoring:', err);
        warnings.push('Performance monitoring initialization failed');
      }
    }
    
    // Step 3: Validate Supabase connection (if used) - non-blocking
    checkSupabaseConnection().then(connected => {
      if (!connected) {
        console.warn('Unable to connect to Supabase. Some features may not work.');
        
        toast({
          title: 'Connection Warning',
          description: 'Unable to connect to backend services. Some features may not work properly.',
          variant: 'destructive', // Changed from 'warning' to 'destructive'
        });
        
        warnings.push('Supabase connection failed');
      } else {
        console.log('Successfully connected to Supabase services');
      }
    }).catch((err) => {
      console.warn('Error checking Supabase connection:', err);
      warnings.push('Supabase connection check failed');
    });
    
    // Registration point for other critical services initialization
    
    console.log('Application initialized successfully');
    
    // Update initialization state
    initializationState = InitializationState.SUCCESS;
    initializationResult = {
      success: true,
      state: InitializationState.SUCCESS,
      warnings,
      timestamp: Date.now(),
      initializationTimeMs: performance.now() - startTime
    };
    
    return initializationResult;
  } catch (error) {
    console.error('Failed to initialize application:', error);
    
    toast({
      title: 'Initialization Failed',
      description: 'The application failed to initialize. Please refresh or contact support.',
      variant: 'destructive',
    });
    
    // Update initialization state
    initializationState = InitializationState.FAILED;
    initializationResult = {
      success: false,
      state: InitializationState.FAILED,
      error: error instanceof Error ? error : new Error('Unknown initialization error'),
      warnings,
      timestamp: Date.now(),
      initializationTimeMs: performance.now() - startTime
    };
    
    return initializationResult;
  }
}

/**
 * Check if the application has been successfully initialized
 */
export function isInitialized(): boolean {
  return initializationState === InitializationState.SUCCESS;
}

/**
 * Get the current initialization state
 */
export function getInitializationState(): InitializationState {
  return initializationState;
}

/**
 * Get detailed initialization result
 */
export function getInitializationResult(): InitializationResult | null {
  return initializationResult;
}

/**
 * Reset initialization state (primarily for testing)
 */
export function resetInitializationState(): void {
  initializationState = InitializationState.PENDING;
  initializationResult = null;
}

/**
 * Bootstrap function to be called at application startup
 */
export function bootstrapApplication(): void {
  initializeApplication().then(result => {
    if (!result.success) {
      console.error('Application bootstrap failed');
    }
  });
}

export default bootstrapApplication;
