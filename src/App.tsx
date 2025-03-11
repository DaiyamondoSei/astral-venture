
import './App.css';
import { useEffect, useState } from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import LandingPage from './pages';
import EntryAnimationPage from './pages/EntryAnimationPage';
import DesignSystemDemo from './pages/DesignSystemDemo';
import { 
  initializeApplication, 
  InitializationState, 
  InitializationResult 
} from './utils/bootstrap/appBootstrap';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [initState, setInitState] = useState<InitializationState>(InitializationState.PENDING);
  const [initResult, setInitResult] = useState<InitializationResult | null>(null);
  const [initError, setInitError] = useState<Error | null>(null);

  // Bootstrap the application at startup
  useEffect(() => {
    const bootstrapApp = async () => {
      try {
        const result = await initializeApplication();
        setInitResult(result);
        setInitState(result.state);
        
        if (!result.success) {
          setInitError(result.error || new Error('Application initialization failed'));
          
          // Show warning toast for each warning
          result.warnings.forEach(warning => {
            toast({
              title: 'Initialization Warning',
              description: warning,
              variant: 'destructive', // Changed from 'warning' to 'destructive'
            });
          });
        }
      } catch (error) {
        console.error('Application bootstrap error:', error);
        setInitError(error instanceof Error ? error : new Error('Unknown initialization error'));
        setInitState(InitializationState.FAILED);
        
        toast({
          title: 'Initialization Error',
          description: 'Failed to start application properly. Some features may not work.',
          variant: 'destructive',
        });
      }
    };
    
    bootstrapApp();
  }, []);

  // Show loading state while initializing
  if (initState === InitializationState.PENDING || initState === InitializationState.IN_PROGRESS) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold">Initializing Application...</h1>
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Show error state if initialization failed
  if (initState === InitializationState.FAILED || initError) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-4 max-w-md p-6 bg-card rounded-lg shadow-lg">
          <h1 className="text-2xl font-semibold text-destructive">Initialization Error</h1>
          <p className="text-muted-foreground">{initError?.message || 'Unknown initialization error'}</p>
          
          {/* Show any warnings */}
          {initResult?.warnings && initResult.warnings.length > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-md border border-yellow-200">
              <h3 className="text-sm font-medium text-yellow-800">Warnings:</h3>
              <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                {initResult.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
          
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
