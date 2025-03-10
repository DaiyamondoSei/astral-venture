
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initWebVitals } from './utils/webVitalsMonitor';

// Initialize web vitals with default configuration
// This will be controlled by PerfConfigProvider based on the settings
initWebVitals({
  reportAllChanges: true,
  reportToAnalytics: true,
  debug: false
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
