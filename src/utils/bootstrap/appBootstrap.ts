
/**
 * Application Bootstrap
 * 
 * Handles application startup including configuration validation
 * and critical service initialization.
 */

import { toast } from '@/components/ui/use-toast';
import { initializeConfiguration, getConfigurationStatus } from './configBootstrap';
import { getSupabase, isUsingMockClient, testConnection } from '@/lib/supabase/client';
import { performanceMonitor } from '@/utils/performance/performanceMonitor';

/**
 * Application initialization states
 */
export enum InitializationState {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  SUCCESS = 'success',
  FAILED = 'failed',
  DEGRADED = 'degraded'
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
  configStatus?: {
    isValid: boolean;
    isComplete: boolean;
  };
}

// Store the initialization state
let initializationState: InitializationState = InitializationState.PENDING;
let initializationResult: InitializationResult | null = null;
let initializationPromise: Promise<InitializationResult> | null = null;

/**
 * Initialize application
 * Validates configuration and initializes critical services
 * 
 * @param forceReinitialize Force reinitialization even if already initialized
 * @returns Promise resolving to initialization result
 */
export async function initializeApplication(forceReinitialize = false): Promise<InitializationResult> {
  // If initialization is in progress, return the promise
  if (initializationPromise && !forceReinitialize) {
    return initializationPromise;
  }
  
  // If already initialized and not forcing reinitialization, return the cached result
  if ((initializationState === InitializationState.SUCCESS || 
       initializationState === InitializationState.DEGRADED ||
       initializationState === InitializationState.FAILED) && 
      !forceReinitialize) {
    return initializationResult!;
  }
  
  // Create the initialization promise
  initializationPromise = initializeApplicationInternal();
  return initializationPromise;
}

/**
 * Internal initialization function
 */
async function initializeApplicationInternal(): Promise<InitializationResult> {
  console.log('Initializing application...');
  initializationState = InitializationState.IN_PROGRESS;
  
  const startTime = performance.now();
  const warnings: string[] = [];
  
  try {
    // Step 1: Initialize and validate configuration
    // First run configuration validation with a grace period
    const configResult = await initializeConfiguration(false);
    const configStatus = getConfigurationStatus();
    
    if (!configResult.isValid) {
      console.warn('Application configuration has issues:', configResult.errors);
      warnings.push('Configuration validation has warnings');
      
      if (Array.isArray(configResult.errors)) {
        configResult.errors.forEach(err => warnings.push(err));
      }
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
    
    // Step 3: Initialize Supabase client
    let supabaseClient;
    try {
      supabaseClient = await getSupabase();
      console.log('Supabase client initialized');
    } catch (err) {
      console.warn('Error initializing Supabase client:', err);
      warnings.push('Supabase client initialization error');
    }
    
    // Step 4: Validate Supabase connection
    let supabaseConnected = false;
    
    try {
      supabaseConnected = await testConnection();
      if (!supabaseConnected) {
        console.warn('Unable to connect to Supabase. Some features may not work.');
        warnings.push('Supabase connection failed');
        
        if (isUsingMockClient()) {
          warnings.push('Using mock Supabase client, database operations will not work');
        }
      } else {
        console.log('Successfully connected to Supabase services');
      }
    } catch (err) {
      console.warn('Error checking Supabase connection:', err);
      warnings.push('Supabase connection check failed');
    }
    
    // Registration point for other critical services initialization
    
    // Determine overall application state
    let finalState = InitializationState.SUCCESS;
    
    if (!configResult.isValid || !supabaseConnected) {
      finalState = InitializationState.DEGRADED;
      
      if (warnings.length > 0) {
        toast({
          title: 'Application Started with Warnings',
          description: 'Some features may not work properly. Check console for details.',
          variant: 'destructive',
        });
      }
    }
    
    console.log(`Application initialized in ${(performance.now() - startTime).toFixed(2)}ms with state: ${finalState}`);
    
    // Update initialization state
    initializationState = finalState;
    initializationResult = {
      success: finalState === InitializationState.SUCCESS,
      state: finalState,
      warnings,
      timestamp: Date.now(),
      initializationTimeMs: performance.now() - startTime,
      configStatus: {
        isValid: configStatus.isValid,
        isComplete: configStatus.isComplete
      }
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
  return initializationState === InitializationState.SUCCESS || 
         initializationState === InitializationState.DEGRADED;
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
  initializationPromise = null;
}
