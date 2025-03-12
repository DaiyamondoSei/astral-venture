
/**
 * Supabase Debugger Utility
 * 
 * Tools for debugging Supabase client issues and configuration.
 * Only active in development mode.
 */

import { 
  isUsingMockSupabaseClient, 
  getConfigurationStatus, 
  getValidatedConfig, 
  getSetupInstructions 
} from '@/lib/supabaseClient';

export interface DebugInfo {
  isMockClient: boolean;
  configValid: boolean;
  missingKeys: string[];
  setupInstructions: Record<string, string | undefined>;
  environmentDetected: boolean;
}

/**
 * Get debug information about Supabase configuration
 */
export function getSupabaseDebugInfo(): DebugInfo {
  const isMockClient = isUsingMockSupabaseClient();
  const { isValid, errors } = getConfigurationStatus();
  
  // Extract missing keys from errors
  const missingKeys = Array.isArray(errors) 
    ? errors
        .filter(error => error.includes('Missing'))
        .map(error => {
          const match = error.match(/Missing required configuration: (\w+)/);
          return match ? match[1] : '';
        })
        .filter(Boolean)
    : [];
  
  // Get setup instructions for missing keys
  const setupInstructions: Record<string, string | undefined> = {};
  missingKeys.forEach(key => {
    setupInstructions[key] = getSetupInstructions(key);
  });
  
  return {
    isMockClient,
    configValid: isValid,
    missingKeys,
    setupInstructions,
    environmentDetected: typeof import.meta.env !== 'undefined'
  };
}

/**
 * Log Supabase debug information to console
 * Only logs in development mode
 */
export function logSupabaseDebugInfo(): void {
  if (import.meta.env.DEV) {
    const debugInfo = getSupabaseDebugInfo();
    
    console.group('Supabase Configuration Debug Info');
    console.log('Using Mock Client:', debugInfo.isMockClient);
    console.log('Configuration Valid:', debugInfo.configValid);
    console.log('Environment Detected:', debugInfo.environmentDetected);
    
    if (debugInfo.missingKeys.length > 0) {
      console.group('Missing Configuration Keys');
      debugInfo.missingKeys.forEach(key => {
        console.log(`${key}:`, { 
          instructions: debugInfo.setupInstructions[key] 
        });
      });
      console.groupEnd();
    }
    
    // Log current env values (masked for security)
    console.group('Environment Values');
    const supabaseUrl = getValidatedConfig('VITE_SUPABASE_URL');
    const supabaseKey = getValidatedConfig('VITE_SUPABASE_ANON_KEY');
    
    console.log('VITE_SUPABASE_URL:', supabaseUrl 
      ? `${supabaseUrl.substring(0, 10)}...` 
      : 'Not set');
      
    console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey 
      ? `${supabaseKey.substring(0, 5)}...${supabaseKey.substring(supabaseKey.length - 3)}` 
      : 'Not set');
    
    console.groupEnd();
    console.groupEnd();
  }
}

/**
 * Toggle debug mode on/off
 * This can be called from the browser console to help debug issues
 */
export function toggleSupabaseDebugMode(enabled = true): void {
  if (!import.meta.env.DEV) {
    console.warn('Supabase debug mode only available in development');
    return;
  }
  
  if (enabled) {
    // Store previous configuration
    window.__SUPABASE_DEBUG__ = {
      enabled: true,
      timestamp: Date.now()
    };
    
    logSupabaseDebugInfo();
    console.info('Supabase debug mode enabled. Use `window.supabaseDebugger` to access debug functions.');
    
    // Expose debugger API to window
    window.supabaseDebugger = {
      getInfo: getSupabaseDebugInfo,
      log: logSupabaseDebugInfo,
      disable: () => toggleSupabaseDebugMode(false)
    };
  } else {
    window.__SUPABASE_DEBUG__ = { enabled: false };
    delete window.supabaseDebugger;
    console.info('Supabase debug mode disabled');
  }
}

// Add a debug mode check function
export function isSupabaseDebugModeEnabled(): boolean {
  return import.meta.env.DEV && 
    typeof window !== 'undefined' && 
    window.__SUPABASE_DEBUG__?.enabled === true;
}

// Custom type definition for window object
declare global {
  interface Window {
    __SUPABASE_DEBUG__?: {
      enabled: boolean;
      timestamp?: number;
    };
    supabaseDebugger?: {
      getInfo: () => DebugInfo;
      log: () => void;
      disable: () => void;
    };
  }
}

// Enable debug mode in development by default
if (import.meta.env.DEV) {
  toggleSupabaseDebugMode(true);
}

export default {
  getSupabaseDebugInfo,
  logSupabaseDebugInfo,
  toggleSupabaseDebugMode,
  isSupabaseDebugModeEnabled
};
