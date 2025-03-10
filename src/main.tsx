
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initWebVitals } from '@/utils/webVitalsMonitor';

// Initialize performance monitoring
if (import.meta.env.PROD) {
  // Only enable in production to avoid development overhead
  initWebVitals();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
