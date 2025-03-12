
import './App.css';
import { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import LandingPage from './pages';
import EntryAnimationPage from './pages/EntryAnimationPage';
import DesignSystemDemo from './pages/DesignSystemDemo';
import ErrorBoundary from './components/ErrorBoundary';
import { supabase } from './lib/supabaseClient';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    // Simple initialization check
    const checkConnection = async () => {
      try {
        // Try a simple query to check connection
        const { error } = await supabase.from('user_profiles').select('id').limit(1);
        
        if (error) {
          console.warn('Supabase connection issue:', error.message);
          toast({
            title: 'Connection Warning',
            description: 'Some features may not work properly due to connection issues.',
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
    
    checkConnection();
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold">Loading Application...</h1>
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/entry" element={<EntryAnimationPage />} />
          <Route path="/design" element={<DesignSystemDemo />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
