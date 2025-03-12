
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Toaster } from '@/components/ui/toaster';

// Simple console logging for environment variables in development
if (import.meta.env.DEV) {
  console.info('Environment variables check:');
  console.info('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? 'Set ✓' : 'Missing ❌');
  console.info('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set ✓' : 'Missing ❌');
}

// Render the application
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster />
  </React.StrictMode>,
);
