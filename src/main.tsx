
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initWebVitals } from './utils/webVitalsMonitor';
import { Toaster } from '@/components/ui/toaster';
import { getSupabase } from '@/lib/supabaseClient';
import { initializeConfiguration } from '@/utils/bootstrap/configBootstrap';

// Initialize configuration and Supabase early
const initializeAppDependencies = async () => {
  try {
    // Start configuration validation
    const configResult = await initializeConfiguration();
    
    if (!configResult.isValid) {
      console.warn('Configuration validation has issues:', configResult.errors);
    }
    
    // Initialize Supabase client early
    // This starts the connection process but doesn't wait for it
    getSupabase().catch(error => {
      console.warn('Supabase initialization issue:', error);
    });
  } catch (error) {
    console.error('Error initializing app dependencies:', error);
  }
};

// Initialize dependencies early without blocking rendering
initializeAppDependencies();

// Initialize web vitals monitoring
initWebVitals();

// Render the app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster />
  </React.StrictMode>,
);
