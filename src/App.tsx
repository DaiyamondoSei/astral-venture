
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { PerfConfigProvider } from '@/contexts/PerfConfigContext';
import { AdaptivePerformanceProvider } from '@/contexts/AdaptivePerformanceContext';
import { QuantumThemeProvider } from '@/components/visual-foundation';

import LandingPage from '@/pages/LandingPage';
import EntryAnimationPage from '@/pages/EntryAnimationPage';
import DashboardPage from '@/pages/DashboardPage';
import DesignSystemDemo from '@/pages/DesignSystemDemo';
import NotFoundPage from '@/pages/NotFoundPage';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PerfConfigProvider>
        <AdaptivePerformanceProvider>
          <QuantumThemeProvider>
            <Router>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/entry-animation" element={<EntryAnimationPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/design-system" element={<DesignSystemDemo />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Router>
            <Toaster />
          </QuantumThemeProvider>
        </AdaptivePerformanceProvider>
      </PerfConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
