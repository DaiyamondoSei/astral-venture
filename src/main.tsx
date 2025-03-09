
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

// Create a performance-optimized bootstrapping sequence
const bootstrap = () => {
  // First, initialize core performance monitoring and adaptive systems
  initWebVitals();
  initAdaptiveRendering();
  
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
    return loadingComplete ? (
      <React.StrictMode>
        <AdaptivePerformanceProvider>
          <App />
          <Toaster />
        </AdaptivePerformanceProvider>
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
