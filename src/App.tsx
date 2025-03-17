
import React, { useState, useEffect } from 'react';
import './App.css';
import { toast } from '@/components/ui/use-toast';
import ErrorBoundary from '@/shared/components/error/ErrorBoundary';
import { PerformanceProvider } from '@/shared/contexts/PerformanceContext';
import { supabase, isSupabaseConfigValid } from './lib/supabaseClientSingleton';
import { assetRegistry, initializeGlobalAssets } from './utils/assetManager';
import AppRoutes from './routes';
import { AuthProvider } from './shared/contexts/AuthContext';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initError, setInitError] = useState<Error | null>(null);
  const [assetsReady, setAssetsReady] = useState(false);

  // Initialize assets
  useEffect(() => {
    const prepareAssets = async () => {
      try {
        // Make sure global assets are initialized
        initializeGlobalAssets();
        
        // Wait a bit for assets to load
        setTimeout(() => {
          const stats = assetRegistry.getLoadingStats();
          console.log('Asset loading stats:', stats);
          
          // Even if some assets failed, we'll continue
          setAssetsReady(true);
        }, 1000);
      } catch (error) {
        console.warn('Asset initialization warning:', error);
        // Continue anyway
        setAssetsReady(true);
      }
    };
    
    prepareAssets();
  }, []);

  // Check Supabase connection
  useEffect(() => {
    // Simple initialization check
    const checkConnection = async () => {
      try {
        // Check if configuration is valid before attempting connection
        if (!isSupabaseConfigValid()) {
          console.warn('Supabase configuration is incomplete or invalid');
          toast({
            title: 'Configuration Warning',
            description: 'Please set up your Supabase credentials in the environment variables.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }
        
        // Try a simple query to check connection
        const { error } = await supabase.from('user_profiles').select('id').limit(1);
        
        if (error) {
          console.warn('Supabase connection check:', error.message);
          toast({
            title: 'Connection Warning',
            description: 'Some features may not work properly due to database connection issues.',
            variant: 'destructive',
          });
        }
      } catch (err) {
        console.error('Application initialization error:', err);
        setInitError(err instanceof Error ? err : new Error('Unknown initialization error'));
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only check connection once assets are ready
    if (assetsReady) {
      checkConnection();
    }
  }, [assetsReady]);

  // Show loading state
  if (isLoading || !assetsReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold">Loading Application...</h1>
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          {!assetsReady && <p className="text-sm text-muted-foreground">Preparing assets...</p>}
        </div>
      </div>
    );
  }

  // Show error state if initialization failed
  if (initError) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-4 max-w-md p-6 bg-card rounded-lg shadow-lg">
          <h1 className="text-2xl font-semibold text-destructive">Initialization Error</h1>
          <p className="text-muted-foreground">{initError.message || 'Unknown initialization error'}</p>
          <button 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            onClick={() => window.location.reload()}
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <PerformanceProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </PerformanceProvider>
    </ErrorBoundary>
  );
}

export default App;
