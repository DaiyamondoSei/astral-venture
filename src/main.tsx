
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Toaster } from '@/components/ui/toaster';
import { AdaptivePerformanceProvider } from '@/contexts/AdaptivePerformanceContext';
import { initWebVitals } from '@/utils/webVitalsMonitor';
import { PerfConfigProvider } from '@/contexts/PerfConfigContext';
import LoadingScreen from '@/components/LoadingScreen';
import { markStart, markEnd } from '@/utils/webVitalsMonitor';
import memoryManager from '@/utils/memoryManager';

// Create a performance-optimized bootstrapping sequence
const bootstrap = () => {
  markStart('app-bootstrap');
  
  // First, initialize core performance monitoring and memory management
  initWebVitals();
  memoryManager.init();
  
  // Create root element if missing
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Root element not found, creating one');
    const newRoot = document.createElement('div');
    newRoot.id = 'root';
    document.body.appendChild(newRoot);
  }

  // Create root and render loading screen first
  const root = ReactDOM.createRoot(document.getElementById('root')!);
  
  // State to track if loading is complete
  const [loadingComplete, setLoadingComplete] = useState(false);

  // Wrapper component to handle loading state
  const AppWithLoading = () => {
    // Mark initial rendering
    useEffect(() => {
      // Mark the start time of the application
      if (typeof performance !== 'undefined') {
        performance.mark('app-initial-render');
      }
      
      // Track performance metrics when app becomes interactive
      const trackInteractive = () => {
        if (typeof performance !== 'undefined') {
          performance.mark('app-interactive');
          try {
            performance.measure('app-time-to-interactive', 'app-initial-render', 'app-interactive');
            
            const measure = performance.getEntriesByName('app-time-to-interactive')[0];
            console.log(`App interactive in ${Math.round(measure.duration)}ms`);
          } catch (e) {
            console.error('Error measuring time to interactive:', e);
          }
        }
      };
      
      if (loadingComplete) {
        // App has become interactive after loading screen
        trackInteractive();
      }
      
      return () => {
        // Cleanup any resources if component unmounts
      };
    }, [loadingComplete]);
    
    // Handle loading complete callback
    const handleLoadComplete = () => {
      markStart('app-transition');
      // Set a short delay to ensure smooth transition
      setTimeout(() => {
        setLoadingComplete(true);
        markEnd('app-transition');
      }, 100);
    };
    
    return (
      <React.StrictMode>
        {loadingComplete ? (
          <PerfConfigProvider>
            <AdaptivePerformanceProvider>
              <App />
              <Toaster />
            </AdaptivePerformanceProvider>
          </PerfConfigProvider>
        ) : (
          <LoadingScreen onLoadComplete={handleLoadComplete} />
        )}
      </React.StrictMode>
    );
  };
  
  // Render with loading management
  root.render(<AppWithLoading />);
  
  // Mark when app is fully loaded
  window.addEventListener('load', () => {
    markEnd('app-bootstrap');
    
    // Use requestIdleCallback for non-critical operations after load
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        document.documentElement.classList.add('app-loaded');
        console.log('Application fully loaded and idle');
        
        // Report initial performance metrics
        if (typeof performance !== 'undefined') {
          performance.mark('app-fully-loaded');
          try {
            performance.measure('app-load-time', 'app-initial-render', 'app-fully-loaded');
            
            const measure = performance.getEntriesByName('app-load-time')[0];
            console.log(`App fully loaded in ${Math.round(measure.duration)}ms`);
          } catch (e) {
            console.error('Error measuring full load time:', e);
          }
        }
      });
    } else {
      setTimeout(() => {
        document.documentElement.classList.add('app-loaded');
      }, 1000);
    }
  });
};

// Start the bootstrapping process
bootstrap();
