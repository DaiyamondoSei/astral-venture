
/**
 * Application Bootstrap
 * 
 * Coordinates the initialization of the application, including:
 * - Configuration validation
 * - Environment detection
 * - Feature detection
 * - Dependency initialization
 */

import { validateAppConfig } from '@/utils/config/configValidator';
import { BrowserFeatures } from '@/utils/dependencies/dependencyManager';
import { checkSupabaseConnection } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';

// Runtime environment information
export const environment = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  baseUrl: import.meta.env.BASE_URL,
  buildTime: new Date().toISOString(), // This will be the build time
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0'
};

// Bootstrap state
export const bootstrapState = {
  initialized: false,
  configValid: false,
  databaseConnected: false,
  criticalFeaturesAvailable: false,
  performanceMetricsInitialized: false,
  errors: [] as Array<{
    component: string;
    message: string;
    timestamp: string;
  }>
};

/**
 * Critical browser features required by the application
 */
const CRITICAL_BROWSER_FEATURES = [
  'localStorage',
  'fetch',
  'Promise'
];

/**
 * Optional browser features that enhance the application
 */
const OPTIONAL_BROWSER_FEATURES = [
  'webGL',
  'webWorker',
  'serviceWorker',
  'indexedDB',
  'IntersectionObserver',
  'ResizeObserver'
];

/**
 * Records a bootstrap error
 * 
 * @param component Component that encountered the error
 * @param message Error message
 */
function recordError(component: string, message: string): void {
  bootstrapState.errors.push({
    component,
    message,
    timestamp: new Date().toISOString()
  });
  
  console.error(`Bootstrap error in ${component}:`, message);
}

/**
 * Validates application configuration
 * 
 * @returns Promise that resolves when validation is complete
 */
async function validateConfiguration(): Promise<boolean> {
  try {
    const isValid = validateAppConfig();
    bootstrapState.configValid = isValid;
    
    if (!isValid) {
      recordError('ConfigValidator', 'Application configuration validation failed');
      
      if (!environment.isDevelopment) {
        toast({
          title: 'Configuration Error',
          description: 'The application is not configured correctly. Some features may not work properly.',
          variant: 'destructive',
        });
      }
    }
    
    return isValid;
  } catch (error) {
    recordError('ConfigValidator', `Error validating configuration: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * Checks database connectivity
 * 
 * @returns Promise that resolves when check is complete
 */
async function checkDatabaseConnectivity(): Promise<boolean> {
  try {
    const isConnected = await checkSupabaseConnection();
    bootstrapState.databaseConnected = isConnected;
    
    if (!isConnected) {
      recordError('DatabaseConnector', 'Failed to connect to the database');
      
      if (!environment.isDevelopment) {
        toast({
          title: 'Connection Error',
          description: 'Unable to connect to the database. Some features may not work properly.',
          variant: 'destructive',
        });
      }
    }
    
    return isConnected;
  } catch (error) {
    recordError('DatabaseConnector', `Error checking database connectivity: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * Detects browser features
 * 
 * @returns Whether critical features are available
 */
function detectBrowserFeatures(): boolean {
  try {
    // Check critical features
    const criticalFeatures = BrowserFeatures.checkFeatures(CRITICAL_BROWSER_FEATURES);
    const allCriticalFeaturesAvailable = Object.values(criticalFeatures).every(Boolean);
    
    bootstrapState.criticalFeaturesAvailable = allCriticalFeaturesAvailable;
    
    if (!allCriticalFeaturesAvailable) {
      const missingFeatures = Object.entries(criticalFeatures)
        .filter(([_, supported]) => !supported)
        .map(([feature]) => feature);
      
      recordError('FeatureDetector', `Missing critical browser features: ${missingFeatures.join(', ')}`);
      
      toast({
        title: 'Browser Compatibility Error',
        description: 'Your browser is missing features required by this application. Please use a modern browser.',
        variant: 'destructive',
      });
    }
    
    // Check optional features (no blocking errors)
    const optionalFeatures = BrowserFeatures.checkFeatures(OPTIONAL_BROWSER_FEATURES);
    
    // Log performance capabilities
    const performanceCapabilities = BrowserFeatures.getPerformanceCapabilities();
    console.info('Browser capabilities:', {
      critical: criticalFeatures,
      optional: optionalFeatures,
      performance: performanceCapabilities
    });
    
    return allCriticalFeaturesAvailable;
  } catch (error) {
    recordError('FeatureDetector', `Error detecting browser features: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * Initializes the application
 * 
 * @returns Promise that resolves when initialization is complete
 */
export async function initializeApplication(): Promise<boolean> {
  try {
    console.log(`Initializing application (${environment.mode} mode)...`);
    
    // Check features synchronously first
    const featuresAvailable = detectBrowserFeatures();
    
    if (!featuresAvailable) {
      return false;
    }
    
    // Run validations in parallel
    const [configValid, dbConnected] = await Promise.all([
      validateConfiguration(),
      checkDatabaseConnectivity()
    ]);
    
    // Initialize additional components as needed
    // For example, performance monitoring
    try {
      // This would typically initialize your performance monitoring
      bootstrapState.performanceMetricsInitialized = true;
    } catch (error) {
      recordError('PerformanceMetrics', `Failed to initialize performance metrics: ${error instanceof Error ? error.message : String(error)}`);
      // Non-critical, continue initialization
    }
    
    // Determine if initialization was successful
    const initialized = featuresAvailable && (environment.isDevelopment || (configValid && dbConnected));
    bootstrapState.initialized = initialized;
    
    if (initialized) {
      console.log('Application initialized successfully');
    } else {
      console.error('Application initialization failed. See errors for details:', bootstrapState.errors);
    }
    
    return initialized;
  } catch (error) {
    recordError('Bootstrap', `Unexpected error during initialization: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

/**
 * Gets the bootstrap state
 * 
 * @returns Current bootstrap state
 */
export function getBootstrapState() {
  return { ...bootstrapState };
}
