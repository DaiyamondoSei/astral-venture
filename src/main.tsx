
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Toaster } from '@/components/ui/toaster';
import { AdaptivePerformanceProvider } from '@/contexts/AdaptivePerformanceContext';
import { initWebVitals } from '@/utils/webVitalsMonitor';
import { initAdaptiveRendering } from '@/utils/adaptiveRendering';
import { initMemoryManagement } from '@/utils/memoryManager';
import LoadingScreen from '@/components/LoadingScreen';
import { PerfConfigProvider } from '@/contexts/PerfConfigContext';
import { performanceMonitor } from '@/utils/performance/performanceMonitor';

// Create a performance-optimized bootstrapping sequence
const bootstrap = () => {
  // First, initialize core performance monitoring and adaptive systems
  initWebVitals();
  initAdaptiveRendering();
  
  if (process.env.NODE_ENV === 'development') {
    // Start performance monitoring in development
    performanceMonitor.startMonitoring();
  }
  
  // Initialize memory management after initial render
  setTimeout(initMemoryManagement, 1000);

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
      
      // Set a timeout to prevent the loading screen from flashing if loading is very fast
      const timer = setTimeout(() => {
        setLoadingComplete(true);
        
        // Measure time to interactivity
        if (typeof performance !== 'undefined') {
          performance.mark('app-interactive');
          performance.measure('app-time-to-interactive', 'app-initial-render', 'app-interactive');
          
          const measure = performance.getEntriesByName('app-time-to-interactive')[0];
          console.log(`App interactive in ${Math.round(measure.duration)}ms`);
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    }, []);
    
    return loadingComplete ? (
      <React.StrictMode>
        <PerfConfigProvider>
          <AdaptivePerformanceProvider>
            <App />
            <Toaster />
          </AdaptivePerformanceProvider>
        </PerfConfigProvider>
      </React.StrictMode>
    ) : (
      <LoadingScreen onLoadComplete={() => setLoadingComplete(true)} />
    );
  };
  
  // Render with loading management
  root.render(<AppWithLoading />);
  
  // Mark when app is fully loaded
  window.addEventListener('load', () => {
    // Use requestIdleCallback for non-critical operations after load
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        document.documentElement.classList.add('app-loaded');
        console.log('Application fully loaded and idle');
        
        // Report initial performance metrics
        if (typeof performance !== 'undefined') {
          performance.mark('app-fully-loaded');
          performance.measure('app-load-time', 'app-initial-render', 'app-fully-loaded');
          
          const measure = performance.getEntriesByName('app-load-time')[0];
          console.log(`App fully loaded in ${Math.round(measure.duration)}ms`);
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
