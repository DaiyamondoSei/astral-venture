
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initWebVitals } from './utils/webVitalsMonitor';
import { Toaster } from '@/components/ui/toaster';
import { initializeConfiguration } from '@/utils/bootstrap/configBootstrap';
import { getSupabase } from '@/lib/supabase/client';

/**
 * Initialize application dependencies
 * This happens before React renders to ensure configuration is validated early
 */
async function initializeDependencies() {
  console.info('Initializing application dependencies...');
  const startTime = performance.now();
  
  try {
    // Initialize configuration first to validate environment variables
    const configResult = await initializeConfiguration();
    
    if (!configResult.isValid) {
      console.warn('⚠️ Configuration validation failed:', configResult.errors);
    } else {
      console.info('✅ Configuration validation successful');
    }
    
    // Pre-initialize Supabase client to start connection process
    getSupabase().catch(error => {
      console.warn('⚠️ Supabase initialization issue:', error);
    });
    
    // Initialize web vitals monitoring
    initWebVitals();
    
    const initTime = performance.now() - startTime;
    console.info(`Initialization completed in ${initTime.toFixed(2)}ms`);
  } catch (error) {
    console.error('❌ Critical initialization error:', error);
  }
}

// Start initialization but don't block rendering
initializeDependencies();

// Render the application
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster />
  </React.StrictMode>,
);
