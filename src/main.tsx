
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { initWebVitals } from './utils/webVitalsMonitor';
import { ensurePerformanceMetricsTable } from './lib/supabaseClient';

// Initialize web vitals monitoring
initWebVitals();

// Ensure performance metrics tables exist
ensurePerformanceMetricsTable()
  .catch(err => console.error('Error ensuring performance metrics tables:', err));

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
