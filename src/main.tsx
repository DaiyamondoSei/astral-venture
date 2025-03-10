
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Don't call initWebVitals here, it's now handled by PerfConfigProvider based on configuration
// This ensures initWebVitals is only called when metrics collection is enabled

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
