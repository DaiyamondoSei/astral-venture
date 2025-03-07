
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { Toaster } from '@/components/ui/toaster';
import { AdaptivePerformanceProvider } from '@/contexts/AdaptivePerformanceContext';
import { initWebVitals } from '@/utils/webVitalsMonitor';
import { initAdaptiveRendering } from '@/utils/adaptiveRendering';
import { initMemoryManagement } from '@/utils/memoryManager';

// Create a performance-optimized bootstrapping sequence
const bootstrap = () => {
  // First, initialize core performance monitoring and adaptive systems
  initWebVitals();
  initAdaptiveRendering();
  
  // Initialize memory management after initial render
  setTimeout(initMemoryManagement, 1000);

  // Render the app
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <BrowserRouter>
        <AdaptivePerformanceProvider>
          <App />
          <Toaster />
        </AdaptivePerformanceProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
  
  // Mark when app is fully loaded
  window.addEventListener('load', () => {
    // Use requestIdleCallback for non-critical operations after load
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        document.documentElement.classList.add('app-loaded');
        console.log('Application fully loaded and idle');
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
