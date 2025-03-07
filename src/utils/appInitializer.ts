
import { toast } from '@/components/ui/use-toast';
import { getPerformanceCategory } from './performanceUtils';

/**
 * Initialize the application with necessary configurations
 */
export const initializeApp = async () => {
  try {
    // Detect device capabilities
    const performanceCategory = getPerformanceCategory();
    
    // Set app quality based on device capabilities
    if (performanceCategory === 'low') {
      console.info('Low performance device detected. Optimizing for better performance.');
      // Adjust global settings for low-end devices
      window.__APP_CONFIG = {
        ...(window.__APP_CONFIG || {}),
        animationQuality: 'minimal',
        particleDensity: 0.3,
        disableParallax: true,
        reducedMotion: true
      };
    }
    
    console.info(`App initialized with performance category: ${performanceCategory}`);
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Failed to initialize app:', error);
    
    // Show a non-blocking toast notification
    toast({
      title: 'Application Initialization',
      description: 'Some features may be limited. Please refresh the page if you experience any issues.',
      variant: 'destructive'
    });
    
    return {
      success: false,
      error
    };
  }
};

// Declare global app configuration type
declare global {
  interface Window {
    __APP_CONFIG?: {
      animationQuality: 'minimal' | 'reduced' | 'standard' | 'enhanced';
      particleDensity: number;
      disableParallax: boolean;
      reducedMotion: boolean;
      [key: string]: any;
    };
  }
}

export default initializeApp;
