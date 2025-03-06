
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { preloadCriticalAssets } from './utils/preloadAssets';

// Preload critical assets
preloadCriticalAssets();

// Use requestIdleCallback to defer non-critical initialization
const startApp = () => {
  const root = document.getElementById("root");
  if (root) {
    createRoot(root).render(<App />);
  }
};

// Use requestIdleCallback for non-critical initialization if available
if ('requestIdleCallback' in window) {
  (window as any).requestIdleCallback(startApp);
} else {
  // Fallback to setTimeout for browsers that don't support requestIdleCallback
  setTimeout(startApp, 50);
}
