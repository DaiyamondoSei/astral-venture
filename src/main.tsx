
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { Toaster } from '@/components/ui/toaster';
import { AdaptivePerformanceProvider } from '@/contexts/AdaptivePerformanceContext';
import { initWebVitals } from '@/utils/webVitalsMonitor';
import { initAdaptiveRendering } from '@/utils/adaptiveRendering';

// Initialize performance monitoring and adaptive rendering
initWebVitals();
initAdaptiveRendering();

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
